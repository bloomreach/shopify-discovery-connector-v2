import { type FormEvent, useCallback, useEffect, useMemo } from "react";
import { useFetcher } from "@remix-run/react";
import { useField, validateAll, propagateErrors, getValues, notEmptyString, useList, asChoiceField, useReset } from "@shopify/react-form";
import {
  Card,
  BlockStack,
  Text,
  Form,
  FormLayout,
  TextField,
  InlineGrid,
  Select,
  Box,
  Checkbox,
  InlineStack,
  Button,
} from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import * as predicates from '@shopify/predicates';
import { defaults } from "~/models";
import { ConsoleLogger } from "../ConsoleLogger";
import { ExternalLink } from "../ExternalLink";
import { filterAndSortMarkets, metafieldsReducer } from "~/utils";
import en from "./en.json";

import type { Autosuggest, MarketTemplateReturn, SettingsAction } from "~/types/store";

interface AutosuggestProps {
  autosuggest: Autosuggest;
  markets?: MarketTemplateReturn[];
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

  const endpointOptions = useMemo(() => [
    {
      label: "Staging",
      value: "https://staging-suggest.dxpapi.com/api/v1/suggest/",
    },
    {
      label: "Production",
      value: "https://suggest.dxpapi.com/api/v1/suggest/",
    },
  ], []);

  const markets = useMemo(() => filterAndSortMarkets(props.markets ?? []), [props.markets]);

  const marketOptions = useMemo(() => {
    const options = markets?.map((market, index) => ({
      label: market.primary ? `${market.name} (Primary)` : market.name,
      value: `${index + 1}`,
    })) ?? [];
    return [{ label: "---Default---", value: '0' }, ...options];
  }, [markets]);

  const marketSettings = useMemo(() => {
    const marketSettings = markets.map((market) => {
      const settings = metafieldsReducer(market.autosuggestSettings?.nodes ?? []) as Autosuggest;
      return {
        endpoint: settings.endpoint ?? props.autosuggest.endpoint ?? defaults.autosuggest.endpoint,
        css_selector: settings.css_selector ?? props.autosuggest.css_selector ?? '',
        number_of_terms: (settings.number_of_terms ?? props.autosuggest.number_of_terms)?.toString() ?? '',
        number_of_products: (settings.number_of_products ?? props.autosuggest.number_of_products)?.toString() ?? '',
        number_of_collections: (settings.number_of_collections ?? props.autosuggest.number_of_collections)?.toString() ?? '',
        custom_css: settings.custom_css ?? props.autosuggest.custom_css ?? '',
        additional_parameters: settings.additional_parameters ?? props.autosuggest.additional_parameters ?? '',
        useDefault: Object.keys(settings).length <= 0,
        isDirty: false,
      };
    });

    return [
      {
        endpoint: props.autosuggest.endpoint ?? '',
        css_selector: props.autosuggest.css_selector ?? '',
        number_of_terms: props.autosuggest.number_of_terms?.toString() ?? '',
        number_of_products: props.autosuggest.number_of_products?.toString() ?? '',
        number_of_collections: props.autosuggest.number_of_collections?.toString() ?? '',
        custom_css: props.autosuggest.custom_css ?? '',
        additional_parameters: props.autosuggest.additional_parameters ?? '',
        useDefault: false,
        isDirty: false,
      },
      ...marketSettings,
    ];
  }, [markets, props.autosuggest]);

  const fields = {
    selectedMarket: useField('0'),
    marketSettings: useList({
      list: marketSettings,
      validates: {
        css_selector: notEmptyString(i18n.translate("AutosuggestForm.fields.cssSelector.validation")),
        number_of_terms: (value: string) => {
          if (!predicates.isPositiveIntegerString(value) || Number(value) > 20) {
             return i18n.translate("AutosuggestForm.fields.numberOfTerms.validation")
          }
        },
        number_of_products: (value: string) => {
          if (!predicates.isPositiveIntegerString(value) || Number(value) > 20) {
             return i18n.translate("AutosuggestForm.fields.numberOfProducts.validation")
          }
        },
        number_of_collections: (value: string) => {
          if (!predicates.isPositiveIntegerString(value) || Number(value) > 20) {
             return i18n.translate("AutosuggestForm.fields.numberOfCollections.validation")
          }
        },
      }
    }),
  };

