import { useEffect, useMemo } from "react";
import { useFetcher } from "@remix-run/react";
import { Button, Card, Form, FormLayout, InlineStack, Select } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { useField } from "@shopify/react-form";
import { ConsoleLogger } from "../ConsoleLogger";
import en from "./en.json";

import type { FormEvent } from "react";
import type { Theme } from "node_modules/@shopify/shopify-api/dist/ts/rest/admin/2024-04/theme";

interface ThemeChoiceFormProps {
  themes: Theme[];
  workingTheme?: string | null;
}

export default function ThemeChoiceForm(props: ThemeChoiceFormProps) {
  ConsoleLogger("log: ThemeChoiceForm: render");
  ConsoleLogger("log: ThemeChoiceForm: props: ", props);
  const [i18n] = useI18n({
    id: "ThemeChoiceForm",
    translations: {
      en,
    },
  });

  const fetcher = useFetcher<ActionResponse>();
  const isLoading = fetcher.state !== 'idle';
  const actionData = fetcher.data;
  ConsoleLogger("log: ThemeChoiceForm: actionData: ", actionData);
  useEffect(() => {
    if (!isLoading) {
      if (actionData?.status === 'success') {
        shopify.toast.show(i18n.translate("ThemeChoiceForm.toaster.success"));
      } else if (actionData?.status === 'fail') {
        shopify.toast.show(i18n.translate("ThemeChoiceForm.toaster.error"));
      }
    }
  }, [actionData, i18n, isLoading]);

  const selectedTheme = useField(props.workingTheme ?? props.themes.find((theme) => theme.role === 'main')?.id?.toString() ?? '');

  const themeOptions = useMemo(() => props.themes.filter((theme) => theme.role === 'main' || theme.role === 'unpublished').map(theme => ({
    label: theme.role === 'main' ? `${theme.name} (Current theme)` : theme.name!,
    value: theme.id?.toString() ?? '',
  })) ?? [], [props.themes]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const data = { store: { working_theme: selectedTheme.value } };
    fetcher.submit(data, { method: "post", encType: "application/json" });
  };

  return (
    <Card>
      <Form onSubmit={submit}>
        <FormLayout>
          <Select
            label={i18n.translate("ThemeChoiceForm.themeSelector.label")}
            options={themeOptions}
            {...selectedTheme}
          />
          <InlineStack align="end" gap="300">
            <Button variant="primary" submit loading={isLoading} disabled={!selectedTheme.dirty}>
              {i18n.translate("ThemeChoiceForm.primaryAction")}
            </Button>
          </InlineStack>
        </FormLayout>
      </Form>
    </Card>
  );
}
