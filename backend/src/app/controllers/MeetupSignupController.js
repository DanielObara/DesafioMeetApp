import { startOfHour, addHours } from 'date-fns';
import { Op } from 'sequelize';

import File from '../models/File';
import Meetup from '../models/Meetup';
import User from '../models/User';

class MeetupSignupController {
  // Listando os meetups que irão acontecer
  async index(req, res) {
    // Buscando os meetups no qual o user logado está registrado
    const meetups = await Meetup.findAll({
      where: {
        subscribers: { [Op.contains]: [req.userId] }
      },
      attributes: ['id', 'title', 'description', 'location', 'date'],
      order: ['date'],
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url']
            }
          ]
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url']
        }
      ]
    });

    return res.json(meetups.filter(m => !m.past));
  }

  // Mostrando um Meetup
  async show(req, res) {}
}

export default new MeetupSignupController();
