from flask import Flask, request, jsonify, send_from_directory, Response, stream_with_context
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
import os
import traceback
import json
import urllib.request
from database import init_db

app = Flask(__name__, static_folder='../dist', static_url_path='')

# Explicitly allow the Vercel frontend origin plus localhost for dev
ALLOWED_ORIGINS = [
    "https://ai-resume-analyzer-sb01.vercel.app",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS(app, resources={r"/*": {"origins": ALLOWED_ORIGINS}}, supports_credentials=False)

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


# ------------------ AI CHAT (GEMINI) ------------------
@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    # Handle CORS preflight
    if request.method == "OPTIONS":
        return jsonify({}), 200

    try:
        data = request.get_json(silent=True) or {}
        messages = data.get("messages", [])
        resume_context = data.get("resumeContext", {})

        if not messages or not isinstance(messages, list):
            return jsonify({"error": "messages array is required"}), 400

        GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
        if not GEMINI_API_KEY:
            return jsonify({"error": "AI service is not configured. Please set GEMINI_API_KEY on the server."}), 503

        # Build system prompt
        system_prompt = (
            "You are an elite AI Career Coach with 15+ years of expertise in resume optimization, "
            "ATS systems, talent acquisition, interview strategy, and career development.\n\n"
            "RESPONSE RULES:\n"
            "1. Always structure responses with clear headings (##), bullet points, and numbered lists\n"
            "2. Be specific — include concrete examples, metrics, and real-world scenarios\n"
            "3. Use before/after examples when suggesting resume improvements\n"
            "4. End every response with a 'Next Steps' section with 2-3 specific action items\n"
            "5. Reference industry statistics or ATS behavior when relevant\n"
            "6. Tone — professional but warm, like a trusted mentor\n"
            "7. Reference the user's resume/JD when available"
        )

        resume_text = resume_context.get("resumeText", "") if resume_context else ""
        job_desc = resume_context.get("jobDescription", "") if resume_context else ""
        if resume_text:
            system_prompt += f"\n\n--- USER'S RESUME ---\n{resume_text[:3000]}"
        if job_desc:
            system_prompt += f"\n\n--- TARGET JOB DESCRIPTION ---\n{job_desc[:1500]}"

        # Build Gemini request payload (non-streaming for reliability)
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

        # Convert messages from OpenAI format to Gemini format
        gemini_contents = []
        # Add system instruction as first user message if Gemini doesn't support system role
        for msg in messages[-20:]:  # last 20 messages
            role = "user" if msg.get("role") == "user" else "model"
            gemini_contents.append({
                "role": role,
                "parts": [{"text": msg.get("content", "")}]
            })

        payload = json.dumps({
            "system_instruction": {"parts": [{"text": system_prompt}]},
            "contents": gemini_contents,
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 2048,
            }
        }).encode("utf-8")

        req = urllib.request.Request(
            gemini_url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as http_err:
            error_body = http_err.read().decode("utf-8", errors="replace")
            app.logger.error("Gemini API HTTP error %s: %s", http_err.code, error_body)
            if http_err.code == 400:
                return jsonify({"error": "Invalid request to AI service."}), 400
            if http_err.code == 403:
                return jsonify({"error": "AI API key is invalid or missing permissions."}), 503
            if http_err.code == 429:
                return jsonify({"error": "AI rate limit reached. Please try again in a moment."}), 429
            return jsonify({"error": f"AI service error: {http_err.code}"}), 502
        except urllib.error.URLError as url_err:
            app.logger.error("Gemini API connection error: %s", url_err)
            return jsonify({"error": "Could not reach AI service. Check server connectivity."}), 502

        # Extract text from Gemini response
        try:
            reply_text = result["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as parse_err:
            app.logger.error("Unexpected Gemini response structure: %s | raw: %s", parse_err, result)
            return jsonify({"error": "Unexpected response from AI service."}), 502

        return jsonify({"reply": reply_text}), 200

    except Exception as exc:
        app.logger.error("Chat endpoint error: %s\n%s", exc, traceback.format_exc())
        return jsonify({"error": f"Server error: {str(exc)}"}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)