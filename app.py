import os
import re
import uuid
import subprocess
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from utils.data_fetch import fetch_and_add_papers
from flask_cors import CORS
from database.db_utils import get_statistics, get_research_interests, create_user, authenticate_user, get_user_by_email, get_user_by_id, update_user, get_publications, create_review_submission, get_institutions, get_companies, get_review_submissions, auto_assign_reviewers_to_pending_papers, link_user_to_person, is_user_reviewer_for_submission, create_or_update_review, get_review_by_reviewer

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


@app.route("/api/publications", methods=["GET"])
def publications():
    """Get all publications"""
    try:
        pubs = get_publications()
        return jsonify(pubs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/institutions", methods=["GET"])
def get_institutions_endpoint():
    """Get all institutions"""
    try:
        institutions = get_institutions()
        return jsonify(institutions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/companies", methods=["GET"])
def get_companies_endpoint():
    """Get all companies"""
    try:
        companies = get_companies()
        return jsonify(companies), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/review-submissions", methods=["POST"])
def create_review_submission_endpoint():
    """Create a new review submission"""
    try:
        data = request.get_json()

        # Required fields
        user_id = data.get("user_id")
        title = data.get("title")
        abstract = data.get("abstract")
        link = data.get("link")
        topic = data.get("topic")
        author_name = data.get("author_name")

        if not all([user_id, title, abstract, link, topic, author_name]):
            return jsonify({"error": "Missing required fields"}), 400

        # Optional fields
        publication_year = data.get("publication_year", None)
        keywords = data.get("keywords", "")
        co_authors = data.get("co_authors", "")
        author_affiliation_id = data.get("author_affiliation_id", None)
        author_workplace_id = data.get("author_workplace_id", None)
        author_bachelor_institution_id = data.get("author_bachelor_institution_id", None)
        author_master_institution_id = data.get("author_master_institution_id", None)
        author_phd_institution_id = data.get("author_phd_institution_id", None)
        author_advisor_name = data.get("author_advisor_name", None)
        author_research_group = data.get("author_research_group", None)
        author_city = data.get("author_city", None)
        author_state = data.get("author_state", None)
        author_country = data.get("author_country", None)

        # Convert keywords and co_authors to JSON strings if they're arrays
        import json
        if isinstance(keywords, list):
            keywords = json.dumps(keywords)
        if isinstance(co_authors, list):
            co_authors = json.dumps(co_authors)

        submission = create_review_submission(
            user_id=user_id,
            title=title,
            publication_year=publication_year,
            abstract=abstract,
            link=link,
            topic=topic,
            keywords=keywords,
            author_name=author_name,
            co_authors=co_authors,
            author_affiliation_id=author_affiliation_id,
            author_workplace_id=author_workplace_id,
            author_bachelor_institution_id=author_bachelor_institution_id,
            author_master_institution_id=author_master_institution_id,
            author_phd_institution_id=author_phd_institution_id,
            author_advisor_name=author_advisor_name,
            author_research_group=author_research_group,
            author_city=author_city,
            author_state=author_state,
            author_country=author_country,
        )

        if submission:
            # Auto-assign reviewers to the newly submitted paper
            auto_assign_reviewers_to_pending_papers()
            return jsonify(submission), 201
        else:
            return jsonify({"error": "Failed to create submission"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/review-submissions", methods=["GET"])
def get_review_submissions_endpoint():
    """Get review submissions - admin sees all, regular users see only assigned papers"""
    try:
        user_email = request.args.get("user_email")
        is_admin = request.args.get("is_admin", "false").lower() == "true"

        if not user_email:
            return jsonify({"error": "user_email parameter is required"}), 400

        # Check if user is admin
        ADMIN_EMAIL = "desaiparth2000@gmail.com"
        if user_email == ADMIN_EMAIL:
            is_admin = True

        submissions = get_review_submissions(user_email, is_admin)
        return jsonify(submissions), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/link-user-to-person", methods=["POST"])
def link_user_to_person_endpoint():
    """Manually link a user to a person in the Persons table"""
    try:
        data = request.get_json()
        user_id = data.get("user_id")

        if not user_id:
            return jsonify({"error": "user_id is required"}), 400

        person_id = link_user_to_person(user_id)
        if person_id:
            return jsonify({"person_id": person_id, "message": "User linked to person successfully"}), 200
        else:
            return jsonify({"message": "No matching person found for this user"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/auto-assign-reviewers", methods=["POST"])
def auto_assign_reviewers_endpoint():
    """Manually trigger auto-assignment of reviewers to pending papers"""
    try:
        assigned_count = auto_assign_reviewers_to_pending_papers()
        return jsonify({"assigned_count": assigned_count, "message": f"Assigned reviewers to {assigned_count} papers"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/check-reviewer", methods=["GET"])
def check_reviewer_endpoint():
    """Check if a user is the assigned reviewer for a submission"""
    try:
        user_email = request.args.get("user_email")
        submission_id = request.args.get("submission_id", type=int)

        if not user_email or not submission_id:
            return jsonify({"error": "user_email and submission_id are required"}), 400

        is_reviewer = is_user_reviewer_for_submission(user_email, submission_id)
        return jsonify({"is_reviewer": is_reviewer}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/reviews", methods=["POST"])
def create_review_endpoint():
    """Create or update a review - admins can review any paper"""
    try:
        data = request.get_json()
        user_email = data.get("user_email")
        submission_id = data.get("submission_id")
        review_text = data.get("review_text")

        if not all([user_email, submission_id, review_text]):
            return jsonify({"error": "user_email, submission_id, and review_text are required"}), 400

        # Get user's person_id
        from database.db_utils import get_user_by_email
        user = get_user_by_email(user_email)
        if not user or not user.get('person_id'):
            return jsonify({"error": "User not found or not linked to Persons table"}), 404

        reviewer_person_id = user['person_id']

        # Create or update review (admin check is done in is_user_reviewer_for_submission)
        review = create_or_update_review(submission_id, reviewer_person_id, review_text)

        if review:
            return jsonify(review), 201
        else:
            return jsonify({"error": "Failed to create/update review"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/reviews", methods=["GET"])
def get_review_endpoint():
    """Get review by reviewer for a submission - admins can see any review"""
    try:
        user_email = request.args.get("user_email")
        submission_id = request.args.get("submission_id", type=int)

        if not user_email or not submission_id:
            return jsonify({"error": "user_email and submission_id are required"}), 400

        # Get user's person_id
        from database.db_utils import get_user_by_email
        user = get_user_by_email(user_email)
        if not user or not user.get('person_id'):
            return jsonify({"error": "User not found or not linked to Persons table"}), 404

        reviewer_person_id = user['person_id']

        # Pass user_email so admin can see any review
        review = get_review_by_reviewer(submission_id, reviewer_person_id, user_email)

        if review:
            return jsonify(review), 200
        else:
            return jsonify({"message": "No review found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
