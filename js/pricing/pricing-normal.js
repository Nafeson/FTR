/*
* Factory Toughened Rooflights
* pricing-normal.js
*
* LIVE NORMAL END-USER PRODUCT PRICES
*
* Final PRODUCT prices only. Customer delivery is separate.
*
* NORMAL retained-profit strategy used to generate these prices:
* NORMAL = CHEAP target profit × 1.30
* Clear = CHEAP base target × 1.30
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
globalScope.FactoryRooflightsPricingNormal = api;
}
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
"use strict";

const STRATEGY_ID = "normal";
const STRATEGY_LABEL = "Normal";
const STRATEGY_VERSION = "2026-09-04";
const PRICE_UNAVAILABLE = "PRICE_UNAVAILABLE";

const NORMAL_OVER_CHEAP_PROFIT_MULTIPLIER = 1.30;

const NORMAL_FINISH_PROFIT_MULTIPLIERS = Object.freeze({
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
Object.freeze([180,220,195,235,215,255,230,270,230,270,245,285,210,255,230,270]),
Object.freeze([215,245,230,260,255,285,265,300,270,300,280,315,245,280,255,295]),
Object.freeze([230,260,240,270,270,305,280,315,285,320,295,335,260,300,270,310]),
Object.freeze([255,300,270,315,305,350,320,365,325,370,340,385,300,345,315,360]),
Object.freeze([190,225,200,235,225,265,235,275,240,280,250,290,220,255,235,265]),
Object.freeze([220,265,235,280,260,310,275,320,280,330,290,340,255,305,270,320]),
Object.freeze([245,295,260,310,290,345,305,360,310,365,325,380,280,340,295,355]),
Object.freeze([295,340,315,360,350,400,370,415,375,430,395,445,345,390,365,410]),
Object.freeze([220,245,230,260,260,290,270,300,275,305,290,320,250,285,260,295]),
Object.freeze([250,275,265,290,295,325,310,340,315,345,330,360,290,320,305,335]),
Object.freeze([265,315,285,335,315,370,335,385,340,390,360,410,310,360,330,380]),
Object.freeze([325,370,350,395,385,435,410,455,415,465,435,490,380,425,400,450]),
Object.freeze([390,455,420,485,465,540,495,570,500,575,530,605,455,530,490,560]),
Object.freeze([460,525,500,565,570,615,610,655,625,660,665,695,585,605,625,645]),
Object.freeze([200,220,210,230,240,260,250,270,255,275,265,285,230,250,240,260]),
Object.freeze([245,285,265,300,295,330,310,350,315,355,335,370,290,325,305,345]),
Object.freeze([290,340,310,360,345,395,370,420,375,425,395,445,340,390,360,410]),
Object.freeze([350,395,375,425,415,460,440,490,445,495,475,520,405,455,435,480]),
Object.freeze([400,485,435,520,475,565,510,600,515,610,545,640,470,555,500,590]),
Object.freeze([470,515,510,555,580,610,615,645,635,650,670,685,590,600,630,635]),
Object.freeze([535,625,580,670,670,730,715,775,730,780,775,825,685,715,730,760]),
Object.freeze([260,300,275,320,310,350,330,370,335,375,355,395,305,345,325,365]),
Object.freeze([305,350,325,370,360,405,385,430,390,435,415,460,355,400,380,425]),
Object.freeze([345,395,370,420,410,460,440,490,445,495,470,520,405,455,430,480]),
Object.freeze([420,470,455,505,520,550,560,585,575,590,610,625,535,540,570,580]),
Object.freeze([490,555,535,600,615,650,660,690,670,700,715,745,630,635,670,680]),
Object.freeze([535,620,585,670,665,725,715,775,730,775,780,825,680,715,730,760]),
Object.freeze([630,730,695,790,790,850,850,910,865,915,930,975,805,835,865,895]),
Object.freeze([350,405,380,435,420,475,450,505,450,515,480,545,410,470,440,500]),
Object.freeze([390,460,430,495,470,540,505,575,510,575,545,615,460,530,500,565]),
Object.freeze([490,570,535,615,610,665,655,710,670,710,715,755,625,655,670,700]),
Object.freeze([565,660,620,715,705,770,760,825,775,825,830,880,720,760,775,815]),
Object.freeze([565,675,625,735,705,785,770,845,785,845,845,905,730,775,790,835]),
Object.freeze([725,910,805,985,940,1130,1015,1205,1055,1240,1130,1315,970,1155,1050,1230]),
Object.freeze([510,595,555,640,635,695,675,740,690,740,730,785,645,680,690,725]),
Object.freeze([590,705,645,760,725,815,780,870,800,870,855,925,745,805,800,860]),
Object.freeze([675,780,740,845,835,910,900,975,915,970,980,1040,850,895,920,960]),
Object.freeze([755,875,825,945,965,1035,1040,1110,1070,1125,1145,1195,995,1020,1070,1090]),
Object.freeze([910,1130,1020,1245,1155,1390,1270,1500,1290,1525,1405,1635,1195,1425,1310,1540]),
Object.freeze([750,875,820,945,955,1035,1020,1100,1055,1120,1120,1190,975,1015,1045,1085]),
Object.freeze([875,1085,960,1165,1110,1325,1195,1410,1230,1445,1310,1525,1145,1360,1225,1440]),
Object.freeze([980,1225,1095,1340,1240,1495,1350,1605,1365,1625,1480,1735,1275,1530,1390,1645]),
Object.freeze([1235,1500,1380,1645,1570,1830,1715,1970,1745,1995,1890,2135,1650,1870,1795,2015]),
Object.freeze([1595,1805,1675,1975,1990,2205,2070,2380,2195,2415,2275,2585,2080,2300,2160,2470])
]);

const PRICES_125 = Object.freeze([
Object.freeze([190,230,205,245,225,270,240,285,240,285,255,300,220,265,235,280]),
Object.freeze([225,255,235,270,265,300,275,310,280,315,295,330,255,295,270,305]),
Object.freeze([235,275,245,285,280,320,290,330,300,340,310,350,270,315,280,325]),
Object.freeze([270,315,280,330,320,365,330,380,340,390,355,405,315,360,325,375]),
Object.freeze([195,235,210,245,235,275,245,285,250,290,265,305,230,265,245,280]),
Object.freeze([230,275,240,290,275,325,285,335,290,345,305,355,270,320,280,330]),
Object.freeze([255,310,270,320,305,360,320,375,325,380,340,395,295,355,310,370]),
Object.freeze([305,355,325,375,365,415,385,435,390,450,410,465,360,410,375,425]),
Object.freeze([225,255,240,270,270,300,280,315,290,320,300,335,260,295,275,310]),
Object.freeze([255,285,270,305,305,335,320,350,330,360,345,375,300,330,315,345]),
Object.freeze([275,325,295,345,330,385,350,400,355,410,375,430,325,380,340,395]),
Object.freeze([335,385,360,410,400,450,425,475,430,485,455,510,395,445,415,465]),
Object.freeze([405,475,435,505,485,560,515,590,525,600,555,630,475,550,505,580]),
Object.freeze([480,565,520,605,600,660,635,695,655,705,695,745,615,650,650,685]),
Object.freeze([220,240,230,255,260,285,270,295,280,300,290,310,250,275,260,285]),
Object.freeze([265,305,285,320,320,355,335,375,340,380,360,395,315,350,330,370]),
Object.freeze([300,350,320,375,360,415,380,435,390,440,410,465,355,405,375,430]),
Object.freeze([360,410,385,440,430,480,455,510,465,515,490,540,420,475,450,500]),
Object.freeze([435,500,470,535,540,585,575,620,590,630,620,665,550,575,585,610]),
Object.freeze([485,535,525,570,600,630,640,665,660,675,700,710,615,620,655,655]),
Object.freeze([555,645,600,690,695,755,740,800,760,810,805,855,710,740,755,785]),
Object.freeze([265,310,285,330,320,365,340,385,350,390,370,410,315,360,335,380]),
Object.freeze([310,360,335,385,375,425,400,450,405,455,430,480,370,415,390,440]),
Object.freeze([355,405,385,435,425,480,455,510,460,515,490,545,420,470,445,500]),
Object.freeze([435,485,470,525,540,570,580,605,600,610,635,650,555,560,590,595]),
Object.freeze([505,595,550,640,635,690,680,735,695,745,740,790,655,680,695,725]),
Object.freeze([555,640,600,685,690,750,740,795,760,800,810,850,705,735,755,785]),
Object.freeze([685,770,745,835,885,925,945,985,985,1005,1045,1065,905,905,970,965]),
Object.freeze([360,420,390,450,435,495,465,525,470,535,500,565,425,485,455,515]),
Object.freeze([425,475,465,510,535,555,570,595,585,600,620,635,545,545,585,585]),
Object.freeze([505,585,550,635,635,685,680,730,695,735,740,780,650,675,695,720]),
Object.freeze([585,675,640,730,730,795,785,850,805,850,860,905,750,780,805,835]),
Object.freeze([580,695,640,755,735,810,795,870,815,875,875,935,755,795,815,860]),
Object.freeze([750,935,825,1010,975,1170,1050,1245,1095,1285,1170,1360,1010,1195,1085,1275]),
Object.freeze([525,635,570,680,655,740,700,785,715,790,755,835,670,725,715,765]),
Object.freeze([605,720,660,775,750,840,805,895,825,900,880,955,770,825,825,880]),
Object.freeze([725,825,790,890,930,980,995,1045,1030,1065,1095,1130,955,965,1020,1030]),
Object.freeze([775,945,845,1020,995,1170,1070,1245,1110,1285,1185,1360,1030,1205,1100,1275]),
Object.freeze([930,1160,1045,1275,1190,1430,1305,1540,1335,1570,1450,1685,1230,1470,1345,1580]),
Object.freeze([770,900,840,965,985,1060,1050,1130,1090,1155,1155,1220,1010,1045,1075,1110]),
Object.freeze([900,1110,980,1195,1145,1360,1225,1445,1270,1485,1350,1570,1180,1395,1260,1480]),
Object.freeze([1005,1255,1115,1365,1270,1530,1385,1645,1405,1670,1520,1780,1310,1570,1425,1685]),
Object.freeze([1265,1530,1405,1675,1615,1870,1755,2015,1795,2045,1940,2185,1700,1915,1840,2060]),
Object.freeze([1630,1845,1710,2015,2040,2260,2120,2430,2255,2475,2335,2650,2135,2360,2215,2530])
]);

const PRICES_150 = Object.freeze([
Object.freeze([195,240,210,255,235,280,250,295,250,295,265,310,230,275,245,290]),
Object.freeze([230,265,245,280,275,310,290,325,295,330,305,345,265,305,280,320]),
Object.freeze([245,285,255,295,295,335,305,345,315,355,325,365,285,330,295,340]),
Object.freeze([280,330,290,340,335,385,345,400,360,410,370,425,325,380,340,390]),
Object.freeze([205,245,215,255,245,290,260,300,265,305,275,320,240,280,255,290]),
Object.freeze([240,290,250,300,285,340,295,350,305,360,320,370,280,330,290,345]),
Object.freeze([265,320,280,335,320,375,330,390,340,400,355,415,305,370,320,385]),
Object.freeze([320,370,335,390,380,435,400,450,410,470,430,485,375,425,390,445]),
Object.freeze([235,270,245,280,280,315,295,330,305,335,315,350,270,310,285,325]),
Object.freeze([265,300,280,315,320,350,335,365,345,375,360,390,315,345,330,360]),
Object.freeze([285,340,305,360,345,400,360,420,370,430,390,445,335,395,355,410]),
Object.freeze([350,400,370,425,415,470,440,495,450,510,475,530,410,460,430,485]),
Object.freeze([440,490,475,520,550,580,580,610,600,625,635,655,565,570,595,600]),
Object.freeze([500,585,535,625,625,685,665,725,685,735,725,775,640,675,680,710]),
Object.freeze([225,250,235,260,270,295,280,305,290,315,300,325,260,285,270,295]),
Object.freeze([275,315,295,335,330,370,345,390,355,400,375,415,325,365,340,385]),
Object.freeze([310,365,330,385,375,430,395,450,405,460,430,485,370,425,390,445]),
Object.freeze([370,425,400,455,445,500,475,525,485,535,510,565,440,490,465,520]),
Object.freeze([450,520,485,550,560,605,595,640,615,655,650,690,575,595,610,630]),
Object.freeze([505,570,540,605,625,670,660,710,690,720,725,755,640,660,675,700]),
Object.freeze([575,665,620,710,720,785,765,830,790,840,840,885,740,765,785,810]),
Object.freeze([275,320,295,340,335,380,355,400,365,410,385,430,330,375,350,395]),
Object.freeze([320,370,345,395,390,440,415,465,425,475,450,500,385,435,405,460]),
Object.freeze([365,420,395,450,440,495,470,525,480,535,510,565,435,490,460,520]),
Object.freeze([450,505,485,540,565,590,600,630,625,635,660,675,580,580,615,615]),
Object.freeze([525,615,565,655,660,715,705,760,725,775,770,815,680,705,720,750]),
Object.freeze([570,655,620,705,715,775,765,820,790,830,840,880,735,760,780,810]),
Object.freeze([705,795,765,855,915,955,980,1015,1025,1040,1085,1105,940,935,1005,995]),
Object.freeze([370,435,400,465,450,510,480,545,485,555,520,585,440,505,470,535]),
Object.freeze([440,490,475,525,555,575,590,615,610,620,645,660,570,565,605,605]),
Object.freeze([520,605,565,650,655,705,700,755,720,760,765,805,675,695,720,740]),
Object.freeze([600,695,655,750,755,820,810,875,835,880,890,935,775,805,830,860]),
Object.freeze([635,740,695,800,825,885,890,945,935,965,995,1030,855,870,920,930]),
Object.freeze([770,965,850,1040,1010,1205,1085,1285,1135,1330,1215,1410,1045,1240,1120,1315]),
Object.freeze([540,655,585,695,675,760,720,805,740,815,785,855,695,745,735,790]),
Object.freeze([625,740,680,795,775,865,830,920,855,925,910,980,795,850,850,905]),
Object.freeze([745,845,810,910,960,1010,1025,1075,1070,1100,1135,1165,985,990,1050,1055]),
Object.freeze([795,975,870,1045,1030,1210,1105,1280,1150,1330,1220,1400,1065,1245,1135,1315]),
Object.freeze([1030,1190,1140,1305,1320,1470,1435,1585,1485,1620,1595,1730,1395,1510,1510,1625]),
Object.freeze([790,970,860,1040,1015,1195,1080,1265,1125,1315,1195,1380,1040,1225,1110,1295]),
Object.freeze([920,1135,1000,1220,1175,1400,1260,1480,1310,1530,1390,1615,1215,1435,1295,1520]),
Object.freeze([1100,1280,1210,1395,1395,1570,1510,1685,1555,1715,1665,1830,1470,1610,1585,1725]),
Object.freeze([1295,1650,1435,1795,1660,2025,1800,2165,1850,2220,1990,2365,1745,2110,1890,2255]),
Object.freeze([1665,1885,1745,2055,2085,2315,2170,2485,2310,2540,2390,2710,2185,2420,2265,2590])
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
dimensions = normalizeDimensionPair(
sizeOrWidth,
maybeLength
);
}
else if (
sizeOrWidth &&
typeof sizeOrWidth === "object"
) {
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
const rows =
PRICE_MATRIX[String(borderAnchor)];

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
const resolution =
getBorderAnchors(border);

if (!resolution) {
return null;
}

const lowerPrice =
getRawMatrixPrice(
resolution.lower,
sizeKey,
variantIndex
);

if (!Number.isFinite(lowerPrice)) {
return null;
}

if (
resolution.lower ===
resolution.upper
) {
return lowerPrice;
}

const upperPrice =
getRawMatrixPrice(
resolution.upper,
sizeKey,
variantIndex
);

if (!Number.isFinite(upperPrice)) {
return null;
}

return roundRetailPrice(
lowerPrice +
(
upperPrice -
lowerPrice
) *
resolution.ratio
);
}

const STANDARD_SIZE_ANCHORS =
Object.freeze(
STANDARD_SIZE_KEYS.map(
sizeKey => {
const dimensions =
parseSizeKey(sizeKey);

return Object.freeze({
size: sizeKey,
width: dimensions.width,
length: dimensions.length
});
}
)
);

function getStandardPrice(options = {}) {
const sizeKey = options.size
? normalizeSize(options.size)
: normalizeSize(
options.width ??
options.internalWidth,
options.length ??
options.internalLength
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

const variantIndex =
getVariantIndex(
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

const price =
getAnchorPriceAtBorder(
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
const widthScale =
Math.max(targetWidth, 1);

const lengthScale =
Math.max(targetLength, 1);

const widthDifference =
(
anchorWidth -
targetWidth
) /
widthScale;

const lengthDifference =
(
anchorLength -
targetLength
) /
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
const dimensions =
normalizeDimensionPair(
width,
length
);

const normalizedBorder =
normalizeBorder(border);

if (
!dimensions ||
normalizedBorder === null ||
!Number.isInteger(variantIndex)
) {
return [];
}

const count = Math.max(
1,
Math.floor(
Number(neighbourCount) || 1
)
);

return STANDARD_SIZE_ANCHORS
.map(anchor => ({
...anchor,

price:
getAnchorPriceAtBorder(
anchor.size,
variantIndex,
normalizedBorder
),

distance:
getRelativeAnchorDistance(
dimensions.width,
dimensions.length,
anchor.width,
anchor.length
)
}))
.filter(
anchor =>
Number.isFinite(
anchor.price
)
)
.sort(
(first, second) =>
first.distance -
second.distance
)
.slice(
0,
count
);
}

function interpolateCustomPrice(
width,
length,
variantIndex,
border,
options = {}
) {
const dimensions =
normalizeDimensionPair(
width,
length
);

const normalizedBorder =
normalizeBorder(border);

if (
!dimensions ||
normalizedBorder === null ||
!Number.isInteger(variantIndex)
) {
return null;
}

const sizeKey =
normalizeSize(
dimensions.width,
dimensions.length
);

if (
CUSTOM_PRICING_CONFIG
.exactStandardSizeUsesExactPrice &&
hasStandardSize(sizeKey)
) {
const exactPrice =
getAnchorPriceAtBorder(
sizeKey,
variantIndex,
normalizedBorder
);

if (
!Number.isFinite(
exactPrice
)
) {
return null;
}

return {
source:
"exact-standard-size",

price:
exactPrice,

size:
sizeKey,

width:
dimensions.width,

length:
dimensions.length,

border:
normalizedBorder,

anchors:
Object.freeze([
Object.freeze({
size:
sizeKey,

width:
dimensions.width,

length:
dimensions.length,

price:
exactPrice,

distance:
0,

weight:
1
})
])
};
}

const neighbourCount =
options.neighbourCount ??
CUSTOM_PRICING_CONFIG
.neighbourCount;

const distancePower =
Math.max(
0.0001,

Number(
options.distancePower ??
CUSTOM_PRICING_CONFIG
.distancePower
) || 2
);

const anchors =
getNearestPriceAnchors(
dimensions.width,
dimensions.length,
variantIndex,
normalizedBorder,
neighbourCount
);

if (!anchors.length) {
return null;
}

const exactAnchor =
anchors.find(
anchor =>
anchor.distance === 0
);

if (exactAnchor) {
return {
source:
"exact-anchor",

price:
exactAnchor.price,

size:
exactAnchor.size,

width:
dimensions.width,

length:
dimensions.length,

border:
normalizedBorder,

anchors:
Object.freeze([
Object.freeze({
...exactAnchor,
weight: 1
})
])
};
}

const weightedAnchors =
anchors.map(
anchor => {
const weight =
1 /
Math.pow(
Math.max(
anchor.distance,
0.000001
),
distancePower
);

return {
...anchor,
weight
};
}
);

const totalWeight =
weightedAnchors.reduce(
(total, anchor) =>
total +
anchor.weight,
0
);

if (
!Number.isFinite(totalWeight) ||
totalWeight <= 0
) {
return null;
}

const rawPrice =
weightedAnchors.reduce(
(total, anchor) =>
total +
(
anchor.price *
anchor.weight
),
0
) /
totalWeight;

return {
source:
"custom-interpolation",

price:
roundRetailPrice(rawPrice),

size:
sizeKey,

width:
dimensions.width,

length:
dimensions.length,

border:
normalizedBorder,

anchors:
Object.freeze(
weightedAnchors.map(
anchor =>
Object.freeze({
...anchor
})
)
)
};
}

function getCustomPrice(options = {}) {
const dimensions =
normalizeDimensionPair(
options.width ??
options.internalWidth,

options.length ??
options.internalLength
);

const glazing =
normalizeGlazing(
options.glazing ??
options.glazingType ??
options.unitType
);

const finish =
normalizeFinish(
options.finish ??
options.tint ??
"clear"
);

const type =
normalizeType(
options.type ??
options.bottomType ??
"toughened"
);

const border =
normalizeBorder(
options.border ?? 100
);

const variantIndex =
getVariantIndex(
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

const result =
interpolateCustomPrice(
dimensions.width,
dimensions.length,
variantIndex,
border,
options.interpolation || {}
);

if (
!result ||
!Number.isFinite(
result.price
)
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

return {
available: true,
strategy: STRATEGY_ID,
strategyLabel: STRATEGY_LABEL,
strategyVersion: STRATEGY_VERSION,
source: result.source,
reasonCode: null,

size:
result.size,

width:
result.width,

length:
result.length,

glazing,
finish,
type,
border,

price:
result.price,

interpolationAnchors:
result.anchors
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
return getStandardPrice(
options
);
}

if (mode === "custom") {
return getCustomPrice(
options
);
}

const sizeKey = options.size
? normalizeSize(
options.size
)
: normalizeSize(
options.width ??
options.internalWidth,

options.length ??
options.internalLength
);

if (
sizeKey &&
hasStandardSize(sizeKey)
) {
return getStandardPrice({
...options,
size: sizeKey
});
}

return getCustomPrice(
options
);
}

function getPriceValue(options = {}) {
const result =
getPrice(options);

return result.available
? result.price
: null;
}

function getStandardPriceValue(
options = {}
) {
const result =
getStandardPrice(options);

return result.available
? result.price
: null;
}

function getCustomPriceValue(
options = {}
) {
const result =
getCustomPrice(options);

return result.available
? result.price
: null;
}

return Object.freeze({
STRATEGY_ID,
STRATEGY_LABEL,
STRATEGY_VERSION,
PRICE_UNAVAILABLE,

NORMAL_OVER_CHEAP_PROFIT_MULTIPLIER,

NORMAL_FINISH_PROFIT_MULTIPLIERS,
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
