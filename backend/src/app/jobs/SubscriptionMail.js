import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class SubscriptionMail {
  // Declarando a key desta forma possibilita que quando importado
  // a classe seja possível acessar SubscriptionMail.key()
  get key() {
    return 'SubscriptionMail';
  }

  // Handle que vai executar a tarefa de envio de email
  async handle({ data }) {
    const { meetup, user } = data;
    console.log('Entrou na fila');

    await Mail.sendMail({
      to: `${meetup.owner.name} <${meetup.owner.email}>`,
      subject: `[${meetup.title}] Nova inscrição`,
      template: 'subscription',
      context: {
        meetupDate: format(
          parseISO(meetup.date),
          "'dia ' dd 'de ' MMMM, ' às ' H:mm'h'",
          {
            locale: pt
          }
        ),
        organizer: meetup.owner.name,
        meetup: meetup.title,
        user: user.name,
        email: user.email
      }
    });
  }
}

export default new SubscriptionMail();
