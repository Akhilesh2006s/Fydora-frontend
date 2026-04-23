const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

async function readErrorMessage(response, fallback) {
  let payload;
  try {
    payload = await response.json();
  } catch (_error) {
    payload = null;
  }

  if (payload?.details && payload?.message) return `${payload.message}: ${payload.details}`;
  if (payload?.message) return payload.message;
  return fallback;
}

export async function apiGet(path, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
  if (!response.ok) throw new Error(await readErrorMessage(response, `GET ${path} failed`));
  return response.json();
}

export async function apiPost(path, body, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(await readErrorMessage(response, `POST ${path} failed`));
  return response.json();
}

export async function apiPatch(path, body, token) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(await readErrorMessage(response, `PATCH ${path} failed`));
  return response.json();
}
