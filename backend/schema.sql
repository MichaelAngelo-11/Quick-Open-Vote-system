-- Quick-Open Vote Database Schema

-- VotingSession table
CREATE TABLE IF NOT EXISTS VotingSession (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  mode TEXT NOT NULL CHECK(mode IN ('casual', 'official')),
  resultDisplay TEXT NOT NULL DEFAULT 'after-closes' CHECK(resultDisplay IN ('realtime', 'after-closes')),
  votingCode TEXT NOT NULL UNIQUE,
  adminCode TEXT NOT NULL UNIQUE,
  isActive INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  closedAt TEXT
);

-- Position table
CREATE TABLE IF NOT EXISTS Position (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  maxSelections INTEGER NOT NULL DEFAULT 1,
  displayOrder INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (sessionId) REFERENCES VotingSession(id) ON DELETE CASCADE
);

-- Candidate table
CREATE TABLE IF NOT EXISTS Candidate (
  id TEXT PRIMARY KEY,
  positionId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  photoUrl TEXT,
  displayOrder INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (positionId) REFERENCES Position(id) ON DELETE CASCADE
);

-- Vote table
CREATE TABLE IF NOT EXISTS Vote (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  positionId TEXT NOT NULL,
  candidateId TEXT NOT NULL,
  voterId TEXT NOT NULL,
  voterEmail TEXT,
  voterName TEXT,
  votedAt TEXT NOT NULL,
  FOREIGN KEY (sessionId) REFERENCES VotingSession(id) ON DELETE CASCADE,
  FOREIGN KEY (positionId) REFERENCES Position(id) ON DELETE CASCADE,
  FOREIGN KEY (candidateId) REFERENCES Candidate(id) ON DELETE CASCADE
);

-- InvitedVoter table (for official mode)
CREATE TABLE IF NOT EXISTS InvitedVoter (
  id TEXT PRIMARY KEY,
  sessionId TEXT NOT NULL,
  email TEXT NOT NULL,
  hasVoted INTEGER NOT NULL DEFAULT 0,
  votedAt TEXT,
  createdAt TEXT NOT NULL,
  FOREIGN KEY (sessionId) REFERENCES VotingSession(id) ON DELETE CASCADE,
  UNIQUE (sessionId, email)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_position_session ON Position(sessionId);
CREATE INDEX IF NOT EXISTS idx_candidate_position ON Candidate(positionId);
CREATE INDEX IF NOT EXISTS idx_vote_session ON Vote(sessionId);
CREATE INDEX IF NOT EXISTS idx_vote_position ON Vote(positionId);
CREATE INDEX IF NOT EXISTS idx_vote_candidate ON Vote(candidateId);
CREATE INDEX IF NOT EXISTS idx_vote_voter_name ON Vote(sessionId, voterName);
CREATE INDEX IF NOT EXISTS idx_invited_voter_session ON InvitedVoter(sessionId);
