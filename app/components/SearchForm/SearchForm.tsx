import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useFetcher } from "@remix-run/react";
import { Button, Card, Form, FormLayout, InlineGrid, InlineStack, Select, TextField, Text, BlockStack, Checkbox } from "@shopify/polaris";
import { notEmpty, propagateErrors, useField, validateAll, getValues, asChoiceField, useReset, useDirty } from "@shopify/react-form";
import { useI18n } from "@shopify/react-i18n";
import * as predicates from '@shopify/predicates';
import { ConsoleLogger } from "../ConsoleLogger";
import { defaults } from "~/models";
import { SortingOptions } from "../SortingOptions";

import en from "./en.json";

import type { Search, SettingsAction, SortingOption } from "~/types/store";


interface SearchFormProps {
  search: Search;
  type: string;
}

export default function SearchForm({ search, type }: SearchFormProps) {
  ConsoleLogger("log: SearchForm: render");
  ConsoleLogger("log: SearchForm: props: ", { search, type });
  const [i18n] = useI18n({
    id: "SearchForm",
    translations: {
      en,
    },
  });

  const [sortingOptions, setSortingOptions] = useState<SortingOption[]>((search.sorting_options ?? []) as SortingOption[]);
  const sortingOptionsRef = useRef<{ reset: Function }>(null);
  const callChildReset = () => {
    if (sortingOptionsRef.current) {
      sortingOptionsRef.current.reset();
    }
  };

  const fetcher = useFetcher<ActionResponse>();
  const submitting = fetcher.state !== 'idle';
  const actionData = fetcher.data;
  ConsoleLogger("log: SearchForm: actionData: ", actionData);
  useEffect(() => {
    if (!submitting) {
      if (actionData?.status === 'success') {
        shopify.toast.show(i18n.translate("SearchForm.toaster.success"));
      } else if (actionData?.status === 'fail') {
        shopify.toast.show(i18n.translate("SearchForm.toaster.error"));
      }
    }
  }, [actionData, i18n, submitting]);

  const endpointOptions = [
    {
      label: "Staging",
      value: "https://staging-core.dxpapi.com/api/v1/core/",
    },
    {
      label: "Production",
      value: "https://core.dxpapi.com/api/v1/core/",
    },
  ];

  const fields = {
    endpoint: useField(search.endpoint ?? defaults.search.endpoint),
    fl_fields: useField({
      value: search.fl_fields ?? '',
      validates: [
        notEmpty(
          i18n.translate("SearchForm.fields.flFields.validation")
        ),
      ],
    }),
    items_per_page: useField({
      value: search.items_per_page?.toString() ?? '',
      validates: (value: string) => {
        if (!predicates.isPositiveIntegerString(value)) {
          return i18n.translate("SearchForm.fields.itemsPerPage.validation")
       }
      }
    }),
    initial_number_of_facets: useField({
      value: search.initial_number_of_facets?.toString() ?? '',
      validates: (value: string) => {
        if (!predicates.isPositiveIntegerString(value)) {
          return i18n.translate("SearchForm.fields.numberOfFacets.validation")
       }
      }
    }),
    initial_number_of_facet_values: useField({
      value: search.initial_number_of_facet_values?.toString() ?? '',
      validates: (value: string) => {
        if (!predicates.isPositiveIntegerString(value)) {
          return i18n.translate("SearchForm.fields.numberOfFacetValues.validation")
       }
      }
    }),
    display_variants: useField(search.display_variants ?? false),
    facets_included: useField(search.facets_included ?? false),
    infinite_scroll: useField(search.infinite_scroll ?? false),
    custom_css: useField(search.custom_css ?? ''),
    additional_parameters: useField(search.additional_parameters ?? ''),
  };
  const reset = useReset(fields);

  const defaultSortingOptions = useMemo(() => JSON.stringify(search.sorting_options ?? []), [search.sorting_options]);
  const sortingOptionsIsDirty = useMemo(() => (JSON.stringify(sortingOptions) !== defaultSortingOptions), [defaultSortingOptions, sortingOptions]);
  const fieldsIsDirty = useDirty(fields);
  const isDirty = sortingOptionsIsDirty || fieldsIsDirty;

  const doSubmit = (event: FormEvent) => {
    event.preventDefault();
    const formErrors = validateAll(fields);
    if (formErrors.length > 0) {
      propagateErrors(fields, formErrors);
      return false;
    }
    const data: SettingsAction = {
      _action: "saveSettings",
      search: { ...getValues(fields), sorting_options: sortingOptions },
    };
    fetcher.submit(data, { method: "post", encType: "application/json" });
  };

  const doReset = () => {
    reset();
    callChildReset();
  };

  return (
    <BlockStack gap="200">
      <Text as="h2" variant="headingMd">{i18n.translate("SearchForm.title", { type })}</Text>
      <Text as="p" variant="bodyMd" tone="subdued">{i18n.translate("SearchForm.description", { type })}</Text>
      <Card>
        <Form onSubmit={doSubmit}>
          <FormLayout>
            <InlineGrid columns={['oneThird', 'twoThirds']}>
              <Text as="p" fontWeight="semibold">
                {i18n.translate("SearchForm.fields.endpoint.title")}
              </Text>
              <Select
                label="Endpoint"
                labelHidden
                options={endpointOptions}
                helpText={i18n.translate("SearchForm.fields.endpoint.description")}
                {...fields.endpoint}
              />
            </InlineGrid>
            <InlineGrid columns={['oneThird', 'twoThirds']}>
              <Text as="p" fontWeight="semibold">
                {i18n.translate("SearchForm.fields.flFields.title")}
              </Text>
              <TextField
                label="Fields"
                labelHidden
                autoComplete="off"
                helpText={i18n.translate("SearchForm.fields.flFields.description")}
                {...fields.fl_fields}
              />
            </InlineGrid>
            <InlineGrid columns={['oneThird', 'twoThirds']}>
              <Text as="p" fontWeight="semibold">
                {i18n.translate("SearchForm.fields.itemsPerPage.title")}
              </Text>
              <div className="Bloomreach-Annotated-form__condensed-input-max">
                <TextField
                  label="Items per Page"
                  labelHidden
                  type="number"
                  autoComplete="off"
                  min={1}
                  {...fields.items_per_page}
                />
              </div>
            </InlineGrid>
            <InlineGrid columns={['oneThird', 'twoThirds']}>
              <Text as="p" fontWeight="semibold">
                {i18n.translate("SearchForm.fields.displayVariants.title")}
              </Text>
              <div className="Bloomreach-Annotated-form__condensed-input-max">
                <Checkbox
                  label="Display Variants?"
                  labelHidden
                  {...asChoiceField(fields.display_variants)}
                />
              </div>
            </InlineGrid>
            <InlineGrid columns={['oneThird', 'twoThirds']}>
              <Text as="p" fontWeight="semibold">
                {i18n.translate("SearchForm.fields.includeFacets.title")}
              </Text>
              <div className="Bloomreach-Annotated-form__condensed-input-max">
                <Checkbox
                  label="Display Variants?"
                  labelHidden
                  {...asChoiceField(fields.facets_included)}
                />
              </div>
            </InlineGrid>
            <InlineGrid columns={['oneThird', 'twoThirds']}>
              <Text as="p" fontWeight="semibold">
                {i18n.translate("SearchForm.fields.numberOfFacets.title")}
              </Text>
              <div className="Bloomreach-Annotated-form__condensed-input-max">
                <TextField
                  label="Number of Facets"
                  labelHidden
                  type="number"
                  autoComplete="off"
                  min={1}
                  {...fields.initial_number_of_facets}
                />
              </div>
            </InlineGrid>
            <InlineGrid columns={['oneThird', 'twoThirds']}>
              <Text as="p" fontWeight="semibold">
                {i18n.translate("SearchForm.fields.numberOfFacetValues.title")}
              </Text>
              <div className="Bloomreach-Annotated-form__condensed-input-max">
                <TextField
                  label="Number of Facet Values"
                  labelHidden
                  type="number"
                  autoComplete="off"
                  min={1}
                  {...fields.initial_number_of_facet_values}
                />
              </div>
            </InlineGrid>
            <InlineGrid columns={['oneThird', 'twoThirds']}>
              <Text as="p" fontWeight="semibold">
                {i18n.translate("SearchForm.fields.infiniteScroll.title")}
              </Text>
              <div className="Bloomreach-Annotated-form__condensed-input-max">
                <Checkbox
                  label="Infinite Scroll?"
                  labelHidden
                  {...asChoiceField(fields.infinite_scroll)}
                />
              </div>
            </InlineGrid>
            <InlineGrid columns={['oneThird', 'twoThirds']}>
              <Text as="p" fontWeight="semibold">
                {i18n.translate("SearchForm.fields.sortingOptions.title")}
              </Text>
              <div>
                <SortingOptions sortingOptions={(search.sorting_options ?? []) as SortingOption[]} setSortingOptions={setSortingOptions} ref={sortingOptionsRef} />
              </div>
            </InlineGrid>
            <InlineGrid columns={['oneThird', 'twoThirds']}>
              <Text as="p" fontWeight="semibold">
                {i18n.translate("SearchForm.fields.customCss.title")}
              </Text>
              <TextField
                label="Custom CSS"
                labelHidden
                autoComplete="off"
                {...fields.custom_css}
              />
            </InlineGrid>
            <InlineGrid columns={['oneThird', 'twoThirds']}>
              <Text as="p" fontWeight="semibold">
                {i18n.translate("SearchForm.fields.additionalParameters.title")}
              </Text>
              <TextField
                label="Additional Parameters"
                labelHidden
                autoComplete="off"
                placeholder="name1=value1&name2=value2"
                helpText={i18n.translate("SearchForm.fields.additionalParameters.description")}
                {...fields.additional_parameters}
              />
            </InlineGrid>
            <InlineStack align="end" gap="300">
              <Button variant="primary" submit loading={submitting} disabled={!isDirty}>
                {i18n.translate("SearchForm.primaryAction")}
              </Button>
              <Button variant="secondary" loading={submitting} disabled={!isDirty} onClick={doReset}>
                {i18n.translate("SearchForm.reset")}
              </Button>
            </InlineStack>
          </FormLayout>
        </Form>
      </Card>
    </BlockStack>
  );
}
