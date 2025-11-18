const { ObjectId } = require('mongodb');

// Generar número de venta único
const generateSaleNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `V-${timestamp}-${random}`;
};

// Validar formato de ObjectId de MongoDB
const isValidObjectId = (id) => {
  return ObjectId.isValid(id);
};

// Formatear respuesta de error
const errorResponse = (message, statusCode = 400) => {
  return {
    success: false,
    message,
    statusCode
  };
};

// Formatear respuesta exitosa
const successResponse = (data, message = 'Operación exitosa') => {
  return {
    success: true,
    message,
    data
  };
};

module.exports = {
  generateSaleNumber,
  isValidObjectId,
  errorResponse,
  successResponse
};