import { format, parseISO } from 'date-fns';
import Mail from '../../lib/Mail';

class EnrollmentMail {
  get key() {
    return 'EnrollmentMail';
  }

  async handle({ data }) {
    const { student, plan, enrollment } = data;

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Matrícula GymPoint',
      template: 'enrollment',
      context: {
        student: student.name,
        plan: plan.title,
        price_month: plan.price,
        price_total: enrollment.price,
        start_date: format(parseISO(enrollment.start_date), "dd'/'MM'/'yyyy"),
        end_date: format(parseISO(enrollment.end_date), "dd'/'MM'/'yyyy"),
      },
    });
  }
}

export default new EnrollmentMail();
