import {
  validatePresence,
  validateNumber,
  validateLength,
} from 'ember-changeset-validations/validators';
import validateDate from '../validators/date';

export default {
  triggerId: [validatePresence({ presence: true })],

  name: [validatePresence({ presence: true, ignoreBlank: true })],
  description: [
    validatePresence({ presence: true, ignoreBlank: true }),
    validateLength({ max: 170 }),
  ],
  expiry: [
    validatePresence({ presence: true, ignoreBlank: true }),
    validateDate({
      after: new Date(),
      message: 'The date must be after today',
    }),
  ],
  frequency: [
    validatePresence({ presence: true, ignoreBlank: true }),
    validateNumber({ positive: true }),
  ],
  surveyEmbed: [validatePresence({ presence: true, ignoreBlank: true })],
};
