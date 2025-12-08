"""
Database utility functions for ReviewMatch AI
"""
import sqlite3
import hashlib
from pathlib import Path
from typing import Optional, Dict, Any

# Get absolute path to database
SCRIPT_DIR = Path(__file__).parent
DB_PATH = SCRIPT_DIR / "reviewmatch.db"

def get_db_connection():
    """Get a database connection"""
    return sqlite3.connect(DB_PATH)

def hash_password(password: str) -> str:
    """Hash a password using SHA-256 (for production, use bcrypt)"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash"""
    return hash_password(password) == password_hash

# User management functions
def create_user(email: str, password: str, name: str, image_url: Optional[str] = None, interests: Optional[str] = None, interest_ids: Optional[list] = None) -> Optional[Dict[str, Any]]:
    """Create a new user and optionally link research interests"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        password_hash = hash_password(password)
        cursor.execute("""
            INSERT INTO Users (email, password_hash, name, image_url, interests)
            VALUES (?, ?, ?, ?, ?)
        """, (email, password_hash, name, image_url, interests))

        user_id = cursor.lastrowid

        # If interest IDs are provided, create relationships in UserResearchInterests table
        if interest_ids:
            for interest_id in interest_ids:
                try:
                    cursor.execute("""
                        INSERT INTO UserResearchInterests (user_id, interest_id)
                        VALUES (?, ?)
                    """, (user_id, interest_id))
                except sqlite3.IntegrityError:
                    # Interest relationship already exists, skip
                    pass

        conn.commit()

        # Try to link user to Persons table if email matches
        link_user_to_person(user_id)

        return get_user_by_id(user_id)
    except sqlite3.IntegrityError:
        return None  # User already exists
    finally:
        conn.close()

def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT user_id, email, password_hash, name, image_url, interests, person_id, created_at
        FROM Users WHERE email = ?
    """, (email,))

    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            'user_id': row[0],
            'email': row[1],
            'password_hash': row[2],
            'name': row[3],
            'image_url': row[4],
            'interests': row[5],
            'person_id': row[6],
            'created_at': row[7]
        }
    return None

def get_user_by_id(user_id: int) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT user_id, email, password_hash, name, image_url, interests, person_id, created_at
        FROM Users WHERE user_id = ?
    """, (user_id,))

    row = cursor.fetchone()
    conn.close()

    if row:
        return {
            'user_id': row[0],
            'email': row[1],
            'password_hash': row[2],
            'name': row[3],
            'image_url': row[4],
            'interests': row[5],
            'person_id': row[6],
            'created_at': row[7]
        }
    return None

def update_user(user_id: int, updates: Dict[str, Any]) -> bool:
    """Update user information"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Build update query dynamically
    allowed_fields = ['name', 'email', 'image_url', 'interests', 'password_hash']
    update_fields = []
    values = []

    for field, value in updates.items():
        if field in allowed_fields:
            if field == 'password' and value:
                update_fields.append('password_hash = ?')
                values.append(hash_password(value))
            elif field != 'password':
                update_fields.append(f'{field} = ?')
                values.append(value)

    if not update_fields:
        conn.close()
        return False

    values.append(user_id)
    query = f"UPDATE Users SET {', '.join(update_fields)} WHERE user_id = ?"

    try:
        cursor.execute(query, values)
        conn.commit()
        return cursor.rowcount > 0
    except Exception as e:
        print(f"Error updating user: {e}")
        return False
    finally:
        conn.close()

def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    """Authenticate user and return user data (without password)"""
    user = get_user_by_email(email)
    if user and verify_password(password, user['password_hash']):
        # Return user without password hash
        user.pop('password_hash', None)
        return user
    return None

