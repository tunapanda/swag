const {idGenerator} = require('../id_generator');

exports.up = (knex) => {
  return knex.schema
    .raw(idGenerator)
    .createTable('user_surveys', table => {
      table.text('id').primary().notNullable().defaultTo(knex.raw('next_id()'));
      table.text('survey_id').references('surveys.id').onDelete('SET NULL');
      table.text('user_id').references('users.id').onDelete('CASCADE');
      table.dateTime('filled');
      table.timestamps();
    });


};

exports.down = (knex) => {
  return knex.schema
    .dropTableIfExists('user_surveys');
};
