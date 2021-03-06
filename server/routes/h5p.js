const fs = require('fs');

const Router = require('koa-router');
const {H5PAjaxEndpoint} = require('@lumieducation/h5p-server');
const koaBody = require('koa-body');

const {requireAuth} = require('../middleware/permController');
const H5PEditor = require('../utils/h5p/editor');
const {H5PPlayer} = require('../utils/h5p/player');
const {H5PUser} = require('../utils/h5p/config');
const {Exporter} = require('../utils/h5p/download');
const log = require('../utils/logger');

const router = new Router({
  prefix: '/h5p'
});


/**
 * @api {get} /api/v1/h5p/editor/:contentId GET H5P editor & content model
 * @apiName GET H5P editor model with content
 * @apiGroup H5P
 * @apiPermission [authenticated user]
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (URI Param) {String} contentId Id of the content to preload
 *
 * @apiSuccess {Object} integration
 * @apiSuccess {Object} integration[editor]
 * @apiSuccess {Object} integration[user]
 * @apiSuccess {Object} integration[ajax]
 * @apiSuccess {Object} integration[l10n]
 * @apiSuccess {String} integration[ajaxPath]
 * @apiSuccess {String} integration[libraryUrl]
 * @apiSuccess {String} integration[url]
 * @apiSuccess {Integer} integration[fullscreenDisabled]
 * @apiSuccess {Boolean} integration[saveFreq]
 * @apiSuccess {Boolean} integration[postUserStatistics]
 * @apiSuccess {String[]} scripts
 * @apiSuccess {String[]} styles
 * @apiSuccess {Object} urlGenerator
 * @apiSuccess {Object} urlGenerator[config]
 *
 *
 */
router.get('/editor/:contentId', requireAuth, async (ctx) => {
  try {

    const {contentId} = ctx.params;
    const {language} = ctx.query;
    const user = H5PUser(ctx.state.user);

    const editor = await H5PEditor();
    const model = await editor.render(contentId, language, user);
    const content = await editor.getContent(contentId, user);

    ctx.status = 200;
    ctx.body = {
      model: {...model, metadata: content.h5p, library: content.library, params: content.params.params}
    };
  } catch (e) {
    log.error(e);
    ctx.status = 500;
    ctx.body = {error: e};
  }
});

/**
 * @api {get} /api/v1/h5p/editor/ GET H5P editor model
 * @apiName GET H5P editor model
 * @apiGroup H5P
 * @apiPermission [authenticated user]
 * @apiVersion 0.4.0
 *
 * @apiHeader {String} Authorization Bearer << JWT here>>
 *
 * @apiParam (Query Params) {String} [language]
 *
 * @apiSuccess {Object} integration
 * @apiSuccess {Object} integration[editor]
 * @apiSuccess {Object} integration[user]
 * @apiSuccess {Object} integration[ajax]
 * @apiSuccess {Object} integration[l10n]
 * @apiSuccess {String} integration[ajaxPath]
 * @apiSuccess {String} integration[libraryUrl]
 * @apiSuccess {String} integration[url]
 * @apiSuccess {Integer} integration[fullscreenDisabled]
 * @apiSuccess {Boolean} integration[saveFreq]
 * @apiSuccess {Boolean} integration[postUserStatistics]
 * @apiSuccess {String[]} scripts
 * @apiSuccess {String[]} styles
 * @apiSuccess {Object} urlGenerator
 * @apiSuccess {Object} urlGenerator[config]
 *
 *
 *
 */
router.get('/editor', requireAuth, async (ctx) => {
  try {
    const {language} = ctx.query;
    const user = H5PUser(ctx.state.user);

    const editor = await H5PEditor();

    ctx.status = 200;
    ctx.body = {model: await editor.render(undefined, language, user)};
  } catch (e) {
    log.error(e);
    ctx.status = 500;
    ctx.body = {error: e};
  }
});

/**
 * Handle all H5P Editor & Player GET AJAX requests
 *
 */
router.get('/ajax', requireAuth, async (ctx) => {
  try {
    const {action, majorVersion, minorVersion, machineName, language} = ctx.query;
    const editor = await H5PEditor();
    const user = H5PUser(ctx.state.user);

    const result = await new H5PAjaxEndpoint(editor)
      .getAjax(action, machineName, majorVersion, minorVersion, language, user);

    ctx.status = 200;
    ctx.body = result;
  } catch (e) {
    ctx.status = 400;
    ctx.body = {error: e.message};
  }

});

/**
 * Handle all H5P Editor POST AJAX requests
 *
 */
