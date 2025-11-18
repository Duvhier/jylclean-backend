const { getDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

class User {
  static collection() {
    return getDatabase().collection('users');
  }

  static async create(userData) {
    const { name, email, password, role = 'User' } = userData;
    
    // Verificar si el usuario existe
    const existingUser = await this.collection().findOne({ email });
    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = {
      name,
      email,
      password: hashedPassword,
      role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection().insertOne(user);
    return { _id: result.insertedId, ...user };
  }

  static async findByEmail(email) {
    return await this.collection().findOne({ email });
  }

  static async findById(id) {
    return await this.collection().findOne({ _id: new ObjectId(id) });
  }

  static async updatePassword(userId, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await this.collection().updateOne(
      { _id: new ObjectId(userId) },
      { 
        $set: { 
          password: hashedPassword,
          updatedAt: new Date()
        } 
      }
    );
  }
}

module.exports = User;