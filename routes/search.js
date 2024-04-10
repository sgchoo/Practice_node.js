// Router Init
const router = require('express').Router();

// MongoDB Connect
const { connectDB, ObjectId } = require('../database.js');

let db;
connectDB
        .then((client) => {
            db = client.db('nodejs');
        })
        .catch((err) => {
            console.log(err);
        });

//body-parser
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));


// Services로 modularization

// ===================================================================================================
// Search Board
// ===================================================================================================

// Controller로 modularization

router.post('/search', async (req, res) => {
    try
    {
        let target = req.query.val
        let result = await db.collection('sgchoo').find( { title: target } ).toArray();
        if(!result)
        {
            res.send("<script>alert('입력하신 게시물이 없습니다.');location.href='/list/next';</script>");
        }
        else
        {
            res.render('~~~.ejs', result);
            
            // res.redirect('detail/:id');
        }
    }
    catch(err){
        console.log(err)
    };
});

// ========================================================================================
// ========================================================================================

module.exports = router;