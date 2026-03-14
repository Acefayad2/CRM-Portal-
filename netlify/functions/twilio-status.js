// netlify/functions/twilio-status.js
exports.handler = async (event) => {
  try {
    const params = new URLSearchParams(event.body || "");
    const MessageSid = params.get("MessageSid");
    const MessageStatus = params.get("MessageStatus");

    console.log("Status callback:", { MessageSid, MessageStatus });

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

    return { statusCode: 200, body: "ok" };
  } catch (e) {
    console.error(e);
    return { statusCode: 200, body: "ok" };
  }
};
