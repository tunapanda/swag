import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class AdminBadgesManageController extends Controller {
  queryParams = ['editItem'];

  @service store;
  @service me;

  @tracked createFormVisible = true;
  @tracked selectedBadgeModel;
  @tracked editItem = null;
  @tracked showBadgePopup = false;
  @tracked badgeForPopup;

  get badges() {
    //since the badges already exist on the store after model query on the route
    return this.store.peekAll('badge').filter((badge) => badge.id);
  }

  get badgeModel() {
    if (this.editItem) {
      const obj = this.badges.find((badge) => badge.id === this.editItem);
      if (obj) {
        return { ...obj.serialize(), id: obj.id };
      }
    }
    return this.store.createRecord('badge', {
      creatorId: this.me.id,
      published: true,
    });
  }

  @action
  showBadgeCreationForm(badge) {
    if (!badge && this.editItem) {
      this.editItem = null;
      this.createFormVisible = true;
      return;
    }

    if (!badge) {
      this.editItem = null;
      this.createFormVisible = !this.createFormVisible;
      return;
    }

    if (badge) {
      this.editItem = badge.id;
      this.createFormVisible = true;
    }
  }

  @action
  async deleteBadge(badge) {
    if (window.confirm('Are you sure you want to delete the badge?')) {
      if (this.editItem && badge.id === this.editItem) {
        this.editItem = null;
      }
      await badge.destroyRecord();
    }
  }

  @action
  async updatePublishStatus(badge) {
    const prompt = badge.published ? 'unpublish' : 'publish';
    if (window.confirm(`Are you sure you want to ${prompt} the badge?`)) {
      badge.published = !badge.published;
      await badge.save();
    }
  }

  @action
  viewBadgeOnPopup(badge) {
    this.badgeForPopup = badge;
    this.showBadgePopup = true;
  }

  @action badgePopupClosed() {
    this.showBadgePopup = false;
  }
}
