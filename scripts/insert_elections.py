import sqlite3

# Path to our database
db_path = "../database/voting.db"

# Connect to the database
print("Connecting to database...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("\n=== Insert Election Data ===")
print("\n--- Adding New Election ---")
title = input("Enter election title: ")
description = input("Enter description: ")
start_date = input("Enter start date (YYYY-MM-DD): ")
end_date = input("Enter end date (YYYY-MM-DD): ")
status = input("Enter status (planned/ongoing/finished/cancelled): ")

cursor.execute("""
    INSERT INTO elections (title, description, start_date, end_date, status)
    VALUES (?, ?, ?, ?, ?)
""", (title, description, start_date, end_date, status))

conn.commit()
print("Election added successfully!")

# Close the connection
conn.close()
print("\nDatabase connection closed.")