router.post('/ajax', requireAuth, async (ctx,next) => {

  try {
    const {action, id, language} = ctx.query;
    const user = H5PUser(ctx.state.user);
    const editor = await H5PEditor();
    let body = ctx.request.body;
    let uploadedLibraryFile = undefined;
    let uploadedContentFile = undefined;

    if (ctx.request.is('multipart/*')) {
      await koaBody({multipart: true})(ctx,next);
      const {h5p,file} =ctx.request.files;

      body = ctx.request.body;

      if(h5p){
        const {path, name, type} = h5p;
        uploadedLibraryFile = {
          mimetype: type, name,
          size: fs.statSync(path).size, tempFilePath: path,
        };
      }
      if(file){
        const {path, name, type} = file;
        uploadedContentFile = {
          mimetype: type, name,
          size: fs.statSync(path).size, tempFilePath: path,
        };
      }

    }

    const translator = null; //should be a function (stringId: string, replacements: )=>string

    const result = await new H5PAjaxEndpoint(editor)
      .postAjax(action, body, language, user, uploadedContentFile, id, translator, uploadedLibraryFile);

    ctx.status = action === 'libraries' || action === 'translations' || action === 'filter' ? 200 : 201;
    ctx.body = result;

  } catch (e) {
    log.error(e);
    ctx.status = 400;
    ctx.body = {error: e.message};
  }
});

/**
 * Get specified user content by ID
 *
 */
router.get('/content/:contentId', requireAuth, async (ctx) => {
  try {
    const contentId = ctx.params.contentId;

    const user = H5PUser(ctx.state.user);
    const editor = await H5PEditor();

    //fetch existing content by ID
    const {title, language, license} = await editor.contentManager.getContentMetadata(contentId, user);


    ctx.status = 200;
    ctx.body = {id: contentId, title, language, license};

  } catch (e) {
    ctx.status = 400;
    ctx.body = {error: e.message || e};
  }
});

/**
 * Get all user created content
 */
router.get('/content', requireAuth, async (ctx) => {
  try {

    const user = H5PUser(ctx.state.user);
    const editor = await H5PEditor();

    const contendIds = await editor.contentManager.listContent(user); //get current user content


    const results = await Promise.all(contendIds.map(async (id) => {
      const {title, language, license} = await editor.contentManager.getContentMetadata(id, user);
      return {id, title, language, license};
    }));

    ctx.status = 200;
    ctx.body = {data: results};

  } catch (e) {
    ctx.status = 400;
    ctx.body = {error: e.message || e};
  }
});

/**
 * Persist user created content
 *
 */
router.post('/content', requireAuth, async (ctx) => {
  try {

    const { library, params} = ctx.request.body;
    if (!params.params || !params.metadata || !library) {
      ctx.throw(400,{message:'Malformed request'});
    }

    const user = H5PUser(ctx.state.user);
    const editor = await H5PEditor();

    const result = await editor
      .saveOrUpdateContentReturnMetaData( undefined, params.params, params.metadata, library, user);

    ctx.status = 200;
    ctx.body = result;

  } catch (e) {
    ctx.status = 400;
    ctx.body = {error: e.message || e};
  }
});

/**
 * Persist user created content
 *
 */
router.put('/content/:contentId', requireAuth, async (ctx) => {
  try {

    const {contentId} =ctx.params;
    
    const {library, params} = ctx.request.body;
    if (!params.params || !params.metadata || !library) {
      ctx.throw(400,{message:'Malformed request'});
    }

    const user = H5PUser(ctx.state.user);
    const editor = await H5PEditor();

    const result = await editor
      .saveOrUpdateContentReturnMetaData(contentId, params.params, params.metadata, library, user);

    ctx.status = 200;
    ctx.body = result;

  } catch (e) {
    ctx.status = 400;
    ctx.body = {error: e.message || e};
  }
});

/**
 * Delete existing content
 */
router.delete('/content/:contentId', requireAuth, async (ctx) => {
  try {

    const contentId = ctx.params.contentId;

    const user = H5PUser(ctx.state.user);
    const editor = await H5PEditor();

    await editor.contentManager.deleteContent(contentId, user);

    ctx.status = 204;

  } catch (e) {
    ctx.status = 400;
    ctx.body = {error: e.message || e};
  }
});


/**
 * Download H5P content as zipped .h5p file
 *
 */
router.get('/download/:contentId', async (ctx) => {
  try {

    const {contentId} = ctx.params;
    const user = H5PUser(ctx.state.user);

    const editor = await H5PEditor();

    const results = await new Exporter(editor)
      .getPackageStream(contentId, user);

    ctx.status = 200;
    ctx.response.attachment(`${contentId}.h5p`);
    ctx.body = results;

  } catch (e) {
    log.error(e);
    ctx.status = 400;
    ctx.body = {error: e};
  }
});


router.get('/contentUserData', async (ctx) => {

  ctx.status = 204;
  ctx.body = {};
});

router.post('/contentUserData', async (ctx) => {

  ctx.status = 204;
  ctx.body = {};
});

/**
 * Get H5P Player model for specific existing H5P content (assets & integration settings)
 *
 */

router.get('/player/:contentId', async (ctx) => {
  try {
    const {contentId} = ctx.params;
    const editor = await H5PEditor();
    const user = H5PUser(ctx.state.user);

    const player = await H5PPlayer(editor);

    const results = await player.render(contentId, user);

    ctx.status = 200;
    ctx.body = {model: results};

  } catch (e) {
    log.error(e);
    ctx.status = 400;
    ctx.body = {error: e};
  }

});


module.exports = router.routes();


