// Router Init
const router = require('express').Router();

const registerController = require('../controllers/registerController.js');
const middleware = require('../controllers/middleware.js');
const { bodyParser } = require('../services/bodyParser.js');
const methodOverride = require('method-override');

router.use(bodyParser.urlencoded({extended: true}));
router.use(methodOverride('_method'));

router.get('/register', registerController.pageRender);
router.post('/register', middleware.checkBodyBlank, registerController.registUser);


module.exports = router;