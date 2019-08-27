import Sequelize, { Model } from 'sequelize';

class File extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        type: Sequelize.STRING,
        // Este campo virtual significa que não existe na tabela do banco
        url: {
          type: Sequelize.VIRTUAL,
          // Aqui é como queremos formatar este valor.
          // Neste caso retornando o local do file
          get() {
            return `${process.env.APP_URL}/files/${this.path}`;
          }
        }
      },
      {
        sequelize
      }
    );

    return this;
  }
}

export default File;
