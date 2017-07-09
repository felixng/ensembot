#!/usr/bin/env node
require('newrelic');
var express = require("express");
var app = express();
var spidy = require('./scrapy.js');
var linkbot = require("./spooky.js");
var db = require("./db.js");

// spidy.run();
// spidy.run('http://www.officiallondontheatre.co.uk/london-shows/show/item372366/half-a-sixpence/');
// spidy.run('http://www.officiallondontheatre.co.uk/london-shows/show/item270484/kinky-boots/');

var fetch = function (){
	linkbot.fetch(200);		

	setTimeout(function(){
		var result = {
			date: Date()
		}
		result.links = linkbot.links();
		db.logLinks(result);

		getIndividuals(result.links);
	}, 20000);
}

var getIndividuals = function (links){
    console.log('================ Starting Individual.. ================')
    
    links.forEach(function(link){
        spidy.run(link);
    });
}

app.use(express.logger());

app.get('/fetch', function(request, response) {
    fetch();
    response.send();
});

app.get('/', function(request, response) {
    
});

// app.get('/:rows', function(request, response) {
//     linkbot.fetch(request.params.rows);
//     response.send();
// });

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});