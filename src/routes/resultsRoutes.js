const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/resultsController');

router.get('/:farmId', resultsController.getResults);

module.exports = router;
