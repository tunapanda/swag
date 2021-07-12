
exports.up = knex =>
  knex.schema
    .createTable('user_badges', table => {
      table.text('user_id')
        .references('users.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE');
      table.text('badge_id')
        .references('badges.id')
        .onDelete('SET NULL')
        .onUpdate('CASCADE');
      table.timestamps();
      table.primary(['user_id', 'badge_id']);
    });

exports.down = knex =>
  knex.schema
    .dropTableIfExists('user_badges');
