// router init
const router = require('express').Router();

// env
require('dotenv').config();

// middleware
const { checkBlank } = require('./../routes/middleware.js');

// middleware
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));

// connect MongoDB
let { connectDB, ObjectId } = require('./../database.js');

let db;
connectDB
    .then((client) => {
        db = client.db('nodejs');
    })
    .catch((err) => {
        console.log(err);
    });

// login(passport and session)
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo');

router.use(passport.initialize())
router.use(session({
    secret: '암호화에 쓸 비번',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60 * 60 * 1000},
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
        dbName: 'nodejs'
    })
}));
router.use(passport.session());

// bcrypt
const bcrypt = require('bcrypt');

// ===================================================================================================
// Login(session)
// ===================================================================================================

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

router.get('/login', async (req, res) => {
    res.render('login.ejs');
});

router.post('/login', checkBlank, async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if(err) return res.status(500).json(err);
        if(!user) return res.status(401).json(info.message);

        req.logIn(user, () => {
            if(err) return next(err);
            res.redirect('/list/next/');
        });
    })(req, res, next);

});

// ========================================================================================
// ========================================================================================

module.exports = router