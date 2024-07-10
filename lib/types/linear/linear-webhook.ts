export interface LinearWebhookBody {
  action: string
  actor: {
    id: string
    name: string
    type: string
  }
  createdAt: string
  data: LinearWebhookIssue | LinearWebhookComment // add more types as needed
  url: string
  type: string
  organizationId: string
  webhookTimestamp: number
  webhookId: string
}

export interface LinearWebhookIssue {
  id: string
  createdAt: string
  updatedAt: string
  number: number
  title: string
  priority: number
  boardOrder: number
  sortOrder: number
  labelIds: string[]
  teamId: string
  previousIdentifiers: string[]
  creatorId: string
  assigneeId: string
  stateId: string
  reactionData: {
    emoji: string
    reactions: {
      id: string
      userId: string
      reactedAt: string
    }[]
  }[]
  priorityLabel: string
  botActor: null | any
  identifier: string
  url: string
  assignee: {
    id: string
    name: string
  }
  state: {
    id: string
    color: string
    name: string
    type: string
  }
  team: {
    id: string
    key: string
    name: string
  }
  subscriberIds: string[]
  labels: {
    id: string
    color: string
    name: string
  }[]
}

export interface LinearWebhookComment {
  id: string
  createdAt: string
  updatedAt: string
  body: string
  issueId: string
  parentId: string | null
  userId: string
  reactionData: {
    emoji: string
    reactions: {
      id: string
      userId: string
      reactedAt: string
    }[]
  }[]
  user: {
    id: string
    name: string
  }
  issue: {
    id: string
    title: string
    teamId: string
  }
}
