const Model = require('./_model');
const knex = require('../db/db');

class LearningPath extends Model {
  static get tableName() {
    return 'learning_paths';
  }

  static get relationMappings() {
    return {
      courses: {
        relation: Model.ManyToManyRelation,
        modelClass: __dirname + '/course',
        join: {
          from: 'learning_paths.id',
          through: {
            from: 'learning_path_courses.learning_path_id',
            to: 'learning_path_courses.course_id'
          },
          to: 'courses.id'
        }
      }
    };
  }
}

LearningPath.knex(knex);
module.exports = LearningPath;
