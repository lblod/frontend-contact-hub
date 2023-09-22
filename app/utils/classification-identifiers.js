import { CLASSIFICATION } from 'frontend-organization-portal/models/administrative-unit-classification-code';

export function selectByRole(hasWorshipRole) {
  if (hasWorshipRole) {
    return `${CLASSIFICATION.CENTRAL_WORSHIP_SERVICE.id},
          ${CLASSIFICATION.WORSHIP_SERVICE.id},
        `;
  } else {
    return `${CLASSIFICATION.AGB.id},
          ${CLASSIFICATION.APB.id},
          ${CLASSIFICATION.MUNICIPALITY.id},
          ${CLASSIFICATION.PROVINCE.id},
          ${CLASSIFICATION.OCMW.id},
          ${CLASSIFICATION.DISTRICT.id},
          ${CLASSIFICATION.PROJECTVERENIGING.id},
          ${CLASSIFICATION.DIENSTVERLENENDE_VERENIGING.id},
          ${CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING.id},
          ${CLASSIFICATION.OPDRACHTHOUDENDE_VERENIGING_MET_PRIVATE_DEELNAME.id},
          ${CLASSIFICATION.POLICE_ZONE.id},
          ${CLASSIFICATION.ASSISTANCE_ZONE.id},
        `;
  }
}
