# amex-rewards-analysis

AmEx rewards offers analyzed

## How to use

```shell
# Navigate to https://global.americanexpress.com/rewards/gift-cards while logged in
# Pop Developer Console -> Network tab -> /gift-cards response (must be captured here since __INITIAL_STATE__ is deleted from DOM on rehydration)
# Manually by hand extract the nested weird GiftCardPartnerBrand format and put it into `./brands.json`
# Run analysis
./analyze.ts
```
