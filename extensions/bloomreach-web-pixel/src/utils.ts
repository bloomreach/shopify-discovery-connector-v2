import type {Browser, Product, WebPixelsDocument} from "@shopify/web-pixels-extension";

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

export function sendPixelData(region: string, data: Record<string, any>) {
  const params = Object.keys(data).filter((key) => !!data[key]).map((key) => `${key}=${data[key]}`).join('&');
  fetch(`https://${region}/pix.gif?${params}`, {
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

/**
 * Get domain name to set the cookie for.
 * www.domain.com goes to domain.com
 * domain.com remains unchanged
 */
function getBaseDomain(host: string): string {
  const parts: string[] = host.split(".");
  const n: number = parts.length;

  if (n <= 2) {
    return host;
  }

  // Check if the last two parts form a country-code TLD (e.g., .co.uk, .com.au)
  if (parts[n - 1].length <= 2 && parts[n - 2].length <= 3) {
    return `${parts[n - 3]}.${parts[n - 2]}.${parts[n - 1]}`;
  } else {
    return `${parts[n - 2]}.${parts[n - 1]}`;
  }
}

/**
 * Sets a persistent cookie in the browser with cookieName and cookieValue.
 * @param cookieName name of the cookie
 * @param cookieValue value of the cookie
 * @param browser
 * @param domain cookie domain
 * @param timeout timeout in seconds from now(). Can be negative.
 * @return void
 */
export async function setPersistentCookie(
  cookieName: string,
  cookieValue: string,
  browser: Browser,
  domain?: string,
  timeout?: number,
): Promise<void> {
  const expiryDate = new Date();

  // Default expiration: 100 years from now
  expiryDate.setFullYear(expiryDate.getFullYear() + 100);

  // If timeout is provided and valid, override expiry date
  if (typeof timeout === "number" && Number.isInteger(timeout)) {
    expiryDate.setTime(Date.now() + timeout);
  }

  let cookie = `${cookieName}=${encodeURIComponent(cookieValue)}; expires=${expiryDate.toUTCString()}; path=/`;
  if (domain) {
    cookie += `; domain=${domain}`;
  }
  await browser.cookie.set(cookie);
}

// generate cookie if it does not exist
export async function setBrCookieIfNeeded(browser: Browser, document: WebPixelsDocument) {
  let brCookieValueCandidate = await browser.cookie.get('_br_uid_2');
  const brCookieValue = decodeURIComponent(brCookieValueCandidate);
  const returningVisitor: boolean = !!brCookieValueCandidate?.length;
  let uid: string;
  const cookieProps = {};

  if (!returningVisitor) {
    const randUid = Math.round(Math.random() * 10E12);
    uid = "uid=" + randUid;
  } else {
    // Split the existing cookie values and extract the parameters
    const parts = brCookieValue.split(":");
    // Loop over the split parts (starting from index 1 since index 0 is the special user ID that always comes first) and extract cookie values.
    uid = parts[0];
    // If cookie is corrupted then set the new uid
    if (uid.indexOf("uid=") == -1) {
      const randUid = Math.round(Math.random() * 10E12);
      uid = "uid=" + randUid;
    }
    // The old cookies go the the separate array for verification.
    parts.filter(part => part.substring(0, "_uid".length) !== "_uid").forEach(part => {
      // Add the valid key-value pairs to the parameters map
      const [key, value] = part.split("=");
      if (key && value) {
        cookieProps[key] = value;
      }
    });
  }
  // Update the mutable cookie properties and create the ones that are missing.
  // shopify connector version (never changed once set)
  cookieProps.v = cookieProps.v || 'shop2.2';
  // Creation timestamp (never changed once set)
  cookieProps.ts = cookieProps.ts || (new Date()).getTime();
  // Hit count (incremented on every page view)
  cookieProps.hc = Number(cookieProps.hc || 0) + 1;
  // Build the new cookie candidate string.
  let builder = [uid];
  for (let key in cookieProps) {
    if (key !== 'uid'){
      builder.push(key + "=" + cookieProps[key]);
    }
  }
  const newCookieValue = builder.join(":");
  if (!returningVisitor || newCookieValue !== brCookieValue && newCookieValue.length < 1000) {
    let cookieDomain = document.location.origin.split('://')[1];
    await setPersistentCookie('_br_uid_2', newCookieValue, browser, cookieDomain);
  }
}
