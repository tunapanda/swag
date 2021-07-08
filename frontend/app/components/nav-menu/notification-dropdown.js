import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { log } from '../../utils/logger';

export default class NavMenuNotificationDropdownComponent extends Component {
  @service store;
  @service router;

  get notifications() {
    return this.store.peekAll('notification');
  }

  get unreadNotificationsCount() {
    if (!this.notifications) {
      return 0;
    }
    return this.notifications.filter((n) => n.read === false).length;
  }

  @action
  async onNotificationSelect(model, dropdown) {
    if (model.read === true) {
      if (model.url) {
        this.router.transitionTo(model.url);
      }
      dropdown.closeDropdown();
      return;
    }
    //update the notification status as read
    try {
      model.read = true;
      await model.save();

      dropdown.closeDropdown();

      if (model.url) {
        this.router.transitionTo(model.url);
      }
    } catch (e) {
      log.error('Notifications', e);
    }
  }

  @action
  async deleteNotification(model) {
    try {
      await model.destroyRecord();
    } catch (e) {
      log.error('Notifications', e);
    }
  }

  @action
  async toggleNotificationStatus(model) {
    try {
      model.read = !model.read;
      await model.save();
    } catch (e) {
      log.error('Notifications', e);
    }
  }
}
