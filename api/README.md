# CRM Request API (Azure Functions)

This folder contains a Node.js Azure Function endpoint used by the CRM customization form.

## Endpoint

- `POST /api/crm-request`

The function validates form payload and forwards it to a Power Automate HTTP trigger.

## Environment Variables

- `FLOW_ENDPOINT_URL`: Full HTTP trigger URL from Power Automate.
- `FLOW_SHARED_KEY`: Optional shared key sent as `x-flow-key` header.
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

## Payload Shape (expected)

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
  "meta": {
    "source": "crm_customization_form",
    "submittedAt": "2026-02-28T09:00:00.000Z"
  }
}
```
