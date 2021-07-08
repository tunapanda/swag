const Model = require('./_model');
const knex = require('../db/db');

class Survey extends Model {
  static get tableName() {
    return 'surveys';
  }

  static get relationMappings() {
    return {
      trigger: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/badge_triggers`,
        join: {
          from: 'surveys.trigger_id',
          to: 'badge_triggers.id'
        }
      },
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/users`,
        join: {
          from: 'surveys.creator_id',
          to: 'users.id'
        }
      },
      respondents: {
        relation: Model.HasManyRelation,
        modelClass: `${__dirname}/user-survey`,
        join: {
          from: 'surveys.id',
          to: 'user_surveys.survey_id'
        }
      },
    };
  }
}

Survey.knex(knex);
module.exports = Survey;
