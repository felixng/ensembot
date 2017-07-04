var scrapy = require('node-scrapy')

function crawlShows(url){
  var source = url || 'http://www.officiallondontheatre.co.uk/london-shows/show/item381804/anatomy-of-a-suicide/'

  var show =
      { name: {
          selector: 'h1',
          get: 'html',
          transform: function(){
            return this.replace(/<small(.*?)small>/, "");
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
        twitter: { selector: '.twitter',
          get: 'href' },
        facebook: { selector: '.facebook',
          get: 'href' } 
      }

  scrapy.scrape(source, show, function(err, data) {
  	if (err) return console.error(err)
      console.log('Crawled show links...')
      console.log(data);
  });

}

module.exports = {
	run: crawlShows,
};