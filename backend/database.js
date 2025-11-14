import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES modules need explicit __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'database.sqlite'));

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

/**
 * Initialize database with schema
 */
function initDatabase() {
  try {
    const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    db.exec(schema);
    
    // Migrate existing databases: add resultDisplay if missing
    try {
      const tableInfo = db.pragma('table_info(VotingSession)');
      const hasResultDisplay = tableInfo.some(col => col.name === 'resultDisplay');
      
      if (!hasResultDisplay) {
        db.exec(`ALTER TABLE VotingSession ADD COLUMN resultDisplay TEXT NOT NULL DEFAULT 'after-closes' CHECK(resultDisplay IN ('realtime', 'after-closes'))`);
      }
    } catch (alterError) {
      // Already exists, skip
    }
    
    // Migrate existing databases: add votedAt to InvitedVoter if missing
    try {
      const invitedVoterInfo = db.pragma('table_info(InvitedVoter)');
      const hasVotedAt = invitedVoterInfo.some(col => col.name === 'votedAt');
      
      if (!hasVotedAt) {
        db.exec(`ALTER TABLE InvitedVoter ADD COLUMN votedAt TEXT`);
      }
    } catch (alterError) {
      // Already exists, skip
    }
    
    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Generate a unique ID for database records
 * @returns {string} Unique ID like "lm3k5n8p9q"
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Generate a code for session access (admin or voting)
 * @param {number} length - Code length (default: 8)
 * @returns {string} Uppercase code like "A3B7X9K2"
 */
function generateCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Get current timestamp in ISO format
 * @returns {string} ISO timestamp
 */
function getCurrentTimestamp() {
  return new Date().toISOString();
}

/**
 * Get database instance
 * @returns {Database} Connection
 */
function getDb() {
  return db;
}

export { 
  db, 
  initDatabase, 
  generateId, 
  generateCode,
  getCurrentTimestamp,
  getDb
};
