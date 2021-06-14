import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class PeopleIndexController extends Controller {
  @service router;
  queryParams = ['page', 'size', 'givenName', 'familyName', 'organization'];

  @tracked page = 0;
  size = 25;
  @tracked sort = 'family-name';
  @tracked givenName = '';
  @tracked familyName = '';
  @tracked organization = '';


  @action
  search() {
    this.router.refresh();
  }
}
