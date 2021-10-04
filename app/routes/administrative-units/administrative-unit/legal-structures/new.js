import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import associatedStructureValidations, {
  legalTypeValidations,
} from 'frontend-contact-hub/validations/associated-structure';

const ID_NAME = {
  KBO: 'KBO nummer',
};

export default class AdministrativeUnitsAdministrativeUnitLegalStructuresNewRoute extends Route {
  @service store;

  async model() {
    let administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    return {
      administrativeUnit,
      associatedStructure: createValidatedChangeset(
        this.store.createRecord('associated-legal-structure'),
        associatedStructureValidations
      ),
      address: this.store.createRecord('address'),
      legalType: createValidatedChangeset(
        this.store.createRecord('legal-form-type'),
        legalTypeValidations
      ),
      registration: this.store.createRecord('identifier', {
        idName: ID_NAME.KBO,
      }),
      structuredIdentifier: this.store.createRecord('structured-identifier'),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
