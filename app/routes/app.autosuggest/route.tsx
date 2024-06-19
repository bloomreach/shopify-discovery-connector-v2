import { useLoaderData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
import { Layout, Page } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { PageWrapper, ThemeEditForm, TemplateForm, LoadingPage } from "~/components";
import { getStore, updateStore, getThemes, getTemplate, runTemplateUpdate, updateTemplate } from "~/services";
import { authenticate, extensionId } from "../../shopify.server";

import en from "./en.json";

import type { ActionFunctionArgs, LoaderFunctionArgs, TypedResponse } from "@remix-run/node";
import type { Theme } from "node_modules/@shopify/shopify-api/dist/ts/rest/admin/2024-04/theme";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  console.log("log: AutosuggestPage: loader");
  const shopUrl = session.shop;
  const store = await getStore(shopUrl);
  const themes = await getThemes(admin, session);
  const autosuggestTemplate = await getTemplate(admin, "autosuggest");
  console.log("log: AutosuggestPage: loader: getStoreResponse: ", store);
  console.log("log: AutosuggestPage: loader: themes: ", themes);
  return json({ store, themes, shopUrl, autosuggestTemplate, extensionId });
};

export const action = async ({ request }: ActionFunctionArgs): Promise<TypedResponse<ActionResponse>> => {
  const { session, admin } = await authenticate.admin(request);
  console.log("log: AutosuggestPage: action");
  const shopUrl = session.shop;

  /** @type {any} */
  const data: any = {...Object.fromEntries(await request.formData())};
  const { _action, template, templateValue, templateVersion, updateVersion } = data;

  try {
    if (_action === 'autoUpdateTemplate') {
      console.log("log: AutosuggestPage: action: autoUpdateTemplate");
      await runTemplateUpdate(shopUrl, admin, template);
    } else {
      if (updateVersion) {
        console.log("log: AutosuggestPage: action: updateTemplateVersion");
        await updateStore(shopUrl, { [`${template}_template_version`]: templateVersion });
      }
      console.log("log: AutosuggestPage: action: save template");
      await updateTemplate(admin, template, templateValue);
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
  const { store, themes, shopUrl, extensionId, autosuggestTemplate } = useLoaderData<typeof loader>();
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
          <Layout.AnnotatedSection
            title={i18n.translate("AutosuggestPage.theme.title")}
            description={i18n.translate("AutosuggestPage.theme.description")}
          >
            <ThemeEditForm
              themes={themes as Theme[]}
              shopUrl={shopUrl}
              extensionId={extensionId!}
              handle="bloomreach-autosuggest-config" />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title={i18n.translate("AutosuggestPage.template.title")}
            description={i18n.translate("AutosuggestPage.template.description")}
          >
            <TemplateForm
              shopUrl={shopUrl}
              template="autosuggest"
              templateValue={autosuggestTemplate}
              templateVersion={store?.autosuggest_template_version} />
          </Layout.AnnotatedSection>
        </Layout>
      </Page>
    </PageWrapper>
  );
}
