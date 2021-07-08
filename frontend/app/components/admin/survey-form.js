import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import surveyValidations from '../../validations/survery';

export default class AdminSurveyFormComponent extends Component {
  @service store;
  surveyValidations = surveyValidations;

  parseDate(d) {
    const obj = new Date(d);
    return obj.toISOString().substr(0, 10);
  }

  get model() {
    const obj = this.args.model;
    if (obj && obj.expiry) {
      obj.expiry = this.parseDate(obj.expiry);
    }
    return obj;
  }

  get triggers() {
    return this.store.peekAll('trigger');
  }
  @action
  triggerSelected(setFormValue, evt) {
    if (setFormValue) {
      setFormValue(evt.target.selectedOptions[0].value);
    }
  }

  @action
  submitForm(model) {
    if (this.args.saveSurveyForm) {
      this.args.saveSurveyForm(model);
    }
  }
}
