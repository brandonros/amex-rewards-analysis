# amex-rewards-analysis

AmEx rewards offers analyzed

## 1. Navigate to https://global.americanexpress.com/rewards/gift-cards while logged in

## 2. Pop Developer Console -> Network tab -> /gift-cards response (must be captured here since __INITIAL_STATE__ is deleted from DOM on rehydration)

## 3. Manually by hand extract the nested weird GiftCardPartnerBrand format and put it into `./brands.json`

## 4. Run analysis

```shell
./analysis.ts
```
