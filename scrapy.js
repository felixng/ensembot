var scrapy = require('node-scrapy');
var db = require('./db.js');
var decode = require('decode-html');

function crawlShows(url){
  var source = url || 'http://www.officiallondontheatre.co.uk/london-shows/show/item381804/anatomy-of-a-suicide/'

  var show =
      { name: {
          selector: 'h1',
          get: 'html',
          transform: function(){
            return decode(this.replace(/<small(.*?)small>/, ""));
          }
        },
        theatre: {
          name: '#venue h2',
          address: '.address',
          website: '#venue address a'
        },
        genre: '.show-Meta dl.hr-bottom dd:nth-child(4)',
        showTime: '.show-Meta dl.hr-bottom dd:nth-child(6)',
        duration: '.show-Meta dl.hr-bottom dd:nth-child(8)',
        previewFrom: '.show-Meta dl.hr-bottom dd:nth-child(10)',
        openingNight: '.show-Meta dl.hr-bottom dd:nth-child(12)',
        showingUntil: '.show-Meta dl.hr-bottom dd:nth-child(14)',
        confirmedClosing: {
          selector: '.show-Meta dl.hr-bottom dt:nth-child(13)',
          transform: function(){
            return (this.toString().indexOf('Closing') !== -1);
          }
        },
        twitter: { selector: '.twitter',
          get: 'href' },
        facebook: { selector: '.facebook',
          get: 'href' } 
      };

  scrapy.scrape(source, show, function(err, data) {
  	if (err) return console.error(err)
      console.log('Crawled show ', data.name);
      //db.process(data);
  });

}

module.exports = {
	run: crawlShows,
};