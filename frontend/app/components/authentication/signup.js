import Component from '@ember/component';
import { inject } from '@ember/service';
import { action } from '@ember/object';
import UserValidation from '../../validations/user';

export default class AuthenticationSignupComponent extends Component {
  UserValidation = UserValidation;

  @inject
  me;

  @inject
  notify;

  @inject
  session;

  @inject
  store;

  @inject
  config

  @inject
  torii

  @action
  sessionRequiresAuthentication() {
    this.notify.info('Signing up...', { closeAfter: 5000 });

    const me = this.me;
    this.get('torii')
      .open('google-oauth2-bearer')
      .then(function (googleAuth) {
        const googleToken = googleAuth.authorizationToken.access_token;

        me.registerWithGoogle({ googleToken: googleToken, provider: 'google' })
          .then((user) => me.authenticate(user.get('username'), googleToken));
      }, function (error) {
        console.error('Google auth failed: ', error.message);
      });
  }

  @action
  createUser(model) {
    let fields = model.getProperties('username', 'email', 'password', 'inviteCode');
    this.notify.info('Signing up...', { closeAfter: 5000 });


    this.me.register(fields).then(() => this.me.authenticate(model.get('username'), model.get('password')).then(() => this.success()), err => {
      if (err && err.errors) {
        Object.keys(err.errors).forEach(key => {
          let constraint = err.errors[key].constraint.split('_');

          let error_message;
          switch (constraint[1]) {
          case 'email':
            error_message = 'This email is already in use';
            break;
          case 'username':
            error_message = 'This username already exists';
            break;
          default:
            error_message = err.errors[key].errors;
            break;
          }
          model.addError(constraint[1], error_message);
        });
      }
    });
  }

}
