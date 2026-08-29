export default {
async fetch(request, env, ctx) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "*"
        }
      });
    }

    const url = new URL(request.url);

function detectBrowser(ua) {

  if (ua.includes("Chrome")) {
    const m = ua.match(/Chrome\/([0-9.]+)/);
    return {
      name: "Chrome",
      version: m ? m[1] : null
    };
  }

  if (ua.includes("Firefox")) {
    const m = ua.match(/Firefox\/([0-9.]+)/);
    return {
      name: "Firefox",
      version: m ? m[1] : null
    };
  }

  if (ua.includes("Safari") && !ua.includes("Chrome")) {
    const m = ua.match(/Version\/([0-9.]+)/);
    return {
      name: "Safari",
      version: m ? m[1] : null
    };
  }

  return {
    name: "Unknown",
    version: null
  };
}

function detectOS(ua) {

  if (ua.includes("Windows"))
    return "Windows";

  if (ua.includes("Android"))
    return "Android";

  if (ua.includes("iPhone"))
    return "iOS";

  if (ua.includes("Mac"))
    return "macOS";

  if (ua.includes("Linux"))
    return "Linux";

  return "Unknown";
}

    /*
     * Pixel JS
     */

async function getCampaign(env, hostname) {

  const response = await fetch(
    `${env.SUPABASE_URL}/campaigns?status=eq.true`,
    {
      headers: {
        apikey: env.SUPABASE_API_KEY,
        Authorization:
          `Bearer ${env.SUPABASE_API_KEY}`
      }
    }
  );

  if (!response.ok) {
    return null;
  }

  const campaigns = await response.json();

  return campaigns.find(c =>
    c.audience_rules &&
    c.audience_rules.domain === hostname
  ) || null;
}

    if (url.pathname === "/pixel.js") {

const referer =
  request.headers.get("Referer") || "";

const hostname =
  referer
    ? new URL(referer).hostname
    : "";

const refererFallbackNeeded =
  !hostname;

const campaign =
  hostname
    ? await getCampaign(env, hostname)
    : null;

      const js = `
(function() {

if (window.self !== window.top) {
  return;
}

if (window.__ADMO_PIXEL_LOADED__) {
  return;
}

window.__ADMO_PIXEL_LOADED__ = true;

const campaignEnabled =
  ${campaign ? "true" : "false"};

const adUrl =
  "${campaign?.ad_url || ""}";

const refererFallbackNeeded =
  ${refererFallbackNeeded ? "true" : "false"};

let retargetId =
  localStorage.getItem("admo_retarget");

if (!retargetId) {
  retargetId =
    crypto.randomUUID().replace(/-/g, "");

  localStorage.setItem(
    "admo_retarget",
    retargetId
  );
}

let visitCount =
  parseInt(
    localStorage.getItem("admo_visit_count") || "0"
  );

visitCount++;

localStorage.setItem(
  "admo_visit_count",
  visitCount
);

  let visitorId = localStorage.getItem("admo_visitor");

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("admo_visitor", visitorId);
  }

  let sessionId = sessionStorage.getItem("admo_session");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("admo_session", sessionId);
  }

  const screenResolution =
    window.screen.width + "x" + window.screen.height;

const language = navigator.language || "";
const timezone =
  Intl.DateTimeFormat().resolvedOptions().timeZone || "";
const platform =
  navigator.platform || "";
const userAgent =
  navigator.userAgent || "";
const pageTitle =
  document.title || "";
const currentUrl =
  new URL(window.location.href);
const currentHost =
  window.location.hostname;
const utmSource =
  currentUrl.searchParams.get("utm_source");
const utmMedium =
  currentUrl.searchParams.get("utm_medium");
const utmCampaign =
  currentUrl.searchParams.get("utm_campaign");

let collectUrl =
  "${url.origin}/collect" +
  "?visitor_id=" + encodeURIComponent(visitorId) +
  "&session_id=" + encodeURIComponent(sessionId) +
  "&screen_resolution=" + encodeURIComponent(screenResolution) +
  "&page_url=" + encodeURIComponent(window.location.href) +
  "&referrer=" + encodeURIComponent(document.referrer || "") +
  "&language=" + encodeURIComponent(language) +
  "&timezone=" + encodeURIComponent(timezone) +
  "&platform=" + encodeURIComponent(platform) +
  "&retarget_id=" + encodeURIComponent(retargetId) +
  "&visit_count=" + encodeURIComponent(visitCount) +
  "&page_title=" + encodeURIComponent(pageTitle) +
  "&utm_source=" + encodeURIComponent(utmSource || "") +
  "&utm_medium=" + encodeURIComponent(utmMedium || "") +
  "&utm_campaign=" + encodeURIComponent(utmCampaign || "");

if (refererFallbackNeeded) {

  collectUrl +=
    "&host=" +
    encodeURIComponent(currentHost);
}

  fetch(collectUrl, {
    method: "GET",
    keepalive: true
  }).catch(() => {});

if (campaignEnabled && adUrl) {

  const iframe =
    document.createElement("iframe");

  iframe.src = adUrl;

  iframe.style.position = "fixed";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.border = "0";
  iframe.style.left = "-9999px";
  iframe.style.top = "-9999px";

if (!document.getElementById("admo-retarget-frame")) {

  iframe.id =
    "admo-retarget-frame";

  document.body.appendChild(
    iframe
  );
}

}   // <-- closes campaignEnabled block

})();
`;

      return new Response(js, {
        headers: {
          "Content-Type": "application/javascript",
          "Cache-Control": "public, max-age=300"
        }
      });
    }

    /*
     * Collect endpoint
     */
    if (url.pathname === "/collect") {

      const visitorId =
        url.searchParams.get("visitor_id");
      const sessionId =
        url.searchParams.get("session_id");
      const screenResolution =
        url.searchParams.get("screen_resolution");
      const pageUrl =
        url.searchParams.get("page_url");
      const referrer =
        url.searchParams.get("referrer");

const language =
  url.searchParams.get("language");
const timezone =
  url.searchParams.get("timezone");
const platform =
  url.searchParams.get("platform");
const retargetId =
  url.searchParams.get("retarget_id");
const visitCount =
  parseInt(
    url.searchParams.get("visit_count") || "1"
  );

const pageTitle =
  url.searchParams.get("page_title");
const utmSource =
  url.searchParams.get("utm_source");
const utmMedium =
  url.searchParams.get("utm_medium");
const utmCampaign =
  url.searchParams.get("utm_campaign");
const host =
  url.searchParams.get("host");
const userAgent =
  request.headers.get("User-Agent") || "";

const browser =
  detectBrowser(userAgent);
const osName =
  detectOS(userAgent);

let campaignDecision =
  "noop";

let campaignUrl =
  null;

if (host) {

  const campaign =
    await getCampaign(
      env,
      host
    );

  if (campaign) {

    campaignDecision =
      "inject";

    campaignUrl =
      campaign.ad_url;
  }
}

const payload = {

  event: "bootstrap",
  visitor_id: visitorId,
  session_id: sessionId,
  custom_id: "default",
  retarget_id: retargetId,
  screen_resolution: screenResolution,
  page_url: pageUrl || "",
  referrer: referrer || "",
  user_agent: userAgent,
  device_type:
    /mobile/i.test(userAgent)
      ? "Mobile"
      : "Desktop",
  country:
    request.cf?.country || null,
  region:
    request.cf?.region || null,
  city:
    request.cf?.city || null,
  browser_name:
    browser.name,
  browser_version:
    browser.version,
  os_name:
    osName,

custom_metadata: {
  campaign_id: utmCampaign || null,
  utm_source: utmSource || null,
  utm_medium: utmMedium || null,
  retarget_id: retargetId,
  visit_count: visitCount,
  screen_resolution: screenResolution,
  page_title: pageTitle
},

  device_info: {
    device_type:
      /mobile/i.test(userAgent)
        ? "Mobile"
        : "Desktop",

    screen_resolution:
      screenResolution,

    language:
      language,

    platform:
      platform,

    timezone:
      timezone
  },

  time_stamp:
    new Date().toISOString()
};

ctx.waitUntil(
  fetch(
    `${env.SUPABASE_URL}/events`,
    {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_API_KEY,
        Authorization:
          `Bearer ${env.SUPABASE_API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify(payload)
    }
  )
);

return new Response(
  JSON.stringify({
    success: true,
    action: campaignDecision,
    ad_url: campaignUrl
  }),

  {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "*"
    }
  }
);

    }

    return Response.json({
      worker: "admediaone-pixel",
      status: "running"
    });
  }
};
