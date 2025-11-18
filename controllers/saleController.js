const Sale = require('../models/Sale');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { getDatabase } = require('../config/database');
const { sendSaleConfirmationEmail } = require('../utils/email');
const { successResponse, errorResponse } = require('../utils/helpers');
const { ObjectId } = require('mongodb');

// Obtener todas las ventas (Solo Admin y SuperUser)
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.findAll();
    res.json(successResponse(sales, 'Ventas obtenidas exitosamente'));
  } catch (error) {
    res.status(500).json(errorResponse('Error obteniendo ventas'));
  }
};

// Obtener mis ventas (Usuario normal)
exports.getMySales = async (req, res) => {
  try {
    const sales = await Sale.findByUserId(req.user._id);
    res.json(successResponse(sales, 'Mis ventas obtenidas exitosamente'));
  } catch (error) {
    res.status(500).json(errorResponse('Error obteniendo ventas'));
  }
};

// Obtener una venta específica
exports.getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    
    if (!sale) {
      return res.status(404).json(errorResponse('Venta no encontrada'));
    }

    // Verificar permisos: Solo el usuario dueño, Admin o SuperUser pueden ver
    if (sale.userId.toString() !== req.user._id.toString() && 
        !['Admin', 'SuperUser'].includes(req.user.role)) {
      return res.status(403).json(errorResponse('No tienes permisos para ver esta venta'));
    }

    res.json(successResponse(sale, 'Venta obtenida exitosamente'));
  } catch (error) {
    res.status(500).json(errorResponse('Error obteniendo venta'));
  }
};

// Crear nueva venta
exports.createSale = async (req, res) => {
  const session = getDatabase().client.startSession();
  
  try {
    await session.startTransaction();

    // Obtener carrito del usuario
    const cart = await Cart.getOrCreateCart(req.user._id);
    
    if (!cart.items || cart.items.length === 0) {
      return res.status(400).json(errorResponse('El carrito está vacío'));
    }

    // Verificar stock y preparar items de venta
    const saleItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        throw new Error(`Producto ${item.name} no encontrado`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${item.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`);
      }

      saleItems.push({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      });

      totalAmount += item.price * item.quantity;
    }

    // Crear la venta
    const saleData = {
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      items: saleItems,
      totalAmount,
      status: 'completed'
    };

    const sale = await Sale.create(saleData);

    // Actualizar stock de productos
    for (const item of sale.items) {
      await Product.updateStock(item.productId, item.quantity);
    }

    // Vaciar carrito
    await Cart.clearCart(req.user._id);

    await session.commitTransaction();

    // Enviar email de confirmación (opcional, no bloqueante)
    try {
      await sendSaleConfirmationEmail(req.user.email, sale);
    } catch (emailError) {
      console.error('Error enviando email de confirmación:', emailError);
      // No fallar la venta por error de email
    }

    res.status(201).json(successResponse(sale, 'Venta creada exitosamente'));

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json(errorResponse(error.message));
  } finally {
    await session.endSession();
  }
};

// Actualizar estado de venta (Solo Admin y SuperUser)
exports.updateSaleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json(errorResponse('El estado es requerido'));
    }

    const sale = await Sale.updateStatus(id, status);
    
    if (!sale) {
      return res.status(404).json(errorResponse('Venta no encontrada'));
    }

    res.json(successResponse(sale, 'Estado de venta actualizado exitosamente'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message));
  }
};