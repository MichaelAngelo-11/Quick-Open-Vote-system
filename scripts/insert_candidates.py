import sqlite3

# Path to our database
db_path = "../database/voting.db"

# Connect to the database
print("Connecting to database...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("\n=== Insert Candidate Data ===")
print("\n--- Adding New Candidate ---")
election_id = input("Enter election ID: ")
fullname = input("Enter candidate full name: ")
bio = input("Enter bio: ")
photo_url = input("Enter photo URL: ")

cursor.execute("""
    INSERT INTO candidates (election_id, fullname, bio, photo_url)
    VALUES (?, ?, ?, ?)
""", (election_id, fullname, bio, photo_url))

conn.commit()
print("Candidate added successfully!")

# Close the connection
conn.close()
print("\nDatabase connection closed.")
