import { useLoaderData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Layout, Page } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { PageWrapper, ThemeEditForm, TemplateForm, LoadingPage } from "~/components";
import { getStore, updateStore, getThemes, getTemplate, setDefaultTemplates, runTemplateUpdate, updateTemplate } from "~/services";
import { authenticate, extensionId } from "../../shopify.server";

import en from "./en.json";

import type { ActionFunctionArgs, LoaderFunctionArgs, TypedResponse } from "@remix-run/node";
import type { Theme } from "node_modules/@shopify/shopify-api/dist/ts/rest/admin/2024-04/theme";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  console.log("log: SearchPage: loader");
  const shopUrl = session.shop;
  const store = await getStore(shopUrl);
  const themes = await getThemes(admin, session);
  const searchTemplate = await getTemplate(admin, "search");
  const searchListTemplate = await getTemplate(admin, "search_product_list");
  await setDefaultTemplates(admin, shopUrl);
  console.log("log: SearchPage: loader: getStoreResponse: ", store);
  console.log("log: SearchPage: loader: themes: ", themes);
  return json({ store, themes, shopUrl, searchTemplate, searchListTemplate, extensionId });
};

export const action = async ({ request }: ActionFunctionArgs): Promise<TypedResponse<ActionResponse>> => {
  const { session, admin } = await authenticate.admin(request);
  console.log("log: SearchPage: action");
  const shopUrl = session.shop;

  /** @type {any} */
  const data: any = {...Object.fromEntries(await request.formData())};
  const { _action, template, templateValue, templateVersion, updateVersion } = data;

  try {
    if (_action === 'autoUpdateTemplate') {
      console.log("log: SearchPage: action: autoUpdateTemplate");
      await runTemplateUpdate(shopUrl, admin, template);
    } else {
      if (updateVersion) {
        console.log("log: SearchPage: action: updateTemplateVersion");
        await updateStore(shopUrl, { [`${template}_template_version`]: templateVersion });
      }
      console.log("log: SearchPage: action: save template");
      await updateTemplate(admin, template, templateValue);
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
  const { store, themes, shopUrl, extensionId, searchTemplate, searchListTemplate } = useLoaderData<typeof loader>();
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
          <Layout.AnnotatedSection
            title={i18n.translate("SearchPage.theme.title")}
            description={i18n.translate("SearchPage.theme.description")}
          >
            <ThemeEditForm
              themes={themes as Theme[]}
              shopUrl={shopUrl}
              extensionId={extensionId!}
              handle="bloomreach-search-config"
              template="search" />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title={i18n.translate("SearchPage.searchTemplate.title")}
            description={i18n.translate("SearchPage.searchTemplate.description")}
          >
            <TemplateForm
              shopUrl={shopUrl}
              template="search"
              templateValue={searchTemplate}
              templateVersion={store?.search_template_version} />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title={i18n.translate("SearchPage.searchListTemplate.title")}
            description={i18n.translate("SearchPage.searchListTemplate.description")}
          >
            <TemplateForm
              shopUrl={shopUrl}
              template="search_product_list"
              templateValue={searchListTemplate}
              templateVersion={store?.search_product_list_template_version} />
          </Layout.AnnotatedSection>
        </Layout>
      </Page>
    </PageWrapper>
  );
}
