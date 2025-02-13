import { belongsTo, hasMany } from '@ember-data/model';
import AdministrativeUnitModel from './administrative-unit';
import {
  validateHasManyOptional,
  validateRequiredWhenClassificationId,
} from '../validators/schema';
import {
  CentralWorshipServiceCodeList,
  WorshipServiceCodeList,
} from '../constants/Classification';
import { CLASSIFICATION } from './administrative-unit-classification-code';
import Joi from 'joi';

export default class WorshipAdministrativeUnitModel extends AdministrativeUnitModel {
  @belongsTo('recognized-worship-type', {
    inverse: null,
    async: true,
  })
  recognizedWorshipType;

  @hasMany('minister-position', {
    inverse: 'worshipService',
    async: true,
    polymorphic: true,
    as: 'worship-administrative-unit',
  })
  ministerPositions;

  @hasMany('local-involvement', {
    inverse: 'worshipAdministrativeUnit',
    async: true,
    polymorphic: true,
    as: 'worship-administrative-unit',
  })
  involvements;

  get validationSchema() {
    const REQUIRED_MESSAGE = 'Selecteer een optie';
    return super.validationSchema.append({
      recognizedWorshipType: validateRequiredWhenClassificationId(
        [...WorshipServiceCodeList, ...CentralWorshipServiceCodeList],
        REQUIRED_MESSAGE,
      ),
      ministerPositions: validateHasManyOptional(),
      involvements: Joi.when(Joi.ref('$involvementsPercentage'), {
        is: Joi.exist().valid(true),
        then: Joi.array().external(async (_value, helpers) => {
          const involvements = await this.involvements;

          const sumPercentages = involvements.reduce(
            (percentageAcc, involvement) =>
              percentageAcc + Number(involvement.percentage),
            0,
          );

          if (Number.isNaN(sumPercentages) || sumPercentages !== 100) {
            return helpers.message(
              'Het totaal van alle percentages moet gelijk zijn aan 100',
            );
          }
        }),
        otherwise: validateHasManyOptional(),
      }),
    });
  }

  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get localInvolvementClassifications() {
    return [CLASSIFICATION.MUNICIPALITY.id, CLASSIFICATION.PROVINCE.id];
  }
}
