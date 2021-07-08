const { faker, seed_number } = require('../_seeds');

exports.seed = async (knex) => {
  // Deletes ALL existing entries
  await knex('badges').del();

  const triggerIds = await knex('badge_triggers').pluck('id');

  return knex('users').pluck('id').then((userIds) => {
    const fakeBadges = [];
    for (let index = 0; index < seed_number; index++) {
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
        trigger_id: faker.random.arrayElement(triggerIds),
        published: faker.datatype.boolean(),
        frequency: faker.datatype.number(),
        reminder: faker.datatype.number(),
        reminder_message:  faker.lorem.sentence(),
      });
    }
    return knex('badges').insert(fakeBadges);
  });
};
