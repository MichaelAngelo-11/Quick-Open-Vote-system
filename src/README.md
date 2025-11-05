Quick Voting System Backend
===========================

Overview
--------
This is the backend API for the Quick Voting System.  
It handles:
- User authentication
- Elections
- Candidates
- Votes

Built with Node.js + Express + SQLite.

Setup
-----
1. Install dependencies:
   npm install

2. Start the server:
   node server.js

Server runs at:
http://localhost:5000

Endpoints
---------

Auth
----
- Register user: POST /auth/register
  Body: { "username":"", "password":"", "fullname":"", "national_id":"", "role_id":1, "email":"", "time_registered":"YYYY-MM-DD HH:MM:SS" }
- Login: POST /auth/login
  Body: { "username":"", "password":"" }
- Delete user: DELETE /auth/delete/:user_id

Elections
---------
- Create election: POST /elections/create
  Body: { "title":"", "description":"", "start_date":"YYYY-MM-DD", "end_date":"YYYY-MM-DD", "status":"active" }
- Get all elections: GET /elections/

Candidates
----------
- Add candidate: POST /candidates/register
  Body: { "fullname":"", "party":"", "election_id":1 }
- Get all candidates: GET /candidates/
- Get candidates by election: GET /candidates/election/:election_id

Votes
-----
- Cast vote: POST /votes/cast
  Body: { "user_id":1,"election_id":1,"candidate_id":1,"vote_time":"YYYY-MM-DDTHH:MM:SSZ" }
- Get votes by election: GET /votes/:election_id

Example curl Commands
--------------------
Register candidate:
curl -X POST http://localhost:5000/candidates/register -H "Content-Type: application/json" -d '{"fullname":"John Doe","party":"Unity Party","election_id":1}'

Get candidates for election 1:
curl http://localhost:5000/candidates/election/1

Cast a vote:
curl -X POST http://localhost:5000/votes/cast -H "Content-Type: application/json" -d '{"user_id":1,"election_id":1,"candidate_id":1,"vote_time":"2025-10-29T10:00:00Z"}'

Get votes for election 1:
curl http://localhost:5000/votes/1

