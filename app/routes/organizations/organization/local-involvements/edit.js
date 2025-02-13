import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { INVOLVEMENT_TYPE } from 'frontend-organization-portal/models/involvement-type';
import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class OrganizationsOrganizationLocalInvolvementsEditRoute extends Route {
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

  async model() {
    let { id: organizationId } = this.paramsFor('organizations.organization');

    let organization = await this.store.findRecord(
      'worship-administrative-unit',
      organizationId,
      {
        reload: true,
        include:
          'recognized-worship-type,involvements.involvement-type,involvements.administrative-unit.classification',
      },
    );

    let involvementTypes;
    const classification = await organization.classification;
    if (classification.id == CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id) {
      involvementTypes = await this.store.query('involvement-type', {
        filter: {
          id: INVOLVEMENT_TYPE.SUPERVISORY, // Toezichthoundend
        },
      });
    } else {
      involvementTypes = await this.store.query('involvement-type', {});
    }
    const involvements = await organization.involvements;

    let involvementTypesProvince = involvementTypes
      .slice()
      .filter((it) => it.id !== INVOLVEMENT_TYPE.ADVISORY); // Non adviserend

    return {
      organization,
      involvements,
      involvementTypes,
      involvementTypesProvince,
    };
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.setup(model);
  }

  resetController(controller) {
    super.resetController(...arguments);
    controller.reset();
  }
}
