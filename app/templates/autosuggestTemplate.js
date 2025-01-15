const AutosuggestTemplate = `<% if (terms.length || productSuggestions.length) { %>
  <div class="blm-autosuggest">
    <div class="blm-autosuggest__suggestion-terms-container">
      <ul class="blm-autosuggest__suggestion-terms">
        <% terms.forEach(function(term) { %>
          <li class="blm-autosuggest__suggestion-term">
            <a href="<%- term.link %>" class="blm-autosuggest__suggestion-term-link" data-suggestion-text="<%- term.text %>"
              ><%- term.processedText %></a
            >
            <% if (term.categories) { %>
              <ul class="blm-autosuggest__category-results">
                <% term.categories.forEach(function(category) { %>
                <li class="blm-autosuggest__suggestion-term">
                  <a href="#"
                     data-category-id="<%- category.value %>"
                     data-suggestion-text="<%- category.name %>"
                     class="blm-autosuggest__suggestion-term-link blm-autosuggest__suggestion-term-link--category"
                    ><%- category.name %></a
                  >
                </li>
                <% }); %>
              </ul>
            <% } %>
          </li>
        <% }); %>
      </ul>
    </div>

    <div class="blm-autosuggest__results-container">
      <div class="blm-autosuggest__results">
        <% productSuggestions.forEach(function(suggestion) { %>
          <div class="blm-autosuggest__result">
            <div class="blm-autosuggest-result-image">
              <a
                title="<%= suggestion.title %>"
                aria-hidden="true"
                tabindex="-1"
                href="<%= suggestion.link %>"
                class="blm-autosuggest-result-image__link"
                ><img
                  class="blm-autosuggest-result-image__image"
                  src="<%= suggestion.image %>"
              /></a>
            </div>
            <div class="blm-autosuggest-result-details">
              <a class="blm-autosuggest-result-details__title" href="<%= suggestion.link %>"
                ><%= suggestion.title %></a
              >
              <div class="blm-autosuggest-result-details__price blm-autosuggest-result-details__price--final">
                <% if (config.format_money) { %>
                  <%= config.format_money(suggestion.sale_price.toFixed(2) * 100) %>
                <% } else { %>
                  <%= config.default_currency %><%= suggestion.sale_price.toFixed(2) %>
                <% } %>
                <% if (suggestion.price) { %>
                  <span
                  class="blm-autosuggest-result-details__price blm-autosuggest-result-details__price--original"
                  >
                   <% if (config.format_money) { %>
                     <%= config.format_money(suggestion.price.toFixed(2) * 100) %>
                   <% } else { %>
                     <%= config.default_currency %><%= suggestion.price.toFixed(2) %>
                   <% } %>
                  </span
                >
                <% } %>
              </div>
            </div>
          </div>
        <% }); %>
      </div>
    </div>

  </div>
  <% } %>`;

const AutosuggestTemplateVersion = "3";

export { AutosuggestTemplate, AutosuggestTemplateVersion };
