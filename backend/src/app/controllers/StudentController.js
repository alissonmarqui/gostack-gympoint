import * as Yup from 'yup';

import Student from '../models/Student';

class StudentsController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .integer()
        .positive()
        .required(),
      weight: Yup.number()
        .positive()
        .required(),
      height: Yup.number()
        .positive()
        .required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const studentExists = await Student.findOne({
      wehre: { email: req.body.email },
    });

    if (studentExists) {
      return res.status(400).json({ error: 'Student already exists' });
    }

    const student = await Student.create(req.body);

    return res.json(student);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number()
        .integer()
        .positive(),
      weight: Yup.number().positive(),
      height: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    let student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not found' });
    }

    if (req.body.email !== student.email) {
      const studentExists = await Student.findOne({
        wehre: { email: req.body.email },
      });

      if (studentExists) {
        return res.status(400).json({ error: 'Student already exists' });
      }
    }

    student = await student.update(req.body);

    return res.json(student);
  }
}

export default new StudentsController();
