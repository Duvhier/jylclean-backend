// config/database.js
const { MongoClient } = require('mongodb');

let db;
let client;
let isConnecting = false;
let connectionPromise = null;

const connectToDatabase = async () => {
  // Si ya estamos conectados, retornar la conexión
  if (db) {
    return db;
  }
  
  // Si ya estamos en proceso de conexión, retornar la promesa existente
  if (isConnecting) {
    return connectionPromise;
  }

  isConnecting = true;
  
  try {
    connectionPromise = new Promise(async (resolve, reject) => {
      try {
        client = new MongoClient(process.env.MONGODB_URI || 'mongodb+srv://duviertavera01:3SK6o5HM3g46zXSQ@cluster0.0bbblsp.mongodb.net/jl_clean_co', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          maxPoolSize: 10,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        });
        
        await client.connect();
        db = client.db();
        console.log('✅ Conectado a MongoDB');
        resolve(db);
      } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        isConnecting = false;
        connectionPromise = null;
        reject(error);
      }
    });

    return connectionPromise;
  } catch (error) {
    isConnecting = false;
    connectionPromise = null;
    throw error;
  }
};

const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase first.');
  }
  return db;
};

const closeDatabase = async () => {
  if (client) {
    await client.close();
    db = null;
    client = null;
    isConnecting = false;
    connectionPromise = null;
    console.log('🔌 Conexión a MongoDB cerrada');
  }
};

module.exports = { connectToDatabase, getDatabase, closeDatabase };