// Router Init
const router = require('express').Router();

const bodyParser = require('body-parser');
const searchController = require('../controllers/searchController');
const methodOverride = require('method-override');

router.use(bodyParser.urlencoded({extended: true}));
router.use(methodOverride('_method'));

router.get('/search', searchController.showSearchResult);

module.exports = router;