import Model, { attr, belongsTo } from '@ember-data/model';

export default class ChangeEventModel extends Model {
  @attr('date') date;
  @attr description;

  @belongsTo('change-event-type', {
    inverse: null,
  })
  type;
}
