/*
* Factory Toughened Rooflights
* master-delivery-rates.js
*
* Shared source of truth for current delivery pricing and reusable
* delivery-calculation logic extracted from the supplied latest Order Page OP2.
*
* IMPORTANT:
* - This file contains delivery business logic only.
* - It intentionally contains no basket/order-page DOM, markup, styling,
* animation, event listeners or localStorage handling.
* - The supplied OP2 delegates the final working-day/date-range calculation
* to getEstimatedDeliveryTextForLeadTime(), which lives in OP1 and was not
* supplied with this extraction. This master therefore preserves the exact
* OP2 lead-time rules and accepts the existing OP1 date formatter as an
* optional resolver until that OP1 helper is migrated into this master.
*/

(function (globalScope, factory) {
const api = factory();

if (typeof module !== "undefined" && module.exports) {
module.exports = api;
}

if (globalScope) {
globalScope.MasterDeliveryRates = api;
}
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
"use strict";

/* =========================================
EDITABLE DELIVERY CONFIGURATION
========================================= */

const DELIVERY_CONFIG = Object.freeze({
originPostcode: "SL9 7BB",
postcodeApiBaseUrl: "https://api.postcodes.io/postcodes/",
earthRadiusMiles: 3958.7613,
distanceAdjustment: 1.20,

categoryOrder: Object.freeze([
"small",
"medium",
"large",
"extraLarge"
]),

categories: Object.freeze({
small: Object.freeze({
referenceSizes: Object.freeze([
"300x800",
"300x1000",
"300x1200",
"400x800",
"400x1000",
"400x1200",
"600x600",
"600x900"
]),
additionalUnit: 15,
maxDeliveryMiles: 400,
bands: Object.freeze([
Object.freeze({ maxMiles: 34, price: 25 }),
Object.freeze({ maxMiles: 79, price: 35 }),
Object.freeze({ maxMiles: 150, price: 45 }),
Object.freeze({ maxMiles: 400, price: 70 })
])
}),

medium: Object.freeze({
referenceSizes: Object.freeze([
"300x1500",
"400x1500",
"400x1800",
"600x1200",
"600x1500",
"800x800",
"800x1000",
"800x1200",
"800x1500",
"1000x1000"
]),
additionalUnit: 15,
maxDeliveryMiles: 400,
bands: Object.freeze([
Object.freeze({ maxMiles: 34, price: 30 }),
Object.freeze({ maxMiles: 79, price: 40 }),
Object.freeze({ maxMiles: 150, price: 50 }),
Object.freeze({ maxMiles: 400, price: 75 })
])
}),

large: Object.freeze({
referenceSizes: Object.freeze([
"600x1800",
"600x2000",
"800x1800",
"800x2000",
"1000x1200",
"1000x1500",
"1000x1800",
"1000x2000"
]),
additionalUnit: 25,
maxDeliveryMiles: 400,
bands: Object.freeze([
Object.freeze({ maxMiles: 34, price: 35 }),
Object.freeze({ maxMiles: 79, price: 45 }),
Object.freeze({ maxMiles: 150, price: 55 }),
Object.freeze({ maxMiles: 400, price: 85 })
])
}),

extraLarge: Object.freeze({
referenceSizes: Object.freeze([
"600x2500",
"800x2500",
"1000x2500",
"1500x1500",
"1500x1800",
"1500x2000",
"1500x2500"
]),
additionalUnit: 65,
maxDeliveryMiles: 200,
bands: Object.freeze([
Object.freeze({ maxMiles: 34, price: 55 }),
Object.freeze({ maxMiles: 79, price: 75 }),
Object.freeze({ maxMiles: 150, price: 85 }),
Object.freeze({ maxMiles: 200, price: 115 })
])
})
}),

leadTimes: Object.freeze({
toughened: Object.freeze({
clear: Object.freeze({ min: 4, max: 6 }),
grey: Object.freeze({ min: 6, max: 8 }),
satin: Object.freeze({ min: 6, max: 8 }),
blue: Object.freeze({ min: 8, max: 10 }),
otherNonClear: Object.freeze({ min: 6, max: 8 })
}),
laminated: Object.freeze({
clear: Object.freeze({ min: 6, max: 8 }),
nonClear: Object.freeze({ min: 8, max: 10 })
})
}),

integrationTimings: Object.freeze({
postcodeLookupDebounceMs: 550,
estimatedDeliveryRefreshMs: 30000
})
});

const DELIVERY_CATEGORY_RANK = Object.freeze(
DELIVERY_CONFIG.categoryOrder.reduce((result, category, index) => {
result[category] = index;
return result;
}, {})
);

const DELIVERY_SIZE_CATEGORY_LOOKUP = new Map();

DELIVERY_CONFIG.categoryOrder.forEach(category => {
DELIVERY_CONFIG.categories[category].referenceSizes.forEach(size => {
DELIVERY_SIZE_CATEGORY_LOOKUP.set(normalizeSize(size), category);
});
});

/* =========================================
CUSTOM CALCULATOR DELIVERY SIZE BANDS

These bands are derived directly from the
existing live standard-size category lists.

That means the custom calculators can ask
this master which delivery size band a
custom width/length falls into without
maintaining a second set of thresholds.

Each envelope is a physical capacity shape:
a custom unit fits when both its normalised
width and normalised length are less than or
equal to one envelope in that category.

Dominated reference sizes are removed because
they do not change the live classification.

The category search order remains:
small -> medium -> large -> extraLarge.

If a custom size fits no envelope, the live
OP2 behaviour is preserved and it falls back
to extraLarge.
========================================= */

function buildCustomDeliverySizeBands() {
return Object.freeze(
DELIVERY_CONFIG.categoryOrder.map((category, categoryIndex) => {
const categoryConfig = DELIVERY_CONFIG.categories[category];

const referenceDimensions = categoryConfig.referenceSizes
.map(size => {
const [width, length] = normalizeSize(size)
.split("x")
.map(Number);

const dimensions = getNormalisedDeliveryDimensions(
width,
length
);

return dimensions
? {
maxWidth: dimensions.width,
maxLength: dimensions.length
}
: null;
})
.filter(Boolean);

const uniqueDimensions = Array.from(
new Map(
referenceDimensions.map(dimensions => [
`${dimensions.maxWidth}x${dimensions.maxLength}`,
dimensions
])
).values()
);

const envelopes = uniqueDimensions
.filter(candidate => {
return !uniqueDimensions.some(other => {
if (other === candidate) {
return false;
}

return (
other.maxWidth >= candidate.maxWidth &&
other.maxLength >= candidate.maxLength
);
});
})
.sort((first, second) => {
if (first.maxWidth !== second.maxWidth) {
return first.maxWidth - second.maxWidth;
}

return second.maxLength - first.maxLength;
})
.map(envelope => Object.freeze({ ...envelope }));

return Object.freeze({
id: `custom-${category}`,
category,
rank: categoryIndex,
envelopes: Object.freeze(envelopes),
additionalUnit: Number(categoryConfig.additionalUnit),
maxDeliveryMiles: Number(categoryConfig.maxDeliveryMiles),
pricingBands: categoryConfig.bands
});
})
);
}

const CUSTOM_DELIVERY_SIZE_BANDS =
buildCustomDeliverySizeBands();

const originPromiseByFetch = new WeakMap();

/* =========================================
GENERIC NORMALISERS
========================================= */

function normalizeSize(size) {
return String(size ?? "")
.trim()
.toLowerCase()
.replace(/mm/g, "")
.replace(/×/g, "x")
.replace(/\s+/g, "");
}

function normalizeDeliveryCategory(category) {
const normalized = String(category ?? "")
.trim()
.toLowerCase()
.replace(/[\s_-]+/g, "");

if (normalized === "small") {
return "small";
}

if (normalized === "medium") {
return "medium";
}

if (normalized === "large") {
return "large";
}

if (normalized === "extralarge") {
return "extraLarge";
}

return null;
}

function normalizePostcode(postcode) {
return String(postcode || "")
.trim()
.toUpperCase()
.replace(/\s+/g, "");
}

function formatPostcode(postcode) {
const normalized = normalizePostcode(postcode);

if (normalized.length <= 3) {
return normalized;
}

return (
normalized.slice(0, -3) +
" " +
normalized.slice(-3)
);
}

function isCompleteUKPostcode(postcode) {
const cleaned = normalizePostcode(postcode);

if (!cleaned) {
return false;
}

return /^(?:GIR0AA|[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2})$/.test(
cleaned
);
}

/* =========================================
DELIVERY CATEGORY HELPERS
========================================= */

function getDeliveryCategoryForSize(size) {
return DELIVERY_SIZE_CATEGORY_LOOKUP.get(normalizeSize(size)) || null;
}

function getDeliveryCategoryRank(category) {
const normalized = normalizeDeliveryCategory(category);

if (!normalized) {
return -1;
}

return DELIVERY_CATEGORY_RANK[normalized];
}

function getDeliveryMaximumMilesForCategory(category) {
const normalized = normalizeDeliveryCategory(category);

const maximum = Number(
DELIVERY_CONFIG.categories[normalized]?.maxDeliveryMiles
);

return Number.isFinite(maximum)
? maximum
: 0;
}

function getNormalisedDeliveryDimensions(width, length) {
const first = Number(width);
const second = Number(length);

if (!Number.isFinite(first) || !Number.isFinite(second)) {
return null;
}

return {
width: Math.min(first, second),
length: Math.max(first, second)
};
}

function getCustomDeliverySizeBand(width, length) {
const customDimensions =
getNormalisedDeliveryDimensions(
width,
length
);

if (!customDimensions) {
return null;
}

for (const band of CUSTOM_DELIVERY_SIZE_BANDS) {
const matchedEnvelope =
band.envelopes.find(envelope => {
return (
envelope.maxWidth >=
customDimensions.width &&

envelope.maxLength >=
customDimensions.length
);
});

if (matchedEnvelope) {
return {
id: band.id,
category: band.category,
rank: band.rank,

internalWidth:
customDimensions.width,

internalLength:
customDimensions.length,

matchedEnvelope: {
maxWidth:
matchedEnvelope.maxWidth,

maxLength:
matchedEnvelope.maxLength
},

additionalUnit:
band.additionalUnit,

maxDeliveryMiles:
band.maxDeliveryMiles,

pricingBands:
band.pricingBands,

usedFallback:false
};
}
}

const fallbackBand =
CUSTOM_DELIVERY_SIZE_BANDS.find(
band =>
band.category ===
"extraLarge"
) || null;

if (!fallbackBand) {
return null;
}

return {
id:
fallbackBand.id,

category:
fallbackBand.category,

rank:
fallbackBand.rank,

internalWidth:
customDimensions.width,

internalLength:
customDimensions.length,

matchedEnvelope:null,

additionalUnit:
fallbackBand.additionalUnit,

maxDeliveryMiles:
fallbackBand.maxDeliveryMiles,

pricingBands:
fallbackBand.pricingBands,

usedFallback:true
};
}

function getDeliveryCategoryForCustomDimensions(
width,
length
) {
return (
getCustomDeliverySizeBand(
width,
length
)?.category ||
null
);
}

function getCustomDeliveryRate(
width,
length,
chargeableMiles
) {
const sizeBand =
getCustomDeliverySizeBand(
width,
length
);

if (!sizeBand) {
return null;
}

const distanceBand =
getDistanceBand(
sizeBand.category,
chargeableMiles
);

if (!distanceBand) {
return {
...sizeBand,

available:false,

requiresQuote:true,

chargeableMiles:
Math.max(
0,
Math.ceil(
Number(
chargeableMiles
) || 0
)
),

distanceBand:null,

basePrice:null,

reasonCode:
"OUT_OF_DELIVERY_RANGE"
};
}

return {
...sizeBand,

available:true,

requiresQuote:false,

chargeableMiles:
distanceBand.chargeableMiles,

distanceBand:
distanceBand,

basePrice:
distanceBand.price,

reasonCode:null
};
}

function isCustomDeliveryItem(item) {
if (
!item ||
typeof item !==
"object"
) {
return false;
}

if (
item.isCustom === true ||
item.custom === true
) {
return true;
}

return String(
item.source || ""
)
.toLowerCase()
.includes("custom");
}

function getDeliveryCategoryForItem(item) {
if (
!item ||
typeof item !==
"object"
) {
return null;
}

if (
isCustomDeliveryItem(
item
)
) {
return getDeliveryCategoryForCustomDimensions(
item.width ??
item.internalWidth,
item.length ??
item.internalLength
);
}

return getDeliveryCategoryForSize(
item.size
);
}

function summarizeDeliveryCategories(items) {
const units =
expandOrderItemsIntoUnits(
items
);

const counts = {};

units.forEach(unit => {
counts[unit.category] =
(
counts[unit.category] ||
0
) +
1;
});

return DELIVERY_CONFIG
.categoryOrder
.filter(
category =>
counts[category]
)
.map(
category => ({
category:
category,

quantity:
counts[category]
})
);
}

/* =========================================
EXPAND ORDER ITEMS INTO PHYSICAL UNITS
========================================= */

function expandOrderItemsIntoUnits(items) {
const units = [];

(
Array.isArray(items)
?
items
:
[]
)
.forEach(item => {
const category =
getDeliveryCategoryForItem(
item
);

if (!category) {
return;
}

const quantity =
Math.max(
1,
Math.min(
999,
Math.floor(
Number(
item?.quantity ??
item?.qty
) || 1
)
)
);

for (
let unitIndex = 0;
unitIndex < quantity;
unitIndex += 1
) {
units.push({
item:
item,

category:
category
});
}
});

return units;
}

/* =========================================
DELIVERY PRICE BANDS
========================================= */

function getDistanceBand(
category,
chargeableMiles
) {
const normalizedCategory =
normalizeDeliveryCategory(
category
);

const pricing =
DELIVERY_CONFIG.categories[
normalizedCategory
];

if (!pricing) {
return null;
}

const miles =
Math.max(
0,
Math.ceil(
Number(
chargeableMiles
) || 0
)
);

if (
miles >
Number(
pricing.maxDeliveryMiles
)
) {
return null;
}

let previousMax = -1;

for (
let index = 0;
index < pricing.bands.length;
index += 1
) {
const band =
pricing.bands[index];

if (
miles <=
band.maxMiles
) {
return {
category:
normalizedCategory,

index:
index,

minMiles:
previousMax +
1,

maxMiles:
Number(
band.maxMiles
),

price:
Number(
band.price
),

chargeableMiles:
miles
};
}

previousMax =
Number(
band.maxMiles
);
}

return null;
}

function getBaseDeliveryPrice(
category,
chargeableMiles
) {
const band =
getDistanceBand(
category,
chargeableMiles
);

return band
?
band.price
:
null;
}

function getAdditionalUnitPriceForCategory(
category
) {
const normalizedCategory =
normalizeDeliveryCategory(
category
);

const additionalPrice =
Number(
DELIVERY_CONFIG.categories[
normalizedCategory
]?.additionalUnit
);

return Number.isFinite(
additionalPrice
)
?
Math.max(
0,
additionalPrice
)
:
0;
}

/* =========================================
ONE BASE UNIT + ADDITIONAL UNIT LOGIC
========================================= */

function calculateDeliveryCombinationForBaseUnit(
units,
baseUnitIndex,
chargeableMiles
) {
if (
!Array.isArray(
units
) ||
!units.length ||
!Number.isInteger(
baseUnitIndex
) ||
baseUnitIndex < 0 ||
baseUnitIndex >=
units.length
) {
return null;
}

const baseUnit =
units[
baseUnitIndex
];

const baseCategory =
normalizeDeliveryCategory(
baseUnit?.category
);

if (!baseCategory) {
return null;
}

const baseBand =
getDistanceBand(
baseCategory,
chargeableMiles
);

if (!baseBand) {
return null;
}

const additionalUnitsTotal =
units.reduce(
(
total,
unit,
index
) => {
if (
index ===
baseUnitIndex
) {
return total;
}

return (
total +
getAdditionalUnitPriceForCategory(
unit.category
)
);
},
0
);

return {
baseUnitIndex:
baseUnitIndex,

baseCategory:
baseCategory,

baseBand:
baseBand,

basePrice:
baseBand.price,

additionalUnitsTotal:
additionalUnitsTotal,

price:
baseBand.price +
additionalUnitsTotal
};
}

function getMostExpensiveDeliveryCombination(
units,
chargeableMiles
) {
if (
!Array.isArray(
units
) ||
!units.length
) {
return null;
}

let mostExpensiveCombination =
null;

units.forEach(
(
unit,
index
) => {
const combination =
calculateDeliveryCombinationForBaseUnit(
units,
index,
chargeableMiles
);

if (!combination) {
return;
}

if (
!mostExpensiveCombination ||
combination.price >
mostExpensiveCombination.price
) {
mostExpensiveCombination =
combination;

return;
}

if (
combination.price ===
mostExpensiveCombination.price &&

combination.basePrice >
mostExpensiveCombination.basePrice
) {
mostExpensiveCombination =
combination;
}
}
);

return mostExpensiveCombination;
}

/* =========================================
EXTRA LARGE SPLIT-GROUP LOGIC
========================================= */

function getStandardDeliveryGroups(
units
) {
if (
!Array.isArray(
units
) ||
!units.length
) {
return [];
}

const extraLargeUnits =
units.filter(
unit =>
normalizeDeliveryCategory(
unit?.category
) ===
"extraLarge"
);

const nonExtraLargeUnits =
units.filter(
unit =>
normalizeDeliveryCategory(
unit?.category
) !==
"extraLarge"
);

if (
extraLargeUnits.length &&
nonExtraLargeUnits.length
) {
return [
{
name:
"extraLarge",

units:
extraLargeUnits
},

{
name:
"nonExtraLarge",

units:
nonExtraLargeUnits
}
];
}

return [
{
name:
"combined",

units:
units
}
];
}

/* =========================================
DISTANCE LIMITS
========================================= */

function getDeliveryLimitFailure(
units,
chargeableMiles
) {
if (
!Array.isArray(
units
) ||
!units.length
) {
return null;
}

const miles =
Math.max(
0,
Math.ceil(
Number(
chargeableMiles
) || 0
)
);

const failingUnit =
units.find(
unit => {
const maximumMiles =
getDeliveryMaximumMilesForCategory(
unit.category
);

return (
maximumMiles >
0 &&
miles >
maximumMiles
);
}
);

if (!failingUnit) {
return null;
}

const category =
normalizeDeliveryCategory(
failingUnit.category
);

const maximumMiles =
getDeliveryMaximumMilesForCategory(
category
);

if (
category ===
"extraLarge"
) {
return {
category:
category,

maximumMiles:
maximumMiles,

reasonCode:
"OUT_OF_DELIVERY_RANGE",

reason:
`Delivery quotation required for Extra Large rooflights over ` +
`${maximumMiles} adjusted miles.`
};
}

return {
category:
category,

maximumMiles:
maximumMiles,

reasonCode:
"OUT_OF_DELIVERY_RANGE",

reason:
`Delivery quotation required for destinations over ` +
`${maximumMiles} adjusted miles.`
};
}

/* =========================================
COMPLETE BASKET DELIVERY PRICE CALCULATION
========================================= */

function calculateBasketDelivery(
items,
adjustedMiles
) {
const safeAdjustedMiles =
Math.max(
0,
Number(
adjustedMiles
) || 0
);

const chargeableMiles =
Math.ceil(
safeAdjustedMiles
);

const units =
expandOrderItemsIntoUnits(
items
);

if (!units.length) {
return {
requiresQuote:false,

price:0,

chargeableMiles:
chargeableMiles,

adjustedMiles:
safeAdjustedMiles,

baseCategory:null,

baseUnitIndex:null,

basePrice:0,

additionalUnitPrice:0,

additionalUnitsTotal:0,

unitCount:0,

groupCount:0,

groups:[],

reasonCode:null,

reason:null
};
}

const distanceFailure =
getDeliveryLimitFailure(
units,
chargeableMiles
);

if (distanceFailure) {
return {
requiresQuote:true,

price:null,

chargeableMiles:
chargeableMiles,

adjustedMiles:
safeAdjustedMiles,

baseCategory:null,

baseUnitIndex:null,

basePrice:null,

additionalUnitPrice:null,

additionalUnitsTotal:null,

unitCount:
units.length,

groupCount:null,

groups:[],

reasonCode:
distanceFailure.reasonCode,

reason:
distanceFailure.reason,

failureCategory:
distanceFailure.category,

maximumMiles:
distanceFailure.maximumMiles
};
}

const deliveryGroups =
getStandardDeliveryGroups(
units
);

const groupResults =
deliveryGroups.map(
group => {
const combination =
getMostExpensiveDeliveryCombination(
group.units,
chargeableMiles
);

if (!combination) {
return null;
}

return {
name:
group.name,

units:
group.units,

combination:
combination
};
}
);

if (
groupResults.some(
result =>
!result
)
) {
return {
requiresQuote:true,

price:null,

chargeableMiles:
chargeableMiles,

adjustedMiles:
safeAdjustedMiles,

baseCategory:null,

baseUnitIndex:null,

basePrice:null,

additionalUnitPrice:null,

additionalUnitsTotal:null,

unitCount:
units.length,

groupCount:null,

groups:[],

reasonCode:
"DELIVERY_QUOTE_REQUIRED",

reason:
"Delivery quotation required."
};
}

const totalPrice =
groupResults.reduce(
(
total,
group
) =>
total +
group.combination.price,
0
);

const totalBasePrice =
groupResults.reduce(
(
total,
group
) =>
total +
group.combination.basePrice,
0
);

const totalAdditionalUnits =
groupResults.reduce(
(
total,
group
) =>
total +
group.combination.additionalUnitsTotal,
0
);

const singleGroup =
groupResults.length ===
1
?
groupResults[0]
:
null;

return {
requiresQuote:false,

price:
totalPrice,

chargeableMiles:
chargeableMiles,

adjustedMiles:
safeAdjustedMiles,

baseCategory:
singleGroup
?
singleGroup
.combination
.baseCategory
:
null,

baseUnitIndex:
singleGroup
?
singleGroup
.combination
.baseUnitIndex
:
null,

basePrice:
totalBasePrice,

additionalUnitPrice:null,

additionalUnitsTotal:
totalAdditionalUnits,

unitCount:
units.length,

groupCount:
groupResults.length,

groups:
groupResults.map(
group => ({
name:
group.name,

baseCategory:
group.combination
.baseCategory,

band: {
minMiles:
group.combination
.baseBand
.minMiles,

maxMiles:
group.combination
.baseBand
.maxMiles,

chargeableMiles:
group.combination
.baseBand
.chargeableMiles
},

basePrice:
group.combination
.basePrice,

additionalUnitsTotal:
group.combination
.additionalUnitsTotal,

price:
group.combination
.price,

unitCount:
group.units.length
})
),

reasonCode:null,

reason:null
};
}

function calculateDeliveryCharge(
items,
adjustedMiles
) {
return calculateBasketDelivery(
items,
adjustedMiles
);
}

/* =========================================
PER-ITEM DELIVERY CONTRIBUTION
========================================= */

function getResolvedDeliveryContributionForItem(
items,
targetItem,
chargeableMiles
) {
const miles =
Number(
chargeableMiles
);

if (
!Number.isFinite(
miles
)
) {
return null;
}

const units =
expandOrderItemsIntoUnits(
items
);

if (!units.length) {
return 0;
}

const deliveryGroups =
getStandardDeliveryGroups(
units
);

let contribution =
0;

deliveryGroups.forEach(
group => {
const combination =
getMostExpensiveDeliveryCombination(
group.units,
miles
);

if (!combination) {
return;
}

group.units.forEach(
(
unit,
index
) => {
if (
unit.item !==
targetItem
) {
return;
}

if (
index ===
combination.baseUnitIndex
) {
contribution +=
combination.basePrice;

return;
}

contribution +=
getAdditionalUnitPriceForCategory(
unit.category
);
}
);
}
);

return contribution;
}

/* =========================================
POSTCODE LOOKUP / DISTANCE
========================================= */

function resolveFetch(
fetchImpl
) {
if (
typeof fetchImpl ===
"function"
) {
return fetchImpl;
}

if (
typeof globalThis !==
"undefined" &&
typeof globalThis.fetch ===
"function"
) {
return globalThis.fetch;
}

throw new Error(
"Fetch API is not available in this environment."
);
}

async function lookupPostcode(
postcode,
options = {}
) {
const cleaned =
normalizePostcode(
postcode
);

if (
!isCompleteUKPostcode(
cleaned
)
) {
throw new Error(
"Invalid postcode"
);
}

const fetchImpl =
resolveFetch(
options.fetchImpl
);

const response =
await fetchImpl(
DELIVERY_CONFIG
.postcodeApiBaseUrl +
encodeURIComponent(
cleaned
)
);

if (!response.ok) {
throw new Error(
"Postcode not recognised"
);
}

const data =
await response.json();

if (
!data ||
!data.result
) {
throw new Error(
"Postcode not recognised"
);
}

return data.result;
}

function degreesToRadians(
degrees
) {
return (
degrees *
(
Math.PI /
180
)
);
}

function calculateGeographicalMiles(
lat1,
lon1,
lat2,
lon2
) {
const latitudeDifference =
degreesToRadians(
lat2 -
lat1
);

const longitudeDifference =
degreesToRadians(
lon2 -
lon1
);

const firstLatitude =
degreesToRadians(
lat1
);

const secondLatitude =
degreesToRadians(
lat2
);

const a =
Math.sin(
latitudeDifference /
2
) ** 2
+
Math.cos(
firstLatitude
)
*
Math.cos(
secondLatitude
)
*
Math.sin(
longitudeDifference /
2
) ** 2;

const c =
2 *
Math.atan2(
Math.sqrt(
a
),
Math.sqrt(
1 -
a
)
);

return (
DELIVERY_CONFIG
.earthRadiusMiles *
c
);
}

function getAdjustedDistanceMiles(
straightLineMiles
) {
return (
Math.max(
0,
Number(
straightLineMiles
) || 0
) *
DELIVERY_CONFIG
.distanceAdjustment
);
}

function getChargeableDistanceMiles(
adjustedMiles
) {
return Math.ceil(
Math.max(
0,
Number(
adjustedMiles
) || 0
)
);
}

async function getDeliveryOrigin(
options = {}
) {
const fetchImpl =
resolveFetch(
options.fetchImpl
);

if (
!originPromiseByFetch.has(
fetchImpl
)
) {
originPromiseByFetch.set(
fetchImpl,
lookupPostcode(
DELIVERY_CONFIG
.originPostcode,
{
fetchImpl:
fetchImpl
}
)
);
}

return originPromiseByFetch.get(
fetchImpl
);
}

async function calculatePostcodeDelivery(
postcode,
items,
options = {}
) {
const fetchImpl =
resolveFetch(
options.fetchImpl
);

const [
origin,
destination
] =
await Promise.all([
getDeliveryOrigin({
fetchImpl:
fetchImpl
}),

lookupPostcode(
postcode,
{
fetchImpl:
fetchImpl
}
)
]);

const straightLineMiles =
calculateGeographicalMiles(
origin.latitude,
origin.longitude,
destination.latitude,
destination.longitude
);

const adjustedMiles =
getAdjustedDistanceMiles(
straightLineMiles
);

const delivery =
calculateBasketDelivery(
items,
adjustedMiles
);

return {
postcode:
formatPostcode(
postcode
),

straightLineMiles:
straightLineMiles,

adjustedMiles:
adjustedMiles,

chargeableMiles:
delivery.chargeableMiles,

delivery:
delivery
};
}

/* =========================================
ESTIMATED DELIVERY LEAD-TIME RULES
========================================= */

function normalizeLeadTimeTint(
value,
normalizer
) {
if (
typeof normalizer ===
"function"
) {
return normalizer(
value
);
}

return String(
value ??
""
)
.trim()
.toLowerCase();
}

function cloneLeadTime(
value
) {
return {
min:
Number(
value.min
),

max:
Number(
value.max
)
};
}

function getLeadTimeForSelection(
selection,
options = {}
) {
const type =
selection?.type ===
"laminated"
?
"laminated"
:
"toughened";

const tint =
normalizeLeadTimeTint(
selection?.tint ??
selection?.finish,
options.normalizeTint
);

if (
type ===
"laminated"
) {
return cloneLeadTime(
tint ===
"clear"
?
DELIVERY_CONFIG
.leadTimes
.laminated
.clear
:
DELIVERY_CONFIG
.leadTimes
.laminated
.nonClear
);
}

if (
tint ===
"clear"
) {
return cloneLeadTime(
DELIVERY_CONFIG
.leadTimes
.toughened
.clear
);
}

if (
tint ===
"blue"
) {
return cloneLeadTime(
DELIVERY_CONFIG
.leadTimes
.toughened
.blue
);
}

if (
tint ===
"grey"
) {
return cloneLeadTime(
DELIVERY_CONFIG
.leadTimes
.toughened
.grey
);
}

if (
tint ===
"satin"
) {
return cloneLeadTime(
DELIVERY_CONFIG
.leadTimes
.toughened
.satin
);
}

return cloneLeadTime(
DELIVERY_CONFIG
.leadTimes
.toughened
.otherNonClear
);
}

function getBasketLeadTime(
items,
currentSelection = null,
options = {}
) {
const basketItems =
Array.isArray(
items
)
?
items
:
[];

if (
!basketItems.length
) {
return getLeadTimeForSelection(
currentSelection,
options
);
}

return basketItems.reduce(
(
current,
item
) => {
const leadTime =
getLeadTimeForSelection(
item,
options
);

return {
min:
Math.max(
current.min,
leadTime.min
),

max:
Math.max(
current.max,
leadTime.max
)
};
},
{
min:0,
max:0
}
);
}

function getBasketEstimatedDeliveryText(
items,
currentSelection,
getEstimatedDeliveryTextForLeadTime,
options = {}
) {
if (
typeof
getEstimatedDeliveryTextForLeadTime !==
"function"
) {
return null;
}

const leadTime =
getBasketLeadTime(
items,
currentSelection,
options
);

const deliveryText =
String(
getEstimatedDeliveryTextForLeadTime(
leadTime
)
);

return (
deliveryText.replace(
" - ",
" to "
) +
"."
);
}

function getEstimatedDelivery(
options = {}
) {
const items =
Array.isArray(
options.items
)
?
options.items
:
[];

const currentSelection =
options.currentSelection ??
null;

const leadTime =
getBasketLeadTime(
items,
currentSelection,
{
normalizeTint:
options.normalizeTint
}
);

const resolver =
options
.getEstimatedDeliveryTextForLeadTime;

if (
typeof resolver !==
"function"
) {
return {
leadTime:
leadTime,

label:
null,

dateCalculationAvailable:
false,

reasonCode:
"DATE_RESOLVER_NOT_SUPPLIED",

reason:
"The supplied OP2 delegates working-day/date-range calculation to " +
"getEstimatedDeliveryTextForLeadTime() in OP1, which was not supplied."
};
}

const rawLabel =
String(
resolver(
leadTime
)
);

return {
leadTime:
leadTime,

rawLabel:
rawLabel,

label:
rawLabel.replace(
" - ",
" to "
) +
".",

dateCalculationAvailable:
true,

reasonCode:
null,

reason:
null
};
}

/* =========================================
PRIMARY PUBLIC DELIVERY FUNCTION
========================================= */

async function calculateDelivery(
options = {}
) {
const items =
Array.isArray(
options.items
)
?
options.items
:
[];

const postcode =
options.postcode;

const normalizedPostcode =
normalizePostcode(
postcode
);

const estimatedDelivery =
getEstimatedDelivery({
items:
items,

currentSelection:
options.currentSelection,

normalizeTint:
options.normalizeTint,

getEstimatedDeliveryTextForLeadTime:
options
.getEstimatedDeliveryTextForLeadTime
});

const categorySummary =
summarizeDeliveryCategories(
items
);

if (
!isCompleteUKPostcode(
normalizedPostcode
)
) {
return {
status:
"INVALID_POSTCODE",

available:
false,

requiresQuote:
false,

reasonCode:
"INVALID_POSTCODE",

reason:
"Invalid postcode",

originPostcode:
DELIVERY_CONFIG
.originPostcode,

postcode:
formatPostcode(
normalizedPostcode
),

straightLineMiles:
null,

adjustedMiles:
null,

chargeableMiles:
null,

categorySummary:
categorySummary,

groups:
[],

deliveryCharge:
null,

estimatedDelivery:
estimatedDelivery
};
}

try {
const result =
await calculatePostcodeDelivery(
normalizedPostcode,
items,
{
fetchImpl:
options.fetchImpl
}
);

const delivery =
result.delivery;

return {
status:
delivery.requiresQuote
?
"QUOTE_REQUIRED"
:
"AVAILABLE",

available:
!delivery.requiresQuote,

requiresQuote:
delivery.requiresQuote,

reasonCode:
delivery.reasonCode,

reason:
delivery.reason,

originPostcode:
DELIVERY_CONFIG
.originPostcode,

postcode:
result.postcode,

straightLineMiles:
result.straightLineMiles,

adjustedMiles:
result.adjustedMiles,

chargeableMiles:
result.chargeableMiles,

categorySummary:
categorySummary,

groups:
delivery.groups,

deliveryCharge:
delivery.price,

pricing:
delivery,

estimatedDelivery:
estimatedDelivery
};
}
catch (
error
) {
return {
status:
"POSTCODE_LOOKUP_FAILED",

available:
false,

requiresQuote:
false,

reasonCode:
"POSTCODE_LOOKUP_FAILED",

reason:
error instanceof
Error
?
error.message
:
"Postcode not recognised",

originPostcode:
DELIVERY_CONFIG
.originPostcode,

postcode:
formatPostcode(
normalizedPostcode
),

straightLineMiles:
null,

adjustedMiles:
null,

chargeableMiles:
null,

categorySummary:
categorySummary,

groups:
[],

deliveryCharge:
null,

estimatedDelivery:
estimatedDelivery
};
}
}

return Object.freeze({
DELIVERY_CONFIG,
DELIVERY_CATEGORY_RANK,
CUSTOM_DELIVERY_SIZE_BANDS,

normalizeSize,
normalizeDeliveryCategory,
normalizePostcode,
formatPostcode,
isCompleteUKPostcode,

getDeliveryCategoryForSize,
getDeliveryCategoryRank,
getDeliveryMaximumMilesForCategory,

getNormalisedDeliveryDimensions,

getCustomDeliverySizeBand,
getDeliveryCategoryForCustomDimensions,
getCustomDeliveryRate,

isCustomDeliveryItem,
getDeliveryCategoryForItem,
summarizeDeliveryCategories,

expandOrderItemsIntoUnits,

getDistanceBand,
getBaseDeliveryPrice,
getAdditionalUnitPriceForCategory,

calculateDeliveryCombinationForBaseUnit,
getMostExpensiveDeliveryCombination,
getStandardDeliveryGroups,
getDeliveryLimitFailure,

calculateBasketDelivery,
calculateDeliveryCharge,

getResolvedDeliveryContributionForItem,

lookupPostcode,
degreesToRadians,
calculateGeographicalMiles,
getAdjustedDistanceMiles,
getChargeableDistanceMiles,
getDeliveryOrigin,
calculatePostcodeDelivery,

getLeadTimeForSelection,
getBasketLeadTime,
getBasketEstimatedDeliveryText,
getEstimatedDelivery,

calculateDelivery
});
});
