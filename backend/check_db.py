import sqlite3

def check_db():
    try:
        conn = sqlite3.connect("database.db")
        cursor = conn.cursor()

        # Order by ID (clean output)
        cursor.execute("SELECT id, email, password FROM users ORDER BY id ASC")
        users = cursor.fetchall()

        conn.close()

        print("\n📊 Users in database:\n")

        if users:
            for user in users:
                user_id, email, password = user
                print(f"ID: {user_id}")
                print(f"Email: {email}")
                print(f"Password Hash: {password[:20]}...")  # show partial only
                print("-" * 40)
        else:
            print("❌ No users found in database.")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    check_db()