def get_statistics() -> Dict[str, int]:
    """Get platform statistics: active authors, research topics, papers reviewed"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Count active authors (persons with role 'Author' or 'Both')
        cursor.execute("""
            SELECT COUNT(*) FROM Persons
            WHERE role IN ('Author', 'Both', 'Co-Author')
        """)
        active_authors = cursor.fetchone()[0]

        # Count research topics
        cursor.execute("SELECT COUNT(*) FROM ResearchInterests")
        research_topics = cursor.fetchone()[0]

        # Count papers reviewed (publications in database)
        cursor.execute("SELECT COUNT(*) FROM Publications")
        papers_reviewed = cursor.fetchone()[0]

        return {
            "active_authors": active_authors,
            "research_topics": research_topics,
            "papers_reviewed": papers_reviewed
        }
    except Exception as e:
        print(f"Error getting statistics: {e}")
        return {
            "active_authors": 0,
            "research_topics": 0,
            "papers_reviewed": 0
        }
    finally:
        conn.close()

def get_research_interests() -> list:
    """Get all research interests from the database"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT interest_id, interest_name FROM ResearchInterests ORDER BY interest_name")
        interests = cursor.fetchall()
        return [{"id": row[0], "name": row[1]} for row in interests]
    except Exception as e:
        print(f"Error getting research interests: {e}")
        return []
    finally:
        conn.close()

def get_institutions() -> list:
    """Get all institutions from the database"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT institution_id, name, type, country, city FROM Institutions ORDER BY name")
        institutions = cursor.fetchall()
        return [{"id": row[0], "name": row[1], "type": row[2], "country": row[3], "city": row[4]} for row in institutions]
    except Exception as e:
        print(f"Error getting institutions: {e}")
        return []
    finally:
        conn.close()

def get_companies() -> list:
    """Get all companies from the database"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT company_id, company_name, industry, country, city, state FROM Companies ORDER BY company_name")
        companies = cursor.fetchall()
        return [{"id": row[0], "name": row[1], "industry": row[2], "country": row[3], "city": row[4], "state": row[5]} for row in companies]
    except Exception as e:
        print(f"Error getting companies: {e}")
        return []
    finally:
        conn.close()

def create_review_submission(
    user_id: int,
    title: str,
    publication_year: int,
    abstract: str,
    link: str,
    topic: str,
    keywords: str,
    author_name: str,
    co_authors: str,
    author_affiliation_id: Optional[int] = None,
    author_workplace_id: Optional[int] = None,
    author_bachelor_institution_id: Optional[int] = None,
    author_master_institution_id: Optional[int] = None,
    author_phd_institution_id: Optional[int] = None,
    author_advisor_name: Optional[str] = None,
    author_research_group: Optional[str] = None,
    author_city: Optional[str] = None,
    author_state: Optional[str] = None,
    author_country: Optional[str] = None,
) -> Optional[Dict[str, Any]]:
    """Create a new review submission"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO ReviewSubmissions (
                user_id, title, publication_year, abstract, link, topic, keywords,
                author_name, co_authors_name,
                author_affiliation_id, author_workplace_id,
                author_bachelor_institution_id, author_master_institution_id, author_phd_institution_id,
                author_advisor_name, author_research_group,
                author_city, author_state, author_country,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        """, (
            user_id, title, publication_year, abstract, link, topic, keywords,
            author_name, co_authors,
            author_affiliation_id, author_workplace_id,
            author_bachelor_institution_id, author_master_institution_id, author_phd_institution_id,
            author_advisor_name, author_research_group,
            author_city, author_state, author_country
        ))

        submission_id = cursor.lastrowid
        conn.commit()

        # Return the created submission
        cursor.execute("""
            SELECT submission_id, user_id, title, publication_year, abstract, link, topic,
                   author_name, submission_date, status
            FROM ReviewSubmissions WHERE submission_id = ?
        """, (submission_id,))
        row = cursor.fetchone()

        if row:
            return {
                'submission_id': row[0],
                'user_id': row[1],
                'title': row[2],
                'publication_year': row[3],
                'abstract': row[4],
                'link': row[5],
                'topic': row[6],
                'author_name': row[7],
                'submission_date': row[8],
                'status': row[9]
            }
        return None
    except Exception as e:
        print(f"Error creating review submission: {e}")
        return None
    finally:
        conn.close()

