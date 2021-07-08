import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdministrativeUnitsAdministrativeUnitSitesIndexRoute extends Route {
  @service store;

  async model() {
    let { id: administrativeUnitId } = this.paramsFor(
      'administrative-units.administrative-unit'
    );

    let administrativeUnit = await this.store.findRecord(
      'administrative-unit',
      administrativeUnitId,
      {
        reload: true,
        include: [
          'primary-site.address',
          'primary-site.contacts',
          'sites.address',
          'sites.contacts',
        ].join(),
      }
    );

    return {
      administrativeUnit: administrativeUnit,
      primarySite: await administrativeUnit.primarySite,
      // temporary, sites data are not yet available
      sites: await administrativeUnit.primarySite,
    };
  }
}
