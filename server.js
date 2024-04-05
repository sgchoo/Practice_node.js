// express
const express = require('express');
const app = express();

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
// send html
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

app.get('/detail/:id', async (req, res) => {
    console.log(req.params);
    // URL의 뒷부분(/detail/:id의 id)을 가지고있는 document를 가져온다
    const result = await db.collection('sgchoo').findOne({ _id: new ObjectId(req.params.id) })
    console.log(result);
    // render시에 데이터를 보내준다.
    res.render('detail.ejs', { title: result.title, content: result.content });
});

