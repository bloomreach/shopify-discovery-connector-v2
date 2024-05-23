import { Fragment } from "react";
import { Link } from "@remix-run/react";
import { useI18n } from "@shopify/react-i18n";
import { Card, Text, BlockStack, Divider, Badge, InlineStack, Box } from "@shopify/polaris";
import { ConsoleLogger } from "../ConsoleLogger";

import en from "./en.json";

import type { Theme } from "node_modules/@shopify/shopify-api/rest/admin/2024-01/theme";

interface ThemeEditProps {
  themes?: Theme[];
  shopUrl: string;
  extensionId: string;
  handle: string;
  template?: string;
}

export default function ThemeEditForm({ themes, shopUrl, extensionId, handle, template }: ThemeEditProps) {
  ConsoleLogger("log: ThemeEditForm: render");
  ConsoleLogger("log: ThemeEditForm: themes: ", themes);
  const [i18n] = useI18n({
    id: "ThemeEditForm",
    translations: {
      en,
    },
  });
  return (
    <Card padding="500">
      <Text as="h2" variant="headingMd">
        {i18n.translate("ThemeEditForm.title")}
      </Text>
      <Box paddingBlock="400">
        <BlockStack gap="300">
          <Divider borderColor="border" />
          {themes && themes.filter((theme) => theme.role === 'main' || theme.role === 'unpublished').map((theme) => (
            <Fragment key={theme.id!}>
              <InlineStack gap="200">
                <Link to={`https://${shopUrl}/admin/themes/${theme.id}/editor?context=apps${template ? '&template=' + template : ''}&activateAppId=${extensionId}/${handle}`} target="_blank">
                  {theme.name}
                </Link>
                {theme.role === 'main' && <Badge tone="success">Current theme</Badge>}
              </InlineStack>
              <Divider borderColor="border" />
            </Fragment>
          ))}
        </BlockStack>
      </Box>
    </Card>
  );
}
