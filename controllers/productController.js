const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/helpers');

// Obtener todos los productos
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(successResponse(products, 'Productos obtenidos exitosamente'));
  } catch (error) {
    res.status(500).json(errorResponse('Error obteniendo productos'));
  }
};

// Obtener un producto por ID
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json(errorResponse('Producto no encontrado'));
    }

    res.json(successResponse(product, 'Producto obtenido exitosamente'));
  } catch (error) {
    res.status(500).json(errorResponse('Error obteniendo producto'));
  }
};

// Crear nuevo producto
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(successResponse(product, 'Producto creado exitosamente'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message));
  }
};

// Actualizar producto
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.update(req.params.id, req.body);
    res.json(successResponse(product, 'Producto actualizado exitosamente'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message));
  }
};

// Eliminar producto (soft delete)
exports.deleteProduct = async (req, res) => {
  try {
    await Product.delete(req.params.id);
    res.json(successResponse(null, 'Producto eliminado exitosamente'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message));
  }
};