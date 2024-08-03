// text-embedding-3-small or text-embedding-3-large
export const BUILDWARE_EMBEDDING_MODEL = "text-embedding-3-large"

// Between 256 and 3072
export const BUILDWARE_EMBEDDING_DIMENSIONS = 256

// Max: 8192
// (dev)
// export const BUILDWARE_MAX_OUTPUT_TOKENS = 4096
// // (prod)
export const BUILDWARE_MAX_OUTPUT_TOKENS = 8192

// Max: 200000
// (dev)
// export const BUILDWARE_MAX_INPUT_TOKENS = 20000
// (prod)
export const BUILDWARE_MAX_INPUT_TOKENS = 200000

// claude-3-5-sonnet-20240620 or claude-3-haiku-20240307
// DEV: claude-3-haiku-20240307
export const BUILDWARE_SPECIFICATION_LLM = "claude-3-haiku-20240307"
export const BUILDWARE_PLAN_LLM = "claude-3-haiku-20240307"
export const BUILDWARE_IMPLEMENTATION_LLM = "claude-3-haiku-20240307"
// PROD: claude-3-5-sonnet-20240620
// export const BUILDWARE_SPECIFICATION_LLM = "claude-3-5-sonnet-20240620"
// export const BUILDWARE_PLAN_LLM = "claude-3-5-sonnet-20240620"
// export const BUILDWARE_IMPLEMENTATION_LLM = "claude-3-5-sonnet-20240620"
