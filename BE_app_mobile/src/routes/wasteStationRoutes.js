const express = require('express');
const router = express.Router();
const wasteStationController = require('../controllers/wasteStationController');

// GET: /api/wastestations (Lấy danh sách)
router.get('/', wasteStationController.getAllStations);

// POST: /api/wastestations (Tạo mới - dùng Postman để thêm dữ liệu)
router.post('/', wasteStationController.createStation);

module.exports = router;