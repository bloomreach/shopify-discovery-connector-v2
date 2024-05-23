import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export default function App() {
  return (
    <html>
      <head>
        <title>Bloomreach Connector</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/icon.svg" type="images/svg+xml" />
        <link
          rel="icon"
          href="/favicon-192x192.png"
          type="images/png"
          sizes="192x192"
        />
        <link
          rel="icon"
          href="/favicon-512x512.png"
          type="images/png"
          sizes="512x512"
        />
        <link rel="apple-touch-icon" href="/favicon-180x180.png" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
