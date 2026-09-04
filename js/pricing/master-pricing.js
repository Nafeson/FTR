/*
* Factory Toughened Rooflights
* master-pricing.js
*
* MASTER SITEWIDE PRICE ROUTER
*
* PURPOSE
* - Reads the active strategy from site-pricing-config.js.
* - Routes every product-price request to exactly one live strategy file:
* pricing-cheap.js
* pricing-normal.js
* pricing-expensive.js
* - Supports both standard Order Page prices and custom-calculator prices.
* - Returns final customer PRODUCT prices only.
* - Customer delivery remains separate in master-delivery-rates.js.
*
* IMPORTANT
* - This file does NOT contain supplier glass costs.
* - This file does NOT calculate manufacturing costs.
* - This file does NOT calculate Stripe fees.
* - This file does NOT calculate VAT / retained-revenue allowances.
* - This file does NOT calculate customer delivery charges.
* - This file does NOT calculate actual delivery costs.
* - This file does NOT alter the prices returned by a strategy file.
* - There is NO automatic fallback to another pricing strategy.
*
* EXPECTED BROWSER LOAD ORDER
*
* 1. pricing-cheap.js
* 2. pricing-normal.js
* 3. pricing-expensive.js
* 4. site-pricing-config.js
* 5. master-pricing.js
*
* pricing-expensive.js currently depends on pricing-normal.js, so Normal must
* be loaded before Expensive.
*
* SITEWIDE STRATEGY SWITCH
*
* Change only the active strategy in site-pricing-config.js:
*
* "cheap"
* "normal"
* "expensive"
*
* Both the standard Order Page and custom calculator should call THIS file,
* rather than calling a strategy file directly.
*/

