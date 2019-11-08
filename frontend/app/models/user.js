import Model from 'ember-data/model';
import attr from 'ember-data/attr'

export default class UserModel extends Model {
  @attr() username;
  @attr() email;
  @attr() password;
  @hasMany('group') groups;
  @hasMany('activity') activities;
  @hasMany('achievement') achievements;
  @hasMany('course') enrolledCourses;
}
