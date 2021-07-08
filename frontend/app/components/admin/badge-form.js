import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Uploader from '../../utils/uploader';
import badgeValidations from '../../validations/badge';

export default class AdminBadgeFormComponent extends Component {
  @service store;
  @service notify;

  @tracked tempSelectedBadgeIcon;
  badgeValidations = badgeValidations;

  get model() {
    const obj = this.args.model;
    if (obj && obj.expiry) {
      obj.expiry = this.parseDate(obj.expiry);
    }
    return obj;
  }

  get triggers() {
    return this.store.peekAll('trigger');
  }

  parseDate(d) {
    const obj = new Date(d);
    return obj.toISOString().substr(0, 10);
  }

  @action
  async submitForm(model) {
    if (!model.id) {
      try {
        await model.save();
        if (!this.tempSelectedBadgeIcon) {
          // notify the user everything is successful
          this.notify.success('Badge created successfully (without icon)', {
            closeAfter: 15000,
          });
        }
      } catch (e) {
        this.notify.error(
          'Issue encountered while saving the badge details. Kindly try again later',
          { closeAfter: 15000 }
        );
      }
    } else {
      const original = this.store.peekRecord('badge', model.id);

      Object.keys(model.get('data')).map((key) => {
        original[key] = model[key];
      });
      try {
        await original.save();
        if (!this.tempSelectedBadgeIcon) {
          // notify the user everything is successful
          this.notify.success('Badge updated successfully', {
            closeAfter: 15000,
          });
        }
      } catch (e) {
        original.rollbackAttributes();
      }
    }
    if (this.tempSelectedBadgeIcon) {
      //upload icon
      this.uploader = Uploader.create({
        file: this.tempSelectedBadgeIcon,
        filename: this.tempSelectedBadgeIcon.name,
      });
      try {
        const res = await this.uploader.startUpload(
          [
            this.store.adapterFor('application').host,
            this.store.adapterFor('application').urlPrefix(),
            'badges',
            model.id,
            '/badge-image',
          ].join('/')
        );

        if (res.badge) {
          this.store.pushPayload({ badge: res.badge });
        }
        //reset the icon
        this.tempSelectedBadgeIcon = null;

        this.notify.success('Badge details & icon uploaded successfully', {
          closeAfter: 15000,
        });
      } catch (e) {
        this.notify.error(
          'Issue encountered while uploading badge icon. Kindly try again later',
          { closeAfter: 15000 }
        );
      }
    }
  }

  @action
  triggerSelected(setFormValue, evt) {
    if (setFormValue) {
      setFormValue(evt.target.selectedOptions[0].value);
    }
  }

  @action
  onBadgeIconSelect(files) {
    if (files.length > 1) {
      this.notify.error('You can only upload one file');
    } else {
      this.tempSelectedBadgeIcon = files[0];
    }
  }

  get selectedBadgeIconPreviewSrc() {
    if (this.tempSelectedBadgeIcon) {
      return URL.createObjectURL(this.tempSelectedBadgeIcon);
    }

    if (this.model && (this.model.iconUrl || this.model.badgeUri)) {
      return this.model.iconUrl || this.model.badgeUri;
    }
    return '';
  }

  @action
  resetSelectedBadgeIcon() {
    //  this.tempSelectedBadgeIcon = null; //TODO figure out how to reset this safely
  }
}
