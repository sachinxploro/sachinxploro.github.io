const crypto = require("node:crypto");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-flow-key",
};

function jsonResponse(status, body) {
  return {
    status: status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
    body: JSON.stringify(body),
  };
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    return "Request body must be a JSON object.";
  }

  const contact = payload.contact;
  if (!contact || typeof contact !== "object") {
    return "Missing contact object.";
  }

  for (const field of ["name", "company", "email"]) {
    if (!String(contact[field] || "").trim()) {
      return `Missing contact.${field}.`;
    }
  }

  const selected = payload.selectedRequirements;
  if (!Array.isArray(selected) || selected.length === 0) {
    return "At least one selected requirement is required.";
  }

  return null;
}

module.exports = async function (context, req) {
  if (req.method === "OPTIONS") {
    return jsonResponse(200, {
      success: true,
      preflight: true,
    });
  }

  let payload = req.body;
  if (!payload && req.rawBody) {
    try {
      payload = JSON.parse(req.rawBody);
    } catch (_) {
      return jsonResponse(400, {
        success: false,
        message: "Invalid JSON payload.",
      });
    }
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return jsonResponse(400, {
      success: false,
      message: validationError,
    });
  }

  const flowEndpointUrl = process.env.FLOW_ENDPOINT_URL;
  if (!flowEndpointUrl) {
    context.log.error("FLOW_ENDPOINT_URL is not configured.");
    return jsonResponse(500, {
      success: false,
      message: "Server configuration is incomplete.",
    });
  }

  const requestId = crypto.randomUUID();
  const flowPayload = {
    requestId: requestId,
    receivedAt: new Date().toISOString(),
    source: "digitalaigarage-website",
    ...payload,
  };

  const headers = {
    "Content-Type": "application/json",
  };

  if (process.env.FLOW_SHARED_KEY) {
    headers["x-flow-key"] = process.env.FLOW_SHARED_KEY;
  }

  try {
    const flowResponse = await fetch(flowEndpointUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(flowPayload),
    });

    if (!flowResponse.ok) {
      const flowText = await flowResponse.text();
      context.log.error(
        `Flow call failed: ${flowResponse.status} ${flowResponse.statusText} ${flowText}`,
      );
      return jsonResponse(502, {
        success: false,
        message: "Unable to process your request right now.",
      });
    }

    return jsonResponse(200, {
      success: true,
      message: "Request submitted successfully.",
      requestId: requestId,
    });
  } catch (error) {
    context.log.error(`Flow call exception: ${error?.message || error}`);
    return jsonResponse(502, {
      success: false,
      message: "Submission service is temporarily unavailable.",
    });
  }
};
