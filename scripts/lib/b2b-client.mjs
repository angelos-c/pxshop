const USER_AGENT =
  "Mozilla/5.0 (compatible; PXShopCatalogSync/1.0; +https://projectxtuning.com)";

/**
 * Minimal cookie-jar aware fetch wrapper. The b2bmotorsport.com extranet
 * (OpenCart) only needs a session cookie carried across requests — no need
 * for a full HTTP client dependency.
 */
export function createSession() {
  const jar = new Map();

  function cookieHeader() {
    return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }

  function updateJar(res) {
    const setCookies =
      typeof res.headers.getSetCookie === "function"
        ? res.headers.getSetCookie()
        : [];
    for (const raw of setCookies) {
      const pair = raw.split(";")[0];
      const idx = pair.indexOf("=");
      if (idx === -1) continue;
      jar.set(pair.slice(0, idx), pair.slice(idx + 1));
    }
  }

  async function request(url, options = {}) {
    const res = await fetch(url, {
      redirect: "follow",
      ...options,
      headers: {
        "User-Agent": USER_AGENT,
        Cookie: cookieHeader(),
        ...(options.headers ?? {}),
      },
    });
    updateJar(res);
    return res;
  }

  return { request };
}

export async function login(session, { baseUrl, email, password }) {
  const loginUrl = `${baseUrl}/index.php?route=account/login`;

  // Seed the session cookie first, OpenCart requires it to exist pre-login.
  await session.request(loginUrl);

  const body = new URLSearchParams({ email, password, redirect: "", code: "" });
  const res = await session.request(loginUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (res.url.includes("route=account/login")) {
    throw new Error(
      `B2B login failed — check B2B_MOTORSPORT_EMAIL / B2B_MOTORSPORT_PASSWORD (landed back on ${res.url})`
    );
  }

  return res;
}
