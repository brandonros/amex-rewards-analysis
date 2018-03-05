var fs = require('fs');

var pointsBalance = 100000;

var amexData = JSON.parse(fs.readFileSync('amex.json')).filter(function(element) {
  return element.dollarAmount >= 10; /* filter out things like movie + cruise tickets */
});

var cardpoolData = JSON.parse(fs.readFileSync('cardpool.json')).items.filter(function(element) {
  return element.directSale; /* filter out marketplace certificates */
});

var cardpoolAmexMap = {
  "Athleta": "athleta",
  "Avis®": "avis-car-rental",
  "Banana Republic": "banana-republic",
  "Barnes & Noble": "barnes-noble",
  "Bath & Body Works": "bath-body-works",
  "Benihana": "benihana",
  "Best Buy": "best-buy",
  "Best Western Hotels & Resorts": "best-western",
  "Bonefish Grill": "bonefish-grill",
  "Brooks Brothers": "brooks-brothers",
  "California Pizza Kitchen": "california-pizza-kitchen",
  "Carnival Corporation": "carnival-cruise-line",
  "CB2": "cb2",
  "Chili's® Grill & Bar": "chilis",
  "Coach": "coach",
  "Crate and Barrel": "crate-barrel",
  "Darden Restaurants": "darden-restaurants",
  "Delta": "delta-airlines",
  "Eddie V's": "eddie-vs-prime-seasfood",
  "Fleming's Prime Steakhouse & Wine Bar": "flemings-steakhouse",
  "Four Seasons": "four-seasons",
  "Gap": "gap",
  "Hotels.com": "hotelscom",
  "iTunes®": "itunes",
  "Legal Sea Foods": "legal-sea-foods",
  "Lettuce Entertain You® Enterprises, Inc. ": "lettuce-entertain-you",
  "Macy's": "macys",
  "Maggiano's Little Italy®": "maggianos-little-italy",
  "Marriott": "marriott",
  "Morton's The Steakhouse": "mortons-the-steakhouse",
  "Neiman Marcus": "neiman-marcus",
  "Nike": "nike",
  "Nordstrom": "nordstrom",
  "Old Navy": "old-navy",
  "P.F. Chang's®": "pf-changs",
  "Panera Bread": "panera-bread",
  "Pottery Barn": "pottery-barn",
  "Ralph Lauren": "ralph-lauren",
  "REI": "rei",
  "Ruth's Chris Steak House": "ruths-chris-steakhouse",
  "Saks Fifth Avenue": "saks-fifth-avenue",
  "Sam's Club": "sams-club",
  "Seasons 52": "seasons-52",
  "Sephora": "sephora",
  "Spafinder Wellness 365": "Spafinder",
  "Staples®": "staples",
  "Starbucks Card": "Starbucks",
  "Target GiftCardTM": "target",
  "The Capital Grille": "capital-grille",
  "The Cheesecake Factory®": "cheesecake-factory",
  "The Home Depot®": "home-depot",
  "The Land of Nod": "land-of-nod",
  "Tiffany &  Co.": "tiffany-co",
  "Victoria's Secret": "victorias-secret",
  "Walmart": "walmart",
  "west elm": "west-elm",
  "Whole Foods Market": "whole-foods",
  "Williams-Sonoma": "williams-sonoma",
  "Zappos.com": "zappos"
};

var mappedCardpoolAmexData = Object.keys(cardpoolAmexMap).filter(function(brandName) {
  var slug = cardpoolAmexMap[brandName];

  if (!slug) {
    console.error('Missing slug', brandName);
    return false;
  }

  var amexEntry = amexData.find(function(element) {
    return element.brandName === brandName;
  });

  var cardpoolEntry = cardpoolData.find(function(element) {
    return element.slug === slug;
  });

  if (!cardpoolEntry) {
    console.error('Missing Cardpool data', brandName);
    return false;
  }

  if (!amexEntry) {
    console.error('Missing Amex data', brandName);
    return false;
  }

  return true;
})
.map(function(brandName) {
  var slug = cardpoolAmexMap[brandName];

  var amexEntry = amexData.find(function(element) {
    return element.brandName === brandName;
  });

  var cardpoolEntry = cardpoolData.find(function(element) {
    return element.slug === slug;
  });

  return {
    amexEntry: amexEntry,
    cardpoolEntry: cardpoolEntry,
    dollarValue: (pointsBalance / amexEntry.pointsPerDollar) * (1 - cardpoolEntry.acquireCashDiscount),
    amazonValue: (pointsBalance / amexEntry.pointsPerDollar) * (1 - cardpoolEntry.acquireAmazonDiscount)
  };
});

mappedCardpoolAmexData.sort(function(a, b) {
  return b.dollarValue - a.dollarValue;
});

console.log(mappedCardpoolAmexData[0]);
