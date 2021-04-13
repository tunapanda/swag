import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CallbackRoute extends Route {
  @service
  session;

  @service
  me;

  @service
  config;

  parseResponse(locationHash) {
    let params = {};
    const query = locationHash.substring(locationHash.indexOf('?'));
    const regex = /([^#?&=]+)=([^&]*)/g;
    let match;

    // decode all parameter pairs
    while ((match = regex.exec(query)) !== null) {
      params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
    }

    return params;
  }

  signupSuccess() {
    if (this.config.content.APP.use_preset_tags) {
      this.transitionTo('tags');
    } else {
      this.transitionTo('upload');
    }
  }

  activate() {
    let hash = this.parseResponse(window.location.hash);
    let googleToken = hash.access_token;

    this.me
      .registerWithOauth2({ googleToken: googleToken, provider: 'google' })
      .then((user) => {
        if (user.get('isNew')) {
          this.signupSuccess();
        } else {
          this.me
            .authenticate(user.get('username'), googleToken)
            .then(() => this.transitionTo('index'));
        }
      });
  }
}
