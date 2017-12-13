# amex-cardpool-arbitrage
AmEx rewards offers sold to Cardpool at the best rates

## 1. Pull AmEx data off of https://global.americanexpress.com/rewards/gift-cards by running this in the console (must be logged in to see offers)

```
var amexData = $('.GiftCard__brandName___3-T2Y').toArray().map(function(selector) {
  $(selector).trigger('click');

  var brandName = $('.Detail__brand___K-5p6').text();
  var dollarAmount = $('label[for="denomination-0"] span:nth(1)').text().trim().trimLeft();
  var pointsAmount;

  var offerElement = $('label[for="denomination-0"] .dls-accent-red-01');

  if (offerElement.length) {
    pointsAmount = offerElement.text().replace('now', '').replace('points', '').trim().trimLeft();
  }

  else {
    pointsAmount = $('label[for="denomination-0"] span:nth(2)').text().replace('now', '').replace('points', '').trim().trimLeft().replace(',', '');
  }

  brandName = brandName.replace('offer', '');

  dollarAmount = parseFloat(dollarAmount.replace('$', ''));
  pointsAmount = parseFloat(pointsAmount.replace(',', ''));

  return {
    brandName: brandName,
    dollarAmount: dollarAmount,
    pointsAmount: pointsAmount,
    pointsPerDollar: pointsAmount / dollarAmount,
    dollarPerPoint: dollarAmount / pointsAmount
  };
});
```

## 2. Pull CardPool inventory data

```
$ curl 'https://www.cardpool.com/api/inventories/acquireProductLineSummaries' 
```

## 3. Map results looking for best current rates

```
$ node arbitrage.js
```