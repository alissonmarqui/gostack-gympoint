import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrders';
import Student from '../models/Student';

class StudentHelpOrderController {
  async index(req, res) {
    const { page = 1, limit = 20 } = req.query;

    const helpOrders = await HelpOrder.findAll({
      where: { student_id: req.params.id },
      limit,
      offset: (page - 1) * limit,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json(helpOrders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not found' });
    }

    const { question } = req.body;

    const helpOrder = await HelpOrder.create({
      student_id: req.params.id,
      question,
    });

    return res.json(helpOrder);
  }
}

export default new StudentHelpOrderController();
