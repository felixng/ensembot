var scrapy = require('node-scrapy');
var db = require('./db.js');
const entities = require('entities');

function getShow(url){
  //var source = url || 'http://www.officiallondontheatre.co.uk/london-shows/show/item381804/anatomy-of-a-suicide/'
  //var source = url || 'http://www.officiallondontheatre.co.uk/london-shows/show/item73606/wicked/'
  //var source = url || 'http://www.officiallondontheatre.co.uk/london-shows/show/item372366/half-a-sixpence/'
  var source = url || 'http://www.officiallondontheatre.co.uk/london-shows/show/item394161/around-the-world-in-80-days/'

  var showScheme =
      { name: {
          selector: 'h1',
          get: 'html',
          transform: function(){
            return entities.decodeHTML(this.replace(/<small(.*?)small>/, ""));
          }
        },
        theatre: {
          name: '#venue h2',
          address: '.address',
          website: '#venue address a'
        },
        genre: '.show-Meta dl.hr-bottom dt:contains(Genre) + dd',
        showTime: '.show-Meta dl.hr-bottom dt:contains(Show times) + dd',
        duration: '.show-Meta dl.hr-bottom dt:contains(Duration) + dd',
        previewFrom: '.show-Meta dl.hr-bottom dt:contains(Previews from) + dd',
        openingNight: '.show-Meta dl.hr-bottom dt:contains(Opening night) + dd',
        bookingUntil: '.show-Meta dl.hr-bottom dt:contains(Booking until) + dd',
        closing: '.show-Meta dl.hr-bottom dt:contains(Closing) + dd',
        twitter: { selector: '.twitter',
          get: 'href' },
        facebook: { selector: '.facebook',
          get: 'href' } 
      };

  scrapy.scrape(source, showScheme, function(err, show) {
  	if (err) return console.error(err)
    console.log('Crawled show', show.name);
    getGroupDetails(show);
  });

  
}

function getGroupDetails(show){
  const urlBase = 'http://www.groupline.com';
  const searchBase = urlBase + '/search/';
  const currency = '£';
  var searchUrl = [searchBase + show.name.replaceAll(' ', '-').replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''), 
                   show.theatre.name.replaceAll(' ', '-').replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')];
  searchUrl = searchUrl.join('-');

  var moreInfo = {
    selector: '.product0 .eventMoreInfo',
    get: 'href',
    prefix: urlBase,
  }

  scrapy.scrape(searchUrl, moreInfo, function(err, url) {
    if (err) return console.error(err);
    if (url == null) return db.process(show);

    var selectors = ['.groupsInfo p:contains(Groups)', 
                     '.groupsInfo p:contains(Valid)',
                     '.groupsInfo p:contains(valid)',
                     '.groupsInfo p:contains(Matinees)', 
                     '.groupsInfo p:contains(matinees)', 
                     '.groupsInfo p:contains(Matinee)', 
                     '.groupsInfo p:contains(matinee)', 
                     '.groupsInfo p:contains(Evenings)',
                     '.groupsInfo p:contains(evenings)',
                     '.groupsInfo p:contains(Evening)',
                     '.groupsInfo p:contains(evening)'];

    var paragraphSchema = {
      all: '.groupsInfo',
      filtered: selectors.join(',')
    }

    scrapy.scrape(url, paragraphSchema, function(err, data){
      if (err) return console.error(err);

      if (data.filtered){
        var groupInfo = data.filtered;

        var prices = [];
        var sizeRegex = /(?:^Groups of )(.*)(?=\+|:)/g
        var originalPriceRegex = /(?::|,)(?: )*(.*?)(?= r[a-z]+d to)/g  
        var groupPriceRegex = new RegExp("(?:r[a-z]+d to )(?:"+currency+")([0-9.]*)", 'g'); 

        for (var i = 0, len = groupInfo.length; i <= len; i++) {
          var array;
          var size = []; while(array = sizeRegex.exec(groupInfo[i])) size.push(array[1]);
          var originalPrice = []; while(array = originalPriceRegex.exec(groupInfo[i])) originalPrice.push(array[1]);
          var groupPrice = []; while(array = groupPriceRegex.exec(groupInfo[i])) groupPrice.push(array[1]);
          
          for (var p = 0, numberOfPrices = groupPrice.length; p < numberOfPrices; p++) {
            var price = {
              minSize: size[0],
              currency: currency,
              original: originalPrice[p],
              group: groupPrice[p],
            }
            
            prices.push(price);
          }

          if (groupPrice.length == 0) {
            for (var p = 0, numberOfPrices = prices.length; p < numberOfPrices; p++) {
              if (prices[p].restriction == null){
                prices[p].restriction = groupInfo[i];
              }
            }
          }
        }

        show.groupBookingDetails = {
          link: url,
          //debugInfo: groupInfo,
          info: data.all
        };
        show.prices = prices;
        show.group = true;

        //Add some sort of manual review status?
      }
      else{
        show.group = false;
      }

      db.process(show);
    });
  });

}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

module.exports = {
  getShow: getShow,
	getGroupDetails: getGroupDetails,
};