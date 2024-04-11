const router = require('express').Router();

const detailController = require('../controllers/detailController');

router.get('/detail/:id', detailController.showDetail);

module.exports = router;