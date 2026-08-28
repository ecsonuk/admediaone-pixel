export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    if (url.pathname === "/collect") {

      const payload = {
        event: "PageView",
        page_url: request.headers.get("Referer") || "",
        referrer: request.headers.get("Referer") || "",
        user_agent: request.headers.get("User-Agent") || "",
        time_stamp: new Date().toISOString()
      };

      const response = await fetch(
        `${env.SUPABASE_URL}/events`,
        {
          method: "POST",
          headers: {
            "apikey": env.SUPABASE_API_KEY,
            "Authorization": `Bearer ${env.SUPABASE_API_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
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
  status: "running",
  version: "git-test-v1"
});
  }
};
