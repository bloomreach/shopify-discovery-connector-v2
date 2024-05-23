const WidgetTemplate = `<div class="blm-recommendation-widget-content" data-rid="<%= widgetMetadata.rid %>" data-type="<%= widgetMetadata.type %>" data-id="<%= widgetMetadata.id %>">
  <% if (products.length > config.get('numberOfItemsToShow')) { %>
  <span class="blm-carousel__item blm-carousel-previous blm-invisible">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24">
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="M15.61 7.41L14.2 6l-6 6 6 6 1.41-1.41L11.03 12l4.58-4.59z" />
    </svg>
  </span>
  <% } %>
  <section class="blm-recommendation__products" style="--number-of-items-to-show: <%= config.get('numberOfItemsToShow') %>">
    <% products.forEach(function(product) { %>
    <div class="blm-recommendation__product" data-id="<%= product.id %>">
      <div class="blm-recommendation__product-inner">
        <div class="blm-product-image-container">
          <a href="<%= product.link %>" class="blm-widget-link">
            <img
              class="blm-product-image-container__image"
              alt="<%= product.title %>"
              src="<%= product.image %>"
            />
          </a>
        </div>
        <div class="blm-product-details-container">
          <div class="blm-product-details-title-container">
            <a href="<%= product.link %>" class="blm-product-details-container__title blm-widget-link"><%= product.title %></a>
          </div>
          <% if (product.price && product.final_price) { %>
            <p class="blm-product-details-container__price">
              <% if (config.get('formatMoney')) { %>
                <%= config.get('formatMoney')(product.final_price.toFixed(2) * 100) %>&nbsp;<strike class="blm-product-details-container__original-price"><%= config.get('formatMoney')(product.price.toFixed(2) * 100) %></strike>
              <% } else { %>
                <%= defaultCurrency %><%= product.final_price.toFixed(2) %>&nbsp;<strike class="blm-product-details-container__original-price"><%= defaultCurrency %><%= product.price.toFixed(2) %></strike>
              <% } %>
            </p>
          <% } else { %>
            <p class="blm-product-details-container__price">
              <% if (config.get('formatMoney')) { %>
                <%= config.get('formatMoney')(product.price.toFixed(2) * 100) %>
              <% } else { %>
                <%= defaultCurrency %><%= product.price.toFixed(2) %>
              <% } %>
            </p>
          <% } %>
        </div>
      </div>
    </div>
    <% }); %>
  </section>
  <% if (products.length > config.get('numberOfItemsToShow')) { %>
  <span class="blm-carousel__item blm-carousel-next">
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24">
    <path fill="none" d="M0 0h24v24H0V0z" />
    <path d="M10.02 6L8.61 7.41 13.19 12l-4.58 4.59L10.02 18l6-6-6-6z" />
    </svg>
  </span>
  <% } %>
</div>`;

export default WidgetTemplate;
