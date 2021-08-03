import { hasMany, belongsTo } from '@ember-data/model';
import OrganizationModel from './organization';

export default class AdministrativeUnitModel extends OrganizationModel {
  @belongsTo('administrative-unit-classification-code') classification;
  @belongsTo('location', { inverse: 'administrativeUnit' }) scope;
  @hasMany('governing-body', { inverse: 'administrativeUnit' }) governingBodies;
}
