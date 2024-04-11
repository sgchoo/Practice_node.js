const router = require('express').Router();

const mongo = require('../services/database.js');

let db;
mongo.connectDB
    .then((client) => {
        db = client.db('nodejs');
    })
    .catch((err) => {
        console.log(err);
    });

router.get('/shirts', (req, res) => {
    db.collection('sgchoo').find().toArray();
    res.send('셔츠파는 페이지임');
});

router.get('/pants', (req, res) => {
    res.send('바지파는 페이지임');
});

module.exports = router;