/*jshint esversion:6, node:true */
"use strict";
let amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    ch.assertQueue('monteCarlo-1', {durable: true}, function(){
      ch.assertQueue('monteCarlo-2', {durable: true}, function(){
        ch.prefetch(1);
        ch.consume('monteCarlo-1', function(msg) {
          let data = JSON.parse(msg.content.toString());
          let rnd = data.rnd;
          let strike = data.strike;
          let spot = data.spot;
          let vol = data.vol;
          let r = data.r;
          let T = data.T;
          let spotFinal = spot*Math.exp((r-vol*vol/2)*T+vol*Math.sqrt(T)*rnd);
          let id = data.id;
          let result = Math.max(spotFinal - strike,0);
          data.result = result;
          ch.assertQueue('monteCarlo-2-'+id, {durable: true}, function(){
            ch.sendToQueue('monteCarlo-2-'+id, new Buffer(JSON.stringify(data)), {persistent: true});
            let res = ch.get('monteCarlo-1-'+id, {}, function(err, msg2) {
              if(!msg2){
                console.log("the montecarlo process "+id+" is broken");
                ch.ack(msg);
                return;
              }
              let str = msg2.content.toString();
              if(str != "again"){
                var n = parseInt(str);
                ch.sendToQueue('monteCarlo-2', new Buffer(JSON.stringify({id,n})), {persistent: true});
              }
              ch.ack(msg);
              ch.ack(msg2);
            });
          });
        });
      });
    });
  });
});
