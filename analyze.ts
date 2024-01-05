#!/usr/bin/env npx ts-node

import fs from 'fs'
import assert from 'assert'

interface Brand {
    __typename: string
    notificationMessages: NotificationMessage[]
    identifier: string
    name: string
    description: string
    brandImages: BrandImage[]
    featuredIndicator: boolean
    selectionSequenceNumber: string
    categoryNames: string[]
    fulfillmentOptionTypes: string[]
    deliveryOptionTypes: string[]
    recommenderEvents: any
    rewards: Reward[]
}

interface NotificationMessage {
    __typename: string
    name: string
    messageText: string
    purposeDescription: string
}

interface BrandImage {
    __typename: string
    size: string
    url: string
}

interface Reward {
    __typename: string
    notificationMessages: any
    identifier: string
    name: string
    activeIndicator: boolean
    availability: Availability
    basePrice: BasePrice[]
    adjustedBasePrice?: AdjustedBasePrice[]
    faceValue: FaceValue
    adjustedFaceValue: any
    loyaltyOffers: LoyaltyOffer[]
    fulfillmentOptionType: string
    deliveryOptionType: string
}

interface Availability {
    __typename: string
    availabilityIndicator: boolean
}

interface BasePrice {
    __typename: string
    type: string
    value: string
}

interface AdjustedBasePrice {
    __typename: string
    type: string
    value: string
}

interface FaceValue {
    __typename: string
    amount: string
    currency: string
}

interface LoyaltyOffer {
    __typename: string
    offerType: string
    identifier: string
}

interface BangForBuck {
    brandName: string
    rewardName: string
    faceValueAmount: number
    pointsPrice: number
    dollarValuePerPoint: number,
    pointsRequiredPerDollar: number
}

function parseAmexJson(input: any): any {
    function parseArray(arr: any): any {
        let obj: any = {};
        for (let i = 0; i < arr.length; i += 2) {
            let key = arr[i];
            let value = arr[i + 1];

            // If the value is an array that starts with "^ ", it's a nested object
            if (Array.isArray(value) && value[0] === "^ ") {
                obj[key] = parseArray(value.slice(1));
            }
            // If the value is an array but does not start with "^ ", treat it as a regular array
            else if (Array.isArray(value)) {
                obj[key] = value.map(item => {
                    if (Array.isArray(item) && item[0] === "^ ") {
                        return parseArray(item.slice(1));
                    }
                    return item;
                });
            } else {
                obj[key] = value;
            }
        }
        return obj;
    }

    if (Array.isArray(input) && input[0] === "^ ") {
        return parseArray(input.slice(1));
    }
    return input;
}

const calculateBangForBucks = (parsedBrand: Brand): BangForBuck[] => {
    const { rewards } = parsedBrand;
    const results = []
    for (const reward of rewards) {
        const { basePrice, adjustedBasePrice, faceValue } = reward;

        // Ensure that there is at least one base price
        assert(basePrice.length === 1);

        let pointsPrice = parseFloat(basePrice[0].value);
        if (adjustedBasePrice && adjustedBasePrice.length === 1) {
            pointsPrice = parseFloat(adjustedBasePrice[0].value);
        }

        // Ensure that face value is available
        if (faceValue && faceValue.amount) {
            const faceValueAmount = parseFloat(faceValue.amount);
            results.push({
                brandName: parsedBrand.name,
                rewardName: reward.name,
                faceValueAmount,
                pointsPrice,
                dollarValuePerPoint: faceValueAmount / pointsPrice,
                pointsRequiredPerDollar: pointsPrice / faceValueAmount
            })
        }
    }

    return results;
};

function parseArrayToMap(array: any): any {
    // Base case: if the array does not start with '~#iM', return it as is.
    if (array[0] !== '~#iM') {
      return array;
    }

    // Recursive case: parse the array into an object.
    const obj: any = {};
    const pairs = array[1]; // The second element is an array of key-value pairs.
    for (let i = 0; i < pairs.length; i += 2) {
      const key = pairs[i];
      const value = pairs[i + 1];
      obj[key] = Array.isArray(value) ? parseArrayToMap(value) : value;
    }
    return obj;
}

const input = fs.readFileSync('./input.txt', 'utf8')
const pattern = /^window\.__INITIAL_STATE__ = (".*");$/
const matches = pattern.exec(input)
assert(matches !== null)
const match = matches[1]
const parsedMatch = parseArrayToMap(JSON.parse(JSON.parse(match)))
const graphql = parsedMatch.modules['axp-loyalty-root'].graphql
const { endpoints } = graphql
const { readGiftCardsCatalog } = endpoints
const { queries } = readGiftCardsCatalog
const queryId = '4cdec4e7b745d9b050294d03d06b60bd0a22e68b'
const query = queries[queryId]
const { variables, typenames } = query
const variablesId = 'fdd6bd26f7a284baade6b1adbebd248f60d20ede'
const { status, data, error } = variables[variablesId]
const brands = data[2][0][8] // TODO: this is so awful
let results: BangForBuck[] = []
for (const brand of brands) {
    const parsedBrand: Brand = parseAmexJson(brand)
    results = results.concat(calculateBangForBucks(parsedBrand))
}
results.sort((a, b) => b.dollarValuePerPoint - a.dollarValuePerPoint)

console.log('brand_name,reward_name,dollar_value_per_point,points_required_for_dollar,face_value_amount,points_price')
for (const result of results) {
    console.log([
        `"${result.brandName}"`,
        `"${result.rewardName}"`,
        `"${result.dollarValuePerPoint}"`,
        `"${result.pointsRequiredPerDollar}"`,
        `"${result.faceValueAmount}"`,
        `"${result.pointsPrice}"`,
    ].join(','))
}
