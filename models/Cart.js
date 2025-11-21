const { getDatabase } = require('../config/database');
const { ObjectId } = require('mongodb');

class Cart {
  static collection() {
    return getDatabase().collection('carts');
  }

  static async getOrCreateCart(userId) {
    let cart = await this.collection().findOne({ userId: new ObjectId(userId) });

    if (!cart) {
      cart = {
        userId: new ObjectId(userId),
        items: [],
        total: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await this.collection().insertOne(cart);
      cart._id = result.insertedId;
    }

    return cart;
  }

  static async addItem(userId, productId, quantity = 1) {
    const db = getDatabase();

    // Verificar que el producto existe
    const product = await db.collection('products').findOne({
      _id: new ObjectId(productId),
      isActive: true
    });

    if (!product) {
      throw new Error('Producto no encontrado');
    }

    if (product.stock < quantity) {
      throw new Error('Stock insuficiente');
    }

    const cart = await this.getOrCreateCart(userId);

    // Buscar si el producto ya está en el carrito
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId.toString()
    );

    if (existingItemIndex > -1) {
      // Actualizar cantidad
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Agregar nuevo item
      cart.items.push({
        productId: new ObjectId(productId),
        name: product.name,
        price: product.price,
        quantity,
        image: product.image
      });
    }

    // Recalcular total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = new Date();

    await this.collection().updateOne(
      { userId: new ObjectId(userId) },
      { $set: cart }
    );

    return cart;
  }

  static async updateItemQuantity(userId, productId, quantity) {
    if (quantity < 0) {
      throw new Error('La cantidad no puede ser negativa');
    }

    const cart = await this.getOrCreateCart(userId);
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      throw new Error('Producto no encontrado en el carrito');
    }

    if (quantity === 0) {
      // Eliminar item si la cantidad es 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Verificar stock
      const db = getDatabase();
      const product = await db.collection('products').findOne({
        _id: new ObjectId(productId),
        isActive: true
      });

      // FIX: Check if product exists before accessing product.stock
      if (!product) {
        throw new Error('Producto no encontrado o inactivo');
      }

      if (product.stock < quantity) {
        throw new Error('Stock insuficiente');
      }

      cart.items[itemIndex].quantity = quantity;
    }

    // Recalcular total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = new Date();

    await this.collection().updateOne(
      { userId: new ObjectId(userId) },
      { $set: cart }
    );

    return cart;
  }

  static async removeItem(userId, productId) {
    const cart = await this.getOrCreateCart(userId);

    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId.toString()
    );

    // Recalcular total
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = new Date();

    await this.collection().updateOne(
      { userId: new ObjectId(userId) },
      { $set: cart }
    );

    return cart;
  }

  static async clearCart(userId) {
    await this.collection().updateOne(
      { userId: new ObjectId(userId) },
      {
        $set: {
          items: [],
          total: 0,
          updatedAt: new Date()
        }
      }
    );
  }
}

module.exports = Cart;