def get_publications() -> list:
    """Get all publications with author information"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            SELECT
                p.publication_id,
                p.title,
                p.publication_year,
                p.topic,
                p.abstract,
                p.link,
                p.keywords,
                p.co_authors_name,
                per.first_name || ' ' || per.last_name as author_name
            FROM Publications p
            LEFT JOIN Persons per ON p.author_id = per.person_id
            ORDER BY p.publication_year DESC, p.title
        """)

        publications = []
        for row in cursor.fetchall():
            pub = {
                "publication_id": row[0],
                "title": row[1] or "",
                "publication_year": row[2],
                "topic": row[3] or "",
                "abstract": row[4] or "",
                "link": row[5] or "",
                "keywords": row[6] or "",
                "co_authors_name": row[7] or "",
                "author_name": row[8] or "Unknown Author"
            }

            # Parse co_authors if it's a JSON string
            if pub["co_authors_name"]:
                try:
                    import json
                    co_authors = json.loads(pub["co_authors_name"])
                    if isinstance(co_authors, list):
                        pub["co_authors"] = co_authors
                    else:
                        pub["co_authors"] = []
                except:
                    # If not JSON, treat as comma-separated
                    pub["co_authors"] = [name.strip() for name in str(pub["co_authors_name"]).split(",") if name.strip()]
            else:
                pub["co_authors"] = []

            # Parse keywords if it's a JSON string
            if pub["keywords"]:
                try:
                    import json
                    keywords = json.loads(pub["keywords"])
                    if isinstance(keywords, list):
                        pub["keywords_list"] = keywords
                    else:
                        pub["keywords_list"] = []
                except:
                    # If not JSON, treat as comma-separated
                    pub["keywords_list"] = [kw.strip() for kw in str(pub["keywords"]).split(",") if kw.strip()]
            else:
                pub["keywords_list"] = []

            publications.append(pub)

        return publications
    except Exception as e:
        print(f"Error getting publications: {e}")
        return []
    finally:
        conn.close()

def link_user_to_person(user_id: int) -> Optional[int]:
    """Check if user email exists in Persons table and link them via person_id"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get user email
        cursor.execute("SELECT email FROM Users WHERE user_id = ?", (user_id,))
        user_row = cursor.fetchone()
        if not user_row:
            return None

        user_email = user_row[0]

        # Check if email exists in Persons table
        cursor.execute("SELECT person_id FROM Persons WHERE email = ?", (user_email,))
        person_row = cursor.fetchone()

        if person_row:
            person_id = person_row[0]
            # Update user to link to person
            cursor.execute("UPDATE Users SET person_id = ? WHERE user_id = ?", (person_id, user_id))
            conn.commit()
            return person_id
        return None
    except Exception as e:
        print(f"Error linking user to person: {e}")
        return None
    finally:
        conn.close()

def calculate_degrees_of_separation(submission_id: int, reviewer_person_id: int) -> int:
    """Calculate degrees of separation between paper author and reviewer
    Returns the number of matching attributes (lower = better separation)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get submission author info
        cursor.execute("""
            SELECT author_affiliation_id, author_workplace_id,
                   author_bachelor_institution_id, author_master_institution_id, author_phd_institution_id,
                   author_city, author_state, author_country, author_advisor_name, author_research_group
            FROM ReviewSubmissions WHERE submission_id = ?
        """, (submission_id,))
        submission_row = cursor.fetchone()

        if not submission_row:
            return 999  # High penalty if submission not found

        (author_aff, author_work, author_bach, author_mast, author_phd,
         author_city, author_state, author_country, author_advisor, author_group) = submission_row

        # Get reviewer info
        cursor.execute("""
            SELECT affiliation_id, workplace_id,
                   bachelor_institution_id, master_institution_id, phd_institution_id,
                   city, state, country, advisor_id, research_group_name
            FROM Persons WHERE person_id = ?
        """, (reviewer_person_id,))
        reviewer_row = cursor.fetchone()

        if not reviewer_row:
            return 999  # High penalty if reviewer not found

        (rev_aff, rev_work, rev_bach, rev_mast, rev_phd,
         rev_city, rev_state, rev_country, rev_advisor_id, rev_group) = reviewer_row

        # Count matches (conflicts)
        matches = 0

        # Institution matches
        if author_aff and rev_aff and author_aff == rev_aff:
            matches += 1
        if author_work and rev_work and author_work == rev_work:
            matches += 1
        if author_bach and rev_bach and author_bach == rev_bach:
            matches += 1
        if author_mast and rev_mast and author_mast == rev_mast:
            matches += 1
        if author_phd and rev_phd and author_phd == rev_phd:
            matches += 1

        # Location matches
        if author_city and rev_city and author_city.lower() == rev_city.lower():
            matches += 1
        if author_state and rev_state and author_state.lower() == rev_state.lower():
            matches += 1
        if author_country and rev_country and author_country.lower() == rev_country.lower():
            matches += 1

        # Advisor match (check if reviewer's advisor matches author's advisor name)
        if author_advisor and rev_advisor_id:
            cursor.execute("SELECT first_name || ' ' || last_name FROM Persons WHERE person_id = ?", (rev_advisor_id,))
            advisor_row = cursor.fetchone()
            if advisor_row and author_advisor.lower() in advisor_row[0].lower():
                matches += 1

        # Research group match
        if author_group and rev_group and author_group.lower() == rev_group.lower():
            matches += 1

        return matches
    except Exception as e:
        print(f"Error calculating degrees of separation: {e}")
        return 999
    finally:
        conn.close()

