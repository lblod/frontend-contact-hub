import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { combineFullAddress } from 'frontend-organization-portal/models/address';
import { action } from '@ember/object';
import { setEmptyStringsToNull } from 'frontend-organization-portal/utils/empty-string-to-null';
import { transformPhoneNumbers } from 'frontend-organization-portal/utils/transform-phone-numbers';
import {
  CLASSIFICATION_CODE,
  OCMW_ASSOCIATION_CLASSIFICATION_CODES,
} from 'frontend-organization-portal/models/administrative-unit-classification-code';

export default class AdministrativeUnitsAdministrativeUnitCoreDataEditController extends Controller {
  @service router;

  get hasValidationErrors() {
    return (
      this.model.administrativeUnit.error ||
      this.model.address.error ||
      this.model.contact.error ||
      this.model.secondaryContact.error ||
      this.model.structuredIdentifierKBO.error ||
      this.model.structuredIdentifierSharepoint.error
    );
  }

  get classificationCodes() {
    return [CLASSIFICATION_CODE.MUNICIPALITY];
  }

  get classificationCodesIgsParticipants() {
    return [
      CLASSIFICATION_CODE.MUNICIPALITY,
      CLASSIFICATION_CODE.OCMW,
      CLASSIFICATION_CODE.AGB,
      CLASSIFICATION_CODE.PROJECTVERENIGING,
      CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
      CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
      CLASSIFICATION_CODE.POLICE_ZONE,
      CLASSIFICATION_CODE.ASSISTANCE_ZONE,
      // TODO when onboarded, add companies
    ];
  }

  get isOcmwAssociation() {
    return OCMW_ASSOCIATION_CLASSIFICATION_CODES.includes(
      this.model.administrativeUnit.classification?.get('id')
    );
  }

  get classificationCodesOcmwAssociationParticipants() {
    return OCMW_ASSOCIATION_CLASSIFICATION_CODES.concat([
      CLASSIFICATION_CODE.MUNICIPALITY,
      CLASSIFICATION_CODE.OCMW,
    ]);
  }

  get classificationCodesOcmwAssociationFounders() {
    return OCMW_ASSOCIATION_CLASSIFICATION_CODES.concat([
      CLASSIFICATION_CODE.MUNICIPALITY,
      CLASSIFICATION_CODE.OCMW,
    ]);
  }

  @action
  setKbo(value) {
    this.model.structuredIdentifierKBO.localId = value;
  }

  @action
  setRelation(units) {
    if (Array.isArray(units)) {
      this.model.administrativeUnit.isSubOrganizationOf = units[0];
    } else {
      this.model.administrativeUnit.isSubOrganizationOf = units;
    }

    if (
      this.model.administrativeUnit.isAgb ||
      this.model.administrativeUnit.isApb ||
      this.model.administrativeUnit.isOcmwAssociation
    )
      if (Array.isArray(units)) {
        this.model.administrativeUnit.wasFoundedByOrganizations = units;
      } else {
        this.model.administrativeUnit.wasFoundedByOrganizations = new Array(
          units
        );
      }
  }

  @action
  setHasParticipants(units) {
    this.model.administrativeUnit.hasParticipants = units;
  }

  @action
  setMunicipality(municipality) {
    this.model.administrativeUnit.isAssociatedWith = municipality;
  }

  @dropTask
  *save(event) {
    event.preventDefault();

    let {
      administrativeUnit,
      address,
      contact,
      secondaryContact,
      identifierSharepoint,
      identifierKBO,
      structuredIdentifierSharepoint,
      structuredIdentifierKBO,
    } = this.model;

    yield Promise.all([
      administrativeUnit.validate(),
      address.validate(),
      contact.validate(),
      secondaryContact.validate(),
      identifierKBO.validate(),
      identifierSharepoint.validate(),
    ]);

    if (!this.hasValidationErrors) {
      let primarySite = yield administrativeUnit.primarySite;

      // TODO : "if" not needed when the data of all administrative units will be correct
      // they should all have a primary site on creation
      if (!primarySite) {
        primarySite = primarySite = this.store.createRecord('site');
        primarySite.address = address;
        administrativeUnit.primarySite = primarySite;
      }

      if (address.isDirty) {
        if (!address.isCountryBelgium) {
          address.province = '';
        }
        address.fullAddress = combineFullAddress(address);
        address = setEmptyStringsToNull(address);
        yield address.save();
      }

      let siteContacts = yield primarySite.contacts;

      if (contact.isDirty) {
        let isNewContact = contact.isNew;

        contact.telephone = transformPhoneNumbers(contact.telephone);
        contact = setEmptyStringsToNull(contact);
        yield contact.save();

        if (isNewContact) {
          siteContacts.pushObject(contact);
          yield primarySite.save();
        }
      }

      if (secondaryContact.isDirty) {
        let isNewContact = secondaryContact.isNew;

        secondaryContact.telephone = transformPhoneNumbers(
          secondaryContact.telephone
        );
        secondaryContact = setEmptyStringsToNull(secondaryContact);
        yield secondaryContact.save();

        if (isNewContact) {
          siteContacts.pushObject(secondaryContact);
          yield primarySite.save();
        }
      }

      structuredIdentifierKBO = setEmptyStringsToNull(structuredIdentifierKBO);
      yield structuredIdentifierKBO.save();
      yield identifierKBO.save();

      structuredIdentifierSharepoint = setEmptyStringsToNull(
        structuredIdentifierSharepoint
      );
      yield structuredIdentifierSharepoint.save();
      yield identifierSharepoint.save();

      administrativeUnit = setEmptyStringsToNull(administrativeUnit);
      if (
        this.model.administrativeUnit.isProvince ||
        this.model.administrativeUnit.isMunicipality
      ) {
        // set province or municipality name to null as data are already in the shared graph
        administrativeUnit.name = null;
        yield administrativeUnit.save();
        yield administrativeUnit.reload();
      } else {
        yield administrativeUnit.save();
      }

      const syncOvoNumberEndpoint = `/sync-ovo-number/${structuredIdentifierKBO.id}`;
      yield fetch(syncOvoNumberEndpoint, {
        method: 'POST',
      });

      this.router.refresh();
      this.router.transitionTo(
        'administrative-units.administrative-unit.core-data',
        administrativeUnit.id
      );
    }
  }

  resetUnsavedRecords() {
    this.model.administrativeUnit.reset();
    this.model.contact.reset();
    this.model.secondaryContact.reset();
    this.model.address.reset();
    this.model.identifierKBO.reset();
    this.model.identifierSharepoint.reset();
  }

  reset() {
    this.resetUnsavedRecords();
  }
}
