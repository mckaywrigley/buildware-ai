# Best Coding Practices Context

## General Principles

- Write clean, readable, and maintainable code.
- Follow the DRY (Don't Repeat Yourself) principle to avoid code duplication.
- Single Responsibility Principle: Each component, function, or module should have a single responsibility.
- Use consistent coding style and formatting throughout the project.
- Write self-documenting code with clear and descriptive names.

## Naming Conventions

- Use descriptive and meaningful names for variables, functions, and classes.
- Follow camelCase for variables and functions, PascalCase for classes and components.
- Use ALL_CAPS for constants and configuration values.
- Prefix boolean variables with "is", "has", or "should" (e.g., isLoading, hasError).
- Use verb phrases for function names (e.g., getUserData, validateInput).

## Functions and Methods

- Keep functions small and focused on a single responsibility.
- Limit the number of parameters for functions when possible.
- Use default parameters instead of conditionals where applicable.
- Avoid side effects in functions when possible.
- Return early from functions to avoid deep nesting.

## Error Handling and Logging

- Implement proper error handling in all API routes and async functions.
- Use try-catch blocks for error handling in async/await code.
- Log errors with sufficient context for debugging.
- Never log sensitive data (e.g., passwords, API keys).

## Security

- Never store secrets or credentials in the code; use environment variables.
- Implement proper authentication and authorization mechanisms.

## Code Organization and Structure

- Follow a consistent and logical folder structure.
- Group related functionality together (e.g., components, hooks, utils).
- Use index files to simplify imports.
