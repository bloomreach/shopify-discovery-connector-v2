import type { MetafieldReturn } from '~/types/store';

export * from './markets';
export * from './themes';

export function metafieldsReducer(metafields: MetafieldReturn[]): Record<string, any> {
  return metafields.reduce((accu, curr) => {
    if (curr.type === "boolean") {
      accu[curr.key] = curr.value === "true";
    } else if (curr.type === "number_integer" || curr.type === "number_decimal") {
      accu[curr.key] = Number(curr.value);
    } else if (curr.type === "json") {
      accu[curr.key] = JSON.parse(curr.value);
    } else {
      accu[curr.key] = curr.value;
    }
    return accu;
  }, {} as Record<string, any>);
}
