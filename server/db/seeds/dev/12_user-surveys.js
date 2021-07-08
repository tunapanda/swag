const {faker, seed_number} = require('../_seeds');
const UserSurveyModel = require('../../../models/user-survey');
const SurveyModel = require('../../../models/survey');
const UserModel = require('../../../models/user');

exports.seed = async (knex)=>{
  // Deletes ALL existing entries
  await knex(UserSurveyModel.tableName).del();

  const userIds = await knex(UserModel.tableName).pluck('id');
  const surveyIds = await knex(SurveyModel.tableName).pluck('id');
  
  const userSurveys=[];

  for (let index = 0; index < seed_number; index++) {

    userSurveys.push({
      survey_id: faker.random.arrayElement(surveyIds),
      user_id: faker.random.arrayElement(userIds),
      filled: faker.random.arrayElement([null,faker.date.past()]),
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
    });
  }

  // Inserts seed entries
  return knex(UserSurveyModel.tableName).insert(userSurveys);
};


