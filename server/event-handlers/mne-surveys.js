const { raw } = require('objection');

const SurveyModel = require('../models/survey');
const NotificationModel = require('../models/notification');
const UserSurveyModel = require('../models/user-survey');
const { notificationTypes } = require('../utils/notification-constants');
const { events } = require('../utils/storage-hooks-events');
const { SHooksEventEmitter } = require('../utils/event-emitter');

module.exports = () => {

  const surveyStatus = {
    published: 'Active',
    unpublished: 'Pending',
    archived: 'Archived',
  };

  const triggers = {
    learner: {
      chapter: {
        approved: 'chapter_approved',
        published: 'chapter_publish',
        completed: 'chapter_completed',
        attempted: 'chapter_attempted',
      },
      comment: {
        create: 'comment_create',
        reply: 'comment_reply',
      },
      reaction: {
        create: 'reaction_create',
      },
      rating: {
        create: 'rating_create'
      }
    }
  };

  /**
     * On Chapter Approved
     */
  SHooksEventEmitter.on(events.user.chapter.countOnApproved, async (payload) => {
    const surveys = await SurveyModel.query()
      .where('frequency', payload.total)
      .where('status', surveyStatus.published)
      .where('surveyType', 'mne') //is default now.Future: there can be dedicated table of survey types.
      .where('expiry', '>=', raw('now()')) // can do for now..(_region difference challenge_)
      .withGraphJoined('trigger')
      .where('trigger.name', triggers.learner.chapter.approved)
      .withGraphJoined('respondents')
      .where((builder) => {
        builder.where('respondents.userId', '<>', payload.creatorId)
          .orWhereNull('respondents.userId');
      });


    for (let i = 0; i < surveys.length; i++) {
      //add a notification
      await NotificationModel.query()
        .insert({
          title: 'We\'d love to hear your thoughts',
          body: surveys[i].name,
          itemId: surveys[i].id,
          eventType: notificationTypes.chapter.approved,
          model: 'survey',
          recipientId: payload.creatorId,
          read: false,
          metadata: { sendEmail: false },
        });
      await UserSurveyModel.query()
        .insert({
          surveyId: surveys[i].id,
          userId: payload.creatorId
        });
    }

  });

  /**
     * On chapter published
     */
  SHooksEventEmitter.on(events.user.chapter.countOnPublished, async (payload) => {
    const surveys = await SurveyModel.query()
      .where('frequency', payload.total)
      .where('status', surveyStatus.published)
      .where('surveyType', 'mne') //is default now.Future: there can be dedicated table of survey types.
      .where('expiry', '>=', raw('now()')) // can do for now..(_region difference challenge_)
      .withGraphJoined('trigger')
      .where('trigger.name', triggers.learner.chapter.published)
      .withGraphJoined('respondents')
      .where((builder) => {
        builder.where('respondents.userId', '<>', payload.creatorId)
          .orWhereNull('respondents.userId');
      });


    for (let i = 0; i < surveys.length; i++) {
      //add a notification
      await NotificationModel.query()
        .insert({
          title: 'We\'d love to hear your thoughts',
          body: surveys[i].name,
          itemId: surveys[i].id,
          eventType: notificationTypes.chapter.published,
          model: 'survey',
          recipientId: payload.creatorId,
          read: false,
          metadata: { sendEmail: false },
        });
      await UserSurveyModel.query()
        .insert({
          surveyId: surveys[i].id,
          userId: payload.creatorId
        });
    }

  });
  /**
     * On Comment create
     */

  SHooksEventEmitter.on(events.user.comment.countOnCreate, async (payload) => {
    const surveys = await SurveyModel.query()
      .where('frequency', payload.total)
      .where('status', surveyStatus.published)
      .where('surveyType', 'mne')
      .where('expiry', '>=', raw('now()'))
      .withGraphJoined('trigger')
      .where('trigger.name', triggers.learner.comment.create)
      .withGraphJoined('respondents')
      .where((builder) => {
        builder.where('respondents.userId', '<>', payload.creatorId)
          .orWhereNull('respondents.userId');
      });

    for (let i = 0; i < surveys.length; i++) {
      //add a notification
      await NotificationModel.query()
        .insert({
          title: 'We\'d love to hear your thoughts',
          body: surveys[i].name,
          itemId: surveys[i].id,
          model: 'survey',
          eventType: notificationTypes.comment.created,
          recipientId: payload.creatorId,
          read: false,
          metadata: { sendEmail: false },
        });

      await UserSurveyModel.query()
        .insert({
          surveyId: surveys[i].id,
          userId: payload.creatorId
        });
    }


  });

  /**
   * On Reply create
   */
  SHooksEventEmitter.on(events.user.reply.countOnCreate, async (payload) => {

    const surveys = await SurveyModel.query()
      .where('frequency', payload.total)
      .where('status', surveyStatus.published)
      .where('surveyType', 'mne')
      .where('expiry', '>=', raw('now()'))
      .withGraphJoined('trigger')
      .where('trigger.name', triggers.learner.comment.reply)
      .withGraphJoined('respondents')
      .where((builder) => {
        builder.where('respondents.userId', '<>', payload.creatorId)
          .orWhereNull('respondents.userId');
      });

    for (let i = 0; i < surveys.length; i++) {
      //add a notification
      await NotificationModel.query()
        .insert({
          title: 'We\'d love to hear your thoughts',
          body: surveys[i].name,
          itemId: surveys[i].id,
          model: 'survey',
          eventType: notificationTypes.comment.replied,
          recipientId: payload.creatorId,
          read: false,
          metadata: { sendEmail: false },
        });

      await UserSurveyModel.query()
        .insert({
          surveyId: surveys[i].id,
          userId: payload.creatorId
        });
    }

  });

  /**
     * On reaction created
     */
  SHooksEventEmitter.on(events.user.reaction.countOnCreate, async (payload) => {
    const surveys = await SurveyModel.query()
      .where('frequency', payload.totalReactions)
      .where('surveyType', 'mne')
      .where('status', surveyStatus.published)
      .where('expiry', '>=', raw('now()'))
      .withGraphJoined('trigger')
      .where('trigger.name', triggers.learner.reaction.create)
      .withGraphJoined('respondents')
      .where((builder) => {
        builder.where('respondents.userId', '<>', payload.creatorId)
          .orWhereNull('respondents.userId');
      });

    for (let i = 0; i < surveys.length; i++) {
      //add a notification
      await NotificationModel.query()
        .insert({
          title: 'We\'d love to hear your thoughts',
          body: surveys[i].name,
          itemId: surveys[i].id,
          model: 'survey',
          eventType: notificationTypes.reaction.created,
          recipientId: payload.creatorId,
          read: false,
          metadata: { sendEmail: false },
        });

      await UserSurveyModel.query()
        .insert({
          surveyId: surveys[i].id,
          userId: payload.creatorId
        });
    }
  });

  /**
     * On ratings created
     */
  SHooksEventEmitter.on(events.user.rating.countOnCreate, async (payload) => {

    const surveys = await SurveyModel.query()
      .where('frequency', payload.totalRatings)
      .where('surveyType', 'mne')
      .where('status', surveyStatus.published)
      .where('expiry', '>=', raw('now()'))
      .withGraphJoined('trigger')
      .where('trigger.name', triggers.learner.rating.create)
      .withGraphJoined('respondents')
      .where((builder) => {
        builder.where('respondents.userId', '<>', payload.creatorId)
          .orWhereNull('respondents.userId');
      });

    for (let i = 0; i < surveys.length; i++) {
      //add a notification
      await NotificationModel.query()
        .insert({
          title: 'We\'d love to hear your thoughts',
          body: surveys[i].name,
          itemId: surveys[i].id,
          eventType: notificationTypes.rating.created,
          model: 'survey',
          recipientId: payload.creatorId,
          read: false,
          metadata: { sendEmail: false },
        });

      await UserSurveyModel.query()
        .insert({
          surveyId: surveys[i].id,
          userId: payload.creatorId
        });
    }

  });


  /**
     * On chapter attempted
     */
  SHooksEventEmitter.on(events.user.chapter.countOnInteractionAttempt, async (payload) => {

    const surveys = await SurveyModel.query()
      .where('frequency', payload.total)
      .where('surveyType', 'mne')
      .where('status', surveyStatus.published)
      .where('expiry', '>=', raw('now()'))
      .withGraphJoined('trigger')
      .where('trigger.name', triggers.learner.chapter.attempted)
      .withGraphJoined('respondents')
      .where((builder) => {
        builder.where('respondents.userId', '<>', payload.creatorId)
          .orWhereNull('respondents.userId');
      });

    for (let i = 0; i < surveys.length; i++) {
      //add a notification
      await NotificationModel.query()
        .insert({
          title: 'We\'d love to hear your thoughts',
          body: surveys[i].name,
          itemId: surveys[i].id,
          eventType: notificationTypes.contentEngagement.started,
          model: 'survey',
          recipientId: payload.creatorId,
          read: false,
          metadata: { sendEmail: false },
        });

      await UserSurveyModel.query()
        .insert({
          surveyId: surveys[i].id,
          userId: payload.creatorId
        });
    }

  });

  /**
     * On chapter completed
     */
  SHooksEventEmitter.on(events.user.chapter.countOnInteractionComplete, async (payload) => {

    const surveys = await SurveyModel.query()
      .where('frequency', payload.total)
      .where('surveyType', 'mne')
      .where('status', surveyStatus.published)
      .where('expiry', '>=', raw('now()'))
      .withGraphJoined('trigger')
      .where('trigger.name', triggers.learner.chapter.completed)
      .withGraphJoined('respondents')
      .where((builder) => {
        builder.where('respondents.userId', '<>', payload.creatorId)
          .orWhereNull('respondents.userId');
      });

    for (let i = 0; i < surveys.length; i++) {
      //add a notification
      await NotificationModel.query()
        .insert({
          title: 'We\'d love to hear your thoughts',
          body: surveys[i].name,
          itemId: surveys[i].id,
          eventType: notificationTypes.contentEngagement.completed,
          model: 'survey',
          recipientId: payload.creatorId,
          read: false,
          metadata: { sendEmail: false },
        });

      await UserSurveyModel.query()
        .insert({
          surveyId: surveys[i].id,
          userId: payload.creatorId
        });
    }

  });



};