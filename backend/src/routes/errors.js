const express = require('express');
const errorController = require('../controllers/errorController');

const router = express.Router();

router.get('/', errorController.getErrors);
router.get('/form-types', errorController.getFormTypes);

module.exports = router;