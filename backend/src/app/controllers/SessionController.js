import jwt from 'jsonwebtoken';

import User from '../models/User';
import File from '../models/File';
import authConfig from '../../config/auth';

import schema from '../validations/Session';

class SessionController {
  async store(req, res) {
    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url']
        }
      ]
    });

    if (!user) res.status(401).json({ error: 'O E-mail não é registrado.' });

    if (!(await user.checkPassword(password)))
      res.status(401).json({ error: 'A senha não confere.' });

    const { id, name, avatar } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        avatar
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn
      })
    });
  }
}

export default new SessionController();