def match_reviewer_to_paper(submission_id: int) -> Optional[int]:
    """Match a paper to a reviewer with maximum degrees of separation
    Returns the person_id of the matched reviewer, or None if no suitable reviewer found"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get all potential reviewers (persons with role 'Reviewer' or 'Both')
        cursor.execute("""
            SELECT person_id FROM Persons
            WHERE role IN ('Reviewer', 'Both')
        """)
        reviewers = [row[0] for row in cursor.fetchall()]

        if not reviewers:
            return None

        # Check which reviewers are already assigned to this paper
        cursor.execute("""
            SELECT reviewer_person_id FROM PaperReviewerAssignments
            WHERE submission_id = ?
        """, (submission_id,))
        assigned_reviewers = {row[0] for row in cursor.fetchall()}

        # Filter out already assigned reviewers
        available_reviewers = [r for r in reviewers if r not in assigned_reviewers]

        if not available_reviewers:
            return None

        # Calculate separation for each reviewer
        reviewer_scores = []
        for reviewer_id in available_reviewers:
            separation = calculate_degrees_of_separation(submission_id, reviewer_id)
            reviewer_scores.append((reviewer_id, separation))

        # Find maximum separation (minimum matches)
        if not reviewer_scores:
            return None

        min_separation = min(score for _, score in reviewer_scores)
        best_reviewers = [rev_id for rev_id, score in reviewer_scores if score == min_separation]

        # Randomly select from best reviewers
        import random
        selected_reviewer = random.choice(best_reviewers)

        # Create assignment
        cursor.execute("""
            INSERT INTO PaperReviewerAssignments (submission_id, reviewer_person_id, status)
            VALUES (?, ?, 'assigned')
        """, (submission_id, selected_reviewer))
        conn.commit()

        return selected_reviewer
    except Exception as e:
        print(f"Error matching reviewer to paper: {e}")
        return None
    finally:
        conn.close()

def get_review_submissions(user_email: str, is_admin: bool = False) -> list:
    """Get review submissions
    Admin sees all submissions, regular users see only their assigned papers"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        if is_admin:
            # Admin sees all submissions
            cursor.execute("""
                SELECT
                    rs.submission_id,
                    rs.title,
                    rs.publication_year,
                    rs.abstract,
                    rs.link,
                    rs.topic,
                    rs.author_name,
                    rs.submission_date,
                    rs.status,
                    u.name as submitter_name,
                    u.email as submitter_email
                FROM ReviewSubmissions rs
                LEFT JOIN Users u ON rs.user_id = u.user_id
                ORDER BY rs.submission_date DESC
            """)
        else:
            # Regular users see only their assigned papers
            # First, get their person_id
            cursor.execute("""
                SELECT person_id FROM Users WHERE email = ?
            """, (user_email,))
            user_row = cursor.fetchone()

            if not user_row or not user_row[0]:
                return []  # User not linked to Persons table

            person_id = user_row[0]

            cursor.execute("""
                SELECT
                    rs.submission_id,
                    rs.title,
                    rs.publication_year,
                    rs.abstract,
                    rs.link,
                    rs.topic,
                    rs.author_name,
                    rs.submission_date,
                    rs.status,
                    u.name as submitter_name,
                    u.email as submitter_email,
                    pra.status as assignment_status
                FROM ReviewSubmissions rs
                INNER JOIN PaperReviewerAssignments pra ON rs.submission_id = pra.submission_id
                LEFT JOIN Users u ON rs.user_id = u.user_id
                WHERE pra.reviewer_person_id = ?
                ORDER BY rs.submission_date DESC
            """, (person_id,))

        rows = cursor.fetchall()
        submissions = []

        for row in rows:
            submission = {
                'submission_id': row[0],
                'title': row[1],
                'publication_year': row[2],
                'abstract': row[3],
                'link': row[4],
                'topic': row[5],
                'author_name': row[6],
                'submission_date': row[7],
                'status': row[8],
                'submitter_name': row[9],
                'submitter_email': row[10]
            }

            if not is_admin and len(row) > 11:
                submission['assignment_status'] = row[11]

            submissions.append(submission)

        return submissions
    except Exception as e:
        print(f"Error getting review submissions: {e}")
        return []
    finally:
        conn.close()

