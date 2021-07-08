const {faker} = require('../_seeds');
const TriggersModel = require('../../../models/triggers');

exports.seed = async (knex)=>{
  // Deletes ALL existing entries
  await knex(TriggersModel.tableName).del();

  const actionTriggers = [];
  const triggers = [ 'chapter_publish','chapter_approved', 'comment_create','comment_reply',
    'reaction_create','rating_create'];

  for (let index = 0; index < triggers.length; index++) {
    actionTriggers.push({
      description: faker.lorem.words(),
      name: triggers[index]
    });
  }

  // Inserts seed entries
  return knex(TriggersModel.tableName).insert(actionTriggers);
};


