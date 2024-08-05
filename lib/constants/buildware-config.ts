export type BuildwareModel =
  | typeof BUILDWARE_SPECIFICATION_LLM
  | typeof BUILDWARE_PLAN_LLM
  | typeof BUILDWARE_IMPLEMENTATION_LLM

const isDev = process.env.NEXT_PUBLIC_CONFIG_MODE === "dev"

// text-embedding-3-small or text-embedding-3-large
export const BUILDWARE_EMBEDDING_MODEL = "text-embedding-3-large"

// Between 256 and 3072
export const BUILDWARE_EMBEDDING_DIMENSIONS = 256

// Max: 8192
export const BUILDWARE_MAX_OUTPUT_TOKENS = isDev ? 4096 : 8192

// Max: 200000
export const BUILDWARE_MAX_INPUT_TOKENS = isDev ? 20000 : 200000

const LLM_MODELS = {
  dev: {
    specification: "claude-3-haiku-20240307",
    plan: "claude-3-haiku-20240307",
    implementation: "claude-3-haiku-20240307"
  },
  prod: {
    // specification: "claude-3-haiku-20240307",
    specification: "claude-3-5-sonnet-20240620",
    plan: "claude-3-5-sonnet-20240620",
    implementation: "claude-3-5-sonnet-20240620"
  }
}

export const BUILDWARE_SPECIFICATION_LLM = isDev
  ? LLM_MODELS.dev.specification
  : LLM_MODELS.prod.specification
export const BUILDWARE_PLAN_LLM = isDev
  ? LLM_MODELS.dev.plan
  : LLM_MODELS.prod.plan
export const BUILDWARE_IMPLEMENTATION_LLM = isDev
  ? LLM_MODELS.dev.implementation
  : LLM_MODELS.prod.implementation
