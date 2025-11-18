const express = require('express');
const { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');

const router = express.Router();

// Rutas públicas
router.get('/', getProducts);
router.get('/:id', getProduct);

// Rutas protegidas - Solo Admin y SuperUser
router.post('/', protect, authorize('Admin', 'SuperUser'), validateProduct, createProduct);
router.put('/:id', protect, authorize('Admin', 'SuperUser'), validateProduct, updateProduct);
router.delete('/:id', protect, authorize('Admin', 'SuperUser'), deleteProduct);

module.exports = router;