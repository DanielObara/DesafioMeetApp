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

    await Mail.sendMail({
      to: `${meetup.User.name} <${meetup.User.email}>`,
      subject: `[${meetup.title}] Nova inscrição`,
      template: 'subscription',
      context: {
        organizer: meetup.User.name,
        meetup: meetup.title,
        user: user.name,
        email: user.email
      }
    });
  }
}

export default new SubscriptionMail();
