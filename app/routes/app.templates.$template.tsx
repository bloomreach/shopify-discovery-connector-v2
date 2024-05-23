import { json, type LoaderFunctionArgs } from "@remix-run/node";
import autosuggestTemplate from "~/templates/autosuggestTemplate";
import categoryListTemplate from "~/templates/categoryListTemplate";
import categoryTemplate from "~/templates/categoryTemplate";
import searchListTemplate from "~/templates/searchListTemplate";
import searchTemplate from "~/templates/searchTemplate";
import recommendationTemplate from "~/templates/recommendationTemplate";

const templatesFileMap: Record<string, string> = {
  autosuggest: "autosuggest.ejs",
  search: "search-layout.ejs",
  search_product_list: "search-list.ejs",
  category: "search-layout.ejs",
  category_product_list: "search-list.ejs",
  recommendations: "recommendations.ejs",
};

const templatesMap: Record<string, string> = {
  autosuggest: autosuggestTemplate,
  search: searchTemplate,
  search_product_list: searchListTemplate,
  category: categoryTemplate,
  category_product_list: categoryListTemplate,
  recommendations: recommendationTemplate,
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const template = params.template;
  if (!(template && template in templatesMap)) {
    const response: ActionResponse = {
      status: "fail",
      error: `Template ${template} not found`
    };
    return json(response, { status: 404 });
  }

  return new Response(templatesMap[template], {
    status: 200,
    headers: {
      "Content-Type": "application/javascript",
      "Content-Disposition": `attachment; filename="${templatesFileMap[template]}"`,
    },
  });
};
