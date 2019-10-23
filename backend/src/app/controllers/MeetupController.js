import { Op } from 'sequelize';
import { isBefore, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';
import { storeSchema, updateSchema } from '../validations/Meetup';

class MeetupController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { owner_id: req.userId },
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url']
        }
      ]
    });

    return res.json(meetups);
  }

  async show(req, res) {
    const { id } = req.params;

    const meetup = await Meetup.findByPk(id, {
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

    if (!meetup)
      return res.status(400).json({ error: 'Meetapp does not exists' });

    const {
      title,
      description,
      location,
      date,
      owner,
      past,
      cancelable,
      canceled_at,
      banner
    } = meetup;

    const subscribersAmount = 5;

    const subscribers = await User.findAll({
      where: {
        [Op.or]: meetup.subscribers
          .slice(0, subscribersAmount)
          .map(user_id => ({
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

    const subscribed = !!meetup.subscribers.find(
      user_id => user_id === req.userId
    );

    return res.json({
      title,
      description,
      location,
      date,
      owner,
      past,
      cancelable,
      canceled_at,
      banner,
      subscribers,
      restOfSubscribers: meetup.subscribers.length - subscribersAmount,
      subscribed
    });
  }

  async store(req, res) {
    try {
      await storeSchema.validate(req.body);
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    const { title, description, location, date, banner_id } = req.body;

    const image = await File.findByPk(banner_id);
    if (!image) res.status(400).json({ error: 'Banner not found!' });
    if (image.type !== 'banner')
      res.status(400).json({ error: 'Your picture must be a banner!' });

    if (isBefore(parseISO(date), new Date()))
      return res
        .status(400)
        .json({ error: 'You can not created an meetapp to a passed date!' });

    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      owner_id: req.userId,
      banner_id
    });

    return res.json(meetup);
  }

  async update(req, res) {
    try {
      await updateSchema.validate(req.body);
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    const meetup = await Meetup.findOne({ where: { id: req.params.id } });

    if (!meetup) res.status(400).json({ error: 'Meetapp does not exists' });

    if (meetup.past) res.status(400).json({ error: 'Meetup has passed' });

    if (req.userId !== meetup.owner_id)
      res
        .status(400)
        .json({ error: 'You are not the creator of this Meetup!' });

    const { date, banner_id } = req.body;

    if (banner_id && banner_id !== meetup.banner_id) {
      const image = await File.findByPk(banner_id);
      if (!image) res.status(400).json({ error: 'Image not found' });
      if (image.type !== 'banner')
        res.status(400).json({ error: 'Your image must be a banner.' });
    }

    if (date && isBefore(parseISO(date), new Date()))
      res.status(400).json({ error: 'Past dates not allowed' });

    await meetup.update(req.body);

    const {
      id,
      title,
      description,
      location,
      banner,
      subscribers
    } = await Meetup.findByPk(req.params.id, {
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url']
        }
      ]
    });

    return res.json({
      id,
      title,
      description,
      location,
      date,
      banner,
      subscribers
    });
  }

  async delete(req, res) {
    const meetup = await Meetup.findOne({ where: { id: req.params.id } });

    if (!meetup) res.status(400).json({ error: 'This Meetup Already Exists!' });

    if (meetup.canceled_at)
      res
        .status(400)
        .json({ error: 'This Meetup has already been canceled.!', meetup });

    if (meetup.past)
      res.status(400).json({ error: 'You cannot delete this meetup!' });

    if (req.userId !== meetup.owner_id)
      res
        .status(400)
        .json({ error: 'You are not the creator of this Meetup!' });

    meetup.canceled_at = new Date();

    meetup.subscribers = [];

    await meetup.save();

    return res.send({ msg: 'Meetup was successfully deleted !' });
  }
}

export default new MeetupController();
