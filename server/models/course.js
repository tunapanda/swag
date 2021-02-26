const Model = require('./_model');
const knex = require('../db/db');
const modelSchema = require('../db/json_schema/modelSchema');
const search = require('../utils/search');

class Course extends Model {
  static get tableName() {
    return 'courses';
  }

  static get jsonSchema() {
    return modelSchema;
  }

  // get $virtualFields() {
  //   return [{type: 'course'}];
  // }

  static get virtualAttributes() {
    return ['type'];
  }

  type() {
    return 'course';
  }

  static get relationMappings() {
    return {
      modules: {
        relation: Model.ManyToManyRelation,
        modelClass: __dirname + '/module',
        join: {
          from: 'courses.id',
          through: {
            from: 'course_modules.course_id',
            to: 'course_modules.module_id'
          },
          to: 'modules.id'
        }
      },
      enrollments: {
        relation: Model.HasManyRelation,
        modelClass: __dirname + '/enrollment',
        join: {
          to: 'courses.id',
          from: 'enrollments.courseId'
        }
      }
    };
  }

  async $indexForSearch() {
    return search.index({
      index: search.indexName,
      id: this.id,
      body: {
        model: 'course',
        name: this.name,
        description: this.description,
        status: this.status,
        created_at: this.createdAt,
        modified_at: this.modifiedAt
      }
    });
  }

  static get modifiers() {
    return {
      selectNameAndId: (builder) => {
        builder.select('courses.id', 'name');
      }
    };
  }
}

Course.knex(knex);
module.exports = Course;
