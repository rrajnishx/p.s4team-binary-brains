const express = require('express');
const router = express.Router();
const farmController = require('../controllers/farmController');

router.post('/analyze', farmController.analyzeFarm);

module.exports = router;
