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


	const RUNTIME_VERSION = "1.0.7";


function randomId() {
  return crypto.randomUUID().replace(/-/g, "");
}

async function getUserId(request) {
  const cookie =
    request.headers.get("Cookie") || "";

  const match =
    cookie.match(/admo_uid=([^;]+)/);

  if (match) {
    return match[1];
  }

  return randomId();
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

async function getCampaign(env, hostname, ctx) {

const cacheKey =
  new Request(
    `https://campaign-cache/${hostname}`
  );

const cache =
  caches.default;

const cached =
  await cache.match(cacheKey);

if (cached) {
  return await cached.json();
}

let response;

try {

response = await fetch(
  `${env.SUPABASE_URL}/campaigns?status=eq.true&select=id,ad_url,priority,start_date,end_date,audience_rules`,
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

if (!c.audience_rules) {
  return false;
}

const campaignDomain =
  (c.audience_rules?.domain || "")
    .trim()
    .toLowerCase()
    .replace(/^www\./,'');

const requestDomain =
  hostname
    .trim()
    .toLowerCase()
    .replace(/^www\./,'');

if (campaignDomain !== requestDomain) {
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

const matchedCampaign =
  matchedCampaigns[0] || null;

 ctx.waitUntil(
   cache.put(
     cacheKey,
     new Response(
       JSON.stringify(
         matchedCampaign
       ),
       {
         headers: {
           "Cache-Control":
             "public, max-age=60"
         }
       }
     )
   )
 );

return matchedCampaign;

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
      "Cache-Control": "public, max-age=86400"
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

function executeDecision(data){

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

}

window.__ADMO_DECISION__ = null;

window.__ADMO_EXECUTED__ = false;

let engagementScore = 0;
let pageStartTime = Date.now();

let mouseMoveCount = 0;
let scrollCount = 0;
let keydownCount = 0;

function addEngagement(points){
  engagementScore += points;
}

document.addEventListener(
  "mousemove",
  () => {
    mouseMoveCount++;
    addEngagement(1);
  },
  { passive:true }
);

document.addEventListener(
  "scroll",
  () => {
    scrollCount++;
    addEngagement(2);
  },
  { passive:true }
);

document.addEventListener(
  "keydown",
  () => {
    keydownCount++;
    addEngagement(3);
  }
);

fetch(
  collectUrl,
  {
    method:"GET",
    keepalive:true
  }
)
.then(r => r.json())
.then(function(data){

  window.__ADMO_DECISION__ = data;

})
.catch(() => {});

setInterval(function(){

  if(window.__ADMO_EXECUTED__){
    return;
  }

  if(!window.__ADMO_DECISION__){
    return;
  }

  const cfg =
    window.__ADMO_DECISION__.engagement_profile ||
    {};

  const requiredScore =
    cfg.minimum_score || 5;

  const requiredDwell =
    cfg.dwell_seconds || 15;

  const dwellTime =
    Math.floor(
      (Date.now() - pageStartTime) / 1000
    );

  if(
    engagementScore < requiredScore
  ){
    return;
  }

  if(
    dwellTime < requiredDwell
  ){
    return;
  }

  const engagementUrl =
    collectUrl +
    "&event=engagement" +
    "&engagement_score=" +
    encodeURIComponent(engagementScore) +
    "&mouse_moves=" +
    encodeURIComponent(mouseMoveCount) +
    "&scroll_count=" +
    encodeURIComponent(scrollCount) +
    "&keydown_count=" +
    encodeURIComponent(keydownCount) +
    "&dwell_seconds=" +
    encodeURIComponent(dwellTime);

  fetch(
    engagementUrl,
    {
      method:"GET",
      keepalive:true
    }
  )
  .catch(() => {});

  window.__ADMO_EXECUTED__ = true;

  executeDecision(
    window.__ADMO_DECISION__
  );

},1000);

document.addEventListener(
  "visibilitychange",
  function(){

    if(
      document.visibilityState !==
      "visible"
    ){
      return;
    }

    const now =
      Date.now();

    const lastCheck =
      parseInt(
        localStorage.getItem(
          "admo_last_b_check"
        ) || "0"
      );

    if(
      now - lastCheck <
      60000
    ){
      return;
    }

    localStorage.setItem(
      "admo_last_b_check",
      now
    );

    fetch(
      "${url.origin}/b",
      {
        method:"GET",
        keepalive:true
      }
    )
    .then(r => r.json())
    .then(executeDecision)
    .catch(() => {});
  }
);

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
      "public,max-age=86400"
  }
});

}

  /*
   * Lightweight decision endpoint
   */

if (url.pathname === "/b") {

    const userId =
      await getUserId(request);


    const referer =
      request.headers.get("Referer") || "";

    const origin =
      request.headers.get("Origin") || "";

    let host = null;

    try {

      if (referer) {

        host =
          new URL(referer).hostname;

      } else if (origin) {

        host =
          new URL(origin).hostname;
      }

    } catch(e) {}

    let campaignDecision =
      "noop";

    let campaignUrl =
      null;

    if (host) {

      try {

        const campaign =
          await getCampaign(
            env,
            host,
            ctx
          );

        if (campaign) {

          campaignDecision =
            "inject";

          campaignUrl =
            campaign.ad_url;
        }

      } catch(e) {}
    }

    return new Response(
      JSON.stringify({
        success: true,

        user_id: userId,

        action: campaignDecision,
        ad_url: campaignUrl,
        host: host,
        reason:
          campaignDecision === "inject"
            ? "campaign_active"
            : "no_campaign_match",
        cache_ttl: 60,

        audience_count:
          campaignDecision === "inject"
            ? 1
            : 0,

        decision_source:
          "ai_retarget_engine",

        decision_priority:
          campaignDecision === "inject"
            ? 100
            : 0,

        decision_page_host:
          host,

        decision_expires_at:
          Math.floor(Date.now()/1000)+60,

        ownership_locked:
          false,

        runtime_config: {
          policy_version: "v2",
          cache_strategy:
            "shared_local_storage",
          decision_engine:
            "behavioral_retargeting",
          reactive_detection:
            true
        },

        detect: {
          mode: "passive",
          signals: [
            "page_visibility",
            "navigation_history",
            "host_affinity",
            "engagement"
          ]
        },

        evaluated_at:
          new Date().toISOString()
      }),
      {
        headers: {
          "Content-Type":
            "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control":
            "no-store",
          "Set-Cookie":
            `admo_uid=${userId}; Path=/; Max-Age=31536000; SameSite=Lax`
        }
      }
    );
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

const eventType =
  url.searchParams.get("event") ||
  "bootstrap";

const engagementScoreMetric =
  parseInt(
    url.searchParams.get("engagement_score") || "0"
  );

const mouseMovesMetric =
  parseInt(
    url.searchParams.get("mouse_moves") || "0"
  );

const scrollCountMetric =
  parseInt(
    url.searchParams.get("scroll_count") || "0"
  );

const keydownCountMetric =
  parseInt(
    url.searchParams.get("keydown_count") || "0"
  );

const dwellSecondsMetric =
  parseInt(
    url.searchParams.get("dwell_seconds") || "0"
  );

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

let campaign = null;

if (host) {

try {

  campaign =
    await Promise.race([
      getCampaign(
        env,
        host,
        ctx
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

  const threshold =
    campaign.audience_rules
      ?.engagement
      ?.threshold || 10;

  const dwellRequired =
    campaign.audience_rules
      ?.engagement
      ?.dwell_seconds || 15;

  const qualifies =
    engagementScoreMetric >= threshold
    &&
    dwellSecondsMetric >= dwellRequired;

  if (qualifies) {

    campaignDecision =
      "inject";

    campaignUrl =
      campaign.ad_url;

    campaignReason =
      "engagement_matched";

  } else {

    campaignDecision =
      "noop";

    campaignUrl =
      null;

    campaignReason =
      "engagement_not_met";
  }
}

}

const payload = {

  event: eventType,
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
  page_title: pageTitle,

  engagement_score:
    engagementScoreMetric,

  mouse_moves:
    mouseMovesMetric,

  scroll_count:
    scrollCountMetric,

  keydown_count:
    keydownCountMetric,

  dwell_seconds:
    dwellSecondsMetric
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
  reason: campaignReason,

  engagement_profile:
    campaign?.audience_rules?.engagement_profile ||
    "balanced",

  engagement:
    campaign?.audience_rules?.engagement || {
      threshold: 10,
      dwell_seconds: 15
    }

}),

    {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
        "Cache-Control": "no-store, no-cache, must-revalidate"
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
