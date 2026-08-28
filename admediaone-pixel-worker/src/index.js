export default {
  async fetch(request, env) {

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
    if (url.pathname === "/pixel.js") {

      const js = `
(function() {

  // Prevent duplicate execution
  if (window.__ADMO_PIXEL_LOADED__) {
    return;
  }

  window.__ADMO_PIXEL_LOADED__ = true;

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
  "&page_title=" + encodeURIComponent(pageTitle);

  fetch(collectUrl, {
    method: "GET",
    keepalive: true
  }).catch(() => {});

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

const pageTitle =
  url.searchParams.get("page_title");

      const userAgent =
        request.headers.get("User-Agent") || "";

const browser =
  detectBrowser(userAgent);

const osName =
  detectOS(userAgent);

const payload = {

  event: "PageView",

  visitor_id: visitorId,

  session_id: sessionId,

  screen_resolution: screenResolution,

  page_url: pageUrl || "",

  referrer: referrer || "",

  user_agent: userAgent,

  device_type:
    /mobile/i.test(userAgent)
      ? "Mobile"
      : "Desktop",

  browser_name:
    browser.name,

  browser_version:
    browser.version,

  os_name:
    osName,

  os_version:
    null,

  device_info: {
    language: language,
    timezone: timezone,
    platform: platform
  },

custom_metadata: {
  page_title:
    pageTitle
},

  country:
    request.cf?.country || null,

  region:
    request.cf?.region || null,

  city:
    request.cf?.city || null,

  time_stamp:
    new Date().toISOString()
};

      const response = await fetch(
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
      );

      return new Response(
        JSON.stringify({
          success: response.ok,
          status: response.status
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
