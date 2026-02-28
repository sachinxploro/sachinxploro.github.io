const crypto = require("node:crypto");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-flow-key",
};

const OTP_TTL_SECONDS = Number(process.env.EMAIL_OTP_TTL_SECONDS || 600);
const VERIFY_TTL_SECONDS = Number(process.env.EMAIL_VERIFY_PROOF_TTL_SECONDS || 1800);

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

function toBase64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  return Buffer.from(base64 + pad, "base64");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function maskEmail(email) {
  const [localRaw, domainRaw] = normalizeEmail(email).split("@");
  if (!localRaw || !domainRaw) return email;
  const local =
    localRaw.length <= 2
      ? `${localRaw[0] || "*"}*`
      : `${localRaw.slice(0, 2)}${"*".repeat(Math.max(1, localRaw.length - 2))}`;
  return `${local}@${domainRaw}`;
}

function ensureOtpSecret() {
  const secret = process.env.EMAIL_OTP_SECRET;
  if (!secret) {
    throw new Error("EMAIL_OTP_SECRET is not configured.");
  }
  return secret;
}

function signPayload(payload) {
  const secret = ensureOtpSecret();
  const payloadRaw = JSON.stringify(payload);
  const payloadEncoded = toBase64Url(payloadRaw);
  const sig = crypto.createHmac("sha256", secret).update(payloadEncoded).digest();
  const sigEncoded = toBase64Url(sig);
  return `${payloadEncoded}.${sigEncoded}`;
}

function verifySignedPayload(token) {
  const secret = ensureOtpSecret();
  const parts = String(token || "").split(".");
  if (parts.length !== 2) return null;
  const [payloadEncoded, sigEncoded] = parts;
  const expectedSig = crypto.createHmac("sha256", secret).update(payloadEncoded).digest();
  const actualSig = fromBase64Url(sigEncoded);
  if (actualSig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(actualSig, expectedSig)) return null;
  try {
    const json = fromBase64Url(payloadEncoded).toString("utf8");
    return JSON.parse(json);
  } catch (_) {
    return null;
  }
}

function hashOtp(email, code, exp, nonce) {
  const secret = ensureOtpSecret();
  return crypto
    .createHash("sha256")
    .update(`${normalizeEmail(email)}|${String(code)}|${String(exp)}|${String(nonce)}|${secret}`)
    .digest("hex");
}

