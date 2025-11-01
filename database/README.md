# Database Folder

This folder contains the database files for the voting system.

## Files

### voting.db
This is the main SQLite database file that stores all the voting system data. It contains tables for users, elections, candidates, and votes.

### schema.sql
This file defines the structure of the database. It includes:
- Table definitions
- Column specifications
- Foreign key relationships
- Default role values (voter and admin)

## Database Tables

### 1. roles
Stores the different user roles in the system.
- `role_id`: Unique identifier for each role
- `rolename`: Name of the role (voter or admin)

Default roles:
- ID 1: voter
- ID 2: admin

### 2. users
Stores all registered users in the system.
- `user_id`: Unique identifier (auto-generated)
- `username`: User's login name
- `password`: User's password
- `fullname`: User's full name
- `national_id`: National ID number
- `role_id`: References the roles table
- `email`: User's email address
- `time_registered`: When the user registered

### 3. elections
Stores information about each election.
- `election_id`: Unique identifier (auto-generated)
- `title`: Election title
- `description`: Election description
- `start_date`: When voting starts
- `end_date`: When voting ends
- `status`: Current status (planned, ongoing, finished, cancelled)

### 4. candidates
Stores candidates for each election.
- `candidate_id`: Unique identifier (auto-generated)
- `election_id`: Which election this candidate is in
- `fullname`: Candidate's full name
- `bio`: Candidate's biography
- `photo_url`: Link to candidate's photo

### 5. votes
Records each vote cast by users.
- `vote_id`: Unique identifier (auto-generated)
- `user_id`: Who voted
- `election_id`: Which election
- `candidate_id`: Who they voted for
- `vote_time`: When the vote was cast

Note: Each user can only vote once per election.

## How to Create the Database

1. Navigate to the scripts folder
2. Run: `python create_db.py`
3. The database will be created in this folder

## How to Add Data

1. Navigate to the scripts folder
2. Run: `python insert_data.py`
3. Choose which table you want to add data to
4. Follow the prompts to enter the data

## Database Features

- **Foreign Keys**: Tables are linked together to maintain data integrity
- **Unique Constraints**: Prevents duplicate usernames, emails, and national IDs
- **Auto-increment IDs**: Primary keys are automatically generated
- **One vote per user**: Each user can only vote once in each election
