import { validatePresence } from 'ember-changeset-validations/validators';
import { validateUrl } from 'frontend-contact-hub/validators/url';

export const changeEventValidations = {
  date: validatePresence({
    presence: true,
    ignoreBlank: true,
  }),
};

export const decisionValidations = {
  documentLink: validateUrl(),
};
