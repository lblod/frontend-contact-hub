import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import { SensitivePersonalInformation } from 'frontend-contact-hub/services/sensitive-personal-information';
import personValidations from 'frontend-contact-hub/validations/person';

export default class PeopleNewRoute extends Route {
  @service store;
  @service currentSession;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', {
        wildcard: 'pagina-niet-gevonden',
      });
    }
  }
  model() {
    return {
      person: createValidatedChangeset(
        this.store.createRecord('person'),
        personValidations
      ),
      sensitiveInformation: new SensitivePersonalInformation(),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
