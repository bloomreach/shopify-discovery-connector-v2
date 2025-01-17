import { useEffect, useMemo, Fragment, type FormEvent } from "react";
import { useFetcher } from "@remix-run/react";
import { BlockStack, Button, Card, Checkbox, Collapsible, Divider, Form, FormLayout, Grid, InlineStack, Scrollable, Text, TextField } from "@shopify/polaris";
import { notEmpty, propagateErrors, useField, validateAll, getValues, asChoiceField, useList, useReset, useDirty } from "@shopify/react-form";
import { useI18n } from "@shopify/react-i18n";
import { ConsoleLogger } from "../ConsoleLogger";
import { mergeCatalogs, getCatalogMappingsFromMarkets } from "~/utils";

import en from "./en.json";

import type { Account, MarketCatalogViewReturn } from "~/types/store";

interface CatalogsFormProps {
  account: Account;
  markets: MarketCatalogViewReturn[];
}

export default function CatalogsForm({ account, markets }: CatalogsFormProps) {
  ConsoleLogger("log: CatalogsForm: render");
  ConsoleLogger("log: CatalogsForm: props: ", { account, markets });
  const [i18n] = useI18n({
    id: "CatalogsForm",
    translations: {
      en,
    },
  });
  const fetcher = useFetcher<ActionResponse>();
  const submitting = fetcher.state !== 'idle';
  const actionData = fetcher.data;
  ConsoleLogger("log: CatalogsForm: actionData: ", actionData);

  useEffect(() => {
    if (!submitting) {
      if (actionData?.status === 'success') {
        shopify.toast.show(i18n.translate("CatalogsForm.toaster.success"));
      } else if (actionData?.status === 'fail') {
        shopify.toast.show(i18n.translate("CatalogsForm.toaster.error"));
      }
    }
  }, [actionData, i18n, submitting]);

  const catalogMappings = useMemo(() => getCatalogMappingsFromMarkets(markets), [markets]);

  const fields = {
    multi_catalog_enabled: useField(account.multi_catalog_enabled ?? false),
    default_catalog: useField<string>({
      value: account.domain_key ?? '',
      validates: [
        notEmpty(
          i18n.translate("CatalogsForm.fields.defaultCatalog.validation")
        ),
      ],
    }),
    mappings: useList(catalogMappings.map(mapping => ({ catalog: mapping.catalog ?? '' })) ?? []),
  };

  useEffect(() => {
    if (!catalogMappings.length) {
      fields.multi_catalog_enabled.onChange(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogMappings.length]);

  const reset = useReset(fields);

  const isDirty = useDirty(fields);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const formErrors = validateAll(fields);
    if (formErrors.length > 0) {
      propagateErrors(fields, formErrors);
      return false;
    }

    const { multi_catalog_enabled, default_catalog, mappings } = getValues(fields);
    const data = {
      account: {
        multi_catalog_enabled,
        domain_key: default_catalog,
      },
      catalogMappings: mergeCatalogs(catalogMappings, mappings.map<string>(value => value.catalog)) as Record<string, any>[],
    };
    fetcher.submit(data, { method: "post", encType: "application/json" });
  }

  return (
    <Card>
      <Form onSubmit={submit}>
        <FormLayout>
          <TextField
            label={i18n.translate("CatalogsForm.fields.defaultCatalog.title")}
            autoComplete="off"
            {...fields.default_catalog}
          />
          <Checkbox
            label={i18n.translate("CatalogsForm.fields.multiCatalogEnabled.title")}
            {...asChoiceField(fields.multi_catalog_enabled)}
            disabled={!catalogMappings.length}
            helpText={catalogMappings.length ? '' : i18n.translate("CatalogsForm.fields.multiCatalogEnabled.disabled")}
          />
          <Collapsible
            open={fields.multi_catalog_enabled.value}
            id="multi-catalog-enabled-container"
            transition={{duration: '500ms', timingFunction: 'ease-in-out'}}
            expandOnPrint
          >
            <BlockStack gap="400">
              <Text as="p" variant="bodyMd">
                {i18n.translate("CatalogsForm.fields.mappings.description1")}<br/>
                {i18n.translate("CatalogsForm.fields.mappings.description2")}
              </Text>
              <Divider borderColor="border" />
              <Grid columns={{lg: 6}}>
                <Grid.Cell columnSpan={{xs: 2}}>
                  <Text variant="bodyMd" fontWeight="bold" as="span">{i18n.translate("CatalogsForm.fields.mappings.market.title")}</Text>
                </Grid.Cell>
                <Grid.Cell columnSpan={{xs: 1}}>
                  <Text variant="bodyMd" fontWeight="bold" as="span">{i18n.translate("CatalogsForm.fields.mappings.language.title")}</Text>
                </Grid.Cell>
                <Grid.Cell columnSpan={{xs: 3}}>
                  <Text variant="bodyMd" fontWeight="bold" as="span">{i18n.translate("CatalogsForm.fields.mappings.catalog.title")}</Text>
                </Grid.Cell>
              </Grid>
              <Divider borderColor="border" />
              <Scrollable style={{maxHeight: "250px"}} horizontal={false} focusable scrollbarGutter="stable">
                <Grid columns={{lg: 6}}>
                  {catalogMappings.map((mapping, index) => (<Fragment key={index}>
                    <Grid.Cell columnSpan={{xs: 2}}>
                      <Text variant="bodyMd" as="p">{mapping.market}</Text>
                      {mapping.primary ? <Text variant="bodySm" as="p" tone="subdued">Primary</Text> : null}
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 1}}>
                      <Text variant="bodyMd" as="p">{mapping.language}</Text>
                    </Grid.Cell>
                    <Grid.Cell columnSpan={{xs: 3}}>
                      <TextField
                        label="Bloomreach Catalog"
                        labelHidden
                        autoComplete="off"
                        {...fields.mappings[index].catalog}
                      />
                    </Grid.Cell>
                  </Fragment>))}
                </Grid>
              </Scrollable>
            </BlockStack>
          </Collapsible>
          <InlineStack align="end" gap="300">
            <Button variant="primary" submit loading={submitting} disabled={!isDirty}>
              {i18n.translate("CatalogsForm.primaryAction")}
            </Button>
            <Button variant="secondary" loading={submitting} onClick={reset} disabled={!isDirty}>
              {i18n.translate("CatalogsForm.reset")}
            </Button>
          </InlineStack>
        </FormLayout>
      </Form>
    </Card>
  );
}
