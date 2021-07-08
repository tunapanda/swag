import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { A } from '@ember/array';
import { inject as service } from '@ember/service';

export default class AdminUsersController extends Controller {
  @service store;
  @service me;
  @tracked allTableItemsSelected = false;
  @tracked selectedUserRows = A([]);
  @tracked searchTerm;
  @tracked showPerPage = 10;
  @tracked currentPage = 1;

  perPageOptions = [
    { value: 10, selected: true },
    { value: 20, selected: false },
    { value: 50, selected: false },
    { value: 100, selected: false },
  ];

  get roles() {
    return this.store.peekAll('group');
  }

  get allUsers() {
    return this.model.filter((user) => user.id);
  }

  searchResults() {
    return this.allUsers.filter((user) => {
      return (
        user.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    });
  }

  get users() {
    const { currentPageStart, currentPageEnd } = this.pageNumericSummary;

    if (this.searchTerm && this.searchTerm.trim()) {
      return this.searchResults().slice(currentPageStart - 1, currentPageEnd);
    }

    if (currentPageStart === currentPageEnd) {
      return this.allUsers;
    }

    return this.allUsers.slice(currentPageStart - 1, currentPageEnd);
  }

  @action
  isSearching() {
    this.resetAllSelection();
    this.currentPage = 1;
  }

  @action
  isUserRowSelected(user) {
    return this.selectedUserRows.findIndex((row) => row.id === user.id) > -1;
  }

  get isAllUserRowsSelected() {
    return this.selectedUserRows.length === this.users.length;
  }

  resetAllSelection() {
    this.selectedUserRows.clear();
  }

  @action
  toggleAllRowSelection(e) {
    const isSelected = e.target.checked;

    this.selectedUserRows.clear();

    if (isSelected) {
      this.selectedUserRows.addObjects(this.users);
    }
  }

  @action
  toggleRowSelection(user) {
    const foundIndex = this.selectedUserRows.findIndex((row) => {
      return row.id === user.id;
    });

    if (foundIndex > -1) {
      this.selectedUserRows.removeAt(foundIndex);
    } else {
      this.selectedUserRows.addObject(user);
    }
  }

  @action
  deleteSelectedUsers() {
    this.selectedUserRows.forEach(async (user) => {
      await user.destroyRecord();
    });
  }

  @action
  updatePerPage(event) {
    this.currentPage = 1;
    this.resetAllSelection();
    this.showPerPage = +event.target.selectedOptions[0].value;
  }

  get pageNumericSummary() {
    let recordsCount = this.allUsers.length;

    if (this.searchTerm && this.searchTerm.trim()) {
      recordsCount = this.searchResults().length;
    }

    let currentPageStart = 1;
    if (this.currentPage > 1) {
      currentPageStart = this.showPerPage * (this.currentPage - 1) + 1;
    }

    let currentPageEnd = this.showPerPage * this.currentPage;
    if (currentPageEnd > recordsCount) {
      currentPageEnd = recordsCount;
    }

    return { currentPageStart, currentPageEnd, recordsCount };
  }

  get paginationSummary() {
    const { recordsCount, currentPageStart, currentPageEnd } =
      this.pageNumericSummary;

    if (recordsCount <= this.showPerPage) {
      return `Showing All Users`;
    }

    return `Showing ${currentPageStart} - ${currentPageEnd} of ${recordsCount}`;
  }

  @action
  goToPrevPage() {
    if (this.hasPreviousPage) {
      this.currentPage = --this.currentPage;
      this.resetAllSelection();
    }
  }

  @action
  goToNextPage() {
    if (this.hasNextPage) {
      this.currentPage = ++this.currentPage;
      this.resetAllSelection();
    }
  }

  get hasNextPage() {
    const { recordsCount, currentPageEnd } = this.pageNumericSummary;
    return currentPageEnd !== recordsCount;
  }

  get hasPreviousPage() {
    const { recordsCount } = this.pageNumericSummary;
    return this.currentPage > 1 && recordsCount > this.showPerPage;
  }
}
