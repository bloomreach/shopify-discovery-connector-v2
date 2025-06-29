import { register } from '@shopify/web-pixels-extension';
import { escape, getPid, removeRedundantBrUid2Cookie, sendPixelData } from './utils';

register(async ({ analytics, browser, init, settings }) => {
  // Bootstrap and insert pixel script tag here
  const accountId = settings.account_id;
  let br_data: Record<string, any> | null = null;
  try {
    const br_data_str = await browser.localStorage.getItem('br_data');
    if (br_data_str) {
      br_data = JSON.parse(br_data_str);
    }
  } catch (e) {
    //ignore
  }

  const br_region = await (async () => {
    try {
      const region = await browser.localStorage.getItem('br_region');
      return region || 'p.brsrvr.com';
    } catch {
      return 'p.brsrvr.com';
    }
  })();

  const br_pid_field: 'handle' | 'id' = await (async () => {
    try {
      const pid_field = (await browser.localStorage.getItem('br_pid_field')) as 'handle' | 'id';
      return pid_field || 'handle';
    } catch {
      return 'handle';
    }
  })();

  if (!br_data) {
    return;
  }

  await removeRedundantBrUid2Cookie(browser.cookie, init.context.document.location);

  const cookie2 = await browser.cookie.get('_br_uid_2');

  const commonData = {
    acct_id: accountId,
    cookie2: encodeURIComponent(cookie2),
    rand: Math.round(Math.random() * 10000000000000),
    url: escape(init.context.document.location.href),
    ref: escape(init.context.document.referrer),
    title: escape(init.context.document.title),
    user_id: init.data.customer?.id,
    domain_key: br_data.domain_key,
    view_id: br_data.view_id,
    debug: br_data.debug,
  };
  br_data = {
    ...br_data,
    ...commonData,
  };

  analytics.subscribe('page_viewed', (event) => {
    console.log('page_viewed');
    const data: Record<string, any> = {
      ...br_data,
      type: 'pageview',
    };
    console.log('data: ', data);
    sendPixelData(br_region, data);
  });

  analytics.subscribe('checkout_completed', (event) => {
    const checkout = event.data.checkout;

    const data: Record<string, any> = {
      ...commonData,
      type: 'pageview',
      ptype: 'other',
      is_conversion: 1,
      basket_value: `${checkout.totalPrice?.amount ?? ''}`,
      order_id: checkout.order?.id,
      currency: checkout.currencyCode,
    };

    data.basket = checkout.lineItems.reduce<string>((str, lineItem) => {
      const pid = getPid(lineItem.variant?.product, br_pid_field);

      return str.concat(
        '!',
        `i${escape(pid ?? '')}%27`,
        lineItem.variant?.sku ? `s${escape(lineItem.variant.sku)}%27` : '',
        `n${escape(lineItem.title)}%27`,
        `q${lineItem.quantity}%27`,
        `p${lineItem.variant?.price.amount ?? ''}`,
      );
    }, '');

    console.log('checkout_completed: checkout', checkout, data);

    sendPixelData(br_region, data);
    browser.localStorage.removeItem('br_data');
  });

  analytics.subscribe('product_added_to_cart', async (event) => {
    const cartLine = event.data.cartLine;
    const brAtcEventData = await browser.sessionStorage.getItem('br_atc_event_data');
    if (!brAtcEventData || !cartLine) {
      return;
    }

    let eventData: Record<string, any> | null = null;
    try {
      eventData = JSON.parse(brAtcEventData);
    } catch (e) {
      //ignore
    }
    if (!eventData) {
      return;
    }

    console.log('product_added_to_cart: cartLine: ', cartLine);
    console.log('product_added_to_cart: brAtcEventData: ', eventData);

    const { pid_field, ...extraParams } = eventData;
    const pid = getPid(cartLine.merchandise.product, pid_field);
    const data: Record<string, any> = {
      ...br_data,
      group: 'cart',
      type: 'event',
      ...extraParams,
    };

    if (eventData.etype === 'click-add') {
      data.prod_id = pid;
      data.prod_name = escape(cartLine.merchandise.product.title);
      data.sku = cartLine.merchandise.sku;
    } else if (eventData.etype === 'widget-add') {
      data.item_id = pid;
      data.sku = cartLine.merchandise.sku;
    }

    sendPixelData(br_region, data);
    browser.sessionStorage.removeItem('br_atc_event_data');
  });

  analytics.subscribe('br_product_quickview', async (event) => {
    const { customData } = event;
    console.log('br_product_quickview: customData: ', customData);
    const data: Record<string, any> = {
      ...br_data,
      group: 'product',
      etype: 'quickview',
      type: 'event',
      ...customData,
    };
    sendPixelData(br_region, data);
  });

  analytics.subscribe('br_suggest_submit', async (event) => {
    const { customData } = event;
    console.log('br_suggest_submit: customData: ', customData);
    const data: Record<string, any> = {
      ...br_data,
      group: 'suggest',
      etype: 'submit',
      type: 'event',
      ...customData,
    };
    sendPixelData(br_region, data);
  });

  analytics.subscribe('br_suggest_click', async (event) => {
    const { customData } = event;
    console.log('br_suggest_click: customData: ', customData);
    const data: Record<string, any> = {
      ...br_data,
      group: 'suggest',
      etype: 'click',
      type: 'event',
      ...customData,
    };
    sendPixelData(br_region, data);
  });

  analytics.subscribe('br_widget_click', async (event) => {
    const { customData } = event;
    console.log('br_widget_click: customData: ', customData);
    const data: Record<string, any> = {
      ...br_data,
      group: 'widget',
      etype: 'widget-click',
      type: 'event',
      ...customData,
    };
    sendPixelData(br_region, data);
  });

  analytics.subscribe('br_widget_view', async (event) => {
    const { customData } = event;
    console.log('br_widget_view: customData: ', customData);
    const data: Record<string, any> = {
      ...br_data,
      group: 'widget',
      etype: 'widget-view',
      type: 'event',
      ...customData,
    };
    sendPixelData(br_region, data);
  });
});
