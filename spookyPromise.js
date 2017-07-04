var Spooky = require('spooky');

var opts = {
  child: {
    transport: 'http'
  },
  casper: {
    pageSettings: {
      loadImages: false,
      loadPlugins: false
    },
    logLevel: "debug",
    verbose: true
  }
};

function createSpooky() {
  return new Promise(function (resolve, reject) {
    var spooky = new Spooky(opts, function (err) {
      if (err) {
        var e = new Error('Failed to initialize SpookyJS');
        e.details = err;
        reject(e);
      }

      resolve({spooky: spooky});
    });
  });
}

function fetch(){
  createSpooky()
    .then(function appendErrorEvent(res) {
      console.log('appendErrorEvent', Object.getOwnPropertyNames(res));
      if (res.spooky) {
        res.spooky.on('error', function (e, stack) {
          console.error(e);
          if (stack) {
            console.log(stack);
          }
        });
        return res;
      }
      throw new Error('Failed to appendErrorEvent');
    })
    .then(function appendLogEvent(res) {
      console.log('appendLogEvent', Object.getOwnPropertyNames(res));
      if (res.spooky) {
        res.spooky.on('log', function (log) {
          if (log.space === 'remote') {
            console.log(log.message.replace(/ \- .*/, ''));
          }
        });
        return res;
      }
      throw new Error('Failed to appendLogEvent');
    })
    .then(function appendConsoleEvent(res) {
      console.log('appendConsoleEvent', Object.getOwnPropertyNames(res));
      if (res.spooky) {
        res.spooky.on('console', function (line) {
          console.log(line);
        });
        return res;
      }
      throw new Error('Failed to appendConsoleEvent');
    })
    .then(function runMainFunction(res) {
      console.log('runMainFunction', Object.getOwnPropertyNames(res));
      if (res.spooky) {
        res.spooky.start(
          'http://www.officiallondontheatre.co.uk/london-shows/venue/#/?rows=4&q=&sort=title_for_sorting_sortable%20asc');
        res.spooky.then(function emitLinks() {
          result = this.evaluate(function () {
                      links = document.querySelectorAll('.linkedShowsContainer .searchResults a');
                      prefix = 'http://www.officiallondontheatre.co.uk'
                      return Array.prototype.map.call(links, function (e) {
                          return prefix + e.getAttribute('href')
                      });
                  });
          this.emit('grabShow', result);
        });
        res.spooky.run();
        return res;
      }
      throw new Error('Failed to runMainFunction');
    })
    .then(function appendHelloEvent(res) {
      console.log('appendHelloEvent', Object.getOwnPropertyNames(res));
      if (res.spooky) {
        res.spooky.on('grabShow', function ongrabShow(links) {
          console.log(links);
          // links.forEach(function(link){
          //   console.log(link);
          //   res.spooky.thenOpenAndEvaluate(link, function(){
          //     console.log('=============================');
          //   })
          // })

          res.spooky.eachThen(links, function(response) {
            this.thenOpen(response.data, function(response) {
              console.log('Opened', response.url);
              
            });
            var show = this.evaluate(function () {
                return {
                  twitter: document.querySelector('a.twitter')
                }
            });

            this.emit('console', '==============twitter: ' + show.twitter.getAttribute('href') + ' =============');
          })
        });
        return res;
      }
      throw new Error('Failed to appendHelloEvent');
    })
    .catch(function (err) {
      console.error(err);
    });
}

module.exports = {
  fetch: fetch,
}