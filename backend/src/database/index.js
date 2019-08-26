import Sequelize from 'sequelize';

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
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
