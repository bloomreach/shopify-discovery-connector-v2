import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { Bleed, BlockStack, Box, Card, InlineStack, Spinner, Text } from "@shopify/polaris";
import Toggle from "react-toggle";
import { useI18n } from "@shopify/react-i18n";
import { useChoiceField } from "@shopify/react-form";
import { ConsoleLogger } from "../ConsoleLogger";
import { ExternalLink } from "../ExternalLink";

import en from "./en.json";

interface MultiCurrencyToggleProps {
  multicurrency_enabled?: boolean;
}

export default function MultiCurrencyToggle(props: MultiCurrencyToggleProps) {
  ConsoleLogger("log: MultiCurrencyToggle: render");
  ConsoleLogger("log: MultiCurrencyToggle: props: ", props);
  const [i18n] = useI18n({
    id: "MultiCurrencyToggle",
    translations: {
      en,
    },
  });

  const fetcher = useFetcher<ActionResponse>();
  const isLoading = fetcher.state !== 'idle';
  const actionData = fetcher.data;
  ConsoleLogger("log: MultiCurrencyToggle: actionData: ", actionData);
  useEffect(() => {
    if (!isLoading) {
      if (actionData?.status === 'success') {
        shopify.toast.show(i18n.translate("MultiCurrencyToggle.toaster.success"));
      } else if (actionData?.status === 'fail') {
        shopify.toast.show(i18n.translate("MultiCurrencyToggle.toaster.error"));
      }
    }
  }, [actionData, i18n, isLoading]);

  const multicurrencyEnabled = useChoiceField(props.multicurrency_enabled ?? false);

  const handleToggleChange = () => {
    const data = { account: { multicurrency_enabled: !multicurrencyEnabled.checked } };
    ConsoleLogger("log: MultiCurrencyToggle: handleToggleChange: multicurrency_enabled: ", data);
    fetcher.submit(data, { method: "post", encType: "application/json" });
  }

  return (
    <Card>
      <BlockStack gap="400">
        <Text as="p" tone="subdued">{i18n.translate("MultiCurrencyToggle.description")}</Text>
        <Bleed marginInline="400">
          <Box borderColor="border" borderBlockStartWidth="025" borderBlockEndWidth="025" padding="400">
            <InlineStack align="start" blockAlign="center" gap="400">
              <Toggle
                checked={multicurrencyEnabled.checked}
                icons={false}
                disabled={isLoading}
                onChange={handleToggleChange}
              />
              <Text as="span">
                {i18n.translate("MultiCurrencyToggle.label")}
                {multicurrencyEnabled.checked
                  ? i18n.translate("MultiCurrencyToggle.enabled")
                  : i18n.translate("MultiCurrencyToggle.disabled")}
              </Text>
              {isLoading && (
                <Spinner
                  accessibilityLabel={i18n.translate(
                    "MultiCurrencyToggle.loading"
                  )}
                  size="small"
                />
              )}
            </InlineStack>
          </Box>
        </Bleed>
        <div>
          <ExternalLink
            url={i18n.translate("MultiCurrencyToggle.primaryActionUrl")}
            text={i18n.translate("MultiCurrencyToggle.primaryAction")}
            variant="primary"
          />
        </div>
      </BlockStack>
    </Card>
  );
}
