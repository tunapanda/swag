import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class TeachLoginRoute extends Route {
  @service me;
  @service SeoTags;

  beforeModel() {
    if (this.me.user) {
      this.transitionTo('teach.index');
    }
  }

  model() {
    return this.store.createRecord('user');
  }

  afterModel() {
    console.log("after model");
    this.headTags = this.SeoTags.build('Login to Teach - Wikonnect', '/teach/login');
  }
}
