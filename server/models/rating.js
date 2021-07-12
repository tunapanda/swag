const { raw } = require('objection');
const Model = require('./_model');
const knex = require('../db/db');
const Trigger = require('./badge_triggers');
const Badges = require('./badges');
const awardsNotification = require('../utils/awards/awardsNotification');
const UserBadges = require('./user_badges');

class Rating extends Model {
  static get tableName() {
    return 'ratings';
  }

  static get relationMappings() {
    return {
      review: {
        relation: Model.HasOneRelation,
        modelClass: `${__dirname}/review`,
        join: {
          from: 'ratings.id',
          to: 'reviews.ratingId'
        }
      }
    };
  }

  async $afterInsert(queryContext) {
    // get total
    const results = await Rating.query(queryContext.transaction)
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

Rating.knex(knex);
module.exports = Rating;
