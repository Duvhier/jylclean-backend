const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

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

// El resto de tu código permanece igual...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
      success: true, 
      message: 'Backend funcionando correctamente',
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
      users: '/api/users'
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