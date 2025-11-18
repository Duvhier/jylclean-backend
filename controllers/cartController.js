const Cart = require('../models/Cart');
const { successResponse, errorResponse } = require('../utils/helpers');

// Obtener carrito del usuario
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.getOrCreateCart(req.user._id);
    res.json(successResponse(cart, 'Carrito obtenido exitosamente'));
  } catch (error) {
    res.status(500).json(errorResponse('Error obteniendo carrito'));
  }
};

// Agregar producto al carrito
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) {
      return res.status(400).json(errorResponse('productId es requerido'));
    }

    const cart = await Cart.addItem(req.user._id, productId, quantity);
    res.json(successResponse(cart, 'Producto agregado al carrito'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message));
  }
};

// Actualizar cantidad de producto en el carrito
exports.updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json(errorResponse('quantity es requerido'));
    }

    const cart = await Cart.updateItemQuantity(req.user._id, productId, quantity);
    res.json(successResponse(cart, 'Carrito actualizado exitosamente'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message));
  }
};

// Remover producto del carrito
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.removeItem(req.user._id, productId);
    res.json(successResponse(cart, 'Producto removido del carrito'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message));
  }
};

// Vaciar carrito
exports.clearCart = async (req, res) => {
  try {
    await Cart.clearCart(req.user._id);
    res.json(successResponse(null, 'Carrito vaciado exitosamente'));
  } catch (error) {
    res.status(500).json(errorResponse('Error vaciando carrito'));
  }
};