/*
* Factory Toughened Rooflights
* pricing-cheap.js
*
* LIVE CHEAP END-USER PRODUCT PRICES
*
* Final PRODUCT prices only. Customer delivery is separate.
*
* CHEAP retained-profit strategy used to generate these prices:
* Clear = base target
* Satin = +15% target profit
* Grey = +17% target profit
* Blue = +20% target profit
*
* Laminated follows the same target-profit strategy as Toughened.
*
* Missing 8mm Blue and 8mm Grey supplier rates were provisionally estimated
* for this pricing exercise and then given the agreed extra 5% safety allowance.
*
* This file does not expose supplier rates, manufacturing cost, VAT, Stripe
* calculations or delivery-cost logic. Unit make-up remains controlled elsewhere.
*
* PRICE ROW COLUMN ORDER:
* 0 Clear Toughened DG 1 Clear Toughened TG
* 2 Clear Laminated DG 3 Clear Laminated TG
* 4 Grey Toughened DG 5 Grey Toughened TG
* 6 Grey Laminated DG 7 Grey Laminated TG
* 8 Blue Toughened DG 9 Blue Toughened TG
* 10 Blue Laminated DG 11 Blue Laminated TG
* 12 Satin Toughened DG 13 Satin Toughened TG
* 14 Satin Laminated DG 15 Satin Laminated TG
*/