async function sendOtpEmail(email, code) {
  const otpFlowEndpoint =
    process.env.OTP_FLOW_ENDPOINT_URL || process.env.FLOW_OTP_ENDPOINT_URL;
  if (!otpFlowEndpoint) {
    throw new Error("OTP_FLOW_ENDPOINT_URL (or FLOW_OTP_ENDPOINT_URL) is not configured.");
  }

  const otpFlowHeaders = {
    "Content-Type": "application/json",
  };
  const otpFlowKey = process.env.OTP_FLOW_SHARED_KEY || process.env.FLOW_SHARED_KEY;
  if (otpFlowKey) {
    otpFlowHeaders["x-flow-key"] = otpFlowKey;
  }

  const otpFlowPayload = {
    action: "send-email-otp",
    source: "digitalaigarage-website",
    email: normalizeEmail(email),
    code: code,
    expiresInSec: OTP_TTL_SECONDS,
  };

  const response = await fetch(otpFlowEndpoint, {
    method: "POST",
    headers: otpFlowHeaders,
    body: JSON.stringify(otpFlowPayload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OTP flow call failed: ${response.status} ${text}`);
  }
}

function validateVerifiedEmail(payload) {
  const contactEmail = normalizeEmail(payload?.contact?.email);
  const proofToken = payload?.emailVerification?.proofToken;
  if (!contactEmail || !proofToken) {
    return "Email verification is required before submission.";
  }
  const proof = verifySignedPayload(proofToken);
  if (!proof || proof.purpose !== "email-verified") {
    return "Invalid email verification proof.";
  }
  if (Number(proof.exp || 0) < Date.now()) {
    return "Email verification has expired. Please verify again.";
  }
  if (normalizeEmail(proof.email) !== contactEmail) {
    return "Email verification does not match the submitted email.";
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

  const action = String(payload?.action || "submit").trim();
  const now = Date.now();

  if (action === "send-email-otp") {
    const email = normalizeEmail(payload?.email);
    if (!isValidEmail(email)) {
      return jsonResponse(400, {
        success: false,
        message: "Please provide a valid email address.",
      });
    }
    try {
      const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
      const exp = now + OTP_TTL_SECONDS * 1000;
      const nonce = crypto.randomBytes(8).toString("hex");
      const otpHash = hashOtp(email, code, exp, nonce);
      const verificationToken = signPayload({
        purpose: "email-otp",
        email: email,
        exp: exp,
        nonce: nonce,
        otpHash: otpHash,
      });

      await sendOtpEmail(email, code);

      return jsonResponse(200, {
        success: true,
        message: "Verification code sent.",
        verificationToken: verificationToken,
        expiresInSec: OTP_TTL_SECONDS,
        emailMasked: maskEmail(email),
      });
    } catch (error) {
      context.log.error(`OTP email send failed: ${error?.message || error}`);
      return jsonResponse(500, {
        success: false,
        message:
          process.env.NODE_ENV === "development"
            ? String(error?.message || "Unable to send verification code.")
            : "Unable to send verification code right now.",
      });
    }
  }

  if (action === "verify-email-otp") {
    const email = normalizeEmail(payload?.email);
    const code = String(payload?.code || "").trim();
    const verificationToken = String(payload?.verificationToken || "").trim();
    if (!isValidEmail(email) || !/^\d{6}$/.test(code) || !verificationToken) {
      return jsonResponse(400, {
        success: false,
        message: "Invalid verification request.",
      });
    }

    let tokenPayload = null;
    try {
      tokenPayload = verifySignedPayload(verificationToken);
    } catch (error) {
      context.log.error(`OTP verify token error: ${error?.message || error}`);
      return jsonResponse(500, {
        success: false,
        message: "Email verification is not configured on server.",
      });
    }
    if (
      !tokenPayload ||
      tokenPayload.purpose !== "email-otp" ||
      normalizeEmail(tokenPayload.email) !== email
    ) {
      return jsonResponse(400, {
        success: false,
        message: "Invalid or mismatched verification token.",
      });
    }
    if (Number(tokenPayload.exp || 0) < now) {
      return jsonResponse(400, {
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    let expectedHash = "";
    try {
      expectedHash = hashOtp(email, code, tokenPayload.exp, tokenPayload.nonce);
    } catch (error) {
      context.log.error(`OTP verify hash error: ${error?.message || error}`);
      return jsonResponse(500, {
        success: false,
        message: "Email verification is not configured on server.",
      });
    }
    if (String(expectedHash) !== String(tokenPayload.otpHash || "")) {
      return jsonResponse(400, {
        success: false,
        message: "Incorrect verification code.",
      });
    }

    const verifiedAt = new Date(now).toISOString();
    let proofToken = "";
    try {
      proofToken = signPayload({
        purpose: "email-verified",
        email: email,
        verifiedAt: verifiedAt,
        exp: now + VERIFY_TTL_SECONDS * 1000,
      });
    } catch (error) {
      context.log.error(`OTP proof token error: ${error?.message || error}`);
      return jsonResponse(500, {
        success: false,
        message: "Email verification is not configured on server.",
      });
    }

    return jsonResponse(200, {
      success: true,
      message: "Email verified successfully.",
      verifiedAt: verifiedAt,
      proofToken: proofToken,
      expiresInSec: VERIFY_TTL_SECONDS,
    });
  }

  const validationError = validatePayload(payload);
  if (validationError) {
    return jsonResponse(400, {
      success: false,
      message: validationError,
    });
  }

  const requireEmailVerification =
    String(process.env.REQUIRE_EMAIL_VERIFICATION || "true").toLowerCase() !== "false";
  if (requireEmailVerification) {
    let verifyError = null;
    try {
      verifyError = validateVerifiedEmail(payload);
    } catch (error) {
      context.log.error(`Email verification check failed: ${error?.message || error}`);
      return jsonResponse(500, {
        success: false,
        message: "Email verification is not configured on server.",
      });
    }
    if (verifyError) {
      return jsonResponse(400, {
        success: false,
        message: verifyError,
      });
    }
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
