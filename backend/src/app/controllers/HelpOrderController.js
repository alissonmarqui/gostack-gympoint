import * as Yup from 'yup';
import Queue from '../../lib/Queue';
import HelpOrderAnswerMail from '../jobs/HelpOrderAnswerMail';

import HelpOrder from '../models/HelpOrders';
import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    const { page = 1, limit = 20 } = req.query;

    const helpOrders = await HelpOrder.findAll({
      where: { answer_at: null },
      limit,
      offset: (page - 1) * limit,
      includeL: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json(helpOrders);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const helpOrder = await HelpOrder.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!helpOrder) {
      return res.status(400).json({ error: 'Help order does not found' });
    }

    const { answer } = req.body;

    helpOrder.update({
      answer,
      answer_at: new Date(),
    });

    await Queue.add(HelpOrderAnswerMail.key, {
      helpOrder,
    });

    return res.json(helpOrder);
  }
}

export default new HelpOrderController();
