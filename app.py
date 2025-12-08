import os
import re
import uuid
import subprocess
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from utils.data_fetch import fetch_and_add_papers
from flask_cors import CORS
from database.db_utils import get_statistics, get_research_interests, create_user, authenticate_user, get_user_by_email, get_user_by_id, update_user

UPLOAD_FOLDER = "uploads"
RESULTS_FOLDER = "data/results"
ALLOWED_EXTENSIONS = {"pdf"}

app = Flask(__name__)
CORS(app)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULTS_FOLDER, exist_ok=True)


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def parse_review(text):
    """Parse the review.txt into sections."""
    sections = {}
    matches = re.split(r"\*\*(\d+\..*?)\*\*", text)
    for i in range(1, len(matches), 2):
        title = matches[i].strip()
        content = matches[i + 1].strip() if i + 1 < len(matches) else ""
        sections[title] = content
    return sections


@app.route("/api/review", methods=["POST"])
def review():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        pdf_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(pdf_path)

        # Handle Deep Search
        deep_search = request.form.get("deep_search")
        topic = request.form.get("topic")
        if deep_search and topic:
            print(f"[INFO] Running deep search for topic: {topic}")
            fetch_and_add_papers(topic, max_papers=15)
            subprocess.run(["python", "utils/faiss_index.py"])

        # Unique run ID
        run_id = str(uuid.uuid4())[:8]
        run_dir = os.path.join(RESULTS_FOLDER, run_id)
        os.makedirs(run_dir, exist_ok=True)

        # Run pipeline
        result = subprocess.run(
            [
                "python",
                "utils/run_pipeline.py",
                "--pdf_path",
                pdf_path,
                "--out_dir",
                run_dir,
            ],
            capture_output=True,
            text=True,
        )

        if result.returncode != 0:
            print(f"[ERROR] Pipeline failed:")
            print(f"STDOUT: {result.stdout}")
            print(f"STDERR: {result.stderr}")
            return jsonify({"error": f"Pipeline failed: {result.stderr}"}), 500

        review_file = os.path.join(run_dir, "review.txt")
        if not os.path.exists(review_file):
            with open(review_file, "w", encoding="utf-8") as f:
                f.write(
                    "**1. Summary of the Paper**\nThis is a mock summary.\n\n"
                    "**2. Strengths**\n- Example strength.\n\n"
                    "**3. Weaknesses**\n- Example weakness.\n\n"
                    "**9. Final Recommendation**\n📌 Reject."
                )

        with open(review_file, "r", encoding="utf-8") as f:
            review_text = f.read()
        sections = parse_review(review_text)

        return jsonify({"review": sections})

    return jsonify({"error": "Invalid file type. Only PDF allowed."}), 400


@app.route("/api/statistics", methods=["GET"])
def statistics():
    """Get platform statistics"""
    try:
        stats = get_statistics()
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/research-interests", methods=["GET"])
def research_interests():
    """Get all research interests"""
    try:
        interests = get_research_interests()
        return jsonify(interests)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/auth/register", methods=["POST"])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")
        name = data.get("name")
        image_url = data.get("image_url")
        interests = data.get("interests", "")  # Comma-separated string for backward compatibility
        interest_ids = data.get("interest_ids", [])  # List of interest IDs for junction table

        if not email or not password or not name:
            return jsonify({"error": "Email, password, and name are required"}), 400

        user = create_user(email, password, name, image_url, interests, interest_ids)
        if user:
            # Remove password hash from response
            user.pop('password_hash', None)
            return jsonify(user), 201
        else:
            return jsonify({"error": "User with this email already exists"}), 409
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/auth/login", methods=["POST"])
def login():
    """Login a user"""
    try:
        data = request.get_json()
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        user = authenticate_user(email, password)
        if user:
            return jsonify(user), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/auth/user/<int:user_id>", methods=["GET"])
def get_user(user_id):
    """Get user by ID"""
    try:
        user = get_user_by_id(user_id)
        if user:
            user.pop('password_hash', None)
            return jsonify(user), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/auth/user/<int:user_id>", methods=["PUT", "PATCH"])
def update_user_endpoint(user_id):
    """Update user information"""
    try:
        data = request.get_json()

        # Build updates dict (only include allowed fields)
        updates = {}
        allowed_fields = ['name', 'email', 'image_url', 'interests', 'password']

        for field in allowed_fields:
            if field in data:
                updates[field] = data[field]

        if not updates:
            return jsonify({"error": "No valid fields to update"}), 400

        # Update user in database
        success = update_user(user_id, updates)
        if success:
            # Return updated user data
            user = get_user_by_id(user_id)
            if user:
                user.pop('password_hash', None)
                return jsonify(user), 200
            else:
                return jsonify({"error": "User not found after update"}), 404
        else:
            return jsonify({"error": "Failed to update user"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
