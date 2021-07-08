const {faker, seed_number} = require('../_seeds');
const SurveyModel = require('../../../models/survey');
const TriggersModel = require('../../../models/triggers');
const UserModel = require('../../../models/user');

exports.seed = async (knex)=>{
  // Deletes ALL existing entries
  await knex( SurveyModel.tableName).del();

  const userIds = await knex(UserModel.tableName).pluck('id');
  const triggersId = await knex(TriggersModel.tableName).pluck('id');
  
  const surveys=[];
  
  const surveyTypes=['mne'];
  const surveyStatuses=['Active','Pending','Archived'];
  const sampleSurveyEmbed= '<iframe src="https://docs.google.com/forms/d/e/1FAIpQLSfGyOtXfOoUt9J4R_Ft-wPsd5UbT' +
    'bFmBaa6GUBibzLzQFY4QQ/viewform?embedded=true" width="640" height="585" frameborder="0" marginheight="0" ' +
    'marginwidth="0">Loading…</iframe>';
  
  for (let index = 0; index < seed_number; index++) {

    surveys.push({
      survey_type: faker.random.arrayElement(surveyTypes),
      name: faker.company.bs(),
      status: faker.random.arrayElement(surveyStatuses),
      description: faker.lorem.sentence(),
      expiry: faker.date.soon(365),
      survey_embed: sampleSurveyEmbed,
      frequency: faker.datatype.number({min:5, max:10}),
      trigger_id: faker.random.arrayElement(triggersId),
      creator_id: faker.random.arrayElement(userIds),
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
    });
  }

  // Inserts seed entries
  return knex(SurveyModel.tableName).insert(surveys);
};


