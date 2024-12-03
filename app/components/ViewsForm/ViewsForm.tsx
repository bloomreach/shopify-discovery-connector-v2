import { useEffect, useMemo, Fragment, type FormEvent } from "react";
import { useFetcher } from "@remix-run/react";
import { BlockStack, Button, Card, Divider, Form, FormLayout, Grid, InlineStack, Scrollable, Text, TextField } from "@shopify/polaris";
import { propagateErrors, validateAll, getValues, useList, useReset, useDirty } from "@shopify/react-form";
import { useI18n } from "@shopify/react-i18n";
import { ConsoleLogger } from "../ConsoleLogger";
import { mergeViews, getViewMappingsFromMarkets } from "~/utils";

import en from "./en.json";

import type { MarketCatalogViewReturn } from "~/types/store";

interface ViewsFormProps {
  markets: MarketCatalogViewReturn[];
}

export default function ViewsForm({ markets }: ViewsFormProps) {
  ConsoleLogger("log: ViewsForm: render");
  ConsoleLogger("log: ViewsForm: props: ", { markets });
  const [i18n] = useI18n({
    id: "ViewIDsForm",
    translations: {
      en,
    },
  });
  const fetcher = useFetcher<ActionResponse>();
  const submitting = fetcher.state !== 'idle';
  const actionData = fetcher.data;
  ConsoleLogger("log: ViewsForm: actionData: ", actionData);

  useEffect(() => {
    if (!submitting) {
      if (actionData?.status === 'success') {
        shopify.toast.show(i18n.translate("ViewsForm.toaster.success"));
      } else if (actionData?.status === 'fail') {
        shopify.toast.show(i18n.translate("ViewsForm.toaster.error"));
      }
    }
  }, [actionData, i18n, submitting]);

  const viewMappings = useMemo(() => getViewMappingsFromMarkets(markets), [markets]);

  const fields = {
    viewIds: useList(viewMappings.map(mapping => ({ viewId: mapping.viewId ?? '' })) ?? []),
  };

  const reset = useReset(fields);

  const isDirty = useDirty(fields);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const formErrors = validateAll(fields);
    if (formErrors.length > 0) {
      propagateErrors(fields, formErrors);
      return false;
    }

    const viewIds = getValues(fields).viewIds.map<string>(value => value.viewId);
    const data = {
      viewMappings: mergeViews(viewMappings, viewIds) as Record<string, any>[],
    };
    fetcher.submit(data, { method: "post", encType: "application/json" });
  }

  return (
    <Card>
      <Form onSubmit={submit}>
        <FormLayout>
          <BlockStack gap="400">
            <Text as="p" variant="bodyMd">
              {i18n.translate("ViewsForm.fields.mappings.description")}
            </Text>
            <Divider borderColor="border" />
            <Grid columns={{lg: 6}}>
              <Grid.Cell columnSpan={{xs: 2}}>
                <Text variant="bodyMd" fontWeight="bold" as="span">{i18n.translate("ViewsForm.fields.mappings.market.title")}</Text>
              </Grid.Cell>
              <Grid.Cell columnSpan={{xs: 2}}>
                <Text variant="bodyMd" fontWeight="bold" as="span">{i18n.translate("ViewsForm.fields.mappings.country.title")}</Text>
              </Grid.Cell>
              <Grid.Cell columnSpan={{xs: 2}}>
                <Text variant="bodyMd" fontWeight="bold" as="span">{i18n.translate("ViewsForm.fields.mappings.viewId.title")}</Text>
              </Grid.Cell>
            </Grid>
            <Divider borderColor="border" />
            <Scrollable style={{maxHeight: "250px"}} horizontal={false} focusable scrollbarGutter="stable">
              <Grid columns={{lg: 6}}>
                {viewMappings.map((mapping, index) => (<Fragment key={index}>
                  <Grid.Cell columnSpan={{xs: 2}}>
                    <Text variant="bodyMd" as="p">{mapping.market}</Text>
                    {mapping.primary ? <Text variant="bodySm" as="p" tone="subdued">Primary</Text> : null}
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{xs: 2}}>
                    <Text variant="bodyMd" as="p">{mapping.countryName}</Text>
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{xs: 2}}>
                    <TextField
                      label="Bloomreach ViewID"
                      labelHidden
                      autoComplete="off"
                      {...fields.viewIds[index].viewId}
                    />
                  </Grid.Cell>
                </Fragment>))}
              </Grid>
            </Scrollable>
          </BlockStack>
          <InlineStack align="end" gap="300">
            <Button variant="primary" submit loading={submitting} disabled={!isDirty}>
              {i18n.translate("ViewsForm.primaryAction")}
            </Button>
            <Button variant="secondary" loading={submitting} onClick={reset} disabled={!isDirty}>
              {i18n.translate("ViewsForm.reset")}
            </Button>
          </InlineStack>
        </FormLayout>
      </Form>
    </Card>
  );
}
