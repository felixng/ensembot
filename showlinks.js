var Spooky = require('spooky');
const prefix = 'http://www.officiallondontheatre.co.uk'
var links = '';

function get(){
    return links;
}

function fetch(rows) {
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
              this.emit('return', this.evaluate(function () {
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

    spooky.on('return', function (result) {
        links = Array.prototype.map.call(result, function (link) {
            return prefix + link
        });
        console.log(links);
    });

    spooky.on('log', function (log) {
        if (log.space === 'remote') {
            console.log(log.message.replace(/ \- .*/, ''));
        }
    });
}

module.exports = {
  links: get,
  fetch: fetch,
}