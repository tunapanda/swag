const Model = require('./_model');
const knex = require('../db/db');
const {SHooksEventEmitter} = require('../utils/event-emitter');
const {events} = require('../utils/storage-hooks-events');


class Rating extends Model {
  static get tableName() {
    return 'ratings';
  }

  static  get relationMappings(){
    return {
      review:{
        relation: Model.HasOneRelation,
        modelClass:`${__dirname}/review`,
        join: {
          from: 'ratings.id',
          to: 'reviews.ratingId'
        }
      }
    };
  }

  async  $afterInsert(queryContext) {
    await super. $afterInsert(queryContext);

    if(SHooksEventEmitter.listenerCount(events.user.rating.countOnCreate)>0) {
      
      // get total
      const results = await Rating.query(queryContext.transaction)
        .count('id')
        .where('user_id', this.userId);

      SHooksEventEmitter.emit(events.user.rating.countOnCreate, {
        totalRatings: results[0].count,
        creatorId: this.userId
      });
    }
  }

}

Rating.knex(knex);
module.exports = Rating;
