// // src/models/index.ts
// import { Sequelize } from 'sequelize-typescript';
// import dotenv from 'dotenv';

// // Load environment variables from the .env file
// dotenv.config();

// // Initialize Sequelize with the necessary configuration
// const sequelize = new Sequelize({
//   database: process.env.DB_NAME!,
//   username: process.env.DB_USER!,
//   password: process.env.DB_PASSWORD!,
//   host: process.env.DB_HOST!,
//   port: parseInt(process.env.DB_PORT || '3306', 10),
//   dialect: 'mysql',  // Change to 'postgres' if using PostgreSQL
//   logging: false,  // Disable logging if not needed
// });

// export default sequelize;

// src/models/index.ts
import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

// Initialize Sequelize with PostgreSQL configuration
const sequelize = new Sequelize({
  database: process.env.DB_NAME!,
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT || '5432', 10), // PostgreSQL default port is 5432
  dialect: 'postgres', // ✅ changed from 'mysql' to 'postgres'
  logging: false,
});

export default sequelize;
