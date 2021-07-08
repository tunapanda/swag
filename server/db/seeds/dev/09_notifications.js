const {faker, seed_number} = require('../_seeds');
const {notificationTypes} = require('./../../../utils/notification-constants');
const ChapterModel = require('../../../models/chapter');
const RatingModel = require('../../../models/rating');
const CommentModel = require('../../../models/comment');

exports.seed = async (knex)=>{
  // Deletes ALL existing entries
  await knex('notifications').del();

  const userIds = await knex('users').pluck('id');

  const comments = await CommentModel.query().select('id', 'chapter_id');

  const ratings = await RatingModel.query()
    .select('id', 'chapter_id', 'reaction')
    .where('is_deleted', false);

  const chapters = await ChapterModel.query()
    .select('id', 'approved', 'verified', 'creator_id');

  /**
             * seed distribution: 1/4 -comments, 1/4 -ratings, 1/4 - approved chapters, 1/4- verified chapters
             */

  const maxSeed = Math.floor(seed_number / 4);

  //paint the comments (maxSeed only) with chapter creator Id & other notification properties
  const notificationComments = comments.slice(0, maxSeed) //we only need a portion
    .map((comment) => {
      const chapter = chapters.find((p) => p.id === comment.chapterId);
      const event_type = comment.parent_id === 'false' ?
        notificationTypes.comment.created :
        notificationTypes.comment.replied;

      return {
        title: 'Your chapter just received a new comment',
        body: faker.lorem.words(),
        item_id: chapter.id,
        event_type,
        model: 'comment',
        recipient_id: chapter.creatorId,
        read: faker.datatype.boolean(),
        creator_id: faker.random.arrayElement(userIds),
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
      };
    });


  //paint the ratings notifications with chapter creator Id & other notification properties

  const notificationRatings = ratings.slice(0, maxSeed) //we only need a portion
    .map((rating) => {
      const chapter = chapters.find((p) => p.id === rating.chapterId);

      return {
        title: 'User rated your chapter ' + faker.random.arrayElement(['🎆', '🎉', '✳']),
        body: faker.lorem.words(),
        item_id: chapter.id,
        event_type:notificationTypes.rating.created,
        model: 'rating',
        recipient_id: chapter.creatorId,
        read: faker.datatype.boolean(),
        creator_id: faker.random.arrayElement(userIds),
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
      };
    });

  const approvedChapters = chapters.filter((c) => c.approved === true);

  const approvedChaptersNotifications = approvedChapters.slice(0, maxSeed)
    .map((chapter) => {
      return {
        title: 'Your chapter has been approved',
        body: faker.lorem.words(),
        item_id: chapter.id,
        event_type: notificationTypes.chapter.approved,
        model: 'chapter',
        recipient_id: chapter.creatorId,
        read: faker.datatype.boolean(),
        metadata: { sendEmail: faker.datatype.boolean() },
        creator_id: faker.random.arrayElement(userIds),
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
      };
    });


  const verifiedChapters = chapters.filter((c) => c.verified === true);

  const verifiedChaptersNotifications = verifiedChapters.slice(0, maxSeed)
    .map((chapter) => {
      return {
        title: 'Your chapter has been verified',
        body: faker.lorem.words(),
        item_id: chapter.id,
        event_type: notificationTypes.chapter.verified,
        model: 'chapter',
        recipient_id: chapter.creatorId,
        read: faker.datatype.boolean(),
        metadata: { sendEmail: faker.datatype.boolean() },
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
      };
    });

  const notifications = [...notificationComments, ...notificationRatings,
    ...approvedChaptersNotifications, ...verifiedChaptersNotifications];

  // Inserts seed entries
  return knex('notifications').insert(notifications);
};
