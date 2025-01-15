import { useLoaderData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
import { BlockStack, Box, Card, Layout, Page, Text } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { PageWrapper, TemplateForm, LoadingPage, ExternalLink, SearchForm } from "~/components";
import { getThemes, getTemplate, getMarketsForNamespace, getAppSettings, getStore, updateSettings } from "~/services";
import { authenticate, extensionId } from "../../shopify.server";
import { NAMESPACE_SEARCH, TEMPLATE_SEARCH, TEMPLATE_SEARCH_LIST } from "~/models";
import { doTemplateAction } from "~/utils/templates.server";
import { generateDeeplinkingUrl } from "~/utils";

import en from "./en.json";

import type { ActionFunctionArgs, LoaderFunctionArgs, TypedResponse } from "@remix-run/node";
import type { Search, SettingsAction } from "~/types/store";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  console.log("log: SearchPage: loader");
  const shopUrl = session.shop;
  const themes = await getThemes(admin, session);
  const searchTemplate = await getTemplate(admin, TEMPLATE_SEARCH);
  const searchListTemplate = await getTemplate(admin, TEMPLATE_SEARCH_LIST);
  const markets = await getMarketsForNamespace(admin, NAMESPACE_SEARCH);
  const search = await getAppSettings<Search>(admin, NAMESPACE_SEARCH);
  const { working_theme } = await getStore(shopUrl) ?? {};
  return json({ themes, shopUrl, searchTemplate, searchListTemplate, extensionId, markets, search, workingTheme: working_theme });
};

export const action = async ({ request }: ActionFunctionArgs): Promise<TypedResponse<ActionResponse>> => {
  const { admin } = await authenticate.admin(request);
  console.log("log: SearchPage: action");

  /** @type {any} */
  const data: any = await request.json();
  const { _action, search }: SettingsAction = data;

  try {
    if (_action === "saveSettings" && search) {
      console.log("log: SearchPage: action: save settings");
      await updateSettings<Search>(admin, search, NAMESPACE_SEARCH);
    } else {
      await doTemplateAction(admin, data);
    }
    console.log("log: SearchPage: action: success.");
    return json({ status: "success" });
  } catch(error) {
    console.log(
      "log: SearchPage: action: error: ",
      error
    );
    return json({ status: "fail", error }, { status: 500 });
  }
};

export default function SearchPage() {
  console.log("log: SearchPage: render");
  const { shopUrl, extensionId, searchTemplate, searchListTemplate, markets, search, workingTheme } = useLoaderData<typeof loader>();
  const [i18n] = useI18n({
    id: "SearchPage",
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
                {i18n.translate("SearchPage.theme.title")}
              </Text>
              <Text as="p" variant="bodyMd">
                <Text as="span" tone="subdued">
                  {i18n.translate("SearchPage.theme.description")}
                </Text>
                <ExternalLink text={i18n.translate("SearchPage.theme.reference.primaryAction")} url={i18n.translate("SearchPage.theme.reference.primaryActionUrl")} />.
              </Text>
              <Card>
                <BlockStack gap="400">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      {i18n.translate("SearchPage.theme.step1.description")}
                    </Text>
                    <div>
                      <ExternalLink text={i18n.translate("SearchPage.theme.step1.label")} url={generateDeeplinkingUrl(true, shopUrl, extensionId!, "bloomreach-config", workingTheme)} variant="primary"/>
                    </div>
                  </BlockStack>
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      {i18n.translate("SearchPage.theme.step2.description")}
                    </Text>
                    <div>
                      <ExternalLink text={i18n.translate("SearchPage.theme.step2.label")} url={generateDeeplinkingUrl(false, shopUrl, extensionId!, "bloomreach-search-config", workingTheme, "search", "mainSection")} variant="primary"/>
                    </div>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
          <Layout.Section>
            <BlockStack gap="200">
              <SearchForm search={search} type="Bloomreach Search" />
            </BlockStack>
          </Layout.Section>
          <Layout.Section>
            <Box borderBlockStartWidth="025" borderColor="border" paddingBlockStart="400">
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">{i18n.translate("SearchPage.searchTemplate.title")}</Text>
                <Text as="p" variant="bodyMd" tone="subdued">{i18n.translate("SearchPage.searchTemplate.description")}</Text>
                <TemplateForm
                  shopUrl={shopUrl}
                  template="search"
                  templateValue={searchTemplate.value}
                  templateVersion={searchTemplate.version}
                  markets={markets as any} />
                </BlockStack>
            </Box>
          </Layout.Section>
          <Layout.Section>
            <Box borderBlockStartWidth="025" borderColor="border" paddingBlockStart="400">
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">{i18n.translate("SearchPage.searchListTemplate.title")}</Text>
                <Text as="p" variant="bodyMd" tone="subdued">{i18n.translate("SearchPage.searchListTemplate.description")}</Text>
                <TemplateForm
                  shopUrl={shopUrl}
                  template="search_product_list"
                  templateValue={searchListTemplate.value}
                  templateVersion={searchListTemplate.version}
                  markets={markets as any} />
                </BlockStack>
            </Box>
          </Layout.Section>
        </Layout>
      </Page>
    </PageWrapper>
  );
}
