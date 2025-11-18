const express = require('express');
const {
  getSales,
  getMySales,
  getSale,
  createSale,
  updateSaleStatus
} = require('../controllers/saleController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/my-sales', getMySales);
router.get('/:id', getSale);
router.post('/', createSale);

// Solo Admin y SuperUser pueden ver todas las ventas y cambiar estados
router.get('/', authorize('Admin', 'SuperUser'), getSales);
router.put('/:id/status', authorize('Admin', 'SuperUser'), updateSaleStatus);

module.exports = router;