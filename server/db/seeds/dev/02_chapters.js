const {faker, seed_number} = require('../_seeds');
const reviewQuestions = require('../../../utils/review-questions');

exports.seed = function (knex) {
  // Deletes ALL existing entries
  return knex('lesson_chapters').del()
    .then(() => knex('chapters').del())
    .then(() => {
      return knex('users').pluck('id').then((userIds) => {
        const fakeChapters = [];
        const reviewQuestionsCategories = reviewQuestions.map((question) => question.category);
        for (let index = 0; index < seed_number; index++) {
          const name = faker.lorem.words();
          const slug = faker.helpers.slugify(name);
          const status = ['published', 'draft', 'archived'];
          const tags = ['internet basics', 'content creation', 'digital wellness', 'data protection and privacy',
            'online safety', 'relationships and communications', 'news and media literacy', 'online working',
            'online learning', 'life skills', 'health', 'digital financial literacy'];

          const chapterId = ['chapter1', 'chapter2'];
          fakeChapters.push({
            name: name,
            slug: slug,
            description: faker.lorem.paragraph(),
            lesson_id: 'lesson1',
            content_type: 'h5p',
            image_url: faker.image.imageUrl(328, 200, 'business', true, false),
            status: faker.random.arrayElement(status),
            content_uri: `/uploads/h5p/${faker.random.arrayElement(chapterId)}`,
            creator_id: faker.random.arrayElement(userIds),
            created_at: faker.date.past(),
            updated_at: faker.date.recent(),
            tags: faker.random.arrayElements(tags, faker.datatype.number({'min': 1, 'max': 6})),
            approved: faker.datatype.boolean(),
            verified: faker.datatype.boolean(),
            review_questions: faker.random.arrayElements(reviewQuestionsCategories, 4)
          });
        }
        fakeChapters.push({
          id: 'chapter1',
          name: 'A Chapter',
          slug: 'a-chapter',
          description: 'An H5P Chapter.',
          status: 'published',
          lesson_id: 'lesson1',
          creator_id: 'user1',
          content_type: 'h5p',
          content_uri: '/uploads/h5p/chapter1',
          created_at: '2017-12-20 19:17:10',
          updated_at: '2017-12-20 19:17:10',
          approved: true,
          verified: true,
          tags: ['highschool', 'university'],
        },
        {
          id: 'chapter2',
          name: 'Kelley',
          slug: 'Elisa',
          description: 'consectetur',
          creator_id: 'user1',
          status: 'published',
          lesson_id: 'basics1',
          content_type: 'h5p',
          content_uri: '/uploads/h5p/chapter1',
          created_at: '2017-12-20 19:17:10',
          updated_at: '2017-12-20 19:17:10',
          approved: true,
          verified: false,
          tags: ['highschool', 'university'],
        },
        {
          id: 'chapter3',
          name: 'Ethel',
          slug: 'Tonya',
          description: 'cupidatat',
          creator_id: 'user1',
          status: 'published',
          lesson_id: 'basics2',
          content_type: 'h5p',
          content_uri: '/uploads/h5p/chapter1',
          created_at: '2017-12-20 19:17:10',
          updated_at: '2017-12-20 19:17:10',
          tags: ['university'],
          approved: true,
          verified: false,
        },
        {
          id: 'chapter4',
          name: 'Montoya',
          slug: 'Myra',
          description: 'qui',
          status: 'published',
          creator_id: 'user1',
          lesson_id: 'basics2',
          content_type: 'h5p',
          content_uri: '/uploads/h5p/chapter1',
          created_at: '2017-12-20 19:17:10',
          updated_at: '2017-12-20 19:17:10',
          approved: true,
          verified: true,
          tags: ['highschool', 'university'],
        },
        {
          id: 'chapter5',
          name: 'Montoya',
          slug: 'Myra',
          creator_id: 'user1',
          description: 'qui',
          status: 'published',
          lesson_id: 'basics2',
          content_type: 'h5p',
          content_uri: '/uploads/h5p/chapter1',
          created_at: '2017-12-20 19:17:10',
          updated_at: '2017-12-20 19:17:10',
          approved: true,
          verified: false,
          tags: ['primary', 'university'],
        });
        // Inserts seed entries
        return knex('chapters').insert(fakeChapters);
      });
    });
};
