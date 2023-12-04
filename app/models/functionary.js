import { attr, belongsTo } from '@ember-data/model';
import AgentInPositionModel from './agent-in-position';

export default class FunctionaryModel extends AgentInPositionModel {
  @attr('date') startDate;
  @attr('date') endDate;

  @belongsTo('agent-status-code', {
    inverse: null,
  })
  status;

  @belongsTo('person', {
    inverse: 'functionaries',
  })
  governingAlias;

  @belongsTo('board-position', {
    inverse: null,
  })
  boardPosition;
}
