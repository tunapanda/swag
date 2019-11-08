import DS from 'ember-data';
const { Model, attr } = DS;

export default class GroupModel extends Model {
  @attr() name;
  @attr() slug;
  @attr() description;
  @hasMany('user') members;
}
