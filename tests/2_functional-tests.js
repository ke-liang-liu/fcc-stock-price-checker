/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'should be an object');
          assert.property(res.body, 'stockData', 'should have stockData')
          assert.property(res.body.stockData, 'stock', 'should have stock');
          assert.property(res.body.stockData, 'price', 'should have price');
          assert.property(res.body.stockData, 'likes', 'should have likes');
          assert.isString(res.body.stockData.stock, 'should be a string');
          assert.isNumber(res.body.stockData.price, 'should be a string');
          assert.isNumber(res.body.stockData.likes, 'should be a number');
          assert.equal(res.body.stockData.stock, 'GOOG');
          assert.equal(res.body.stockData.likes, 0); 
          done();
        });
      });
      
      test.only('1 stock with like', function(done) {
        chai.request(server)
          .get('/api/stock-prices')
          .query( {stock: 'goog', like: 'true'} )
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'should be an object');
            assert.property(res.body, 'stockData', 'should have stockData')
            assert.property(res.body.stockData, 'stock', 'should have stock');
            assert.property(res.body.stockData, 'price', 'should have price');
            assert.property(res.body.stockData, 'likes', 'should have likes');
            assert.isString(res.body.stockData.stock, 'should be a string');
            assert.isNumber(res.body.stockData.price, 'should be a string');
            assert.isNumber(res.body.stockData.likes, 'should be a number');
            assert.equal(res.body.stockData.stock, 'GOOG');
            // assert.equal(res.body.stockData.likes, 1);
            done();
        })
        
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        
      });
      
      test('2 stocks', function(done) {
        
      });
      
      test('2 stocks with like', function(done) {
        
      });
      
    });

});
