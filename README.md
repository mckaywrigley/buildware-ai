# Buildware

Buildware helps you ship code faster with AI.

## Demo

See the latest demo [here](https://twitter.com/mckaywrigley).

## Updates

We'll keep you updated here.

## Sponsor

If you find Buildware useful, please consider [sponsoring](https://github.com/sponsors/mckaywrigley) to support our open-source work :)

## Learn

For in-depth guides on Buildware, please visit [our website](https://mckaywrigley.com).

## Basic Setup

Follow these steps to get the basic version of Buildware running.

### 1. Clone the Repo

```bash
git clone https://github.com/mckaywrigley/buildware.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

You will need a Postgres database to use Buildware.

We recommend using Neon or Supabase.

Once you have your connection string, you can continue to the next step.

### 4. Setup GitHub PAT

You will need a GitHub PAT (Personal Access Token) to use Buildware.

Follow these steps:

1. Go to [this link](https://github.com/settings/tokens?type=beta).
2. Click "Generate new token".
3. Give your token a name and set the expiration date.
4. Select a "Resource owner".
5. Select which repositories you want to access. You must select either "All repositories" or "Only select repositories".
6. Select the 3 required repository permissions:
   - Contents: Read and write
   - Pull Requests: Read and write
   - Metadata: Read-only (this is selected by default)
7. Click "Generate token".
8. Copy your new PAT and paste it into the `.env.local` file as `GITHUB_PAT`.

Once you have your PAT, you can continue to the next step.

### 5. Setup Environment Variables

Copy the `.env.example` file to `.env.local` and fill in the required variables.

```bash
cp .env.example .env.local
```

The following values are required for config for the basic version:

App Mode (keep default value):

- NEXT_PUBLIC_APP_MODE=basic

Codebase Retrieval (keep default values):

- NEXT_PUBLIC_EMBEDDING_MODEL=text-embedding-3-large
- NEXT_PUBLIC_EMBEDDING_DIMENSIONS=256
- NEXT_PUBLIC_MAX_OUTPUT_TOKENS=4000
- NEXT_PUBLIC_MAX_INPUT_TOKENS=195000

LLMs:

- ANTHROPIC_API_KEY=
- OPENAI_API_KEY=

Database:

- DATABASE_URL=

GitHub:

- GITHUB_PAT=

### 6. Run App

```bash
npm run dev
```

## Pro Setup

Update (July 15th, 2024): Pro setup guide coming soon! Please check back in a few days.

## Contributing

We are working on a guide for contributing.

## License

Buildware is licensed under the MIT license.
