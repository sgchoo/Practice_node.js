// Router Init
const router = require('express').Router();

// MongoDB Connect
const bodyParser = require('body-parser');
const mongo = require('../services/database.js');

let db;
mongo.connectDB
    .then((client) => {
        db = client.db('nodejs');
    })
    .catch((err) => {
        console.log(err);
    });

//body-parser
router.use(bodyParser.urlencoded({extended: true}));


// Services로 modularization

// ===================================================================================================
// Search Board
// ===================================================================================================

// Controller로 modularization

router.post('/search', (req, res) => {
    try
    {
        let target = req.query.val
        let result = mongo.findDocumentArray(db, 'sgchoo', { title: target });
        if(!result)
        {
            res.send("<script>alert('입력한 제목의 게시물이 없습니다.');location.href='/list/next';</script>");
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

module.exports = router;