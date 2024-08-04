const isDev = process.env.NEXT_PUBLIC_CONFIG_MODE === "dev"

// text-embedding-3-small or text-embedding-3-large
export const BUILDWARE_EMBEDDING_MODEL = "text-embedding-3-large"

// Between 256 and 3072
export const BUILDWARE_EMBEDDING_DIMENSIONS = 256

// Max: 8192
export const BUILDWARE_MAX_OUTPUT_TOKENS = isDev ? 4096 : 8192

// Max: 200000
export const BUILDWARE_MAX_INPUT_TOKENS = isDev ? 20000 : 200000

// claude-3-5-sonnet-20240620 or claude-3-haiku-20240307
const devLLM = "claude-3-haiku-20240307"
const prodLLM = "claude-3-5-sonnet-20240620"
export const BUILDWARE_SPECIFICATION_LLM = isDev ? devLLM : prodLLM
export const BUILDWARE_PLAN_LLM = isDev ? devLLM : prodLLM
export const BUILDWARE_IMPLEMENTATION_LLM = isDev ? devLLM : prodLLM
