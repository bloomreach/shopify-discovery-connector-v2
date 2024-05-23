import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import polarisTranslations from "@shopify/polaris/locales/en.json";
import { I18nContext, I18nManager, useI18n } from "@shopify/react-i18n";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import "@shopify/polaris/build/esm/styles.css";
import "react-toggle/style.css";
import "../../style/index.css";
import { authenticate } from "../shopify.server";
import { getAccount, getStore, installStore } from "~/services";

import en from "./app.en.json";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  console.log("log: Index: loader");
  const shopUrl = session.shop;
  const store = await getStore(shopUrl);
  if (!store?.default_templates_added) {
    await installStore(admin, shopUrl);
  }
  const account = await getAccount(admin);
  const setupComplete = !!(account && (account.account_id || account.domain_key || account.auth_key));
  return json({ setupComplete, apiKey: process.env.SHOPIFY_API_KEY || "" });
};

const i18nManager = new I18nManager({
  locale: 'en',
  fallbackLocale: 'en',
  onError(error) {
    console.log("log: I18nManager: error: ", error);
  },
});

export interface AppContext {
  setupComplete: boolean;
}

export default function App() {
  const { setupComplete, apiKey } = useLoaderData<typeof loader>();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey} i18n={polarisTranslations}>
      <I18nContext.Provider value={i18nManager}>
        <ui-nav-menu>
          <Link to="/app" rel="home">
            Dashboard
          </Link>
          <Link to="/app/indexing">Indexing</Link>
          {setupComplete && (<>
          <Link to="/app/search">Search</Link>
          <Link to="/app/autosuggest">Autosuggest</Link>
          <Link to="/app/collections">Collections</Link>
          <Link to="/app/recommendations">Recommendations</Link>
          <Link to="/app/pixel">Pixel</Link>
          </>)}
          <Link to="/app/optimize">Optimize</Link>
          <Link to="/app/settings">Settings</Link>
        </ui-nav-menu>
        <Masthead />
        <Outlet context={{ setupComplete }} />
      </I18nContext.Provider>
    </AppProvider>
  );
}

function Masthead() {
  const [i18n] = useI18n({
    id: "Masthead",
    translations: {
      en,
    },
  });
  return (
    <ui-title-bar title={i18n.translate("Masthead.title")}>
      <a href="https://documentation.bloomreach.com/discovery/docs/shopify-app-user-guide" target="_blank" rel="noreferrer">{i18n.translate("Masthead.action")}</a>
    </ui-title-bar>
  )
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
