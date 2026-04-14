import sqlite3

def check_db():
    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()
        cursor.execute("SELECT id, email FROM users")
        users = cursor.fetchall()
        conn.close()
        
        if users:
            print("Users in database:")
            for user in users:
                print(f"{user[0]} | {user[1]}")
        else:
            print("No users found in database.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_db()