const { faker } = require('../_seeds');

exports.seed = async (knex) => {
  // Deletes ALL existing entries
  await knex('badges').del();
  await knex('badge_triggers').del();

  const fakeBadgeTriggers = [];
  const triggers = ['chapter_create', 'chapter_publish', 'comment_create','comment_reply'];

  for (let index = 0; index < triggers.length; index++) {
    fakeBadgeTriggers.push({
      description: faker.lorem.words(),
      name: triggers[index]
    });
  }
  await knex('badge_triggers').insert(fakeBadgeTriggers);

  const triggerIds = await knex('badge_triggers').pluck('id');

  return knex('users').pluck('id').then((userIds) => {
    const fakeBadges = [];
    for (let index = 0; index < triggerIds.length; index++) {
      const name = faker.lorem.words();
      const slug = faker.helpers.slugify(name);
      fakeBadges.push({
        name: name,
        slug: slug,
        points: 10,
        description: faker.lorem.paragraph(),
        badge_uri: faker.image.imageUrl(328, 200, 'business', true, false),
        creator_id: faker.random.arrayElement(userIds),
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
        expiry: faker.date.between(faker.date.past(), faker.date.soon()),
        is_deleted: faker.datatype.boolean(),
        trigger_id: triggerIds[index],
        published: faker.datatype.boolean(),
        frequency: faker.datatype.number(2,9),
        reminder: faker.datatype.number(2, 9),
        reminder_message:  faker.lorem.sentence(),
      });
    }
    return knex('badges').insert(fakeBadges);
  });
};
