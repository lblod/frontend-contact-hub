import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask, restartableTask } from 'ember-concurrency';
import { combineFullAddress } from 'frontend-contact-hub/models/address';

const FINANCING_CODE = {
  SELF_FINANCED: '997073905f839ac6bafe92b76050ab0b',
  FOD_FINANCED: '9d6f49b3d923b437ec3a91e8b5fa6885',
};

export default class AdministrativeUnitsAdministrativeUnitMinistersNewController extends Controller {
  @service router;
  @service store;

  @tracked targetPerson = null;
  @tracked isCurrentPosition = true;
  @tracked willReceiveFinancing = true;

  constructor() {
    super(...arguments);

    this.searchParams = new SeachParams();
  }

  get isSelectingTargetPerson() {
    return !this.targetPerson;
  }

  get canSearch() {
    return (
      this.searchParams.givenName.trim() || this.searchParams.familyName.trim()
    );
  }

  @restartableTask
  *searchPeopleTask(event) {
    event.preventDefault();

    if (this.canSearch) {
      let query = {};

      if (this.searchParams.givenName) {
        query['filter[given-name]'] = this.searchParams.givenName;
      }

      if (this.searchParams.familyName) {
        query['filter[family-name]'] = this.searchParams.familyName;
      }

      return yield this.store.query('person', query);
    }
  }

  @dropTask
  *createMinisterPositionTask(event) {
    event.preventDefault();

    let {
      administrativeUnit,
      minister,
      contact,
      contactMobile,
      address,
      position,
    } = this.model;

    address.fullAddress = combineFullAddress(address);
    yield address.save();

    contact.contactAddress = address;
    yield contact.save();
    yield contactMobile.save();

    position.worshipService = administrativeUnit;
    yield position.save();

    let financingCodeId = this.willReceiveFinancing
      ? FINANCING_CODE.FOD_FINANCED
      : FINANCING_CODE.SELF_FINANCED;

    let financing = yield this.store.findRecord(
      'financing-code',
      financingCodeId,
      {
        backgroundReload: false,
      }
    );

    minister.ministerPosition = position;
    minister.person = this.targetPerson;
    minister.contacts.pushObjects([contact, contactMobile]);
    minister.financing = financing;
    yield minister.save();

    this.router.transitionTo(
      'administrative-units.administrative-unit.ministers'
    );
  }

  reset() {
    this.searchParams.reset();
    this.targetPerson = null;
    this.isCurrentPosition = true;
    this.willReceiveFunding = true;
    this.searchPeopleTask.cancelAll({ resetState: true });
    this.removeUnsavedRecords();
  }

  removeUnsavedRecords() {
    this.model.minister.rollbackAttributes();
    this.model.contact.rollbackAttributes();
    this.model.contactMobile.rollbackAttributes();
    this.model.address.rollbackAttributes();
    this.model.position.rollbackAttributes();
  }
}

class SeachParams {
  @tracked givenName;
  @tracked familyName;

  constructor() {
    this.reset();
  }

  reset() {
    this.givenName = '';
    this.familyName = '';
  }
}
