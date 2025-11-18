const validator = require('validator');

// Configuración de caracteres especiales permitidos
const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';

const passwordRequirements = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: SPECIAL_CHARS
};

const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < passwordRequirements.minLength) {
    errors.push(`mínimo ${passwordRequirements.minLength} caracteres`);
  }
  
  if (passwordRequirements.requireUppercase && !/(?=.*[A-Z])/.test(password)) {
    errors.push('al menos una letra mayúscula');
  }
  
  if (passwordRequirements.requireLowercase && !/(?=.*[a-z])/.test(password)) {
    errors.push('al menos una letra minúscula');
  }
  
  if (passwordRequirements.requireNumbers && !/(?=.*\d)/.test(password)) {
    errors.push('al menos un número');
  }
  
  if (passwordRequirements.requireSpecialChars) {
    const specialCharsRegex = new RegExp(`(?=.*[${passwordRequirements.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}])`);
    if (!specialCharsRegex.test(password)) {
      errors.push(`al menos un carácter especial (${passwordRequirements.specialChars})`);
    }
  }
  
  return errors;
};

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Email no válido' });
  }

  const passwordErrors = validatePassword(password);
  if (passwordErrors.length > 0) {
    return res.status(400).json({ 
      message: `La contraseña debe contener: ${passwordErrors.join(', ')}` 
    });
  }

  next();
};

const validateProduct = (req, res, next) => {
  const { name, price, stock, category, description } = req.body;
  
  if (!name || !price || !stock || !category) {
    return res.status(400).json({ message: 'Nombre, precio, stock y categoría son requeridos' });
  }

  if (price < 0 || stock < 0) {
    return res.status(400).json({ message: 'Precio y stock no pueden ser negativos' });
  }

  next();
};

module.exports = { 
  validateRegister, 
  validateProduct,
  validatePassword,
  passwordRequirements 
};