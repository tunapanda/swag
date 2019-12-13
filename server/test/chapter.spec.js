const chai = require('chai');
const assert = chai.assert;
const chaiHttp = require('chai-http');
const chaiJSON = require('chai-json-schema');
const server = require('../index');
const chapterSchema = require('../db/json_schema/chapterSchema');


chai.should();
chai.use(chaiHttp);
chai.use(chaiJSON);

const route = '/api/v1/chapters/';
const itemID = 'chapter19';
const data = {
  'chapter': {
    'id': itemID,
    'name': 'Testing chapter Path',
    'slug': 'testing-chapter-path',
    'description': 'Testing chapter route',
    'status': 'published',
    'lessonId': 'lesson1',
    'creatorId': 'user3'
  }
};

const putData = {
  'chapter': {
    'name': 'PUT update works'
  }
};

const invalidData = {
  'chapter': {
    'id': itemID,
    'name': 'Testing Chapter Route',
    'slug': 'testing-chapter-route',
    'description': 'Testing chapter route',
    'status': 'draft'
  }
};


describe('CHAPTER ROUTE', () => {
  // Failing tests
  it('Should throw an ERROR on POST with invalid data', done => {
    chai
      .request(server)
      .post(route)
      .set('Content-Type', 'application/json')
      .send(invalidData)
      .end((err, res) => {
        res.status.should.eql(400);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.property('errors');
        res.body.errors.should.have.property('creatorId');
        res.body.errors.should.have.property('lessonId');
        done();
      });
  });
  it('Should throw an ERROR on PUT with invalid path', done => {
    chai
      .request(server)
      .put(route + itemID)
      .set('Content-Type', 'application/json')
      .send(putData)
      .end((err, res) => {
        res.status.should.eql(400);
        res.should.be.json;
        res.body.message.should.eql('No chapter with that ID');
        done();
      });
  });
  it('Should throw an ERROR on GET req using invalid query', done => {
    chai
      .request(server)
      .get(route + '?slug=a-learning')
      .end((err, res) => {
        res.should.have.status(200);
        assert.equal(res.body.chapter.length, 0);
        done();
      });
  });
  // Passing tests
  it('Should CREATE a chapter record on POST with valid data and return a JSON object', done => {
    chai
      .request(server)
      .post(route)
      .set('Content-Type', 'application/json')
      .send(data)
      .end((err, res) => {
        res.status.should.eql(201);
        res.should.be.json;
        res.body.should.have.property('chapter');
        assert.jsonSchema(res.body.chapter, chapterSchema);
        done();
      });
  });
  it('Should list ALL chapter on GET', done => {
    chai
      .request(server)
      .get(route)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.chapter[0].should.have.property('id');
        res.body.chapter[0].should.have.property('name');
        res.body.chapter[0].should.have.property('slug');
        res.body.chapter[0].should.have.property('creatorId');
        res.body.chapter[0].should.have.property('lesson');
        done();
      });
  });
  it('Should list ONE chapter item on GET', done => {
    chai
      .request(server)
      .get(route + itemID)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.chapter.should.have.property('id');
        res.body.chapter.should.have.property('name');
        res.body.chapter.should.have.property('slug');
        res.body.chapter.should.have.property('creatorId');
        done();
      });
  });

  it('Should list ONE chapter item on GET', done => {
    chai
      .request(server)
      .get(route + '?slug=testing-chapter-path')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.chapter[0].should.have.property('id');
        res.body.chapter[0].should.have.property('name');
        res.body.chapter[0].should.have.property('slug');
        res.body.chapter[0].should.have.property('creatorId');
        done();
      });
  });
  it('Should UPDATE a chapter record on PUT', done => {
    chai
      .request(server)
      .put(route + itemID)
      .set('Content-Type', 'application/json')
      .send(putData)
      .end((err, res) => {
        res.status.should.eql(201);
        res.should.be.json;
        res.body.chapter.name.should.eql('PUT update works');
        done();
      });
  });
  it('Should DELETE a chapter record on DELETE /:id return deleted JSON object', done => {
    chai
      .request(server)
      .delete(route + itemID)
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        res.status.should.eql(200);
        res.should.be.json;
        res.body.should.have.property('chapter');
        done();
      });
  });
});
