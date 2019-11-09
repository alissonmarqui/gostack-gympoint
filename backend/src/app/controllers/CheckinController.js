import { startOfDay, subDays, isAfter } from 'date-fns';
import { Op } from 'sequelize';

import Checkin from '../models/Checkins';
import Student from '../models/Student';
import Enrollment from '../models/Enrollments';

class CheckinController {
  async index(req, res) {
    const { page = 1, limit = 20 } = req.query;

    const student_id = req.params.id;

    const checkins = await Checkin.findAll({
      where: { student_id },
      limit,
      offset: (page - 1) * limit,
      include: {
        model: Student,
        as: 'student',
        attributes: ['id', 'name', 'email'],
      },
    });

    res.json(checkins);
  }

  async store(req, res) {
    const student_id = req.params.id;

    const enrollment = await Enrollment.findOne({
      where: { student_id },
    });

    if (!enrollment || isAfter(new Date(), enrollment.end_date)) {
      return res
        .status(400)
        .json({ error: 'You do not have an enrollment active' });
    }

    const checkins = await Checkin.findAll({
      where: {
        student_id,
        created_at: { [Op.gte]: startOfDay(subDays(new Date(), 7)) },
      },
    });

    if (checkins.length >= 5) {
      return res
        .status(400)
        .json({ error: 'You can only check-in five times in a week' });
    }

    const checkin = await Checkin.create({ student_id });

    return res.json(checkin);
  }
}

export default new CheckinController();
