import sqlite3

# Connect to the database
conn = sqlite3.connect('../database/voting.db')
cursor = conn.cursor()

# Print all users
print("\n=== USERS ===")
cursor.execute("SELECT * FROM users")
for row in cursor.fetchall():
    print(row)

# Print all elections
print("\n=== ELECTIONS ===")
cursor.execute("SELECT * FROM elections")
for row in cursor.fetchall():
    print(row)

# Print all candidates
print("\n=== CANDIDATES ===")
cursor.execute("SELECT * FROM candidates")
for row in cursor.fetchall():
    print(row)

# Print all votes
print("\n=== VOTES ===")
cursor.execute("SELECT * FROM votes")
for row in cursor.fetchall():
    print(row)

# Close the connection
conn.close()
