/**
 * Utilizar essa sintaxe mais atual de import/export é possível graças ao Sucrase.
 * Porém pode ser feito de outras formas utilizando babel por ex.
 * */

import { Router } from 'express';
import UserController from './app/controller/UserController';

const routes = new Router();

routes.post('/users', UserController.store);

export default routes;
