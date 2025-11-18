// models/Product.js
const { getDatabase, connectToDatabase } = require('../config/database');
const { ObjectId } = require('mongodb');

class Product {
  static async collection() {
    // Asegurar que la base de datos esté conectada antes de usar la colección
    await connectToDatabase();
    return getDatabase().collection('products');
  }

  static async create(productData) {
    const collection = await this.collection();
    const product = {
      ...productData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(product);
    return { _id: result.insertedId, ...product };
  }

  static async findAll() {
    const collection = await this.collection();
    return await collection.find({ isActive: true }).toArray();
  }

  static async findById(id) {
    const collection = await this.collection();
    return await collection.findOne({ 
      _id: new ObjectId(id), 
      isActive: true 
    });
  }

  static async update(id, updateData) {
    const collection = await this.collection();
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date()
        } 
      }
    );
    return await this.findById(id);
  }

  static async delete(id) {
    const collection = await this.collection();
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          isActive: false,
          updatedAt: new Date()
        } 
      }
    );
  }

  static async updateStock(productId, quantity) {
    const collection = await this.collection();
    await collection.updateOne(
      { _id: new ObjectId(productId) },
      { $inc: { stock: -quantity } }
    );
  }
}

module.exports = Product;