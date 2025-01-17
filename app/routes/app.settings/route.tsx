import type { ActionFunctionArgs, LoaderFunctionArgs, TypedResponse } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { CredentialsForm, LoadingPage, MultiCurrencyToggle, PageWrapper, CatalogsForm, ThemeChoiceForm, ViewsForm } from "~/components";
import { getAppSettings, getMarketsWithCatalogsViews, getStore, getThemes, updateAccount, updateCatalogMappings, updateStore, updateViewMappings } from "~/services";
import { authenticate } from "../../shopify.server";
import { NAMESPACE_ACCOUNT } from "~/models";
import packageJson from "../../../package.json";

import en from "./en.json";

import type { Account, MarketCatalogMapping, MarketViewMapping, Store } from "~/types/store";
import type { Theme } from "node_modules/@shopify/shopify-api/dist/ts/rest/admin/2024-04/theme";

const { version, sdkVersion } = packageJson;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("log: SettingsPage: loader");
  const { admin, session } = await authenticate.admin(request);
  const account = await getAppSettings(admin, NAMESPACE_ACCOUNT) ?? {};
  const markets = await getMarketsWithCatalogsViews(admin) ?? [];
  const themes = await getThemes(admin, session);
  const store = await getStore(session.shop);

  const jsonResponse = json({ account, markets, themes, workingTheme: store?.working_theme });
  console.log("log: SettingsPage: loader response: ", jsonResponse);
  return jsonResponse;
};

type PostBody = { account?: Account, catalogMappings?: MarketCatalogMapping[], store?: Store, viewMappings?: MarketViewMapping[] };
export const action = async ({ request }: ActionFunctionArgs): Promise<TypedResponse<ActionResponse>> => {
  console.log("log: SettingsPage: action");
  const { admin, session } = await authenticate.admin(request);
  const { account, catalogMappings, store, viewMappings }: PostBody = await request.json();

  try {
    if (account) {
      console.log("log: SettingsPage: action: update account");
      await updateAccount(admin, account);
      console.log("log: SettingsPage: action: update account: success.");
    }
    if (catalogMappings?.length) {
      console.log("log: SettingsPage: action: update catalog mappings");
      await updateCatalogMappings(admin, catalogMappings);
      console.log("log: SettingsPage: action: update catalog mappings: success.");
    }
    if (store) {
      console.log("log: SettingsPage: action: update store");
      await updateStore(session.shop, store);
      console.log("log: SettingsPage: action: update store: success.");
    }
    if (viewMappings?.length) {
      console.log("log: SettingsPage: action: update view mappings");
      await updateViewMappings(admin, viewMappings);
      console.log("log: SettingsPage: action: update view mappings: success.");
    }
    return json({ status: 'success' });
  } catch(error) {
    console.log(
      "log: SettingsPage: action: error: ",
      error
    );
    return json({ status: 'fail', error }, { status: 500 });
  }
};

export default function SettingsPage() {
  console.log("log: SettingsPage: render");
  const { account, markets, themes, workingTheme } = useLoaderData<typeof loader>();
  console.log("log: SettingsPage: render: markets: ", markets);
  const [i18n] = useI18n({
    id: "SettingsPage",
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
          <Layout.AnnotatedSection
            title={i18n.translate("SettingsPage.credentials.title")}
            description={i18n.translate("SettingsPage.credentials.description")}
          >
            <CredentialsForm {...account} />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title={i18n.translate("SettingsPage.catalogs.title")}
            description={i18n.translate("SettingsPage.catalogs.description")}
          >
            <CatalogsForm account={account} markets={markets as any} />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title={i18n.translate("SettingsPage.views.title")}
            description={i18n.translate("SettingsPage.views.description")}
          >
            <ViewsForm markets={markets as any} />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title={i18n.translate("SettingsPage.themes.title")}
            description={i18n.translate("SettingsPage.themes.description")}
          >
            <ThemeChoiceForm themes={(themes ?? []) as Theme[]} workingTheme={workingTheme} />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title={i18n.translate("SettingsPage.MulitCurrency.title")}
            description={i18n.translate(
              "SettingsPage.MulitCurrency.description"
            )}
          >
            <MultiCurrencyToggle {...account} />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title={i18n.translate("SettingsPage.version.title")}
            description={i18n.translate(
              "SettingsPage.version.description"
            )}
          >
            <Card>
              <BlockStack gap="400">
                <p>
                  <Text as="span" variant="bodyMd" fontWeight="bold">App Version: </Text>{version}
                </p>
                <p>
                  <Text as="span" variant="bodyMd" fontWeight="bold">SDK Version: </Text>{sdkVersion}
                </p>
              </BlockStack>
            </Card>
          </Layout.AnnotatedSection>
        </Layout>
      </Page>
    </PageWrapper>
  );
}
