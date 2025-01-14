import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationsOrganizationChangeEventsDetailsRoute extends Route {
  @service store;

  async model() {
    let organization = this.modelFor('organizations.organization');

    let { changeEventId } = this.paramsFor(
      'organizations.organization.change-events.details',
    );
    let changeEvent = await this.store.findRecord(
      'change-event',
      changeEventId,
      {
        reload: true,
        include: [
          'type',
          'decision',
          'original-organizations',
          'resulting-organizations',
          'results.resulting-organization',
          'results.status',
        ].join(),
      },
    );

    let currentChangeEventResult = await findCurrentChangeEventResult(
      organization,
      changeEvent,
    );

    return {
      organization,
      changeEvent,
      currentChangeEventResult,
    };
  }
}

async function findCurrentChangeEventResult(organization, changeEvent) {
  let results = await changeEvent.results;

  for (let result of results.slice()) {
    let resultingOrganization = await result.resultingOrganization;
    if (resultingOrganization.id === organization.id) {
      return result;
    }
  }
}
