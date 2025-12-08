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
def create_user(email: str, password: str, name: str, image_url: Optional[str] = None, interests: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Create a new user"""
    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        password_hash = hash_password(password)
        cursor.execute("""
            INSERT INTO Users (email, password_hash, name, image_url, interests)
            VALUES (?, ?, ?, ?, ?)
        """, (email, password_hash, name, image_url, interests))

        user_id = cursor.lastrowid
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

