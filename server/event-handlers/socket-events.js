const jwToken = require('jsonwebtoken');

const {secret} = require('../middleware/jwt');
const { socketChannel, role} = require('../utils/socket-constants');
const {events} = require('../utils/socket-events');
const { socketEventEmitter } = require('../utils/event-emitter');

module.exports = (io) => {

  function initConnectedSocket(socket,payload) {
    if (!payload || !payload.token) {
      socket.join([socketChannel.anonymous, socketChannel.learners]);
      socket.data = {
        id: Math.random().toString(36).substr(2, 9),
        username: Math.random().toString(36).substr(2, 9),
        role: 'anonymous'
      };
      return;
    }

    const {exp, ...data} = jwToken.verify(payload.token, secret);
    if (exp < Date.now().valueOf() / 1000) {
      socket.join([socketChannel.anonymous, socketChannel.learners]);
      //push token expired event
      socket.emit(events.user.session.expired,{message:'You session has expired'});
      return;
    }

    socket.data = {
      id: data.data.id,
      username: data.data.username,
      role: data.data.role,
      expire: exp
    };

    if (data.data.role === role.moderator) {
      socket.join([socketChannel.moderators, socketChannel.learners, socketChannel.contentCreator]);
    } else if (data.data.role === role.admin) {
      socket.join([socketChannel.admins, socketChannel.learners, socketChannel.contentCreator]);
    } else {
      // basic users or anyone else not yet covered
      socket.join([socketChannel.anonymous, socketChannel.learners, socketChannel.contentCreator]);
    }

  }

  function socketsByUserId(userId) {
    if(!userId){
      return [];
    }

    return Array.from(io.sockets.sockets.values())
      .filter((socket)=>socket.data.id===userId);
  }

  function emitDataToUserId(userId,event,data) {
    if(!userId||!event){
      return false;
    }

    const sockets = socketsByUserId(userId);
    if(sockets && sockets.length>0){
      sockets.map((socket)=>socket.emit(event,data));
      return true;
    }
    return false;
  }

  io.on('connection', (socket) => {

    initConnectedSocket(socket,socket.handshake.auth);
    socket.on(events.user.account.roleChange, (payload) => {

      //remove user from all rooms/channels they are in first
      Array.from(socket.rooms).map((room)=>{
        if(room !==socket.id){
          socket.leave(room);
        }
      });
      //assign the user to the appropriate room
      initConnectedSocket(socket,payload);
    });


  });

  /**
   * On notification create, push it to the recipient
   */

  socketEventEmitter.on(events.user.notification.created,(notification)=>{
    let maxAttempts=3;
    const delayBeforeRetry=10000; //10 seconds

    (function x(){
      const sent =emitDataToUserId(notification.recipientId,events.user.notification.created,notification);
      if(!sent && maxAttempts>0){
        maxAttempts -= 1;
        setTimeout(x,delayBeforeRetry);
      }
    })();

  });


  /**
     * on chapter publish, push the update to all moderators
     */
  socketEventEmitter.on(events.user.chapter.published, (payload) => {
    io.to(socketChannel.moderators).emit(events.user.chapter.published, payload);
  });

  /**
     * on chapter delete, push the update to all learners
     */
  socketEventEmitter.on(events.user.chapter.deleted, (payload) => {
    io.to(socketChannel.learners).emit(events.user.chapter.deleted, payload);
  });

  /**
   * on comment, push the update to all learners
   */
  socketEventEmitter.on(events.user.comment.created, (payload) => {
    io.to(socketChannel.learners).emit(events.user.comment.created, payload);
  });
  return io;
};