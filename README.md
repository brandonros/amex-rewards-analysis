# amex-cardpool-arbitrage

AmEx rewards offers sold to Cardpool at the best rates

## 1. Navigate to https://global.americanexpress.com/rewards/gift-cards while logged in

## 2. Pop Developer Console and paste in latest jQuery source

## 3. Extract AmEx data by running this script (save to amex.json):

```
JSON.stringify($('[class*=GiftCard__brandName__]').toArray().map(function(selector) {
  $(selector).trigger('click');

  var brandName = $('[class*=Detail__brand__]').text();
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
}));
```

## 4. Pull CardPool inventory data

```
$ curl 'https://www.cardpool.com/api/inventories/acquireProductLineSummaries' -o cardpool.json
```

## 5. Map results looking for best current rates

```
$ node arbitrage.js
```