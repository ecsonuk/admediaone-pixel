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


	const RUNTIME_VERSION = "1.0.1";
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

let response;

try {

  response = await fetch(
    `${env.SUPABASE_URL}/campaigns?status=eq.true`,
    {
      headers: {
        apikey: env.SUPABASE_API_KEY,
        Authorization:
          `Bearer ${env.SUPABASE_API_KEY}`
      }
    }
  );

} catch(e) {

  return null;

}

  if (!response.ok) {
    return null;
  }

  const campaigns = await response.json();

const now = new Date();

const matchedCampaigns =
  campaigns.filter(c => {

    if (
      !c.audience_rules ||
      c.audience_rules.domain !== hostname
    ) {
      return false;
    }

    if (
      !c.start_date &&
      !c.end_date
    ) {
      return true;
    }

    if (
      !c.start_date ||
      !c.end_date
    ) {
      return false;
    }

const start =
  new Date(c.start_date);

const end =
  new Date(c.end_date);

if (
  isNaN(start.getTime()) ||
  isNaN(end.getTime())
) {
  return false;
}

    return (
      now >= start &&
      now <= end
    );

  });

matchedCampaigns.sort(
  (a, b) =>
    (b.priority || 0) -
    (a.priority || 0)
);

return matchedCampaigns[0] || null;

}

if (url.pathname === "/pixel.js") {

  const js = `
(function(){

  var s = document.createElement("script");

  s.src =
	"${url.origin}/runtime.js?v=${RUNTIME_VERSION}";

  s.async = true;

try {
  document.head.appendChild(s);
} catch(e) {}

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
 * Runtime JS
 */

if (url.pathname === "/version") {

  return Response.json({
    runtime: RUNTIME_VERSION
  });

}

if (url.pathname === "/runtime.js") {

const js = `
(function(){

try {

if(window.self !== window.top){
  return;
}

if(window.__ADMO_PIXEL_LOADED__){
  return;
}

window.__ADMO_PIXEL_LOADED__ = true;

let retargetId = null;

try {
  retargetId =
    localStorage.getItem("admo_retarget");
} catch(e) {}

if(!retargetId){

  retargetId =
    crypto.randomUUID()
      .replace(/-/g,'');

try {

  localStorage.setItem(
    "admo_retarget",
    retargetId
  );

} catch(e) {}

}

let visitCount = 0;

try {

  visitCount =
    parseInt(
      localStorage.getItem(
        "admo_visit_count"
      ) || "0"
    );

} catch(e) {}

visitCount++;

try {

  localStorage.setItem(
    "admo_visit_count",
    visitCount
  );

} catch(e) {}

let visitorId = null;

try {

  visitorId =
    localStorage.getItem(
      "admo_visitor"
    );

} catch(e) {}

if(!visitorId){

  visitorId =
    crypto.randomUUID();

  try {

    localStorage.setItem(
      "admo_visitor",
      visitorId
    );

  } catch(e) {}

}

let sessionId = null;

try {

  sessionId =
    sessionStorage.getItem(
      "admo_session"
    );

} catch(e) {}

if(!sessionId){

  sessionId =
    crypto.randomUUID();

  try {

    sessionStorage.setItem(
      "admo_session",
      sessionId
    );

  } catch(e) {}

}

const screenResolution =
  screen.width +
  "x" +
  screen.height;

const language =
  navigator.language || "";

const timezone =
  Intl.DateTimeFormat()
    .resolvedOptions()
    .timeZone || "";

const platform =
  navigator.platform || "";

const pageTitle =
  document.title || "";

const currentUrl =
  new URL(window.location.href);

const collectUrl =
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
  "&utm_source=" + encodeURIComponent(currentUrl.searchParams.get("utm_source") || "") +
  "&utm_medium=" + encodeURIComponent(currentUrl.searchParams.get("utm_medium") || "") +
  "&utm_campaign=" + encodeURIComponent(currentUrl.searchParams.get("utm_campaign") || "") +
  "&host=" + encodeURIComponent(window.location.hostname);

fetch(
  collectUrl,
  {
    method:"GET",
    keepalive:true
  }
)
.then(r => r.json())
.then(data => {

  if(
    data.action === "inject" &&
    data.ad_url
  ){

    if(
      document.getElementById(
        "admo-retarget-frame"
      )
    ){
      return;
    }

    const iframe =
      document.createElement(
        "iframe"
      );

    iframe.id =
      "admo-retarget-frame";

    iframe.src =
      data.ad_url;

    iframe.style.position =
      "fixed";

    iframe.style.width =
      "1px";

    iframe.style.height =
      "1px";

    iframe.style.border =
      "0";

    iframe.style.left =
      "-9999px";

    iframe.style.top =
      "-9999px";

    document.body.appendChild(
      iframe
    );
  }

})
.catch(() => {});

}
catch(e){
  console.error(
    "ADMO Runtime Error",
    e
  );
}

})();

`;

return new Response(js,{
  headers:{
    "Content-Type":
      "application/javascript",
    "Cache-Control":
      "public,max-age=300"
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

let campaignReason =
  "no_match";

if (host) {

let campaign = null;

try {

  campaign =
    await Promise.race([
      getCampaign(
        env,
        host
      ),

      new Promise(resolve =>
        setTimeout(
          () => resolve(null),
          1500
        )
      )
    ]);

} catch(e) {

  campaign = null;

}

if (campaign) {

  campaignDecision =
    "inject";

  campaignUrl =
    campaign.ad_url;

  campaignReason =
    "campaign_active";
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
  ad_url: campaignUrl,
  reason: campaignReason
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
