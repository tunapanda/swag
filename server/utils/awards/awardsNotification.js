const Notifications = require('../../models/notification');

module.exports = async function (params, event_type) {
  const data = {
    title: params.title,
    body: params.description,
    event_type: event_type,
    creator_id: params.creator_id,
    recipient_id: params.creator_id
  };

  await Notifications.query().insert(data);
  return 0;
};
