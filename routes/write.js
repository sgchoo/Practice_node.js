const router = require('express').Router();

const { bodyParser } = require('../services/bodyParser');
const writeController = require('../controllers/writeController');

router.use(bodyParser.urlencoded({extended:true}));

router.get('/write', writeController.pageRender);
router.post('/write/add', writeController.insertBoard);

module.exports = router;