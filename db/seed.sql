-- SEED USERS VIA CLERK
-- onboarded user, mock configured
-- email=test1+clerk_test@example.com | password=password | code=424242 | user_id=user_2iiPf7dbL1QlP7vVtuVChpjxfQ0
-- not onboarded user
-- email=test2+clerk_test@example.com | password=password | code=424242 | user_id=user_2iiQ0IXXuMB4QRh3p9pVN5DI6ob
-- buildware user
-- email=buildware@buildware.io | password=password | code=424242 | user_id=user_2iqvhS87LzMgCgGomdNXJaM3WE1

-- Empty tables before seeding
TRUNCATE TABLE templates_to_prompts CASCADE;
TRUNCATE TABLE issues CASCADE;
TRUNCATE TABLE prompts CASCADE;
TRUNCATE TABLE templates CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE profiles CASCADE;

-- Seed data for profiles
INSERT INTO profiles (id, user_id, has_onboarded, github_installation_id, github_access_token, github_token_expires_at, github_user_id, github_username, github_metadata, linear_user_id, linear_access_token, linear_token_expires_at, linear_metadata, created_at, updated_at)
VALUES
-- onboarded user
  ('770e8400-e29b-41d4-a716-446655440000', 'user_2iiPf7dbL1QlP7vVtuVChpjxfQ0', true, '12345', 'gho_faketoken123', '2023-12-31 23:59:59', 'github_user_1', 'testuser1', '{}', 'linear_user_1', 'lin_faketoken456', '2023-12-31 23:59:59', '{}', NOW(), NOW()),
-- not onboarded user
  ('770e8400-e29b-41d4-a716-446655440001', 'user_2iiQ0IXXuMB4QRh3p9pVN5DI6ob', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW(), NOW()),
-- buildware user
  ('770e8400-e29b-41d4-a716-446655440002', 'user_2iqvhS87LzMgCgGomdNXJaM3WE1', true, '12345', 'gho_faketoken123', '2023-12-31 23:59:59', 'github_user_1', 'testuser1', '{}', 'linear_user_1', 'lin_faketoken456', '2023-12-31 23:59:59', '{}', NOW(), NOW());

-- Seed data for projects
INSERT INTO projects (id, user_id, name, created_at, updated_at)
VALUES
-- onboarded user
  ('880e8400-e29b-41d4-a716-446655440000', 'user_2iiPf7dbL1QlP7vVtuVChpjxfQ0', 'Default Project', NOW(), NOW()),
-- not onboarded user
  ('880e8400-e29b-41d4-a716-446655440001', 'user_2iiQ0IXXuMB4QRh3p9pVN5DI6ob', 'Default Project', NOW(), NOW()),
-- buildware user
  ('880e8400-e29b-41d4-a716-446655440002', 'user_2iqvhS87LzMgCgGomdNXJaM3WE1', 'Buildware', NOW(), NOW());

-- Seed data for templates
INSERT INTO templates (id, user_id, project_id, title, content, created_at, updated_at)
VALUES
-- onboarded user
  ('550e8400-e29b-41d4-a716-446655440000', 'user_2iiPf7dbL1QlP7vVtuVChpjxfQ0', '880e8400-e29b-41d4-a716-446655440000', 'Basic API Endpoint', 'Create a basic API endpoint for ${resourceName} with GET and POST methods.', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'user_2iiPf7dbL1QlP7vVtuVChpjxfQ0', '880e8400-e29b-41d4-a716-446655440000', 'React Component', 'Create a React functional component named ${componentName} with props interface and basic structure.', NOW(), NOW()),
