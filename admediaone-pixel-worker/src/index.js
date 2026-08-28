export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    if (url.pathname === "/collect") {

      const cf = request.cf || {};
      const ua = request.headers.get("User-Agent") || "";

      let deviceType = "Desktop";

      if (/mobile/i.test(ua)) {
        deviceType = "Mobile";
      }

      if (/tablet|ipad/i.test(ua)) {
        deviceType = "Tablet";
      }

      const payload = {
        event: "PageView",

        time_stamp: new Date().toISOString(),

        page_url:
          request.headers.get("Referer") || "",

        referrer:
          request.headers.get("Referer") || "",

        user_agent: ua,

        ip_address:
          request.headers.get("CF-Connecting-IP") || "",

        country:
          cf.country || "",

        region:
          cf.region || "",

        city:
          cf.city || "",

        device_type: deviceType,

        custom_metadata: {
          colo: cf.colo,
          timezone: cf.timezone,
          continent: cf.continent
        }
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
        status: response.status
      });
    }

    return Response.json({
      worker: "admediaone-pixel",
      status: "running"
    });
  }
};