  const selectedMarketIndex = useMemo(() => Number(fields.selectedMarket.value || '0'), [fields.selectedMarket.value]);
  const currentFields = useMemo(() => fields.marketSettings[selectedMarketIndex], [fields.marketSettings, selectedMarketIndex]);
  const allowSaveAll = useMemo(() => fields.marketSettings.some(f => f.isDirty.value), [fields.marketSettings]);
  const reset = useReset(currentFields);
  const resetAll = useReset({ marketSettings: fields.marketSettings });

  type FieldKey = keyof typeof currentFields;

  const fetcher = useFetcher<ActionResponse>();
  const submitting = fetcher.state !== 'idle';
  const actionData = fetcher.data;
  ConsoleLogger("log: AutosuggestForm: actionData: ", actionData);

  useEffect(() => {
    if (!submitting) {
      if (actionData?.status === 'success') {
        shopify.toast.show(i18n.translate("AutosuggestForm.toaster.success"));
      } else if (actionData?.status === 'fail') {
        shopify.toast.show(i18n.translate("AutosuggestForm.toaster.error"));
      }
    }
  }, [actionData, i18n, submitting]);

  const handleMarketChange = useCallback((value: string) => {
    fields.selectedMarket.onChange(value);
    const targetFields = fields.marketSettings[Number(value)];
    if (Number(value) > 0 && targetFields.useDefault.value) {
      Object.keys(targetFields).filter(key => key !== "isDirty" && key !== "useDefault").forEach(key =>
        targetFields[key as FieldKey].onChange(fields.marketSettings[0][key as FieldKey].value as any)
      );
    }
  }, [fields.marketSettings, fields.selectedMarket]);

  const handleUseDefaultChange = useCallback((value: boolean) => {
    currentFields.useDefault.onChange(value);
    if (selectedMarketIndex <= 0) {
      return;
    }

    if (value) {
      Object.keys(currentFields).filter(key => key !== "isDirty" && key !== "useDefault").forEach(key =>
        currentFields[key as FieldKey].onChange(fields.marketSettings[0][key as FieldKey].value as any)
      );
    }
  }, [currentFields, fields.marketSettings, selectedMarketIndex]);

