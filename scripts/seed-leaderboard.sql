-- Seed tournament results (Round 1 only for testing)
INSERT OR REPLACE INTO tournament_result (id, game_id, winner_id, created_at, updated_at) VALUES
  ('tr-r1-0', 'r1-0', 'wes-bos', 1737331200000, 1737331200000),
  ('tr-r1-1', 'r1-1', 'kevin-powell', 1737331200000, 1737331200000),
  ('tr-r1-2', 'r1-2', 'adam-wathan', 1737331200000, 1737331200000),
  ('tr-r1-3', 'r1-3', 'josh-comeau', 1737331200000, 1737331200000),
  ('tr-r1-4', 'r1-4', 'kyle-cook', 1737331200000, 1737331200000),
  ('tr-r1-5', 'r1-5', 'bramus', 1737331200000, 1737331200000),
  ('tr-r1-6', 'r1-6', 'cassie-evans', 1737331200000, 1737331200000),
  ('tr-r1-7', 'r1-7', 'miriam-suzanne', 1737331200000, 1737331200000);

-- Add some quarterfinal results
INSERT OR REPLACE INTO tournament_result (id, game_id, winner_id, created_at, updated_at) VALUES
  ('tr-qf-0', 'qf-0', 'kevin-powell', 1737331200000, 1737331200000),
  ('tr-qf-1', 'qf-1', 'josh-comeau', 1737331200000, 1737331200000);

-- Create dummy test users (for demo purposes)
-- Note: In production, users come from GitHub OAuth
INSERT OR REPLACE INTO user (id, name, email, email_verified, image, created_at, updated_at) VALUES
  ('test-user-1', 'CSS Wizard', 'wizard@test.com', 1, 'https://avatars.githubusercontent.com/u/1?v=4', 1737331200000, 1737331200000),
  ('test-user-2', 'Flexbox Fan', 'flex@test.com', 1, 'https://avatars.githubusercontent.com/u/2?v=4', 1737331200000, 1737331200000),
  ('test-user-3', 'Grid Master', 'grid@test.com', 1, 'https://avatars.githubusercontent.com/u/3?v=4', 1737331200000, 1737331200000),
  ('test-user-4', 'Animation Ace', 'anim@test.com', 1, 'https://avatars.githubusercontent.com/u/4?v=4', 1737331200000, 1737331200000),
  ('test-user-5', 'Selector Savant', 'select@test.com', 1, 'https://avatars.githubusercontent.com/u/5?v=4', 1737331200000, 1737331200000);

-- Mark test users' brackets as locked
INSERT OR REPLACE INTO user_bracket_status (id, user_id, is_locked, locked_at, created_at) VALUES
  ('bs-1', 'test-user-1', 1, 1737331200000, 1737331200000),
  ('bs-2', 'test-user-2', 1, 1737331200000, 1737331200000),
  ('bs-3', 'test-user-3', 1, 1737331200000, 1737331200000),
  ('bs-4', 'test-user-4', 1, 1737331200000, 1737331200000),
  ('bs-5', 'test-user-5', 1, 1737331200000, 1737331200000);

-- User 1 predictions (perfect Round 1, 1/2 QF = 80 + 20 = 100)
INSERT OR REPLACE INTO user_prediction (id, user_id, game_id, predicted_winner_id, created_at, updated_at) VALUES
  ('p1-r1-0', 'test-user-1', 'r1-0', 'wes-bos', 1737331200000, 1737331200000),
  ('p1-r1-1', 'test-user-1', 'r1-1', 'kevin-powell', 1737331200000, 1737331200000),
  ('p1-r1-2', 'test-user-1', 'r1-2', 'adam-wathan', 1737331200000, 1737331200000),
  ('p1-r1-3', 'test-user-1', 'r1-3', 'josh-comeau', 1737331200000, 1737331200000),
  ('p1-r1-4', 'test-user-1', 'r1-4', 'kyle-cook', 1737331200000, 1737331200000),
  ('p1-r1-5', 'test-user-1', 'r1-5', 'bramus', 1737331200000, 1737331200000),
  ('p1-r1-6', 'test-user-1', 'r1-6', 'cassie-evans', 1737331200000, 1737331200000),
  ('p1-r1-7', 'test-user-1', 'r1-7', 'miriam-suzanne', 1737331200000, 1737331200000),
  ('p1-qf-0', 'test-user-1', 'qf-0', 'kevin-powell', 1737331200000, 1737331200000),
  ('p1-qf-1', 'test-user-1', 'qf-1', 'adam-wathan', 1737331200000, 1737331200000);

