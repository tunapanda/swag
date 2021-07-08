import Service, { inject as service } from '@ember/service';
import { io } from 'socket.io-client';
import { events } from '../utils/socket-events';

export default class SocketService extends Service {
  @service session;
  @service me;
  @service store;
  @service infinity;

  socket = io({
    auth: { token: this.session?.data?.authenticated?.token },
  });

  eventHandlers() {
    /**
     *On  chapter comment created
     */
    this.socket.on(events.user.comment.created, (comment) => {
      setTimeout(async () => {
        const obj = await this.store.peekRecord('comment', comment.id);
        if (!obj) {
          this.store.pushPayload({ comment: comment });
        }
      }, 3000);
    });

    /**
     *On notification created
     */
    this.socket.on(events.user.notification.created, (notification) => {
      setTimeout(async () => {
        const obj = await this.store.peekRecord(
          'notification',
          notification.id
        );
        if (!obj) {
          this.store.pushPayload({ notification: notification });
        }
      }, 3000);
    });
  }

  /**
   * called when user role changes (on app visit, login, or logout)
   *  TODO: role modification(not implemented) event by admin should be pushed from the server (also not implemented)
   */
  roleChanged() {
    this.socket.emit(events.user.account.roleChange, {
      token: this.session?.data?.authenticated?.token,
    });
  }
}
