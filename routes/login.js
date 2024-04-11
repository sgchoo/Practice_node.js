// Router Init
const router = require('express').Router();

const LoginController = require('../controllers/loginController');
const { session, passport } = require('../services/passport');
const { bodyParser } = require('../services/bodyParser');
const middleware = require('../controllers/middleware');

router.use(session);
router.use(passport.initialize());
router.use(passport.session());
router.use(bodyParser.urlencoded({extended: true}));

router.get('/login', LoginController.renderLoginPage);
router.post('/login', middleware.checkBodyBlank, LoginController.checkValidUser);

module.exports = router