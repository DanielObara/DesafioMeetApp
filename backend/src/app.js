/**
 * Utilizar essa sintaxe mais atual de import/export é possível graças ao Sucrase.
 * Porém pode ser feito de outras formas utilizando babel por ex.
 * */

import './bootstrap';
import express from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import './database';

class App {
  constructor() {
    this.server = express();
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
    this.server.use(cors());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
