/*
* Factory Toughened Rooflights
* site-pricing-config.js
*
* SINGLE SITEWIDE PRICING STRATEGY SWITCH
*
* Change ONLY the value of:
*
* activeStrategy: "normal"
*
* Allowed values:
* "cheap"
* "normal"
* "expensive"
*
* master-pricing.js will read this setting and route both:
* - Standard Order Page prices
* - Custom Calculator prices
*
* through the selected pricing strategy.
*/

(function (globalScope, factory) {
const api = factory();

if (typeof module !== "undefined" && module.exports) {
module.exports = api;
}

if (globalScope) {
globalScope.FactoryRooflightsSitePricingConfig = api;
}
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
"use strict";

const ALLOWED_STRATEGIES = Object.freeze([
"cheap",
"normal",
"expensive"
]);

/*
* =========================================
* SITEWIDE PRICING SWITCH
* =========================================
*
* Change this ONE value to:
*
* "cheap"
* "normal"
* "expensive"
*
* Example:
*
* activeStrategy: "cheap"
*
* The rest of the website pricing system
* should not need editing.
* =========================================
*/

const ACTIVE_STRATEGY = "cheap";

function normalizeStrategy(strategy) {
const value = String(strategy ?? "")
.trim()
.toLowerCase();

return ALLOWED_STRATEGIES.includes(value)
? value
: null;
}

function isValidStrategy(strategy) {
return normalizeStrategy(strategy) !== null;
}

const activeStrategy = normalizeStrategy(
ACTIVE_STRATEGY
);

if (!activeStrategy) {
throw new Error(
`Invalid pricing strategy "${ACTIVE_STRATEGY}". ` +
`Allowed strategies: ${ALLOWED_STRATEGIES.join(", ")}.`
);
}

function getActiveStrategy() {
return activeStrategy;
}

function isCheap() {
return activeStrategy === "cheap";
}

function isNormal() {
return activeStrategy === "normal";
}

function isExpensive() {
return activeStrategy === "expensive";
}

return Object.freeze({
activeStrategy,

ALLOWED_STRATEGIES,

normalizeStrategy,
isValidStrategy,

getActiveStrategy,

isCheap,
isNormal,
isExpensive
});
});
