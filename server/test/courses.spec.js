const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index');
const assert = chai.assert;
const tokens = require('./_tokens');


chai.should();
chai.use(chaiHttp);

const route = '/api/v1/courses/';
const itemID = 'course10';
const data = {
  'course': {
    'id': itemID,
    'name': 'Testing Course Path',
    'slug': 'source-course-route',
    'description': 'Colection of modules.',
    'status': 'published',
    'creatorId': 'user3',
    'modules': ['module1', 'module2']
  }
};

const putData = {
  'course': {
    'name': 'PUT update works',
    'modules': ['module1']
  }
};

const invalidData = {
  'course': {
    'id': itemID,
    'name': 'Testing Course Path',
    'slug': 'source-learning-path',
    'description': 'Colection of modules.',
    'status': 'published'
  }
};

describe('COURSES ROUTES', () => {
  // Failing tests
  it('Should throw an ERROR on POST with invalid data', done => {
    chai
      .request(server)
      .post(route)
      .set('Content-Type', 'application/json')
      .set(tokens.headersSuperAdmin1)
      .send(invalidData)
      .end((err, res) => {
        res.status.should.eql(400);
        res.should.be.json;
        res.body.should.be.an('object');
        res.body.errors[0].should.eql('Bad Request');
        done();
      });
  });
  it('Should throw an ERROR on PUT with invalid path', done => {
    chai
      .request(server)
      .put(route + 'dirty-example-34')
      .set('Content-Type', 'application/json')
      .set(tokens.headersSuperAdmin1)
      .send(putData)
      .end((err, res) => {
        res.status.should.eql(400);
        res.should.be.json;
        res.body.errors[0].should.eql('That course does not exist');
        done();
      });
  });
  it('Should throw an ERROR on GET req using invalid query', done => {
    chai
      .request(server)
      .get(route + '?slug=a-learning')
      .set(tokens.headersSuperAdmin1)
      .end((err, res) => {
        res.should.have.status(200);
        assert.equal(res.body.course.length, 0);
        done();
      });
  });
  // Passing tests
  it('Should CREATE a course-route record on POST with valid data and return a JSON object', done => {
    chai
      .request(server)
      .post(route)
      .set('Content-Type', 'application/json')
      .set(tokens.headersSuperAdmin1)
      .send(data)
      .end((err, res) => {
        res.status.should.eql(201);
        res.should.be.json;
        res.body.should.have.property('course');
        done();
      });
  });
  it('Should list ALL course-route on GET', done => {
    chai
      .request(server)
      .get(route)
      .set(tokens.headersSuperAdmin1)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.course[0].should.have.property('id');
        res.body.course[0].should.have.property('name');
        res.body.course[0].should.have.property('slug');
        res.body.course[0].should.have.property('creatorId');
        res.body.course[0].modules[0].should.have.property('id');
        res.body.course[0].modules[0].should.have.property('type');
        res.body.course[0].modules[0].type.should.eql('modules');
        res.body.course[0].enrollments[0].should.have.property('id');
        res.body.course[0].enrollments[0].type.should.eql('enrollments');

        done();
      });
  });
  it('Should list ONE course item on GET', done => {
    chai
      .request(server)
      .get(route + itemID)
      .set(tokens.headersSuperAdmin1)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.course.should.have.property('id');
        res.body.course.should.have.property('name');
        res.body.course.should.have.property('slug');
        res.body.course.should.have.property('creatorId');
        done();
      });
  });
  it('Should list ONE course-route item on GET', done => {
    chai
      .request(server)
      .get(route + itemID + '?slug=source-course-route')
      .set(tokens.headersSuperAdmin1)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.json;
        res.body.course.should.have.property('id');
        res.body.course.should.have.property('name');
        res.body.course.should.have.property('slug');
        res.body.course.should.have.property('creatorId');
        done();
      });
  });

  it('Should UPDATE a course-route record on PUT', done => {
    chai
      .request(server)
      .put(route + itemID)
      .set('Content-Type', 'application/json')
      .set(tokens.headersSuperAdmin1)
      .send(putData)
      .end((err, res) => {
        res.status.should.eql(201);
        res.should.be.json;
        res.body.course.name.should.eql('PUT update works');
        done();
      });
  });
  it('Should DELETE a course-route record on DELETE /:id return deleted JSON object', done => {
    chai
      .request(server)
      .delete(route + itemID)
      .set('Content-Type', 'application/json')
      .set(tokens.headersSuperAdmin1)
      .end((err, res) => {
        res.status.should.eql(200);
        res.should.be.json;
        res.body.should.have.property('course');
        done();
      });
  });
});
