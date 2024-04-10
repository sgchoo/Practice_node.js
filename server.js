// express
const express = require('express');
const app = express();

// dotenv
require('dotenv').config();

// link s3 cloud
const { S3Client } = require('@aws-sdk/client-s3')
const multer = require('multer')
const multerS3 = require('multer-s3')
const s3 = new S3Client({
  region : 'ap-northeast-2',
  credentials : {
      accessKeyId : process.env.S3_KEY,
      secretAccessKey : process.env.S3_SECRET
  }
})

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'choosgbucket',
    key: function (req, file, cb) {
      cb(null, Date.now().toString()) //업로드시 파일명 변경가능
    }
  })
})

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

// MongoDB

let { connectDB, ObjectId } = require('./database.js');

let db;
connectDB.then((client) => {
    console.log('DB연결 성공');
    db = client.db('nodejs');
    app.listen(process.env.PORT, function(){
        console.log('listening on 8080');
     });
    }).catch((err) => {
        console.log(err);
    });

// router
app.use('/shop', require('./routes/shop.js'));
app.use('/', require('./routes/login.js'));
app.use('/', require('./routes/register.js'));
app.use('/', require('./routes/rewrite.js'));

// ====================================================
// Send HTML
// ====================================================
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/index.html');
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

app.post('/write/add', async (req, res) => {
    // 이미지 예외 처리할때 middleware로 처리하지 말고 여기에 직접하는게 좋음
    upload.array('img1')(req, res, async (err) => {
        if(err) return res.send('이미지 업로드 실패')

        const title = req.body.title;
        const content = req.body.content;

        let imgArray = []
        for(let i = 0; i < req.files.length; i++)
            imgArray.push(req.files[i].location);

        try
        {
            if(title == '' || content == '')
                res.send("<script>alert('내용을 입력해 주세요.');location.href='/write';</script>");
            else
            {
                await db.collection('sgchoo').insertOne({ title: title, content: content, img: imgArray });
                res.redirect('/list/next');
            }
        }
        catch(e)
        {
            console.log(e);
            res.status(500).send('서버 에러');
        }
    })
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
        {
            res.render('detail.ejs', { title: result.title, content: result.content, id: req.params.id, image: result.img});
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

// ==================================================
// Pagination
// ==================================================

function print_time(req, res, next)
{
    console.log(new Date());

    next();
}

app.use('/list', print_time);

app.get('/list/:page', async (req, res) => {
    let list = await db.collection('sgchoo').find().skip((req.params.page-1) * 5).limit(5).toArray();
    res.render('list.ejs', {post: list});
});

app.get('/list/next/:id', async (req, res) => {
    // console.log(req.params.id)
    let list = await db.collection('sgchoo').find({ _id: { $gt: new ObjectId(req.params.id) } }).limit(5).toArray();
    res.render('list.ejs', {post: list});
});

// app.get('/mypage', async (req, res) => {
//     if(!req.user)
//         res.render('login.ejs');
//     else
//         res.render('mypage.ejs', {userId: req.user._id});
// });