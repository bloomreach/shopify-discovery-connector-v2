import { useEffect, type FormEvent } from "react";
import { useFetcher } from "@remix-run/react";
import { Button, Card, Form, FormLayout, InlineGrid, InlineStack, Select, TextField, Text, BlockStack } from "@shopify/polaris";
import { notEmpty, propagateErrors, useField, validateAll, getValues, useReset, useDirty } from "@shopify/react-form";
import { useI18n } from "@shopify/react-i18n";
import * as predicates from '@shopify/predicates';
import { ConsoleLogger } from "../ConsoleLogger";
import { defaults } from "~/models";
import en from "./en.json";

import type { Recommendations, SettingsAction } from "~/types/store";

export default function RecommendationsForm(props: Recommendations) {
  ConsoleLogger("log: RecommendationsForm: render");
  ConsoleLogger("log: RecommendationsForm: props: ", props);
  const [i18n] = useI18n({
    id: "RecommendationsForm",
    translations: {
      en,
    },
  });
  const fetcher = useFetcher<ActionResponse>();
  const submitting = fetcher.state !== 'idle';
  const actionData = fetcher.data;
  ConsoleLogger("log: RecommendationsForm: actionData: ", actionData);
  useEffect(() => {
    if (!submitting) {
      if (actionData?.status === 'success') {
        shopify.toast.show(i18n.translate("RecommendationsForm.toaster.success"));
      } else if (actionData?.status === 'fail') {
        shopify.toast.show(i18n.translate("RecommendationsForm.toaster.error"));
      }
    }
  }, [actionData, i18n, submitting]);

  const endpointOptions = [
    {
      label: "Staging",
      value: "https://pathways-staging.dxpapi.com/api/v2/widgets/",
    },
    {
      label: "Production",
      value: "https://pathways.dxpapi.com/api/v2/widgets/",
    },
  ];

  const fields = {
    endpoint: useField(props.endpoint ?? defaults.recommendations.endpoint),
    fl_fields: useField({
      value: props.fl_fields ?? '',
      validates: [
        notEmpty(
          i18n.translate("RecommendationsForm.fields.flFields.validation")
        ),
      ],
    }),
    items_to_show: useField({
      value: props.items_to_show?.toString() ?? '',
      validates: (value: string) => {
        if (!predicates.isPositiveIntegerString(value) || Number(value) < 4 || Number(value) > 12) {
          return i18n.translate("RecommendationsForm.fields.itemsToShow.validation")
       }
      }
    }),
    items_to_fetch: useField({
      value: props.items_to_fetch?.toString() ?? '',
      validates: (value: string) => {
        if (!predicates.isPositiveIntegerString(value) || Number(value) < 4 || Number(value) > 32) {
          return i18n.translate("RecommendationsForm.fields.itemsToFetch.validation")
       }
      }
    }),
    additional_parameters: useField(props.additional_parameters ?? ''),
  };
  const reset = useReset(fields);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const isDirty = useDirty(fields);

  const doSubmit = (event: FormEvent) => {
    event.preventDefault();
    const formErrors = validateAll(fields);
    if (formErrors.length > 0) {
      propagateErrors(fields, formErrors);
      return false;
    }
    const data: SettingsAction = {
      _action: "saveSettings",
      recommendations: {...getValues(fields)},
    };
    fetcher.submit(data, { method: "post", encType: "application/json" });
  };

  const doReset = () => {
    reset();
  };

  return (
    <BlockStack gap="200">
      <Text as="h2" variant="headingMd">{i18n.translate("RecommendationsForm.title")}</Text>
      <Text as="p" variant="bodyMd" tone="subdued">{i18n.translate("RecommendationsForm.description")}</Text>
      <Card>
        <Form onSubmit={doSubmit}>
          <FormLayout>
            <InlineGrid columns={['oneThird', 'twoThirds']}>
              <Text as="p" fontWeight="semibold">
                {i18n.translate("RecommendationsForm.fields.endpoint.title")}
              </Text>
              <Select
                label="Endpoint"
                labelHidden
                options={endpointOptions}
                helpText={i18n.translate("RecommendationsForm.fields.endpoint.description")}
                {...fields.endpoint}
              />
            </InlineGrid>
            <InlineGrid columns={['oneThird', 'twoThirds']}>
              <Text as="p" fontWeight="semibold">
                {i18n.translate("RecommendationsForm.fields.flFields.title")}
              </Text>
              <TextField
                label="Fields"
                labelHidden
                autoComplete="off"
                helpText={i18n.translate("RecommendationsForm.fields.flFields.description")}
                {...fields.fl_fields}
              />
            </InlineGrid>
            <InlineGrid columns={['oneThird', 'twoThirds']}>
              <Text as="p" fontWeight="semibold">
                {i18n.translate("RecommendationsForm.fields.itemsToShow.title")}
              </Text>
              <div className="Bloomreach-Annotated-form__condensed-input-max">
                <TextField
                  label="Items to Show"
                  labelHidden
                  type="number"
                  autoComplete="off"
                  min={4}
                  max={12}
                  {...fields.items_to_show}
                />
              </div>
            </InlineGrid>
            <InlineGrid columns={['oneThird', 'twoThirds']}>
              <Text as="p" fontWeight="semibold">
                {i18n.translate("RecommendationsForm.fields.itemsToFetch.title")}
              </Text>
              <div className="Bloomreach-Annotated-form__condensed-input-max">
                <TextField
                  label="Items to Fetch"
                  labelHidden
                  type="number"
                  autoComplete="off"
                  min={4}
                  max={32}
                  {...fields.items_to_fetch}
                />
              </div>
            </InlineGrid>
            <InlineGrid columns={['oneThird', 'twoThirds']}>
              <Text as="p" fontWeight="semibold">
                {i18n.translate("RecommendationsForm.fields.additionalParameters.title")}
              </Text>
              <TextField
                label="Additional Parameters"
                labelHidden
                autoComplete="off"
                placeholder="name1=value1&name2=value2"
                helpText={i18n.translate("RecommendationsForm.fields.additionalParameters.description")}
                {...fields.additional_parameters}
              />
            </InlineGrid>
            <InlineStack align="end" gap="300">
              <Button variant="primary" submit loading={submitting} disabled={!isDirty}>
                {i18n.translate("RecommendationsForm.primaryAction")}
              </Button>
              <Button variant="secondary" loading={submitting} disabled={!isDirty} onClick={doReset}>
                {i18n.translate("RecommendationsForm.reset")}
              </Button>
            </InlineStack>
          </FormLayout>
        </Form>
      </Card>
    </BlockStack>
  );
}
