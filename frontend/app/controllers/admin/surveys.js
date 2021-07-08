import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class AdminSurveysController extends Controller {
  queryParams = ['editItem'];
  @service intl;
  @service store;
  @service notify;

  @tracked editItem;
  @tracked createFormVisible = false;
  @tracked surveySearchTerm;
  @tracked sortBy = {};
  @tracked surveyForm;

  surveyStatus = {
    published: 'Active',
    unpublished: 'Pending',
    archived: 'Archived',
  };

  sortSurveys(surveys) {
    if (!this.sortBy.value) {
      return surveys.sortBy('updatedAt').reverse();
    }
    if (this.sortBy.value === 'status') {
      // sort order : Pending, Active, Archived
      return surveys.sort((a, b) => {
        if (a.status === b.status) {
          return 0;
        }
        if (a.status === 'Pending' && b.status === 'Active') {
          return -1;
        }
        if (a.status === 'Pending' && b.status === 'Archived') {
          return -1;
        }
        if (a.status === 'Active' && b.status === 'Archived') {
          return -1;
        }
        return 1;
      });
    }
    return surveys.sortBy(this.sortBy.value);
  }
  get surveys() {
    const all = this.model.filter((survey) => survey.id);
    if (!this.surveySearchTerm) {
      return this.sortSurveys(all);
    }
    const filtered = all.filter((survey) => {
      return (
        survey.name
          .toLowerCase()
          .includes(this.surveySearchTerm.toLowerCase()) ||
        survey.description
          .toLowerCase()
          .includes(this.surveySearchTerm.toLowerCase()) ||
        survey.status
          .toLowerCase()
          .includes(this.surveySearchTerm.toLowerCase())
      );
    });
    return this.sortSurveys(filtered);
  }

  get surveyModel() {
    if (this.editItem) {
      const obj = this.surveys.find((survey) => survey.id === this.editItem);
      if (obj) {
        return { ...obj.serialize(), id: obj.id };
      }
    }
    return this.store.createRecord('survey', {
      status: this.surveyStatus.published,
    });
  }

  @action
  initSurveyFormVisibility() {
    this.createFormVisible = !!this.editItem;
  }

  @action
  toggleSFormVisibility(survey) {
    if (!survey && this.editItem) {
      this.editItem = null;
      this.createFormVisible = true;
      return;
    }
    if (!survey) {
      this.editItem = null;
      this.createFormVisible = !this.createFormVisible;
      return;
    }

    if (survey) {
      this.editItem = survey.id;
      this.createFormVisible = true;
      if (this.surveyForm) {
        if (this.surveyForm.scrollIntoView) {
          this.surveyForm.scrollIntoView({
            behavior: 'smooth',
            inline: 'start',
          });
        } else if (this.surveyForm.focus) {
          this.surveyForm.focus();
        }
      }
    }
  }

  @action
  setSortBy(title, value) {
    this.sortBy = { title, value };
  }

  @action
  setSurveyForm(elem) {
    this.surveyForm = elem;
  }

  @action
  statusColor({ status }) {
    if (status.toLowerCase() === this.surveyStatus.archived.toLowerCase()) {
      return 'archived';
    }

    if (status.toLowerCase() === this.surveyStatus.unpublished.toLowerCase()) {
      return 'pending';
    }
  }

  hasExpired(expiryDate) {
    return new Date(expiryDate) < new Date();
  }

  @action
  canPublishSurvey(survey) {
    return (
      !this.hasExpired(survey.expiry) &&
      survey.status !== this.surveyStatus.published
    );
  }

  @action
  canUnPublishSurvey(survey) {
    return (
      !this.hasExpired(survey.expiry) &&
      survey.status === this.surveyStatus.published
    );
  }

  @action
  canArchiveSurvey(survey) {
    return survey.status !== this.surveyStatus.archived;
  }

  @action
  async deleteSurvey(survey) {
    if (
      window.confirm(this.intl.t('admin.surveys.labels.delete_confirmation'))
    ) {
      try {
        if (this.editItem && survey.id === this.editItem) {
          this.editItem = null;
        }
        await survey.destroyRecord();
        this.notify.success(this.intl.t('admin.surveys.labels.survey_deleted'));
      } catch (e) {
        this.notify.error(
          this.intl.t('admin.surveys.labels.survey_deletion_error'),
          {
            closeAfter: 10000,
          }
        );
      }
    }
  }

  @action
  async updateSurveyStatus(survey, status) {
    let prompt;
    if (this.surveyStatus.published === status) {
      prompt = this.intl.t('admin.surveys.labels.publish_confirmation');
    }
    if (this.surveyStatus.archived === status) {
      prompt = this.intl.t('admin.surveys.labels.archive_confirmation');
    }
    if (this.surveyStatus.unpublished === status) {
      prompt = this.intl.t('admin.surveys.labels.unpublish_confirmation');
    }
    if (window.confirm(prompt)) {
      try {
        survey.status = status;
        await survey.save();
        this.notify.success(this.intl.t('admin.surveys.labels.status_updated'));
      } catch (e) {
        survey.rollbackAttributes();
        this.notify.error(
          this.intl.t('admin.surveys.labels.survey_update_error'),
          {
            closeAfter: 10000,
          }
        );
      }
    }
  }

  @action
  async saveSurveyForm(model) {
    if (!model.id) {
      try {
        await model.save();
        this.notify.success(this.intl.t('admin.surveys.labels.survey_created'));
      } catch (e) {
        this.notify.error(
          this.intl.t('admin.surveys.labels.survey_create_error'),
          {
            closeAfter: 10000,
          }
        );
      }
    } else {
      const original = this.store.peekRecord('survey', model.id);
      Object.keys(model.get('data')).map((key) => {
        original[key] = model[key];
      });
      try {
        await original.save();
        this.notify.success(this.intl.t('admin.surveys.labels.survey_created'));
      } catch (e) {
        this.notify.error(
          this.intl.t('admin.surveys.labels.survey_create_error'),
          {
            closeAfter: 10000,
          }
        );
      }
    }
  }

  get paginationSummary() {
    return 'Showing all surveys';
  }
}
