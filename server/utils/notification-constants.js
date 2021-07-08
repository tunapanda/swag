exports.notificationTypes = {
  password: {
    resetRequested: 'password.resetStart',
    resetSuccessful: 'password.resetDone',
  },
  account: {
    registered: 'account.signup',
    authenticated: 'account.login',
    roleChange: 'role.updated',
    connected: 'account.connected',
    accountUpdated: 'account.updated',
  },
  session: {
    updated: 'session.updated',
    expired: 'session.expired',
  },
  chapter: {
    created: 'chapter.created',
    updated: 'chapter.updated',
    deleted: 'chapter.deleted',

    published: 'chapter.published',
    approved: 'chapter.approved',
    verified: 'chapter.verified',
  },
  reaction: {
    deleted: 'rating.deleted',
    created: 'rating.created',
  },
  rating: {
    deleted: 'rating.deleted',
    created: 'rating.created',
  },
  review: {
    deleted: 'review.deleted',
    created: 'review.created',
  },
  comment: {
    created: 'comment.created',
    updated: 'comment.updated',
    deleted: 'comment.deleted',
    replied: 'comment.replied',
  },
  survey: {
    created: 'survey.created',
    updated: 'survey.updated',
    deleted: 'survey.deleted',
    filled: 'survey.filled',
  },
  contentEngagement: {
    started: 'chapter.attempted',
    completed: 'chapter.completed',
  },
  badge: {
    unlocked: 'badge.unlocked', //unlocked after X triggers on an action
    assigned: 'badge.assigned', //by another user
    revoked: 'badge.revoked',
    created: 'badge.created',
    updated: 'badge.updated',
    deleted: 'badge.deleted',
  },
};