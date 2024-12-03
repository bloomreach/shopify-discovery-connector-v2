import type { Product } from "@shopify/web-pixels-extension";

export function escape(str?: string | null): string {
  if (!str) {
    return '';
  }
  return encodeURIComponent(str)
    .replaceAll("-", "%2D")
    .replaceAll("_", "%5F")
    .replaceAll("!", "%21")
    .replaceAll("~", "%7E")
    .replaceAll("*", "%2A")
    .replaceAll("'", "%27")
    .replaceAll("(", "%28")
    .replaceAll(")", "%29");
}

export function sendPixelData(data: Record<string, any>) {
  console.log('sendPixelData: data: ', data);
  const params = Object.keys(data).filter((key) => !!data[key]).map((key) => `${key}=${data[key]}`).join('&');
  console.log('sendPixelData: params: ', params);
  fetch(`https://p.brsrvr.com/pix.gif?${params}`, {
    method: 'GET',
    mode: 'no-cors',
  });
}

export function getPid(product: Product, pidField: "handle" | "id"): string | null {
  if (pidField === "handle" && product.url) {
    const lastSlash = product.url.lastIndexOf('/');
    const queryStart = product.url.indexOf('?');
    if (lastSlash >= 0) {
      const handle = queryStart > lastSlash ? product.url.slice(lastSlash + 1, queryStart) : product.url.slice(lastSlash + 1);
      if (handle) {
        return handle;
      }
    }
  }

  return product.id;
}
