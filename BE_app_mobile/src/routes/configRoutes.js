const express = require('express');
const router = express.Router();
const { getConfigs } = require('../controllers/configController');

router.get('/', getConfigs);

module.exports = router;