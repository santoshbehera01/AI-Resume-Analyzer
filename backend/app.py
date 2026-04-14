from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import os
from database import init_db

app = Flask(__name__, static_folder='../dist', static_url_path='')
CORS(app, resources={r"/*": {"origins": [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
]}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE_DIR, "database.db")

# Initialize database
init_db()


# ------------------ SIGNUP ------------------
@app.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
    except:
        return jsonify({"message": "Invalid request format"}), 400

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    app.logger.info("Signup request received for email=%s", email)

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

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
        return jsonify({"message": "User already exists"}), 400
    except Exception as exc:
        app.logger.error("Signup error for %s: %s", email, exc)
        return jsonify({"message": "Signup failed due to server error"}), 500
    finally:
        conn.close()


# ------------------ LOGIN ------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.json or {}
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


if __name__ == "__main__":
    app.run(debug=True)