import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-contact-hub/models/address';
import { isWorshipMember } from 'frontend-contact-hub/models/board-position';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryNewController extends Controller {
  @service router;
  @service store;

  queryParams = ['personId'];

  @tracked personId;
  @tracked targetPerson = null;

  get isSelectingTargetPerson() {
    return !this.targetPerson;
  }

  get showHalfElectionTypeSelect() {
    return isWorshipMember(this.model.mandatory.role?.id);
  }

  @action
  handleEndDateChange(endDate) {
    let { mandatory } = this.model;
    mandatory.endDate = endDate;

    if (!endDate) {
      mandatory.isCurrentPosition = true;
    } else {
      mandatory.isCurrentPosition = false;
    }
  }

  @action
  handleIsCurrentPositionChange() {
    let { mandatory } = this.model;
    let isCurrentPosition = mandatory.isCurrentPosition;

    if (!isCurrentPosition) {
      mandatory.endDate = undefined;
      mandatory.reasonStopped = undefined;
    }

    mandatory.isCurrentPosition = !isCurrentPosition;
  }

  @action
  async handleMandateRoleSelect(role) {
    let { mandatory } = this.model;
    mandatory.role = role;
    mandatory.typeHalf = undefined;
  }

  @dropTask
  *createMandatoryPositionTask(event) {
    event.preventDefault();

    let { mandatory, governingBody, contact, secondaryContact, address } =
      this.model;

    yield Promise.all([
      mandatory.validate(),
      contact.validate(),
      secondaryContact.validate(),
      address.validate(),
    ]);

    if (
      mandatory.isValid &&
      contact.isValid &&
      secondaryContact.isValid &&
      address.isValid
    ) {
      address.fullAddress = combineFullAddress(address);
      yield address.save();

      contact.contactAddress = address;
      yield contact.save();
      yield secondaryContact.save();

      let mandates = yield governingBody.mandates;
      let mandate = findExistingMandateByRole(mandates, mandatory.role);

      if (!mandate) {
        mandate = this.store.createRecord('mandate');
        mandate.roleBoard = mandatory.role;
        mandate.governingBody = governingBody;
        yield mandate.save();
      }

      mandatory.governingAlias = this.targetPerson;
      mandatory.contacts.pushObjects([contact, secondaryContact]);
      mandatory.mandate = mandate;
      yield mandatory.save();

      this.router.transitionTo(
        'administrative-units.administrative-unit.governing-bodies.governing-body'
      );
    }
  }

  reset() {
    this.personId = null;
    this.targetPerson = null;
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    this.model.addressRecord.rollbackAttributes();
    this.model.contactRecord.rollbackAttributes();
    this.model.secondaryContactRecord.rollbackAttributes();
    this.model.mandatoryRecord.rollbackAttributes();
  }
}

function findExistingMandateByRole(mandates, role) {
  return mandates.find((mandate) => {
    return mandate.roleBoard.get('id') === role.id;
  });
}
