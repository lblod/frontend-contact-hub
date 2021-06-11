import Model, { attr, hasMany} from '@ember-data/model';

export default class PersonModel extends Model {
    @attr givenName;
    @attr familyName;
    @attr firstNameUsed;
    @hasMany('mandatory') mandatories;
}
