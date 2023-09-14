import Model, { attr } from '@ember-data/model';

export const CHANGE_EVENT_TYPE = {
  NAME_CHANGE: '6651dc69b0ae8f7ff9974e8a23db1dec',
  IN_ONTBINDING: 'b85363df-b598-4a21-b8ae-0dea78db73cb',
  IN_VEREFFENING: 'e8dc166e-4769-4f28-bcf8-af2fb8cb7d15',
  ONTBONDEN_EN_VEREFFEND: 'b5f471a8-eb2e-4ec3-9f84-2c179134e2be',
  OPRICHTING: 'f0e2706a-3b64-4464-ad9c-4e65dc976288',
  AREA_DESCRIPTION_CHANGE: '9f19f14910245f9b14737f1f1a2067f2',
  RECOGNITION_NOT_GRANTED: '343a00884d012cee6915bc7559cd69ef',
  RECOGNITION_LIFTED: '4297bc56c1a874240e4566e2c5b8816f',
  RECOGNITION_REQUESTED: 'a61009aec1f7412685ecad01cefd7955',
  RECOGNITION_GRANTED: '3dd7550843eaf18e1fa1ca6c6c3f2610',
  MERGER: 'd7bbc0ea17fccf7ea35c552d757c905f',
  FUSIE: 'fa80032794c841ecac73ff874f856db1',
  SUSPENSION_OF_RECOGNITION: '24cb3991eab035c2cebd6f6334b3b67e',
  SANCTIONED: 'f23e035f1f4b197cbf78e049195f1883',
  CITY: 'e4c3d1ef-a34d-43b0-a18c-f4e60e2c8af3',
};

export const CHANGE_EVENTS_WORSHIP_SERVICE = [
  CHANGE_EVENT_TYPE.NAME_CHANGE,
  CHANGE_EVENT_TYPE.AREA_DESCRIPTION_CHANGE,
  CHANGE_EVENT_TYPE.RECOGNITION_NOT_GRANTED,
  CHANGE_EVENT_TYPE.RECOGNITION_LIFTED,
  CHANGE_EVENT_TYPE.RECOGNITION_REQUESTED,
  CHANGE_EVENT_TYPE.RECOGNITION_GRANTED,
  CHANGE_EVENT_TYPE.MERGER,
  CHANGE_EVENT_TYPE.SUSPENSION_OF_RECOGNITION,
  CHANGE_EVENT_TYPE.SANCTIONED,
];

export const CHANGE_EVENTS_CENTRAL_WORSHIP_SERVICE = [
  CHANGE_EVENT_TYPE.AREA_DESCRIPTION_CHANGE,
  CHANGE_EVENT_TYPE.RECOGNITION_LIFTED,
  CHANGE_EVENT_TYPE.RECOGNITION_GRANTED,
  CHANGE_EVENT_TYPE.MERGER,
];

export const CHANGE_EVENTS_MUNICIPALITY = [
  CHANGE_EVENT_TYPE.NAME_CHANGE,
  CHANGE_EVENT_TYPE.CITY,
];

export const CHANGE_EVENTS_OCMW = [CHANGE_EVENT_TYPE.NAME_CHANGE];
export const CHANGE_EVENTS_AGB_APB = [
  CHANGE_EVENT_TYPE.NAME_CHANGE,
  CHANGE_EVENT_TYPE.IN_ONTBINDING,
  CHANGE_EVENT_TYPE.OPRICHTING,
  CHANGE_EVENT_TYPE.IN_VEREFFENING,
  CHANGE_EVENT_TYPE.ONTBONDEN_EN_VEREFFEND,
];

export const CHANGE_EVENTS_DISTRICT = [CHANGE_EVENT_TYPE.NAME_CHANGE];

export const CHANGE_EVENTS_IGS = [
  CHANGE_EVENT_TYPE.OPRICHTING,
  CHANGE_EVENT_TYPE.NAME_CHANGE,
  CHANGE_EVENT_TYPE.IN_ONTBINDING,
  CHANGE_EVENT_TYPE.IN_VEREFFENING,
  CHANGE_EVENT_TYPE.ONTBONDEN_EN_VEREFFEND,
  CHANGE_EVENT_TYPE.FUSIE,
];

export default class ChangeEventTypeModel extends Model {
  @attr label;
}
