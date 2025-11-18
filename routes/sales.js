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

// Todas las rutas requieren autenticación
router.use(protect);

// Rutas accesibles para todos los usuarios autenticados
router.get('/my-sales', getMySales);
router.get('/:id', getSale);
router.post('/', createSale);

// Rutas solo para Admin y SuperUser
router.get('/', authorize('Admin', 'SuperUser'), getSales);
router.put('/:id/status', authorize('Admin', 'SuperUser'), updateSaleStatus);

module.exports = router;