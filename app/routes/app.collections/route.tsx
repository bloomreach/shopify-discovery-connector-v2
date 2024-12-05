import { useLoaderData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
import { BlockStack, Box, Card, Layout, Page, Text } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { PageWrapper, TemplateForm, LoadingPage, ExternalLink, SearchForm } from "~/components";
import { getTemplate, getMarketsForNamespace, getStore, getAppSettings, updateSettings } from "~/services";
import { authenticate, extensionId } from "../../shopify.server";
import { doTemplateAction } from "~/utils/templates.server";
import { NAMESPACE_CATEGORY, TEMPLATE_CATEGORY, TEMPLATE_CATEGORY_LIST } from "~/models";
import { generateDeeplinkingUrl } from "~/utils";

import en from "./en.json";

import type { ActionFunctionArgs, LoaderFunctionArgs, TypedResponse } from "@remix-run/node";
import type { Search, SettingsAction } from "~/types/store";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  console.log("log: CollectionsPage: loader");
  const shopUrl = session.shop;
  const categoryTemplate = await getTemplate(admin, TEMPLATE_CATEGORY);
  const categoryListTemplate = await getTemplate(admin, TEMPLATE_CATEGORY_LIST);
  const markets = await getMarketsForNamespace(admin, NAMESPACE_CATEGORY);
  const collections = await getAppSettings<Search>(admin, NAMESPACE_CATEGORY);
  const { working_theme } = await getStore(shopUrl) ?? {};
  return json({ shopUrl, categoryTemplate, categoryListTemplate, extensionId, markets, collections, workingTheme: working_theme });
};

export const action = async ({ request }: ActionFunctionArgs): Promise<TypedResponse<ActionResponse>> => {
  const { admin } = await authenticate.admin(request);
  console.log("log: CollectionsPage: action");

  /** @type {any} */
  const data: any = await request.json();
  const { _action, search }: SettingsAction = data;

  try {
    if (_action === "saveSettings" && search) {
      console.log("log: CollectionsPage: action: save settings");
      await updateSettings<Search>(admin, search, NAMESPACE_CATEGORY);
    } else {
      await doTemplateAction(admin, data);
    }
    console.log("log: CollectionsPage: action: success.");
    return json({ status: "success" });
  } catch(error) {
    console.log(
      "log: CollectionsPage: action: error: ",
      error
    );
    return json({ status: "fail", error }, { status: 500 });
  }
};

export default function CollectionsPage() {
  console.log("log: CollectionsPage: render");
  const { shopUrl, extensionId, categoryTemplate, categoryListTemplate, markets, collections, workingTheme } = useLoaderData<typeof loader>();
  const [i18n] = useI18n({
    id: "CollectionsPage",
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
                {i18n.translate("CollectionsPage.theme.title")}
              </Text>
              <Text as="p" variant="bodyMd">
                <Text as="span" tone="subdued">
                  {i18n.translate("CollectionsPage.theme.description")}
                </Text>
                <ExternalLink text={i18n.translate("CollectionsPage.theme.reference.primaryAction")} url={i18n.translate("CollectionsPage.theme.reference.primaryActionUrl")} />.
              </Text>
              <Card>
                <BlockStack gap="400">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      {i18n.translate("CollectionsPage.theme.step1.description")}
                    </Text>
                    <div>
                      <ExternalLink text={i18n.translate("CollectionsPage.theme.step1.label")} url={generateDeeplinkingUrl(true, shopUrl, extensionId!, "bloomreach-config", workingTheme)} variant="primary"/>
                    </div>
                  </BlockStack>
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      {i18n.translate("CollectionsPage.theme.step2.description")}
                    </Text>
                    <div>
                      <ExternalLink text={i18n.translate("CollectionsPage.theme.step2.label")} url={generateDeeplinkingUrl(false, shopUrl, extensionId!, "bloomreach-category-config", workingTheme, "collection", "mainSection")} variant="primary"/>
                    </div>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
          <Layout.Section>
            <BlockStack gap="200">
              <SearchForm search={collections} type="Bloomreach Collections" />
            </BlockStack>
          </Layout.Section>
          <Layout.Section>
            <Box borderBlockStartWidth="025" borderColor="border" paddingBlockStart="400">
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">{i18n.translate("CollectionsPage.categoryTemplate.title")}</Text>
                <Text as="p" variant="bodyMd" tone="subdued">{i18n.translate("CollectionsPage.categoryTemplate.description")}</Text>
                <TemplateForm
                  shopUrl={shopUrl}
                  template="category"
                  templateValue={categoryTemplate.value}
                  templateVersion={categoryTemplate.version}
                  markets={markets as any} />
                </BlockStack>
            </Box>
          </Layout.Section>
          <Layout.Section>
            <Box borderBlockStartWidth="025" borderColor="border" paddingBlockStart="400">
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">{i18n.translate("CollectionsPage.categoryListTemplate.title")}</Text>
                <Text as="p" variant="bodyMd" tone="subdued">{i18n.translate("CollectionsPage.categoryListTemplate.description")}</Text>
                <TemplateForm
                  shopUrl={shopUrl}
                  template="category_product_list"
                  templateValue={categoryListTemplate.value}
                  templateVersion={categoryListTemplate.version}
                  markets={markets as any} />
                </BlockStack>
            </Box>
          </Layout.Section>
        </Layout>
      </Page>
    </PageWrapper>
  );
}
