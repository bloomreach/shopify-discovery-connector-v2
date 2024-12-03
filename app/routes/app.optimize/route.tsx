import { useNavigation } from "@remix-run/react";
import { BlockStack, CalloutCard, Card, Layout, Page, Text } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { ConsoleLogger, ExternalLink, LoadingPage, PageWrapper } from "~/components";

import en from "./en.json";

export default function OptimizePage() {
  ConsoleLogger("log: OptimizePage: render");
  const [i18n] = useI18n({
    id: "OptimizePage",
    translations: {
      en,
    },
  });

  const nav = useNavigation();

  if (nav.state === "loading") {
    return <LoadingPage />;
  }

  return (
    <PageWrapper>
      <Page>
        <Layout>
          <Layout.Section>
            <CalloutCard
              title={i18n.translate("OptimizePage.welcome.title")}
              illustration={i18n.translate("OptimizePage.welcome.illustration")}
              primaryAction={{
                target: "_blank",
                content: i18n.translate("OptimizePage.welcome.primaryAction"),
                url: i18n.translate("OptimizePage.welcome.primaryActionUrl"),
              }}
            >
              <Text as="p" tone="subdued">{i18n.translate("OptimizePage.welcome.body")}</Text>
            </CalloutCard>
          </Layout.Section>
          <Layout.AnnotatedSection
            title={i18n.translate("OptimizePage.searchRanking.title")}
            description={i18n.translate(
              "OptimizePage.searchRanking.description"
            )}
          >
            <Card>
              <BlockStack gap="400">
                <Text as="p" tone="subdued">{i18n.translate("OptimizePage.searchRanking.body")}</Text>
                <div>
                  <ExternalLink
                    url={i18n.translate("OptimizePage.searchRanking.primaryActionUrl")}
                    text={i18n.translate("OptimizePage.searchRanking.primaryAction")}
                    variant="primary"
                  />
                </div>
              </BlockStack>
            </Card>
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title={i18n.translate("OptimizePage.merchandising.title")}
            description={i18n.translate(
              "OptimizePage.merchandising.description"
            )}
          >
            <Card>
              <BlockStack gap="400">
                <Text as="p" tone="subdued">{i18n.translate("OptimizePage.merchandising.body")}</Text>
                <div>
                  <ExternalLink
                    url={i18n.translate("OptimizePage.merchandising.primaryActionUrl")}
                    text={i18n.translate("OptimizePage.merchandising.primaryAction")}
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
