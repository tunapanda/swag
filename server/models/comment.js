const Model = require('./_model');
const knex = require('../db/db');
const { SHooksEventEmitter } = require('../utils/event-emitter');
const { events } = require('../utils/storage-hooks-events');

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
    await super.$afterInsert(queryContext);

    if ((this.parentId === 'false' || !this.parentId) && SHooksEventEmitter.listenerCount(events.user.comment.countOnCreate) > 0) {
      const results = await Comment.query(queryContext.transaction)
        .count('id')
        .where('parent_id', 'false')
        .where('creator_id', this.creatorId);

      SHooksEventEmitter.emit(events.user.comment.countOnCreate, {
        total: results[0].count,
        creatorId: this.creatorId
      });
    }
    if (this.parentId && this.parentId !== 'false' && SHooksEventEmitter.listenerCount(events.user.reply.countOnCreate) > 0) {
      const results = await Comment.query(queryContext.transaction)
        .count('id')
        .whereNot('parent_id', 'false')
        .where('creator_id', this.creatorId);

      SHooksEventEmitter.emit(events.user.reply.countOnCreate, {
        total: results[0].count,
        creatorId: this.creatorId
      });
    }
  }
}

Comment.knex(knex);
module.exports = Comment;
