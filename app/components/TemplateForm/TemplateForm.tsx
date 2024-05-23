import { useMemo, type FormEvent, useEffect } from "react";
import { useFetcher, Link } from "@remix-run/react";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import { Banner, BlockStack, Box, Button, Card, Checkbox, Form, FormLayout, InlineStack, List, Scrollable, Text, TextField } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { asChoiceField, getValues, propagateErrors, useField, validateAll } from "@shopify/react-form";
import { ConsoleLogger } from "../ConsoleLogger";
import packageJson from "../../../package.json";
import en from "./en.json";

interface TemplateFormProps {
  shopUrl: string;
  template: string;
  templateValue?: string;
  templateVersion?: string | null;
}

const { sdkVersion: newVersion } = packageJson;

export default function TemplateForm(props: TemplateFormProps) {
  ConsoleLogger("log: TemplateForm: render");
  ConsoleLogger("log: TemplateForm: props: ", props);
  const [i18n] = useI18n({
    id: "TemplateForm",
    translations: {
      en,
    },
  });

  const fields = {
    templateValue: useField(decodeURIComponent(props.templateValue ?? '')),
    updateVersion: useField(false),
    _action: useField('saveTemplate'),
  };

  const shouldShowUpdate = useMemo(() => {
    return !props.templateVersion || props.templateVersion < newVersion;
  }, [props.templateVersion]);

  const fetcher = useFetcher<ActionResponse>();
  const submitting = fetcher.state !== 'idle';
  const actionData = fetcher.data;
  ConsoleLogger("log: TemplateForm: actionData: ", actionData);
  useEffect(() => {
    if (!submitting) {
      if (actionData?.status === 'success') {
        shopify.toast.show(i18n.translate("TemplateForm.toaster.success"));
      } else if (actionData?.status === 'fail') {
        shopify.toast.show(i18n.translate("TemplateForm.toaster.error"));
      }
    }
  }, [actionData, i18n, submitting]);

  const modalId = `${props.template}-template-auto-update-modal`;

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const formErrors = validateAll(fields);
    if (formErrors.length > 0) {
      propagateErrors(fields, formErrors);
      return false;
    }

    const data = { ...props, ...getValues(fields) };
    if (fields.updateVersion) {
      data.templateVersion = newVersion;
    }
    fetcher.submit(data, { method: "post" });
  };

  const doPrimaryAction = () => {
    shopify.modal.hide(modalId);
    fetcher.submit({ ...props, _action: 'autoUpdateTemplate' }, { method: "post" });
  };

  return (<>
    <Form onSubmit={submit}>
      <Card>
        <FormLayout>
          <BlockStack gap="400">
            <Scrollable style={{ maxHeight: "250px" }}>
              <TextField
                label="Template"
                labelHidden
                autoComplete="off"
                multiline={4}
                loading={submitting}
                {...fields.templateValue}
              />
            </Scrollable>
            {shouldShowUpdate ? (
              <Banner
                tone="warning"
                title={i18n.translate("TemplateForm.updateBanner.title")}
              >
                <BlockStack gap="400">
                  <List>
                    <List.Item>{i18n.translate("TemplateForm.updateBanner.body1")}</List.Item>
                    <List.Item>{i18n.translate("TemplateForm.updateBanner.body2")}</List.Item>
                  </List>
                  <BlockStack gap="200">
                    <Text as="p" tone="subdued">{i18n.translate("TemplateForm.updateBanner.currentVersion")}: {props.templateVersion || "Not Set"}</Text>
                    <InlineStack gap="200" align="start">
                      <Text as="p" tone="subdued">{i18n.translate("TemplateForm.updateBanner.availableVersion")}: {newVersion}</Text>
                      <Link to={`/app/templates/${props.template}`} target="_blank" reloadDocument>{i18n.translate("TemplateForm.updateBanner.download")}</Link>
                    </InlineStack>
                  </BlockStack>
                  <div>
                    <Button onClick={() => shopify.modal.show(modalId)} loading={submitting} disabled={fields.updateVersion.value}>{i18n.translate("TemplateForm.updateBanner.primaryAction")}</Button>
                  </div>
                  <Checkbox
                    label={i18n.translate("TemplateForm.updateBanner.checkbox")}
                    {...asChoiceField(fields.updateVersion)}
                  />
                </BlockStack>
              </Banner>
            ) : (
              <Text as="p" tone="subdued">{i18n.translate("TemplateForm.templateVersion")}: {props.templateVersion}</Text>
            )}
            <InlineStack gap="500" align="end">
              <Button variant="primary" submit loading={submitting}>{i18n.translate("TemplateForm.primaryAction")}</Button>
            </InlineStack>
          </BlockStack>
        </FormLayout>
      </Card>
      <input type="hidden" name="_action" value={fields._action.value} />
    </Form>
    <Modal id={modalId}>
      <Box padding="400">
        <Text as="p">{i18n.translate("TemplateForm.updateBanner.warning.body")}</Text>
      </Box>
      <TitleBar title={i18n.translate("TemplateForm.updateBanner.warning.title")}>
        <button variant="primary" onClick={doPrimaryAction}>{i18n.translate("TemplateForm.updateBanner.warning.confirm.label")}</button>
        <button onClick={() => shopify.modal.hide(modalId)}>{i18n.translate("TemplateForm.updateBanner.warning.dismiss.label")}</button>
      </TitleBar>
    </Modal>
  </>);
}