-- not onboarded user
  ('550e8400-e29b-41d4-a716-446655440002', 'user_2iiQ0IXXuMB4QRh3p9pVN5DI6ob', '880e8400-e29b-41d4-a716-446655440001', 'Basic API Endpoint', 'Create a basic API endpoint for ${resourceName} with GET and POST methods.', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440003', 'user_2iiQ0IXXuMB4QRh3p9pVN5DI6ob', '880e8400-e29b-41d4-a716-446655440001', 'React Component', 'Create a React functional component named ${componentName} with props interface and basic structure.', NOW(), NOW()),
-- buildware user
  ('550e8400-e29b-41d4-a716-446655440004', 'user_2iqvhS87LzMgCgGomdNXJaM3WE1', '880e8400-e29b-41d4-a716-446655440002', 'React Component', 'Create a React functional component named ${componentName} with props interface and basic structure.', NOW(), NOW());

-- Seed data for prompts
INSERT INTO prompts (id, user_id, project_id, title, content, created_at, updated_at)
VALUES
-- onboarded user
  ('660e8400-e29b-41d4-a716-446655440000', 'user_2iiPf7dbL1QlP7vVtuVChpjxfQ0', '880e8400-e29b-41d4-a716-446655440000', 'Code Review', 'Please review the following code and suggest improvements:\n\n${codeSnippet}', NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440001', 'user_2iiPf7dbL1QlP7vVtuVChpjxfQ0', '880e8400-e29b-41d4-a716-446655440000', 'Bug Fix', 'I''m encountering the following error: ${errorMessage}. Here''s my code:\n\n${codeSnippet}\n\nCan you help me fix it?', NOW(), NOW()),
-- not onboarded user
  ('660e8400-e29b-41d4-a716-446655440002', 'user_2iiQ0IXXuMB4QRh3p9pVN5DI6ob', '880e8400-e29b-41d4-a716-446655440001', 'Code Review', 'Please review the following code and suggest improvements:\n\n${codeSnippet}', NOW(), NOW()),
  ('660e8400-e29b-41d4-a716-446655440003', 'user_2iiQ0IXXuMB4QRh3p9pVN5DI6ob', '880e8400-e29b-41d4-a716-446655440001', 'Bug Fix', 'I''m encountering the following error: ${errorMessage}. Here''s my code:\n\n${codeSnippet}\n\nCan you help me fix it?', NOW(), NOW()),
-- buildware user
  ('660e8400-e29b-41d4-a716-446655440004', 'user_2iqvhS87LzMgCgGomdNXJaM3WE1', '880e8400-e29b-41d4-a716-446655440002', 'Bug Fix', 'I''m encountering the following error: ${errorMessage}. Here''s my code:\n\n${codeSnippet}\n\nCan you help me fix it?', NOW(), NOW());

-- Seed data for templates_to_prompts
INSERT INTO templates_to_prompts (template_id, prompt_id)
VALUES
-- onboarded user
  ('550e8400-e29b-41d4-a716-446655440000', '660e8400-e29b-41d4-a716-446655440000'),
  ('550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001'),
-- not onboarded user
  ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002'),
  ('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003'),
-- buildware user
  ('550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440004');

-- Seed data for issues
INSERT INTO issues (id, user_id, project_id, template_id, name, content, status, started_at, completed_at, created_at, updated_at)
VALUES
-- onboarded user
  ('990e8400-e29b-41d4-a716-446655440000', 'user_2iiPf7dbL1QlP7vVtuVChpjxfQ0', '880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Implement User API', 'Create a basic API endpoint for User with GET and POST methods.', 'ready', NULL, NULL, NOW(), NOW()),
  ('990e8400-e29b-41d4-a716-446655440001', 'user_2iiPf7dbL1QlP7vVtuVChpjxfQ0', '880e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'Create UserProfile Component', 'Create a React functional component named UserProfile with props interface and basic structure.', 'in_progress', NOW(), NULL, NOW(), NOW()),
-- not onboarded user
  ('990e8400-e29b-41d4-a716-446655440002', 'user_2iiQ0IXXuMB4QRh3p9pVN5DI6ob', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Implement Product API', 'Create a basic API endpoint for Product with GET and POST methods.', 'ready', NULL, NULL, NOW(), NOW()),
  ('990e8400-e29b-41d4-a716-446655440003', 'user_2iiQ0IXXuMB4QRh3p9pVN5DI6ob', '880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Create ProductList Component', 'Create a React functional component named ProductList with props interface and basic structure.', 'completed', NOW(), NOW(), NOW(), NOW()),
  -- buildware
  ('990e8400-e29b-41d4-a716-446655440004', 'user_2iqvhS87LzMgCgGomdNXJaM3WE1', '880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'Implement Product API', 'Create a basic API endpoint for Product with GET and POST methods.', 'ready', NULL, NULL, NOW(), NOW());