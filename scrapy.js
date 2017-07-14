var scrapy = require('node-scrapy');
var db = require('./db.js');
const entities = require('entities');

function getShow(url){
  var source = url || 'http://www.officiallondontheatre.co.uk/london-shows/show/item381804/anatomy-of-a-suicide/'
  //var source = url || 'http://www.officiallondontheatre.co.uk/london-shows/show/item73606/wicked/'

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

  scrapy.scrape(source, showScheme, function(err, show) {
  	if (err) return console.error(err)
    console.log('Crawled show ', show.name);
    getGroupDetails(show);
  });

  
}

function getGroupDetails(show){
  const urlBase = 'http://www.groupline.com';
  const searchBase = urlBase + '/search/';
  var searchUrl = [searchBase + show.name.replaceAll(' ', '-'), show.theatre.name.replaceAll(' ', '-')];
  var showUrl = '';

  searchUrl = searchUrl.join('-');

  var moreInfo = {
    selector: '.product0 .eventMoreInfo',
    get: 'href'
  }

  // var price = {
  //   minSize: ''
  // }

  scrapy.scrape(searchUrl, moreInfo, function(err, data) {
    if (err) return console.error(err);
    showUrl = urlBase + data;

    scrapy.scrape(showUrl, '.groupsInfo', function(err, groupInfo){
      if (err) return console.error(err);
      console.log(groupInfo);
      show.groupBookingDetails = groupInfo;
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