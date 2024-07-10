# Buildware

## Instructions

1. Set PORT env to current port

- `PORT`

2. Set GitHub env vars

   - `GITHUB_PAT`
   - `GITHUB_ORGANIZATION`
   - `GITHUB_REPO`
   - `GITHUB_DEFAULT_BRANCH`

3. Set Linear env vars

   - `LINEAR_API_KEY`
   - `LINEAR_WEBHOOK_SECRET`

4. Set LLM env vars

   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `GOOGLE_GENERATIVE_AI_API_KEY`

5. Run webhook proxy
   `npm run proxy`

6. Run Next.js app
   `npm run dev`

7. Run process codebase script
   `npm run process-codebase`

   For now, you will have to process the codebase again after each branch push.

8. Tag @ai @codebase to run

In a Linear issue, comment your query with `@ai` and `@codebase` to trigger a codebase retrieval task.