  useEffect(() => {
    let isDirty = false;
    if (currentFields.useDefault.dirty) {
      isDirty = true;
    } else if (!currentFields.useDefault.value) {
      isDirty = Object.keys(currentFields).filter(key => key !== "isDirty").some(key => currentFields[key as FieldKey].dirty);
    }
    currentFields.isDirty.onChange(isDirty);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, Object.keys(currentFields).filter(key => key !== "isDirty").map(key => currentFields[key as FieldKey].dirty));

  const doSubmit = (event: FormEvent) => {
    event.preventDefault();
    const formErrors = validateAll(fields);
    if (formErrors.length > 0) {
      propagateErrors(fields, formErrors);
      return false;
    }

    const selectedMarket = selectedMarketIndex > 0 ? markets[selectedMarketIndex - 1] : null;
    const data = (selectedMarket && selectedMarket.autosuggestSettings && currentFields.useDefault.value) ? {
      _action: 'deleteSettings',
      marketId: selectedMarket.id,
    } : {
      _action: 'saveSettings',
      marketId: selectedMarket?.id,
      autosuggest: {...getValues(currentFields)},
    };

    fetcher.submit(data as any, { method: "post", encType: "application/json" });
  };

  const doSubmitAll = () => {
    const formErrors = validateAll(fields);
    if (formErrors.length > 0) {
      propagateErrors(fields, formErrors);
      return false;
    }

    const actions = fields.marketSettings.map<SettingsAction | null>((f, index) => {
      if (!f.isDirty.value) {
        return null;
      }

      if (index === 0) {
        return {
          _action: 'saveSettings',
          autosuggest: {...getValues(f)},
        }
      } else {
        const marketId = markets[index - 1].id;
        return f.useDefault.value ? {
          _action: 'deleteSettings',
          marketId,
        } : {
          _action: 'saveSettings',
          marketId,
          autosuggest: {...getValues(f)},
        };
      }
    }).filter(Boolean) as SettingsAction[];

    const data: SettingsAction = {
      _action: "updateAllSettings",
      actions,
    };

    fetcher.submit(data as any, { method: "post", encType: "application/json" });
  };

  const doReset = () => {
    reset();
  };

  const doResetAll = () => {
    resetAll();
  };

  return (
    <BlockStack gap="200">
      <Text as="h2" variant="headingMd">{i18n.translate("AutosuggestForm.title")}</Text>
      <Text as="p" variant="bodyMd" tone="subdued">
        <Text as="span">
          {i18n.translate("AutosuggestForm.description")}<br/>
          {i18n.translate("AutosuggestForm.fields.reference.body")}
          <ExternalLink text={i18n.translate("AutosuggestForm.fields.reference.primaryAction")} url={i18n.translate("AutosuggestForm.fields.reference.primaryActionUrl")} />.
        </Text>
      </Text>
      <Card>
        <Form onSubmit={doSubmit}>
          <FormLayout>
            <Select
              label={i18n.translate("AutosuggestForm.fields.marketSelector.label")}
              options={marketOptions}
              helpText={i18n.translate("AutosuggestForm.fields.marketSelector.description")}
              {...fields.selectedMarket}
              onChange={handleMarketChange}
            />
            <Box borderBlockStartWidth="025" borderBlockEndWidth="025" borderColor="border" paddingBlock="400">
              <BlockStack gap="400">
                {selectedMarketIndex > 0 && (
                  <InlineGrid columns={['oneThird', 'twoThirds']}>
                    <Text as="p" fontWeight="semibold">
                      {i18n.translate("AutosuggestForm.fields.useDefault.title")}
                    </Text>
                    <Checkbox
                      label="Use Default"
                      labelHidden
                      {...asChoiceField(currentFields.useDefault)}
                      onChange={handleUseDefaultChange}
                    />
                  </InlineGrid>
                )}
                <InlineGrid columns={['oneThird', 'twoThirds']}>
                  <Text as="p" fontWeight="semibold">
                    {i18n.translate("AutosuggestForm.fields.endpoint.title")}
                  </Text>
                  <div>
                    <Select
                      name="endpoint"
                      label={i18n.translate("AutosuggestForm.fields.endpoint.title")}
                      labelHidden
                      disabled={currentFields.useDefault.value}
                      options={endpointOptions}
                      helpText={i18n.translate("AutosuggestForm.fields.endpoint.description")}
                      {...currentFields.endpoint}
                    />
                  </div>
                </InlineGrid>
                <InlineGrid columns={['oneThird', 'twoThirds']}>
                  <Text as="p" fontWeight="semibold">
                    {i18n.translate("AutosuggestForm.fields.cssSelector.title")}
                  </Text>
                  <TextField
                    name="css_selector"
                    label="CSS Selector"
                    labelHidden
                    disabled={currentFields.useDefault.value}
                    autoComplete="off"
                    helpText={i18n.translate("AutosuggestForm.fields.cssSelector.description")}
                    {...currentFields.css_selector}
                  />
                </InlineGrid>
                <InlineGrid columns={['oneThird', 'twoThirds']}>
                  <Text as="p" fontWeight="semibold">
                    {i18n.translate(
                      "AutosuggestForm.fields.numberOfTerms.title"
                    )}
                  </Text>
                  <div className="Bloomreach-Annotated-form__condensed-input-max">
                    <TextField
                      name="number_of_terms"
                      type="number"
                      label="Number of Terms"
                      labelHidden
                      disabled={currentFields.useDefault.value}
                      autoComplete="off"
                      min={1}
                      max={20}
                      {...currentFields.number_of_terms}
                    />
                  </div>
                </InlineGrid>
                <InlineGrid columns={['oneThird', 'twoThirds']}>
                  <Text as="p" fontWeight="semibold">
                    {i18n.translate(
                      "AutosuggestForm.fields.numberOfProducts.title"
                    )}
                  </Text>
                  <div className="Bloomreach-Annotated-form__condensed-input-max">
                    <TextField
                      name="number_of_products"
                      type="number"
                      label="Number of Products"
                      labelHidden
                      disabled={currentFields.useDefault.value}
                      autoComplete="off"
                      min={1}
                      max={20}
                      {...currentFields.number_of_products}
                    />
                  </div>
                </InlineGrid>
                <InlineGrid columns={['oneThird', 'twoThirds']}>
                  <Text as="p" fontWeight="semibold">
                    {i18n.translate(
                      "AutosuggestForm.fields.numberOfCollections.title"
                    )}
                  </Text>
                  <div className="Bloomreach-Annotated-form__condensed-input-max">
                    <TextField
                    name="number_of_collections"
                    type="number"
                    label="Number of Collections"
                    labelHidden
                    disabled={currentFields.useDefault.value}
                    autoComplete="off"
                    min={1}
                    max={20}
                    {...currentFields.number_of_collections}
                  />
                  </div>
                </InlineGrid>
                <InlineGrid columns={['oneThird', 'twoThirds']}>
                  <Text as="p" fontWeight="semibold">
                    {i18n.translate("AutosuggestForm.fields.customCss.title")}
                  </Text>
                  <TextField
                    name="custom_css"
                    label="Custom CSS"
                    labelHidden
                    disabled={currentFields.useDefault.value}
                    autoComplete="off"
                    multiline={4}
                    maxHeight={250}
                    {...currentFields.custom_css}
                  />
                </InlineGrid>
                <InlineGrid columns={['oneThird', 'twoThirds']}>
                  <Text as="p" fontWeight="semibold">
                    {i18n.translate("AutosuggestForm.fields.additionalParameters.title")}
                  </Text>
                  <TextField
                    name="additional_parameters"
                    label="Additional Parameters"
                    labelHidden
                    disabled={currentFields.useDefault.value}
                    autoComplete="off"
                    helpText={i18n.translate("AutosuggestForm.fields.additionalParameters.description")}
                    placeholder="name1=value1&name2=value2"
                    {...currentFields.additional_parameters}
                  />
                </InlineGrid>
                <InlineStack gap="300" align="end">
                  <Button variant="primary" submit loading={submitting} disabled={!currentFields.isDirty.value}>{i18n.translate("AutosuggestForm.primaryAction")}</Button>
                  <Button variant="secondary" loading={submitting} onClick={doReset} disabled={!currentFields.isDirty.value}>{i18n.translate("AutosuggestForm.reset")}</Button>
                </InlineStack>
              </BlockStack>
            </Box>
            <InlineStack gap="300" align="end">
              <Button variant="primary" loading={submitting} onClick={doSubmitAll} disabled={!allowSaveAll}>{i18n.translate("AutosuggestForm.saveAll")}</Button>
              <Button variant="secondary" loading={submitting} onClick={doResetAll} disabled={!allowSaveAll}>{i18n.translate("AutosuggestForm.resetAll")}</Button>
            </InlineStack>
          </FormLayout>
        </Form>
      </Card>
    </BlockStack>
  );
}
