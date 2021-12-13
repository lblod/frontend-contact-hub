import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { ID_NAME } from 'frontend-contact-hub/models/identifier';
import { createValidatedChangeset } from 'frontend-contact-hub/utils/changeset';
import { getAddressValidations } from 'frontend-contact-hub/validations/address';
import contactValidations from 'frontend-contact-hub/validations/contact-point';
import worshipAdministrativeUnitValidations, {
  getStructuredIdentifierKBOValidations,
} from 'frontend-contact-hub/validations/worship-administrative-unit';

export default class AdministrativeUnitsNewRoute extends Route {
  @service store;
  @service currentSession;
  @service session;
  @service router;

  beforeModel() {
    if (!this.currentSession.canEdit) {
      this.router.transitionTo('route-not-found', { wildcard: 'not-found' });
    }
  }
  model() {
    return {
      administrativeUnit: createValidatedChangeset(
        this.store.createRecord('worship-administrative-unit'),
        worshipAdministrativeUnitValidations
      ),
      worshipService: this.store.createRecord('worship-service', {
        crossBorder: false,
      }),
      centralWorshipService: this.store.createRecord('central-worship-service'),
      primarySite: this.store.createRecord('site'),
      address: createValidatedChangeset(
        this.store.createRecord('address'),
        getAddressValidations(true)
      ),
      contact: createValidatedChangeset(
        this.store.createRecord('contact-point'),
        contactValidations
      ),
      identifierKBO: this.store.createRecord('identifier', {
        idName: ID_NAME.KBO,
      }),
      structuredIdentifierKBO: createValidatedChangeset(
        this.store.createRecord('structured-identifier'),
        getStructuredIdentifierKBOValidations(this.store)
      ),
      identifierSharepoint: this.store.createRecord('identifier', {
        idName: ID_NAME.SHAREPOINT,
      }),
      structuredIdentifierSharepoint: this.store.createRecord(
        'structured-identifier'
      ),
    };
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
