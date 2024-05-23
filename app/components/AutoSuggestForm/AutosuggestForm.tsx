import { type FormEvent, useState } from "react";
import { useActionData, useFetcher } from "@remix-run/react";
import { useField, validateAll, propagateErrors, getValues } from "@shopify/react-form";
import {
  Card,
  InlineStack,
  BlockStack,
  Button,
  ButtonGroup,
  Text,
  Form,
  FormLayout,
  TextField,
  Box,
  Link,
  Bleed,
  InlineGrid,
  Scrollable,
} from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
// import AutosuggestToggle from "components/AutosuggestToggle";
import { HtmlBlock } from "../HtmlBlock";
import en from "./en.json";

interface AutosuggestProps {
  autosuggest_enabled?: boolean;
  autosuggest_css_selector?: string | null;
  autosuggest_number_of_terms?: number | null;
  autosuggest_number_of_products?: number | null;
  autosuggest_number_of_collections?: number | null;
  autosuggest_custom_css?: string | null;
  autosuggest_template?: string | null;
}

export default function AutosuggestForm(props: AutosuggestProps) {
  console.log("log: AutosuggestForm: render");
  console.log("log: AutosuggestForm: props: ", props);
  const [i18n] = useI18n({
    id: "AutosuggestForm",
    translations: {
      en,
    },
  });
  const [showSettings, setShowSettings] = useState(false);
  const fetcher = useFetcher();
  const submitting = fetcher.state !== 'idle';
  const fields = {
    autosuggest_css_selector: useField(props.autosuggest_css_selector ?? ''),
    autosuggest_number_of_terms: useField(props.autosuggest_number_of_terms?.toString() ?? ''),
    autosuggest_number_of_products: useField(props.autosuggest_number_of_products?.toString() ?? '12'),
    autosuggest_number_of_collections: useField(props.autosuggest_number_of_collections?.toString() ?? ''),
    autosuggest_custom_css: useField(props.autosuggest_custom_css ?? ''),
    autosuggest_template: useField(decodeURIComponent(props.autosuggest_template ?? '')),
  };
  const actionData = useActionData<ActionResponse>();
  if (actionData?.status === 'success') {
    shopify.toast.show(i18n.translate("AutosuggestForm.toaster.success"));
  } else if (actionData?.status === 'fail') {
    shopify.toast.show(i18n.translate("AutosuggestForm.toaster.error"));
  }
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const formErrors = validateAll(fields);
    if (formErrors.length > 0) {
      propagateErrors(fields, formErrors);
      return false;
    }
    const data = { ...props, ...getValues(fields), form: 'Autosuggest' };
    fetcher.submit(data, { method: "post" });
  }

  return (
    <Form onSubmit={submit}>
      <Card>
        <Text as="h2" variant="headingMd">
          {i18n.translate("AutosuggestForm.title")}
        </Text>
        <Box paddingBlock="400">
          <HtmlBlock content={i18n.translate("AutosuggestForm.description")} />
        </Box>

        <Bleed marginBlockEnd="400" marginInline="400">
        {showSettings ? (
          <Box borderColor="border" borderWidth="025" background="bg-surface-secondary" padding="400">
            <BlockStack gap="400">
              <Text as="h3" variant="headingSm">
                {i18n.translate("AutosuggestForm.formTitle")}
              </Text>
              <FormLayout>
                <div className="Bloomreach-Annotated-form">
                  <InlineGrid columns={['oneThird', 'twoThirds']}>
                    <Text as="span" fontWeight="semibold">
                      {i18n.translate("AutosuggestForm.fields.cssSelector.title")}
                    </Text>
                    <TextField
                      label="CSS Selector"
                      labelHidden
                      autoComplete="off"
                      {...fields.autosuggest_css_selector}
                    />
                  </InlineGrid>
                </div>
                <div className="Bloomreach-Annotated-form Bloomreach-Annotated-form--condensed">
                  <InlineGrid columns={['oneThird', 'twoThirds']}>
                    <Text as="span" fontWeight="semibold">
                      {i18n.translate(
                        "AutosuggestForm.fields.numberOfTerms.title"
                      )}
                    </Text>
                    <div className="Bloomreach-Annotated-form__condensed-input-max">
                      <TextField
                        label="Number of Terms"
                        labelHidden
                        autoComplete="off"
                        type="number"
                        min="1"
                        max="10"
                        {...fields.autosuggest_number_of_terms}
                      />
                    </div>
                  </InlineGrid>
                </div>
                <div className="Bloomreach-Annotated-form Bloomreach-Annotated-form--condensed">
                  <InlineGrid columns={['oneThird', 'twoThirds']}>
                    <Text as="span" fontWeight="semibold">
                      {i18n.translate(
                        "AutosuggestForm.fields.numberOfProducts.title"
                      )}
                    </Text>
                    <div className="Bloomreach-Annotated-form__condensed-input-max">
                      <TextField
                        label="Number of Products"
                        labelHidden
                        autoComplete="off"
                        type="number"
                        min="1"
                        max="20"
                        {...fields.autosuggest_number_of_products}
                      />
                    </div>
                  </InlineGrid>
                </div>
                <div className="Bloomreach-Annotated-form Bloomreach-Annotated-form--condensed">
                  <InlineGrid columns={['oneThird', 'twoThirds']}>
                    <Text as="span" fontWeight="semibold">
                      {i18n.translate(
                        "AutosuggestForm.fields.numberOfCollections.title"
                      )}
                    </Text>
                    <div className="Bloomreach-Annotated-form__condensed-input-max">
                      <TextField
                        label="Number of Collections"
                        labelHidden
                        autoComplete="off"
                        type="number"
                        min="1"
                        max="20"
                        {...fields.autosuggest_number_of_collections}
                      />
                    </div>
                  </InlineGrid>
                </div>
                <div className="Bloomreach-Annotated-form Bloomreach-Annotated-form--condensed">
                  <InlineGrid columns={['oneThird', 'twoThirds']}>
                    <Text as="span" fontWeight="semibold">
                      {i18n.translate("AutosuggestForm.fields.customCss.title")}
                    </Text>
                    <div>
                      <Scrollable style={{ maxHeight: "250px" }}>
                        <TextField
                          label="Custom CSS"
                          labelHidden
                          autoComplete="off"
                          multiline={4}
                          {...fields.autosuggest_custom_css}
                        />
                      </Scrollable>
                    </div>
                  </InlineGrid>
                </div>
                <div className="Bloomreach-Annotated-form Bloomreach-Annotated-form--condensed">
                  <InlineGrid columns={['oneThird', 'twoThirds']}>
                    <Text as="span" fontWeight="semibold">
                      {i18n.translate("AutosuggestForm.fields.template.title")}
                    </Text>
                    <div>
                      <Scrollable style={{ maxHeight: "250px" }}>
                        <TextField
                          label="Template"
                          labelHidden
                          autoComplete="off"
                          multiline={4}
                          {...fields.autosuggest_template}
                        />
                      </Scrollable>
                    </div>
                  </InlineGrid>
                </div>
                <div className="Bloomreach-Annotated-form Bloomreach-Annotated-form--condensed">
                  <InlineGrid columns={['oneThird', 'twoThirds']}>
                    <Text as="span" fontWeight="semibold">
                      {i18n.translate("AutosuggestForm.fields.reference.title")}
                    </Text>
                    <div>
                      <BlockStack gap="400">
                        <HtmlBlock
                          content={i18n.translate(
                            "AutosuggestForm.fields.reference.body"
                          )}
                        />
                        <Link
                          url={i18n.translate("AutosuggestForm.fields.reference.primaryActionUrl")}
                          target="_blank"
                        >
                          {i18n.translate("AutosuggestForm.fields.reference.primaryAction")}
                        </Link>
                      </BlockStack>
                    </div>
                  </InlineGrid>
                </div>
              </FormLayout>
            </BlockStack>
          </Box>
        ) : null}
          <Box borderColor="border" borderWidth="025" background="bg-surface-secondary" padding="400">
            <InlineStack align="end">
              {showSettings ? (
                <ButtonGroup>
                  <Button onClick={() => setShowSettings(false)}>
                    {i18n.translate("AutosuggestForm.hideSettingsAction")}
                  </Button>
                  {submitting ? (
                    <Button submit variant="primary" loading>
                      {i18n.translate("AutosuggestForm.updateSettingsAction")}
                    </Button>
                  ) : (
                    <Button submit variant="primary">
                      {i18n.translate("AutosuggestForm.updateSettingsAction")}
                    </Button>
                  )}
                </ButtonGroup>
              ) : (
                <Button variant="primary" onClick={() => setShowSettings(true)}>
                  {i18n.translate("AutosuggestForm.showSettingsAction")}
                </Button>
              )}
            </InlineStack>
          </Box>
        </Bleed>
      </Card>
    </Form>
  );
}
