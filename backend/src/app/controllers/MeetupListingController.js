import { Op } from 'sequelize';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupListingController {
  async index(req, res) {
    const where = { canceled_at: null };
    const page = req.query.page || 1;

    if (!req.query.date) {
      return res.status(400).json({ error: 'Invalid date' });
    }

    const searchDate = parseISO(req.query.date);

    where.date = {
      [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)]
    };

    const meetups = await Meetup.findAll({
      where,
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
      ],
      limit: 10,
      offset: 10 * page - 10
    });

    return res.json(meetups);
  }
}

export default new MeetupListingController();
