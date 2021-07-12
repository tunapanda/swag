const Model = require('./_model');
const knex = require('../db/db');

const { raw } = require('objection');
const Trigger = require('./badge_triggers');
const Badges = require('./badges');
const awardsNotification = require('../utils/awards/awardsNotification');
const UserBadges = require('./user_badges');
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
    // get total
    const results = await Achievement.query(queryContext.transaction)
      .select([
        raw('COUNT(CASE WHEN target_status =\'completed\' THEN 1 ELSE NULL END) as "totalcompleted"'),
        raw('COUNT(CASE WHEN target_status <> \'attempted\' THEN 1 ELSE NULL END) as "totalattempted"')
      ])
      .where('user_id', this.creatorId);

    const badgesIds = await knex('user_badges').where('user_id', this.creatorId).pluck('badge_id');

    const chapter_completed = await Trigger.query().where({ name: 'chapter_completed' }).returning('id');
    const chapter_completed_badge = await Badges.query().where('trigger_id', chapter_completed[0].id);

    for (const badge of chapter_completed_badge) {
      if (!badgesIds.includes(badge.id) || results[0].totalcompleted === badge.frequency & results[0].totalcompleted > 0) {
        await UserBadges.query()
          .insert({ 'user_id': this.creatorId, 'badge_id': badge.id })
          .returning(['user_id']);
        awardsNotification(badge, 'chapter_completed');
      }
    }

    const chapter_attempted = await Trigger.query().where({ name: 'chapter_attempted' }).returning('id');
    const chapter_attempted_badge = await Badges.query().where('trigger_id', chapter_attempted[0].id);

    for (const badge of chapter_attempted_badge) {
      if (!badgesIds.includes(badge.id) || results[0].totalattempted === badge.frequency & results[0].totalattempted > 0) {
        await UserBadges.query()
          .insert({ 'user_id': this.creatorId, 'badge_id': badge.id })
          .returning(['user_id']);
        awardsNotification(badge, 'chapter_attempted');
      }
    }
  }
}

Achievement.knex(knex);
module.exports = Achievement;
