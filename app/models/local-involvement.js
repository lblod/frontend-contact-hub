import { attr, belongsTo } from '@ember-data/model';
import AbstractValidationModel from './abstract-validation-model';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateBelongsToRequired,
} from '../validators/schema';
import { INVOLVEMENT_TYPE } from './involvement-type';

export default class LocalInvolvementModel extends AbstractValidationModel {
  @attr('number') percentage;

  @belongsTo('administrative-unit', {
    inverse: 'involvedBoards',
    async: true,
    polymorphic: true,
    as: 'local-involvement',
  })
  administrativeUnit;

  @belongsTo('involvement-type', {
    inverse: null,
    async: true,
  })
  involvementType;

  @belongsTo('worship-administrative-unit', {
    inverse: 'involvements',
    async: true,
    polymorphic: true,
    as: 'local-involvement',
  })
  worshipAdministrativeUnit;

  get validationSchema() {
    return Joi.object({
      administrativeUnit: validateBelongsToRequired(
        'Selecteer een lokaal bestuur',
      ),
      involvementType: validateBelongsToRequired(
        'Selecteer een type betrokkenheid',
      ).external(async (value, helpers) => {
        const administrativeUnit = await this.administrativeUnit;
        if (
          administrativeUnit.isProvince &&
          value.id === INVOLVEMENT_TYPE.ADVISORY
        ) {
          return helpers.message(
            'Adviserend is geen geldige keuze voor een provincie',
          );
        }

        const existsOtherSupervisory =
          await this.existsOtherSupervisoryLocalInvolvement();

        // Is there already a supervisory local involvement?
        if (this.isSupervisory && existsOtherSupervisory) {
          return helpers.message(
            'Er kan slechts één gemeente- of provincieoverheid optreden als hoofdtoezichthouder',
          );
        }
        // Is there at least one supervisory local involvement?
        if (!(this.isSupervisory || existsOtherSupervisory)) {
          return helpers.message(
            'U dient een toezichthoudende overheid aan te duiden',
          );
        }

        return value;
      }),
      percentage: Joi.when('involvementType.id', {
        is: Joi.exist().valid(
          INVOLVEMENT_TYPE.SUPERVISORY,
          INVOLVEMENT_TYPE.MID_FINANCIAL,
        ),
        then: Joi.number().min(1).max(100).required(),
        // TODO: enforce it is zero in this case?
        otherwise: Joi.number().empty('').allow(null),
      }).messages({
        'any.required': 'Vul het percentage in',
        'number.base': 'Vul het percentage in',
        'number.min': 'Het percentage moet groter zijn dan 0',
        'number.max': 'Het percentage mag niet groter zijn dan 100',
      }),
      worshipAdministrativeUnit: validateBelongsToOptional(),
    });
  }

  get isSupervisory() {
    return this.#hasInvolvementTypeId(INVOLVEMENT_TYPE.SUPERVISORY);
  }

  get isMidFinancial() {
    return this.#hasInvolvementTypeId(INVOLVEMENT_TYPE.MID_FINANCIAL);
  }

  get isAdvisory() {
    return this.#hasInvolvementTypeId(INVOLVEMENT_TYPE.ADVISORY);
  }

  #hasInvolvementTypeId(classificationId) {
    return this.involvementType?.get('id') === classificationId;
  }

  /**
   * Check whether there is already a supervisory local involvement for the
   * associated worship administrative unit.
   * @returns {Promise<Boolean>} True if there is already a supervisory local
   *     involvement, false otherwise.
   */
  async existsOtherSupervisoryLocalInvolvement() {
    return (await this.getOtherLocalInvolvements()).some(
      (elem) => elem.isSupervisory,
    );
  }

  /**
   * Retrieve all local involvements relating to the same organization.
   * @returns {Promise<A[LocalInvolvementModel>} All local involvements relating
   *     to the same organization as the this local involvement.
   */
  async getOtherLocalInvolvements() {
    const worshipAdministrativeUnit = await this.worshipAdministrativeUnit;
    const relatedLocalInvolvements =
      await worshipAdministrativeUnit.involvements;

    // Note: do not filter on id as this also deals with unsaved elements that
    // do not have an id yet.
    return relatedLocalInvolvements.filter((elem) => elem !== this);
  }
}