(function (globalScope, factory) {
let config = null;
let cheap = null;
let normal = null;
let expensive = null;

if (globalScope) {
config =
globalScope.FactoryRooflightsSitePricingConfig ||
null;

cheap =
globalScope.FactoryRooflightsPricingCheap ||
null;

normal =
globalScope.FactoryRooflightsPricingNormal ||
null;

expensive =
globalScope.FactoryRooflightsPricingExpensive ||
null;
}

if (
typeof module !== "undefined" &&
module.exports &&
typeof require === "function"
) {
if (!cheap) {
cheap = require("./pricing-cheap.js");
}

if (!normal) {
normal = require("./pricing-normal.js");
}

if (!expensive) {
expensive = require("./pricing-expensive.js");
}

if (!config) {
config = require("./site-pricing-config.js");
}
}

const api = factory({
config,
cheap,
normal,
expensive
});

if (typeof module !== "undefined" && module.exports) {
module.exports = api;
}

if (globalScope) {
globalScope.FactoryRooflightsMasterPricing = api;
}
})(typeof globalThis !== "undefined" ? globalThis : this, function (dependencies) {
"use strict";

const MASTER_ID = "master-pricing";
const MASTER_VERSION = "2026-09-04";

const PRICE_UNAVAILABLE = "PRICE_UNAVAILABLE";
const STRATEGY_UNAVAILABLE = "STRATEGY_UNAVAILABLE";
const INVALID_PRICING_REQUEST = "INVALID_PRICING_REQUEST";

const config = dependencies?.config || null;

const STRATEGIES = Object.freeze({
cheap: dependencies?.cheap || null,
normal: dependencies?.normal || null,
expensive: dependencies?.expensive || null
});

const ALLOWED_STRATEGIES = Object.freeze([
"cheap",
"normal",
"expensive"
]);

/* =========================================
* INITIAL VALIDATION
* ========================================= */

function normalizeStrategy(strategy) {
const value = String(strategy ?? "")
.trim()
.toLowerCase();

return ALLOWED_STRATEGIES.includes(value)
? value
: null;
}

function validateStrategyModule(
strategyId,
strategyModule
) {
if (
!strategyModule ||
typeof strategyModule !== "object"
) {
return false;
}

if (
strategyModule.STRATEGY_ID !==
strategyId
) {
return false;
}

if (
typeof strategyModule.getPrice !==
"function"
) {
return false;
}

if (
typeof strategyModule.getStandardPrice !==
"function"
) {
return false;
}

if (
typeof strategyModule.getCustomPrice !==
"function"
) {
return false;
}

return true;
}

function assertDependencies() {
if (
!config ||
typeof config !== "object"
) {
throw new Error(
"master-pricing.js requires site-pricing-config.js to be loaded first."
);
}

const configuredStrategy =
normalizeStrategy(
config.activeStrategy ??
(
typeof config.getActiveStrategy ===
"function"
? config.getActiveStrategy()
: null
)
);

if (!configuredStrategy) {
throw new Error(
"master-pricing.js could not resolve a valid active pricing strategy."
);
}

ALLOWED_STRATEGIES.forEach(
strategyId => {
const strategyModule =
STRATEGIES[strategyId];

if (
!validateStrategyModule(
strategyId,
strategyModule
)
) {
throw new Error(
`master-pricing.js requires a valid ${strategyId} pricing strategy module.`
);
}
}
);
}

assertDependencies();

/* =========================================
* ACTIVE STRATEGY
* ========================================= */

function getActiveStrategyId() {
const configuredStrategy =
typeof config.getActiveStrategy ===
"function"
? config.getActiveStrategy()
: config.activeStrategy;

return normalizeStrategy(
configuredStrategy
);
}

function getStrategyModule(strategy) {
const strategyId =
normalizeStrategy(strategy);

if (!strategyId) {
return null;
}

const strategyModule =
STRATEGIES[strategyId];

return validateStrategyModule(
strategyId,
strategyModule
)
? strategyModule
: null;
}

function getActiveStrategyModule() {
return getStrategyModule(
getActiveStrategyId()
);
}

function getActiveStrategyLabel() {
const strategy =
getActiveStrategyModule();

return (
strategy?.STRATEGY_LABEL ||
null
);
}

/* =========================================
* REQUEST NORMALISATION
* ========================================= */

function normalizePricingMode(mode) {
const value = String(mode ?? "")
.trim()
.toLowerCase();

if (value === "standard") {
return "standard";
}

if (value === "custom") {
return "custom";
}

return null;
}

function normalizeRequest(options = {}) {
if (
!options ||
typeof options !== "object"
) {
return null;
}

return {
...options,

pricingMode:
normalizePricingMode(
options.pricingMode ??
options.mode
) || undefined
};
}

/* =========================================
* MASTER RESULT HELPERS
* ========================================= */

function buildUnavailableResult({
strategyId = null,
pricingMode = null,
reasonCode = PRICE_UNAVAILABLE,
reason = "Price unavailable.",
strategyResult = null,
request = null
} = {}) {
return {
available: false,

master: MASTER_ID,
masterVersion: MASTER_VERSION,

strategy: strategyId,

strategyLabel:
getStrategyModule(
strategyId
)?.STRATEGY_LABEL ||
null,

pricingMode,

source:
strategyResult?.source ||
null,

reasonCode,
reason,

price: null,

request,
strategyResult
};
}

function wrapStrategyResult({
strategyId,
pricingMode,
request,
strategyResult
}) {
if (
!strategyResult ||
strategyResult.available !== true ||
!Number.isFinite(
Number(strategyResult.price)
)
) {
return buildUnavailableResult({
strategyId,
pricingMode,

reasonCode:
strategyResult?.reasonCode ||
PRICE_UNAVAILABLE,

reason:
strategyResult?.reason ||
"The selected pricing strategy could not return a price for this product.",

strategyResult,
request
});
}

return {
available: true,

master: MASTER_ID,
masterVersion: MASTER_VERSION,

strategy: strategyId,

strategyLabel:
strategyResult.strategyLabel ||
getStrategyModule(
strategyId
)?.STRATEGY_LABEL ||
null,

strategyVersion:
strategyResult.strategyVersion ||
getStrategyModule(
strategyId
)?.STRATEGY_VERSION ||
null,

pricingMode,

source:
strategyResult.source ||
pricingMode,

reasonCode: null,
reason: null,

size:
strategyResult.size ??
null,

width:
strategyResult.width ??
null,

length:
strategyResult.length ??
null,

glazing:
strategyResult.glazing ??
null,

finish:
strategyResult.finish ??
null,

type:
strategyResult.type ??
null,

border:
strategyResult.border ??
null,

price:
Number(
strategyResult.price
),

interpolationAnchors:
strategyResult
.interpolationAnchors ??
null,

request,
strategyResult
};
}

/* =========================================
* ROUTING
* ========================================= */

function resolveStrategyId(options = {}) {
/*
* By default ALL live site pricing uses
* site-pricing-config.js.
*
* strategyOverride exists only for deliberate
* admin/testing use.
*
* Normal Order Page / Custom Calculator code
* should NOT send strategyOverride.
*/

if (
options.strategyOverride !==
undefined
) {
return normalizeStrategy(
options.strategyOverride
);
}

return getActiveStrategyId();
}

function routePriceRequest(
options = {},
forcedMode = null
) {
const request =
normalizeRequest(options);

if (!request) {
return buildUnavailableResult({
strategyId:
getActiveStrategyId(),

pricingMode:
forcedMode,

reasonCode:
INVALID_PRICING_REQUEST,

reason:
"Invalid pricing request.",

request: null
});
}

const strategyId =
resolveStrategyId(request);

const strategy =
getStrategyModule(
strategyId
);

if (
!strategyId ||
!strategy
) {
return buildUnavailableResult({
strategyId,

pricingMode:
forcedMode ||
request.pricingMode ||
null,

reasonCode:
STRATEGY_UNAVAILABLE,

reason:
"The requested pricing strategy is unavailable.",

request
});
}

const requestedMode =
forcedMode ||
request.pricingMode ||
null;

let strategyResult;
let resolvedMode =
requestedMode;

try {
if (
requestedMode ===
"standard"
) {
strategyResult =
strategy.getStandardPrice({
...request,
pricingMode: "standard"
});
}
else if (
requestedMode ===
"custom"
) {
strategyResult =
strategy.getCustomPrice({
...request,
pricingMode: "custom"
});
}
else {
strategyResult =
strategy.getPrice(
request
);

if (
strategyResult?.source ===
"standard"
) {
resolvedMode =
"standard";
}
else if (
strategyResult?.source ===
"custom" ||
strategyResult?.source ===
"custom-interpolation" ||
strategyResult?.source ===
"exact-standard-size" ||
strategyResult?.source ===
"exact-anchor"
) {
resolvedMode =
"custom";
}
}
}
catch (error) {
return buildUnavailableResult({
strategyId,

pricingMode:
requestedMode,

reasonCode:
PRICE_UNAVAILABLE,

reason:
error instanceof Error
? error.message
: "The selected pricing strategy failed to calculate a price.",

request
});
}

return wrapStrategyResult({
strategyId,
pricingMode:
resolvedMode,
request,
strategyResult
});
}

/* =========================================
* PUBLIC PRICE METHODS
* ========================================= */

function getPrice(options = {}) {
return routePriceRequest(
options
);
}

function getStandardPrice(
options = {}
) {
return routePriceRequest(
options,
"standard"
);
}

function getCustomPrice(
options = {}
) {
return routePriceRequest(
options,
"custom"
);
}

function getPriceValue(
options = {}
) {
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

/* =========================================
* STRATEGY COMPARISON / ADMIN HELPERS
*
* These do NOT change the active strategy.
* Useful for internal checking only.
* ========================================= */

function getPriceForStrategy(
strategy,
options = {}
) {
const strategyId =
normalizeStrategy(
strategy
);

if (!strategyId) {
return buildUnavailableResult({
strategyId: null,

pricingMode:
normalizePricingMode(
options.pricingMode ??
options.mode
),

reasonCode:
STRATEGY_UNAVAILABLE,

reason:
"Invalid pricing strategy.",

request:
options
});
}

return routePriceRequest({
...options,
strategyOverride:
strategyId
});
}

function compareStrategies(
options = {}
) {
return Object.freeze({
cheap:
getPriceForStrategy(
"cheap",
options
),

normal:
getPriceForStrategy(
"normal",
options
),

expensive:
getPriceForStrategy(
"expensive",
options
)
});
}

/* =========================================
* STATUS / DEBUG HELPERS
* ========================================= */

function getSystemStatus() {
const activeStrategy =
getActiveStrategyId();

return Object.freeze({
master:
MASTER_ID,

masterVersion:
MASTER_VERSION,

activeStrategy,

activeStrategyLabel:
getActiveStrategyLabel(),

allowedStrategies:
ALLOWED_STRATEGIES,

strategies:
Object.freeze({
cheap:
Object.freeze({
loaded:
validateStrategyModule(
"cheap",
STRATEGIES.cheap
),

version:
STRATEGIES.cheap
?.STRATEGY_VERSION ||
null
}),

normal:
Object.freeze({
loaded:
validateStrategyModule(
"normal",
STRATEGIES.normal
),

version:
STRATEGIES.normal
?.STRATEGY_VERSION ||
null
}),

expensive:
Object.freeze({
loaded:
validateStrategyModule(
"expensive",
STRATEGIES.expensive
),

version:
STRATEGIES.expensive
?.STRATEGY_VERSION ||
null
})
})
});
}

/* =========================================
* PUBLIC API
* ========================================= */

return Object.freeze({
MASTER_ID,
MASTER_VERSION,

PRICE_UNAVAILABLE,
STRATEGY_UNAVAILABLE,
INVALID_PRICING_REQUEST,

ALLOWED_STRATEGIES,

normalizeStrategy,
normalizePricingMode,
normalizeRequest,

getActiveStrategyId,
getActiveStrategyLabel,
getStrategyModule,
getActiveStrategyModule,

getPrice,
getStandardPrice,
getCustomPrice,

getPriceValue,
getStandardPriceValue,
getCustomPriceValue,

getPriceForStrategy,
compareStrategies,

getSystemStatus
});
});
