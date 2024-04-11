// Router Init
const router = require('express').Router();

const methodOverride = require('method-override');
const { bodyParser } = require('../services/bodyParser');
const rewriteController = require('../controllers/rewriteController');

router.use(methodOverride('_method'));
router.use(bodyParser.urlencoded({extended: true}));

router.get('/rewrite/:id', rewriteController.sendOriginContent);
router.put('/rewrite/:id', rewriteController.fixOriginContent);

module.exports = router;