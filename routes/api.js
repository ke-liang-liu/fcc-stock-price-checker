/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';
var request = require('request');
// var expect = require('chai').expect;
var MongoClient = require('mongodb');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  
  app.route('/api/stock-prices')
    .get(function (req, res){
    
      //*** set likes fields ***/
      console.log('req.query.like:')
      console.log(req.query.like);
      if (req.query.like === 'true' || req.query.like === true) {
        var ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g;
        // req.ip
        // req.connection.remoteAddress
        // req.headers['x-forwarded-for'] 49.180.30.82,::ffff:10.10.10.82,::ffff:10.10.93.13
        var ip = req.headers['x-forwarded-for'].match(ipRegex)[0];
        if (typeof req.query.stock === "string") {
          var likes = {};
          likes.ticker = req.query.stock.toUpperCase();
          likes.ip = ip;
        } else if (Array.isArray(req.query.stock)) {
          var likes1 = {};
          var likes2 = {};
          likes1.ticker = req.query.stock[0].toUpperCase();
          likes2.ticker = req.query.stock[1].toUpperCase();
          likes1.ip = ip;
          likes2.ip = ip;
        }
      }
      
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        const db = client.db('test2');
        if (likes) {
          db.collection('stockTickerLikes').insertOne(likes, function(err, result) {
            if (err) { console.log(err) }
          });
        } else if (likes1 && likes2) {
          db.collection('stockTickerLikes').insertMany([likes1, likes2], {ordered: false}, function(err, result) {
            if (err) { console.log(err)};
          })
        }
      }); // end of DB connection for insert()
      
      
      
      MongoClient.connect(CONNECTION_STRING, function(err, client) {
        const db = client.db('test2');
        //*** set all the fields ***/
        if (typeof req.query.stock === 'string') {
          var resObj = { stockData: {} };
          let ticker = req.query.stock.toUpperCase();
          let url = `https://repeated-alpaca.glitch.me/v1/stock/${ticker}/quote`;
          request( {method: 'GET', uri: url}, function(error, response, body) {
            if (error) {console.error('error:', error)};
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            var body = JSON.parse(body);
            resObj.stockData.stock = ticker;
            resObj.stockData.price = body.latestPrice;
            resObj.stockData.likes = 0;

              db.collection('stockTickerLikes').find({ticker: ticker}).count(function(err, count) {
                if (err) { console.log(err) }
                resObj.stockData.likes = count;
                res.json(resObj);
              })

          })
        } else if (Array.isArray(req.query.stock)) {
          var resObj = { stockData: [{}, {}] };
          let ticker1 = req.query.stock[0].toUpperCase();
          let ticker2 = req.query.stock[1].toUpperCase();
          let url1 = `https://repeated-alpaca.glitch.me/v1/stock/${ticker1}/quote`;
          let url2 = `https://repeated-alpaca.glitch.me/v1/stock/${ticker2}/quote`;
          request( {method: 'GET', uri: url1}, function(error, response, body1) {
            if (error) {console.error('error:', error)};
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            var body1 = JSON.parse(body1);
            resObj.stockData[0].stock = ticker1;
            resObj.stockData[0].price = body1.latestPrice;
            request( {method: 'GET', uri: url2}, function(error, response, body2) {
              if (error) {console.error('error:', error)};
              console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
              var body2 = JSON.parse(body2);
              resObj.stockData[1].stock = ticker2;
              resObj.stockData[1].price = body2.latestPrice;
              db.collection('stockTickerLikes').find({ticker: ticker1}).count(function(err, count1) {
                if (err) { console.log(err) }
                db.collection('stockTickerLikes').find({ticker: ticker2}).count(function(err, count2) {
                  if (err) { console.log(err) }
                  resObj.stockData[0].rel_likes = count1 - count2;
                  resObj.stockData[1].rel_likes = count2 - count1;
                  res.json(resObj);
                })
              })
              
            })
          });

        }
      }) //end of DB connection for find();
    });
};
