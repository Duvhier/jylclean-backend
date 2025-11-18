const { MongoClient } = require('mongodb');

let db;
let client;

const connectToDatabase = async () => {
  try {
    if (db) {
      return db;
    }

    client = new MongoClient(process.env.MONGODB_URI || 'mongodb+srv://duviertavera01:3SK6o5HM3g46zXSQ@cluster0.0bbblsp.mongodb.net/jl_clean_co');
    await client.connect();
    db = client.db();
    console.log('✅ Conectado a MongoDB');
    return db;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
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
    console.log('🔌 Conexión a MongoDB cerrada');
  }
};

module.exports = { connectToDatabase, getDatabase, closeDatabase };