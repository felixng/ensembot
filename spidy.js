var scrapy = require('node-scrapy')

function crawlShows(url){
  var source = url || 'http://www.officiallondontheatre.co.uk/london-shows/show/item270484/kinky-boots/'
  var links =
      { showLinks: 
        { selector: '.linkedShowsContainer a',
          get: 'href' } }

  var show =
      { name: 'h1',
        twitter: 
        { selector: '.twitter',
          get: 'href' } }

  scrapy.scrape(source, show, function(err, data) {
	if (err) return console.error(err)
    console.log('Crawled show links...')
    console.log(data);
  });

}

module.exports = {
	run: crawlShows,
};