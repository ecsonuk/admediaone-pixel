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

    /*
     * Pixel JS
     */
    if (url.pathname === "/pixel.js") {

      const js = `
(function() {

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

  const collectUrl =
    "${url.origin}/collect" +
    "?visitor_id=" + encodeURIComponent(visitorId) +
    "&session_id=" + encodeURIComponent(sessionId) +
    "&screen_resolution=" + encodeURIComponent(screenResolution);

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

      const userAgent =
        request.headers.get("User-Agent") || "";

      const payload = {

        event: "PageView",

        visitor_id: visitorId,

        session_id: sessionId,

        screen_resolution: screenResolution,

        page_url:
          request.headers.get("Referer") || "",

        referrer:
          request.headers.get("Referer") || "",

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
              `Bearer \${env.SUPABASE_API_KEY}`,
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

    return Response.json({
      worker: "admediaone-pixel",
      status: "running"
    });
  }
};
