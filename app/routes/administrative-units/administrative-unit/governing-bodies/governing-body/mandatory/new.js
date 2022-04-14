import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import { mandatoryWithRequiredRoleValidations } from 'frontend-organization-portal/validations/mandatory';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryNewRoute extends Route {
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
  async model({ personId, positionId }, transition) {
    let { governingBody } = this.modelFor(
      'administrative-units.administrative-unit.governing-bodies.governing-body'
    );

    if (personId) {
      transition.data.person = await this.store.findRecord('person', personId);
    }

    let mandatory = this.store.createRecord('worship-mandatory');
    mandatory.isCurrentPosition = true;
    if (positionId) {
      let role = await this.store.findRecord('board-position', positionId);
      mandatory.role = role;
      mandatory.typeHalf = undefined;
    }

    return {
      administrativeUnit: this.modelFor(
        'administrative-units.administrative-unit'
      ),
      governingBody,
      mandatory: createValidatedChangeset(
        mandatory,
        mandatoryWithRequiredRoleValidations
      ),
      mandatoryRecord: mandatory,
    };
  }

  setupController(controller, model, transition) {
    super.setupController(...arguments);

    if (transition.data.person) {
      controller.targetPerson = transition.data.person;
    }
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
