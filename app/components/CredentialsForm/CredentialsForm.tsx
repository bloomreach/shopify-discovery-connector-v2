import { useEffect, type FormEvent } from "react";
import { useFetcher } from "@remix-run/react";
import { Button, Card, Form, FormLayout, InlineStack, TextField } from "@shopify/polaris";
import { notEmpty, propagateErrors, useField, validateAll, getValues, useReset, useDirty } from "@shopify/react-form";
import { useI18n } from "@shopify/react-i18n";

import { ConsoleLogger } from "../ConsoleLogger";
import en from "./en.json";
import type { Account } from "~/types/store";

export default function CredentialsForm(props: Account) {
  ConsoleLogger("log: CredentialsForm: render");
  ConsoleLogger("log: CredentialsForm: props: ", props);
  const [i18n] = useI18n({
    id: "CredentialsForm",
    translations: {
      en,
    },
  });
  const fetcher = useFetcher<ActionResponse>();
  const submitting = fetcher.state !== 'idle';
  const actionData = fetcher.data;
  ConsoleLogger("log: CredentialsForm: actionData: ", actionData);

  useEffect(() => {
    if (!submitting) {
      if (actionData?.status === 'success') {
        shopify.toast.show(i18n.translate("CredentialsForm.toaster.success"));
      } else if (actionData?.status === 'fail') {
        shopify.toast.show(i18n.translate("CredentialsForm.toaster.error"));
      }
    }
  }, [actionData, i18n, submitting]);

  const fields = {
    account_id: useField({
      value: props.account_id ?? '',
      validates: [
        notEmpty(
          i18n.translate("CredentialsForm.fields.accountID.validation")
        ),
      ],
    }),
    domain_key: useField({
      value: props.domain_key ?? '',
      validates: [
        notEmpty(
          i18n.translate("CredentialsForm.fields.domainKey.validation")
        ),
      ],
    }),
    auth_key: useField({
      value: props.auth_key ?? '',
      validates: [
        notEmpty(i18n.translate("CredentialsForm.fields.authKey.validation")),
      ],
    }),
    search_page_url: useField({
      value: props.search_page_url ?? '',
      validates: [
        notEmpty(
          i18n.translate("CredentialsForm.fields.searchPageUrl.validation")
        ),
      ],
    }),
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
    const data = { account: getValues(fields) };
    fetcher.submit(data, { method: "post", encType: "application/json" });
  }

  return (
    <Card>
      <Form onSubmit={submit}>
        <FormLayout>
          <div>
            <TextField
              label={i18n.translate("CredentialsForm.fields.accountID.title")}
              autoComplete="off"
              {...fields.account_id}
            />
          </div>
          <div>
            <TextField
              type="password"
              label={i18n.translate("CredentialsForm.fields.authKey.title")}
              autoComplete="off"
              {...fields.auth_key}
            />
          </div>
          <div>
            <TextField
              label={i18n.translate(
                "CredentialsForm.fields.searchPageUrl.title"
              )}
              autoComplete="off"
              {...fields.search_page_url}
            />
          </div>
          <div>
            <InlineStack align="end" gap="300">
              <Button variant="primary" submit loading={submitting} disabled={!isDirty}>
                {i18n.translate("CredentialsForm.primaryAction")}
              </Button>
              <Button variant="secondary" loading={submitting} onClick={reset} disabled={!isDirty}>
                {i18n.translate("CredentialsForm.reset")}
              </Button>
            </InlineStack>
          </div>
        </FormLayout>
      </Form>
    </Card>
  );
}
