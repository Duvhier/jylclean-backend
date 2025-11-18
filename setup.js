const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Importar la configuración de la base de datos
const { connectToDatabase } = require('./config/database');

// Configuración MEJORADA de CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://jylcleanco-front.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
    ];
    
    // Permitir requests sin origin
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS bloqueado para origen:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};

// Aplicar CORS antes de otras rutas
app.use(cors(corsOptions));

// Manejar preflight OPTIONS requests globalmente
app.options('*', cors(corsOptions));

// Headers manuales para CORS (backup)
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://jylcleanco-front.vercel.app',
    'http://localhost:3000', 
    'http://localhost:5173'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CONEXIÓN MEJORADA A MONGODB - Con manejo robusto para Vercel
const initializeDatabase = async () => {
  try {
    await Promise.all([
      mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      connectToDatabase()
    ]);
    console.log('✅ MongoDB conectado via Mongoose');
    console.log('✅ MongoDB conectado via MongoClient');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    // No salir del proceso en producción, permitir que el servidor continúe
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Servidor continuará sin conexión a DB');
    } else {
      process.exit(1);
    }
  }
};

// Inicializar la base de datos al iniciar el servidor
initializeDatabase();

// Health check endpoint MEJORADO
app.get('/api/health', async (req, res) => {
  const mongooseStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  try {
    // Verificar también la conexión de MongoClient
    const { getDatabase } = require('./config/database');
    const db = getDatabase();
    const mongoClientStatus = db ? 'connected' : 'disconnected';
    
    res.json({ 
      success: mongooseStatus === 'connected' && mongoClientStatus === 'connected',
      message: mongooseStatus === 'connected' && mongoClientStatus === 'connected' 
        ? 'Backend funcionando correctamente' 
        : 'Backend activo pero con problemas de conexión a DB',
      database: {
        mongoose: mongooseStatus,
        mongoClient: mongoClientStatus
      },
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
  } catch (error) {
    res.json({
      success: false,
      message: 'Error verificando estado de la base de datos',
      database: {
        mongoose: mongooseStatus,
        mongoClient: 'error'
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  }
});

// Ruta de debug para productos (TEMPORAL)
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
      debug: '/api/debug/products'
    }
  });
});

// Middleware para manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Ruta no encontrada' 
  });
});

// Middleware para manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error global:', err.stack);
  
  // Si es error de CORS
  if (err.message === 'No permitido por CORS') {
    return res.status(403).json({
      success: false,
      message: 'Origen no permitido por CORS'
    });
  }
  
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
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
}