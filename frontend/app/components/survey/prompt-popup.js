import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { events } from '../../utils/socket-events';

export default class SurveyPromptPopupComponent extends Component {
  @service socket;
  @service store;
  @service router;

  @tracked showSurveyFillPrompt = false;
  @tracked survey;

  @action
  hideSurveyFillPrompt() {
    this.showSurveyFillPrompt = false;
  }

  @action
  notificationEventIntercept() {
    this.socket.socket.on(events.user.notification.created, (notification) => {
      setTimeout(async () => {
        if (!this.showSurveyFillPrompt) {
          this.survey = await this.store.find('survey', notification.itemId);
          this.showSurveyFillPrompt = true;
        }
      }, 3000);
    });
  }

  @action
  transitionToSurveyPage() {
    this.hideSurveyFillPrompt();
    this.router.transitionTo('surveys', this.survey);
  }
}
