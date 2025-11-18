const User = require('../models/User');
const { getDatabase } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/helpers');
const { ObjectId } = require('mongodb');

// Obtener todos los usuarios (Solo SuperUser)
exports.getUsers = async (req, res) => {
  try {
    const db = getDatabase();
    const users = await db.collection('users')
      .find({})
      .project({ password: 0 }) // Excluir contraseñas
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json(successResponse(users, 'Usuarios obtenidos exitosamente'));
  } catch (error) {
    res.status(500).json(errorResponse('Error obteniendo usuarios'));
  }
};

// Obtener un usuario por ID
exports.getUser = async (req, res) => {
  try {
    const db = getDatabase();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.params.id) },
      { projection: { password: 0 } } // Excluir contraseña
    );

    if (!user) {
      return res.status(404).json(errorResponse('Usuario no encontrado'));
    }

    res.json(successResponse(user, 'Usuario obtenido exitosamente'));
  } catch (error) {
    res.status(500).json(errorResponse('Error obteniendo usuario'));
  }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, isActive } = req.body;

    const db = getDatabase();
    
    // Verificar que el usuario existe
    const existingUser = await db.collection('users').findOne({ 
      _id: new ObjectId(id) 
    });
    
    if (!existingUser) {
      return res.status(404).json(errorResponse('Usuario no encontrado'));
    }

    // Verificar si el email ya está en uso por otro usuario
    if (email && email !== existingUser.email) {
      const emailExists = await db.collection('users').findOne({ 
        email, 
        _id: { $ne: new ObjectId(id) } 
      });
      
      if (emailExists) {
        return res.status(400).json(errorResponse('El email ya está en uso'));
      }
    }

    const updateData = {
      updatedAt: new Date()
    };

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    const updatedUser = await db.collection('users').findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    res.json(successResponse(updatedUser, 'Usuario actualizado exitosamente'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message));
  }
};

// Eliminar usuario (soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Evitar que el SuperUser se elimine a sí mismo
    if (id === req.user._id.toString()) {
      return res.status(400).json(errorResponse('No puedes eliminar tu propio usuario'));
    }

    const db = getDatabase();
    
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(id) 
    });
    
    if (!user) {
      return res.status(404).json(errorResponse('Usuario no encontrado'));
    }

    // Soft delete - marcar como inactivo
    await db.collection('users').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          isActive: false,
          updatedAt: new Date()
        } 
      }
    );

    res.json(successResponse(null, 'Usuario eliminado exitosamente'));
  } catch (error) {
    res.status(400).json(errorResponse(error.message));
  }
};