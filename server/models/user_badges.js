const Model = require('./_model');
const knex = require('../db/db');

class UserBadges extends Model {
  static get tableName() {
    return 'user_badges';
  }

  async $indexForSearch() {
    return null;
  }

  static get modifiers() {
    return {
      selectNameAndId: (builder) => {
        builder.select('users.id', 'name');
      }
    };
  }
}

UserBadges.knex(knex);
module.exports = UserBadges;
