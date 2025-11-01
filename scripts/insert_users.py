import sqlite3

# Path to our database
db_path = "../database/voting.db"

# Connect to the database
print("Connecting to database...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("\n=== Insert User Data ===")
print("\n--- Adding New User ---")
username = input("Enter username: ")
password = input("Enter password: ")
fullname = input("Enter full name: ")
national_id = input("Enter national ID: ")
print("Role: 1=voter, 2=admin")
role_id = input("Enter role ID: ")
email = input("Enter email: ")
time_registered = input("Enter registration time (YYYY-MM-DD HH:MM:SS): ")

cursor.execute("""
    INSERT INTO users (username, password, fullname, national_id, role_id, email, time_registered)
    VALUES (?, ?, ?, ?, ?, ?, ?)
""", (username, password, fullname, national_id, role_id, email, time_registered))

conn.commit()
print("User added successfully!")

# Close the connection
conn.close()
print("\nDatabase connection closed.")
