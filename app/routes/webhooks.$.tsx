import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { deleteStore, uninstallStore } from "~/services";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  switch (topic) {
    case "APP_UNINSTALLED":
      if (session) {
        await uninstallStore(shop);
        console.log("webhooks: APP_UNINSTALLED: success");
      }

      break;
    case "CUSTOMERS_DATA_REQUEST":
      console.log("webhooks: CUSTOMERS_DATA_REQUEST: success");
      break;
    case "CUSTOMERS_REDACT":
      console.log("webhooks: CUSTOMERS_REDACT: success");
      break;
    case "SHOP_REDACT":
      await deleteStore(payload.shop_domain);
      console.log("webhooks: SHOP_REDACT: success");

      break;
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  throw new Response();
};
