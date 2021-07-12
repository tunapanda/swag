const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiJSON = require('chai-json-schema');

const server = require('../index');
const tokens = require('./_tokens');
const knex = require('../db/db');

chai.use(chaiHttp);
chai.use(chaiJSON);
chai.should();

const route = '/api/v1/ratings';

async function getSample(valid = true) {
  if (valid) {
    const chapter = (
      await knex('chapters')
        .select(['chapters.id'])
        .where({ approved: true })
        .limit(1)
    )[0];

    return {
      chapterId: chapter.id,
      reaction: 'like',
      metadata: {
        audioQuality: 1,
        contentAccuracy: 1,
        language: 2,
      },
    };
  }
}

describe('CHAPTER RATINGS ROUTE', () => {
  it('Should fetch existing chapter ratings', (done) => {
    chai
      .request(server)
      .get(route)
      .set(tokens.headerAdminUser)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.ratings[0].should.have.property('id');
        done();
      });
  });

  it('Should query existing chapter ratings to include respective review', (done) => {
    chai
      .request(server)
      .get(`${route}?include=review`)
      .set(tokens.headerAdminUser)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.ratings[0].should.have.property('id');
        res.body.ratings[0].should.have.property('review');
        done();
      });
  });

  // it('Should create chapter ratings', async () => {
  //   //clear everything to avoid conflict
  //   await knex('ratings').delete();
  //   const data = await getSample();
  //   return chai
  //     .request(server)
  //     .post(route)
  //     .set(tokens.headerAdminUser)
  //     .set('Content-Type', 'application/json')
  //     .send({ rating: data })
  //     .then((res) => {
  //       res.status.should.eql(201);
  //       res.should.be.json;
  //       res.body.should.have.property('rating');
  //     });
  // });

  it('Should update a chapter rating', async () => {
    const rating = (await knex('ratings').select().limit(1))[0];
    const data = await getSample();

    return chai
      .request(server)
      .put(`${route}/${rating.id}`)
      .set(tokens.headerAdminUser)
      .set('Content-Type', 'application/json')
      .send({ rating: data })
      .then((res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.rating.should.have.property('id');
        res.body.rating.should.have.property('metadata');
        res.body.rating.metadata.should.eql(data.metadata);
      });
  });

  it('Should delete a chapter rating', async () => {
    const rating = (await knex('ratings').select().limit(1))[0];

    return chai
      .request(server)
      .delete(`${route}/${rating.id}`)
      .set(tokens.headerAdminUser)
      .then((res) => {
        res.status.should.eql(200);
      });
  });
});
