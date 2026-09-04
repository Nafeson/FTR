/*
* Factory Toughened Rooflights
* pricing-expensive.js
*
* LIVE EXPENSIVE END-USER PRODUCT PRICES
*
* Final PRODUCT prices only. Customer delivery is separate.
*
* EXPENSIVE retained-profit strategy:
* EXPENSIVE = NORMAL target profit x 1.08
*
* The same Clear / Satin / Grey / Blue profit relationships already baked
* into pricing-normal.js are retained here. Laminated follows the same
* strategy as Toughened.
*
* IMPORTANT LOAD ORDER
* pricing-normal.js must be loaded before pricing-expensive.js in the browser.
* In CommonJS environments this file will require ./pricing-normal.js.
*
* This file contains no supplier glass rates, manufacturing-cost logic,
* Stripe logic, VAT logic or delivery-cost logic. It converts the live NORMAL
* end-user price anchors into the agreed EXPENSIVE end-user price anchors,
* then uses those anchors for the custom calculator interpolation.
*/

(function (globalScope, factory) {
let normalStrategy = null;

if (
globalScope &&
globalScope.FactoryRooflightsPricingNormal
) {
normalStrategy =
globalScope.FactoryRooflightsPricingNormal;
}

if (
!normalStrategy &&
typeof module !== "undefined" &&
module.exports &&
typeof require === "function"
) {
normalStrategy = require("./pricing-normal.js");
}

const api = factory(normalStrategy);

if (typeof module !== "undefined" && module.exports) {
module.exports = api;
}

if (globalScope) {
globalScope.FactoryRooflightsPricingExpensive = api;
}
})(typeof globalThis !== "undefined" ? globalThis : this, function (NORMAL) {
"use strict";

if (
!NORMAL ||
!NORMAL.PRICE_MATRIX ||
!Array.isArray(NORMAL.STANDARD_SIZE_KEYS)
) {
throw new Error(
"pricing-expensive.js requires pricing-normal.js to be loaded first."
);
}

const STRATEGY_ID = "expensive";
const STRATEGY_LABEL = "Expensive";
const STRATEGY_VERSION = "2026-09-04";
const PRICE_UNAVAILABLE = "PRICE_UNAVAILABLE";

const EXPENSIVE_OVER_NORMAL_PROFIT_MULTIPLIER = 1.08;

const EXPENSIVE_FINISH_PROFIT_MULTIPLIERS = Object.freeze({
clear: 1.00,
satin: 1.15,
grey: 1.17,
blue: 1.20
});

const TYPE_PROFIT_MULTIPLIERS = Object.freeze({
toughened: 1.00,
laminated: 1.00
});

const PROVISIONAL_RATE_POLICY = Object.freeze({
missingBlue8mmSafetyFactor: 1.05,
missingGrey8mmSafetyFactor: 1.05
});

const SUPPORTED_BORDER_RANGE = Object.freeze({
min: 100,
max: 150,
anchors: Object.freeze([100, 125, 150])
});

const CUSTOM_PRICING_CONFIG = Object.freeze({
enabled: true,
method: "inverse-distance",
neighbourCount: 4,
distancePower: 2,
retailRoundTo: 5,
exactStandardSizeUsesExactPrice: true
});

const VARIANT_INDEX = NORMAL.VARIANT_INDEX;
const STANDARD_SIZE_KEYS = NORMAL.STANDARD_SIZE_KEYS;

/*
* PRE-CALCULATED END-USER PRICE UPLIFTS OVER NORMAL
*
* Column order:
* 0 Clear DG 1 Clear TG
* 2 Grey DG 3 Grey TG
* 4 Blue DG 5 Blue TG
* 6 Satin DG 7 Satin TG
*
* The same uplift applies to Toughened and Laminated because the EXPENSIVE
* strategy changes target retained profit, not the underlying unit cost.
* All figures are already rounded to the nearest £5.
*/

const EXPENSIVE_PRICE_UPLIFTS = Object.freeze({
"300x800": Object.freeze([10,10,10,10,10,10,10,10]),
"300x1000": Object.freeze([10,10,10,10,10,10,10,10]),
"300x1200": Object.freeze([10,10,10,10,10,10,10,10]),
"300x1500": Object.freeze([10,10,10,10,10,10,10,10]),
"400x800": Object.freeze([5,10,10,10,10,10,10,10]),
"400x1000": Object.freeze([10,10,10,10,10,10,10,10]),
"400x1200": Object.freeze([10,10,10,10,10,10,10,10]),
"400x1500": Object.freeze([10,10,10,15,10,15,10,15]),
"500x800": Object.freeze([10,10,10,10,10,10,10,10]),
"500x1000": Object.freeze([10,10,10,10,10,10,10,10]),
"500x1200": Object.freeze([10,10,10,10,10,10,10,10]),
"500x1500": Object.freeze([10,10,10,15,15,15,10,15]),
"500x2000": Object.freeze([10,15,15,15,15,15,15,15]),
"500x2500": Object.freeze([10,15,15,15,15,15,15,15]),
"600x600": Object.freeze([10,10,10,10,10,10,10,10]),
"600x900": Object.freeze([10,10,10,10,10,10,10,10]),
"600x1200": Object.freeze([10,10,10,10,10,10,10,10]),
"600x1500": Object.freeze([10,10,10,10,15,15,10,10]),
"600x1800": Object.freeze([10,15,15,15,15,15,15,15]),
"600x2000": Object.freeze([15,15,15,15,15,20,15,15]),
"600x2500": Object.freeze([15,15,15,20,20,20,15,20]),
"800x800": Object.freeze([10,10,10,10,10,10,10,10]),
"800x1200": Object.freeze([10,10,10,10,15,15,10,10]),
"800x1500": Object.freeze([10,10,15,15,15,15,15,15]),
"800x1800": Object.freeze([15,15,15,15,15,15,15,15]),
"800x2000": Object.freeze([15,15,15,15,15,20,15,15]),
"800x2500": Object.freeze([15,15,20,20,20,20,20,20]),
"1000x1000": Object.freeze([10,10,10,15,15,15,10,15]),
"1000x1200": Object.freeze([10,10,15,15,15,15,15,15]),
"1000x1500": Object.freeze([15,15,15,15,15,15,15,15]),
"1000x1800": Object.freeze([15,15,15,15,15,20,15,15]),
"1000x2000": Object.freeze([10,10,15,15,15,15,15,15]),
"1000x2500": Object.freeze([15,15,15,20,15,20,15,20]),
"1200x1200": Object.freeze([15,15,15,20,15,20,15,20]),
"1200x1500": Object.freeze([15,15,15,20,15,20,15,20]),
"1200x1800": Object.freeze([15,15,20,20,20,20,20,20]),
"1200x2000": Object.freeze([15,20,20,20,20,20,20,20]),
"1200x2500": Object.freeze([15,20,20,20,20,20,20,20]),
"1500x1500": Object.freeze([15,20,20,20,20,20,20,20]),
"1500x1800": Object.freeze([20,20,25,25,25,25,20,25]),
"1500x2000": Object.freeze([20,25,25,25,25,30,25,25]),
"1500x2500": Object.freeze([25,30,25,35,30,35,25,35]),
"1500x3000": Object.freeze([25,30,30,35,30,35,30,35])
});

const SIZE_INDEX = Object.freeze(
STANDARD_SIZE_KEYS.reduce((map, size, index) => {
map[size] = index;
return map;
}, {})
);

function getUpliftColumnForVariantIndex(variantIndex) {
const index = Number(variantIndex);

if (!Number.isInteger(index) || index < 0 || index > 15) {
return null;
}

if (index <= 3) {
return index % 2 === 0 ? 0 : 1;
}

if (index <= 7) {
return index % 2 === 0 ? 2 : 3;
}

if (index <= 11) {
return index % 2 === 0 ? 4 : 5;
}

return index % 2 === 0 ? 6 : 7;
}

function getPriceUplift(sizeKey, variantIndex) {
const upliftColumn =
getUpliftColumnForVariantIndex(variantIndex);

const row = EXPENSIVE_PRICE_UPLIFTS[sizeKey];

if (
!row ||
!Number.isInteger(upliftColumn)
) {
return null;
}

const value = Number(row[upliftColumn]);

return Number.isFinite(value)
? value
: null;
}

function buildExpensivePriceMatrix() {
const result = {};

SUPPORTED_BORDER_RANGE.anchors.forEach(border => {
const normalRows =
NORMAL.PRICE_MATRIX[String(border)];

if (!Array.isArray(normalRows)) {
throw new Error(
`NORMAL price matrix is missing border ${border}.`
);
}

result[String(border)] = Object.freeze(
normalRows.map((row, rowIndex) => {
const sizeKey = STANDARD_SIZE_KEYS[rowIndex];

return Object.freeze(
row.map((normalPrice, variantIndex) => {
const uplift = getPriceUplift(
sizeKey,
variantIndex
);

if (
!Number.isFinite(Number(normalPrice)) ||
!Number.isFinite(uplift)
) {
return PRICE_UNAVAILABLE;
}

return Number(normalPrice) + uplift;
})
);
})
);
});

return Object.freeze(result);
}

const PRICE_MATRIX = buildExpensivePriceMatrix();

function normalizeDimensionPair(width, length) {
return NORMAL.normalizeDimensionPair(width, length);
}

function parseSizeKey(sizeKey) {
return NORMAL.parseSizeKey(sizeKey);
}

function normalizeSize(sizeOrWidth, maybeLength) {
return NORMAL.normalizeSize(sizeOrWidth, maybeLength);
}

function normalizeGlazing(glazing) {
return NORMAL.normalizeGlazing(glazing);
}

function normalizeFinish(finish) {
return NORMAL.normalizeFinish(finish);
}

function normalizeType(type) {
return NORMAL.normalizeType(type);
}

function normalizeBorder(border) {
const value = Number(border ?? 100);

if (
!Number.isFinite(value) ||
value < SUPPORTED_BORDER_RANGE.min ||
value > SUPPORTED_BORDER_RANGE.max
) {
return null;
}

return value;
}

function getVariantIndex(finish, type, glazing) {
const f = normalizeFinish(finish);
const t = normalizeType(type);
const g = normalizeGlazing(glazing);

const index =
f && t && g
? VARIANT_INDEX[f]?.[t]?.[g]
: null;

return Number.isInteger(index)
? index
: null;
}

function roundToIncrement(value, increment) {
const number = Number(value);
const step = Number(increment);

if (
!Number.isFinite(number) ||
!Number.isFinite(step) ||
step <= 0
) {
return null;
}

return Math.round(number / step) * step;
}

function roundRetailPrice(value) {
return roundToIncrement(
value,
CUSTOM_PRICING_CONFIG.retailRoundTo
);
}

function hasStandardSize(sizeOrWidth, maybeLength) {
const sizeKey = normalizeSize(
sizeOrWidth,
maybeLength
);

return Boolean(
sizeKey &&
Object.prototype.hasOwnProperty.call(
SIZE_INDEX,
sizeKey
)
);
}

function getBorderAnchors(border) {
const value = normalizeBorder(border);

if (value === null) {
return null;
}

if (
value === 100 ||
value === 125 ||
value === 150
) {
return {
lower: value,
upper: value,
ratio: 0
};
}

if (value < 125) {
return {
lower: 100,
upper: 125,
ratio: (value - 100) / 25
};
}

return {
lower: 125,
upper: 150,
ratio: (value - 125) / 25
};
}

function getRawMatrixPrice(
borderAnchor,
sizeKey,
variantIndex
) {
const sizeIndex = SIZE_INDEX[sizeKey];
const rows = PRICE_MATRIX[String(borderAnchor)];

if (
!Number.isInteger(sizeIndex) ||
!Array.isArray(rows) ||
!Number.isInteger(variantIndex)
) {
return null;
}

const value = Number(
rows[sizeIndex]?.[variantIndex]
);

return Number.isFinite(value)
? value
: null;
}

function getAnchorPriceAtBorder(
sizeKey,
variantIndex,
border
) {
const resolution = getBorderAnchors(border);

if (!resolution) {
return null;
}

const lowerPrice = getRawMatrixPrice(
resolution.lower,
sizeKey,
variantIndex
);

if (!Number.isFinite(lowerPrice)) {
return null;
}

if (resolution.lower === resolution.upper) {
return lowerPrice;
}

const upperPrice = getRawMatrixPrice(
resolution.upper,
sizeKey,
variantIndex
);

if (!Number.isFinite(upperPrice)) {
return null;
}

return roundRetailPrice(
lowerPrice +
(upperPrice - lowerPrice) *
resolution.ratio
);
}

const STANDARD_SIZE_ANCHORS = Object.freeze(
STANDARD_SIZE_KEYS.map(sizeKey => {
const dimensions = parseSizeKey(sizeKey);

return Object.freeze({
size: sizeKey,
width: dimensions.width,
length: dimensions.length
});
})
);

function getStandardPrice(options = {}) {
const sizeKey = options.size
? normalizeSize(options.size)
: normalizeSize(
options.width ?? options.internalWidth,
options.length ?? options.internalLength
);

const glazing = normalizeGlazing(
options.glazing ??
options.glazingType ??
options.unitType
);

const finish = normalizeFinish(
options.finish ??
options.tint ??
"clear"
);

const type = normalizeType(
options.type ??
options.bottomType ??
"toughened"
);

const border = normalizeBorder(
options.border ?? 100
);

const variantIndex = getVariantIndex(
finish,
type,
glazing
);

if (
!sizeKey ||
!hasStandardSize(sizeKey) ||
!glazing ||
!finish ||
!type ||
border === null ||
variantIndex === null
) {
return {
available: false,
strategy: STRATEGY_ID,
strategyLabel: STRATEGY_LABEL,
source: "standard",
reasonCode: PRICE_UNAVAILABLE,
price: null
};
}

const price = getAnchorPriceAtBorder(
sizeKey,
variantIndex,
border
);

if (!Number.isFinite(price)) {
return {
available: false,
strategy: STRATEGY_ID,
strategyLabel: STRATEGY_LABEL,
source: "standard",
reasonCode: PRICE_UNAVAILABLE,
price: null
};
}

return {
available: true,
strategy: STRATEGY_ID,
strategyLabel: STRATEGY_LABEL,
strategyVersion: STRATEGY_VERSION,
source: "standard",
reasonCode: null,
size: sizeKey,
glazing,
finish,
type,
border,
price
};
}

function getRelativeAnchorDistance(
targetWidth,
targetLength,
anchorWidth,
anchorLength
) {
const widthScale = Math.max(targetWidth, 1);
const lengthScale = Math.max(targetLength, 1);

const widthDifference =
(anchorWidth - targetWidth) /
widthScale;

const lengthDifference =
(anchorLength - targetLength) /
lengthScale;

return Math.sqrt(
widthDifference ** 2 +
lengthDifference ** 2
);
}

function getNearestPriceAnchors(
width,
length,
variantIndex,
border,
neighbourCount =
CUSTOM_PRICING_CONFIG.neighbourCount
) {
const dimensions = normalizeDimensionPair(
width,
length
);

const normalizedBorder = normalizeBorder(border);

if (
!dimensions ||
normalizedBorder === null ||
!Number.isInteger(variantIndex)
) {
return [];
}

const count = Math.max(
1,
Math.floor(Number(neighbourCount) || 1)
);

return STANDARD_SIZE_ANCHORS
.map(anchor => ({
...anchor,
price: getAnchorPriceAtBorder(
anchor.size,
variantIndex,
normalizedBorder
),
distance: getRelativeAnchorDistance(
dimensions.width,
dimensions.length,
anchor.width,
anchor.length
)
}))
.filter(anchor => Number.isFinite(anchor.price))
.sort(
(first, second) =>
first.distance - second.distance
)
.slice(0, count);
}

function interpolateCustomPrice(
width,
length,
variantIndex,
border,
options = {}
) {
const dimensions = normalizeDimensionPair(
width,
length
);

const normalizedBorder = normalizeBorder(border);

if (
!dimensions ||
normalizedBorder === null ||
!Number.isInteger(variantIndex)
) {
return null;
}

const sizeKey = normalizeSize(
dimensions.width,
dimensions.length
);

if (
CUSTOM_PRICING_CONFIG.exactStandardSizeUsesExactPrice &&
hasStandardSize(sizeKey)
) {
const exactPrice = getAnchorPriceAtBorder(
sizeKey,
variantIndex,
normalizedBorder
);

if (!Number.isFinite(exactPrice)) {
return null;
}

return {
source: "exact-standard-size",
price: exactPrice,
size: sizeKey,
width: dimensions.width,
length: dimensions.length,
border: normalizedBorder,
anchors: Object.freeze([
Object.freeze({
size: sizeKey,
width: dimensions.width,
length: dimensions.length,
price: exactPrice,
distance: 0,
weight: 1
})
])
};
}

const neighbourCount =
options.neighbourCount ??
CUSTOM_PRICING_CONFIG.neighbourCount;

const distancePower = Math.max(
0.0001,
Number(
options.distancePower ??
CUSTOM_PRICING_CONFIG.distancePower
) || 2
);

const anchors = getNearestPriceAnchors(
dimensions.width,
dimensions.length,
variantIndex,
normalizedBorder,
neighbourCount
);

if (!anchors.length) {
return null;
}

const exactAnchor = anchors.find(
anchor => anchor.distance === 0
);

if (exactAnchor) {
return {
source: "exact-anchor",
price: exactAnchor.price,
size: exactAnchor.size,
width: dimensions.width,
length: dimensions.length,
border: normalizedBorder,
anchors: Object.freeze([
Object.freeze({
...exactAnchor,
weight: 1
})
])
};
}

const weightedAnchors = anchors.map(anchor => {
const weight =
1 /
Math.pow(
Math.max(anchor.distance, 0.000001),
distancePower
);

return {
...anchor,
weight
};
});

const totalWeight = weightedAnchors.reduce(
(total, anchor) =>
total + anchor.weight,
0
);

if (
!Number.isFinite(totalWeight) ||
totalWeight <= 0
) {
return null;
}

const rawPrice = weightedAnchors.reduce(
(total, anchor) =>
total +
anchor.price *
anchor.weight,
0
) / totalWeight;

return {
source: "custom-interpolation",
price: roundRetailPrice(rawPrice),
size: sizeKey,
width: dimensions.width,
length: dimensions.length,
border: normalizedBorder,
anchors: Object.freeze(
weightedAnchors.map(anchor =>
Object.freeze({ ...anchor })
)
)
};
}

function getCustomPrice(options = {}) {
const dimensions = normalizeDimensionPair(
options.width ?? options.internalWidth,
options.length ?? options.internalLength
);

const glazing = normalizeGlazing(
options.glazing ??
options.glazingType ??
options.unitType
);

const finish = normalizeFinish(
options.finish ??
options.tint ??
"clear"
);

const type = normalizeType(
options.type ??
options.bottomType ??
"toughened"
);

const border = normalizeBorder(
options.border ?? 100
);

const variantIndex = getVariantIndex(
finish,
type,
glazing
);

if (
!dimensions ||
!glazing ||
!finish ||
!type ||
border === null ||
variantIndex === null
) {
return {
available: false,
strategy: STRATEGY_ID,
strategyLabel: STRATEGY_LABEL,
source: "custom",
reasonCode: PRICE_UNAVAILABLE,
price: null
};
}

const result = interpolateCustomPrice(
dimensions.width,
dimensions.length,
variantIndex,
border,
options.interpolation || {}
);

if (!result || !Number.isFinite(result.price)) {
return {
available: false,
strategy: STRATEGY_ID,
strategyLabel: STRATEGY_LABEL,
source: "custom",
reasonCode: PRICE_UNAVAILABLE,
price: null
};
}

return {
available: true,
strategy: STRATEGY_ID,
strategyLabel: STRATEGY_LABEL,
strategyVersion: STRATEGY_VERSION,
source: result.source,
reasonCode: null,
size: result.size,
width: result.width,
length: result.length,
glazing,
finish,
type,
border,
price: result.price,
interpolationAnchors: result.anchors
};
}

function getPrice(options = {}) {
const mode = String(
options.pricingMode ??
options.mode ??
""
)
.trim()
.toLowerCase();

if (mode === "standard") {
return getStandardPrice(options);
}

if (mode === "custom") {
return getCustomPrice(options);
}

const sizeKey = options.size
? normalizeSize(options.size)
: normalizeSize(
options.width ?? options.internalWidth,
options.length ?? options.internalLength
);

if (sizeKey && hasStandardSize(sizeKey)) {
return getStandardPrice({
...options,
size: sizeKey
});
}

return getCustomPrice(options);
}

function getPriceValue(options = {}) {
const result = getPrice(options);

return result.available
? result.price
: null;
}

function getStandardPriceValue(options = {}) {
const result = getStandardPrice(options);

return result.available
? result.price
: null;
}

function getCustomPriceValue(options = {}) {
const result = getCustomPrice(options);

return result.available
? result.price
: null;
}

return Object.freeze({
STRATEGY_ID,
STRATEGY_LABEL,
STRATEGY_VERSION,
PRICE_UNAVAILABLE,

EXPENSIVE_OVER_NORMAL_PROFIT_MULTIPLIER,
EXPENSIVE_FINISH_PROFIT_MULTIPLIERS,
TYPE_PROFIT_MULTIPLIERS,
PROVISIONAL_RATE_POLICY,

SUPPORTED_BORDER_RANGE,
CUSTOM_PRICING_CONFIG,
VARIANT_INDEX,

STANDARD_SIZE_KEYS,
STANDARD_SIZE_ANCHORS,
SIZE_INDEX,

EXPENSIVE_PRICE_UPLIFTS,
PRICE_MATRIX,

normalizeDimensionPair,
parseSizeKey,
normalizeSize,
normalizeGlazing,
normalizeFinish,
normalizeType,
normalizeBorder,

getVariantIndex,
getUpliftColumnForVariantIndex,
getPriceUplift,

roundToIncrement,
roundRetailPrice,
hasStandardSize,

getBorderAnchors,
getRawMatrixPrice,
getAnchorPriceAtBorder,

getStandardPrice,

getRelativeAnchorDistance,
getNearestPriceAnchors,
interpolateCustomPrice,
getCustomPrice,

getPrice,

getStandardPriceValue,
getCustomPriceValue,
getPriceValue
});
});
