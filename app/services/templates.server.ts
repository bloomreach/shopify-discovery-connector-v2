import { getStore, updateStore } from "./store.server";
import { getAppDataMetafield, getAppOwnerId, getOrCreateMetaDefinitions, upsertAppDataMetafields, upsertMetafields, MetafieldOwnerType, deleteMetafields } from "./admin.server";
import * as templates from "~/templates";
import { NAMESPACE_TEMPLATES, TEMPLATE_AUTOSUGGEST, TEMPLATE_CATEGORY, TEMPLATE_CATEGORY_LIST, TEMPLATE_RECOMMENDATIONS, TEMPLATE_SEARCH, TEMPLATE_SEARCH_LIST } from "~/models/constants";

import type { MetafieldIdentifierInput, MetafieldsSetInput } from "~/types/admin.types";
import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import type { Template, TemplateAction } from "~/types/store";

const templatesMap: Record<string, string> = {
  [TEMPLATE_AUTOSUGGEST]: templates.AutosuggestTemplate,
  [`${TEMPLATE_AUTOSUGGEST}_version`]: templates.AutosuggestTemplateVersion,
  [TEMPLATE_SEARCH]: templates.SearchTemplate,
  [`${TEMPLATE_SEARCH}_version`]: templates.SearchTemplateVersion,
  [TEMPLATE_SEARCH_LIST]: templates.SearchListTemplate,
  [`${TEMPLATE_SEARCH_LIST}_version`]: templates.SearchListTemplateVersion,
  [TEMPLATE_CATEGORY]: templates.CategoryTemplate,
  [`${TEMPLATE_CATEGORY}_version`]: templates.CategoryTemplateVersion,
  [TEMPLATE_CATEGORY_LIST]: templates.CategoryListTemplate,
  [`${TEMPLATE_CATEGORY_LIST}_version`]: templates.CategoryListTemplateVersion,
  [TEMPLATE_RECOMMENDATIONS]: templates.RecommendationTemplate,
  [`${TEMPLATE_RECOMMENDATIONS}_version`]: templates.RecommendationTemplateVersion,
};

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

  const inputs: Omit<MetafieldsSetInput, "ownerId">[] = Object.keys(templatesMap).flatMap((key) => ([
    {
      namespace: NAMESPACE_TEMPLATES,
      key,
      type: "multi_line_text_field",
      value: encodeURIComponent(templatesMap[key]),
    },
    {
      namespace: NAMESPACE_TEMPLATES,
      key: `${key}_version`,
      type: "single_line_text_field",
      value: templatesMap[`${key}_version`],
    }
  ]));

  const metafields = await upsertAppDataMetafields(admin, inputs);

  console.log("log: setDefaultTemplates: setting `default_templates_added` flag");
  await updateStore(shopUrl, { default_templates_added: true });
  return metafields;
};

const runTemplateUpdate = async (admin: AdminApiContext, template: string, marketId?: string) => {
  console.log("log: runTemplateUpdate: template: %s, marketId: %s", template, marketId);
  return await updateTemplate(admin, template, templatesMap[template], templatesMap[`${template}_version`], marketId);
};

const getTemplate = async (admin: AdminApiContext, template: string): Promise<Template> => {
  console.log("log: getTemplate: template: %s", template);

  const templateValue = (await getAppDataMetafield(admin, NAMESPACE_TEMPLATES, template))?.value;
  const templateVersion = (await getAppDataMetafield(admin, NAMESPACE_TEMPLATES, `${template}_version`))?.value;
  console.log("log: getTemplate: templateValue: %s, templateVersion: %s", templateValue, templateVersion);
  return { value: templateValue, version: templateVersion };
};

