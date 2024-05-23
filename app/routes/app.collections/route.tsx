import { useLoaderData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Layout, Page } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { PageWrapper, ThemeEditForm, TemplateForm, LoadingPage } from "~/components";
import { getStore, updateStore, getThemes, getTemplate, setDefaultTemplates, runTemplateUpdate, updateTemplate } from "~/services";
import { authenticate, extensionId } from "../../shopify.server";

import en from "./en.json";

import type { ActionFunctionArgs, LoaderFunctionArgs, TypedResponse } from "@remix-run/node";
import type { Theme } from "node_modules/@shopify/shopify-api/rest/admin/2024-01/theme";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  console.log("log: CollectionsPage: loader");
  const shopUrl = session.shop;
  const store = await getStore(shopUrl);
  const themes = await getThemes(admin, session);
  const categoryTemplate = await getTemplate(admin, "category");
  const categoryListTemplate = await getTemplate(admin, "category_product_list");
  await setDefaultTemplates(admin, shopUrl);
  console.log("log: CollectionsPage: loader: getStoreResponse: ", store);
  console.log("log: CollectionsPage: loader: themes: ", themes);
  return json({ store, themes, shopUrl, categoryTemplate, categoryListTemplate, extensionId });
};

export const action = async ({ request }: ActionFunctionArgs): Promise<TypedResponse<ActionResponse>> => {
  const { session, admin } = await authenticate.admin(request);
  console.log("log: CollectionsPage: action");
  const shopUrl = session.shop;

  /** @type {any} */
  const data: any = {...Object.fromEntries(await request.formData())};
  const { _action, template, templateValue, templateVersion, updateVersion } = data;

  try {
    if (_action === 'autoUpdateTemplate') {
      console.log("log: CollectionsPage: action: autoUpdateTemplate");
      await runTemplateUpdate(shopUrl, admin, template);
    } else {
      if (updateVersion) {
        console.log("log: CollectionsPage: action: updateTemplateVersion");
        await updateStore(shopUrl, { [`${template}_template_version`]: templateVersion });
      }
      console.log("log: CollectionsPage: action: save template");
      await updateTemplate(admin, template, templateValue);
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
  const { store, themes, shopUrl, extensionId, categoryTemplate, categoryListTemplate } = useLoaderData<typeof loader>();
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
          <Layout.AnnotatedSection
            title={i18n.translate("CollectionsPage.theme.title")}
            description={i18n.translate("CollectionsPage.theme.description")}
          >
            <ThemeEditForm
              themes={themes as Theme[]}
              shopUrl={shopUrl}
              extensionId={extensionId!}
              handle="bloomreach-category-config"
              template="collection" />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title={i18n.translate("CollectionsPage.categoryTemplate.title")}
            description={i18n.translate("CollectionsPage.categoryTemplate.description")}
          >
            <TemplateForm
              shopUrl={shopUrl}
              template="category"
              templateValue={categoryTemplate}
              templateVersion={store?.category_template_version} />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title={i18n.translate("CollectionsPage.categoryListTemplate.title")}
            description={i18n.translate("CollectionsPage.categoryListTemplate.description")}
          >
            <TemplateForm
              shopUrl={shopUrl}
              template="category_product_list"
              templateValue={categoryListTemplate}
              templateVersion={store?.category_product_list_template_version} />
          </Layout.AnnotatedSection>
        </Layout>
      </Page>
    </PageWrapper>
  );
}
