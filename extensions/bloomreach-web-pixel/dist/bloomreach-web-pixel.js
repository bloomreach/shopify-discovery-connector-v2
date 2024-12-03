(()=>{var W=Object.create;var S=Object.defineProperty,z=Object.defineProperties,B=Object.getOwnPropertyDescriptor,H=Object.getOwnPropertyDescriptors,K=Object.getOwnPropertyNames,P=Object.getOwnPropertySymbols,Q=Object.getPrototypeOf,E=Object.prototype.hasOwnProperty,T=Object.prototype.propertyIsEnumerable;var q=(e,t,c)=>t in e?S(e,t,{enumerable:!0,configurable:!0,writable:!0,value:c}):e[t]=c,n=(e,t)=>{for(var c in t||(t={}))E.call(t,c)&&q(e,c,t[c]);if(P)for(var c of P(t))T.call(t,c)&&q(e,c,t[c]);return e},p=(e,t)=>z(e,H(t));var L=(e,t)=>{var c={};for(var r in e)E.call(e,r)&&t.indexOf(r)<0&&(c[r]=e[r]);if(e!=null&&P)for(var r of P(e))t.indexOf(r)<0&&T.call(e,r)&&(c[r]=e[r]);return c};var h=(e,t)=>()=>(e&&(t=e(e=0)),t);var V=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var Y=(e,t,c,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let u of K(t))!E.call(e,u)&&u!==c&&S(e,u,{get:()=>t[u],enumerable:!(r=B(t,u))||r.enumerable});return e};var Z=(e,t,c)=>(c=e!=null?W(Q(e)):{},Y(t||!e||!e.__esModule?S(c,"default",{value:e,enumerable:!0}):c,e));var m=(e,t,c)=>new Promise((r,u)=>{var R=l=>{try{f(c.next(l))}catch(v){u(v)}},s=l=>{try{f(c.throw(l))}catch(v){u(v)}},f=l=>l.done?r(l.value):Promise.resolve(l.value).then(R,s);f((c=c.apply(e,t)).next())});var j,C=h(()=>{j="WebPixel::Render"});var O,J=h(()=>{C();O=e=>shopify.extend(j,e)});var M=h(()=>{J()});var X=h(()=>{M()});function b(e){return e?encodeURIComponent(e).replaceAll("-","%2D").replaceAll("_","%5F").replaceAll("!","%21").replaceAll("~","%7E").replaceAll("*","%2A").replaceAll("'","%27").replaceAll("(","%28").replaceAll(")","%29"):""}function _(e){console.log("sendPixelData: data: ",e);let t=Object.keys(e).filter(c=>!!e[c]).map(c=>`${c}=${e[c]}`).join("&");console.log("sendPixelData: params: ",t),fetch(`https://p.brsrvr.com/pix.gif?${t}`,{method:"GET",mode:"no-cors"})}function F(e,t){if(t==="handle"&&e.url){let c=e.url.lastIndexOf("/"),r=e.url.indexOf("?");if(c>=0){let u=r>c?e.url.slice(c+1,r):e.url.slice(c+1);if(u)return u}}return e.id}var G=h(()=>{"use strict"});var U=V(y=>{"use strict";X();G();O(u=>m(y,[u],function*({analytics:e,browser:t,init:c,settings:r}){var v;let R=r.account_id,s=null;try{let a=yield t.localStorage.getItem("br_data");a&&(s=JSON.parse(a))}catch(a){}if(!s)return;let f=yield t.cookie.get("_br_uid_2"),l={acct_id:R,cookie2:f,rand:Math.round(Math.random()*1e13),url:b(c.context.document.location.href),ref:b(c.context.document.referrer),title:b(c.context.document.title),user_id:(v=c.data.customer)==null?void 0:v.id,domain_key:s.domain_key,debug:s.debug};s=n(n({},s),l),e.subscribe("page_viewed",a=>{console.log("page_viewed");let o=p(n({},s),{type:"pageview"});_(o)}),e.subscribe("checkout_completed",a=>{var g,w,D;let o=a.data.checkout;console.log("checkout_completed: checkout",o);let i=p(n({},l),{type:"pageview",ptype:"other",is_conversion:1,basket_value:`${(w=(g=o.totalPrice)==null?void 0:g.amount)!=null?w:""}`,order_id:(D=o.order)==null?void 0:D.id,currency:o.currencyCode});i.basket=o.lineItems.reduce((x,d)=>{var k,A,$,N,I;return x.concat("!",`i${b((A=(k=d.variant)==null?void 0:k.product.id)!=null?A:"")}%27`,($=d.variant)!=null&&$.sku?`s${b(d.variant.sku)}%27`:"",`n${b(d.title)}%27`,`q${d.quantity}%27`,`p${(I=(N=d.variant)==null?void 0:N.price.amount)!=null?I:""}`)},""),_(i),t.localStorage.removeItem("br_data")}),e.subscribe("product_added_to_cart",a=>m(y,null,function*(){let o=a.data.cartLine,i=yield t.sessionStorage.getItem("br_atc_event_data");if(!i||!o)return;let g=null;try{g=JSON.parse(i)}catch(A){}if(!g)return;console.log("product_added_to_cart: cartLine: ",o),console.log("product_added_to_cart: brAtcEventData: ",g);let k=g,{pid_field:w}=k,D=L(k,["pid_field"]),x=F(o.merchandise.product,w),d=n(p(n({},s),{group:"cart",type:"event"}),D);g.etype==="click-add"?(d.prod_id=x,d.prod_name=b(o.merchandise.product.title),d.sku=o.merchandise.sku):g.etype==="widget-add"&&(d.item_id=x,d.sku=o.merchandise.sku),_(d),t.sessionStorage.removeItem("br_atc_event_data")})),e.subscribe("br_product_quickview",a=>m(y,null,function*(){let{customData:o}=a;console.log("br_product_quickview: customData: ",o);let i=n(p(n({},s),{group:"product",etype:"quickview",type:"event"}),o);_(i)})),e.subscribe("br_suggest_submit",a=>m(y,null,function*(){let{customData:o}=a;console.log("br_suggest_submit: customData: ",o);let i=n(p(n({},s),{group:"suggest",etype:"submit",type:"event"}),o);_(i)})),e.subscribe("br_suggest_click",a=>m(y,null,function*(){let{customData:o}=a;console.log("br_suggest_click: customData: ",o);let i=n(p(n({},s),{group:"suggest",etype:"click",type:"event"}),o);_(i)})),e.subscribe("br_widget_click",a=>m(y,null,function*(){let{customData:o}=a;console.log("br_widget_click: customData: ",o);let i=n(p(n({},s),{group:"widget",etype:"widget-click",type:"event"}),o);_(i)})),e.subscribe("br_widget_view",a=>m(y,null,function*(){let{customData:o}=a;console.log("br_widget_view: customData: ",o);let i=n(p(n({},s),{group:"widget",etype:"widget-view",type:"event"}),o);_(i)}))}))});var pe=Z(U());})();