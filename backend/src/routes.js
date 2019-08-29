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

routes.get('/meetups', MeetupController.index);
routes.get('/meetups/:id', MeetupController.show);
routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);
routes.delete('/meetups/:id', MeetupController.delete);

// Retorna todos os meetup inscritos
routes.get('/subscriptions', MeetupSignupController.index);
// Retorna todos os inscritos no meetup
routes.get('/subscriptions/:id', MeetupSignupController.show);
// Se inscreve no meetup
routes.post('/subscriptions/:id', MeetupSignupController.store);
// Cancela uma inscrição de um meetup
routes.delete('/subscriptions/:id', MeetupSignupController.delete);

routes.get('/myMeetups/:id', MeetupListingController.show);

export default routes;
