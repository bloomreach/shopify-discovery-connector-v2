import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { BlockStack, Button, Icon, InlineStack, Listbox, Select, Text, TextField } from "@shopify/polaris";
import { PlusCircleIcon, EditIcon, DeleteIcon, CheckIcon, XIcon, ArrowUpIcon, ArrowDownIcon } from '@shopify/polaris-icons';
import { notEmptyString, useDynamicList, useField } from "@shopify/react-form";
import { useI18n } from "@shopify/react-i18n";
import Toggle from "react-toggle";
import { ConsoleLogger } from "../ConsoleLogger";
import { SORTING_OPTIONS } from "~/models";

import en from "./en.json";
import styles from "./SortingOptions.module.css";

import type { SortingOption } from "~/types/store";
import type { FieldDictionary } from "@shopify/react-form";

interface SortingOptionsProps {
  sortingOptions: SortingOption[];
  setSortingOptions: React.Dispatch<React.SetStateAction<SortingOption[]>>;
}

type SortingOptionField = SortingOption & { editMode: boolean, isNew: boolean };

const SortingOptions = forwardRef<{ reset: Function }, SortingOptionsProps>((props, ref) => {
  ConsoleLogger("log: SortingOptions: render");
  ConsoleLogger("log: SortingOptions: props: ", props);
  const [i18n] = useI18n({
    id: "SortingOptions",
    translations: {
      en,
    },
  });

  const { addItem, removeItem, moveItem, fields, value, reset } = useDynamicList(
    props.sortingOptions.map(option => ({
      label: option.label,
      value: option.value,
      editMode: false,
      isNew: false,
    })),
    () => ({ label: SORTING_OPTIONS[0].label, value: SORTING_OPTIONS[0].value, editMode: true, isNew: true })
  );

  useImperativeHandle(ref, () => ({
    reset,
  }));

  const onSelect = (value: string) => {
    if (value === "#addOption") {
      addItem();
    }
  };

  const handleEdit = (index: number) => {
    fields[index].editMode.onChange(true);
  };

  const handleDelete = (index: number) => {
    removeItem(index);
  };

  const handleMove = (from: number, to: number) => {
    if ((from < to && to < fields.length) || (from > to && to >= 0)) {
      moveItem(from, to);
    }
  };

  const createSubmitCallback = (field: FieldDictionary<SortingOptionField>) => (label: string, value: string) => {
    field.label.onChange(label);
    field.value.onChange(value);
    field.editMode.onChange(false);
    field.isNew.onChange(false);
  };

  const createCancelCallback = (field: FieldDictionary<SortingOptionField>, index: number) => () => {
    if (field.isNew.value) {
      removeItem(index);
    } else {
      field.editMode.onChange(false);
    }
  };

  useEffect(() => {
    const sortingOptions = value.filter(v => !v.isNew).map<SortingOption>(v => ({
      label: v.label,
      value: v.value,
    }));
    console.log('Sorting options: ', sortingOptions);
    props.setSortingOptions(sortingOptions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Listbox onSelect={onSelect}>
      {fields.map((field, index) => (
        <Listbox.TextOption key={index}>
          {field.editMode.value ? (
            <EditOption
              label={field.label.value}
              value={field.value.value}
              submitCallback={createSubmitCallback(field)}
              cancelCallback={createCancelCallback(field, index)}
            />
          ) : (
            <div className={styles["list-option"]}>
              <InlineStack align="space-between">
                <Text as="p" variant="bodyMd">{field.label.value}</Text>
                <div className={styles.actions}>
                  <Button icon={EditIcon}  accessibilityLabel="Edit Item" variant="plain" onClick={() => handleEdit(index)} />
                  <Button icon={DeleteIcon} accessibilityLabel="Delete Item" variant="plain" onClick={() => handleDelete(index)}/>
                  {(index > 0) && (
                    <Button icon={ArrowUpIcon} accessibilityLabel="Cancel" variant="plain" onClick={() => handleMove(index, index - 1)} />
                  )}
                  {(index < fields.length - 1) && (
                    <Button icon={ArrowDownIcon} accessibilityLabel="Cancel" variant="plain" onClick={() => handleMove(index, index + 1)} />
                  )}
                </div>
              </InlineStack>
            </div>
          )}
        </Listbox.TextOption>
      ))}
      <Listbox.Action value="#addOption">
        <InlineStack gap="200">
          <Icon source={PlusCircleIcon} tone="base" />
          <div>{i18n.translate("SortingOptions.list.addItem")}</div>
        </InlineStack>
      </Listbox.Action>
    </Listbox>
  );
});

interface EditOptionProps {
  label: string;
  value: string;
  submitCallback: (label: string, value: string) => void;
  cancelCallback: () => void;
}

function EditOption(props: EditOptionProps) {
  ConsoleLogger("log: EditOption: render");
  ConsoleLogger("log: EditOption: props: ", props);
  const [i18n] = useI18n({
    id: "SortingOptions",
    translations: {
      en,
    },
  });

  const [customized, setCustomized] = useState(!SORTING_OPTIONS.some(option => option.value === props.value));

  const options = useMemo(() => {
    const options = SORTING_OPTIONS.map(({ label }, index) => ({
      label,
      value: index.toString(),
    }));
    options.push({ label: i18n.translate("SortingOptions.fields.selectOption.customize"), value: "-1" });
    return options;
  }, [i18n]);

  const extractValueAndDirection = useCallback((valueWithDirection: string) => {
    const [value, direction] = valueWithDirection.split('+');
    return {
      value,
      direction: direction ?? "asc",
    };
  }, []);

  const { value, direction } = useMemo(() => extractValueAndDirection(props.value), [extractValueAndDirection, props.value]);

  const valueField = useField({
    value,
    validates: (value: string) => {
      if (customized) {
        return notEmptyString(i18n.translate("SortingOptions.fields.value.validation"))(value);
      }
    }
  }, [customized]);
  const labelField = useField({
    value: props.label,
    validates: notEmptyString(i18n.translate("SortingOptions.fields.label.validation")),
  });
  const directionField = useField(direction);
  const selectField = useField(customized ? "-1" : SORTING_OPTIONS.findIndex(option => option.value === props.value).toString());

  const onSelectChange = (value: string) => {
    selectField.onChange(value);
    const index = Number(value);
    setCustomized(index < 0);
    if (index >= 0) {
      const { value, direction } = extractValueAndDirection(SORTING_OPTIONS[index].value);
      valueField.onChange(value);
      labelField.onChange(SORTING_OPTIONS[index].label);
      directionField.onChange(direction);
    } else {
      valueField.onChange('');
      labelField.onChange('');
      directionField.onChange("asc");
    }
  };

  const onDirectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    directionField.onChange(event.target.checked ? "asc" : "desc");
  };

  const handleSubmit = () => {
    if (labelField.runValidation() || valueField.runValidation()) {
      return false;
    }
    let value = valueField.value;
    if (value.trim()) {
      value = `${value}+${directionField.value}`;
    }

    props.submitCallback(labelField.value, value);
  };

  const handleCancel = () => props.cancelCallback();

  return (
    <div>
      <Select
        label={i18n.translate("SortingOptions.fields.selectOption.label")}
        labelHidden
        options={options}
        helpText={i18n.translate("SortingOptions.fields.selectOption.description")}
        {...selectField}
        onChange={onSelectChange}
      />
      <InlineStack gap="200">
        <TextField
          label={i18n.translate("SortingOptions.fields.label.label")}
          autoComplete="off"
          {...labelField}
        />
        <TextField
          label={i18n.translate("SortingOptions.fields.value.label")}
          autoComplete="off"
          disabled={!customized}
          helpText={i18n.translate("SortingOptions.fields.value.description")}
          {...valueField}
        />
        <BlockStack gap="200">
          <Text as="p" variant="bodyMd">
            {i18n.translate("SortingOptions.fields.direction.label")}
            {i18n.translate(directionField.value, { scope: "SortingOptions.fields.direction.option" })}
          </Text>
          <Toggle
            checked={directionField.value === "asc"}
            icons={false}
            disabled={!customized}
            onChange={onDirectionChange}
          />
        </BlockStack>
        <Button icon={CheckIcon}  accessibilityLabel="OK" variant="plain" onClick={handleSubmit} />
        <Button icon={XIcon} accessibilityLabel="Cancel" variant="plain" onClick={handleCancel} />
      </InlineStack>
    </div>
  );
}

SortingOptions.displayName = "SortingOptions";
export default SortingOptions;
