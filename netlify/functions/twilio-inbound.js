// netlify/functions/twilio-inbound.js
exports.handler = async (event) => {
  try {
    const params = new URLSearchParams(event.body || "");
    const From = params.get("From");       // sender (client)
    const To = params.get("To");           // your Twilio number
    const Body = params.get("Body");       // message text
    const MessageSid = params.get("MessageSid");

    console.log("Inbound SMS:", { From, To, Body, MessageSid });

    const baseUrl =
      process.env.URL ||
      process.env.DEPLOY_URL ||
      process.env.SITE_URL ||
      process.env.NEXT_PUBLIC_APP_URL;

    if (baseUrl) {
      await fetch(`${baseUrl.replace(/\/$/, "")}/api/twilio/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: event.body || "",
      });
    }

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`;

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/xml" },
      body: twiml,
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 200, body: "" }; // Twilio just needs 200
  }
};
