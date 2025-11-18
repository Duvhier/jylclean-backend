const { getDatabase } = require('../config/database');

class Product {
  static collection() {
    return getDatabase().collection('products');
  }

  static async create(productData) {
    const product = {
      ...productData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().insertOne(product);
    return { _id: result.insertedId, ...product };
  }

  static async findAll() {
    return await this.collection().find({ isActive: true }).toArray();
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: id, isActive: true });
  }

  static async update(id, updateData) {
    await this.collection().updateOne(
      { _id: id },
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
    await this.collection().updateOne(
      { _id: id },
      { 
        $set: { 
          isActive: false,
          updatedAt: new Date()
        } 
      }
    );
  }

  static async updateStock(productId, quantity) {
    await this.collection().updateOne(
      { _id: productId },
      { $inc: { stock: -quantity } }
    );
  }
}

module.exports = Product;