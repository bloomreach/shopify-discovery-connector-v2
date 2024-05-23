import { useEffect, type FormEvent } from "react";
import { useFetcher } from "@remix-run/react";
import { Button, Card, Form, FormLayout, InlineStack, Select, TextField } from "@shopify/polaris";
import { notEmpty, propagateErrors, useField, validateAll, getValues } from "@shopify/react-form";
import { useI18n } from "@shopify/react-i18n";
import { ConsoleLogger } from "../ConsoleLogger";
import en from "./en.json";

import type { Recommendations } from "~/types/store";

const DEFAULT_WIDGET_FIELDS = "pid,price,sale_price,title,thumb_image,url";

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
    endpoint: useField(props.endpoint || endpointOptions[0].value),
    fl_fields: useField({
      value: props.fl_fields || DEFAULT_WIDGET_FIELDS,
      validates: [
        notEmpty(
          i18n.translate("RecommendationsForm.fields.flFields.validation")
        ),
      ],
    }),
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const formErrors = validateAll(fields);
    if (formErrors.length > 0) {
      propagateErrors(fields, formErrors);
      return false;
    }
    const recommendations = { ...props, ...getValues(fields) };
    fetcher.submit({ recommendations: JSON.stringify(recommendations), _action: "updateRecommendations" }, { method: "post" });
  }

  return (
    <Card>
      <Form onSubmit={submit}>
        <FormLayout>
          <div>
            <Select
              label={i18n.translate("RecommendationsForm.fields.endpoint.title")}
              options={endpointOptions}
              {...fields.endpoint}
            />
          </div>
          <div>
            <TextField
              label={i18n.translate("RecommendationsForm.fields.flFields.title")}
              autoComplete="off"
              {...fields.fl_fields}
            />
          </div>
          <div>
            <InlineStack align="end">
              <Button variant="primary" submit loading={submitting}>
                {i18n.translate("RecommendationsForm.primaryAction")}
              </Button>
            </InlineStack>
          </div>
        </FormLayout>
      </Form>
    </Card>
  );
}
