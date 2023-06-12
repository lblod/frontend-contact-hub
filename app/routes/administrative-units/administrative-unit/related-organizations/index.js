import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { CLASSIFICATION_CODE } from 'frontend-organization-portal/models/administrative-unit-classification-code';
export default class AdministrativeUnitsAdministrativeUnitRelatedOrganizationsIndexRoute extends Route {
  @service store;

  queryParams = {
    sort: { refreshModel: true },
  };

  async model(params) {
    const administrativeUnit = this.modelFor(
      'administrative-units.administrative-unit'
    );

    const isAssociatedWith = await administrativeUnit.isAssociatedWith;
    const isSubOrganizationOf = await administrativeUnit.isSubOrganizationOf;
    const wasFoundedByOrganization =
      await administrativeUnit.wasFoundedByOrganization;
    const subOrganizations = await this.loadSubOrganizationsTask.perform(
      administrativeUnit.id,
      params,
      administrativeUnit.classification.get('id') ==
        CLASSIFICATION_CODE.PROVINCE
    );

    return {
      administrativeUnit,
      wasFoundedByOrganization,
      isAssociatedWith,
      isSubOrganizationOf,
      subOrganizations,
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadSubOrganizationsTask(id, params, isProvince = false) {
    if (isProvince) {
      return yield this.store.query('administrative-unit', {
        'filter[:or:][is-sub-organization-of][:id:]': id,
        'filter[:or:][was-founded-by-organization][:id:]': id,
        'filter[:or:][is-sub-organization-of][is-sub-organization-of][:id:]':
          id,
        'page[size]': 500,
        include: 'classification',
        sort: params.sort,
      });
    }
    return yield this.store.query('administrative-unit', {
      'filter[:or:][is-sub-organization-of][:id:]': id,
      'filter[:or:][was-founded-by-organization][:id:]': id,
      'page[size]': 500,
      include: 'classification',
      sort: params.sort,
    });
  }
}
