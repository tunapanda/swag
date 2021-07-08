const {idGenerator} = require('../id_generator');

exports.up = (knex) => {
  return knex.schema
    .raw(idGenerator)
    .createTable('surveys', table => {
      table.text('id').primary().notNullable().defaultTo(knex.raw('next_id()'));
      table.text('survey_type').defaultTo('mne');
      table.text('name').notNullable();
      table.text('status').defaultTo('published');
      table.text('description');
      table.dateTime('expiry');
      table.text('survey_embed');
      table.integer('frequency').defaultTo(1);
      table.text('trigger_id').references('badge_triggers.id').onDelete('SET NULL');
      table.text('creator_id').references('users.id').onDelete('SET NULL');
      table.timestamps();

    });


};

exports.down = (knex) => {
  return knex.schema
    .dropTableIfExists('surveys');
};
