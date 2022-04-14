import Service from '@ember/service';

import { inject as service } from '@ember/service';
import { isActivePosition } from 'frontend-organization-portal/utils/position';
import { createValidatedChangeset } from 'frontend-organization-portal/utils/changeset';
import contactValidations from 'frontend-organization-portal/validations/contact-point';
import { getAddressValidations } from 'frontend-organization-portal/validations/address';
import {
  findPrimaryContact,
  findSecondaryContact,
} from 'frontend-organization-portal/models/contact-point';

export default class ContactDetailsService extends Service {
  @service store;

  async getPersonAndAllPositions(personId) {
    let person = await this.store.findRecord('person', personId, {
      reload: true,
      include: [
        'mandatories.mandate.governing-body.is-time-specialization-of.administrative-unit.classification',
        'mandatories.contacts',
        'mandatories.contacts.contact-address',
        'mandatories.mandate.role-board',

        'agents-in-position',
        'agents-in-position.contacts',
        'agents-in-position.contacts.contact-address',

        'agents-in-position.position.function',
        'agents-in-position.position.worship-service',
      ].join(),
    });
    const positions = [];
    const mandatories = person.mandatories.toArray();

    const ministers = person.agentsInPosition.toArray();

    for (let mandatory of mandatories) {
      const mandate = await mandatory.mandate;
      if (!isActivePosition(mandatory.endDate)) {
        continue;
      }
      const role = await mandate.roleBoard;
      const governingBody = await mandate.governingBody;
      const isTimeSpecializationOf = await governingBody.isTimeSpecializationOf;
      const administrativeUnit =
        await isTimeSpecializationOf.administrativeUnit;
      const mContacts = await mandatory.contacts;
      const primaryContact = findPrimaryContact(mContacts);
      const secondaryContact = findSecondaryContact(mContacts);
      positions.push({
        position: mandatory,
        title: `${role.label}, ${administrativeUnit.name}`,
        role: role.label,
        type: 'mandatory',
        id: mandatory.id,
        startDate: mandatory.startDate,
        endDate: mandatory.endDate,
        administrativeUnit,
        primaryContact: primaryContact,
        secondaryContact: secondaryContact,
      });
    }

    for (let minister of ministers) {
      if (!isActivePosition(minister.agentEndDate)) {
        continue;
      }
      const position = await minister.position;
      const role = await position.function;
      const administrativeUnit = await position.worshipService;
      const mContacts = await minister.contacts;
      const primaryContact = findPrimaryContact(mContacts);
      const secondaryContact = findSecondaryContact(mContacts);
      positions.push({
        position: minister,
        title: `${role.label}, ${administrativeUnit.name}`,
        role: role.label,
        type: 'minister',
        id: minister.id,
        startDate: minister.agentStartDate,
        endDate: minister.agentEndDate,
        administrativeUnit,
        primaryContact: primaryContact,
        secondaryContact: secondaryContact,
      });
    }

    return {
      person,
      positions: positions.sort((a, b) => {
        return b.startDate - a.startDate;
      }),
    };
  }

  async positionsToEditableContacts(positions) {
    const contacts = [];
    for (let computedPosition of positions) {
      let { primaryContact, secondaryContact, position } = computedPosition;

      let address = await primaryContact?.contactAddress;

      let contact = {
        position,
        title: computedPosition.title,
        primaryContact: !primaryContact
          ? null
          : createValidatedChangeset(primaryContact, contactValidations),
        address: !address
          ? null
          : createValidatedChangeset(address, getAddressValidations()),
        secondaryContact: !secondaryContact
          ? null
          : createValidatedChangeset(secondaryContact, contactValidations),
      };
      contacts.push(contact);
    }
    return contacts;
  }
}
