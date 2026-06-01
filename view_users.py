#!/usr/bin/env python3
"""
User Database Viewer for NIDS Project
Run this script to see all registered users in the database
"""

import sqlite3
import os
from datetime import datetime

# Database file path
DB_PATH = 'nids_database.db'

def check_database_exists():
    """Check if database file exists"""
    if not os.path.exists(DB_PATH):
        print(f"\n❌ Database file '{DB_PATH}' not found!")
        print("   Please run the app.py first and register at least one user.")
        print("   Then run this script again.\n")
        return False
    return True

def connect_to_database():
    """Connect to SQLite database"""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row  # This allows accessing columns by name
        return conn
    except sqlite3.Error as e:
        print(f"\n❌ Database connection error: {e}\n")
        return None

def get_table_info(cursor):
    """Get information about tables in database"""
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    return [table[0] for table in tables]

def display_all_users(cursor):
    """Display all registered users"""
    cursor.execute('''
        SELECT id, name, email, mobile, created_at, last_login, is_active 
        FROM users 
        ORDER BY id
    ''')
    users = cursor.fetchall()
    
    if not users:
        print("\n📭 No users found in the database.")
        print("   Please register a user first through the web interface.\n")
        return False
    
    print("\n" + "="*80)
    print("                     📋 REGISTERED USERS")
    print("="*80)
    
    for user in users:
        print(f"\n┌─────────────────────────────────────────────────────────────────┐")
        print(f"│ 🆔 User ID:      {user['id']}")
        print(f"│ 👤 Name:         {user['name']}")
        print(f"│ 📧 Email:        {user['email']}")
        print(f"│ 📱 Mobile:       {user['mobile']}")
        print(f"│ 📅 Registered:   {user['created_at']}")
        
        # Format last login nicely
        if user['last_login']:
            print(f"│ 🔑 Last Login:    {user['last_login']}")
        else:
            print(f"│ 🔑 Last Login:    Never")
        
        # Show active status
        if user['is_active'] == 1:
            print(f"│ ✅ Status:       Active")
        else:
            print(f"│ ❌ Status:       Inactive")
        
        print(f"└─────────────────────────────────────────────────────────────────┘")
    
    print(f"\n📊 Total Users: {len(users)}")
    print("="*80 + "\n")
    return True

def display_user_summary(cursor):
    """Display a compact summary table of users"""
    cursor.execute('SELECT id, name, email, created_at FROM users ORDER BY id')
    users = cursor.fetchall()
    
    if not users:
        return
    
    print("\n" + "="*80)
    print("                     📊 USER SUMMARY TABLE")
    print("="*80)
    print(f"{'ID':<6} {'Name':<25} {'Email':<30} {'Registered Date':<20}")
    print("-"*80)
    
    for user in users:
        # Extract just the date part from created_at
        reg_date = user['created_at'].split()[0] if user['created_at'] else 'Unknown'
        print(f"{user['id']:<6} {user['name']:<25} {user['email']:<30} {reg_date:<20}")
    
    print("-"*80)
    print(f"Total: {len(users)} users")
    print("="*80 + "\n")

def search_users(cursor, search_term):
    """Search for users by name or email"""
    cursor.execute('''
        SELECT id, name, email, mobile, created_at, last_login 
        FROM users 
        WHERE name LIKE ? OR email LIKE ?
        ORDER BY id
    ''', (f'%{search_term}%', f'%{search_term}%'))
    
    users = cursor.fetchall()
    
    if not users:
        print(f"\n🔍 No users found matching '{search_term}'\n")
        return
    
    print(f"\n🔍 Search Results for '{search_term}':")
    print("="*60)
    
    for user in users:
        print(f"   🆔 ID: {user['id']} | 👤 {user['name']} | 📧 {user['email']}")
    
    print(f"\n📊 Found {len(users)} user(s)")
    print("="*60 + "\n")

def show_database_info(cursor):
    """Show database information"""
    # Get table info
    tables = get_table_info(cursor)
    
    print("\n" + "="*80)
    print("                     💾 DATABASE INFORMATION")
    print("="*80)
    print(f"📁 Database File: {DB_PATH}")
    print(f"📊 File Size: {os.path.getsize(DB_PATH):,} bytes")
    
    print(f"\n📋 Tables in database:")
    for table in tables:
        # Get row count for each table
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"   └─ 📄 {table}: {count} row(s)")
    
    print("="*80 + "\n")

def get_user_count(cursor):
    """Get total number of registered users"""
    cursor.execute('SELECT COUNT(*) FROM users')
    count = cursor.fetchone()[0]
    return count

def main():
    """Main function"""
    print("\n" + "🔐"*40)
    print("       NIDS USER DATABASE VIEWER")
    print("🔐"*40)
    
    # Check if database exists
    if not check_database_exists():
        return
    
    # Connect to database
    conn = connect_to_database()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    # Show database info
    show_database_info(cursor)
    
    # Display all users with detailed format
    display_all_users(cursor)
    
    # Display compact summary
    display_user_summary(cursor)
    
    # Ask if user wants to search
    while True:
        search_choice = input("🔍 Do you want to search for a user? (y/n): ").lower().strip()
        if search_choice in ['y', 'yes']:
            search_term = input("Enter name or email to search: ").strip()
            if search_term:
                search_users(cursor, search_term)
            else:
                print("❌ Please enter a search term.\n")
        elif search_choice in ['n', 'no']:
            break
        else:
            print("❌ Please enter 'y' or 'n'\n")
    
    # Close connection
    conn.close()
    
    print("\n✨ Done! Run 'python view_users.py' again to refresh.\n")

if __name__ == "__main__":
    main()