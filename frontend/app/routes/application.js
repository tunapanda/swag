import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service session;
  @service me;
  @service SeoTags;
  @service socket;
  @service router;

  queryParams = { campaign_id: '', points: '', enduser_id: '', partner_id: '' };

  constructor(properties) {
    super(properties);
    this.router.on('routeDidChange', () => {
      if (this.me.isAuthenticated) {
        this.store.query('notification', {
          recipientId: this.me.user.id,
        });
      }
    });
  }

  async model() {
    if (this.me.isAuthenticated) {
      return await this.store.query('notification', {
        recipientId: this.me.user.id,
      });
    }
  }

  beforeModel() {
    return this._loadMe();
  }

  afterModel() {
    this.socket.roleChanged();
    this.socket.eventHandlers();

    this.headTags = this.SeoTags.build();
  }

  _loadMe() {
    return this.me.load();
  }
}
