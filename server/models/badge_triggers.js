const Model = require('./_model');
const knex = require('../db/db');

class BadgeTriggers extends Model {
  static get tableName() {
    return 'badge_triggers';
  }

  static get virtualAttributes() {
    return ['type'];
  }

  type() {
    return 'badge_trigger';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: [],

      properties: {
        trigger: { type: 'string' },
        description: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    return {
      badges: {
        relation: Model.HasManyRelation,
        modelClass: __dirname + '/badges',
        join: {
          from: 'badges.trigger_id',
          to: 'badge_triggers.id'
        }
      }
    };
  }

  async $indexForSearch() {
    return null;
  }
  static get modifiers() {
    return {
      selectNameAndId: (builder) => {
        builder.select('id', 'trigger');
      }
    };
  }

}

BadgeTriggers.knex(knex);
module.exports = BadgeTriggers;
