import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;

export default class ChapterModel extends Model {
  @attr name;
  @attr slug;
  @attr description;
  @attr status;
  @attr contentType;
  @attr contentUri;
  @attr approved;
  @attr targetStatus;

  @belongsTo('user') creator;
  @belongsTo('lesson') lesson;
}
