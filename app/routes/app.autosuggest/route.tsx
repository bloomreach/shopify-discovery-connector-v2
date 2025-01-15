import { useLoaderData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
import { BlockStack, Box, Card, Layout, Page, Text } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { PageWrapper, TemplateForm, LoadingPage, ExternalLink, AutosuggestForm } from "~/components";
import { getTemplate, getMarketsForNamespace, getStore, getAppSettings, updateSettings, deleteSettings, updateAllMarketSettings } from "~/services";
import { authenticate, extensionId } from "../../shopify.server";
import { doTemplateAction } from "~/utils/templates.server";
import { NAMESPACE_AUTOSUGGEST, TEMPLATE_AUTOSUGGEST } from "~/models";
import { generateDeeplinkingUrl } from "~/utils";

import en from "./en.json";

import type { ActionFunctionArgs, LoaderFunctionArgs, TypedResponse } from "@remix-run/node";
import type { Autosuggest, SettingsAction } from "~/types/store";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  console.log("log: AutosuggestPage: loader");
  const shopUrl = session.shop;
  const autosuggestTemplate = await getTemplate(admin, TEMPLATE_AUTOSUGGEST);
  const autosuggestSettings = await getAppSettings<Autosuggest>(admin, NAMESPACE_AUTOSUGGEST);
  const markets = await getMarketsForNamespace(admin, NAMESPACE_AUTOSUGGEST);
  const { working_theme } = await getStore(shopUrl) ?? {};
  return json({ shopUrl, autosuggestTemplate, extensionId, markets, autosuggestSettings, workingTheme: working_theme });
};

export const action = async ({ request }: ActionFunctionArgs): Promise<TypedResponse<ActionResponse>> => {
  const { admin } = await authenticate.admin(request);
  console.log("log: AutosuggestPage: action");

  /** @type {any} */
  const data: any = await request.json();
  const { _action, marketId, actions, autosuggest }: SettingsAction = data;

  try {
    if (_action === 'saveSettings' && autosuggest) {
      console.log("log: AutosuggestPage: action: save settings");
      await updateSettings<Autosuggest>(admin, autosuggest, NAMESPACE_AUTOSUGGEST, marketId);
    } else if (_action === 'deleteSettings') {
      console.log("log: AutosuggestPage: action: delete settings");
      await deleteSettings(admin, marketId, NAMESPACE_AUTOSUGGEST);
    } else if (_action === 'updateAllSettings') {
      console.log("log: AutosuggestPage: action: update all settings");
      await updateAllMarketSettings(admin, actions, NAMESPACE_AUTOSUGGEST);
    } else {
      await doTemplateAction(admin, data);
    }
    console.log("log: AutosuggestPage: action: success.");
    return json({ status: "success" });
  } catch(error) {
    console.log(
      "log: AutosuggestPage: action: error: ",
      error
    );
    return json({ status: "fail", error }, { status: 500 });
  }
};

export default function AutosuggestPage() {
  console.log("log: AutosuggestPage: render");
  const { shopUrl, extensionId, autosuggestTemplate, markets, autosuggestSettings, workingTheme } = useLoaderData<typeof loader>();
  const [i18n] = useI18n({
    id: "AutosuggestPage",
    translations: {
      en,
    },
  });
  const navigation = useNavigation();

  if (navigation.state === "loading") {
    return <LoadingPage />;
  }

  return (
    <PageWrapper>
      <Page>
        <Layout>
          <Layout.Section>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                {i18n.translate("AutosuggestPage.theme.title")}
              </Text>
              <Text as="p" variant="bodyMd">
                <Text as="span" tone="subdued">
                  {i18n.translate("AutosuggestPage.theme.description")}
                </Text>
                <ExternalLink text={i18n.translate("AutosuggestPage.theme.reference.primaryAction")} url={i18n.translate("AutosuggestPage.theme.reference.primaryActionUrl")} />.
              </Text>
              <Card>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    {i18n.translate("AutosuggestPage.theme.primaryAction.description")}
                  </Text>
                  <div>
                    <ExternalLink text={i18n.translate("AutosuggestPage.theme.primaryAction.label")} url={generateDeeplinkingUrl(true, shopUrl, extensionId!, "bloomreach-config", workingTheme)} variant="primary"/>
                  </div>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
          <Layout.Section>
            <Box borderBlockStartWidth="025" borderColor="border" paddingBlockStart="400">
              <AutosuggestForm markets={markets as any} autosuggest={autosuggestSettings} />
            </Box>
          </Layout.Section>
          <Layout.Section>
            <Box borderBlockStartWidth="025" borderColor="border" paddingBlockStart="400">
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">{i18n.translate("AutosuggestPage.template.title")}</Text>
                <Text as="p" variant="bodyMd" tone="subdued">{i18n.translate("AutosuggestPage.template.description")}</Text>
                <TemplateForm
                  shopUrl={shopUrl}
                  template="autosuggest"
                  templateValue={autosuggestTemplate.value}
                  templateVersion={autosuggestTemplate.version}
                  markets={markets as any} />
              </BlockStack>
            </Box>
          </Layout.Section>
        </Layout>
      </Page>
    </PageWrapper>
  );
}
