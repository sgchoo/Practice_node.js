// Router Init
const router = require('express').Router();

// MongoDB Connect
let { connectDB, ObjectId } = require('./../database.js');

connectDB
        .then((client) => {
            db = client.db('nodejs')
        })
        .catch((err) => {
            console.log(err);
        });

// Body-Parser
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({extended: true}));

// method-override(put,patch, delete 요청)
const methodOverride = require('method-override');
router.use(methodOverride('_method'));

// ===================================================================================================
// Board Rewrite
// ===================================================================================================

router.get('/rewrite/:id', async (req, res) => {
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

router.put('/rewrite/:id', async (req, res) => {
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
            res.redirect('/list/next');
        }
    }
    catch(e)
    {
        console.log(e);
        res.status(404).send('invalid url')
    }
});

// ========================================================================================
// ========================================================================================
module.exports = router;