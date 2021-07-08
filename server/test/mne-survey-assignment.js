const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiJSON = require('chai-json-schema');
const knex = require('../db/db');
const triggerModel = require('../models/triggers');
const userModel = require('../models/user');
const surveyModel = require('../models/survey');
const chapterModel = require('../models/chapter');
const commentModel = require('../models/comment');
const reactionModel = require('../models/reaction');
const ratingModel = require('../models/rating');
const { socketEventEmitter } = require('../utils/event-emitter');
const { events } = require('../utils/socket-events');
const { notificationTypes } = require('../utils/notification-constants');
chai.use(chaiHttp);
chai.use(chaiJSON);
chai.should();



describe('Monitoring & Evaluation Survey Assignment', () => {

  before(async () => {

    await knex.migrate.rollback(); //reset tables
    await knex.migrate.latest(); // rerun the migrations
    //seed users & triggers only
    await knex.seed.run({
      specific: '01_users.js'
    });
    await knex.seed.run({
      specific: '10_triggers.js'
    });
    //seed survey with predictable data
    const triggers = await knex(triggerModel.tableName).select('id');
    const userIds = await knex(userModel.tableName).select('id');
    const surveyStatus = {
      published: 'Active',
      unpublished: 'Pending',
      archived: 'Archived',
    };
    const surveys = [];
    for (let i = 0; i < triggers.length; i++) {
      surveys.push({
        survey_type: 'mne',
        name: `Test ${i}`,
        status: surveyStatus.published,
        expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        survey_embed: '<iframe>fake iframe</iframe>',
        frequency: 1,
        trigger_id: triggers[i].id,
        creator_id: userIds[0].id,
      });
    }
    await knex(surveyModel.tableName).insert(surveys);
  });


  async function createChapter() {
    await knex(chapterModel.tableName).delete();
    const userIds = await knex(userModel.tableName).select('id');

    const chapter = {
      name: 'This is us on bottom',
      description: 'test',
      approved: false,
      status: 'draft',
      creatorId: userIds[0].id
    };
    return await chapterModel.query().insertAndFetch(chapter);
  }

  it('Should assign survey on publishing a chapter', async () => {

    const chapter = await createChapter();

    await chapterModel.query()
      .patchAndFetchById(chapter.id, {
        status: 'published'
      });

    return new Promise(((resolve, reject) => {
      socketEventEmitter.on(events.user.notification.created, (model) => {
        if (model.eventType === notificationTypes.chapter.published) {
          resolve(true);
        } else {
          reject('Invalid notification type');
        }
      });
    }));

  });

  it('Should assign survey on chapter approval', async () => {

    const chapter = await createChapter();

    await chapterModel.query()
      .patchAndFetchById(chapter.id, {
        approved: true,
        status: 'published'
      });

    return new Promise(((resolve, reject) => {
      socketEventEmitter.on(events.user.notification.created, (model) => {
        if (model.eventType === notificationTypes.chapter.approved) {
          resolve(true);
        } else {
          reject('Invalid notification type');
        }
      });
    }));

  });

  it('Should assign survey on chapter comment created', async () => {

    const chapter = await createChapter();
    const userIds = await knex(userModel.tableName).select('id');

    await commentModel.query()
      .insert({
        chapterId: chapter.id,
        comment: 'Test comment',
        creatorId: userIds[0].id,
      });

    return new Promise(((resolve, reject) => {
      socketEventEmitter.on(events.user.notification.created, (model) => {
        if (model.eventType === notificationTypes.comment.created) {
          resolve(true);
        } else {
          reject('Invalid notification type');
        }
      });
    }));

  });

  it('Should assign survey on comment reply created', async () => {

    const chapter = await createChapter();
    const userIds = await knex(userModel.tableName).select('id');
    const commentIds = await knex(commentModel.tableName).select('id')
      .where('parent_id', 'false');

    await commentModel.query()
      .insert({
        chapterId: chapter.id,
        comment: 'Test reply',
        parentId: commentIds[0] ? commentIds[0].id : 'follow',
        creatorId: userIds[0].id,
      });

    return new Promise(((resolve, reject) => {
      socketEventEmitter.on(events.user.notification.created, (model) => {
        if (model.eventType === notificationTypes.comment.replied) {
          resolve(true);
        } else {
          reject('Invalid notification type');
        }
      });
    }));

  });

  it('Should assign survey on chapter reaction created', async () => {

    const chapter = await createChapter();
    const userIds = await knex(userModel.tableName).select('id');

    await reactionModel.query()
      .insert({
        chapterId: chapter.id,
        reaction: 'like',
        userId: userIds[0].id,
      });

    return new Promise(((resolve, reject) => {
      socketEventEmitter.on(events.user.notification.created, (model) => {
        if (model.eventType === notificationTypes.reaction.created) {
          resolve(true);
        } else {
          reject('Invalid notification type');
        }
      });
    }));

  });

  it('Should assign survey on chapter rating created', async () => {

    const chapter = await createChapter();
    const userIds = await knex(userModel.tableName).select('id');

    await ratingModel.query()
      .insert({
        chapterId: chapter.id,
        userId: userIds[0].id,
        averageRating: 10,
        reaction: 'like',
        isDeleted: false,
      });

    return new Promise((resolve => {
      socketEventEmitter.on(events.user.notification.created, () => {
        resolve(false);
      });
    }));

  });

  after(async () => {
    await knex.migrate.latest();
    return await knex.seed.run();
  });
});