-- User 2 predictions (6/8 Round 1, 2/2 QF = 60 + 40 = 100)
INSERT OR REPLACE INTO user_prediction (id, user_id, game_id, predicted_winner_id, created_at, updated_at) VALUES
  ('p2-r1-0', 'test-user-2', 'r1-0', 'wes-bos', 1737331200000, 1737331200000),
  ('p2-r1-1', 'test-user-2', 'r1-1', 'kevin-powell', 1737331200000, 1737331200000),
  ('p2-r1-2', 'test-user-2', 'r1-2', 'ania-kubow', 1737331200000, 1737331200000),
  ('p2-r1-3', 'test-user-2', 'r1-3', 'josh-comeau', 1737331200000, 1737331200000),
  ('p2-r1-4', 'test-user-2', 'r1-4', 'kyle-cook', 1737331200000, 1737331200000),
  ('p2-r1-5', 'test-user-2', 'r1-5', 'bramus', 1737331200000, 1737331200000),
  ('p2-r1-6', 'test-user-2', 'r1-6', 'stephanie-eckles', 1737331200000, 1737331200000),
  ('p2-r1-7', 'test-user-2', 'r1-7', 'miriam-suzanne', 1737331200000, 1737331200000),
  ('p2-qf-0', 'test-user-2', 'qf-0', 'kevin-powell', 1737331200000, 1737331200000),
  ('p2-qf-1', 'test-user-2', 'qf-1', 'josh-comeau', 1737331200000, 1737331200000);

-- User 3 predictions (5/8 Round 1, 1/2 QF = 50 + 20 = 70)
INSERT OR REPLACE INTO user_prediction (id, user_id, game_id, predicted_winner_id, created_at, updated_at) VALUES
  ('p3-r1-0', 'test-user-3', 'r1-0', 'scott-tolinski', 1737331200000, 1737331200000),
  ('p3-r1-1', 'test-user-3', 'r1-1', 'kevin-powell', 1737331200000, 1737331200000),
  ('p3-r1-2', 'test-user-3', 'r1-2', 'adam-wathan', 1737331200000, 1737331200000),
  ('p3-r1-3', 'test-user-3', 'r1-3', 'josh-comeau', 1737331200000, 1737331200000),
  ('p3-r1-4', 'test-user-3', 'r1-4', 'jen-simmons', 1737331200000, 1737331200000),
  ('p3-r1-5', 'test-user-3', 'r1-5', 'rachel-andrew', 1737331200000, 1737331200000),
  ('p3-r1-6', 'test-user-3', 'r1-6', 'cassie-evans', 1737331200000, 1737331200000),
  ('p3-r1-7', 'test-user-3', 'r1-7', 'miriam-suzanne', 1737331200000, 1737331200000),
  ('p3-qf-0', 'test-user-3', 'qf-0', 'wes-bos', 1737331200000, 1737331200000),
  ('p3-qf-1', 'test-user-3', 'qf-1', 'josh-comeau', 1737331200000, 1737331200000);

