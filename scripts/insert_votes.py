import sqlite3

# Path to our database
db_path = "../database/voting.db"

# Connect to the database
print("Connecting to database...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("\n=== Insert Vote Data ===")
print("\n--- Recording New Vote ---")
user_id = input("Enter user ID: ")
election_id = input("Enter election ID: ")
candidate_id = input("Enter candidate ID: ")
vote_time = input("Enter vote time (YYYY-MM-DD HH:MM:SS): ")

cursor.execute("""
    INSERT INTO votes (user_id, election_id, candidate_id, vote_time)
    VALUES (?, ?, ?, ?)
""", (user_id, election_id, candidate_id, vote_time))

conn.commit()
print("Vote recorded successfully!")

# Close the connection
conn.close()
print("\nDatabase connection closed.")
