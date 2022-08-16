import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { tracked } from '@glimmer/tracking';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';

export default class AdministrativeUnitsAdministrativeUnitSitesNewController extends Controller {
  @service router;
  @service store;
  @tracked isPrimarySite = false;

  @dropTask
  *createSiteTask(event) {
    event.preventDefault();

    let { address, administrativeUnit, contact, secondaryContact, site } =
      this.model;

    yield address.validate();
    yield contact.validate();
    yield secondaryContact.validate();

    if (address.isValid && contact.isValid && secondaryContact.isValid) {
      contact = setEmptyStringsToNull(contact);
      yield contact.save();

      secondaryContact = setEmptyStringsToNull(secondaryContact);
      yield secondaryContact.save();

      address.fullAddress = combineFullAddress(address);
      address = setEmptyStringsToNull(address);

      yield address.save();

      site.address = address;
      site.contacts.pushObjects([contact, secondaryContact]);
      yield site.save();

      let nonPrimarySites = yield administrativeUnit.sites;

      if (this.isPrimarySite) {
        let previousPrimarySite = yield administrativeUnit.primarySite;

        if (previousPrimarySite) {
          nonPrimarySites.pushObject(previousPrimarySite);
        }

        administrativeUnit.primarySite = site;
      } else {
        nonPrimarySites.pushObject(site);
      }

      yield administrativeUnit.save();

      this.router.replaceWith(
        'administrative-units.administrative-unit.sites.site',
        site.id
      );
    }
  }

  reset() {
    this.isPrimarySite = false;
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    let { site, address, contact, secondaryContact } = this.model;

    if (site.isNew) {
      site.destroyRecord();
    }

    if (address.isNew) {
      address.destroyRecord();
    }

    if (contact.isNew) {
      contact.destroyRecord();
    }

    if (secondaryContact.isNew) {
      secondaryContact.destroyRecord();
    }
  }
}
