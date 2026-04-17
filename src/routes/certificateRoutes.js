const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');

router.get('/:farmId', certificateController.generateCertificate);

module.exports = router;
