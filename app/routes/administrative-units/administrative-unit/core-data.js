import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitCoreDataRoute extends Route {
  @service store;

  model() {
    let { id: administrativeUnitId } = this.paramsFor(
      'administrative-units.administrative-unit'
    );

    return this.store.findRecord(
      'worship-administrative-unit',
      administrativeUnitId,
      {
        reload: true,
        include: [
          'classification',
          'organization-status',
          'recognized-worship-type',
          'scope',
          'identifiers.structured-identifier',
          'primary-site.address',
          'primary-site.contacts',
          'is-sub-organization-of',
          'is-associated-with',
          'sub-organizations',
          'resulted-from',
        ].join(),
      }
    );
  }
}
