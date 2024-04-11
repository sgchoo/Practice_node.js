require('dotenv').config();

const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcrypt');
const mongo = require('./database')

let db;
mongo.connectDB
    .then((client) => {
        db = client.db('nodejs');
    })
    .catch((err) => {
        console.log(err);
    })

/** 로그인시 넘어오는 id,password 확인 */
passport.use(new LocalStrategy(async (name, pass, cb) => {
    let result = await mongo.findOneDocument(db, 'user', { username: name });
    if(!result)
        return cb(null, false, { message: '일치하는 아이디 없음' });
    
    if(await bcrypt.compare(pass, result.password))
        return cb(null, result);
    else
        return cb(null, false, { message: '비밀번호 불일치' });
}));

/** 쿠키 발행 */
passport.serializeUser((user, done) => {
    process.nextTick(() => {
        done(null, { id: user._id, username: user.name });
    });
})

/** 요청시 오는 쿠키 분석 */
passport.deserializeUser(async (user, done) => {
    let result = await mongo.findOneDocument(db, 'user', { _id: new mongo.ObjectId(user.id) });
    delete result.password;
    process.nextTick(() => {
        done(null, result);
    });
})

passport.authenticate('local', (err, user, info) => {
    if(err) return res.status(500).json(err);
    if(!user) return res.status(401).json(info.message);

    req.logIn(user, () => {
        if(err) return next(err);
        res.redirect('/list/next/');
    });
})

module.exports = {
    passport,

    session: session({
        secret: '암호화에 쓸 비번',
        resave: false,
        saveUninitialized: false,
        cookie: {maxAge: 60 * 60 * 1000},
        store: MongoStore.create({
            mongoUrl: process.env.DB_URL,
            dbName: 'nodejs'
        })
    }),
};