// eslint-disable-next-line import/no-unresolved
require('dotenv/config');

module.exports = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  define: {
    timestamps: true,
    // Padroniza a nomenclatura das tabelas ex: user_groups
    underscored: true,
    underscoredAll: true
  }
};
