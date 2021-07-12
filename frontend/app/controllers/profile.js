import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { action } from '@ember/object';

export default class ProfileController extends Controller {
  editing = false;

  @inject me;

  queryParams = ['view'];
  view = 'Profile';

  get isProfileOwner() {
    if (!this.me?.isAuthenticated || !this.model.id) {
      return false;
    }
    return this.model.id === this.me.user.id;
  }

  get accountRole() {
    return this.model.role; //TODO I am sure we should have extra stuff
  }

  get totalChaptersCreatedByUser() {
    return 0;
  }

  get totalPointsEarnedByUser() {
    return 3;
  }

  get totalChaptersEarnedByUser() {
    return 0;
  }

  @action
  viewAllUnlockedBadges() {
    this.transitionToRoute('profile.achievements');
  }
}
