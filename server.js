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

// middleware
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// MongoDB
const { MongoClient, ObjectId } = require('mongodb');

let db;
const url = process.env.DB_URL;
new MongoClient(url).connect()
    .then((client) => {
    console.log('DB연결 성공');
    db = client.db('nodejs');
    app.listen(process.env.PORT, function(){
        console.log('listening on 8080');
     });
    }).catch((err) => {
        console.log(err);
    });

// login(passport and session)
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo')

app.use(passport.initialize())
app.use(session({
    secret: '암호화에 쓸 비번',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60 * 60 * 1000},
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
        dbName: 'nodejs'
    })
}));
app.use(passport.session());

// bcrypt
const bcrypt = require('bcrypt')

// ====================================================
// Send HTML
// ====================================================
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/src/index.html');
});

// app.get('/list', async (req, res) => {
//     let list = await db.collection('sgchoo').find().toArray();
//     // console.log(list);
//     res.render('list.ejs', {post: list});
// });

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


// ==================================================
// login(session)
// ==================================================

function checkBlank(req, res, next)
{

    if(req.body.username == '' || req.body.password == '')
    {
        let redirectUrl = req.url;
        let script = "<script>alert('아이디 또는 비밀번호를 입력해주세요.');location.href='" + redirectUrl + "';</script>";
        return res.send(script);
    }

    next();
}

// 제출한 아이디/비밀번호 검사하는 코드 작성하는 곳
passport.use(new LocalStrategy(async (name, pass, cb) => {
    let result = await db.collection('user').findOne( { username: name } );
    if(!result)
        return cb(null, false, { message: '일치하는 아이디 없음' });
    
    if(await bcrypt.compare(pass, result.password))
        return cb(null, result);
    else
        return cb(null, false, { message: '비밀번호 불일치' });
}));

// 쿠키 발행
passport.serializeUser((user, done) => {
    process.nextTick(() => {
        done(null, { id: user._id, username: user.name });
    });
})


// 요청시 오는 쿠키 분석
passport.deserializeUser(async (user, done) => {
    let result = await db.collection('user').findOne({ _id: new ObjectId(user.id) });
    delete result.password;
    process.nextTick(() => {
        done(null, result);
    });
})

app.get('/login', async (req, res) => {
    res.render('login.ejs');
});

app.post('/login', checkBlank, async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if(err) return res.status(500).json(err);
        if(!user) return res.status(401).json(info.message);

        req.logIn(user, () => {
            if(err) return next(err);
            res.redirect('/list/next/');
        });
    })(req, res, next);

});

app.get('/mypage', async (req, res) => {
    if(!req.user)
        res.render('login.ejs');
    else
        res.render('mypage.ejs', {userId: req.user._id});
});

// ==================================================
// register
// ==================================================

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.post('/register', checkBlank, async (req, res) => {

    try
    {
        var nameCheck = await db.collection('user').findOne( { username: req.body.username } );
        if(nameCheck != null)
            res.send("<script>alert('중복된 아이디 입니다.');location.href='/register';</script>");
    
        else
        {
            if(req.body.password == req.body.doublecheck)
            {
                let hash = await bcrypt.hash(req.body.password, 10);
            
                await db.collection('user').insertOne({
                    username: req.body.username, password: hash 
                });
                res.redirect('/login');
            }
            else
                res.send("<script>alert('비밀번호가 일치하지 않습니다.');location.href='/register';</script>");
        }
    }
    catch(e)
    {
        console.log(e);
        res.status(500).send('user info create err')
    }

})