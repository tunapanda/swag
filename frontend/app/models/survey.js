import Model, { attr, belongsTo } from '@ember-data/model';

export default class SurveyModel extends Model {
  @attr({ defaultValue: 'mne' }) surveyType;
  @attr name;
  @attr status;
  @attr description;
  @attr expiry;
  @attr surveyEmbed;
  @attr('number', { defaultValue: 10 }) frequency;
  @attr() triggerId;
  @attr() createdAt;
  @attr('date') updatedAt;
  @belongsTo('user') creator;
}
