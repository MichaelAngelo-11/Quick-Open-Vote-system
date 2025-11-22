# Quick-Open Vote System - Democratic Voting Made Simple

A production-ready voting system with official (email-based) and casual (code-based) voting modes. Features real-time results, duplicate vote prevention, and a comprehensive admin dashboard.

---

## Quick Start

### 1. Install Dependencies (One Time Only)

**For Linux/Mac:**
```bash
cd Quick-Open-Vote-system
npm install
```

**For Windows:**
1. Open Command Prompt or PowerShell
2. Navigate to the project folder:
   ```cmd
   cd Quick-Open-Vote-system
   ```
3. Install dependencies:
   ```cmd
   npm install
   ```

This installs:
- express - Web server
- better-sqlite3 - SQLite database
- cors - CORS middleware

### 2. Start the Server

**For Linux/Mac:**
```bash
npm start
```

**For Windows:**
```cmd
npm start
```

You should see:
```
Database initialized
Server running on http://localhost:3000
```

### 3. Open in Browser

Visit: **http://localhost:3000**

That's it!

---

## Project Structure

```
Quick-Open Vote/
├── package.json              # Project dependencies
├── node_modules/             # Installed packages
├── backend/
│   ├── server.js             # Express server (serves frontend + API)
│   ├── database.js           # SQLite connection and helpers
│   ├── database.sqlite       # SQLite database file (auto-created)
│   ├── schema.sql            # Database schema definition
│   └── routes/               # API route handlers
│       ├── sessions.js       # Session management
│       ├── candidates.js     # Candidate CRUD operations
│       ├── voters.js         # Invited voter management
│       ├── vote.js           # Vote submission
│       └── results.js        # Results with visibility control
└── frontend/
    ├── index.html            # Landing page
    ├── create.html           # Create session page
    ├── vote.html             # Voting page
    ├── admin.html            # Admin dashboard
    ├── results.html          # Results page
    ├── css/
    │   └── styles.css        # All styles (Shadcn/ui inspired)
    └── js/
        ├── utils.js          # API helpers & utilities
        ├── components.js     # Reusable React components
        ├── index.js          # Landing page logic
        ├── create.js         # Create session logic
        ├── vote.js           # Voting page logic
        ├── admin.js          # Admin dashboard logic
        └── results.js        # Results page with auto-refresh
```

---

## Key Features

### Voting Modes
- **Official Mode**: Email-based invitations with vote tracking
- **Casual Mode**: Open voting with session code access

### Result Display Options
- **Realtime**: Results visible during voting (5-second refresh)
- **After Voting Closes**: Results appear only when session is closed (3-second polling)

### Security & Integrity
- **Duplicate vote prevention** (name-based + localStorage)
- **Session access control** (admin codes vs voter codes)
- Foreign key constraints in database
- Vote timestamps for audit trail

### Admin Dashboard
- Session settings management
- Candidate CRUD operations
- Invited voter management (official mode) with vote timestamps
- Real-time results
- Session open/close control
- Auto-refresh

### Voter Experience
- Clean, professional interface with plain text buttons
- Simple candidate selection
- Real-time vote confirmation
- Accessible design

---

## Test the API (Optional)

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T...",
  "message": "Quick-Open Vote backend is running!"
}
```

---

## How to Use

### Create a Voting Session
1. Go to http://localhost:3000
2. Click "Create Voting Session"
3. Fill in session details:
    - Session name
    - Voting mode (Official or Casual)
    - Result display preference (Realtime or After Closes)
4. Add positions and candidates
5. (Optional) Add invited voters for official mode
6. Click "Create Session"
7. Save the **Admin Code** (for managing session) and **Voter Code** (for sharing)

### Vote in a Session
1. Click "Join Voting Session" or visit `/vote.html?code=VOTER_CODE`
2. Enter your name
3. Select one candidate per position
4. Submit your vote

### View Results
1. Visit `/results.html?code=VOTER_CODE`
2. Results auto-refresh based on session settings
3. Winners are highlighted with gold badges

### Manage Session (Admin)
1. Visit `/admin.html?code=ADMIN_CODE`
2. Access 4 tabs:
    - **Settings**: Update session details, close/reopen voting, access admin/voting links
    - **Candidates**: Add/edit/delete candidates
    - **Voters**: Manage invited voters with vote timestamps (official mode only)
    - **Results**: View live results with vote counts (auto-refreshes every 10 seconds)

**Note**: Admin dashboard and results pages auto-refresh - no manual refresh button needed.

---

## Architecture

### Frontend
- **React 18** (CDN-based, no build tools)
- **React.createElement syntax** (no JSX compilation)
- **Vanilla CSS** with design tokens and utility classes
- **Professional UI** with plain text buttons

### Backend
- **Node.js + Express** for server and API
- **SQLite (better-sqlite3)** for database
- **Prepared statements** for SQL injection prevention
- **Foreign key constraints** for data integrity

### Database Schema
- **VotingSession**: Session metadata with voting settings
- **Position**: Positions to vote for (linked to sessions)
- **Candidate**: Candidates per position
- **Vote**: Vote records with timestamps and duplicate prevention
- **InvitedVoter**: Email-based voter management with vote timestamps (official mode)

### Database Features

- **Auto-migration**: Existing databases automatically upgrade on server start
- **Timestamps**: All votes tracked with dd/mm/yyyy hh:mm:ss precision
- **Foreign keys**: Cascading deletes maintain referential integrity
- **Prepared statements**: SQL injection protection

---

## Troubleshooting

### Port Already in Use

```bash
lsof -i :3000
kill -9 PID  # Replace PID with actual process number
```

### Blank Page or Console Errors

1. Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
2. Open DevTools (F12) → Check Console and Network tabs
3. Verify React loads from CDN (check Network tab)
4. Restart the server: `npm start`

### Database Issues

```bash
# Reset database (WARNING: deletes all data)
rm backend/database.sqlite
npm start  # Auto-creates fresh database
```

---

## Development Notes

### No Build Tools Required

- Direct HTML/CSS/JS editing
- Refresh browser to see changes
- No compilation or bundling needed
- Uses React.createElement (no JSX/Babel)

### Easy Debugging

- `console.log()` anywhere in JS files
- Chrome DevTools for debugging
- Network tab shows all API calls
- SQLite database is human-readable

### Code Organization

- All styles in one CSS file
- Each page has dedicated JS file
- Shared components in `components.js`
- API utilities in `utils.js`

---

## Features

- Duplicate vote prevention
- Result visibility control
- Auto-refresh polling (admin & results pages)
- Vote timestamp tracking (dd/mm/yyyy hh:mm:ss)
- Clean, professional UI
- Comprehensive admin dashboard
- Database auto-migration support
- Email placeholders with comma separation
- Simple UI