def auto_assign_reviewers_to_pending_papers():
    """Automatically assign reviewers to all pending papers"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get all pending papers without assignments
        cursor.execute("""
            SELECT rs.submission_id
            FROM ReviewSubmissions rs
            LEFT JOIN PaperReviewerAssignments pra ON rs.submission_id = pra.submission_id
            WHERE rs.status = 'pending' AND pra.assignment_id IS NULL
        """)

        pending_papers = [row[0] for row in cursor.fetchall()]

        assigned_count = 0
        for submission_id in pending_papers:
            reviewer_id = match_reviewer_to_paper(submission_id)
            if reviewer_id:
                assigned_count += 1
                # Update submission status
                cursor.execute("""
                    UPDATE ReviewSubmissions SET status = 'in_review'
                    WHERE submission_id = ?
                """, (submission_id,))

        conn.commit()
        return assigned_count
    except Exception as e:
        print(f"Error auto-assigning reviewers: {e}")
        return 0
    finally:
        conn.close()

def is_user_reviewer_for_submission(user_email: str, submission_id: int) -> bool:
    """Check if a user is the assigned reviewer for a submission or is an admin"""
    ADMIN_EMAIL = "desaiparth2000@gmail.com"

    # Admin can review all papers
    if user_email == ADMIN_EMAIL:
        return True

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get user's person_id
        cursor.execute("SELECT person_id FROM Users WHERE email = ?", (user_email,))
        user_row = cursor.fetchone()

        if not user_row or not user_row[0]:
            return False  # User not linked to Persons table

        person_id = user_row[0]

        # Check if this person is assigned as reviewer
        cursor.execute("""
            SELECT COUNT(*) FROM PaperReviewerAssignments
            WHERE submission_id = ? AND reviewer_person_id = ?
        """, (submission_id, person_id))

        count = cursor.fetchone()[0]
        return count > 0
    except Exception as e:
        print(f"Error checking reviewer status: {e}")
        return False
    finally:
        conn.close()

def create_or_update_review(submission_id: int, reviewer_person_id: int, review_text: str) -> Optional[Dict[str, Any]]:
    """Create a new review or update existing review"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Check if review already exists
        cursor.execute("""
            SELECT review_id FROM Reviews
            WHERE submission_id = ? AND reviewer_person_id = ?
        """, (submission_id, reviewer_person_id))

        existing_review = cursor.fetchone()

        if existing_review:
            # Update existing review
            cursor.execute("""
                UPDATE Reviews
                SET review_text = ?, last_updated = CURRENT_TIMESTAMP
                WHERE submission_id = ? AND reviewer_person_id = ?
            """, (review_text, submission_id, reviewer_person_id))

            # Update assignment status to completed
            cursor.execute("""
                UPDATE PaperReviewerAssignments
                SET status = 'completed'
                WHERE submission_id = ? AND reviewer_person_id = ?
            """, (submission_id, reviewer_person_id))
        else:
            # Create new review
            cursor.execute("""
                INSERT INTO Reviews (submission_id, reviewer_person_id, review_text)
                VALUES (?, ?, ?)
            """, (submission_id, reviewer_person_id, review_text))

            # Update assignment status to completed
            cursor.execute("""
                UPDATE PaperReviewerAssignments
                SET status = 'completed'
                WHERE submission_id = ? AND reviewer_person_id = ?
            """, (submission_id, reviewer_person_id))

        conn.commit()

        # Return the review
        cursor.execute("""
            SELECT review_id, submission_id, reviewer_person_id, review_text,
                   submitted_date, last_updated
            FROM Reviews
            WHERE submission_id = ? AND reviewer_person_id = ?
        """, (submission_id, reviewer_person_id))

        row = cursor.fetchone()
        if row:
            return {
                'review_id': row[0],
                'submission_id': row[1],
                'reviewer_person_id': row[2],
                'review_text': row[3],
                'submitted_date': row[4],
                'last_updated': row[5]
            }
        return None
    except Exception as e:
        print(f"Error creating/updating review: {e}")
        return None
    finally:
        conn.close()

