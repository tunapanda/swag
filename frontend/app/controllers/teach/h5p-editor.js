import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class TeachH5pEditorController extends Controller {
  @service me;
  @service notify;

  @tracked editor;

  @action
  onEditorInitialized(elem) {
    this.editor = elem;
  }

  @action
  async saveH5PContent(previewImmediately) {
    if (!this.editor) {
      this.notify.info('You need to create content first to proceed');
      return;
    }
    try {
      const res = await this.editor.save();
      this.model.contentId = res.id;
      await this.model.save();
      if (previewImmediately) {
        return this.transitionToRoute('teach.preview', this.model.id);
      }
      this.transitionToRoute('teach.thumbnail-upload', this.model.id);
    } catch (e) {
      if (e.message && e.message.startsWith('validation-error')) {
        this.notify.alert(
          e.message.replace('validation-error', '').replace(':', '')
        );
      } else {
        this.notify.alert(
          'Unexpected error encountered and we could not save the content'
        );
      }
    }
  }
}
