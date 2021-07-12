const { raw } = require('objection');
const Model = require('./_model');
const knex = require('../db/db');
const Trigger = require('./badge_triggers');
const Badges = require('./badges');
const UserBadges = require('./user_badges');
const awardsNotification = require('../utils/awards/awardsNotification');

class Comment extends Model {
  static get tableName() {
    return 'comments';
  }

  static get virtualAttributes() {
    return ['type'];
  }

  type() {
    return 'comment';
  }

  static get jsonSchema() {
    return {
      'type': 'object',
      'properties': {
        'id': { 'type': 'string' },
        'chapterId': { 'type': 'string' },
        'creatorId': { 'type': 'string' },
        'comment': { 'type': 'string' }
      },
      'required': ['chapterId', 'creatorId', 'comment'],
    };
  }

  static get relationMappings() {
    return {
      replies: {
        relation: Model.ManyToManyRelation,
        modelClass: Comment,
        join: {
          from: 'comments.id',
          through: {
            from: 'parent_child_comments.parentId',
            to: 'parent_child_comments.childId'
          },
          to: 'comments.id'
        }
      },
      children: {
        relation: Model.HasManyRelation,
        modelClass: Comment,
        join: {
          from: 'comments.id',
          to: 'comments.parentId'
        }
      },
      parent: {
        relation: Model.ManyToManyRelation,
        modelClass: Comment,
        join: {
          from: 'comments.id',
          through: {
            from: 'parent_child_comments.childId',
            to: 'parent_child_comments.parentId'
          },
          to: 'comments.id'
        }
      }
    };
  }

  static get modifiers() {
    return {
      selectComment: (builder) => {
        builder.select('id', 'creator_id', 'chapter_id', 'comment', 'createdAt', 'updatedAt');
      }
    };
  }

  async $afterInsert(queryContext) {
    // get total
    const results = await Comment.query(queryContext.transaction)
      .select([
        raw('COUNT(CASE WHEN parent_id =\'false\' THEN 1 ELSE NULL END) as "totalcomments"'),
        raw('COUNT(CASE WHEN parent_id <> \'false\' THEN 1 ELSE NULL END) as "totalreplies"')
      ])
      .where('creator_id', this.creatorId);

    const badgesIds = await knex('user_badges').where('user_id', this.creatorId).pluck('badge_id');

    console.log(results[0].totalreplies, results[0].totalcomments, badgesIds);
    try {
      const comment_create = await Trigger.query().where({ name: 'comment_create' }).returning('id');
      const comment_create_badges = await Badges.query().where('trigger_id', comment_create[0].id);

      for (const badge of comment_create_badges) {
        if (!badgesIds.includes(badge.id) || results[0].totalcomments === badge.frequency & results[0].totalcomments > 0) {
          await UserBadges.query()
            .insert({ 'user_id': this.creatorId, 'badge_id': badge.id })
            .returning(['user_id']);
          awardsNotification(await this.comment(badge));
        }
      }

      const comment_reply = await Trigger.query().where({ name: 'comment_reply' }).returning('id');
      const comment_reply_badges = await Badges.query().where('trigger_id', comment_reply[0].id);

      for (const badge of comment_reply_badges) {
        if (!badgesIds.includes(badge.id) || results[0].totalreplies === badge.frequency & results[0].totalreplies > 0) {
          await UserBadges.query()
            .insert({ 'user_id': this.creatorId, 'badge_id': badge.id })
            .returning(['user_id']);
          awardsNotification(badge, 'comment creation');
        }
      }
    } catch (error) {
      console.log(error.constraint);
    }
  }
}

Comment.knex(knex);
module.exports = Comment;
