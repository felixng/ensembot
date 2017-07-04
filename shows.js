var Spooky = require('spooky');
var shows = [];
const prefix = 'http://www.officiallondontheatre.co.uk'

function get(){
    return shows;
}

function fetch(links) {
    var spooky = new Spooky({
          child: {
              transport: 'http',
              port: 8082,
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

          if (!links){
              e = new Error('No links to get shows from!');
              e.details = err;
              throw e;
          }
          
          // spooky.start(links[0]);
          // spooky.then(function () {
          //   this.emit('speak', this.evaluate(function () {
          //       return document.title;
          //     })
          //   );
          //   // this.emit('speak', this.evaluate(function () {
          //   //       //links = document.querySelectorAll('.linkedShowsContainer .searchResults a');

          //   //       // return Array.prototype.map.call(links, function (e) {
          //   //       //     return e.getAttribute('href')
          //   //       // });
          //   //       return 'document.title';
          //   //   })
          //   // );
          // })
          

          // spooky.eachThen(links, function () {
          //     // links.forEach(function(link){
          //       this.emit('speak', link);
          //         // spooky.thenOpenAndEvaluate(link, function () {
          //         //     // this.emit('return', this.evaluate(function () {
          //         //     //     var show = {
          //         //     //       // name: document.querySelectorAll('.h1'),
          //         //     //       twitter: document.querySelectorAll('.twitter').getAttribute('href'),
          //         //     //     };
          //         //     //     console.log(show);
          //         //     //     return show;
          //         //     // }));
          //         // }); 
          //     // });
          // });

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
    // spooky.on('console', function (line) {
    //     console.log(line);
    // });

    spooky.on('speak', function (line) {
        console.log(line);
    });

    spooky.on('return', function (show) {
        console.log(show);
        shows.push(show);
    });

    spooky.on('log', function (log) {
        if (log.space === 'remote') {
            console.log(log.message.replace(/ \- .*/, ''));
        }
    });
}

module.exports = {
  fetch: fetch,
  shows: get,
}