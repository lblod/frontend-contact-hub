import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { selectByRole as getClassificationIds } from 'frontend-organization-portal/utils/classification-identifiers';
import { formatIdentifier } from 'frontend-organization-portal/helpers/format-identifier';

export default class OrganizationSelectByIdentifierComponent extends Component {
  @service muSearch;
  @service currentSession;

  @restartableTask
  *loadOrganizationsTask(searchParams = '') {
    const filter = {};

    searchParams = formatIdentifier([searchParams]);

    if (searchParams.trim() !== '') {
      // Notes:
      // - toLowerCase is needed to properly match OVO numbers
      // - use index field that only contains alphanumeric characters
      //   (cf. mu-search configuration)
      filter[`:prefix:identifier.index`] = searchParams.toLowerCase();
    }

    filter['classification_id'] = getClassificationIds(
      this.currentSession.hasWorshipRole,
    );

    const result = yield this.muSearch.search({
      index: 'organizations',
      sort: 'name',
      page: '0',
      size: '100',
      filters: filter,
      dataMapping: (data) => {
        const entry = data.attributes.identifier;

        // Note: if-then-else needed as some units contain only one identifier,
        // which does not result in array being returned
        if (Array.isArray(entry)) {
          return entry.filter((id) =>
            formatIdentifier([id.toLowerCase()]).startsWith(
              searchParams.toLowerCase(),
            ),
          );
        } else {
          return entry;
        }
      },
    });

    if (result) {
      return [...[searchParams], ...new Set(result.slice())];
    }
  }
}
