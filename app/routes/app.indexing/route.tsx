import { useNavigation } from "@remix-run/react";
import { CalloutCard, Layout, Page, Text } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { ConsoleLogger, LoadingPage, PageWrapper } from "~/components";

import en from "./en.json";

export default function IndexingPage() {
  ConsoleLogger("log: IndexingPage: render");
  const [i18n] = useI18n({
    id: "IndexingPage",
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
          <Layout.AnnotatedSection
            title={i18n.translate("IndexingPage.title")}
            description={i18n.translate("IndexingPage.description")}
          >
            <CalloutCard
              title={i18n.translate("IndexingPage.welcome.title")}
              illustration={i18n.translate("IndexingPage.welcome.illustration")}
              primaryAction={{
                target: "_blank",
                content: i18n.translate("IndexingPage.welcome.primaryAction"),
                url: i18n.translate("IndexingPage.welcome.primaryActionUrl"),
              }}
            >
              <Text as="p" tone="subdued">{i18n.translate("IndexingPage.welcome.body")}</Text>
            </CalloutCard>
          </Layout.AnnotatedSection>
        </Layout>
      </Page>
    </PageWrapper>
  );
}
