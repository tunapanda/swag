import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service session;
  @service me;
  @service SeoTags;
  @service socket;
  @service router;

  queryParams = { campaign_id: '', points: '', enduser_id: '', partner_id: '' };

  beforeModel() {
    return this._loadMe();
  }

  afterModel() {
    this.socket.eventHandlers();

    this.headTags = this.SeoTags.build();
  }
  _loadMe() {
    return this.me.load();
  }
}
