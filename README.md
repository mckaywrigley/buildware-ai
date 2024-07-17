# Buildware

Buildware helps you ship code faster with AI.

Build a code instruction system, give it an issue, and get an AI-generated PR!

Built by [Mckay Wrigley](https://twitter.com/mckaywrigley) and [Tyler Bruno](https://twitter.com/tylerbruno05) at Takeoff AI.

## Demo

See the latest demo [here](https://twitter.com/mckaywrigley).

## Sponsor

If you find Buildware useful, please consider [sponsoring](https://github.com/sponsors/mckaywrigley) us to support our open-source work :)

## Updates

Coming soon:

- Advanced version with Linear integration and more
- Local codebase mode
- Team support

## Simple Setup

Follow these steps to get the simple version of Buildware running.

### 1. Clone the Repo

```bash
git clone https://github.com/mckaywrigley/buildware.git
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy the `.env.example` file to `.env.local` and fill in the required variables.

```bash
cp .env.example .env.local
```

The following values are required for config for the simple version:

App Mode (keep default value):

- NEXT_PUBLIC_APP_MODE=simple

LLMs:

- ANTHROPIC_API_KEY=
- OPENAI_API_KEY=

Database:

- DATABASE_URL=

GitHub:

- GITHUB_PAT=

### 4. Setup Database

You will need a Postgres database to use Buildware.

We recommend using Neon or Supabase.

Once you have your connection string, update the `DATABASE_URL` in the `.env.local` file.

Next, run the database migrations:

```bash
npm run migrate
```

Now your database is ready to use.

### 5. Setup GitHub PAT

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

Once you have your PAT, update the `GITHUB_PAT` in the `.env.local` file.

### 6. Run App

```bash
npm run dev
```

## Advanced Setup

Update (July 17th, 2024): Advanced setup guide coming soon! Please check back in a few days.
