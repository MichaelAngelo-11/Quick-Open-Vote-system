import sqlite3
import os

# Database setup script for the voting system

# Paths to our database and schema files
db_path = "../database/voting.db"
schema_path = "../database/schema.sql"

# Check if database already exists
if os.path.exists(db_path):
    print("Database already exists!")
    print("Location:", db_path)
else:
    print("Creating new database...")
    
    # Connect to the database 
    conn = sqlite3.connect(db_path)
    
    # Read the schema file
    print("Reading schema file...")
    schema_file = open(schema_path, "r")
    schema = schema_file.read()
    schema_file.close()
    
    # Execute the schema to create tables
    print("Creating tables...")
    conn.executescript(schema)
    
    # Close the connection
    conn.close()
    
    print("Database created successfully!")
    print("Location:", db_path)

