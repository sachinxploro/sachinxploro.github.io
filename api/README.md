# CRM Request API (Azure Functions)

This folder contains a Node.js Azure Function endpoint used by the CRM customization form.

## Endpoint

- `POST /api/crm-request`

The function supports three actions:
- `send-email-otp`: Sends a 6-digit email verification code.
- `verify-email-otp`: Verifies the OTP and returns a proof token.
- `submit` (default): Validates full form payload and forwards to Power Automate.

## Environment Variables

- `FLOW_ENDPOINT_URL`: Full HTTP trigger URL from Power Automate.
- `FLOW_SHARED_KEY`: Optional shared key sent as `x-flow-key` header.
- `EMAIL_OTP_SECRET`: Secret used to sign OTP and verification tokens.
- `OTP_FLOW_ENDPOINT_URL`: Power Automate HTTP endpoint that sends OTP email.
- `OTP_FLOW_SHARED_KEY`: Optional shared key sent as `x-flow-key` to OTP flow.
- `EMAIL_OTP_TTL_SECONDS`: OTP expiry (default `600`).
- `EMAIL_VERIFY_PROOF_TTL_SECONDS`: Verified proof expiry for final submit (default `1800`).
- `REQUIRE_EMAIL_VERIFICATION`: `true` by default. Set `false` to bypass temporarily.
- `AzureWebJobsStorage`: Required for local Functions runtime.
- `FUNCTIONS_WORKER_RUNTIME`: `node`

Use `local.settings.example.json` as a template for local development.

## Local Run

1. Install dependencies:
   - `cd api`
   - `npm install`
2. Copy local settings:
   - `copy local.settings.example.json local.settings.json`
3. Update `FLOW_ENDPOINT_URL` and `FLOW_SHARED_KEY`.
4. Run:
   - `npm run start`

## Payload Shape (submit)

```json
{
  "contact": {
    "name": "John Doe",
    "company": "Acme Pvt Ltd",
    "email": "john@acme.com",
    "phone": "+91..."
  },
  "notes": "Optional notes",
  "selectedRequirements": ["Lead capture & auto-assignment rules"],
  "emailVerification": {
    "proofToken": "signed-token-from-verify-email-otp"
  },
  "meta": {
    "source": "crm_customization_form",
    "submittedAt": "2026-02-28T09:00:00.000Z"
  }
}
```
