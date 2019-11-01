import * as Yup from 'yup';
import { parseISO, addMonths } from 'date-fns';
import Enrollment from '../models/Enrollments';
import Student from '../models/Student';
import Plan from '../models/Plan';

class EnrollmentController {
  async index(req, res) {
    const { page = 1, limit = 20 } = req.query;

    const enrollments = await Enrollment.findAll({
      limit,
      offset: (page - 1) * limit,
      include: [
        {
          model: Student,
          as: 'student',
        },
        {
          model: Plan,
          as: 'plan',
        },
      ],
    });

    res.json(enrollments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number()
        .positive()
        .required(),
      plan_id: Yup.number()
        .positive()
        .required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    // Check if student exists
    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not found' });
    }

    // Check if student already has an enrollment
    const enrollmentExists = await Enrollment.findOne({
      where: { student_id },
    });

    if (enrollmentExists) {
      return res
        .status(400)
        .json({ error: 'Student already has an enrollment' });
    }

    // Check if plan exists
    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not found' });
    }

    // Calcullate the full price
    const price = plan.price * plan.duration;

    // Calculate the end date
    const end_date = addMonths(parseISO(start_date), plan.duration);

    const enrollment = await Enrollment.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    // TODO send email

    return res.json(enrollment);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number()
        .positive()
        .required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    // Check if enrollment exists
    let enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not found' });
    }

    const { plan_id, start_date } = req.body;

    // Check if plan exists
    const plan = await Plan.findByPk(plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not found' });
    }

    // Calcullate the full price
    const price = plan.price * plan.duration;

    // Calculate the end date
    const end_date = addMonths(parseISO(start_date), plan.duration);

    enrollment = await enrollment.update({
      plan_id,
      start_date,
      end_date,
      price,
    });

    // TODO send email

    return res.json(enrollment);
  }

  async delete(req, res) {
    // Check if enrollment exists
    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment does not found' });
    }

    enrollment.destroy();

    return res.json({ message: 'Enrollment deleted' });
  }
}

export default new EnrollmentController();
