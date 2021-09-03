import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { restartableTask, timeout } from 'ember-concurrency';

const CLASSIFICATION = {
  MUNICIPALITY: {
    id: '5ab0e9b8a3b2ca7c5e000001',
  },
  PROVINCE: {
    id: '5ab0e9b8a3b2ca7c5e000000',
  },
};

export default class AdministrativeUnitSelectComponent extends Component {
  @service store;
  administrativeUnits;

  @restartableTask
  *loadAdministrativeUnitsTask(searchParams = '') {
    yield timeout(500);

    const query = {
      sort: 'name',
      filter: {
        ['classification']: {
          [':id:']: [
            CLASSIFICATION.MUNICIPALITY.id,
            CLASSIFICATION.PROVINCE.id,
          ].join(),
        },
      },
      include: 'classification',
    };

    if (searchParams.trim() !== '') {
      query['filter[name]'] = searchParams;
    }

    return yield this.store.query('administrative-unit', query);
  }
}
