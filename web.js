#!/usr/bin/env node
var express = require("express");
var app = express();
var spidy = require('./scrapy.js');
var linkbot = require("./spooky.js");

// spidy.run();
// spidy.run('http://www.officiallondontheatre.co.uk/london-shows/show/item372366/half-a-sixpence/');
// spidy.run('http://www.officiallondontheatre.co.uk/london-shows/show/item270484/kinky-boots/');
linkbot.fetch(200);
// //save delta to db??

setTimeout(function(){
    console.log('================ Starting Individual.. ================')
    var links = linkbot.links();
    
    links.forEach(function(link){
            spidy.run(link);
    });
}, 20000);

app.use(express.logger());

// app.get('/links', function(request, response) {
//     if (!linkbot.links()){
//         showsbot.fetch(linkbot.links()); 
//     }
//     response.send(showsbot.shows());
// });

// app.get('/', function(request, response) {
//     if (!linkbot.links()){
//         showsbot.fetch(linkbot.links()); 
//     }
//     response.send(showsbot.shows());
// });

// app.get('/:rows', function(request, response) {
//     linkbot.fetch(request.params.rows);
//     response.send();
// });

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});