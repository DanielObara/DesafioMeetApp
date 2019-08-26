// Importando a Model do usuário.
import User from '../models/User';
import File from '../models/File';

// Importando o esquema de validação dos dados do usuário.
import { storeSchema, updateSchema } from '../validations/User';

class UserController {
  // Função de criação do usuário
  async store(req, res) {
    try {
      // Chama o validate do Yup para validar os dados do usuário.
      await storeSchema.validate(req.body);
    } catch (err) {
      // Caso ocorra erro retorna a mensagem contendo os erros retornados pelo Yup.
      return res.status(400).json({ error: err.errors });
    }

    // Valida se já existe usuário.
    const userExists = await User.findOne({ where: { email: req.body.email } });

    // Retorna mensagem caso e-mail cadastrado.
    if (userExists) res.status(400).json({ error: 'E-mail já cadastrado!' });

    // Cria o usuário e pega os atributos pela desestruturação.
    const { id, name, email } = await User.create(req.body);

    // Retorna a resposta com os atributos do usuário.
    return res.json({
      id,
      name,
      email
    });
  }

  async update(req, res) {
    try {
      await updateSchema.validate(req.body);
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    const { email, oldPassword, avatar_id } = req.body;

    const user = await User.findByPk(req.userId);

    // Prevents duplicating e-mails
    if (email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });

      if (emailExists)
        res
          .status(400)
          .json({ error: 'Opss.. Este e-mail já está sendo utilizado!' });
    }

    if (avatar_id) {
      const image = await File.findByPk(avatar_id);
      if (!image)
        res.status(400).json({ error: 'Opss.. Avatar não encontrado' });
      if (image.type !== 'avatar')
        res
          .status(400)
          .json({ error: 'Opss.. Seu avatar precisa ser uma imagem' });
    }

    if (oldPassword && !(await user.checkPassword(oldPassword)))
      res.status(401).json({ error: 'Opss.. A senha nao confere' });

    await user.update(req.body);

    const { id, name, avatar } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url']
        }
      ]
    });

    return res.json({
      id,
      name,
      email,
      avatar
    });
  }
}

export default new UserController();
