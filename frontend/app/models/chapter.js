import DS from 'ember-data';
const { Model, attr, belongsTo } = DS;
import { hasMany } from 'ember-data/relationships';

export default class ChapterModel extends Model {
  @attr name;
  @attr slug;
  @attr description;
  @attr status;
  @attr contentType;
  @attr contentUri;
  @attr('boolean') approved;
  @attr('boolean') verified;
  @attr tags;
  @attr targetStatus;
  @attr imageUrl;
  @attr createdAt;
  @attr reaction;
  @attr authenticatedUser;
  @hasMany("comment") comments;

  @belongsTo("user") creator;
  // @belongsTo('lesson') lesson;
}
