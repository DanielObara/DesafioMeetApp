import { startOfHour, addHours } from 'date-fns';
import { Op } from 'sequelize';

import File from '../models/File';
import Meetup from '../models/Meetup';
import User from '../models/User';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

class MeetupSignupController {
  // Listando os meetups que irão acontecer
  async index(req, res) {
    // Buscando os meetups no qual o user logado está registrado e trazendo o criador do meetup e sua foto.
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
    // Busca inscritos no meetup
    const { subscribers } = await Meetup.findByPk(id, {
      attributes: ['subscribers']
    });
    // Valida se não está vazio
    if (!subscribers)
      return res.status(400).json({ error: 'O Meetup não existe!' });

    // Paginação
    const perPage = 10;
    const { page = 1 } = req.query;

    const offset = (page - 1) * perPage;
    const [from, to] = [offset, offset + perPage];
    const hasNext = !!subscribers[to];

    // Retorna da tabela do usuário todos os inscritos no meetup
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
      // Incluindo informações dos relacionamento para retorno
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

    // Retorna 400 caso não exista
    if (!meetup) res.status(400).json({ error: 'Meetup não existe!' });

    // Retorna 400 caso já ocorrido
    if (meetup.past) res.status(400).json({ error: 'Meetup já aconteceu!' });

    // Retorna 400 caso meetup seja um cancelado
    if (meetup.canceled_at !== null)
      res.statusd(400).json({ error: 'Meetup cancelado!' });

    // Retorna 400 caso seja o criador do meetup
    if (req.userId === meetup.owner_id)
      res
        .status(400)
        .json({ error: 'Você não pode se inscrever no próprio Meetup' });

    // Retorna 400 caso o usuário logado já esteja inscrito no meetup
    if (meetup.subscribers.includes(req.userId))
      res.status(400).json({ error: 'Você já está inscrito' });

    const hourStart = startOfHour(Number(meetup.date));
    const minimumMeetupHours = 2;

    const conflictMeetups = await Meetup.findOne({
      where: {
        subscribers: { [Op.contains]: [req.userId] },
        date: {
          // Operação que retorna os com data ('between') entre os horários especificado
          [Op.between]: [hourStart, addHours(hourStart, minimumMeetupHours)]
        }
      },
      attributes: ['id', 'title', 'location', 'date']
    });

    if (conflictMeetups)
      return res.status(400).json({
        error: 'Você não pode se inscrever em dois meetups simutâneos',
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
      ]
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

    if (!meetup) res.status(400).json({ error: 'Este meetup não existe!' });

    if (meetup.past)
      res.status(400).json({
        error: 'Você não pode cancelar a inscrição de um Meetup passado!'
      });

    if (!meetup.subscribers.includes(req.userId))
      res.status(400).json({ error: 'Você não está inscrito!' });

    const removeFromSubs = subs => {
      subs.splice(subs.indexOf(req.userId), 1);
      return subs;
    };
    const subscribers = removeFromSubs(meetup.subscribers);

    await meetup.update({ subscribers });

    return res.send({ msg: 'Inscrição cancelada com sucesso!' });
  }
}

export default new MeetupSignupController();
