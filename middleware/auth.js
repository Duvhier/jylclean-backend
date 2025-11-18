const jwt = require('jsonwebtoken');
const { getDatabase } = require('../config/database');
const { ObjectId } = require('mongodb');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'No autorizado, token no proporcionado' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = getDatabase();
    
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.id),
      isActive: true 
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado o inactivo' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token no válido' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Rol ${req.user.role} no tiene acceso a este recurso` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };