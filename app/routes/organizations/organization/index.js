import Route from '@ember/routing/route';

export default class OrganizationsOrganizationIndexRoute extends Route {
  model() {
    return this.modelFor('organizations.organization');
  }
}
