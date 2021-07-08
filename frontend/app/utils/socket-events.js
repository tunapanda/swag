/**
 * Socket Event code format: [actor].[resource].[action]
 */
const events = {
  user: {
    password: {
      resetRequested: 'user.password.resetStart',
      resetSuccessful: 'user.password.resetDone',
    },
    account: {
      registered: 'user.account.signup',
      authenticated: 'user.account.login',
      roleChange: 'user.role.updated',
      connected: 'user.account.connected',
      accountUpdated: 'user.account.updated',
    },
    session: {
      updated: 'user.session.updated',
      expired: 'user.session.expired',
    },
    chapter: {
      created: 'user.chapter.created',
      updated: 'user.chapter.updated',
      deleted: 'user.chapter.deleted',

      published: 'user.chapter.published',
      approved: 'user.chapter.approved',
      verified: 'user.chapter.verified',
    },
    reaction: {
      liked: 'user.chapter.liked',
      disliked: 'user.chapter.disliked',
    },
    rating: {
      deleted: 'user.rating.deleted',
      created: 'user.rating.created',
    },
    review: {
      deleted: 'user.review.deleted',
      created: 'user.review.created',
    },
    comment: {
      created: 'user.comment.created',
      updated: 'user.comment.updated',
      deleted: 'user.comment.deleted',
      replied: 'user.comment.replied',
    },
    survey: {
      created: 'user.survey.created',
      updated: 'user.survey.updated',
      deleted: 'user.survey.deleted',
      filled: 'user.survey.filled',
    },
    contentEngagement: {
      started: 'user.chapter.attempted',
      completed: 'user.chapter.completed',
    },
    badge: {
      unlocked: 'user.badge.unlocked', //unlocked after X triggers on an action
      assigned: 'user.badge.assigned', //by another user
      revoked: 'user.badge.revoked',
      created: 'user.badge.created',
      updated: 'user.badge.updated',
      deleted: 'user.badge.deleted',
    },
    notification: {
      created: 'user.notification.created',
      deleted: 'user.notification.deleted',
      updated: 'user.notification.updated',
    },
  },
};
export { events };
