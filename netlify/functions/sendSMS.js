// Netlify Function: send SMS via Beem Africa
// POST { message: string, numbers: string[] }
// Env: BEEM_API_KEY, BEEM_SECRET_KEY, BEEM_SENDER_ID

exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors, body: "ok" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const { message, numbers } = body;
  if (!message || typeof message !== "string" || message.length > 1600) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Invalid message" }) };
  }
  if (!Array.isArray(numbers) || numbers.length === 0 || numbers.length > 1000) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: "Invalid recipients" }) };
  }

  const API_KEY = process.env.BEEM_API_KEY;
  const SECRET  = process.env.BEEM_SECRET_KEY;
  const SENDER  = process.env.BEEM_SENDER_ID || "INFO";

  if (!API_KEY || !SECRET) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: "SMS provider not configured" }) };
  }

  // Normalize numbers (Beem expects intl format without '+')
  const recipients = numbers
    .map((n, i) => {
      let v = String(n).replace(/[^\d+]/g, "");
      if (v.startsWith("+")) v = v.slice(1);
      if (v.startsWith("0")) v = "255" + v.slice(1); // Tanzania default
      return { recipient_id: i + 1, dest_addr: v };
    })
    .filter((r) => r.dest_addr.length >= 9);

  const auth = "Basic " + Buffer.from(`${API_KEY}:${SECRET}`).toString("base64");

  try {
    const res = await fetch("https://apisms.beem.africa/v1/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: auth },
      body: JSON.stringify({
        source_addr: SENDER,
        schedule_time: "",
        encoding: 0,
        message,
        recipients
      })
    });

    const text = await res.text();
    let data; try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!res.ok) {
      return { statusCode: res.status, headers: cors, body: JSON.stringify({ success: false, provider: data }) };
    }

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({ success: true, sent: recipients.length, provider: data })
    };
  } catch (err) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ success: false, error: err.message }) };
  }
};
