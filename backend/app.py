from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import os
import traceback
from database import init_db

app = Flask(__name__, static_folder='../dist', static_url_path='')
CORS(app, resources={r"/*": {"origins": "*"}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE_DIR, "database.db")

# Initialize database
try:
    init_db(DB)
    print("Database initialized successfully.")
except Exception as e:
    print(f"Error initializing database: {e}")


# ------------------ SIGNUP ------------------
@app.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json(silent=True)
        if not data:
            data = {}
            
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        app.logger.info("Signup request received for email=%s", email)

        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400
            
        if len(password) < 6:
            return jsonify({"message": "Password must be at least 6 characters"}), 400

        hashed_password = generate_password_hash(password)

        conn = sqlite3.connect(DB)
        cursor = conn.cursor()

        try:
            cursor.execute("INSERT INTO users (email, password) VALUES (?, ?)", (email, hashed_password))
            conn.commit()
            app.logger.info("User inserted successfully: %s", email)
            return jsonify({"message": "User created successfully"}), 201
        except sqlite3.IntegrityError:
            app.logger.warning("Signup failed: duplicate email %s", email)
            return jsonify({"message": "Email already exists"}), 400
        finally:
            conn.close()

    except Exception as exc:
        app.logger.error("Signup error for %s: %s\n%s", email if 'email' in locals() else 'unknown', exc, traceback.format_exc())
        return jsonify({"message": f"Signup failed due to server error: {str(exc)}"}), 500


# ------------------ LOGIN ------------------
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(silent=True)
        if not data:
            data = {}
            
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""

        app.logger.info("Login attempt for email=%s", email)

        if not email or not password:
            return jsonify({"message": "Email and password are required"}), 400

        conn = sqlite3.connect(DB)
        cursor = conn.cursor()

        cursor.execute("SELECT password FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()
        conn.close()

        if user and check_password_hash(user[0], password):
            app.logger.info("Login successful for email=%s", email)
            return jsonify({"message": "Login successful"}), 200
        else:
            app.logger.warning("Login failed for email=%s", email)
            return jsonify({"message": "Invalid email or password"}), 401

    except Exception as exc:
        app.logger.error("Login error for %s: %s\n%s", email if 'email' in locals() else 'unknown', exc, traceback.format_exc())
        return jsonify({"message": f"Login failed due to server error: {str(exc)}"}), 500


# ------------------ GET USERS ------------------
@app.route("/users", methods=["GET"])
def get_users():
    try:
        conn = sqlite3.connect(DB)
        cursor = conn.cursor()
        cursor.execute("SELECT id, email FROM users")
        users = cursor.fetchall()
        conn.close()
        
        # Convert to list of dicts
        user_list = [{"id": user[0], "email": user[1]} for user in users]
        return jsonify(user_list), 200
    except Exception as e:
        app.logger.error(f"Error fetching users: {e}")
        return jsonify({"error": str(e)}), 500


# ------------------ HOME (TEST) ------------------
@app.route("/")
def home():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def catch_all(path):
    # Serve static files or fallback to index.html for client-side routing
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')


# ------------------ HEALTH CHECK ------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "Flask server is running"}), 200


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)