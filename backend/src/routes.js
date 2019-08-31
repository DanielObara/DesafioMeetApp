/**
 * Utilizar essa sintaxe mais atual de import/export é possível graças ao Sucrase.
 * Porém pode ser feito de outras formas utilizando babel por ex.
 * */

import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import MeetupSignupController from './app/controllers/MeetupSignupController';
import MeetupListingController from './app/controllers/MeetupListingController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

// Rotas sem autenticação
routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// A partir daqui as rotas abaixo passam a precisar da autenticação.
routes.use(authMiddleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.store);

// Cria um meetup
routes.post('/meetups', MeetupController.store);
// Lista os meetups que eu criei
routes.get('/meetups', MeetupController.index);
// Mostra um único meetup por ID para todos usuários
routes.get('/meetups/:id', MeetupController.show);
// Atualiza seu meetup
routes.put('/meetups/:id', MeetupController.update);
// Deleta seu meetup
routes.delete('/meetups/:id', MeetupController.delete);

// Lista todos os meetup ordenados por data e com paginação
routes.get('/allmeetups/', MeetupListingController.index);

// Retorna todos os meetup inscritos
routes.get('/subscriptions', MeetupSignupController.index);
// Retorna todos os inscritos no meetup
routes.get('/subscriptions/:id', MeetupSignupController.show);
// Se inscreve no meetup
routes.post('/subscriptions/:id', MeetupSignupController.store);
// Cancela uma inscrição de um meetup
routes.delete('/subscriptions/:id', MeetupSignupController.delete);

export default routes;
