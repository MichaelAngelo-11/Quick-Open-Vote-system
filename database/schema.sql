-- Voting System Database Schema

-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- Table for user roles (voter or admin)
CREATE TABLE IF NOT EXISTS roles (
  role_id INTEGER PRIMARY KEY,
  rolename TEXT NOT NULL UNIQUE
);

-- Insert the two roles we need
INSERT OR IGNORE INTO roles(role_id, rolename)
VALUES (1,'voter'), (2,'admin');

-- Users table - stores all registered users
CREATE TABLE IF NOT EXISTS users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  fullname TEXT NOT NULL,
  national_id TEXT NOT NULL UNIQUE,
  role_id INTEGER NOT NULL,
  email TEXT NOT NULL UNIQUE,
  time_registered TEXT NOT NULL,
  FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- Elections table - stores information about each election
CREATE TABLE IF NOT EXISTS elections (
  election_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL
);

-- Candidates table - stores candidates for each election
CREATE TABLE IF NOT EXISTS candidates (
  candidate_id INTEGER PRIMARY KEY AUTOINCREMENT,
  election_id INTEGER NOT NULL,
  fullname TEXT NOT NULL,
  bio TEXT,
  photo_url TEXT,
  FOREIGN KEY (election_id) REFERENCES elections(election_id)
);

-- Votes table - records each vote cast by users
CREATE TABLE IF NOT EXISTS votes (
  vote_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  election_id INTEGER NOT NULL,
  candidate_id INTEGER NOT NULL,
  vote_time TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (election_id) REFERENCES elections(election_id),
  FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id),
  UNIQUE(user_id, election_id)
);
