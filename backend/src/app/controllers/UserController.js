import User from '../models/User';
import File from '../models/File';

import { storeSchema, updateSchema } from '../validations/User';

class UserController {
  async store(req, res) {
    try {
      await storeSchema.validate(req.body);
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists)
      res.status(400).json({ error: 'E-mail already registered!' });

    const { id, name, email } = await User.create(req.body);

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

    if (email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });

      if (emailExists)
        res.status(400).json({ error: 'Opss.. This email is already in use!' });
    }

    if (avatar_id) {
      const image = await File.findByPk(avatar_id);
      if (!image) res.status(400).json({ error: 'Opss.. Avatar not found' });
      if (image.type !== 'avatar')
        res.status(400).json({ error: 'Opss.. Your avatar must be a picture' });
    }

    if (oldPassword && !(await user.checkPassword(oldPassword)))
      res.status(401).json({ error: 'Opss.. The password does not match' });

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