const createMetafieldsSetInputs = (template: string, templateValue: string, namespace: string, ownerId: string, version?: string): MetafieldsSetInput[] => {
  console.log("log: createMetafieldsSetInputs: template: %s, templareValue: %s, namespace: %s, ownerId: %s, version: %s", template, templateValue, namespace, ownerId, version);

  const metafieldsInputs: MetafieldsSetInput[] = [{
    namespace,
    key: template,
    value: encodeURIComponent(templateValue),
    type: "multi_line_text_field",
    ownerId,
  }];
  if (version) {
    metafieldsInputs.push({
      namespace,
      key: `${template}_version`,
      value: version,
      type: "single_line_text_field",
      ownerId,
    });
  }
  console.log("log: createMetafieldsSetInputs: result: ", metafieldsInputs);
  return metafieldsInputs;
};

const updateTemplate = async (admin: AdminApiContext, template: string, templateValue: string, version?: string, marketId?: string) => {
  console.log("log: updateTemplate: template: %s, templareValue: %s, version: %s, marketId: %s", template, templateValue, version, marketId);
  const namespace = marketId ? `$app:${NAMESPACE_TEMPLATES}` : NAMESPACE_TEMPLATES;
  const ownerId = marketId || await getAppOwnerId(admin);
  if (!ownerId) {
    throw Error("App ID could not be fetched");
  }
  const metafieldsInputs = createMetafieldsSetInputs(template, templateValue, namespace, ownerId, version);

  if (marketId) {
    await getOrCreateMetaDefinitions(admin, namespace, MetafieldOwnerType.Market);
  }
  const metafields = await upsertMetafields(admin, metafieldsInputs);
  console.log("log: updateTemplate: response: ", metafields);
  return metafields;
};

const deleteTemplate = async (admin: AdminApiContext, template: string, marketId: string) => {
  console.log("log: deleteTemplate: template: %s, marketId: %s", template, marketId);
  const namespace = `$app:${NAMESPACE_TEMPLATES}`;
  const inputs = [
    {
      ownerId: marketId,
      namespace,
      key: template,
    },
    {
      ownerId: marketId,
      namespace,
      key: `${template}_version`,
    }
  ];

  const metafields = await deleteMetafields(admin, inputs);
  console.log("log: deleteTemplate: response: ", metafields);
  return metafields;
};

const updateAllMarketTemplates = async (admin: AdminApiContext, template: string, actions: TemplateAction[]) => {
  console.log("log: updateAllMarketTemplates: template: %s, actions: %s", template, actions);
  const appOwnerId =await getAppOwnerId(admin);
  if (!appOwnerId) {
    throw Error("App ID could not be fetched");
  }

  const saveInputs: MetafieldsSetInput[] = [];
  const deleteInputs: MetafieldIdentifierInput[] = [];
  actions.forEach((action) => {
    const namespace = action.marketId ? `$app:${NAMESPACE_TEMPLATES}` : NAMESPACE_TEMPLATES;
    const ownerId = action.marketId ?? appOwnerId;

    if (action._action === 'saveTemplate') {
      saveInputs.push(...createMetafieldsSetInputs(template, action.templateValue, namespace, ownerId, action.templateVersion));
    } else if (action._action === 'deleteTemplate') {
      deleteInputs.push(
        {
          ownerId,
          namespace,
          key: template,
        },
        {
          ownerId,
          namespace,
          key: `${template}_version`,
        }
      );
    } else {
      console.log("warn: updateAllMarketTemplates: Invalid action: ", action._action);
    }
  });

  await getOrCreateMetaDefinitions(admin, `$app:${NAMESPACE_TEMPLATES}`, MetafieldOwnerType.Market);
  if (saveInputs.length) {
    const metafields = await upsertMetafields(admin, saveInputs);
    console.log("log: updateAllMarketTemplates: saved metafields: ", metafields);
  }
  if (deleteInputs.length) {
    const metafields = await deleteMetafields(admin, deleteInputs);
    console.log("log: updateAllMarketTemplates: deleted metafields: ", metafields);
  }
};

export { setDefaultTemplates, runTemplateUpdate, getTemplate, updateTemplate, deleteTemplate, updateAllMarketTemplates };
