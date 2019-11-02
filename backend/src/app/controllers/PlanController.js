import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const { page = 1, limit = 20 } = req.query;

    const plans = await Plan.findAll({
      limit,
      offset: (page - 1) * limit,
      order: ['price'],
    });

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .integer()
        .required()
        .positive(),
      price: Yup.number()
        .required()
        .positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const planExists = await Plan.findOne({
      where: {
        title: req.body.title,
      },
    });

    if (planExists) {
      return res.status(400).json({ error: 'Plan title already exists' });
    }

    const plan = await Plan.create(req.body);

    return res.json(plan);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number()
        .integer()
        .positive(),
      price: Yup.number().positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    let plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not found' });
    }

    if (plan.title !== req.body.title) {
      const planExists = await Plan.findOne({
        where: {
          title: req.body.title,
        },
      });

      if (planExists) {
        return res.status(400).json({ error: 'Plan title already exists' });
      }
    }

    plan = await plan.update(req.body);

    return res.json(plan);
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not found' });
    }

    plan.destroy();

    return res.json({ message: 'Plan deleted' });
  }
}

export default new PlanController();
