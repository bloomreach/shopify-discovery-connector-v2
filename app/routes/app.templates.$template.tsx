import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { AutosuggestTemplate, CategoryListTemplate, CategoryTemplate, RecommendationTemplate, SearchListTemplate, SearchTemplate } from "~/templates";

const templatesFileMap: Record<string, string> = {
  autosuggest: "autosuggest.ejs",
  search: "search-layout.ejs",
  search_product_list: "search-list.ejs",
  category: "search-layout.ejs",
  category_product_list: "search-list.ejs",
  recommendations: "recommendations.ejs",
};

const templatesMap: Record<string, string> = {
  autosuggest: AutosuggestTemplate,
  search: SearchTemplate,
  search_product_list: SearchListTemplate,
  category: CategoryTemplate,
  category_product_list: CategoryListTemplate,
  recommendations: RecommendationTemplate,
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
