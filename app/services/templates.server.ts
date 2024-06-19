import { getStore, removeSensitiveKeys, updateStore } from "./store.server";
import { getMetafields, upsertAppDataMetafield } from "./admin.server";
import autosuggestTemplate from "~/templates/autosuggestTemplate";
import categoryListTemplate from "~/templates/categoryListTemplate";
import categoryTemplate from "~/templates/categoryTemplate";
import searchListTemplate from "~/templates/searchListTemplate";
import searchTemplate from "~/templates/searchTemplate";
import recommendationTemplate from "~/templates/recommendationTemplate";
import packageJson from "../../package.json";

import type { AdminApiContext } from "@shopify/shopify-app-remix/server";

const { sdkVersion } = packageJson;
const templatesMap = {
  autosuggest: autosuggestTemplate,
  search: searchTemplate,
  search_product_list: searchListTemplate,
  category: categoryTemplate,
  category_product_list: categoryListTemplate,
  recommendations: recommendationTemplate,
};
const namespace = "templates";

type TemplatesMap = typeof templatesMap;

const setDefaultTemplates = async (admin: AdminApiContext, shopUrl: string) => {
  console.log("log: setDefaultTemplates");
  console.log("log: setDefaultTemplates: shopUrl:", shopUrl);

  const store = await getStore(shopUrl);
  if (!store) {
    console.log("log: setDefaultTemplates: store %s not found", shopUrl);
    return;
  }

  const { default_templates_added } = store;
  if (default_templates_added) {
    console.log("log: setDefaultTemplates: templates exist so return");
    return;
  }
  console.log("log: setDefaultTemplates: adding templates");

  const input = Object.keys(templatesMap).map((key) => ({
    namespace,
    key,
    type: "multi_line_text_field",
    value: encodeURIComponent(templatesMap[key as keyof TemplatesMap]),
  }));

  const metafields = await upsertAppDataMetafield(admin, input);
  await setTemplateVersions(shopUrl);
  console.log("log: setDefaultTemplates: setting `default_templates_added` flag");
  await updateStore(shopUrl, { default_templates_added: true });
  return metafields;
};

const setTemplateVersions = async (shopUrl: string) => {
  console.log("log: setTemplateVersions");
  console.log("log: setTemplateVersions: new version:", sdkVersion);
  const data = {
    autosuggest_template_version: sdkVersion,
    search_template_version: sdkVersion,
    search_product_list_template_version: sdkVersion,
    category_template_version: sdkVersion,
    category_product_list_template_version: sdkVersion,
    recommendations_template_version: sdkVersion,
  };
  const updatedStore = await updateStore(shopUrl, data);
  return removeSensitiveKeys(updatedStore);
};

const runTemplateUpdate = async (shopUrl: string, admin: AdminApiContext, template: keyof TemplatesMap) => {
  console.log("log: runTemplateUpdate: shopUrl: %s, template: %s, version: %s", shopUrl, template, sdkVersion);
  const metafields = await upsertAppDataMetafield(admin, [{
    namespace,
    key: template,
    type: "multi_line_text_field",
    value: encodeURIComponent(templatesMap[template]),
  }]);

  console.log("log: runTemplateUpdate: updating template version for: ", template);
  await updateStore(shopUrl, { [`${template}_template_version`]: sdkVersion });
  return metafields;
};

const getTemplate = async (admin: AdminApiContext, template: keyof TemplatesMap) => {
  console.log("log: getTemplate: template: ", template);
  const metafields = await getMetafields(admin, namespace);
  const templateValue = metafields?.find(({ key }) => key === template)?.value;
  console.log("log: getTemplate: templateValue: ", templateValue);
  return templateValue;
};

const updateTemplate = async (admin: AdminApiContext, template: keyof TemplatesMap, templateValue: string) => {
  console.log("log: updateTemplate: template: %s, templareValue: %s", template, templateValue);
  const metafields = await upsertAppDataMetafield(admin, [{
    namespace,
    key: template,
    type: "multi_line_text_field",
    value: encodeURIComponent(templateValue),
  }]);
  console.log("log: updateTemplate: response: ", metafields);
  return metafields;
};

export { setDefaultTemplates, setTemplateVersions, runTemplateUpdate, getTemplate, updateTemplate };
