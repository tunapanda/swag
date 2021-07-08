import Component from '@glimmer/component';
import { H5PEditorComponent } from '@lumieducation/h5p-webcomponents';
import fetch from 'fetch';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class H5pEditorComponent extends Component {
  @tracked
  editor;

  @tracked
  contentId = this.args.contentId || 'new';

  baseUrl = '/api/v1/h5p';

  constructor(owner, args) {
    super(owner, args);

    /*create H5P editor web component*/
    if (!window.customElements.get('hp-editor')) {
      window.customElements.define('hp-editor', H5PEditorComponent);
    }
  }

  @action
  initEditor(element) {
    element.addEventListener('editorloaded', () => {
      this.loading = true;
      if (this.args.onEditorLoaded) {
        this.args.onEditorLoaded(element);
      }
    });

    element.loadContentCallback = async (contentId) => {
      return await fetch(
        contentId
          ? `${this.baseUrl}/editor/${contentId}`
          : `${this.baseUrl}/editor`
      )
        .then((res) => res.json())
        .then((rs) => {
          this.editor = element; //initialize the editor now
          return rs.model;
        });
    };

    element.saveContentCallback = async (contentId, requestBody) => {
      const url = contentId
        ? `${this.baseUrl}/content/${contentId}`
        : `${this.baseUrl}/content/`;

      return await fetch(url, {
        method: contentId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }).then((res) => res.json());
    };
    if (this.args.onEditorInit) {
      this.pollUntilIframeIsDrawn(element);
    }
  }

  pollUntilIframeIsDrawn(elem) {
    const editorIframe = elem.querySelector(
      '.h5p-editor-component-root  .h5p-create iframe'
    );

    const editorSearchInput =
      editorIframe?.contentWindow.document.querySelector('.h5p-hub');

    if (!editorIframe && !this.elementVisible(editorSearchInput)) {
      setTimeout(() => this.pollUntilIframeIsDrawn(elem), 40);
    } else {
      this.args.onEditorInit(elem);
    }
  }

  elementVisible(e) {
    return e
      ? !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length)
      : false;
  }
}