-- User 4 predictions (4/8 Round 1, 0/2 QF = 40 + 0 = 40)
INSERT OR REPLACE INTO user_prediction (id, user_id, game_id, predicted_winner_id, created_at, updated_at) VALUES
  ('p4-r1-0', 'test-user-4', 'r1-0', 'wes-bos', 1737331200000, 1737331200000),
  ('p4-r1-1', 'test-user-4', 'r1-1', 'adam-argyle', 1737331200000, 1737331200000),
  ('p4-r1-2', 'test-user-4', 'r1-2', 'adam-wathan', 1737331200000, 1737331200000),
  ('p4-r1-3', 'test-user-4', 'r1-3', 'cassidy-williams', 1737331200000, 1737331200000),
  ('p4-r1-4', 'test-user-4', 'r1-4', 'kyle-cook', 1737331200000, 1737331200000),
  ('p4-r1-5', 'test-user-4', 'r1-5', 'rachel-andrew', 1737331200000, 1737331200000),
  ('p4-r1-6', 'test-user-4', 'r1-6', 'stephanie-eckles', 1737331200000, 1737331200000),
  ('p4-r1-7', 'test-user-4', 'r1-7', 'css-ninja', 1737331200000, 1737331200000),
  ('p4-qf-0', 'test-user-4', 'qf-0', 'wes-bos', 1737331200000, 1737331200000),
  ('p4-qf-1', 'test-user-4', 'qf-1', 'adam-wathan', 1737331200000, 1737331200000);

-- User 5 predictions (3/8 Round 1, 1/2 QF = 30 + 20 = 50)
INSERT OR REPLACE INTO user_prediction (id, user_id, game_id, predicted_winner_id, created_at, updated_at) VALUES
  ('p5-r1-0', 'test-user-5', 'r1-0', 'scott-tolinski', 1737331200000, 1737331200000),
  ('p5-r1-1', 'test-user-5', 'r1-1', 'adam-argyle', 1737331200000, 1737331200000),
  ('p5-r1-2', 'test-user-5', 'r1-2', 'ania-kubow', 1737331200000, 1737331200000),
  ('p5-r1-3', 'test-user-5', 'r1-3', 'josh-comeau', 1737331200000, 1737331200000),
  ('p5-r1-4', 'test-user-5', 'r1-4', 'jen-simmons', 1737331200000, 1737331200000),
  ('p5-r1-5', 'test-user-5', 'r1-5', 'bramus', 1737331200000, 1737331200000),
  ('p5-r1-6', 'test-user-5', 'r1-6', 'stephanie-eckles', 1737331200000, 1737331200000),
  ('p5-r1-7', 'test-user-5', 'r1-7', 'css-ninja', 1737331200000, 1737331200000),
  ('p5-qf-0', 'test-user-5', 'qf-0', 'kevin-powell', 1737331200000, 1737331200000),
  ('p5-qf-1', 'test-user-5', 'qf-1', 'adam-wathan', 1737331200000, 1737331200000);

-- Insert user scores (calculated based on above predictions)
-- User 1: R1=80, R2=20 (1 correct of 2 played), Total=100
-- User 2: R1=60, R2=40 (2 correct), Total=100
-- User 3: R1=50, R2=20 (1 correct), Total=70
-- User 4: R1=40, R2=0, Total=40
-- User 5: R1=30, R2=20 (1 correct), Total=50
INSERT OR REPLACE INTO user_score (id, user_id, round1_score, round2_score, round3_score, round4_score, total_score, created_at, updated_at) VALUES
  ('score-1', 'test-user-1', 80, 20, 0, 0, 100, 1737331200000, 1737331200000),
  ('score-2', 'test-user-2', 60, 40, 0, 0, 100, 1737331200000, 1737331200000),
  ('score-3', 'test-user-3', 50, 20, 0, 0, 70, 1737331200000, 1737331200000),
  ('score-5', 'test-user-5', 30, 20, 0, 0, 50, 1737331200000, 1737331200000),
  ('score-4', 'test-user-4', 40, 0, 0, 0, 40, 1737331200000, 1737331200000);
