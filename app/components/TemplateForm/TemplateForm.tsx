import { useMemo, type FormEvent, useEffect, useCallback } from "react";
import { useFetcher, Link } from "@remix-run/react";
import { Modal, TitleBar } from "@shopify/app-bridge-react";
import { Banner, BlockStack, Box, Button, Card, Checkbox, Form, FormLayout, InlineStack, List, Select, Text, TextField } from "@shopify/polaris";
import { useI18n } from "@shopify/react-i18n";
import { asChoiceField, propagateErrors, useField, useList, useReset, validateAll } from "@shopify/react-form";
import { ConsoleLogger } from "../ConsoleLogger";
import { filterAndSortMarkets } from "~/utils";
import { AutosuggestTemplateVersion, CategoryListTemplateVersion, CategoryTemplateVersion, RecommendationTemplateVersion, SearchListTemplateVersion, SearchTemplateVersion } from "~/templates";
import { TEMPLATE_AUTOSUGGEST, TEMPLATE_CATEGORY, TEMPLATE_CATEGORY_LIST, TEMPLATE_RECOMMENDATIONS, TEMPLATE_SEARCH, TEMPLATE_SEARCH_LIST } from "~/models";
import en from "./en.json";

import type { MarketTemplateReturn, TemplateAction, TemplateMetafields, TemplateVersionMetafields } from "~/types/store";

interface TemplateFormProps {
  shopUrl: string;
  template: string;
  templateValue?: string;
  templateVersion?: string;
  markets?: MarketTemplateReturn[];
}

const templatesVersionMap: Record<string, string> = {
  [`${TEMPLATE_AUTOSUGGEST}_version`]: AutosuggestTemplateVersion,
  [`${TEMPLATE_SEARCH}_version`]: SearchTemplateVersion,
  [`${TEMPLATE_SEARCH_LIST}_version`]: SearchListTemplateVersion,
  [`${TEMPLATE_CATEGORY}_version`]: CategoryTemplateVersion,
  [`${TEMPLATE_CATEGORY_LIST}_version`]: CategoryListTemplateVersion,
  [`${TEMPLATE_RECOMMENDATIONS}_version`]: RecommendationTemplateVersion,
};

