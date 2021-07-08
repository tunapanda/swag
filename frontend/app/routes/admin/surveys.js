import Route from '@ember/routing/route';

export default class AdminSurveysRoute extends Route {
  async model() {
    return await this.store.findAll('survey');
  }

  async afterModel() {
    return await this.store.findAll('trigger');
  }
}
