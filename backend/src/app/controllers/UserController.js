// Importando a Model do usuário.
import User from '../models/User';

// Importando o esquema de validação dos dados do usuário.
import { storeSchema } from '../validations/User';

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
    if (userExists)
      return res.status(400).json({ error: 'E-mail já cadastrado!' });

    // Cria o usuário e pega os atributos pela desestruturação.
    const { id, name, email } = await User.create(req.body);

    // Retorna a resposta com os atributos do usuário.
    return res.json({
      id,
      name,
      email
    });
  }
}

export default new UserController();
