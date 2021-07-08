import {
  validatePresence,
  validateLength,
  validateFormat,
} from 'ember-changeset-validations/validators';

export default {
  email: [validateFormat({ type: 'email' }), validatePresence(true)],
  contactNumber: [
    validateFormat({
      regex:
        /^\s*(?:\+?(\d{1,3}))?[-. ]*(\d{3})[-. ]*(\d{3})[-. ]*(\d{2,4})(?: *x(\d+))?\s*$/,
      allowBlank: true,
    }),
  ],
  metadata: {
    aboutMe: [
      validateLength({
        max: 200,
        message: 'Bio should not exceed 200 characters',
      }),
    ],
  },
};
