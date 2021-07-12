const Model = require('./_model');
const knex = require('../db/db');
const chapterSchema = require('../db/json_schema/chapterSchema');
const search = require('../utils/search');

const { raw } = require('objection');
const Trigger = require('./badge_triggers');
const Badges = require('./badges');
const awardsNotification = require('../utils/awards/awardsNotification');
const UserBadges = require('./user_badges');

class Chapter extends Model {
  static get tableName() {
    return 'chapters';
  }

  static get jsonSchema() {
    return chapterSchema;
  }

  static get relationMappings() {
    return {
      lesson: {
        relation: Model.BelongsToOneRelation,
        modelClass: __dirname + '/lesson',
        join: {
          from: 'chapters.lesson_id',
          to: 'lessons.id'
        }
      },
      comment: {
        relation: Model.HasManyRelation,
        modelClass: __dirname + '/comment',
        join: {
          from: 'chapters.id',
          to: 'comments.chapterId'
        }
      },
      flag: {
        relation: Model.HasManyRelation,
        modelClass: __dirname + '/flag',
        join: {
          from: 'chapters.id',
          to: 'flags.chapterId'
        }
      },
      achievement: {
        relation: Model.HasManyRelation,
        modelClass: __dirname + '/achievement',
        join: {
          from: 'chapters.id',
          to: 'achievements.target'
        }
      },
      rating: {
        relation: Model.HasManyRelation,
        modelClass: __dirname + '/rating',
        join: {
          from: 'chapters.id',
          to: 'ratings.chapterId'
        }
      },
      reaction: {
        relation: Model.HasManyRelation,
        modelClass: __dirname + '/reaction',
        join: {
          from: 'chapters.id',
          to: 'reactions.chapterId'
        }
      },
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: __dirname + '/user',
        join: {
          from: 'chapters.creatorId',
          to: 'users.id'
        }
      }
    };
  }

  async $indexForSearch() {
    return search.index({
      index: search.indexName,
      id: this.id,
      body: {
        model: 'chapter',
        name: this.name,
        description: this.description,
        content: '',
        tags: this.tags,
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

  async $afterUpdate(queryContext) {
    // get total
    const results = await Chapter.query(queryContext.transaction)
      .select([
        raw('COUNT(CASE WHEN approved =\'true\' THEN 1 ELSE NULL END) as "totalapproved"'),
        raw('COUNT(CASE WHEN status <> \'published\' THEN 1 ELSE NULL END) as "totalpublished"')
      ])
      .where('creator_id', this.creatorId);

    const badgesIds = await knex('user_badges').where('user_id', this.creatorId).pluck('badge_id');

    if (this.approved) {
      const chapter_approved = await Trigger.query().where({ name: 'comment_create' }).returning('id');
      const chapter_approved_badge = await Badges.query().where('trigger_id', chapter_approved[0].id);

      for (const badge of chapter_approved_badge) {
        if (!badgesIds.includes(badge.id) || results[0].totalapproved === badge.frequency & results[0].totalapproved > 0) {
          await UserBadges.query()
            .insert({ 'user_id': this.creatorId, 'badge_id': badge.id })
            .returning(['user_id']);
          awardsNotification(badge, 'chapter_published');
        }
      }
    } else if (this.published) {
      const chapter_published = await Trigger.query().where({ name: 'comment_create' }).returning('id');
      const chapter_published_badge = await Badges.query().where('trigger_id', chapter_published[0].id);

      for (const badge of chapter_published_badge) {
        if (!badgesIds.includes(badge.id) || results[0].totalpublished === badge.frequency & results[0].totalpublished > 0) {
          this.title = `'${this.name}' has been published`;
          await UserBadges.query()
            .insert({ 'user_id': this.creatorId, 'badge_id': badge.id })
            .returning(['user_id']);
          awardsNotification(badge, 'chapter_published');
        }
      }
    }
  }
}

Chapter.knex(knex);
module.exports = Chapter;
