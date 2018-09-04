const {expect} = require('chai');
const request = require("request");
const server = require('../app');

describe('/GET', () => {
  before(done => {
    server.listen(3000, '127.0.0.1', done);
  });

  it('it should GET index', (done) => {
    request('http://127.0.0.1:3000', (err, response, body) => {
      expect(response.statusCode)
        .to
        .have
        .equal(200);
      done()
    })
  });

});