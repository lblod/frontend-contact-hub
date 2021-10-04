import { validatePresence } from 'ember-changeset-validations/validators';

export default {
  name: validatePresence({ presence: true, ignoreBlank: true }),
};

export const legalTypeValidations = {
  label: validatePresence({ presence: true, ignoreBlank: true }),
};
