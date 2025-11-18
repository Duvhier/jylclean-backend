const validator = require('validator');

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Email no válido' });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
    return res.status(400).json({ 
      message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial' 
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

module.exports = { validateRegister, validateProduct };