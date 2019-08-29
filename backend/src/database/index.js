import Sequelize from 'sequelize';
import mongoose from 'mongoose';

// Import dos models
import User from '../app/models/User';
import File from '../app/models/File';
import Meetup from '../app/models/Meetup';

// Import das configurações da DB
import databaseConfig from '../config/database';

// Array com os models da aplicação
const models = [User, File, Meetup];

class Database {
  constructor() {
    this.init();
  }

  // Responsável por fazer a conexão com o banco e carregar os models
  init() {
    // Passando as configurações à connection
    this.connection = new Sequelize(databaseConfig);

    // Percorrendo as models e passando a connection
    models
      .map(model => model.init(this.connection))
      // Percorrendo os models novamente e só vai associar se o model.associate existir
      // Pois no model file não existe o associate.
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    this.mongoConnection = mongoose.connect(
      'mongodb://localhost:27017/meetapp',
      { useNewUrlParser: true, useFindAndModify: true }
    );
  }
}

export default new Database();
