const MAX_RETRIES = 2;
const INITIAL_RETRY_DELAY = 1500;
const RETRYABLE = [429, 500, 502, 503, 504];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function withRetry(label, doRequest, signal) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) throw new Error("Cancelled");
    const { ok, status, message, value } = await doRequest();
    if (ok) return value;
    console.error(`${label} error:`, { status, message, attempt: attempt + 1 });
    if (!RETRYABLE.includes(status) || attempt === MAX_RETRIES) throw new Error(message);
    const delay = INITIAL_RETRY_DELAY * 2 ** attempt;
    console.log(`${label} temporary error (${status}). Retrying in ${delay}ms...`);
    await sleep(delay);
  }
}
