import Route from '@ember/routing/route';

export default class SurveysRoute extends Route {
  model({ id }) {
    return this.store.findRecord('survey', id);
  }

  activate() {
    super.activate();
    if (window) {
      window.scroll(0, 0);
    }
  }
}
