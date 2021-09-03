import Route from '@ember/routing/route';
import { dropTask } from 'ember-concurrency';

export default class OrganizationsOrganizationRoute extends Route {
  async model(params) {
    return {
      representativeBody: await this.store.findRecord(
        'representative-body',
        params.id,
        {
          reload: true,
          include: [
            'organization-status',
            'recognized-worship-type',
            'identifiers.structured-identifier',
            'primary-site.address',
            'primary-site.contacts',
            'resulted-from',
          ].join(),
        }
      ),
      associatedOrganizationsTaskInstance:
        this.loadAssociatedOrganizationsTask.perform(params.id),
    };
  }

  @dropTask({ cancelOn: 'deactivate' })
  *loadAssociatedOrganizationsTask(representativeBodyId) {
    return yield this.store.query('organization', {
      include: 'classification',
      ['filter[is-associated-with][:id:]']: representativeBodyId,
      // TODO: This is a hack to make sure all records are loaded.
      // If the current layout is kept it should be replaced by a util that loads all the records page by page
      ['page[size]']: 500,
    });
  }
}
