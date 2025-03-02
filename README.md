# bitte-beefy-agent

Bitte Beefy Agent is a tool for streamlining earning the highest APYs across 23 chains with safety and efficiency in mind within the Beefy ecosystem.

## Overview

Built using Next.js 14 + Shadcn/ui + Hono (using FastNear, NearSocial) + Zod + Swagger UI.

## Backlog

- [ ] Add more detailed signals to the agent
- [ ] Add support for building transactions directly from the agent

## Project Walkthrough

The template supports creating, managing, and deploying the Bitte Beefy Agent functionalities.

### API Base URL

<https://bitte-beefy-agent.vercel.app>

### Endpoints

- Highest yielding vaults from Beefy Finance `GET` `/api/beefy-top-vaults`

### Usage

Make LLM requests to the endpoints above. Refer to the full API documentation for detailed parameter and response information.

## Getting Started

[Docs to integrate](https://docs.mintbase.xyz/ai/assistant-plugins)

### Installation

Set `NEAR_ENV="mainnet"` in your `.env.local` file.

```bash
# install dependencies
pnpm i

# start the development server
pnpm dev:next

# start the agent development server
pnpm dev:agent
```

## Deployment

Check out [Next.js deployment documentation](https://nextjs.org/docs/deployment) for details on (re-)deploying on Vercel.

### Agent registration

NOTE: Only run this once, when creating a new agent.

```bash
make-agent register -u https://bitte-beefy-agent.vercel.app
```

### Agent redeployment

```bash
make-agent deploy -u https://bitte-beefy-agent.vercel.app
```

## Troubleshooting

- Errors starting the Next.js development server:
  - Use ai to troubleshoot the error message
- Errors starting the agent development server:
  - Try again in 24 hours
- Unexpected response from the agent:
  - Check response from https://localhost:3000/.well-known/ai-plugin.json
  - Check response from your plugin API endpoints
  - Check the tunneling service url
- Error deploying the agent:
  - Check validity of https://bitte-beefy-agent.vercel.app/.well-known/ai-plugin.json openapi schema
