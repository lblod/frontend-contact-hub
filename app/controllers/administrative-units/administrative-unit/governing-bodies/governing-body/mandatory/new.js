import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { isWorshipMember } from 'frontend-organization-portal/models/board-position';
import { combineFullAddress } from 'frontend-organization-portal/models/address';

export default class AdministrativeUnitsAdministrativeUnitGoverningBodiesGoverningBodyMandatoryNewController extends Controller {
  @service router;
  @service store;
  @service contactDetails;

  queryParams = ['personId', 'positionId'];

  @tracked computedContactDetails;

  @tracked personId;
  @tracked positionId;

  @tracked targetPerson = null;
  @tracked contact = null;
  @tracked allContacts = null;

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

  @dropTask
  *selectTargetPerson(p) {
    const { person, positions } =
      yield this.contactDetails.getPersonAndAllPositions(p.id);
    this.allContacts = yield this.contactDetails.positionsToEditableContacts(
      positions
    );
    this.contact = { position: this.model.mandatory };
    this.targetPerson = person;
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

    let { mandatory, governingBody } = this.model;

    yield mandatory.validate();

    if (mandatory.isValid) {
      let contactValid = true;

      if (this.computedContactDetails) {
        let { primaryContact, secondaryContact, address } =
          this.computedContactDetails;

        yield primaryContact.validate();
        yield secondaryContact.validate();
        yield address.validate();
        contactValid =
          primaryContact.isValid && secondaryContact.isValid && address.isValid;
        if (contactValid) {
          if (address.isDirty) {
            address.fullAddress = combineFullAddress(address);
          }
          primaryContact.contactAddress = address;

          if (address.isDirty) {
            yield address.save();
          }

          if (primaryContact.isDirty) {
            yield primaryContact.save();
          }
          if (secondaryContact.isDirty) {
            yield secondaryContact.save();
          }
          mandatory.contacts.clear();
          mandatory.contacts.pushObjects([primaryContact, secondaryContact]);
        }
      }

      if (contactValid) {
        let mandates = yield governingBody.mandates;
        let mandate = findExistingMandateByRole(mandates, mandatory.role);

        if (!mandate) {
          mandate = this.store.createRecord('mandate');
          mandate.roleBoard = mandatory.role;
          mandate.governingBody = governingBody;
          yield mandate.save();
        }
        mandatory.governingAlias = this.targetPerson;
        mandatory.mandate = mandate;
        yield mandatory.save();

        this.router.transitionTo(
          'administrative-units.administrative-unit.governing-bodies.governing-body'
        );
      }
    }
  }

  reset() {
    this.personId = null;
    this.positionId = null;
    this.targetPerson = null;
    this.allContacts = null;
    this.contact = null;
    this.computedContactDetails = null;
    this.removeUnsavedRecords();
  }

  @action
  updateContact(editingContact) {
    this.computedContactDetails = editingContact;
  }
  removeUnsavedRecords() {
    this.model.mandatoryRecord.rollbackAttributes();
  }
}

function findExistingMandateByRole(mandates, role) {
  return mandates.find((mandate) => {
    return mandate.roleBoard.get('id') === role.id;
  });
}
