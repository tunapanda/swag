const log = require('../utils/logger');
const knex = require('../utils/knexUtil');
const mojaEndpoint = require('../utils/mojaCampaigns/mojaEndpoint');
/**
 * Should account for:
 * Unknown user with moja id
 * Linking user with moja id
 * Existing id
*/

/**
 *
 * @param {*} tableName
 * @param {*} data
 */


/**
 *
 * Handling redirect from moja campaign platform to
 * sign up page with the following query params stored in localStorage
 *
 *  @param {ctx} campaign_id
 *  @param {ctx} points
 *  @param {ctx} enduser_id
 *  @param {ctx} partner_id
 *  @param {*} next
 */
module.exports = async function (ctx, next) {
  try {
    let stateUserId = ctx.state.user.id == undefined ? ctx.state.user.data.id : ctx.state.user.id;
    let mojaHeader = JSON.parse(ctx.request.header.mojaheader);
    mojaHeader['system_id'] = 'wikonnect@tunapanda.org';

    if (Object.keys(mojaHeader).length != 0) {
      let campaign_data = {
        campaign_partner: {
          partner_id: mojaHeader.partner_id
        },
        campaign_main: {
          campaign_id: mojaHeader.campaign_id,
          award_points: mojaHeader.points,
          partner_id: mojaHeader.partner_id
        },
        campaign_user: {
          user_id: stateUserId,
          enduser_id: mojaHeader.enduser_id
        }
      };

      await knex('campaign_partner').insert(campaign_data.campaign_partner).returning(['id']);
      await knex('campaign_user').insert(campaign_data.campaign_user).returning(['id']);
      await knex('campaign_main').insert(campaign_data.campaign_main).returning(['id']);
      // await insertOrUpdate('campaign_user', [campaign_data.campaign_user]);
      console.log(mojaHeader);
      mojaEndpoint(mojaHeader);
      await next();
    }
  } catch (err) {
    log.error(`The following error ${err} with message ${err.message}`);
    await next();
  }
};
