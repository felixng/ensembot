#!/usr/bin/env node

var express = require("express");
var app = express();
var Spooky = require('spooky');

var links = '';

function run(rows) {
    var spooky = new Spooky({
            child: {
                transport: 'http'
            },
            casper: {
                logLevel: 'debug',
                verbose: true
            }
        }, function (err) {
            if (err) {
                e = new Error('Failed to initialize SpookyJS');
                e.details = err;
                throw e;
            }

            spooky.start(
                'http://www.officiallondontheatre.co.uk/london-shows/venue/#/?rows=' + rows + '&q=&sort=title_for_sorting_sortable%20asc');
            spooky.then(function () {
                this.emit('hello', this.evaluate(function () {
                    links = document.querySelectorAll('.linkedShowsContainer .searchResults a');
                    return Array.prototype.map.call(links, function (e) {
                        return e.getAttribute('href')
                    });
                }));
            });
            spooky.run();
        });

    spooky.on('error', function (e, stack) {
        console.error(e);

        if (stack) {
            console.log(stack);
        }
    });

    // Uncomment this block to see all of the things Casper has to say.
    // There are a lot.
    // He has opinions.
    spooky.on('console', function (line) {
        console.log(line);
    });

    spooky.on('hello', function (input) {
        console.log(input);
        links = input;
    });

    spooky.on('log', function (log) {
        if (log.space === 'remote') {
            console.log(log.message.replace(/ \- .*/, ''));
        }
    });

}

run(200);

app.use(express.logger());
app.get('/', function(request, response) {
    response.send(links);
});

app.get('/:rows', function(request, response) {
    run(request.params.rows);
    response.send();
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});