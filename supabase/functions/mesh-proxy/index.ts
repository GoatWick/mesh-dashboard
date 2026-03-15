const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deviceUrl, endpoint, method, body } = await req.json();

    if (!deviceUrl || !endpoint) {
      return new Response(
        JSON.stringify({ error: "deviceUrl and endpoint are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate endpoint starts with /
    if (!endpoint.startsWith("/") || endpoint.includes("..")) {
      return new Response(
        JSON.stringify({ error: "Invalid endpoint path" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = `${deviceUrl.replace(/\/$/, "")}${endpoint}`;

    const fetchOptions: RequestInit = {
      method: method || "GET",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
    };

    if (body && method !== "GET") {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Device returned HTTP ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message ?? "Proxy request failed" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
