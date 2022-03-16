import Controller from '@ember/controller';
import { dropTask } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { combineFullAddress } from 'frontend-contact-hub/models/address';
import { REQUEST_REASON } from 'frontend-contact-hub/models/request-reason';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
export default class PeoplePersonPersonalInformationEditController extends Controller {
  @service router;
  @service sensitivePersonalInformation;

  @tracked
  sensitiveInformationError;
  @tracked
  validSsn;

  @action
  setSsn(value) {
    this.model.sensitiveInformation.ssn = value;
  }

  reset() {
    this.validSsn = false;
    this.sensitiveInformationError = null;
  }
  @action
  cancel() {
    let { person } = this.model;
    this.router.refresh();
    this.router.transitionTo('people.person.personal-information', person.id);
  }
  @dropTask
  *save(event) {
    event.preventDefault();
    let { person, contacts, sensitiveInformation } = this.model;
    yield person.validate();
    let valid = person.isValid;

    for (let contact of contacts) {
      let { primaryContact, secondaryContact, address } = contact;
      yield primaryContact.validate();
      yield secondaryContact.validate();
      yield address.validate();
      if (
        !primaryContact.isValid ||
        !secondaryContact.isValid ||
        !address.isValid
      ) {
        valid = false;
      }
    }
    if (sensitiveInformation.ssn?.length === 0) {
      this.validSsn = true;
    } else if (
      !/^[0-9]{2}[0-9]{2}[0-9]{2}[0-9]{3}[0-9]{2}$/.test(
        sensitiveInformation.ssn
      )
    ) {
      this.sensitiveInformationError =
        'Vul het (elfcijferige) Rijksregisternummer in.';
      this.validSsn = false;
    } else {
      this.validSsn = yield this.sensitivePersonalInformation.validateSsn(
        person,
        sensitiveInformation.ssn
      );
      if (!this.validSsn) {
        this.sensitiveInformationError =
          'Dit rijksregisternummer al tot een persoon. Als je denkt dat er een fout is, meld het ons.';
      }
    }

    if (valid && this.validSsn) {
      for (let contact of contacts) {
        let { primaryContact, secondaryContact, address, position } = contact;
        if (address.isDirty) {
          address.fullAddress = combineFullAddress(address);
          yield address.save();
        }
        primaryContact.contactAddress = address;
        if (primaryContact.isDirty) {
          yield primaryContact.save();
        }
        if (secondaryContact.isDirty) {
          yield secondaryContact.save();
        }
        yield position.save();
      }
      yield person.save();
      let requestReason = yield this.store.findRecord(
        'request-reason',
        REQUEST_REASON.EDITION
      );
      yield this.sensitivePersonalInformation.updateInformation(
        this.model.sensitiveInformation,
        person,
        requestReason
      );
      this.router.refresh();
      this.router.transitionTo('people.person.personal-information', person.id);
    }
  }
}
