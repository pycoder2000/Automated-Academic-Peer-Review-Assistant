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

