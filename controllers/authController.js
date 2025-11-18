const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getDatabase } = require('../config/database');
const { ObjectId } = require('mongodb');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validar que el rol no sea SuperUser en registro normal
    if (role && ['SuperUser', 'Admin'].includes(role)) {
      return res.status(403).json({
        success: false,
        message: 'No puedes registrarte con este rol'
      });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'User'
    });

    // Crear token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar email y password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingresa email y contraseña'
      });
    }

    // Encontrar usuario
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Tu cuenta está desactivada. Contacta al administrador.'
      });
    }

    // Verificar contraseña
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Crear token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const db = getDatabase();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(req.user._id) },
      { projection: { password: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en getMe:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
    });
  }
};

// Endpoints de recuperación de contraseña (para implementar después)
exports.forgotPassword = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Funcionalidad en desarrollo'
  });
};

exports.resetPassword = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Funcionalidad en desarrollo'
  });
};