import mysql from 'mysql2/promise'

const poolConfig = process.env.MYSQL_URL
  ? { uri: process.env.MYSQL_URL, waitForConnections: true, connectionLimit: 10 }
  : {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'rebanho',
      waitForConnections: true,
      connectionLimit: 10,
    }

const pool = mysql.createPool(poolConfig)

export default pool
