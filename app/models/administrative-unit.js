import { hasMany, belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';
import Joi from 'joi';
import {
  validateBelongsToOptional,
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
import { CLASSIFICATION_CODE } from './administrative-unit-classification-code';

export default class AdministrativeUnitModel extends OrganizationModel {
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
    polymorphic: true,
    as: 'administrative-unit',
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
      locatedWithin: validateBelongsToOptional(),
      governingBodies: validateHasManyOptional(),
      involvedBoards: validateHasManyOptional(),
      exactMatch: validateBelongsToOptional(),
      scope: validateBelongsToOptional(),
      kboOrganization: validateBelongsToOptional(),
      isAssociatedWith: validateRequiredWhenClassificationId(
        [
          ...WorshipServiceCodeList,
          ...CentralWorshipServiceCodeList,
          ...ApbCodeList,
        ],
        REQUIRED_MESSAGE,
      ),
      hasParticipants: validateRequiredWhenClassificationId(
        IGSCodeList,
        REQUIRED_MESSAGE,
      ),
      wasFoundedByOrganizations: Joi.when(
        // Note: For OCMW associations and PEVAs a founding organisation is
        // normally mandatory. But the available business data when onboarding
        // them was incomplete in this respect. Therefore, we opted to relax
        // this rule for the OCMW associations and PEVAs imported during the
        // onboarding. The `relaxMandatoryFoundingOrganization` option allows us
        // to specify that a founding organisation is not mandatory in, for
        // example, the edit core data form. Otherwise, the form validation
        // would prevent editing the core data of the imported organisations due
        // to the lack of founding organisation.
        Joi.ref('$relaxMandatoryFoundingOrganization'),
        {
          is: Joi.exist().valid(true),
          then: validateRequiredWhenClassificationId(
            [...AgbCodeList, ...ApbCodeList],
            REQUIRED_MESSAGE,
          ),
          otherwise: validateRequiredWhenClassificationId(
            [
              ...AgbCodeList,
              ...ApbCodeList,
              ...OcmwAssociationCodeList,
              ...PevaMunicipalityCodeList,
              ...PevaProvinceCodeList,
            ],
            REQUIRED_MESSAGE,
          ),
        },
      ),
      isSubOrganizationOf: validateRequiredWhenClassificationId(
        [
          ...AgbCodeList,
          ...ApbCodeList,
          ...IGSCodeList,
          ...PoliceZoneCodeList,
          ...AssistanceZoneCodeList,
        ],
        REQUIRED_MESSAGE,
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
    return this._hasClassificationId(MunicipalityCodeList);
  }

  get isProvince() {
    return this._hasClassificationId(ProvinceCodeList);
  }

  get isAgb() {
    return this._hasClassificationId(AgbCodeList);
  }

  get isApb() {
    return this._hasClassificationId(ApbCodeList);
  }

  get isIgs() {
    return this._hasClassificationId(IGSCodeList);
  }

  get isPoliceZone() {
    return this._hasClassificationId(PoliceZoneCodeList);
  }

  get isAssistanceZone() {
    return this._hasClassificationId(AssistanceZoneCodeList);
  }

  get isOCMW() {
    return this._hasClassificationId(OCMWCodeList);
  }

  get isOcmwAssociation() {
    return this._hasClassificationId(OcmwAssociationCodeList);
  }

  get isDistrict() {
    return this._hasClassificationId(DistrictCodeList);
  }

  get isPevaMunicipality() {
    return this._hasClassificationId(PevaMunicipalityCodeList);
  }

  get isPevaProvince() {
    return this._hasClassificationId(PevaProvinceCodeList);
  }

  get participantClassifications() {
    if (this.isIgs) {
      return [
        CLASSIFICATION_CODE.MUNICIPALITY,
        CLASSIFICATION_CODE.OCMW,
        CLASSIFICATION_CODE.AGB,
        CLASSIFICATION_CODE.PROJECTVERENIGING,
        CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
        CLASSIFICATION_CODE.POLICE_ZONE,
        CLASSIFICATION_CODE.ASSISTANCE_ZONE,
        CLASSIFICATION_CODE.PEVA_MUNICIPALITY,
        CLASSIFICATION_CODE.PEVA_PROVINCE,
        // TODO when onboarded, add companies
      ];
    } else if (this.isOcmwAssociation) {
      return OcmwAssociationCodeList.concat([
        CLASSIFICATION_CODE.MUNICIPALITY,
        CLASSIFICATION_CODE.OCMW,
      ]);
    } else if (this.isPevaMunicipality || this.isPevaProvince) {
      return [
        CLASSIFICATION_CODE.PROJECTVERENIGING,
        CLASSIFICATION_CODE.DIENSTVERLENENDE_VERENIGING,
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING,
        CLASSIFICATION_CODE.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME,
      ];
    }
    return [];
  }

  get founderClassifications() {
    if (
      this.isApb ||
      this.isAgb ||
      this.isPevaMunicipality ||
      this.isPevaProvince
    ) {
      return [CLASSIFICATION_CODE.MUNICIPALITY];
    } else if (this.isOcmwAssociation) {
      return OcmwAssociationCodeList.concat([
        CLASSIFICATION_CODE.MUNICIPALITY,
        CLASSIFICATION_CODE.OCMW,
      ]);
    }
    return [];
  }

  // Note: this is used in the new organization and edit core data forms. It
  // might be merged with the above founder getter once the relationships
  // between organizations have been sorted out.
  get municipalityClassificationCode() {
    return [CLASSIFICATION_CODE.MUNICIPALITY];
  }

  get requiresGoverningBodies() {
    return !(
      this.isAgb ||
      this.isApb ||
      this.isIgs ||
      this.isPoliceZone ||
      this.isAssistanceZone ||
      this.isOcmwAssociation ||
      this.isPevaMunicipality ||
      this.isPevaProvince ||
      this.isRepresentativeBody
    );
  }

  get requiresFunctionaries() {
    return !(
      this.isDistrict ||
      this.isWorshipAdministrativeUnit ||
      this.isPoliceZone ||
      this.isAssistanceZone ||
      this.isPevaMunicipality ||
      this.isPevaProvince ||
      this.isRepresentativeBody
    );
  }
}
