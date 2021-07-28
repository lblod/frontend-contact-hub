import { attr, hasMany } from '@ember-data/model';
import WorshipAdministrativeUnitModel from './worship-administrative-unit';

export default class WorshipServiceModel extends WorshipAdministrativeUnitModel {
  @attr denomination;
  @attr crossBorder;
  @hasMany('minister-position') ministerPositions;
  @hasMany('local-involvements', { inverse: 'worshipService' }) involvements;

  get crossBorderNominal() {
    if (this.crossBorder) {
      return 'Ja';
    } else {
      return 'Nee';
    }
  }
}
