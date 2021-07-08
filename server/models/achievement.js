const Model = require('./_model');
const knex = require('../db/db');
const { SHooksEventEmitter } = require('../utils/event-emitter');
const { events } = require('../utils/storage-hooks-events');


class Achievement extends Model {
  static get tableName() {
    return 'achievements';
  }

  static get relationMappings() {
    return {};
  }

  static get virtualAttributes() {
    return ['type'];
  }

  type() {
    return 'achievement';
  }

  static get modifiers() {
    return {
      selectAchievement: (builder) => {
        builder.select('id', 'target', 'target_status');
      }
    };
  }

  async $afterInsert(queryContext) {
    await super.$afterInsert(queryContext);

    if (this.targetStatus === 'attempted' &&
      SHooksEventEmitter.listenerCount(events.user.chapter.countOnInteractionAttempt) > 0) {
      // get total
      const results = await Achievement.query(queryContext.transaction)
        .count('id')
        .where('target_status', 'attempted')
        .where('user_id', this.userId);

      SHooksEventEmitter.emit(events.user.chapter.countOnInteractionAttempt, {
        total: results[0].count,
        creatorId: this.userId
      });
    }

    if (this.targetStatus === 'completed' &&
      SHooksEventEmitter.listenerCount(events.user.chapter.countOnInteractionComplete) > 0) {
      // get total
      const results = await Achievement.query(queryContext.transaction)
        .count('id')
        .where('target_status', 'completed')
        .where('user_id', this.userId);

      SHooksEventEmitter.emit(events.user.chapter.countOnInteractionComplete, {
        total: results[0].count,
        creatorId: this.userId
      });
    }
  }
}

Achievement.knex(knex);
module.exports = Achievement;
