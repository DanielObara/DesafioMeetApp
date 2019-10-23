import { startOfHour, addHours } from 'date-fns';
import { Op } from 'sequelize';

import File from '../models/File';
import Meetup from '../models/Meetup';
import User from '../models/User';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

class MeetupSignupController {
  async index(req, res) {
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

  async show(req, res) {
    const { id } = req.params;

    const { subscribers } = await Meetup.findByPk(id, {
      attributes: ['subscribers']
    });

    if (!subscribers)
      return res.status(400).json({ error: 'Meetup does not exist!' });

    const perPage = 10;
    const { page = 1 } = req.query;

    const offset = (page - 1) * perPage;
    const [from, to] = [offset, offset + perPage];
    const hasNext = !!subscribers[to];

    const allSubscribers = await User.findAll({
      where: {
        [Op.or]: subscribers.slice(from, to).map(user_id => ({
          id: user_id
        }))
      },
      attributes: ['id', 'name'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url']
        }
      ]
    });

    return res.json({ subscribers: allSubscribers, hasNext });
  }

  async store(req, res) {
    const meetup = await Meetup.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url']
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!meetup) res.status(400).json({ error: 'Meetup does not exist!' });

    if (meetup.past)
      res.status(400).json({ error: 'Meetup already happened!' });

    if (meetup.canceled_at !== null)
      res.status(400).json({ error: 'Meetup was canceled!' });

    if (req.userId === meetup.owner_id)
      res.status(400).json({ error: 'You cannot sign up for Meetup itself' });

    if (meetup.subscribers.includes(req.userId))
      res.status(400).json({ error: 'You are already subscribed' });

    const hourStart = startOfHour(Number(meetup.date));
    const minimumMeetupHours = 2;

    const conflictMeetups = await Meetup.findOne({
      where: {
        subscribers: { [Op.contains]: [req.userId] },
        date: {
          [Op.between]: [hourStart, addHours(hourStart, minimumMeetupHours)]
        }
      },
      attributes: ['id', 'title', 'location', 'date']
    });
    if (conflictMeetups)
      return res.status(400).json({
        error: 'You cannot sign up for two simultaneous meetups',
        conflict: conflictMeetups
      });

    const {
      id,
      title,
      description,
      location,
      date,
      banner
    } = await meetup.update({
      subscribers: [req.userId, ...meetup.subscribers]
    });

    const user = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url']
        }
      ],
      attributes: ['id', 'name', 'email']
    });

    await Queue.add(SubscriptionMail.key, {
      meetup,
      user
    });

    return res.json({
      id,
      title,
      description,
      location,
      date,
      banner
    });
  }

  async delete(req, res) {
    const meetup = await Meetup.findOne({ where: { id: req.params.id } });

    if (!meetup) res.status(400).json({ error: 'This meetup does not exist!' });

    if (meetup.past)
      res.status(400).json({
        error: 'You cannot unsubscribe from a past Meetup!'
      });

    if (!meetup.subscribers.includes(req.userId))
      res.status(400).json({ error: 'You are not subscribed!' });

    const removeFromSubs = subs => {
      subs.splice(subs.indexOf(req.userId), 1);
      return subs;
    };
    const subscribers = removeFromSubs(meetup.subscribers);

    await meetup.update({ subscribers });

    return res.send({ msg: 'Subscription successfully canceled!' });
  }
}

export default new MeetupSignupController();
