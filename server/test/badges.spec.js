const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiJSON = require('chai-json-schema');
const server = require('../index');
const tokens = require('./_tokens');
const knex = require('../db/db');

chai.use(chaiHttp);
chai.use(chaiJSON);
chai.should();

const route = '/api/v1/badges';
const data = {
  badge: {
    name: 'changed',
    description: 'changed',
  },
};

async function getBadge() {
  const badgeId = (
    await knex('badges')
      .where({ isDeleted: false })
      .select(['badges.id'])
      .limit(1)
  )[0];
  return badgeId.id;
}

describe('BADGES ROUTE', () => {
  // Passing tests
  it('Should get Badge using ID', async () => {
    const id = await getBadge();
    return chai
      .request(server)
      .get(`${route}/${id}`)
      .set(tokens.headerAdminUser)
      .set('Content-Type', 'application/json')
      .then((res) => {
        res.status.should.eql(200);
        res.should.be.json;
        res.body.should.have.property('badge');
      });
  });
  // Passing tests
  it('Should get all Badges', async () => {
    return chai
      .request(server)
      .get(`${route}`)
      .set(tokens.headerAdminUser)
      .set('Content-Type', 'application/json')
      .then((res) => {
        res.status.should.eql(200);
        res.should.be.json;
        res.body.should.have.property('badge');
      });
  });
  // Passing tests
  it('Should update a Badge', async () => {
    const id = await getBadge();
    return chai
      .request(server)
      .put(`${route}/${id}`)
      .set(tokens.headerAdminUser)
      .set('Content-Type', 'application/json')
      .send(data)
      .then((res) => {
        res.status.should.eql(201);
        res.should.be.json;
        res.body.should.have.property('badge');
        res.body.badge.name.should.eql(data.badge.name);
        res.body.badge.description.should.eql(data.badge.description);
      });
  });
  // Passing tests
  it('Should delete a badge Badge', async () => {
    const id = await getBadge();
    return chai
      .request(server)
      .delete(`${route}/${id}`)
      .set(tokens.headerAdminUser)
      .set('Content-Type', 'application/json')
      .then((res) => {
        res.status.should.eql(200);
        res.should.be.json;
        res.body.should.have.property('badge');
        res.body.badge.is_deleted.should.eql(true);
      });
  });
});
