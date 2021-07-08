import Controller from '@ember/controller';
import { action } from '@ember/object';
import LoginValidations from '../validations/login';

export default class LoginController extends Controller {
  LoginValidations = LoginValidations;

  @action
  login() {
    const previousTransition = this.previousTransition;
    if (previousTransition) {
      this.previousTransition = null;

      previousTransition.retry();
    } else {
      this.transitionToRoute('index');
    }
  }
}
