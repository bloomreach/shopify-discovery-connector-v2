import { Fragment, useCallback, useMemo, useState } from "react";
import { useLoaderData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
import { ActionList, type ActionListItemProps, Badge, BlockStack, Box, Button, CalloutCard, Card, Divider, InlineStack, Layout, Page, Popover, Text } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { PageWrapper, TemplateForm, LoadingPage, RecommendationsForm } from "~/components";
import { getStore, updateStore, getThemes, getTemplate, setDefaultTemplates, runTemplateUpdate, updateTemplate, getRecommendationsSettings, updateRecommendationsSettings } from "~/services";
import { authenticate, extensionId } from "../../shopify.server";

import en from "./en.json";

import type { ActionFunctionArgs, LoaderFunctionArgs, TypedResponse } from "@remix-run/node";
import type { Theme } from "node_modules/@shopify/shopify-api/rest/admin/2024-01/theme";

const widgetTypes = ["category", "keyword", "item", "personalized", "global"];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  console.log("log: RecommendationsPage: loader");
  const shopUrl = session.shop;
  const store = await getStore(shopUrl);
  const themes = await getThemes(admin, session);
  const recommendations = await getRecommendationsSettings(admin);
  const template = await getTemplate(admin, "recommendations");
  await setDefaultTemplates(admin, shopUrl);
  console.log("log: RecommendationsPage: loader: getStoreResponse: ", store);
  console.log("log: RecommendationsPage: loader: themes: ", themes);
  return json({ store, themes, shopUrl, template, extensionId, recommendations });
};

export const action = async ({ request }: ActionFunctionArgs): Promise<TypedResponse<ActionResponse>> => {
  const { session, admin } = await authenticate.admin(request);
  console.log("log: RecommendationsPage: action");
  const shopUrl = session.shop;

  /** @type {any} */
  const data: any = {...Object.fromEntries(await request.formData())};
  const { _action, template, templateValue, templateVersion, updateVersion, recommendations } = data;

  try {
    if (_action === 'updateRecommendations') {
      console.log("log: RecommendationsPage: action: updateRecommendations");
      await updateRecommendationsSettings(admin, JSON.parse(recommendations));
    } else if (_action === 'autoUpdateTemplate') {
      console.log("log: RecommendationsPage: action: autoUpdateTemplate");
      await runTemplateUpdate(shopUrl, admin, template);
    } else {
      if (updateVersion) {
        console.log("log: RecommendationsPage: action: updateTemplateVersion");
        await updateStore(shopUrl, { [`${template}_template_version`]: templateVersion });
      }
      console.log("log: RecommendationsPage: action: save template");
      await updateTemplate(admin, template, templateValue);
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
  const { store, themes, shopUrl, extensionId, template, recommendations } = useLoaderData<typeof loader>();
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
          <Layout.AnnotatedSection
            title={i18n.translate("RecommendationsPage.theme.title")}
            description={i18n.translate("RecommendationsPage.theme.description")}
          >
            <Card padding="500">
              <Text as="h2" variant="headingMd">
                {i18n.translate("RecommendationsPage.theme.editForm.title")}
              </Text>
              <Box paddingBlock="400">
                <BlockStack gap="300">
                  <Divider borderColor="border" />
                  {themes && (themes as Theme[]).filter((theme) => theme.role === 'main' || theme.role === 'unpublished').map((theme) => (
                    <Fragment key={theme.id!}>
                      <InlineStack align="space-between">
                        <div>
                          <Text as="span">{theme.name}</Text>&nbsp;&nbsp;
                          {theme.role === 'main' && <Badge tone="success">Current theme</Badge>}
                        </div>
                        <WidgetActions shopUrl={shopUrl} extensionId={extensionId!} theme={theme} />
                      </InlineStack>
                      <Divider borderColor="border" />
                    </Fragment>
                  ))}
                </BlockStack>
              </Box>
            </Card>
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title={i18n.translate("RecommendationsPage.recommendations.title")}
            description={i18n.translate("RecommendationsPage.recommendations.description")}
          >
            <RecommendationsForm {...recommendations} />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title={i18n.translate("RecommendationsPage.template.title")}
            description={i18n.translate("RecommendationsPage.template.description")}
          >
            <TemplateForm
              shopUrl={shopUrl}
              template="recommendations"
              templateValue={template}
              templateVersion={store?.recommendations_template_version} />
          </Layout.AnnotatedSection>
        </Layout>
      </Page>
    </PageWrapper>
  );
}

interface WidgetActionsProps {
  shopUrl: string;
  theme: Theme;
  extensionId: string;
}

function WidgetActions({ shopUrl, theme, extensionId }: WidgetActionsProps) {
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
      onAction: () => window.open(`https://${shopUrl}/admin/themes/${theme.id}/editor?addAppBlockId=${extensionId}/bloomreach-recommendations-${widgetType}&target=newAppsSection`, "_blank"),
    }));
  }, [extensionId, i18n, shopUrl, theme.id]);

  const activator = (
    <Button onClick={togglePopoverActive} disclosure>
      {i18n.translate("RecommendationsPage.theme.editForm.action")}
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
