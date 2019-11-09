import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class HelpOrderAnswerMail {
  get key() {
    return 'HelpOrderAnswerMail';
  }

  async handle({ data }) {
    const { helpOrder } = data;

    await Mail.sendMail({
      to: `${helpOrder.student.name} <${helpOrder.student.email}>`,
      subject: `Pedido de auxílio #${helpOrder.id}`,
      template: 'helpOrderAnswer',
      context: {
        student: helpOrder.student.name,
        question: helpOrder.question,
        created_at: format(
          parseISO(helpOrder.createdAt),
          "dd'/'MM'/'yyyy HH':'mm':'ss",
          {
            locale: pt,
          }
        ),
        answer: helpOrder.answer,
        answer_at: format(
          parseISO(helpOrder.answer_at),
          "dd'/'MM'/'yyyy HH':'mm':'ss",
          {
            locale: pt,
          }
        ),
      },
    });
  }
}

export default new HelpOrderAnswerMail();
