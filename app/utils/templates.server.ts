import { deleteTemplate, runTemplateUpdate, updateAllMarketTemplates, updateTemplate } from "~/services";

import type { AdminApiContext } from "@shopify/shopify-app-remix/server";
import type { TemplateAction } from "~/types/store";

export async function doTemplateAction(admin: AdminApiContext, data: TemplateAction) {
  console.log("log: doTemplateAction: data: ", data);
  const { _action, template, templateValue, templateVersion, marketId, actions } = data;

  if (_action === 'autoUpdateTemplate') {
    console.log("log: doTemplateAction: action: autoUpdateTemplate");
    await runTemplateUpdate(admin, template, marketId);
  } else if (_action === 'saveTemplate') {
    console.log("log: doTemplateAction: action: save template");
    await updateTemplate(admin, template, templateValue, templateVersion, marketId);
  } else if (_action === 'deleteTemplate') {
    console.log("log: doTemplateAction: action: delete template");
    await deleteTemplate(admin, template, marketId);
  } else if (_action === 'updateAllTemplates') {
    console.log("log: doTemplateAction: action: update all templates");
    await updateAllMarketTemplates(admin, template, actions);
  }
}
