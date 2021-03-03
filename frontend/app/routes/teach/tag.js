import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class TeachTagRoute extends Route {
  @service session;

  @service me;

  beforeModel(transition) {
    if (!this.me.isAuthenticated) {
      let loginController = this.controllerFor('login');
      loginController.set('previousTransition', transition);
      this.transitionTo('login');
    }
  }

  model(params) {
    return this.store.findRecord('chapter', params.id);
  }

  setupController(controller, model) {
    // Call _super for default behavior
    super.setupController(controller, model);
    // Implement your custom setup after
    controller.set('chapter_id', this.get('chapter_id'));
  }
}
