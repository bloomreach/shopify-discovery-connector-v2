import { useLoaderData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
import { BlockStack, Card, Layout, Page, Text } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { PageWrapper, LoadingPage, ExternalLink } from "~/components";
import { getStore } from "~/services";
import { authenticate, extensionId } from "../../shopify.server";
import { generateDeeplinkingUrl } from "~/utils";

import en from "./en.json";

import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  console.log("log: PixelPage: loader");
  const shopUrl = session.shop;
  const { working_theme } = await getStore(shopUrl) ?? {};
  return json({ shopUrl, extensionId, workingTheme: working_theme });
};

export default function PixelPage() {
  console.log("log: PixelPage: render");
  const { shopUrl, extensionId, workingTheme } = useLoaderData<typeof loader>();
  const [i18n] = useI18n({
    id: "PixelPage",
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
                {i18n.translate("PixelPage.theme.title")}
              </Text>
              <Text as="p" variant="bodyMd">
                <Text as="span" tone="subdued">
                  {i18n.translate("PixelPage.theme.description")}
                </Text>
                <ExternalLink text={i18n.translate("PixelPage.theme.reference.primaryAction")} url={i18n.translate("PixelPage.theme.reference.primaryActionUrl")} />.
              </Text>
              <Card>
                <BlockStack gap="200">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    {i18n.translate("PixelPage.theme.primaryAction.description")}
                  </Text>
                  <div>
                    <ExternalLink text={i18n.translate("PixelPage.theme.primaryAction.label")} url={generateDeeplinkingUrl(true, shopUrl, extensionId!, "bloomreach-config", workingTheme)} variant="primary"/>
                  </div>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Page>
    </PageWrapper>
  );
}
