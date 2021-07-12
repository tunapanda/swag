const Model = require('./_model');
const knex = require('../db/db');

const { raw } = require('objection');
const Trigger = require('./badge_triggers');
const Badges = require('./badges');
const awardsNotification = require('../utils/awards/awardsNotification');
const UserBadges = require('./user_badges');
class Reaction extends Model {
  static get tableName() {
    return 'reactions';
  }

  static get relationMappings() {
    return {};
  }

  static get modifiers() {
    return {
      selectReaction: (builder) => {
        builder.select('id', 'reaction', 'user_id').groupBy('reactions.id');
      },
      filterUser(query, chapter_id, user_id) {
        query.select('id').where({'chapter_id': chapter_id, 'user_id': user_id}).groupBy('reactions.id');
      },
      reactionAggregate: (builder) => {
        builder.select(raw('COUNT(*) AS total_likes, COUNT(CASE WHEN reaction = \'like\' THEN 1 ELSE NULL END) AS likes, COUNT(CASE WHEN reaction = \'dislike\' THEN 1 ELSE NULL END) AS dislikes')).groupBy('reactions.chapter_id');
      },
      selectReactionsWithUser: (builder, creator_id, chapter_id) => {
        builder.select(raw('COUNT(*) AS total_likes, COUNT(CASE WHEN reaction = \'like\' THEN 1 ELSE NULL END) AS likes, COUNT(CASE WHEN reaction = \'dislike\' THEN 1 ELSE NULL END) AS dislikes, (select reaction where user_id = ? and chapter_id = ?) as authenticated_user', [creator_id, chapter_id])).groupBy('reactions.reaction','reactions.chapter_id', 'reactions.user_id');
      },
    };
  }

  async $afterInsert(queryContext) {
    // get total
    const results = await Reaction.query(queryContext.transaction)
      .select([
        raw('COUNT(CASE WHEN reaction =\'like\' THEN 1 ELSE NULL END) as "totallikes"'),
        raw('COUNT(CASE WHEN status <> \'published\' THEN 1 ELSE NULL END) as "totaldislikes"')
      ])
      .where('user_id', this.creatorId, 'is_deleted', false);

    const badgesIds = await knex('user_badges').where('user_id', this.creatorId).pluck('badge_id');

    const reaction_created = await Trigger.query().where({ name: 'reaction_create' }).returning('id');
    const reaction_created_badge = await Badges.query().where('trigger_id', reaction_created[0].id);

    for (const badge of reaction_created_badge) {
      if (!badgesIds.includes(badge.id) || results[0].totallikes === badge.frequency & results[0].totallikes > 0) {
        await UserBadges.query()
          .insert({ 'user_id': this.creatorId, 'badge_id': badge.id })
          .returning(['user_id']);
        awardsNotification(badge, 'reaction_create');
      } else if (!badgesIds.includes(badge.id) || results[0].totaldislikes === badge.frequency & results[0].totaldislikes > 0) {
        await UserBadges.query()
          .insert({ 'user_id': this.creatorId, 'badge_id': badge.id })
          .returning(['user_id']);
        awardsNotification(badge, 'reaction_create');
      }
    }
  }
}

Reaction.knex(knex);
module.exports = Reaction;