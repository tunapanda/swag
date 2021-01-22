import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject } from '@ember/service';

export default class TeachPreviewController extends Controller {

  @inject notify;
  @inject session;
  @inject
  me
  //token = this.session.data.authenticated.token


  @tracked publishModal;
  @tracked deleteModal;


  @action
  async publish(chapter_id) {
    await this.store.findRecord('chapter', chapter_id).then(function (chap) {
      // ...after the record has loaded

      chap.set('status', 'published');
      chap.save();


    });
    this.publishModal = false;
    this.notify.info('Chapter succesfuly published');

  }


  @action
  async delete(chapter_id) {
    let chapter = await this.store.findRecord('chapter', chapter_id);
    await chapter.deleteRecord();
    this.deleteModal = false;

    this.notify.info('Chapter succesfuly deleted');
    this.transitionToRoute('teach');


  }

  @action
  showPublishModal() {
    this.publishModal = true;
  }

  @action
  showDeleteModal() {
    this.deleteModal = true;
  }


  @action
  unpublish(chapter_id) {
    this.store.findRecord('chapter', chapter_id).then(function (chap) {
      // ...after the record has loaded

      chap.set('status', 'draft');
      chap.set('approved', false);
      chap.save();
    });


  }


}
