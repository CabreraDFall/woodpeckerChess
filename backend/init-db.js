// backend/init-db.js
const { Client } = require('pg');
require('dotenv').config();

// Extraemos las credenciales desde el DATABASE_URL del .env
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Error: Ocurrió un fallo al leer DATABASE_URL del .env");
  process.exit(1);
}

// Parseamos la URL: "postgresql://postgres:123456@localhost:5432/woodpecker"
const urlParts = new URL(dbUrl);
const user = urlParts.username;
const password = urlParts.password;
const host = urlParts.hostname;
const port = urlParts.port || 5432;
const targetDbName = urlParts.pathname.replace('/', '');

async function createDatabase() {
  // Nos conectamos a la base de datos por defecto "postgres" para poder crear otras
  const client = new Client({
    user: user,
    password: password,
    host: host,
    port: port,
    database: 'postgres', // Nos conectamos a la DB principal para administrar
  });

  try {
    await client.connect();
    console.log(`Conectado a PostgreSQL localmente en ${host}:${port}.`);

    // Comprobamos si la base de datos ya existe
    const res = await client.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = $1`, [targetDbName]);
    
    if (res.rowCount === 0) {
      console.log(`La base de datos "${targetDbName}" no existe. Creándola...`);
      // PostgreSQL no permite parámetros en comandos CREATE DATABASE.
      await client.query(`CREATE DATABASE "${targetDbName}"`);
      console.log(`¡Base de datos "${targetDbName}" creada con éxito!`);
    } else {
      console.log(`La base de datos "${targetDbName}" ya existe. No es necesario crearla.`);
    }
  } catch (error) {
    if (error.code === '28P01') {
      console.error(`Error crítico: Autenticación fallida para el usuario "${user}". Verifica tu contraseña en el archivo .env`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error(`Error crítico: No se pudo conectar a PostgreSQL en ${host}:${port}. ¿Está el servidor encendido?`);
    } else {
      console.error("Error al procesar la base de datos:", error.message);
    }
  } finally {
    await client.end();
  }
}

createDatabase();
