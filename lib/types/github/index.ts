export interface GitHubRepository {
  id: number
  full_name: string
  name: string
  private: boolean
  html_url: string
  description: string | null
}

export interface GitHubFile {
  type: "file" | "dir" | "submodule" | "symlink"
  size: number
  name: string
  path: string
  content?: string
  sha: string
  url: string
  git_url: string | null
  html_url: string | null
  download_url: string | null
  _links: {
    self: string
    git: string | null
    html: string | null
  }
  owner: string
  repo: string
  ref: string
}

export interface GitHubFileContent {
  path: string
  name: string
  content: string
}
