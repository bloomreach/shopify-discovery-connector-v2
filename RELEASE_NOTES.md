## 2.2.8

### Fixed

- [`Fixed`]: Fixed sorting on search and category pages without the need to refresh


## 2.2.7

### Added

- [`Added`]: Added toggle for 'mixed-mode' pixel. This accounts for users who wish to fire some but not all of pixel events.

## 2.2.6

### Added

- [`Added`]: Event dispatcher for other Apps.

```js
/**
*
* The Bloomreach search module dispatches a custom event 'bloomreach:searchResults:updated'
* whenever search results are redrawn. Other apps (like wishlist) can listen for this event
* to know when to reinitialize their functionality on the new product tiles.
*
* Example usage in another app:
*
* // Listen at document level (most reliable)
* document.addEventListener('bloomreach:searchResults:updated', function(event) {
*   console.log('Search results updated, refreshing app components');
*   console.log('Number of products:', event.detail.resultsCount);
*
*   // Re-initialize your app's functionality for the updated search results
*   initializeWishlistHearts();
* });
*
* // Or listen directly on the results container if you prefer
* document.querySelector('.blm-product-search__results')?.addEventListener(
*   'bloomreach:searchResults:updated',
*   function(event) {
*     // Your code here
*   }
* );
  */
```

## 2.2.5

### Added

- [`Added`]: Added br-trk v17.1, a custom version for use with the shopify connector that will enable RTS

## 2.2.4

### Fixed

- [`Fixed`]: Fix When firing the pixel, cookie2 param was not properly url-encoded. This update repairs the pixel fire.

## 2.2.3

### Fixed

- [`Fixed`]: Fix 2.2.2 introduced a bug where the uid would duplicate inside the cookie2 param. This release fixes that issue.

## 2.2.2

### Fixed

- [`Fixed`]: Fix when bloomreach pixel is enabled to also send cookie2 param value. Param includes connector version 'shop2.2' and increments hit count.

## 2.2.1

### Fixed

- [`Fixed`]: Fix settings error when markets are disabled or managed by a third party (https://bloomreach.atlassian.net/browse/DCONN-92).
- [`ADDED`]: Created a settings for pixel to toggle region: EU or US

## 2.2.0

### Added

- [`ADDED`]: Added support for Bloomreach Discovery multi-catalog and multi-view, based on Shopify Markets.
- [`ADDED`]: Allow default configurations in the App for Search, Collections, Autosuggest, and Recommendations components.
- [`ADDED`]: Allow market-specific configurations in the App for Autosuggest components.
- [`ADDED`]: Allow market-specific templates for all components. Existing templates are treated as defaults.

### Changed

- [`CHANGED`]: Changed Search and Collections components from App Embeds to App Blocks. Their App Block configurations can override the default ones from the app, similar to how Recommendations widgets work.
- [`CHANGED`]: Combined Autosuggest and Pixel App Embeds to one "Bloomreach Configuration" App Embeds, which functions as a master switch for all Bloomreach components. This avoids repeated defining of the global config object.
- [`CHANGED`]: Moved Autosuggest configs to the app. This allows per-market configurations.
- [`CHANGED`]: Changed pixel implementation to use Shopify Webpixels. This removes the needs for custom scripts in checkout pages (for conversion pixels).
- [`CHANGED`]: Other usability changes.

### Fixed

- [`Fixed`] Infinite scroll issues (https://bloomreach.atlassian.net/browse/DCONN-79).

## 2.1.1

### Fixed

- [`FIXED`]: Customized Autosuggest template not loaded by the storefront.

## 2.1.0

### Added

- [`ADDED`]: Added support for [Bloomreach Discovery Facet Response V3](https://documentation.bloomreach.com/discovery/reference/facet-response-v3-unified-ranking).

### Fixed

- [`FIXED`]: Remove the useless `sort` parameter from autosuggest to avoid potential API issues.
- [`FIXED`]: Fix Pathways & Recommendations widgets not picking up the `fields` config.

## 2.0.0

### Changed

- [`CHANGED`]: Completely rewriting of the app using the new Theme App Extensions.
- [`CHANGED`]: Removed usages of the Assets API. This is a breaking change.
