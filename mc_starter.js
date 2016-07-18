/*jshint esversion:6, node:true */
"use strict";
let amqp = require('amqplib/callback_api');

function generateUuid() {
  return (~~(Math.random()*100000)).toString();
}

let getGaussian = (function(){
  let pi2 = Math.PI*2;
  let stock;
  return function(){
    if(stock === undefined){
      let u1 = Math.random();
      let u2 = Math.random();
      let t1 =  Math.sqrt(-2* Math.log(u1));
      let t2 = pi2*u2;
      let s1 = t1* Math.cos(t2);
      let s2 = t1* Math.sin(t2);
      stock = s1;
      return s2;
    }
    let s = stock;
    stock = undefined;
    return s;
  };
}());

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
      let id = generateUuid();
      let q2 = 'monteCarlo-1-'+id;
      let n = 100000;
      let spot = 3279.42;
      let strike = 3250;
      let r = 0.02;
      let vol = 0.20;
      let T = 1.0;
      ch.assertQueue(q2, {durable: true}, function(){
        for(let i=0;i<n-1;i++) ch.sendToQueue(q2, new Buffer("again"), {persistent: true});
        ch.sendToQueue(q2, new Buffer(n.toString()), {persistent: true});
        ch.assertQueue('monteCarlo-1', {durable: true}, function(){
          for(let i=0;i<n;i++){
            let data = {rnd: getGaussian(),strike,spot,r,T,vol,id};
            ch.sendToQueue('monteCarlo-1', new Buffer(JSON.stringify(data)), {persistent: true});
          }
        });
      });
  });
  function wait(){ setTimeout(wait, 500); }
  wait();
});
