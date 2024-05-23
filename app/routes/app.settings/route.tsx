import type { ActionFunctionArgs, LoaderFunctionArgs, TypedResponse } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { Layout, Page } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { CredentialsForm, LoadingPage, MultiCurrencyToggle, PageWrapper } from "~/components";
import { getAccount, updateAccount } from "~/services";
import { authenticate } from "../../shopify.server";

import en from "./en.json";

import type { Account } from "~/types/store";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  console.log("log: SettingsPage: loader");
  const { admin } = await authenticate.admin(request);
  const account = await getAccount(admin) ?? {};
  console.log("log: SettingsPage: loader response: ", account);
  return json(account);
};

export const action = async ({ request }: ActionFunctionArgs): Promise<TypedResponse<ActionResponse>> => {
  console.log("log: SettingsPage: action");
  const { admin } = await authenticate.admin(request);
  const data: Account = await request.json();

  try {
    const updatedAccount = await updateAccount(admin, data);
    console.log(
      "log: SettingsPage: action: success: ",
      updatedAccount
    );
    return json({ status: 'success', data: updatedAccount });
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
  const account = useLoaderData<typeof loader>();
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
            title={i18n.translate("SettingsPage.MulitCurrency.title")}
            description={i18n.translate(
              "SettingsPage.MulitCurrency.description"
            )}
          >
            <MultiCurrencyToggle {...account} />
          </Layout.AnnotatedSection>
        </Layout>
      </Page>
    </PageWrapper>
  );
}
