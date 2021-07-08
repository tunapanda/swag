/**
 * Storage Hook Event code format: [actor].[resource].[action]
 */
exports.events = {
  user: {
    chapter: {
      countOnCreate: 'user.chapter.countOnCreate',
      countOnPublished: 'user.chapter.countOnPublished',
      countOnApproved: 'user.chapter.countOnApproved',
      countOnShare: 'user.chapter.countOnShare',
      countOnInteractionAttempt: 'user.chapter.countOnAttempt',
      countOnInteractionComplete: 'user.chapter.countOnComplete',
    },
    comment: {
      countOnCreate: 'user.comment.countOnCreate',
      countOnUpdate: 'user.comment.countOnUpdate',
    },
    reply: {
      countOnCreate: 'user.reply.countOnCreate',
    },
    session: {
      countOnLogin: 'user.account.countOnLogin',
    },
    rating: {
      countOnCreate: 'user.rating.countOnCreate',
    },
    reaction: {
      countOnCreate: 'user.reaction.countOnCreate',
    }
  }
};