(function (globalScope, factory) {
const api = factory();

if (typeof module !== "undefined" && module.exports) {
module.exports = api;
}

if (globalScope) {
globalScope.FactoryRooflightsPricingCheap = api;
}
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
"use strict";

const STRATEGY_ID = "cheap";
const STRATEGY_LABEL = "Cheap";
const STRATEGY_VERSION = "2026-09-04";
const PRICE_UNAVAILABLE = "PRICE_UNAVAILABLE";

const CHEAP_FINISH_PROFIT_MULTIPLIERS = Object.freeze({
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

const VARIANT_INDEX = Object.freeze({
clear: Object.freeze({
toughened: Object.freeze({ double: 0, triple: 1 }),
laminated: Object.freeze({ double: 2, triple: 3 })
}),
grey: Object.freeze({
toughened: Object.freeze({ double: 4, triple: 5 }),
laminated: Object.freeze({ double: 6, triple: 7 })
}),
blue: Object.freeze({
toughened: Object.freeze({ double: 8, triple: 9 }),
laminated: Object.freeze({ double: 10, triple: 11 })
}),
satin: Object.freeze({
toughened: Object.freeze({ double: 12, triple: 13 }),
laminated: Object.freeze({ double: 14, triple: 15 })
})
});

const STANDARD_SIZE_KEYS = Object.freeze([
"300x800",
"300x1000",
"300x1200",
"300x1500",
"400x800",
"400x1000",
"400x1200",
"400x1500",
"500x800",
"500x1000",
"500x1200",
"500x1500",
"500x2000",
"500x2500",
"600x600",
"600x900",
"600x1200",
"600x1500",
"600x1800",
"600x2000",
"600x2500",
"800x800",
"800x1000",
"800x1200",
"800x1500",
"800x1800",
"800x2000",
"800x2500",
"1000x1000",
"1000x1200",
"1000x1500",
"1000x1800",
"1000x2000",
"1000x2500",
"1200x1200",
"1200x1500",
"1200x1800",
"1200x2000",
"1200x2500",
"1500x1500",
"1500x1800",
"1500x2000",
"1500x2500",
"1500x3000"
]);

const PRICES_100 = Object.freeze([
Object.freeze([160,195,175,210,190,225,205,240,205,240,220,255,185,225,205,240]),
Object.freeze([190,220,205,235,225,255,235,270,240,270,250,285,220,250,230,265]),
Object.freeze([205,235,215,245,240,275,250,285,255,290,265,305,235,270,245,280]),
Object.freeze([230,270,245,285,275,315,290,330,295,335,310,350,270,310,285,325]),
Object.freeze([170,200,180,210,200,235,210,245,215,250,225,260,195,230,210,240]),
Object.freeze([200,240,215,255,235,280,250,290,255,300,265,310,230,275,245,290]),
Object.freeze([220,265,235,280,260,310,275,325,280,330,295,345,255,305,270,320]),
Object.freeze([265,310,285,330,315,365,335,380,340,390,360,405,310,355,330,375]),
Object.freeze([195,220,205,235,230,260,240,270,245,275,260,290,225,255,235,265]),
Object.freeze([225,250,240,265,265,295,280,310,285,315,300,330,260,290,275,305]),
Object.freeze([240,285,260,305,285,335,305,350,310,355,330,375,280,325,300,345]),
Object.freeze([295,340,320,365,350,400,375,420,380,425,400,450,345,390,365,415]),
Object.freeze([355,420,385,450,425,495,455,525,460,530,490,560,415,485,450,515]),
Object.freeze([425,485,465,525,530,570,570,610,585,615,625,650,545,560,585,600]),
Object.freeze([175,195,185,205,210,230,220,240,225,245,235,255,205,225,215,235]),
Object.freeze([220,260,240,275,265,300,280,320,285,325,305,340,260,295,275,315]),
Object.freeze([265,310,285,330,315,360,340,385,345,390,365,410,310,355,330,375]),
Object.freeze([320,365,345,395,380,425,405,455,410,460,440,485,370,420,400,445]),
Object.freeze([365,445,400,480,435,520,470,555,475,560,505,590,430,510,460,545]),
Object.freeze([430,475,470,515,535,560,570,595,585,600,620,635,545,550,585,585]),
Object.freeze([495,580,540,625,620,675,665,720,680,725,725,770,635,665,680,710]),

Object.freeze([235,275,250,295,280,320,300,340,305,345,325,365,275,315,295,335]),

Object.freeze([275,320,295,345,330,375,355,400,360,405,380,425,325,370,345,390]),

Object.freeze([315,365,340,390,375,425,405,455,410,460,435,485,370,420,395,445]),

Object.freeze([390,435,425,470,485,510,525,545,535,550,570,585,500,500,535,540]),
Object.freeze([455,515,500,560,570,605,615,645,625,650,670,695,585,590,625,635]),
Object.freeze([495,580,545,630,620,675,670,725,680,725,730,775,635,665,685,710]),
Object.freeze([585,685,650,745,735,795,795,855,810,860,875,920,755,785,815,845]),
Object.freeze([320,375,350,405,385,440,415,470,415,475,445,505,375,435,405,465]),
Object.freeze([355,425,395,460,430,500,465,535,470,535,505,575,420,490,460,525]),
Object.freeze([455,530,500,575,565,620,610,665,625,665,670,710,580,610,625,655]),
Object.freeze([525,620,580,675,660,720,715,775,725,775,780,830,675,710,730,765]),
Object.freeze([535,640,595,700,670,745,735,805,745,805,805,865,695,735,755,795]),
Object.freeze([685,865,765,940,895,1075,970,1150,1005,1185,1080,1260,925,1105,1005,1180]),
Object.freeze([475,550,520,595,590,640,630,685,645,685,685,730,600,630,645,675]),
Object.freeze([550,660,605,715,680,760,735,815,750,815,805,870,700,750,755,805]),
Object.freeze([630,735,695,800,780,855,845,920,860,915,925,985,800,840,870,905]),
Object.freeze([710,825,780,895,910,975,985,1050,1015,1065,1090,1135,940,960,1015,1030]),
Object.freeze([860,1080,970,1195,1100,1330,1215,1440,1230,1460,1345,1570,1140,1365,1255,1480]),
Object.freeze([705,825,775,895,900,975,965,1040,1000,1055,1065,1125,925,955,995,1025]),
Object.freeze([820,1020,905,1100,1045,1250,1130,1335,1165,1370,1245,1450,1080,1285,1160,1365]),
Object.freeze([920,1160,1035,1275,1170,1415,1280,1525,1295,1545,1410,1655,1205,1450,1320,1565]),
Object.freeze([1170,1415,1315,1560,1490,1730,1635,1870,1665,1890,1810,2030,1570,1770,1715,1915]),
Object.freeze([1520,1715,1600,1885,1900,2100,1980,2275,2105,2310,2185,2480,1995,2195,2075,2365])
]);

const PRICES_125 = Object.freeze([
Object.freeze([170,205,185,220,200,240,215,255,215,255,230,270,195,235,210,250]),
Object.freeze([200,230,210,245,235,270,245,280,250,285,265,300,230,265,245,275]),
Object.freeze([210,250,220,260,250,290,260,300,270,310,280,320,245,285,255,295]),
Object.freeze([245,285,255,300,290,330,300,345,310,355,325,370,285,325,295,340]),
Object.freeze([175,210,190,220,210,245,220,255,225,260,240,275,205,240,220,255]),
Object.freeze([210,250,220,265,250,295,260,305,265,315,280,325,245,290,255,300]),
Object.freeze([230,280,245,290,275,325,290,340,295,345,310,360,270,320,285,335]),
Object.freeze([275,325,295,345,330,380,350,400,355,410,375,425,325,375,340,390]),
Object.freeze([200,230,215,245,240,270,250,285,260,290,270,305,235,265,250,280]),
Object.freeze([230,260,245,280,275,305,290,320,300,330,315,345,270,300,285,315]),
Object.freeze([250,295,270,315,300,350,320,365,325,375,345,395,295,345,310,360]),
Object.freeze([305,355,330,380,365,415,390,440,395,445,420,470,360,410,380,430]),
Object.freeze([370,440,400,470,445,515,475,545,485,555,515,585,435,505,465,535]),
Object.freeze([445,525,485,565,560,615,595,650,615,660,655,700,575,605,610,640]),
Object.freeze([195,215,205,230,230,255,240,265,250,270,260,280,225,250,235,260]),
Object.freeze([240,280,260,295,290,325,305,345,310,350,330,365,285,320,300,340]),
Object.freeze([275,320,295,345,330,380,350,400,360,405,380,430,325,370,345,395]),
Object.freeze([330,380,355,410,395,445,420,475,430,480,455,505,385,440,415,465]),
Object.freeze([400,460,435,495,500,540,535,575,550,580,580,615,510,530,545,565]),
Object.freeze([445,495,485,530,555,580,595,615,610,625,650,660,570,570,610,605]),
Object.freeze([515,600,560,645,645,700,690,745,710,755,755,800,660,690,705,735]),

Object.freeze([240,285,260,305,290,335,310,355,320,360,340,380,285,330,305,350]),

Object.freeze([285,330,310,355,340,390,365,415,375,420,400,445,335,385,360,410]),

Object.freeze([325,375,355,405,390,445,420,475,425,480,455,510,385,435,410,465]),

Object.freeze([405,450,440,490,505,530,545,565,560,570,595,610,520,520,555,555]),
Object.freeze([470,555,515,600,590,645,635,690,650,695,695,740,610,635,650,680]),
Object.freeze([515,600,560,645,645,700,695,745,710,750,760,800,660,685,710,735]),
Object.freeze([640,725,700,790,830,870,890,930,930,950,990,1010,855,855,920,915]),
Object.freeze([330,390,360,420,400,460,430,490,435,495,465,525,390,450,420,480]),
Object.freeze([390,440,430,475,495,515,530,555,545,560,580,595,505,505,545,545]),
Object.freeze([470,545,515,595,590,640,635,685,650,690,695,735,605,630,650,675]),
Object.freeze([545,635,600,690,685,745,740,800,755,800,810,855,705,730,760,785]),
Object.freeze([550,660,610,720,700,770,760,830,775,835,835,895,720,755,780,820]),
Object.freeze([710,890,785,965,930,1115,1005,1190,1045,1230,1120,1305,965,1145,1040,1225]),
Object.freeze([490,590,535,635,610,685,655,730,670,735,710,780,625,675,670,715]),
Object.freeze([565,675,620,730,705,785,760,840,775,845,830,900,725,770,780,825]),
Object.freeze([680,780,745,845,875,925,940,990,975,1010,1040,1075,905,910,970,975]),
Object.freeze([730,895,800,970,940,1110,1015,1185,1055,1225,1130,1300,975,1145,1045,1215]),
Object.freeze([880,1110,995,1225,1135,1370,1250,1480,1275,1505,1390,1620,1175,1410,1290,1520]),
Object.freeze([725,850,795,915,930,1000,995,1070,1035,1090,1100,1155,960,985,1025,1050]),
Object.freeze([845,1045,925,1130,1080,1285,1160,1370,1205,1410,1285,1495,1115,1320,1195,1405]),
Object.freeze([945,1190,1055,1300,1200,1450,1315,1565,1335,1590,1450,1700,1240,1490,1355,1605]),
Object.freeze([1200,1445,1340,1590,1535,1770,1675,1915,1715,1940,1860,2080,1620,1815,1760,1960]),
Object.freeze([1555,1755,1635,1925,1950,2155,2030,2325,2165,2370,2245,2545,2050,2255,2130,2425])
]);

const PRICES_150 = Object.freeze([
Object.freeze([175,215,190,230,210,250,225,265,225,265,240,280,205,245,220,260]),
Object.freeze([205,240,220,255,245,280,260,295,265,300,275,315,240,275,255,290]),
Object.freeze([220,260,230,270,265,305,275,315,285,325,295,335,260,300,270,310]),
Object.freeze([255,300,265,310,305,350,315,365,330,375,340,390,295,345,310,355]),
Object.freeze([185,220,195,230,220,260,235,270,240,275,250,290,215,255,230,265]),
Object.freeze([220,265,230,275,260,310,270,320,280,330,295,340,255,300,265,315]),
Object.freeze([240,290,255,305,290,340,300,355,310,365,325,380,280,335,295,350]),
Object.freeze([290,340,305,360,345,400,365,415,375,430,395,445,340,390,355,410]),
Object.freeze([210,245,220,255,250,285,265,300,275,305,285,320,245,280,260,295]),
Object.freeze([240,275,255,290,290,320,305,335,315,345,330,360,285,315,300,330]),
Object.freeze([260,310,280,330,315,365,330,385,340,395,360,410,305,360,325,375]),
Object.freeze([320,370,340,395,380,435,405,460,415,470,440,490,375,425,395,450]),
Object.freeze([405,455,440,485,510,535,540,565,560,580,595,610,525,525,555,555]),
Object.freeze([465,545,500,585,585,640,625,680,645,690,685,730,600,630,640,665]),
Object.freeze([200,225,210,235,240,265,250,275,260,285,270,295,235,260,245,270]),
Object.freeze([250,290,270,310,300,340,315,360,325,370,345,385,295,335,310,355]),
Object.freeze([285,335,305,355,345,395,365,415,375,425,400,450,340,390,360,410]),
Object.freeze([340,395,370,425,410,465,440,490,450,500,475,530,405,455,430,485]),
Object.freeze([415,480,450,510,520,560,555,595,575,605,610,640,535,550,570,585]),
Object.freeze([465,530,500,565,580,620,615,660,640,670,675,705,595,610,630,650]),
Object.freeze([535,620,580,665,670,730,715,775,740,785,790,830,690,715,735,760]),

Object.freeze([250,295,270,315,305,350,325,370,335,380,355,400,300,345,320,365]),

Object.freeze([295,345,320,370,355,405,380,430,390,440,415,465,350,400,375,425]),

Object.freeze([335,390,365,420,405,460,435,490,445,500,475,530,400,455,425,485]),

Object.freeze([420,470,455,505,530,550,565,590,585,595,620,635,545,540,580,575]),
Object.freeze([490,575,530,615,615,670,660,715,680,725,725,765,635,660,675,705]),
Object.freeze([530,615,580,665,670,725,720,770,740,780,790,830,690,710,735,760]),
Object.freeze([660,750,720,810,860,900,925,960,970,985,1030,1050,890,885,955,945]),
Object.freeze([340,405,370,435,415,475,445,510,450,515,485,545,405,470,435,500]),
Object.freeze([405,455,440,490,515,535,550,575,570,580,605,620,530,525,565,565]),
Object.freeze([485,565,530,610,610,660,655,710,675,715,720,760,630,650,675,695]),
Object.freeze([560,655,615,710,710,770,765,825,785,830,840,885,730,755,785,810]),
Object.freeze([605,705,665,765,790,845,855,905,895,925,955,990,820,830,885,890]),
Object.freeze([730,920,810,995,965,1150,1040,1230,1085,1275,1165,1355,1000,1190,1075,1265]),
Object.freeze([505,610,550,650,630,705,675,750,695,760,740,800,650,695,690,740]),
Object.freeze([585,695,640,750,730,810,785,865,805,870,860,925,750,795,805,850]),
Object.freeze([700,800,765,865,905,955,970,1020,1015,1045,1080,1110,935,935,1000,1000]),
Object.freeze([750,925,825,995,975,1150,1050,1220,1095,1270,1165,1340,1010,1185,1080,1255]),
Object.freeze([980,1140,1090,1255,1265,1410,1380,1525,1425,1555,1535,1665,1340,1450,1455,1565]),
Object.freeze([745,920,815,990,960,1135,1025,1205,1070,1250,1140,1315,990,1165,1060,1235]),
Object.freeze([865,1070,945,1155,1110,1325,1195,1405,1245,1455,1325,1540,1150,1360,1230,1445]),
Object.freeze([1040,1215,1150,1330,1325,1490,1440,1605,1485,1635,1595,1750,1400,1530,1515,1645]),
Object.freeze([1230,1565,1370,1710,1580,1925,1720,2065,1770,2115,1910,2260,1665,2010,1810,2155]),
Object.freeze([1590,1795,1670,1965,1995,2210,2080,2380,2220,2435,2300,2605,2100,2315,2180,2485])
]);

const PRICE_MATRIX = Object.freeze({
"100": PRICES_100,
"125": PRICES_125,
"150": PRICES_150
});

const SIZE_INDEX = Object.freeze(
STANDARD_SIZE_KEYS.reduce((map, size, index) => {
map[size] = index;
return map;
}, {})
);

function normalizeDimensionPair(width, length) {
const first = Number(width);
const second = Number(length);

if (
!Number.isFinite(first) ||
!Number.isFinite(second) ||
first <= 0 ||
second <= 0
) {
return null;
}

return {
width: Math.min(first, second),
length: Math.max(first, second)
};
}

function parseSizeKey(sizeKey) {
const parts = String(sizeKey ?? "")
.trim()
.toLowerCase()
.replace(/mm/g, "")
.replace(/×/g, "x")
.replace(/\s+/g, "")
.split("x")
.map(Number);

if (parts.length !== 2) {
return null;
}

return normalizeDimensionPair(parts[0], parts[1]);
}

function normalizeSize(sizeOrWidth, maybeLength) {
let dimensions;

if (maybeLength !== undefined && maybeLength !== null) {
dimensions = normalizeDimensionPair(sizeOrWidth, maybeLength);
}
else if (sizeOrWidth && typeof sizeOrWidth === "object") {
dimensions = normalizeDimensionPair(
sizeOrWidth.width ?? sizeOrWidth.internalWidth,
sizeOrWidth.length ?? sizeOrWidth.internalLength
);
}
else {
dimensions = parseSizeKey(sizeOrWidth);
}

if (!dimensions) {
return null;
}

return `${dimensions.width}x${dimensions.length}`;
}

function normalizeGlazing(glazing) {
const value = String(glazing ?? "")
.trim()
.toLowerCase()
.replace(/[\s_-]+/g, "");

if (
value === "double" ||
value === "doubleglazed" ||
value === "dg" ||
value === "2"
) {
return "double";
}

if (
value === "triple" ||
value === "tripleglazed" ||
value === "tg" ||
value === "3"
) {
return "triple";
}

return null;
}

function normalizeFinish(finish) {
const value = String(finish ?? "clear")
.trim()
.toLowerCase()
.replace(/[\s_-]+/g, "");

if (value === "clear") {
return "clear";
}

if (
value === "grey" ||
value === "gray" ||
value === "solargrey" ||
value === "solargray"
) {
return "grey";
}

if (
value === "blue" ||
value === "solarblue"
) {
return "blue";
}

if (
value === "satin" ||
value === "privacy"
) {
return "satin";
}

return null;
}

function normalizeType(type) {
const value = String(type ?? "toughened")
.trim()
.toLowerCase()
.replace(/[\s_-]+/g, "");

if (
value === "toughened" ||
value === "tough" ||
value === "tgh"
) {
return "toughened";
}

if (
value === "laminated" ||
value === "lam" ||
value === "laminatedsoftcoat"
) {
return "laminated";
}

return null;
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
const sizeKey = normalizeSize(sizeOrWidth, maybeLength);

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

if (value === 100 || value === 125 || value === 150) {
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

function getRawMatrixPrice(borderAnchor, sizeKey, variantIndex) {
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

function getAnchorPriceAtBorder(sizeKey, variantIndex, border) {
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

CHEAP_FINISH_PROFIT_MULTIPLIERS,
TYPE_PROFIT_MULTIPLIERS,
PROVISIONAL_RATE_POLICY,

SUPPORTED_BORDER_RANGE,
CUSTOM_PRICING_CONFIG,
VARIANT_INDEX,

STANDARD_SIZE_KEYS,
STANDARD_SIZE_ANCHORS,
SIZE_INDEX,
PRICE_MATRIX,

normalizeDimensionPair,
parseSizeKey,
normalizeSize,
normalizeGlazing,
normalizeFinish,
normalizeType,
normalizeBorder,

getVariantIndex,
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
