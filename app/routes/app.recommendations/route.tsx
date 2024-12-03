import { useCallback, useMemo, useState } from "react";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
import { ActionList, type ActionListItemProps, BlockStack, Box, Button, CalloutCard, Card, Layout, Page, Popover, Text } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { PageWrapper, TemplateForm, LoadingPage, RecommendationsForm, ExternalLink } from "~/components";
import { getTemplate, getAppSettings, updateSettings, getMarketsForNamespace, getStore } from "~/services";
import { authenticate, extensionId } from "../../shopify.server";
import { generateDeeplinkingUrl } from "~/utils";
import { NAMESPACE_RECOMMENDATIONS, TEMPLATE_RECOMMENDATIONS } from "~/models";
import { doTemplateAction } from "~/utils/templates.server";

import en from "./en.json";

import type { ActionFunctionArgs, LoaderFunctionArgs, TypedResponse } from "@remix-run/node";
import type { Recommendations, SettingsAction } from "~/types/store";

const widgetTypes = ["category", "keyword", "item", "personalized", "global"];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  console.log("log: RecommendationsPage: loader");
  const shopUrl = session.shop;
  const { working_theme } = await getStore(shopUrl) ?? {};
  const recommendations = await getAppSettings<Recommendations>(admin, NAMESPACE_RECOMMENDATIONS);
  const template = await getTemplate(admin, TEMPLATE_RECOMMENDATIONS);
  const markets = await getMarketsForNamespace(admin, NAMESPACE_RECOMMENDATIONS);
  return json({ shopUrl, template, extensionId, recommendations, markets, workingTheme: working_theme });
};

export const action = async ({ request }: ActionFunctionArgs): Promise<TypedResponse<ActionResponse>> => {
  const { admin } = await authenticate.admin(request);
  console.log("log: RecommendationsPage: action");

  /** @type {any} */
  const data: any = await request.json();
  const { _action, recommendations }: SettingsAction = data;

  try {
    if (_action === 'saveSettings' && recommendations) {
      console.log("log: RecommendationsPage: action: updateRecommendations");
      await updateSettings<Recommendations>(admin, recommendations, NAMESPACE_RECOMMENDATIONS);
    } else {
      await doTemplateAction(admin, data);
    }

    console.log("log: RecommendationsPage: action: success.");
    return json({ status: "success" });
  } catch(error) {
    console.log(
      "log: RecommendationsPage: action: error: ",
      error
    );
    return json({ status: "fail", error }, { status: 500 });
  }
};

export default function RecommendationsPage() {
  console.log("log: RecommendationsPage: render");
  const { shopUrl, extensionId, template, recommendations, markets, workingTheme } = useLoaderData<typeof loader>();
  const [i18n] = useI18n({
    id: "RecommendationsPage",
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
            <CalloutCard
              title={i18n.translate("RecommendationsPage.welcome.title")}
              illustration={i18n.translate(
                "RecommendationsPage.welcome.illustration"
              )}
              primaryAction={{
                target: "_blank",
                content: i18n.translate(
                  "RecommendationsPage.welcome.primaryAction"
                ),
                url: i18n.translate("RecommendationsPage.welcome.primaryActionUrl"),
              }}
            >
              <Text as="p" tone="subdued">{i18n.translate("RecommendationsPage.welcome.body")}</Text>
            </CalloutCard>
          </Layout.Section>
          <Layout.Section>
            <Box borderBlockStartWidth="025" borderColor="border" paddingBlockStart="400">
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">{i18n.translate("RecommendationsPage.theme.title")}</Text>
                <Text as="p" variant="bodyMd">
                  <Text as="span" tone="subdued">
                    {i18n.translate("RecommendationsPage.theme.description")}
                  </Text>
                  <ExternalLink text={i18n.translate("RecommendationsPage.theme.reference.primaryAction")} url={i18n.translate("RecommendationsPage.theme.reference.primaryActionUrl")} />.
                </Text>
                <Card>
                  <BlockStack gap="400">
                    <Text as="p" variant="bodyMd" tone="subdued">
                      {i18n.translate("RecommendationsPage.theme.primaryAction.description")}
                    </Text>
                    <WidgetActions shopUrl={shopUrl} extensionId={extensionId!} themeId={workingTheme} />
                  </BlockStack>
                </Card>
              </BlockStack>
            </Box>
          </Layout.Section>
          <Layout.Section>
            <Box borderBlockStartWidth="025" borderColor="border" paddingBlockStart="400">
              <RecommendationsForm {...recommendations} />
            </Box>
          </Layout.Section>
          <Layout.Section>
            <Box borderBlockStartWidth="025" borderColor="border" paddingBlockStart="400">
              <BlockStack gap="200">
                <Text as="h2" variant="headingMd">{i18n.translate("RecommendationsPage.template.title")}</Text>
                <Text as="p" variant="bodyMd" tone="subdued">{i18n.translate("RecommendationsPage.template.description")}</Text>
              </BlockStack>
              <TemplateForm
                shopUrl={shopUrl}
                template="recommendations"
                templateValue={template.value}
                templateVersion={template.version}
                markets={markets as any} />
            </Box>
          </Layout.Section>
        </Layout>
      </Page>
    </PageWrapper>
  );
}

interface WidgetActionsProps {
  shopUrl: string;
  extensionId: string;
  themeId?: string | null;
}

function WidgetActions({ shopUrl, themeId, extensionId }: WidgetActionsProps) {
  const [popoverActive, setPopoverActive] = useState(false);
  const [i18n] = useI18n({
    id: "RecommendationsPage",
    translations: {
      en,
    },
  });

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    [],
  );

  const widgets = useMemo<ActionListItemProps[]>(() => {
    return widgetTypes.map((widgetType) => ({
      content: i18n.translate(`RecommendationsPage.widgets.${widgetType}.displayName`),
      onAction: () => window.open(generateDeeplinkingUrl(false, shopUrl, extensionId, `bloomreach-recommendations-${widgetType}`, themeId, "index", "newAppsSection"), "_blank"),
    }));
  }, [extensionId, i18n, shopUrl, themeId]);

  const activator = (
    <Button onClick={togglePopoverActive} disclosure variant="primary">
      {i18n.translate("RecommendationsPage.theme.primaryAction.label")}
    </Button>
  );

  return (
    <div>
      <Popover
        active={popoverActive}
        activator={activator}
        autofocusTarget="first-node"
        onClose={togglePopoverActive}
      >
        <ActionList
          actionRole="menuitem"
          items={widgets}
        />
      </Popover>
    </div>
  );
}
