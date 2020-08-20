import Component from '@glimmer/component';
import { H5P } from 'h5p-standalone'; // ES6
import { action } from '@ember/object';
import { inject, inject as service } from '@ember/service';


export default class H5pComponent extends Component {
  @inject me;

  @service notify;

  @action
  async renderH5P(el) {
    this.notify.info('Log in to track progress');
    const h5pLocation = this.args.location;

    const options = {
      frameJs: '/h5p/frame.bundle.js',
      frameCss: '/h5p/h5p.css'
    };

    await new H5P(el, h5pLocation, options);
  }
}


