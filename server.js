// express
const express = require('express');
const app = express();

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

// middleware
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// mongoDB
const { MongoClient, ObjectId } = require('mongodb');

let db;
const url = 'mongodb+srv://choosg:cv452160@cluster0.mjasiit.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
new MongoClient(url).connect()
    .then((client) => {
    console.log('DB연결 성공');
    db = client.db('nodejs');
    app.listen(8080, function(){
        console.log('listening on 8080');
     });
    }).catch((err) => {
        console.log(err);
    });

// ====================================================
// Send HTML
// ====================================================
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/index.html');
});

app.get('/list', async (req, res) => {
    let list = await db.collection('sgchoo').find().toArray();
    // console.log(list);
    res.render('list.ejs', {post: list});
});

app.get('/time', (req, res) => {
    let timeParam = new Date();
    // console.log(timeParam);
    res.render('time.ejs', {time: timeParam});
});  

// ====================================================
// write board
// ====================================================

app.get('/write', (req, res) => {
    res.render('write.ejs');
});

app.post('/add', async (req, res) => {
    const title = req.body.title;
    const content = req.body.content;
    // console.log(req.body);

    try
    {
        if(title == '' || content == '')
        {
            res.send("<script>alert('내용을 입력해 주세요.');location.href='/write';</script>");
            // res.redirect('/write');   
        }
        else
        {
            await db.collection('sgchoo').insertOne({title: title, content: content});
            res.redirect('/list');
        }
    }
    catch(e)
    {
        console.log(e);
        res.status(500).send('서버 에러');
    }
});

// ==================================================
// Board Detail Information
// ==================================================

app.get('/detail/:id', async (req, res) => {
    try
    {
        // URL의 뒷부분(/detail/:id의 id)을 가지고있는 document를 가져온다
        const result = await db.collection('sgchoo').findOne({ _id: new ObjectId(req.params.id) })
        // render시에 데이터를 보내준다.
        if(result == null)
            res.status(404).send('invalid url')
        else
            res.render('detail.ejs', { title: result.title, content: result.content, id: req.params.id });
    }
    catch(e)
    {
        console.log(e);
        res.status(404).send('invalid url')
    }
});

// ==================================================
// Board Rewrite
// ==================================================

app.get('/rewrite/:id', async (req, res) => {
    try
    {
        const result = await db.collection('sgchoo').findOne({ _id: new ObjectId(req.params.id) });
        if(result == null)
            res.status(404).send('invalid url');
        else
            res.render('rewrite.ejs', { title: result.title, content: result.content, id: req.params.id });
    }
    catch(e)
    {
        console.log(e);
        res.status(404).send('invalid url');
    }
});

app.put('/rewrite/:id', async (req, res) => {
    // await db.collection('sgchoo').updateOne({ _id: 1 }, { $inc: { like: 1 } });

    try
    {
        if(req.body.title == '' || req.body.content == '')
            res.send("<script>alert('수정 할 내용을 입력해 주세요.');location.href='/rewrite/:id';</script>");
        else
        {
            var findDoc = { _id: new ObjectId(req.params.id) }
            var updateSrc = { $set: { title: req.body.title, content: req.body.content } };

            await db.collection('sgchoo').updateOne(findDoc, updateSrc);
            res.redirect('/list');
        }
    }
    catch(e)
    {
        console.log(e);
        res.status(404).send('invalid url')
    }
});

// ==================================================
// Board Delete
// ==================================================

app.delete('/abc', async(req, res) => {
    console.log(req.body)
    var findDocById = { _id: new ObjectId(req.body._id)};

    const result = await db.collection('sgchoo').deleteOne(findDocById);

    if(result.deletedCount === 1)
    {
        res.send('Delete Document Success');
    }
    else
    {
        res.status(500).send('Delete Document Failed');
    }
});