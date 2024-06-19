import { useLoaderData, useNavigation } from "@remix-run/react";
import { json } from "@remix-run/node";
import { BlockStack, Card, Layout, List, Page, Text, TextField } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { PageWrapper, ThemeEditForm, HtmlBlock, LoadingPage, ExternalLink } from "~/components";
import { getThemes, getAccount } from "~/services";
import { authenticate, extensionId } from "../../shopify.server";

import en from "./en.json";

import type { LoaderFunctionArgs } from "@remix-run/node";
import type { Theme } from "node_modules/@shopify/shopify-api/dist/ts/rest/admin/2024-04/theme";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  console.log("log: PixelPage: loader");
  const shopUrl = session.shop;
  const themes = await getThemes(admin, session);
  const account = await getAccount(admin);
  console.log("log: PixelPage: loader: themes: ", themes);
  return json({ themes, shopUrl, extensionId, account });
};

export default function PixelPage() {
  console.log("log: PixelPage: render");
  const { themes, shopUrl, extensionId, account } = useLoaderData<typeof loader>();
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
          <Layout.AnnotatedSection
            title={i18n.translate("PixelPage.theme.title")}
            description={i18n.translate("PixelPage.theme.description")}
          >
            <ThemeEditForm
              themes={themes as Theme[]}
              shopUrl={shopUrl}
              extensionId={extensionId!}
              handle="bloomreach-pixel-config" />
          </Layout.AnnotatedSection>
          <Layout.AnnotatedSection
            title={i18n.translate("PixelPage.conversion.title")}
            description={i18n.translate("PixelPage.conversion.description")}
          >
            <Card>
              <BlockStack gap="400">
                <Text as="p" tone="subdued">
                  {i18n.translate("PixelPage.conversion.content.description")}
                </Text>
                <List>
                  <List.Item><HtmlBlock content={i18n.translate("PixelPage.conversion.content.list1")}/></List.Item>
                  <List.Item><HtmlBlock content={i18n.translate("PixelPage.conversion.content.list2")}/></List.Item>
                  <List.Item><HtmlBlock content={i18n.translate("PixelPage.conversion.content.list3")}/></List.Item>
                </List>
                <TextField
                  readOnly
                  label={i18n.translate("PixelPage.conversion.content.label")}
                  labelHidden
                  autoComplete="off"
                  value={`<script type="text/javascript">
  var br_data = br_data || {};
  br_data.acct_id = "${account.account_id || "YOUR_ACCOUNT_ID"}";
  br_data.ptype = "conversion";
  br_data.title = "{{ page_title | escape }}";
  br_data.domain_key = "${account.domain_key || "YOUR_DOMAIN_KEY"}";
  br_data.user_id = "{{ customer.id }}";
  br_data.is_conversion = 1;
  br_data.basket_value = {{ checkout.subtotal_price | money_without_currency }};
  br_data.order_id = "{{ checkout.order_id }}";
  br_data.basket = {
    "items": [
      {% for line_item in checkout.line_items %}
        {
          "prod_id" : "{{ line_item.product.handle | escape }}",
          "sku": "{{ line_item.sku }}",
          "name": "{{ line_item.product.title | escape }}",
          "quantity": "{{ line_item.quantity }}",
          "price": "{{ line_item.original_price | money_without_currency }}"
        }
        {% unless forloop.last == true %}
        ,
        {% endunless %}
      {% endfor %}
    ]
  };
  (function() {
  var brtrk = document.createElement("script");
  brtrk.type = "text/javascript";
  brtrk.async = true;
  brtrk.src = "//cdn.brcdn.com/v1/br-trk-${account.account_id || "YOUR_ACCOUNT_ID"}.js";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(brtrk, s);
  })();
</script>`}
                  multiline={10}
                />
                <ExternalLink
                  url={i18n.translate("PixelPage.conversion.primaryActionUrl")}
                  text={i18n.translate("PixelPage.conversion.primaryAction")}
                />
              </BlockStack>
            </Card>
          </Layout.AnnotatedSection>
        </Layout>
      </Page>
    </PageWrapper>
  );
}