def get_review_by_reviewer(submission_id: int, reviewer_person_id: int, user_email: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Get review by reviewer for a submission - admins can see any review"""
    ADMIN_EMAIL = "desaiparth2000@gmail.com"

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # If admin, they can see any review for this submission (get the first one if multiple)
        # Otherwise, get the specific reviewer's review
        if user_email == ADMIN_EMAIL:
            cursor.execute("""
                SELECT review_id, submission_id, reviewer_person_id, review_text,
                       submitted_date, last_updated
                FROM Reviews
                WHERE submission_id = ?
                LIMIT 1
            """, (submission_id,))
        else:
            cursor.execute("""
                SELECT review_id, submission_id, reviewer_person_id, review_text,
                       submitted_date, last_updated
                FROM Reviews
                WHERE submission_id = ? AND reviewer_person_id = ?
            """, (submission_id, reviewer_person_id))

        row = cursor.fetchone()
        if row:
            return {
                'review_id': row[0],
                'submission_id': row[1],
                'reviewer_person_id': row[2],
                'review_text': row[3],
                'submitted_date': row[4],
                'last_updated': row[5]
            }
        return None
    except Exception as e:
        print(f"Error getting review: {e}")
        return None
    finally:
        conn.close()

def get_author_reviewer_connections() -> list:
    """Get detailed author-reviewer connection data for admin visualization"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        # Get all assignments with author and reviewer details
        cursor.execute("""
            SELECT
                pra.submission_id,
                rs.title,
                rs.author_name,
                rs.author_affiliation_id,
                rs.author_workplace_id,
                rs.author_bachelor_institution_id,
                rs.author_master_institution_id,
                rs.author_phd_institution_id,
                rs.author_city,
                rs.author_state,
                rs.author_country,
                rs.author_advisor_name,
                rs.author_research_group,
                pra.reviewer_person_id,
                p.first_name || ' ' || p.last_name as reviewer_name,
                p.email as reviewer_email,
                p.affiliation_id,
                p.workplace_id,
                p.bachelor_institution_id,
                p.master_institution_id,
                p.phd_institution_id,
                p.city,
                p.state,
                p.country,
                p.advisor_id,
                p.research_group_name,
                pra.status as assignment_status
            FROM PaperReviewerAssignments pra
            JOIN ReviewSubmissions rs ON pra.submission_id = rs.submission_id
            JOIN Persons p ON pra.reviewer_person_id = p.person_id
            ORDER BY pra.assigned_date DESC
        """)

        rows = cursor.fetchall()
        connections = []

        # Get institution names for better display
        def get_institution_name(inst_id):
            if not inst_id:
                return None
            cursor.execute("SELECT name FROM Institutions WHERE institution_id = ?", (inst_id,))
            row = cursor.fetchone()
            return row[0] if row else None

        def get_company_name(comp_id):
            if not comp_id:
                return None
            cursor.execute("SELECT company_name FROM Companies WHERE company_id = ?", (comp_id,))
            row = cursor.fetchone()
            return row[0] if row else None

        def get_advisor_name(advisor_id):
            if not advisor_id:
                return None
            cursor.execute("SELECT first_name || ' ' || last_name FROM Persons WHERE person_id = ?", (advisor_id,))
            row = cursor.fetchone()
            return row[0] if row else None

        for row in rows:
            (submission_id, title, author_name,
             author_aff, author_work, author_bach, author_mast, author_phd,
             author_city, author_state, author_country, author_advisor, author_group,
             reviewer_id, reviewer_name, reviewer_email,
             rev_aff, rev_work, rev_bach, rev_mast, rev_phd,
             rev_city, rev_state, rev_country, rev_advisor_id, rev_group,
             assignment_status) = row

            # Calculate conflicts and build factor list
            factors = []
            conflicts = 0
            max_conflicts = 10  # Total possible conflict factors

            # Affiliation
            author_aff_name = get_institution_name(author_aff)
            rev_aff_name = get_institution_name(rev_aff)
            is_conflict = author_aff and rev_aff and author_aff == rev_aff
            if is_conflict:
                conflicts += 1
            factors.append({
                'factor': 'Current Affiliation',
                'authorValue': author_aff_name,
                'reviewerValue': rev_aff_name,
                'isConflict': is_conflict,
                'icon': 'affiliation'
            })

            # Workplace
            author_work_name = get_company_name(author_work)
            rev_work_name = get_company_name(rev_work)
            is_conflict = author_work and rev_work and author_work == rev_work
            if is_conflict:
                conflicts += 1
            factors.append({
                'factor': 'Workplace',
                'authorValue': author_work_name,
                'reviewerValue': rev_work_name,
                'isConflict': is_conflict,
                'icon': 'workplace'
            })

            # Bachelor's Institution
            author_bach_name = get_institution_name(author_bach)
            rev_bach_name = get_institution_name(rev_bach)
            is_conflict = author_bach and rev_bach and author_bach == rev_bach
            if is_conflict:
                conflicts += 1
            factors.append({
                'factor': "Bachelor's Institution",
                'authorValue': author_bach_name,
                'reviewerValue': rev_bach_name,
                'isConflict': is_conflict,
                'icon': 'education'
            })

            # Master's Institution
            author_mast_name = get_institution_name(author_mast)
            rev_mast_name = get_institution_name(rev_mast)
            is_conflict = author_mast and rev_mast and author_mast == rev_mast
            if is_conflict:
                conflicts += 1
            factors.append({
                'factor': "Master's Institution",
                'authorValue': author_mast_name,
                'reviewerValue': rev_mast_name,
                'isConflict': is_conflict,
                'icon': 'education'
            })

            # PhD Institution
            author_phd_name = get_institution_name(author_phd)
            rev_phd_name = get_institution_name(rev_phd)
            is_conflict = author_phd and rev_phd and author_phd == rev_phd
            if is_conflict:
                conflicts += 1
            factors.append({
                'factor': 'PhD Institution',
                'authorValue': author_phd_name,
                'reviewerValue': rev_phd_name,
                'isConflict': is_conflict,
                'icon': 'education'
            })

            # City
            is_conflict = author_city and rev_city and author_city.lower() == rev_city.lower()
            if is_conflict:
                conflicts += 1
            factors.append({
                'factor': 'City',
                'authorValue': author_city,
                'reviewerValue': rev_city,
                'isConflict': is_conflict,
                'icon': 'location'
            })

            # State
            is_conflict = author_state and rev_state and author_state.lower() == rev_state.lower()
            if is_conflict:
                conflicts += 1
            factors.append({
                'factor': 'State/Province',
                'authorValue': author_state,
                'reviewerValue': rev_state,
                'isConflict': is_conflict,
                'icon': 'location'
            })

            # Country
            is_conflict = author_country and rev_country and author_country.lower() == rev_country.lower()
            if is_conflict:
                conflicts += 1
            factors.append({
                'factor': 'Country',
                'authorValue': author_country,
                'reviewerValue': rev_country,
                'isConflict': is_conflict,
                'icon': 'location'
            })

            # Advisor
            rev_advisor_name = get_advisor_name(rev_advisor_id)
            is_conflict = author_advisor and rev_advisor_name and author_advisor.lower() in rev_advisor_name.lower()
            if is_conflict:
                conflicts += 1
            factors.append({
                'factor': 'Advisor',
                'authorValue': author_advisor,
                'reviewerValue': rev_advisor_name,
                'isConflict': is_conflict,
                'icon': 'advisor'
            })

            # Research Group
            is_conflict = author_group and rev_group and author_group.lower() == rev_group.lower()
            if is_conflict:
                conflicts += 1
            factors.append({
                'factor': 'Research Group',
                'authorValue': author_group,
                'reviewerValue': rev_group,
                'isConflict': is_conflict,
                'icon': 'group'
            })

            # Calculate separation score (higher = better separation)
            separation_score = int(round(((max_conflicts - conflicts) / max_conflicts) * 100))

            connections.append({
                'submission_id': submission_id,
                'paper_title': title,
                'author_name': author_name,
                'reviewer_name': reviewer_name,
                'reviewer_email': reviewer_email,
                'degrees_of_separation': conflicts,
                'max_possible_conflicts': max_conflicts,
                'separation_score': separation_score,
                'assignment_status': assignment_status,
                'connection_factors': factors
            })

        return connections
    except Exception as e:
        print(f"Error getting author-reviewer connections: {e}")
        return []
    finally:
        conn.close()

