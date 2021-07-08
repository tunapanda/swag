const Model = require('./_model');
const knex = require('../db/db');
const {socketEventEmitter} = require('../utils/event-emitter');
const {events} = require('../utils/socket-events');
class Notification extends Model {
  static get tableName() {
    return 'notifications';
  }

  static get relationMappings() {
    return {
      recipient: {
        relation: Model.BelongsToOneRelation,
        modelClass: `${__dirname}/user`,
        join: {
          from: 'notifications.recipient_id',
          to: 'users.id',
        }
      }
    };
  }

  async $afterInsert(){
    await super.$afterInsert();
    socketEventEmitter.emit(events.user.notification.created,this);
  }
}

Notification.knex(knex);
module.exports = Notification;
