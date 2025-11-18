const { getDatabase } = require('../config/database');
const { generateSaleNumber } = require('../utils/helpers');
const { ObjectId } = require('mongodb');

class Sale {
  static collection() {
    return getDatabase().collection('sales');
  }

  static async create(saleData) {
    const sale = {
      ...saleData,
      saleNumber: generateSaleNumber(),
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().insertOne(sale);
    return { _id: result.insertedId, ...sale };
  }

  static async findAll() {
    return await this.collection()
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async findByUserId(userId) {
    return await this.collection()
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async updateStatus(id, status) {
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      throw new Error('Estado no válido');
    }

    await this.collection().updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date()
        } 
      }
    );
    
    return await this.findById(id);
  }

  static async getSalesStats() {
    const stats = await this.collection().aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageSale: { $avg: '$totalAmount' }
        }
      }
    ]).toArray();

    return stats[0] || { totalSales: 0, totalRevenue: 0, averageSale: 0 };
  }
}

module.exports = Sale;