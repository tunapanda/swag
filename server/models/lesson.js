const Model = require('./_model');
const knex = require('../db/db');
const search = require('../utils/search');
const modelSchema = require('../db/json_schema/modelSchema');

class Lesson extends Model {
  static get tableName() {
    return 'lessons';
  }

  static get jsonSchema() {
    return modelSchema;
  }

  static get relationMappings() {
    return {
      chapters: {
        relation: Model.ManyToManyRelation,
        modelClass: __dirname + '/chapter',
        join: {
          from: 'lessons.id',
          through: {
            from: 'lesson_chapters.lesson_id',
            to: 'lesson_chapters.chapter_id'
          },
          to: 'chapters.id'
        }
      }
    };
  }

  async $indexForSearch() {
    return search.index({
      index: search.indexName,
      id: this.id,
      body: {
        model: 'lesson',
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
        builder.select('id', 'name');
      }
    };
  }
}

Lesson.knex(knex);
module.exports = Lesson;
