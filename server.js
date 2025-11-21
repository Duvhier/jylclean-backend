const express = require('express');
Promise.all([
  mongoose.connect(process.env.MONGODB_URI),
  connectToDatabase()
])
  .then(() => {
    console.log('✅ MongoDB conectado via Mongoose');
    console.log('✅ MongoDB conectado via MongoClient');
  })
  .catch(err => {
    console.error('❌ Error conectando a MongoDB:', err);
    process.exit(1);
  });

// Health check endpoint MEJORADO
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.json({
    success: dbStatus === 'connected',
    message: dbStatus === 'connected'
      ? 'Backend funcionando correctamente'
      : 'Backend activo pero sin conexión a DB',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: {
      allowedOrigins: [
        'https://jylcleanco-front.vercel.app',
        'http://localhost:3000',
        'http://localhost:5173'
      ]
    }
  });
});

// Ruta de debug para productos (TEMPORAL - puedes remover después)
app.get('/api/debug/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const productCount = await Product.collection().countDocuments();
    const products = await Product.findAll();

    res.json({
      success: true,
      database: 'Conectado',
      productCount: productCount,
      products: products,
      message: 'Endpoint de debug funcionando'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en debug endpoint',
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
});

// Importar rutas
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const salesRoutes = require('./routes/sales');
const userRoutes = require('./routes/users');

// Usar rutas
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/users', userRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'JYL Clean Co API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      auth: '/api/auth',
      cart: '/api/cart',
      sales: '/api/sales',
      users: '/api/users',
      debug: '/api/debug/products' // Temporal
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Para Vercel, exportar la app
module.exports = app;

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  });
}