import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class AdminBadgesHomeController extends Controller {
  @service me;
  @service store;
  @tracked badgeSearchTerm;
  @tracked bulkSelectedItems;
  @tracked showPerPage = 10;
  @tracked currentPage = 1;
  @tracked parsedBadges = this.parseBadges;
  @tracked allBadgeTableItems = false;

  perPageOptions = [
    { value: 5, selected: false },
    { value: 10, selected: true },
    { value: 20, selected: false },
    { value: 50, selected: false },
    { value: 100, selected: false },
  ];

  get parseBadges() {
    const obj = A([]);
    this.store.peekAll('badge').map((badge) => {
      obj.pushObject(new MiniBadge(badge));
    });
    return obj;
  }

  /**
   * Current page badges
   */
  get badges() {
    const { firstIndex, lastIndex } = this.pageNumericSummary;
    const indexesToShow = Array(lastIndex - firstIndex + 1)
      .fill()
      .map((x, index) => firstIndex - 1 + index);

    if (this.badgeSearchTerm && this.badgeSearchTerm.trim()) {
      return this.parseBadges.filter((badge) => {
        return (
          badge.name
            .toLowerCase()
            .includes(this.badgeSearchTerm.toLowerCase()) ||
          badge.description
            .toLowerCase()
            .includes(this.badgeSearchTerm.toLowerCase()) ||
          badge.status
            .toLowerCase()
            .includes(this.badgeSearchTerm.toLowerCase())
        );
      });
    }
    return this.parsedBadges.objectsAt(indexesToShow);
  }

  @action
  toggleBadgeSelection(badge) {
    badge.isSelected = !badge.isSelected;
  }

  @action
  toggleAllBadgesSelection(evt) {
    //reset all in case they changed the page view
    this.resetAllBadgesSelection();
    const selected = evt.target.checked;
    this.badges.map((b) => {
      b.isSelected = selected;
    });
  }

  resetAllBadgesSelection() {
    this.parsedBadges.map((b) => (b.isSelected = false));
    this.allBadgeTableItems = false;
  }

  get badgesCount() {
    return this.model.length;
  }

  get badgesUnlockedCount() {
    return 0; //TODO
  }
  usersEarned(/*badge*/) {
    return 0; //TODO
  }

  @action
  async deleteBadge(badge) {
    if (window.confirm('Are you sure you want to delete the badge?')) {
      const model = this.model.find((b) => b.id === badge.id);
      if (model) {
        await model.destroyRecord();
        this.parsedBadges = this.parseBadges;
      }
    }
  }

  @action
  async deleteAllSelected() {
    const prompt = 'Are you sure you want to delete all the selected badges?';
    if (window.confirm(prompt)) {
      this.badges.map(async (badge) => {
        if (!badge.isSelected) {
          return;
        }
        const obj = this.model.find((b) => b.id === badge.id);
        if (obj) {
          await obj.destroyRecord();
          this.parsedBadges = this.parseBadges;
        }
      });
      this.allBadgeTableItems = false;
    }
  }

  @action
  updatePerPage(evt) {
    this.currentPage = 1; // It's easier than doing calculations.
    this.showPerPage = +evt.target.selectedOptions[0].value;
    this.resetAllBadgesSelection();
  }

  get pageNumericSummary() {
    const recordsCount = this.parsedBadges.length;

    let firstIndex = 1;
    if (this.currentPage > 1) {
      firstIndex = this.showPerPage * this.currentPage - (this.showPerPage - 1);
    }

    let lastIndex = this.showPerPage * this.currentPage;
    if (lastIndex > recordsCount) {
      lastIndex = recordsCount;
    }

    return { firstIndex, lastIndex, recordsCount };
  }

  get paginationSummary() {
    const {
      recordsCount,
      firstIndex: pageFirstIndex,
      lastIndex: pageLastIndex,
    } = this.pageNumericSummary;

    if (recordsCount <= this.showPerPage) {
      return `Showing All Badges`;
    }

    return `Showing ${pageFirstIndex} - ${pageLastIndex} of ${recordsCount}`;
  }

  @action
  goToPrevPage() {
    if (this.hasPreviousPage) {
      this.currentPage = --this.currentPage;
      this.resetAllBadgesSelection();
    }
  }

  @action
  goToNextPage() {
    if (this.hasNextPage) {
      this.currentPage = ++this.currentPage;
      this.resetAllBadgesSelection();
    }
  }

  get hasNextPage() {
    const { recordsCount, lastIndex } = this.pageNumericSummary;
    return lastIndex !== recordsCount;
  }

  get hasPreviousPage() {
    const { recordsCount } = this.pageNumericSummary;
    return this.currentPage > 1 && recordsCount > this.showPerPage;
  }
}

class MiniBadge {
  @tracked isSelected = false;

  constructor(badge) {
    this.id = badge.id;
    this.name = badge.name;
    this.iconUrl = badge.iconUrl;
    this.expiry = badge.expiry;
    this.description = badge.description;
    this.published = badge.published || true;
    this.status = badge.published ? 'Published' : 'Not published';
    this.isSelected = badge.isSelected || false;
  }
}
