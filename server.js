// express
const express = require('express');
const app = express();

// dotenv
require('dotenv').config();

// method-override
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// parser
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// main.css 
app.use(express.static(__dirname + '/public'));

// ejs (template engine)
app.set('view engine', 'ejs');

// MongoDB Connect
const mongo = require('./services/database.js');

let db;
mongo.connectDB
    .then((client) => {
        db = client.db('nodejs');
        app.listen(process.env.PORT, true);
    })
    .catch((err) => {
        console.log(err);
    });

// Router
app.use('/shop', require('./routes/shop.js'));
app.use('/', require('./routes/login.js'));
app.use('/', require('./routes/register.js'));
app.use('/', require('./routes/rewrite.js'));
app.use('/', require('./routes/detail.js'));
app.use('/', require('./routes/delete.js'))
app.use('/', require('./routes/write.js'));
app.use('/', require('./routes/search.js'));

// ====================================================
// Send HTML
// ====================================================
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/index.html');
});


app.get('/list/:page', async (req, res) => {
    let list = await db.collection('sgchoo').find().skip((req.params.page-1) * 5).limit(5).toArray();
    res.render('list.ejs', {post: list});
});

app.get('/list/next/:id', async (req, res) => {
    let list = await db.collection('sgchoo').find({ _id: { $gt: new mongo.ObjectId(req.params.id) } }).limit(5).toArray();
    res.render('list.ejs', {post: list});
});