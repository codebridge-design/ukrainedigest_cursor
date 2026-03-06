function resolveSiteUrl() {
  const candidates = [process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL];
  for (const candidate of candidates) {
    const value = String(candidate || "").trim().replace(/\/+$/, "");
    if (value) return value;
  }
  return null;
}

exports.handler = async () => {
  const siteUrl = resolveSiteUrl();
  const triggerSecret = String(process.env.INGEST_TRIGGER_SECRET || "").trim();

  if (!siteUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "Site URL is not available in environment" }),
    };
  }

  if (!triggerSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "INGEST_TRIGGER_SECRET is not configured" }),
    };
  }

  const endpoint = `${siteUrl}/.netlify/functions/ingest-background`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "x-ingest-secret": triggerSecret,
    },
  });

  if (!response.ok && response.status !== 202) {
    const body = await response.text();
    return {
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: `Background ingestion trigger failed with status ${response.status}`,
        details: body || null,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      ok: true,
      message: "Background ingestion was triggered",
      status: response.status,
    }),
  };
};
