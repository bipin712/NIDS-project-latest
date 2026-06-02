#!/usr/bin/env python3
"""
Database Viewer Script
Displays alerts from the SQLite database in a readable format
"""

import sqlite3
import os
from datetime import datetime
from tabulate import tabulate

# Define paths
LOG_DIR = 'logs'
DB_PATH = os.path.join(LOG_DIR, 'alerts.db')

def view_all_alerts():
    """Display all alerts from the database"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM alerts ORDER BY id DESC')
        alerts = cursor.fetchall()
        
        if not alerts:
            print("No alerts found in the database.")
            return
        
        # Get column names
        cursor.execute('PRAGMA table_info(alerts)')
        columns = [col[1] for col in cursor.fetchall()]
        
        print(f"\n{'='*100}")
        print(f"Total Alerts: {len(alerts)}")
        print(f"{'='*100}\n")
        
        # Display using tabulate for nice formatting
        print(tabulate(alerts, headers=columns, tablefmt='grid'))
        print()
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

def view_alerts_by_severity(severity):
    """Display alerts filtered by severity"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM alerts WHERE severity = ? ORDER BY id DESC', (severity,))
        alerts = cursor.fetchall()
        
        if not alerts:
            print(f"No alerts found with severity: {severity}")
            return
        
        cursor.execute('PRAGMA table_info(alerts)')
        columns = [col[1] for col in cursor.fetchall()]
        
        print(f"\n{'='*100}")
        print(f"Alerts with Severity '{severity}': {len(alerts)}")
        print(f"{'='*100}\n")
        
        print(tabulate(alerts, headers=columns, tablefmt='grid'))
        print()
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

def view_alerts_by_type(attack_type):
    """Display alerts filtered by attack type"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM alerts WHERE attack_type = ? ORDER BY id DESC', (attack_type,))
        alerts = cursor.fetchall()
        
        if not alerts:
            print(f"No alerts found with type: {attack_type}")
            return
        
        cursor.execute('PRAGMA table_info(alerts)')
        columns = [col[1] for col in cursor.fetchall()]
        
        print(f"\n{'='*100}")
        print(f"Alerts with Type '{attack_type}': {len(alerts)}")
        print(f"{'='*100}\n")
        
        print(tabulate(alerts, headers=columns, tablefmt='grid'))
        print()
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

def get_database_stats():
    """Display database statistics"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Total alerts
        cursor.execute('SELECT COUNT(*) FROM alerts')
        total = cursor.fetchone()[0]
        
        # Alerts by severity
        cursor.execute('SELECT severity, COUNT(*) FROM alerts GROUP BY severity ORDER BY severity')
        by_severity = cursor.fetchall()
        
        # Alerts by type
        cursor.execute('SELECT attack_type, COUNT(*) FROM alerts GROUP BY attack_type ORDER BY attack_type')
        by_type = cursor.fetchall()
        
        print(f"\n{'='*100}")
        print("DATABASE STATISTICS")
        print(f"{'='*100}\n")
        
        print(f"Total Alerts: {total}")
        
        print("\nAlerts by Severity:")
        for severity, count in by_severity:
            print(f"  {severity}: {count}")
        
        print("\nAlerts by Attack Type:")
        for attack_type, count in by_type:
            print(f"  {attack_type}: {count}")
        
        print()
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    import sys
    
    print("\n" + "="*100)
    print("DATABASE VIEWER SCRIPT")
    print("="*100)
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == 'all' or command == 'view':
            view_all_alerts()
        elif command == 'stats':
            get_database_stats()
        elif command == 'severity' and len(sys.argv) > 2:
            view_alerts_by_severity(sys.argv[2])
        elif command == 'type' and len(sys.argv) > 2:
            view_alerts_by_type(sys.argv[2])
        else:
            print("\nUsage:")
            print("  python view_database.py all          - View all alerts")
            print("  python view_database.py stats        - Show database statistics")
            print("  python view_database.py severity <LEVEL>  - Filter by severity (e.g., high, medium, low)")
            print("  python view_database.py type <TYPE>  - Filter by attack type")
    else:
        # Default: show stats and then all alerts
        get_database_stats()
        view_all_alerts()
