import type { BrowserCookie, Location, Product } from '@shopify/web-pixels-extension';

export function escape(str?: string | null): string {
  if (!str) {
    return '';
  }

  return encodeURIComponent(str)
    .replaceAll('-', '%2D')
    .replaceAll('_', '%5F')
    .replaceAll('!', '%21')
    .replaceAll('~', '%7E')
    .replaceAll('*', '%2A')
    .replaceAll("'", '%27')
    .replaceAll('(', '%28')
    .replaceAll(')', '%29');
}

export function sendPixelData(region: string, data: Record<string, any>) {
  const params = Object.keys(data)
    .filter((key) => !!data[key])
    .map((key) => `${key}=${data[key]}`)
    .join('&');

  fetch(`https://${region}/pix.gif?${params}`, {
    method: 'GET',
    mode: 'no-cors',
  });
}

export function getPid(product: Product | undefined, pidField: 'handle' | 'id'): string | null {
  if (!product) {
    return null;
  }
  const url = product.url ?? '';

  if (pidField === 'handle' && url) {
    const lastSlash = url.lastIndexOf('/');
    const queryStart = url.indexOf('?');

    if (lastSlash >= 0) {
      const handle = queryStart > lastSlash ? url.slice(lastSlash + 1, queryStart) : url.slice(lastSlash + 1);

      if (handle) {
        return handle;
      }
    }
  }

  return product.id;
}

const getAllCookies = async (cookie: BrowserCookie) => {
  const cookies = await cookie.get();
  const cookieList: { name: string; value: string }[] = cookies.split(';').map((c: string) => {
    const [name, value] = c.trim().split('=');
    return { name, value };
  });

  return cookieList;
};

const getAllPossibleDomainNames = (location: Location) => {
  const hostname = location.hostname;
  const parts = hostname.split('.');
  const domains: string[] = [];

  for (let i = 0; i < parts.length; i++) {
    const domain = parts.slice(i).join('.');
    domains.push(domain);
    domains.push(`.${domain}`);
  }

  // Remove duplicates if any
  return Array.from(new Set(domains));
};

export const removeRedundantBrUid2Cookie = async (cookie: BrowserCookie, location: Location) => {
  const oldCookieList = await getAllCookies(cookie);
  const cookieName = '_br_uid_2';

  if (oldCookieList.filter((c) => c.name === cookieName).length > 1) {
    console.log(`Duplication cookie ${cookieName} found. Expiring all.`);

    const domains = getAllPossibleDomainNames(location);

    domains.forEach(async function (domain) {
      await cookie.set(`${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`);
    });

    // Also try without domain attribute (current domain)
    await cookie.set(`${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`);
  }
};
