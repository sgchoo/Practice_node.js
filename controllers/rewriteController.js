// dotenv
require('dotenv').config();

const mongo = require('../services/database.js');

let db;
mongo.connectDB
    .then((client) => {
        db = client.db('nodejs');
    })
    .catch((err) => {
        console.log(err);
    });

module.exports = {
    sendOriginContent: async (req, res) => {
        try
        {
            const result = await mongo.findOneDocument(db, 'sgchoo', { _id: new mongo.ObjectId(req.params.id) });
            if(result == null)
                res.status(404).send('invalid url');
            else
            {
                res.render('rewrite.ejs', { title: result.title, content: result.content, id: req.params.id });
            }
        }
        catch(e)
        {
            console.log(e);
            res.status(404).send('invalid url');
        }
    },
    
    fixOriginContent: async (req, res) => {
        try
        {
            if(req.body.title == '' || req.body.content == '')
                res.send("<script>alert('수정 할 내용을 입력해 주세요.');location.href='/rewrite/:id';</script>");
            else
            {
                var findDoc = { _id: new mongo.ObjectId(req.params.id) }
                var updateSrc = { $set: { title: req.body.title, content: req.body.content } };
    
                await mongo.updateOneDocument(db, 'sgchoo', findDoc, updateSrc);
                res.redirect('/list/next');
            }
        }
        catch(e)
        {
            console.log(e);
            res.status(404).send('invalid url')
        }
    },

};
