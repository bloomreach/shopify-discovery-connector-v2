---
title: Shopify App v2 User Guide
category: 61b785225c1c75017a430718
slug: shopify-app-user-guide
parentDocSlug: discovery-connectors
---

## Getting started

### Installation

The app can be easily installed from the Shopify App Store. Head to the Bloomreach Discovery v2 Shopify app page and click **Add app**. You will be prompted with an Authorization screen. Click **Install** to install our application on your store.

![Shopify app page](https://raw.githubusercontent.com/bloomreach/shopify-discovery-connector-v2/main/docs/images/shopify-app-install.png)

### Linking the app to your Bloomreach account

When getting started with Bloomreach, you will first work with a member of our Integrations team to create an account, import your product feed, configure searchable attributes and get your search APIs live.

Once you finish the initial account setup and configuration, you will receive access to your environment from the Support team. You can then use your Bloomreach account to authenticate with your Shopify app. To do this, enter your Bloomreach account credentials into the Shopify app. Your credentials are found on your Bloomreach Dashboard, under the **Internal Admin** > **Discovery** **API Details** menu item.

![Discovery API details](https://raw.githubusercontent.com/bloomreach/shopify-discovery-connector-v2/main/docs/images/link-keys.png)

Copy the keys into the Shopify app credentials form on the Settings page:

![Credentials settings](https://raw.githubusercontent.com/bloomreach/shopify-discovery-connector-v2/main/docs/images/link-settings.png)

The following fields are all needed for a successful integration:

- Account ID
- Domain Key
- Auth Key
- Search Page
  - Here you have to enter the Search Results page URL, it supports both relative and absolute values
  - This is required to correctly set redirect links. In Shopify, the URL is always `/search/`, for example: `https://store-domain.com/search/`

## Configuring the app

Once the app is installed you can start configuring it.

There are nine sections with configuration options:

1. **Home**: News and Analytics panel.
2. **Indexing**: Configuration of the indexing.
3. **Search**: Search template settings and theme installation.
4. **Autosuggest**: Autosuggest template settings and theme installation.
5. **Collections**: Collections template settings and theme installation.
6. **Recommendations**: Recommendations Widgets settings and theme installation.
7. **Pixel**: Pixel scripts and theme installation.
8. **Optimize**: Configuration of search relevance.
9. **Settings**: Credentials and Multi-currency settings.

### Search/Collections

#### Enable on a theme

To customize and start using a Bloomreach **search**/**collections** feature, navigate to the corresponding page. You will find a list of themes installed in your Shopify store in the **Enable [Bloomreach Feature] on a Theme** section. Click on a theme to open the Shopify theme editor in a new tab and enable the corresponding Bloomreach feature on that theme. Below shows an example of the **Bloomreach Search** feature:

![Enable Bloomreach Search on a theme](https://raw.githubusercontent.com/bloomreach/shopify-discovery-connector-v2/main/docs/images/theme-enable.png)

You can then customize the Bloomreach feature in the Shopify theme editor, using the **App embeds** tab:

![Bloomreach Search settings](https://raw.githubusercontent.com/bloomreach/shopify-discovery-connector-v2/main/docs/images/search-app-embeds.png)

You can customize the following options:

- **Toggle** each feature on or off on the search results/collections pages for your store.
- Choose the Bloomreach Discovery **Endpoint** for the search results/collections. Can be either **Staging** or **Production**.
- Set the **CSS selector** for the search results/collections page content.
- Set the **number of items per page** you wish to display.
- Set whether you wish to **display variants** as individual products in the results.
- Set whether you wish to **include facets** in your results.
- Set the **number of facets** you wish to display.
- Set the **number of facet values** you wish to display.
- Set whether you wish to enable **infinite scroll** on your search results/collections pages.
- Set the **attribute fields** that you want returned from Bloomreach, such as product IDs and prices.
- Add **Custom CSS** to alter the look of each feature.

#### Customize templates

You can also customize the templates for Bloomreach search/collections to better suit your storefront design. To do that, navigate to the corresponding page, then go to the **Template** or **Product List Template** section:

![Customize templates](https://raw.githubusercontent.com/bloomreach/shopify-discovery-connector-v2/main/docs/images/edit-templates.png)

The **Template** is used for product grid containers (including headers, toolbar, etc.) and facets, while the **Product List Template** is used for each item in the product grid. The templates are based on [EJS](https://ejs.co/) format.

When you have finished editing each template in the text box, click the **Save** button to persist your changes.

##### Updating the template version

Bloomreach may release new templates from time to time. Those may contain new features, bug fixes, new API supports, etc. When the app detects a new version for a template, you will be notified with an info box like below:

![New template version notification](https://raw.githubusercontent.com/bloomreach/shopify-discovery-connector-v2/main/docs/images/template-version.png)

You then have two options to proceed:

- If you haven’t customized this template, or do not want to keep your customization, you can click **Update Automatically**. Then the new template will overwrite the current template. 
- Or, you can click the **Download** link to download the new template, and customize it offline to fit your needs. After that, paste your updated template to the textbox, and check **I have manually updated this template**. Then click the **Save** button to persist your changes.

> 🚧 Attention
> 
> It is NOT recommended to ignore this notification and continue using your old template. You may experience issues in your storefront.

### Autosuggest

#### Enable on a theme

Similar to the **Search**/**Collections**, to customize and start using the Bloomreach **autosuggest** feature, navigate to the **Autosuggest** page. You will find a list of themes installed in your Shopify store in the **Enable Bloomreach Autosuggest on a Theme** section. Click on a theme to open the Shopify theme editor in a new tab and enable the autosuggest feature on that theme. You can then customize the Bloomreach autosuggest feature in the Shopify theme editor, using the **App embeds** tab:

![Autosuggest settings](https://raw.githubusercontent.com/bloomreach/shopify-discovery-connector-v2/main/docs/images/autosuggest-app-embeds.png)

You can customize the following options:

- **Toggle** this feature on or off globally for your store.
- Choose the Bloomreach Discovery **Endpoint** for the autosuggest. Can be either **Staging** or **Production**.
- Set the **CSS selector** for the search input you wish to add autosuggest to.
- Set the **number of terms** you wish to display.
- Set the **number of products** you wish to display.
- Set the **number of collections** you wish to display.
- Add **Custom CSS** to alter the look of the autosuggest feature.

#### Customize templates

Similar to the [**Search**/**Collections**](doc:shopify-app-user-guide#customize-templates), you can also customize the templates for Bloomreach autosuggest to better suit your storefront design. To do that, navigate to the **Autosuggest** page, then go to the **Template** section. The **Template** is used for displaying the autosuggest dropdown box and is based on [EJS](https://ejs.co/) format.

When you have finished editing the template in the text box, click the **Save** button to persist your changes.

##### Update template version

[Likewise](doc:shopify-app-user-guide#updating-the-template-version), when you see the notification that a new template version is available, you can choose one of the two options:

- If you haven’t customized this template, or do not want to keep your customization, you can click **Update Automatically**. Then the new template will overwrite the current template. 
- Or, click the **Download** link to download the new template, and customize it offline to fit your needs. After that, paste your updated template to the textbox, and check **I have manually updated this template**. Then click the **Save** button to persist your changes.

> 🚧 Attention
> 
> It is NOT recommended to ignore this notification and continue using your old template. You may experience issues in your storefront.

### Recommendations

#### Add a widget to a theme

To start using the Bloomreach **Recommendations & Pathways** Widgets, navigate to the **Recommendations** page. You will find a list of themes installed in your Shopify store in the **Add Bloomreach Recommendations Widgets to a Theme** section.

![Add widget to a theme](https://raw.githubusercontent.com/bloomreach/shopify-discovery-connector-v2/main/docs/images/add-widget-to-theme.png)

Click the **Add Widget** dropdown next to the theme you want to add a widget to, and select a widget from the menu. It will open the theme editor where you can add or edit your widget.

The app supports five widget types:

- Category
- Global
- Item
- Keyword
- Personalized

For example, if you have selected **Category**, a **Bloomreach Category Widget** will be added to the Home page by default. You can move the widget around in the page, or duplicate/hide/remove it just like any other Shopify blocks in the theme editor.

Once you have added a Bloomreach widget to your page, you’ll be able to pair that widget in Shopify to the widget you’ve created in the Bloomreach Dashboard. Click on the widget to show/edit its properties in the right panel, where you can:

- Add **Widget Title** (Can be any title you select. This is only for Shopify’s front end)
- Add** Widget ID** (Must be the Widget ID you created in the Bloomreach dashboard)
- Add** Category ID** (For a Category widget, it must be the Category ID used within the Bloomreach dashboard for Category ranking)
- Set **how many items to show** at one time in the widget.
- Set **how many items to fetch** in total.
- Add **Custom CSS** to alter the look of the widget.

then click **Save** to see the widget display.

![Widget properties](https://raw.githubusercontent.com/bloomreach/shopify-discovery-connector-v2/main/docs/images/widget-settings.png)

#### Add a widget to any page

You can also add a widget to any other page using the theme editor. To do that:

- Switch to the page you want to add a widget.
- From the **sections** tab, click **Add section** under **Template**.
- In the popup menu, switch to the **Apps** tab.
- You can then find the five Bloomreach widgets there. Drag&drop the widget you want to add it to the page

> 📘 Note
>
> Bloomreach widgets must be included in an **Apps** section. You can however put multiple widgets in the same section.

![Add a widget using theme editor](https://raw.githubusercontent.com/bloomreach/shopify-discovery-connector-v2/main/docs/images/add-widget-to-page.png)

#### Customize widgets

##### Options apply to all widgets

The following options apply to all widgets in your store, and can only be customized in the app’s **Recommendations** page:

![Recommendations settings](https://raw.githubusercontent.com/bloomreach/shopify-discovery-connector-v2/main/docs/images/recommendations-settings.png)

- **Endpoint**: Choose the Bloomreach Discovery endpoint for the widgets. This can be either **Staging** or **Production**. 
- **Fields**: Set the **attribute fields** that you want returned from Bloomreach, such as product IDs and prices.
- **Template**: Customize the templates for the widgets, or update to the latest version of the template. This works similarly to [**Search/Collections**](docs:shopify-app-user-guide#customize-templates) templates.

##### Options apply to individual widget

Each widget also has its own customizable options depending on its type. They can be customized in the theme editor.

| Widget type  |  Customization options                                                                                                                                 |
| :----------- | :----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Category     | <li>Widget Title</li> <li>Widget ID</li> <li>**Category ID**</li> <li>How many items to show</li> <li>How many items to fetch</li> <li>Custom CSS</li> |
| Global       | <li>Widget Title</li> <li>Widget ID</li> <li>How many items to show</li> <li>How many items to fetch</li> <li>Custom CSS</li>                          |
| Item         | <li>Widget Title</li> <li>Widget ID</li> <li>**Item IDs**</li> <li>How many items to show</li> <li>How many items to fetch</li> <li>Custom CSS</li>    |
| Keyword      | <li>Widget Title</li> <li>Widget ID</li> <li>**Keyword**</li> <li>How many items to show</li> <li>How many items to fetch</li> <li>Custom CSS</li>     |
| Personalized | <li>Widget Title</li> <li>Widget ID</li> <li>How many items to show</li> <li>How many items to fetch</li> <li>Custom CSS</li>                          |

> 📘 Note
>
> All widgets rely on information provided by the tracking pixel. If the pixel is not enabled for your store, your widgets will not display properly.

### Pixel

#### Enable on a theme

Similar to the **Search**/**Collections**, to customize and start using the Bloomreach **pixel** feature, navigate to the **Pixel** page. You will find a list of themes installed in your Shopify store in the **Enable Bloomreach Pixel on a Theme** section. Click on a theme to open the Shopify theme editor in a new tab and enable the pixel feature on that theme. You can then toggle the Bloomreach pixel feature on or off globally for your store in the Shopify theme editor, using the **App embeds** tab:

![Pixel settings](https://raw.githubusercontent.com/bloomreach/shopify-discovery-connector-v2/main/docs/images/pixel-app-embeds.png)

Once **enabled**, the app will inject the pixel into your theme. The pixel will track users as they navigate and interact with your site. This information is passed back to Bloomreach and adds behavioral learning data to the Bloomreach algorithm.

#### Pixel Page Views

The **Bloomreach pixel** tracks 7 types of page view:

- Global Page View
- Virtual Page View
- Product Page View
- Content Page View
- Category Page View
- Search Result Page View
- Conversion Page View

#### Pixel Page View Data

On each page view the Bloomreach pixel collects page specific data including:

- Page URL
- Customer ID
- Product ID
- Product SKU
- Product Name
- Order grand total
- Order item info (sku, qty ordered, name, unit price)
- Event type

#### Pixel Conversion Tracking

In order to track conversions with the Bloomreach pixel, you must also add a tracking script to the **additional scripts** field within your store admin. To do this:

- Navigate to the **Pixel** page and scroll down to the **Additional Scripts** section.
- Copy all this tracking script to your clipboard.

![Additional tracking scripts](https://raw.githubusercontent.com/bloomreach/shopify-discovery-connector-v2/main/docs/images/pixel-scripts.png)

- From your Shopify admin, go to **Settings** > **Checkout**.
- Under **Order processing**, go to the **Additional scripts** text box.
- Paste in the tracking script from your clipboard into the **Additional scripts** text box and click **Save**.

#### Pixel Events

In addition to page views and conversions, the Bloomreach pixel also tracks specific **interactions** the user makes on your site. The interactions tracked are:

- Add-to-cart Event
- Search Event
- Suggest Event
- Quick View Event

**Search & Suggest** events are captured automatically by Bloomreach. However, if you wish to capture **Add-to-cart & Quick View** events, you will need to make changes to the **Add-to-cart & Quick View** buttons throughout your themes.

For example, if you are using Shopify’s Dawn theme, you can track Add-to-cart events on your product page by editing the `Snippets/buy-buttons.liquid` file and adding the following html data attributes to the **ProductSubmitButton** button:

```html Track Add-to-cart events
data-blm-add-to-cart
data-blm-add-to-cart-sku="{{ product.selected_variant.sku }}"
data-blm-add-to-cart-prod-id="{{ product.id }}"
data-blm-add-to-cart-prod-name="{{ product.name }}"
```
```html Example code without Add-to-cart tracking
<button
  id="ProductSubmitButton-{{ section_id }}"
  type="submit"
  name="add"
  class="product-form__submit button button--full-width {% if show_dynamic_checkout %}button--secondary{% else %}button--primary{% endif %}"
  {% if product.selected_or_first_available_variant.available == false or quantity_rule_soldout %}
    disabled
  {% endif %}
>
  <span>
    {%- if product.selected_or_first_available_variant.available == false or quantity_rule_soldout -%}
      {{ 'products.product.sold_out' | t }}
    {%- else -%}
      {{ 'products.product.add_to_cart' | t }}
    {%- endif -%}
  </span>
  {%- render 'loading-spinner' -%}
</button>
```
```html Example code with Add-to-cart attributes
<button
  id="ProductSubmitButton-{{ section_id }}"
  type="submit"
  name="add"
  class="product-form__submit button button--full-width {% if show_dynamic_checkout %}button--secondary{% else %}button--primary{% endif %}"
  {% if product.selected_or_first_available_variant.available == false or quantity_rule_soldout %}
    disabled
  {% endif %}
  data-blm-add-to-cart**
  data-blm-add-to-cart-sku="{{ product.selected_variant.sku }}"
  data-blm-add-to-cart-prod-id="{{ product.id }}"
  data-blm-add-to-cart-prod-name="{{ product.title }}">
>
  <span>
    {%- if product.selected_or_first_available_variant.available == false or quantity_rule_soldout -%}
      {{ 'products.product.sold_out' | t }}
    {%- else -%}
      {{ 'products.product.add_to_cart' | t }}
    {%- endif -%}
  </span>
  {%- render 'loading-spinner' -%}
</button>
```

If your theme also supports **Quick View**, you can repeat the Add-to-cart process and add the following html data attributes to the **Quick View** button:

```html Track Quick View events
data-blm-quickview
data-blm-quickview-sku="{{ product.selected_variant.sku }}"
data-blm-quickview-prod-id="{{ product.id }}"
data-blm-quickview-prod-name="{{ product.name }}"
```
```html Example code without Quick View tracking
<button name="quickview">
  <span>
    {{ 'products.product.quickview' | t }}
  </span>
</button>
```
```html Example code with Quick View attributes
<button name="quickview"
  data-blm-quickview
  data-blm-quickview-sku="{{ product.sku }}"
  data-blm-quickview-prod-id="{{ product.id }}"
  data-blm-quickview-prod-name="{{ product.name }}"
>
  <span>
    {{ 'products.product.quickview' | t }}
  </span>
</button>
```

#### Pixel Validator

To validate and inspect the data captured by Bloomreach pixel events, you can:

- Install the [Bloomreach Pixel Validator](https://chrome.google.com/webstore/detail/bloomreach-pixel-validato/bednpgnjlfnlipjmglfhfbmjhecjeghc?hl=en) for Google Chrome. For more details on the Pixel Validator, read the [Pixel Validator documentation](https://documentation.bloomreach.com/discovery/docs/validating-pixels).
- Use the new [Events Management](https://documentation.bloomreach.com/discovery/docs/events-management) view to [test Pixel Tracking with Debug Events](https://documentation.bloomreach.com/discovery/docs/track-debug-events-in-integration-mode).

### Product feed delivery

Please refer to the [Data Delivery](https://documentation.bloomreach.com/discovery/docs/milestone-3-data-delivery) milestone of the Discovery Technical Integration for guidance on delivering your feed via our [Catalog Management APIs](https://documentation.bloomreach.com/discovery/reference/api-based-catalog-data-management#product-catalog).

Our suggested approach is to use our [Shopify Reference Architecture](https://github.com/bloomreach/shopify-to-discovery-catalog-export), which includes a set of reference codes that you can download, customize, and host.

This uses the most reliable and fast mechanism to pull the product feeds out of Shopify's Bulk Operations endpoint.

## Migration from v1.x

### Changes from v1.x

The v1.x versions of the Bloomreach Discovery Shopify App was using Shopify’s deprecated legacy [Asset API](https://shopify.dev/docs/apps/build/online-store/asset-legacy) to edit themes. However, When Apps are injected directly into themes using the assets API, merchant themes can no longer get updates with the latest features. In addition, they do not have an easy way to uninstall the snippets of code that apps have left behind, even after uninstalling, leading to slower storefront performance. Starting from 2023, Shopify asked all who are using Asset API to make changes to theme files, to transition to [Theme App Extensions](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions) to ensure a better and safer merchant experience. As a response to this requirement, Bloomreach rewrote the app to use the new Theme App Extensions for adding Bloomreach components to your themes. This resulted in the following changes:

- v2 only supports [Online Store 2.0](https://help.shopify.com/en/manual/online-store/themes/managing-themes/upgrading-themes) themes. If you are using a vintage theme and don’t wish to upgrade, you can still use the v1.x version of the app.
- Most of the component settings (such as CSS selector, number of items, etc.) have been moved from the app’s UI to the theme editor. You can use [App embeds](https://help.shopify.com/en/manual/online-store/themes/theme-structure/extend/apps#app-embeds) (for non-widget components) and [App blocks](https://help.shopify.com/en/manual/online-store/themes/theme-structure/extend/apps#app-blocks) (for recommendations widgets) to manage them in themes. For more information, please refer to Shopify’s official documentation. Some complex settings such as template management however, are still retained in the app’s UI. This is to ensure the best user experience.
- Because of the drastic changes in the app’s architecture and data storage, it’s not possible to update your v1.x app automatically to the latest version. Therefore we released v2 as a separate app to be installed. And you can follow the migration guide below for transitioning from v1.x.

### Migration steps

Please follow the steps below to migrate your data from v1.x to v2:

> 📘 Note
>
> As a safety measure, always backup your themes before making any changes. You can do that by [duplicating](https://help.shopify.com/en/manual/online-store/themes/managing-themes/duplicating-themes) or [downloading](https://help.shopify.com/en/manual/online-store/themes/managing-themes/downloading-themes) the theme. It’s also a best practice to test your changes in a test store before applying it in production.

1. [Make a duplication](https://help.shopify.com/en/manual/online-store/themes/managing-themes/duplicating-themes) of the theme(s) that you have edited with the v1.x app. They will later be used as a reference to reapply the changes.
2. Install v2 version of the app following the [installation instructions](@docs:shopify-app-user-guide#installation).
3. Fill in your [Bloomreach account details](@docs:shopify-app-user-guide#linking-the-application-to-your-bloomreach-account) in the new app (you can also copy them from v1.x).
4. If you have customized any templates, copy them to the corresponding places in the v2 app. You can follow the instructions for each component in [Configuring the app](@docs:shopify-app-user-guide#configuring-the-app).
5. [Uninstall](@docs:shopify-app-v1-user-guide#uninstalling-bloomreach) the v1.x app. Make sure you have completely removed [all files](https://documentation.bloomreach.com/discovery/docs/shopify-app-user-guide#bloomreach-files) from the original themes. If you have any [customization](@docs:shopify-app-v1-user-guide#customizing-bloomreach), make sure to revert them too. However, leave the duplicated themes from step 1 untouched.
6. Use the duplicated themes from step 1 as reference, reapply the components and widgets to the original themes. You can follow the instructions in [Configuring the app](@docs:shopify-app-user-guide#configuring-the-app) for each component/widget. Unlike the v2 app, the v1.x app only manages settings. So even if it was uninstalled, the components and widgets were left behind in the themes unless you chose to remove them.
7. Fully test the themes with reapplied components and widgets. If everything seems good, you can delete the duplicated themes.

## FAQs

#### How to disable the default Shopify autosuggest dropdown

After enabling the app, users can occasionally see both the default Shopify autosuggest & the Bloomreach Autosuggest on their frontend. Each Shopify theme handles the Shopify autosuggest slightly differently. To avoid this, we recommend hiding the predictive search overlay.

For example, if you are using Shopify’s Dawn theme, you can hide the **default Autosuggest overlay** by adding the following **Custom CSS**:

```css Hide default Autosuggest overlay
predictive-search .predictive-search { display: none !important; }
```

#### Brief display of default Search & Collections pages

Because of the way Bloomreach loads & displays results on your theme, you may occasionally see the default **Search** & **Collection** pages appear for a moment before Bloomreach displays its results. To avoid this, we recommend **hiding the CSS selector** until Bloomreach displays the results. You can achieve this by adding some **Custom CSS** to the feature settings.

For example, if you are using Shopify’s Dawn theme, you can hide the **Search CSS selector** by adding the following **Custom CSS**:

```css Hide Search CSS selector
#MainContent { visibility: hidden; }
#MainContent.blm-has-loaded { visibility: visible; }
```

This CSS will hide the container initially and show it when Bloomreach has loaded and displayed the results.

#### Why am I seeing an empty widget with no products?
Widgets fetch product data (from your Bloomreach catalog(s)) via client side JavaScript. Because this process happens client side (in your browser) if there are breaking errors in your JavaScript code (unrelated to the connector) you could see an empty result set within some of your widgets.

If you have any concerns related to the functionality of the connector, try to make sure that you don't have any console errors in the browser before raising an issue with our support team.

## Change Log / Release Notes

2.1.0

- Added support for [Bloomreach Discovery Facet Response V3](https://documentation.bloomreach.com/discovery/reference/facet-response-v3-unified-ranking).
- Remove the useless `sort` parameter from autosuggest to avoid potential API issues.
- Fix Pathways & Recommendations widgets not picking up the `fields` config.

2.0.0

- Completely rewriting of the app using the new Theme App Extensions.
- Removed usages of the Assets API. This is a breaking change.

1.0.10

- Pass Dynamic IDs to Recommendations Widgets
- Remove character limits on input boxes
- Add HTML, CSS, & Fields customization to Recommendation Widgets
- Add version 2.1.0 of the SDK (Add user driven customization support for Recommendation widgets)

1.0.9

- SDK version 2.0.6 (Remove scroll to top when performing search & category page loads, fix incorrect scrolling behavior when filtering)

1.0.8

- Node version update, Shopify authentication update.
- SDK version 2.0 (separate API client & UI Template code. Fixed infinite scroll behavior, swatch loading function)

1.0.7

- Performance updates when saving new values in the Shopify app

1.0.6

- SDK version 1.3.2 (enable brSegmentation value to pick up data from Bloomreach Engagement for personalized searches)
- Show SDK version & App version in the UI
- Enable Staging / Production endpoint selectors.

1.0.5

- Add HTML & CSS Customization capability for Search & Categories

1.0.4

- Add HTML & CSS Customization capability for Autosuggest

1.0.3

- Fix pixel inconsistencies for Recommendations widget.

1.0.2

- New App upgrade process to upgrade between new versions.

1.0.1

- Initial version - includes ability to inject sample UI into Shopify app front end for Search, Category, Recommendations, & Autosuggest calls into a Liquid powered Shopify theme.
