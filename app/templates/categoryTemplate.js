const CategoryTemplate = `<% if (did_you_mean.length) { %>
  <div class="blm-product-search-header">
    <div class="blm-product-search-header-container">
      <h1 class="blm-product-search-header-container__title">Results for
        <% if (locals.keywordRedirect && keywordRedirect.redirected_url) { %>
          <i><%- keywordRedirect.redirected_url %></i>
        <% } else { %>
          <i><%- did_you_mean[0] %></i>
        <% } %>
         instead of <i class="blm-product-search-header-container__title__searched-word"><%- locals[config.default_search_parameter] %></i></h1>
      <div class="blm-did-you-mean-suggestion">
        <label class="blm-did-you-mean-suggestion__label">Did you mean:</label>
        <% did_you_mean.forEach(function(word) { %>
        <a href="<%= config.search_page_url %>?<%= config.default_search_parameter %>=<%= word %>" class="blm-did-you-mean-suggestion__link"><%- word %></a>
        <% }); %>
      </div>
      <% if (locals.keywordRedirect && keywordRedirect.redirected_query) { %>
      <div class="blm-redirected-keyword">Redirected from <i>"<%- keywordRedirect.redirected_query %>"</i>.</div>
      <% } %>
    </div>
  </div>
<% } %>
<% if (locals.keywordRedirect && keywordRedirect.redirected_query && did_you_mean.length === 0) { %>
  <div class="blm-product-search-header">
    <div class="blm-product-search-header-container">
      <h1 class="blm-product-search-header-container__title">Results for <i><%- keywordRedirect.redirected_query %></i> </h1>
      <div class="blm-redirected-keyword">Redirected from <i>"<%- keywordRedirect.original_query %>"</i> </div>
    </div>
  </div>
<% } %>
<div class="blm-<% if (config.search.is_category_page) { %>category<% } else { %>product-search<% } %> blm-results <% if (config.search.facets_included) { %>with-facets<% } %>">
    <% if (config.search.facets_included && facets.length) { %>
    <aside class="blm-product-search-sidebar">

      <button class="blm-product-search-control-button blm-product-search-control-button--sidebar">
        Filter
        <svg viewBox="0 0 14.8 14.8" class="blm-product-search-control-button__icon" focusable="false"><path d="M1.6 14.8V0m6 14.8V1.6m5.6 13.2V0" fill="none" stroke="#000" stroke-miterlimit="10"></path><circle cx="1.6" cy="7.4" r="1.6"></circle><circle cx="13.2" cy="10.4" r="1.6"></circle><circle cx="7.6" cy="1.6" r="1.6"></circle></svg>
      </button>

      <% if (locals.selectedFilterItems && selectedFilterItems.length > 0) { %>
        <div class="blm-product-search-selected-filters">
          <h4 class="blm-product-search-selected-filters__title">Filters</h4>

          <% selectedFilterItems.forEach(function(filterIitem) { %>
            <span class="blm-product-search-selected-filter" data-filter-checkbox-id="<%- filterIitem.checkbox_id %>"><%- filterIitem.label %>
              <span class="blm-product-search-selected-filter__clear">&times;</span>
            </span>
          <% }) %>

          <button class="blm-product-search-selected-filters__clear-all">Clear all</button>
        </div>
      <% } %>

      <div class="blm-product-search-sidebar-content <% if (locals.isFiltersPanelOpened && isFiltersPanelOpened) { %>blm-open<% } %>">

        <button class="blm-product-search-control-button blm-product-search-control-button--sidebar blm-product-search-control-button--active">
          Done
          <svg viewBox="0 0 14.8 14.8" class="blm-product-search-control-button__icon" focusable="false"><path class="blm-product-search-control-button__icon-path" d="M1.6 14.8V0m6 14.8V1.6m5.6 13.2V0" fill="none" stroke="#000" stroke-miterlimit="10"></path><circle cx="1.6" cy="7.4" r="1.6"></circle><circle cx="13.2" cy="10.4" r="1.6"></circle><circle cx="7.6" cy="1.6" r="1.6"></circle></svg>
        </button>

        <div id="blm-product-search-search-filters">
          <input id="blm-product-search-search-filters__input" placeholder="Type to search filters" />
        </div>

        <div class="blm-product-search-filter">
          <h4 class="blm-product-search-filter-title">Price</h4>
          <div class="blm-price-range-container">
            <div class="blm-range-slider">
              <input
                value="<%= checkedFacets.price ? checkedFacets.price[0] : priceRangeFacet.start %>"
                min="<%- priceRangeFacet.start %>"
                max="<%- priceRangeFacet.end %>"
                step="1"
                type="range"
                class="blm-price-range-input blm-price-range-input--lower blm-price-range-input--lower-%%-REQUEST_ID-%%"
              >
              <span class="blm-price-range-slider-rail"></span>
              <input
                value="<%= checkedFacets.price ? checkedFacets.price[1] : priceRangeFacet.end %>"
                min="<%- priceRangeFacet.start %>"
                max="<%- priceRangeFacet.end %>"
                step="1"
                type="range"
                class="blm-price-range-input blm-price-range-input--upper blm-price-range-input--upper-%%-REQUEST_ID-%%"
              >
            </div>
            <div class="blm-range-slider__values">
              <span class="blm-range-slider__values--min">
                <%= checkedFacets.price ? config.format_money(checkedFacets.price[0] * 100) : config.format_money(priceRangeFacet.start * 100) %>
              </span>
              <span class="blm-range-slider__values--max">
                <%= checkedFacets.price ? config.format_money(checkedFacets.price[1] * 100) : config.format_money(priceRangeFacet.end * 100) %>
              </span>
            </div>
          <% if (checkedFacets.price) { %>
            <div class="blm-range-slider__clear-values">
              <button class="blm-range-slider__clear-values-button blm-range-slider__clear-values-button--%%-REQUEST_ID-%%">Clear</button>
            </div>
          <% } %>
          </div>
        </div>

        <% facets.forEach(function(facet, facetIndex) { %>
          <% if (facet.section.length > 0) { %>
          <div class="blm-product-search-filter blm-dynamic-filter" id="blm-facet-block-item-<%= facetIndex %>">
            <h4 class="blm-product-search-filter-title"><%- facet.title %></h4>
            <ul class="blm-product-search-filter-items">
              <% facet.section.forEach(function(item) { %>
              <li class="blm-product-search-filter-item">
                <input
                  type="checkbox"
                  <% if (facet.original_title in checkedFacets && checkedFacets[facet.original_title].includes(escapeSpecialCharacters(item.id))) { %>checked<% } %>
                  name="<%= facet.original_title %>"
                  value="<%= escapeSpecialCharacters(item.id) %>"
                  id="<%- facet.original_title + '[' + escapeSpecialCharacters(item.name) + ']' %>"
                  class="blm-product-search-filter-item__checkbox"
                />
                <label class="blm-product-search-filter-item__name" for="<%- facet.original_title + '[' + escapeSpecialCharacters(item.name) + ']' %>"><%- item.name %></label>
                <% if (!config.search.display_variants) { %>
                <span class="blm-product-search-filter-item__badge"><%- item.count %></span>
                <% } %>
              </li>
              <% }); %>
            </ul>
            <% if (facet.section.length > config.search.initial_number_of_facet_values) { %>
            <div class="blm-product-search-load-more" data-item="<%= facetIndex %>">+ More</div>
            <% } %>
          </div>
          <% } %>
        <% }); %>

        <% if (facets[0].section.length) { %>
        <div class="blm-load-more-facet blm-load-more-facet--%%-REQUEST_ID-%%">+ More </div>
        <% } %>

      </div>
    </aside>
    <% } %>
    <section class="blm-product-search-main">
      <div class="blm-product-search-toolbar">
        <%
          const haveUngroupedResults = locals.number_of_results && number_of_results > 0;
          const haveGroupedResults = locals.grouped_products && grouped_products.groups.length > 0;
        %>
        <% if (haveUngroupedResults || haveGroupedResults) { %>
          <% if (haveUngroupedResults) { %>
          <h2 class="blm-product-search-toolbar__title">
            Showing <%- start + 1 %> - <%- Math.min(start + products.length, number_of_results) %> of <%- number_of_results %> products
          </h2>
          <% } %>
        <div class="blm-product-search-toolbar-options">
          <% if (config.search.groupby) { %>
          <span class="blm-product-search-toolbar-options blm-product-search-toolbar-options--groupby">
            <label for="groupby-%%-REQUEST_ID-%%" class="blm-product-search-toolbar-options__label">Group By: </label>
            <select
              name="groupby"
              id="groupby-%%-REQUEST_ID-%%"
              class="blm-product-search-toolbar-options__select"
            >
              <% config.search.groupby_options.forEach(function(option) { %>
                <option value="<%- option.value %>" <% if (locals.groupby && groupby === option.value) { %>selected<% } %>><%- option.label %></option>
              <% }) %>
            </select>
          </span>
          <% } %>
          <% if (!config.search.infinite_scroll && paginationData.length > 0) { %>
          <span class="blm-product-search-toolbar-options blm-product-search-toolbar-options--page-size">
            <label for="sort-size-%%-REQUEST_ID-%%" class="blm-product-search-toolbar-options__label">Size: </label>
            <select
              name="sort-size"
              id="sort-size-%%-REQUEST_ID-%%"
              class="blm-product-search-toolbar-options__select"
            >
              <% for (let i = (config.search.groupby ? 4 : 16); i <= (config.search.groupby ? 16 : 48); i += 4) { %>
                <option value="<%- i %>" <% if (locals.size && size === i) { %>selected<% } %>><%- i %></option>
              <% } %>
            </select>
          </span>
          <% } %>
          <span class="blm-product-search-toolbar-options blm-product-search-toolbar-options--sort-by">
            <label for="sort-by-%%-REQUEST_ID-%%" class="blm-product-search-toolbar-options__label">Sort By: </label>
            <select
              name="sort-by"
              id="sort-by-%%-REQUEST_ID-%%"
              class="blm-product-search-toolbar-options__select"
            >
              <% config.search.sorting_options.forEach(function(option) { %>
                <option value="<%- option.value %>" <% if (locals.sort && sort === option.value) { %>selected<% } %>><%- option.label %></option>
              <% }) %>
            </select>
          </span>
        </div>
        <% } else if (!(locals.grouped_products) || grouped_products.groups.length < 1) { %>
        <h2 class="blm-product-search-toolbar__title">
          No results found
        </h2>
        <% } %>

      </div>
      <div <% if (products.length && !locals.grouped_products) { %>class="blm-product-search__results"<% } %>>
        <% if (products.length || (locals.grouped_products && grouped_products.groups.length > 0)) { %>
          %%-PRODUCT_LIST_TEMPLATE-%%
        <% } %>
      </div>

      <% if (!config.search.infinite_scroll && paginationData.length > 0) { %>
      <div class="blm-product-search-pagination">
        <ul class="blm-product-search-pagination__pages blm-product-search-pagination__pages--%%-REQUEST_ID-%%">
          <% paginationData.forEach(paginationNode => { %>
            <li class="blm-product-search-pagination__page">
              <button <% if (paginationNode.disabled) { %>disabled<% } %> class="blm-product-search-pagination__page-link <% if (paginationNode.active) { %>blm-product-search-pagination__page-link--active<% } %>" data-value="<%- paginationNode.value %>"
                ><%- paginationNode.label ?? paginationNode.value %></button
              >
            </li>
          <% }) %>
        </ul>
      </div>
      <% } %>
    </section>
  </div>`;

export default CategoryTemplate;
