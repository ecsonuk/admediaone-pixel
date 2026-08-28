export default {
  async fetch(request, env, ctx) {

    const url = new URL(request.url);

    if (url.pathname === "/collect") {

      const visitorId =
        url.searchParams.get("visitor_id") ||
        request.headers.get("X-Visitor-Id") ||
        null;

      const sessionId =
        url.searchParams.get("session_id") ||
        request.headers.get("X-Session-Id") ||
        null;

      const screenResolution =
        url.searchParams.get("screen_resolution") ||
        request.headers.get("X-Screen-Resolution") ||
        null;

      const userAgent =
        request.headers.get("User-Agent") || "";

      const country =
        request.cf?.country || null;

      const region =
        request.cf?.region || null;

      const city =
        request.cf?.city || null;

      const payload = {
        event: "PageView",

        page_url:
          request.headers.get("Referer") || "",

        referrer:
          request.headers.get("Referer") || "",

        user_agent: userAgent,

        visitor_id: visitorId,

        session_id: sessionId,

        screen_resolution: screenResolution,

        device_type:
          /mobile/i.test(userAgent)
            ? "Mobile"
            : "Desktop",

        country,
        region,
        city,

        time_stamp:
          new Date().toISOString()
      };

      const response = await fetch(
        `${env.SUPABASE_URL}/events`,
        {
          method: "POST",
          headers: {
            apikey: env.SUPABASE_API_KEY,
            Authorization: `Bearer ${env.SUPABASE_API_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal"
          },
          body: JSON.stringify(payload)
        }
      );

      return Response.json({
        success: response.ok,
        status: response.status,
        country,
        city
      });
    }

    return Response.json({
      worker: "admediaone-pixel",
      status: "running"
    });
  }
};
