const CategoryListTemplate = `<% function printProduct(product) { %>
  <div class="blm-product-search__result" <% if (product.variant_name) { %>title="<%- product.variant_name %>"<% } %>>
    <%
      const matchingVariant = !Array.isArray(product.variants)
        ? null
        : 'variant_index' in product
          ? product.variants[product.variant_index]
          : product.variants.find(variant => selectedColors.includes(variant.sku_color_group ? variant.sku_color_group.toLowerCase() : null))
    %>
    <div class="blm-product-search-image-container">
      <% if (product.variants && product.variants.length > 1) { %>
        <% product.variants.forEach(function(variant, index) { %>

        <%
          const isActiveVariant =
            !('variant_index' in product) && !selectedColors.length
              ? index === 0
              : 'variant_index' in product
                ? product.variant_index === index
                : matchingVariant == variant
        %>

        <div class="blm-product-search-swatch-image fade"
          <% if (isActiveVariant) { %>style="display: block"<% } %>
        >
          <img
            class="blm-product-search-image-container__image"
            alt="title"
            src="<%= variant.image %>"
          />
        </div>
        <% }); %>
      <% } else { %>
        <div class="blm-product-search-swatch-image fade" style="display: block"
        >
          <img
            class="blm-product-search-image-container__image"
            alt="title"
            src="<%= product.image %>"
          />
        </div>
      <% } %>
    </div>
    <div class="blm-product-search-details-container">
      <div class="blm-product-search-details-title-container">
        <a href="<%= product.link %>" class="blm-product-search-details-container__title"
          ><%- product.title %></a
        >
      </div>

      <% if (product.variants && product.variants.length > 1) { %>
        <% product.variants.forEach(function(variant, index) { %>
          <%
            const isActiveVariant =
              !('variant_index' in product) && !selectedColors.length
                ? index === 0
                : 'variant_index' in product
                  ? product.variant_index === index
                  : matchingVariant == variant
          %>
          <p class="blm-product-search-details-container__price <% if (isActiveVariant) { %>active<% } %>">
            <%
              const salePrice = variant.sku_sale_price !== undefined ? variant.sku_sale_price : product.sale_price;
              const price = variant.sku_price !== undefined ? variant.sku_price : product.price;
            %>
            <%= config.format_money((salePrice !== undefined ? salePrice : price).toFixed(2) * 100) %>
            <% if (salePrice !== undefined) { %>
              <span <% if (salePrice !== undefined) { %>class="blm-product-search-details-container__price--strike-through"<% } %>>
                <%= config.format_money(price.toFixed(2) * 100) %>
              </span>
            <% } %>
          </p>
        <% }); %>
      <% } else { %>
        <p class="blm-product-search-details-container__price active">
          <%= config.format_money((product.sale_price !== undefined ? product.sale_price : product.price).toFixed(2) * 100) %>
          <% if (product.sale_price !== undefined) { %>
            <span <% if (product.sale_price !== undefined) { %>class="blm-product-search-details-container__price--strike-through"<% } %>>
              <%= config.format_money(product.price.toFixed(2) * 100) %>
            </span>
          <% } %>
        </p>
      <% } %>

    </div>

    <% if (product.variants && product.variants.length > 1) { %>
      <ul class="blm-product-search-swatch-container">
      <% product.variants.slice(0, defaultMaxColorSwatches || 0).forEach(function(variant, index) { %>
        <%
          const isActiveVariant =
            !('variant_index' in product) && !selectedColors.length
              ? index === 0
              : 'variant_index' in product
                ? product.variant_index === index
                : matchingVariant == variant
        %>
        <li
          class="blm-product-search-swatch-container__swatch <% if (isActiveVariant) { %>active<% } %>"
          style="background-image: url('<%= variant.image %>')"
        ></li>
      <% }); %>
      </ul>

      <% if (product.variants.length > defaultMaxColorSwatches || 0) { %>
      <small class="blm-product-search-swatch-colors">(Colors) <%- product.variants.length %></small>
      <% } %>
    <% } %>
  </div>
<% } %>

<% if (locals.grouped_products && grouped_products && grouped_products.groups) { %>

  <% grouped_products.groups.forEach(group => { %>
  <div class="blm-result-group">
    <h3 class="blm-result-group__title"><%- group.title %></h3>

    <div class="blm-product-search__results">
      <% group.products.forEach(printProduct); %>
    </div>
  </div>
  <% }); %>

<% } else { %>

  <% products.forEach(printProduct); %>

<% } %>`;

const CategoryListTemplateVersion = "3";

export { CategoryListTemplate, CategoryListTemplateVersion };
