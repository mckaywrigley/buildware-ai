export class ProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileError';
  }
}

export class ProfileNotFoundError extends ProfileError {
  constructor(userId: string) {
    super(`Profile not found for user: ${userId}`);
    this.name = 'ProfileNotFoundError';
  }
}

export class ProfileCreationError extends ProfileError {
  constructor(message: string) {
    super(`Failed to create profile: ${message}`);
    this.name = 'ProfileCreationError';
  }
}

export class ProfileUpdateError extends ProfileError {
  constructor(message: string) {
    super(`Failed to update profile: ${message}`);
    this.name = 'ProfileUpdateError';
  }
}