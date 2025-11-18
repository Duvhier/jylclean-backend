// setup.js - Versión corregida
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Configuración directamente en el archivo (temporalmente)
const MONGODB_URI = 'mongodb+srv://duviertavera01:3SK6o5HM3g46zXSQ@cluster0.0bbblsp.mongodb.net/jl_clean_co';

let db;

const connectToDatabase = async () => {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
    console.log('✅ Conectado a MongoDB');
    return db;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const initializeDatabase = async () => {
  try {
    await connectToDatabase();

    // Crear índices
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('products').createIndex({ name: 1 });
    await db.collection('sales').createIndex({ userId: 1 });
    await db.collection('sales').createIndex({ createdAt: -1 });

    console.log('✅ Índices creados correctamente');

    // Verificar si ya existe el SuperUser
    const existingSuperUser = await db.collection('users').findOne({ email: 'superadmin@jlclean.com' });
    
    if (!existingSuperUser) {
      // Crear SuperUser inicial
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);

      const superUser = {
        name: 'Super Administrador',
        email: 'superadmin@jlclean.com',
        password: hashedPassword,
        role: 'SuperUser',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db.collection('users').insertOne(superUser);
      console.log('✅ SuperUser creado:');
      console.log('   📧 Email: superadmin@jlclean.com');
      console.log('   🔑 Password: Admin123!');
      console.log('   👤 Rol: SuperUser');
    } else {
      console.log('ℹ️  El SuperUser ya existe en la base de datos');
    }

    // Verificar productos existentes
    const existingProducts = await db.collection('products').countDocuments();
    
    if (existingProducts === 0) {
      // Insertar productos de ejemplo
      const sampleProducts = [
        {
          name: "Jabón Líquido Multiusos",
          description: "Jabón líquido para todo tipo de superficies, elimina grasa y suciedad eficazmente",
          price: 15.99,
          stock: 100,
          category: "Limpieza General",
          image: "/images/multiusos.jpg",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Desinfectante Aromático",
          description: "Desinfectante con aroma a limón, elimina el 99.9% de bacterias",
          price: 12.50,
          stock: 80,
          category: "Desinfectantes",
          image: "/images/desinfectante.jpg",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Limpiador de Vidrios",
          description: "Formula especial para vidrios y superficies brillantes sin dejar marcas",
          price: 18.75,
          stock: 60,
          category: "Especializados",
          image: "/images/limpiador-vidrios.jpg",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: "Detergente Concentrado",
          description: "Detergente concentrado para ropa, eficaz en agua fría y caliente",
          price: 22.99,
          stock: 120,
          category: "Lavandería",
          image: "/images/detergente.jpg",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await db.collection('products').insertMany(sampleProducts);
      console.log(`✅ ${sampleProducts.length} productos de ejemplo insertados`);
    } else {
      console.log(`ℹ️  Ya existen ${existingProducts} productos en la base de datos`);
    }

    console.log('\n🎉 Configuración completada exitosamente!');
    console.log('🚀 Ahora puedes iniciar el servidor con: npm run dev');

  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
  } finally {
    process.exit();
  }
};

// Manejar errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('❌ Error no manejado:', err);
  process.exit(1);
});

initializeDatabase();