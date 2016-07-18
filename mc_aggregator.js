/*jshint esversion:6, node:true */
"use strict";
let amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    ch.assertQueue('monteCarlo-2', {durable: true}, function(){
      ch.prefetch(1);
      ch.consume('monteCarlo-2', function(msg) {
        let data = JSON.parse(msg.content.toString());
        let id = data.id;
        let n = data.n;
        let i = 0;
        let sum = 0;

        function finished(){
          console.log("mc:"+id+", result:"+sum/n);
          ch.ack(msg);
        }

        function getAndSum(){
          ch.get('monteCarlo-2-'+id, {}, function(err, msg2) {
            let data = JSON.parse(msg2.content.toString());
            sum += data.result;
            ch.ack(msg2);
            i++;
            if(i<n) setImmediate(getAndSum);
            else finished();
          });
        }

        getAndSum();
      });
    });
  });
});
