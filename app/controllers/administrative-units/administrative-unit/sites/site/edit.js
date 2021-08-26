import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

export default class AdministrativeUnitsAdministrativeUnitSitesSiteEditController extends Controller {
  @service router;
  @tracked isPrimarySite;

  setup() {
    this.isPrimarySite = this.isPrimarySiteCurrent;
  }

  get site() {
    return this.model.site;
  }

  get administrativeUnit() {
    return this.model.administrativeUnit;
  }

  get isPrimarySiteCurrent() {
    return (
      this.site.get('id') === this.administrativeUnit.get('primarySite.id')
    );
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let address = yield this.site.address;

    if (address.hasDirtyAttributes) {
      address.fullAddress = combineFullAddress(address);
      yield address.save();
    }

    let contacts = yield this.site.contacts;
    if (contacts.firstObject.hasDirtyAttributes) {
      yield contacts.firstObject.save();
    }

    yield this.site.save();

    if (this.isPrimarySiteCurrent && !this.isPrimarySite) {
      this.administrativeUnit.sites.pushObject(this.site);

      this.administrativeUnit.primarySite = null;

      yield this.administrativeUnit.save();
    }

    if (this.isPrimarySite && !this.isPrimarySiteCurrent) {
      this.administrativeUnit.primarySite = this.site;

      this.administrativeUnit.sites.removeObject(this.site);

      yield this.administrativeUnit.save();
    }

    this.router.transitionTo(
      'administrative-units.administrative-unit.sites.site',
      this.site.id
    );
  }
}
