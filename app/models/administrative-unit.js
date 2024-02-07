import { hasMany, belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';
import Joi from 'joi';
import {
  validateBelongsToOptional,
  validateBelongsToRequired,
  validateHasManyOptional,
  validateRequiredWhenClassificationId,
} from '../validators/schema';
import {
  AgbCodeList,
  ApbCodeList,
  AssistanceZoneCodeList,
  CentralWorshipServiceCodeList,
  DistrictCodeList,
  IGSCodeList,
  MunicipalityCodeList,
  OcmwAssociationCodeList,
  OCMWCodeList,
  PoliceZoneCodeList,
  ProvinceCodeList,
  WorshipServiceCodeList,
  PevaMunicipalityCodeList,
  PevaProvinceCodeList,
} from '../constants/Classification';

export default class AdministrativeUnitModel extends OrganizationModel {
  @belongsTo('administrative-unit-classification-code', {
    inverse: null,
    async: true,
  })
  classification;

  @belongsTo('location', {
    inverse: 'administrativeUnits',
    async: true,
    polymorphic: true,
    as: 'administrative-unit',
  })
  locatedWithin;

  @hasMany('governing-body', {
    inverse: 'administrativeUnit',
    async: true,
    polymorphic: true,
    as: 'administrative-unit',
  })
  governingBodies;

  @hasMany('local-involvement', {
    inverse: 'administrativeUnit',
    async: true,
  })
  involvedBoards;

  @belongsTo('concept', {
    inverse: null,
    async: true,
  })
  exactMatch;

  @belongsTo('location', {
    inverse: null,
    async: true,
  })
  scope;

  get validationSchema() {
    const REQUIRED_MESSAGE = 'Selecteer een optie';
    return super.validationSchema.append({
      classification: validateBelongsToRequired(REQUIRED_MESSAGE),
      locatedWithin: validateBelongsToOptional(),
      governingBodies: validateHasManyOptional(),
      involvedBoards: validateHasManyOptional(),
      exactMatch: validateBelongsToOptional(),
      scope: validateBelongsToOptional(),
      isAssociatedWith: validateRequiredWhenClassificationId(
        [
          ...WorshipServiceCodeList,
          ...CentralWorshipServiceCodeList,
          ...ApbCodeList,
        ],
        REQUIRED_MESSAGE
      ),
      hasParticipants: validateRequiredWhenClassificationId(
        IGSCodeList,
        REQUIRED_MESSAGE
      ),
      wasFoundedByOrganizations: validateRequiredWhenClassificationId(
        [
          ...AgbCodeList,
          ...ApbCodeList,
          ...OcmwAssociationCodeList,
          ...PevaMunicipalityCodeList,
          ...PevaProvinceCodeList,
        ],
        REQUIRED_MESSAGE
      ),
      isSubOrganizationOf: validateRequiredWhenClassificationId(
        [
          ...AgbCodeList,
          ...ApbCodeList,
          ...IGSCodeList,
          ...PoliceZoneCodeList,
          ...AssistanceZoneCodeList,
        ],
        REQUIRED_MESSAGE
      ),
      expectedEndDate: Joi.when('classification.id', {
        is: Joi.exist().valid(...IGSCodeList),
        then: Joi.date()
          .allow(null)
          .min(new Date())
          .messages({ '*': 'De datum mag niet in het verleden liggen' }),
        otherwise: Joi.optional(),
      }),
    });
  }

  get isMunicipality() {
    return this.#hasClassificationId(MunicipalityCodeList);
  }

  get isProvince() {
    return this.#hasClassificationId(ProvinceCodeList);
  }

  get isAgb() {
    return this.#hasClassificationId(AgbCodeList);
  }

  get isApb() {
    return this.#hasClassificationId(ApbCodeList);
  }

  get isIgs() {
    return this.#hasClassificationId(IGSCodeList);
  }

  get isPoliceZone() {
    return this.#hasClassificationId(PoliceZoneCodeList);
  }

  get isAssistanceZone() {
    return this.#hasClassificationId(AssistanceZoneCodeList);
  }

  get isWorshipAdministrativeUnit() {
    return this.isWorshipService || this.isCentralWorshipService;
  }

  get isWorshipService() {
    return this.#hasClassificationId(WorshipServiceCodeList);
  }

  get isCentralWorshipService() {
    return this.#hasClassificationId(CentralWorshipServiceCodeList);
  }

  get isOCMW() {
    return this.#hasClassificationId(OCMWCodeList);
  }

  get isOcmwAssociation() {
    return this.#hasClassificationId(OcmwAssociationCodeList);
  }

  get isDistrict() {
    return this.#hasClassificationId(DistrictCodeList);
  }

  get isPevaMunicipality() {
    return this.#hasClassificationId(PevaMunicipalityCodeList);
  }

  get isPevaProvince() {
    return this.#hasClassificationId(PevaProvinceCodeList);
  }

  #hasClassificationId(classificationIds) {
    return classificationIds.includes(this.classification?.get('id'));
  }
}
