import type { LoaderFunctionArgs } from "@remix-run/node";
import { useNavigate, useNavigation, useOutletContext } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  CalloutCard,
  Banner,
} from "@shopify/polaris";
import { authenticate } from "../../shopify.server";
import { useI18n } from "@shopify/react-i18n";
import { ConsoleLogger, ExternalLink, HtmlBlock, LoadingPage, PageWrapper } from "~/components";

import en from "./en.json";
import type { AppContext } from "../app";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  ConsoleLogger("log: Index: render");
  const [i18n] = useI18n({
    id: "DashboardPage",
    translations: {
      en,
    },
  });

  const nav = useNavigation();
  const navigate = useNavigate();

  const { setupComplete } = useOutletContext<AppContext>();

  if (nav.state === "loading") {
    return <LoadingPage />;
  }

  return (
    <PageWrapper>
      <Page>
        <Layout>
          {!setupComplete && (
          <Layout.Section>
            <Banner
              tone="info"
              title={i18n.translate("DashboardPage.configureBanner.title")}
              action={{
                content: i18n.translate("DashboardPage.configureBanner.primaryAction"),
                onAction: () => navigate("/app/settings"),
              }}
              secondaryAction={{
                target: "_blank",
                content: i18n.translate("DashboardPage.configureBanner.secondaryAction"),
                url: i18n.translate("DashboardPage.configureBanner.secondaryActionUrl"),
              }}
            >
              <Text as="p">{i18n.translate("DashboardPage.configureBanner.body")}</Text>
            </Banner>
          </Layout.Section>
          )}
          <Layout.Section>
            <CalloutCard
              title={i18n.translate("DashboardPage.welcome.title")}
              illustration={i18n.translate("DashboardPage.welcome.illustration")}
              primaryAction={{
                target: "_blank",
                content: i18n.translate("DashboardPage.welcome.primaryAction"),
                url: i18n.translate("DashboardPage.welcome.primaryActionUrl"),
              }}
            >
              <Text as="p" tone="subdued">{i18n.translate("DashboardPage.welcome.body")}</Text>
            </CalloutCard>
          </Layout.Section>
          <Layout.AnnotatedSection
            title={i18n.translate("DashboardPage.enterprise.title")}
            description={i18n.translate("DashboardPage.enterprise.description")}
          >
            <Card>
              <BlockStack gap="400">
                <Text as="p" tone="subdued">{i18n.translate("DashboardPage.enterprise.body1")}</Text>
                <Text as="p" tone="subdued">{i18n.translate("DashboardPage.enterprise.body2")}</Text>
                <div>
                  <ExternalLink
                    url={i18n.translate("DashboardPage.enterprise.primaryActionUrl")}
                    text={i18n.translate("DashboardPage.enterprise.primaryAction")}
                    variant="primary"
                  />
                </div>
              </BlockStack>
            </Card>
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title={i18n.translate("DashboardPage.contact.title")}
            description={i18n.translate("DashboardPage.contact.description")}
          >
            <Card>
              <BlockStack gap="400">
                <Text as="p" tone="subdued">{i18n.translate("DashboardPage.contact.body")}</Text>
                <HtmlBlock content={i18n.translate("DashboardPage.contact.address")} />
                <div>
                  <ExternalLink
                    url={i18n.translate("DashboardPage.contact.primaryActionUrl")}
                    text={i18n.translate("DashboardPage.contact.primaryAction")}
                    variant="primary"
                  />
                </div>
              </BlockStack>
            </Card>
          </Layout.AnnotatedSection>
        </Layout>
      </Page>
    </PageWrapper>
  );
}
