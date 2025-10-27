import sqlite3

# Path to our database
db_path = "../database/voting.db"

# Connect to the database
print("Connecting to database...")
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Show menu of tables
print("\n=== Insert Data into Voting System ===")
print("\nWhich table do you want to insert data into?")
print("1. Users")
print("2. Elections")
print("3. Candidates")
print("4. Votes")
print("5. Exit")

choice = input("\nEnter your choice (1-5): ")

if choice == "1":
    # Insert user data
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

elif choice == "2":
    # Insert election data
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

elif choice == "3":
    # Insert candidate data
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

elif choice == "4":
    # Insert vote data
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

elif choice == "5":
    print("Exiting...")

else:
    print("Invalid choice!")

# Close the connection
conn.close()
print("\nDatabase connection closed.")