export default function TemplateForm(props: TemplateFormProps) {
  ConsoleLogger("log: TemplateForm: render");
  ConsoleLogger("log: TemplateForm: props: ", props);
  const [i18n] = useI18n({
    id: "TemplateForm",
    translations: {
      en,
    },
  });

  const latestVersion = useMemo(() => templatesVersionMap[`${props.template}_version`], [props.template]);
  const templateValue = useMemo(() => decodeURIComponent(props.templateValue ?? ''), [props.templateValue]);
  const markets = useMemo(() => {
    const markets = filterAndSortMarkets(props.markets ?? []);
    const metafieldPrefix = props.template.replace("_product_list", "List");
    return markets.map((market) => {
      const templateMetafield = market[`${metafieldPrefix}Template` as keyof TemplateMetafields];
      const templateVersionMetafield = market[`${metafieldPrefix}TemplateVersion` as keyof TemplateVersionMetafields];
      const brTemplate = templateMetafield ? { brTemplate: { value: decodeURIComponent(templateMetafield.value ?? '') } } : {};
      const brTemplateVersion = templateMetafield ? { brTemplateVersion: { value: templateVersionMetafield?.value } } : {};
      return { ...market, ...brTemplate, ...brTemplateVersion };
    });
  }, [props.markets, props.template]);

  const marketOptions = useMemo(() => {
    const options = markets.map((market, index) => ({
      label: market.primary ? `${market.name} (Primary)` : market.name,
      value: `${index + 1}`,
    })) ?? [];
    return [{ label: "---Default---", value: '0' }, ...options];
  }, [markets]);

  const marketTemplates = useMemo(() => {
    const marketTemplates = markets.map((market) => ({
      templateValue: market.brTemplate?.value ?? templateValue,
      templateVersion: (market.brTemplate ? market.brTemplateVersion?.value : props.templateVersion) ?? '',
      useDefault: !market.brTemplate,
      updateVersion: false,
      isDirty: false,
    }));
    return [
      {
        templateValue,
        templateVersion: props.templateVersion ?? '',
        useDefault: false,
        updateVersion: false,
        isDirty: false,
      },
      ...marketTemplates,
    ];
  }, [markets, templateValue, props.templateVersion]);

  const fields = {
    selectedMarket: useField('0'),
    marketTemplates: useList(marketTemplates),
  };

  const selectedMarketIndex = useMemo(() => Number(fields.selectedMarket.value || '0'), [fields.selectedMarket.value]);
  const currentFields = useMemo(() => fields.marketTemplates[selectedMarketIndex], [fields.marketTemplates, selectedMarketIndex]);
  const reset = useReset(currentFields);
  const resetAll = useReset({ marketTemplates: fields.marketTemplates });

  const shouldShowUpdate = useMemo(() => {
    return !currentFields.useDefault.value && (!currentFields.templateVersion.value || currentFields.templateVersion.value < latestVersion);
  }, [currentFields.templateVersion.value, currentFields.useDefault.value, latestVersion]);

  const fetcher = useFetcher<ActionResponse>();
  const submitting = fetcher.state !== 'idle';
  const actionData = fetcher.data;
  ConsoleLogger("log: TemplateForm: actionData: ", actionData);

  const modalId = `${props.template}-template-auto-update-modal`;

  useEffect(() => {
    if (!submitting) {
      if (actionData?.status === 'success') {
        shopify.toast.show(i18n.translate("TemplateForm.toaster.success"));
      } else if (actionData?.status === 'fail') {
        shopify.toast.show(i18n.translate("TemplateForm.toaster.error"));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData, i18n, submitting]);

  const handleTemplateChange = useCallback((value: string) => {
    currentFields.templateValue.onChange(value);
    if (selectedMarketIndex === 0) {
      fields.marketTemplates.filter(f => f.useDefault.value).forEach(f => f.templateValue.onChange(value));
    }
  }, [currentFields.templateValue, fields.marketTemplates, selectedMarketIndex]);

  const handleUseDefaultChange = useCallback((value: boolean) => {
    currentFields.useDefault.onChange(value);
    if (selectedMarketIndex <= 0) {
      return;
    }

    if (value) {
      currentFields.templateValue.onChange(fields.marketTemplates[0].templateValue.value);
      currentFields.templateVersion.onChange(fields.marketTemplates[0].templateVersion.value);
    }
  }, [currentFields.templateValue, currentFields.templateVersion, currentFields.useDefault, fields.marketTemplates, selectedMarketIndex]);

  useEffect(() => {
    let isDirty = false;
    if (currentFields.useDefault.dirty) {
      isDirty = true;
    } else if (!currentFields.useDefault.value && (currentFields.templateValue.dirty || currentFields.updateVersion.value)) {
      isDirty = true;
    }
    currentFields.isDirty.onChange(isDirty);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFields.useDefault.dirty, currentFields.templateValue.dirty, currentFields.updateVersion.value]);

  const allowSaveAll = useMemo(() => fields.marketTemplates.some(f => f.isDirty.value), [fields.marketTemplates]);

  const doSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    const formErrors = validateAll(fields);
    if (formErrors.length > 0) {
      propagateErrors(fields, formErrors);
      return false;
    }

    const selectedMarket = selectedMarketIndex > 0 ? markets[selectedMarketIndex - 1] : null;
    const data: TemplateAction = (selectedMarket && selectedMarket.brTemplate && currentFields.useDefault.value) ? {
      _action: 'deleteTemplate',
      template: props.template,
      marketId: selectedMarket.id,
    } : {
      _action: 'saveTemplate',
      template: props.template,
      templateValue: currentFields.templateValue.value,
      templateVersion: currentFields.updateVersion.value ? latestVersion : currentFields.templateVersion.value,
      marketId: selectedMarket?.id,
    };

    fetcher.submit(data as any, { method: "post", encType: "application/json" });
  };

  const doAutoUpdateTemplate = useCallback(() => {
    shopify.modal.hide(modalId);
    const data: TemplateAction = {
      _action: 'autoUpdateTemplate',
      template: props.template,
    };
    if (selectedMarketIndex > 0) {
      data.marketId = markets[selectedMarketIndex - 1].id;
    }
    fetcher.submit(data as any, { method: "post", encType: "application/json" });
  }, [fetcher, markets, modalId, props.template, selectedMarketIndex]);

  const doSubmitAll = () => {
    const formErrors = validateAll(fields);
    if (formErrors.length > 0) {
      propagateErrors(fields, formErrors);
      return false;
    }

    const actions = fields.marketTemplates.map<TemplateAction | null>((f, index) => {
      if (!f.isDirty.value) {
        return null;
      }

      if (index === 0) {
        return {
          _action: 'saveTemplate',
          template: props.template,
          templateValue: f.templateValue.value,
          templateVersion: f.updateVersion.value ? latestVersion : f.templateVersion.value,
        }
      } else {
        const marketId = markets[index - 1].id;
        return f.useDefault.value ? {
          _action: 'deleteTemplate',
          template: props.template,
          marketId,
        } : {
          _action: 'saveTemplate',
          template: props.template,
          templateValue: f.templateValue.value,
          templateVersion: f.updateVersion.value ? latestVersion : f.templateVersion.value,
          marketId,
        };
      }
    }).filter(Boolean) as TemplateAction[];

    const data: TemplateAction = {
      _action: "updateAllTemplates",
      template: props.template,
      actions,
    };

    fetcher.submit(data as any, { method: "post", encType: "application/json" });
  };

  const doReset = () => {
    reset();
    if (selectedMarketIndex === 0) {
      fields.marketTemplates.filter(f => f.useDefault.value).forEach(f => f.templateValue.onChange(currentFields.templateValue.defaultValue));
    }
  };

  const doResetAll = () => {
    resetAll();
  };

  return (<>
    <Form onSubmit={doSubmit}>
      <Card>
        <FormLayout>
          <Select
            label={i18n.translate("TemplateForm.marketSelector.label")}
            options={marketOptions}
            helpText={i18n.translate("TemplateForm.marketSelector.description")}
            {...fields.selectedMarket}
          />
          <Box borderBlockStartWidth="025" borderBlockEndWidth="025" borderColor="border" paddingBlock="400">
            <BlockStack gap="400">
              {selectedMarketIndex > 0 && (
                <Checkbox
                  label={i18n.translate("TemplateForm.useDefault.label")}
                  {...asChoiceField(currentFields.useDefault)}
                  onChange={handleUseDefaultChange}
                />
              )}
              <TextField
                label="Template"
                labelHidden
                autoComplete="off"
                multiline={4}
                maxHeight={250}
                loading={submitting}
                disabled={currentFields.useDefault.value}
                {...currentFields.templateValue}
                onChange={handleTemplateChange}
              />
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
                      <Text as="p" tone="subdued">{i18n.translate("TemplateForm.updateBanner.currentVersion")}: {currentFields.templateVersion.value || "Not Set"}</Text>
                      <InlineStack gap="200" align="start">
                        <Text as="p" tone="subdued">{i18n.translate("TemplateForm.updateBanner.availableVersion")}: {latestVersion}</Text>
                        <Link to={`/app/templates/${props.template}`} target="_blank" reloadDocument>{i18n.translate("TemplateForm.updateBanner.download")}</Link>
                      </InlineStack>
                    </BlockStack>
                    <div>
                      <Button onClick={() => shopify.modal.show(modalId)} loading={submitting} disabled={currentFields.updateVersion.value}>{i18n.translate("TemplateForm.updateBanner.primaryAction")}</Button>
                    </div>
                    <Checkbox
                      label={i18n.translate("TemplateForm.updateBanner.checkbox")}
                      {...asChoiceField(currentFields.updateVersion)}
                    />
                  </BlockStack>
                </Banner>
              ) : (
                <Text as="p" tone="subdued">{i18n.translate("TemplateForm.templateVersion")}: {currentFields.templateVersion.value}</Text>
              )}
              <InlineStack gap="300" align="end">
                <Button variant="primary" submit loading={submitting} disabled={!currentFields.isDirty.value}>{i18n.translate("TemplateForm.primaryAction")}</Button>
                <Button variant="secondary" loading={submitting} onClick={doReset} disabled={!currentFields.isDirty.value}>{i18n.translate("TemplateForm.reset")}</Button>
              </InlineStack>
            </BlockStack>
          </Box>
          <InlineStack gap="300" align="end">
            <Button variant="primary" loading={submitting} onClick={doSubmitAll} disabled={!allowSaveAll}>{i18n.translate("TemplateForm.saveAll")}</Button>
            <Button variant="secondary" loading={submitting} onClick={doResetAll} disabled={!allowSaveAll}>{i18n.translate("TemplateForm.resetAll")}</Button>
          </InlineStack>
        </FormLayout>
      </Card>
    </Form>
    <Modal id={modalId}>
      <Box padding="400">
        <Text as="p">{i18n.translate("TemplateForm.updateBanner.warning.body")}</Text>
      </Box>
      <TitleBar title={i18n.translate("TemplateForm.updateBanner.warning.title")}>
        <button variant="primary" onClick={doAutoUpdateTemplate}>{i18n.translate("TemplateForm.updateBanner.warning.confirm.label")}</button>
        <button onClick={() => shopify.modal.hide(modalId)}>{i18n.translate("TemplateForm.updateBanner.warning.dismiss.label")}</button>
      </TitleBar>
    </Modal>
  </>);
}
