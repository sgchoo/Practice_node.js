const router = require('express').Router();

const { bodyParser } = require('../services/bodyParser');
const deleteController = require('../controllers/deleteController');
const methodOverride = require('method-override');

router.use(bodyParser.urlencoded( { extended: true } ));
router.use(methodOverride('_method'));

router.delete('/delete', deleteController.deleteDocument);

module.exports = router;