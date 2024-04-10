// Router Init
const router = require('express').Router();

// middleware
const { checkBlank } = require('./../routes/middleware.js');

// MongoDB
let { connectDB, ObjectId } = require('./../database.js');

let db;
connectDB
    .then((client) => {
        db = client.db('nodejs')
    })
    .catch((err) => {
        console.log(err)
    });

// Body-Parser
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));

// bcrypt
const bcrypt = require('bcrypt');


// ===================================================================================================
// Regist User
// ===================================================================================================

router.get('/register', (req, res) => {
    res.render('register.ejs');
});

router.post('/register', checkBlank, async (req, res) => {

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
});

module.exports = router;