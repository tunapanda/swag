import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
export default class NavigationComponent extends Component {

  @service
  me;


  @service router;
  @service session;

  @action
  closenav() {
    document.getElementById("mySidenav").style.width = "0";
  }

  @action
  logout() {
    document.getElementById("mySidenav").style.width = "0";

    this.me.logout();
    document.location.reload();

    this.router.transitionTo('index');


  }
}
