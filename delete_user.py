#!/usr/bin/env python3
"""
Delete User from NIDS Database
Run this script to remove a user from the database
"""

import sqlite3
import os

DB_PATH = 'nids_database.db'

def get_all_users(cursor):
    """Get all users to display"""
    cursor.execute('SELECT id, name, email FROM users ORDER BY id')
    return cursor.fetchall()

def delete_user_by_id(cursor, conn, user_id):
    """Delete user by ID"""
    try:
        cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
        conn.commit()
        return cursor.rowcount > 0
    except sqlite3.Error as e:
        print(f"❌ Error deleting user: {e}")
        return False

def main():
    print("\n" + "⚠️"*40)
    print("       NIDS USER DELETION TOOL")
    print("⚠️"*40)
    
    if not os.path.exists(DB_PATH):
        print(f"\n❌ Database file '{DB_PATH}' not found!\n")
        return
    
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Show current users
    users = get_all_users(cursor)
    
    if not users:
        print("\n📭 No users found in database.\n")
        conn.close()
        return
    
    print("\n📋 Current Users:")
    print("-" * 50)
    for user in users:
        print(f"   ID: {user['id']} | {user['name']} | {user['email']}")
    print("-" * 50)
    
    # Ask which user to delete
    try:
        user_id = int(input("\n🗑️  Enter User ID to delete (or 0 to cancel): "))
        
        if user_id == 0:
            print("\n❌ Cancelled.\n")
            conn.close()
            return
        
        # Confirm deletion
        confirm = input(f"⚠️  Are you sure you want to delete user ID {user_id}? (yes/no): ")
        
        if confirm.lower() == 'yes':
            if delete_user_by_id(cursor, conn, user_id):
                print(f"\n✅ User ID {user_id} has been deleted successfully!\n")
            else:
                print(f"\n❌ User ID {user_id} not found.\n")
        else:
            print("\n❌ Deletion cancelled.\n")
            
    except ValueError:
        print("\n❌ Invalid input. Please enter a number.\n")
    
    conn.close()

if __name__ == "__main__":
    main()