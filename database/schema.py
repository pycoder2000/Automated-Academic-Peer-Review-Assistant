"""
Database schema for ReviewMatch AI platform
Creates all tables, enums, and relationships
"""
import sqlite3
from pathlib import Path

# Get absolute path to database
SCRIPT_DIR = Path(__file__).parent
DB_PATH = SCRIPT_DIR / "reviewmatch.db"

def create_enums_and_tables():
    """Create all database tables with proper relationships"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Note: SQLite doesn't have native ENUM support, so we'll use CHECK constraints
    # For PostgreSQL, you would use CREATE TYPE instead

    # 1. ResearchInterests Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ResearchInterests (
            interest_id INTEGER PRIMARY KEY AUTOINCREMENT,
            interest_name TEXT NOT NULL UNIQUE
        )
    """)

    # 2. Institutions Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Institutions (
            institution_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('University', 'Research Institute', 'College', 'Polytechnic', 'Other')),
            country TEXT,
            city TEXT
        )
    """)

    # 2b. Companies Table (for workplace/employer)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Companies (
            company_id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_name TEXT NOT NULL UNIQUE,
            industry TEXT,
            country TEXT,
            city TEXT,
            state TEXT,
            website_url TEXT
        )
    """)

    # 3. Persons Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Persons (
            person_id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            country TEXT,
            city TEXT,
            state TEXT,
            affiliation_id INTEGER,  -- Academic affiliation
            workplace_id INTEGER,  -- Current company/workplace
            role TEXT NOT NULL CHECK(role IN ('Author', 'Reviewer', 'Both', 'Co-Author')),
            title TEXT CHECK(title IN ('Editors-in-Chief', 'Co-Editors', 'Associate Editors',
                                       'Reviewer Development Associate Editor', 'Founding and Advising Editor',
                                       'Editorial Review Board', 'Author')),
            bachelor_institution_id INTEGER,
            master_institution_id INTEGER,
            phd_institution_id INTEGER,
            advisor_id INTEGER,  -- Supervisor/advisor (self-reference)
            research_group_name TEXT,  -- Research lab/group name
            orcid_id TEXT UNIQUE,  -- ORCID identifier
            google_scholar_id TEXT,  -- Google Scholar profile ID
            dblp_url TEXT,  -- DBLP computer science bibliography URL
            linkedin_url TEXT,  -- LinkedIn profile URL
            website_url TEXT,  -- Personal website
            bio TEXT,  -- Short biography
            FOREIGN KEY (affiliation_id) REFERENCES Institutions(institution_id),
            FOREIGN KEY (workplace_id) REFERENCES Companies(company_id),
            FOREIGN KEY (bachelor_institution_id) REFERENCES Institutions(institution_id),
            FOREIGN KEY (master_institution_id) REFERENCES Institutions(institution_id),
            FOREIGN KEY (phd_institution_id) REFERENCES Institutions(institution_id),
            FOREIGN KEY (advisor_id) REFERENCES Persons(person_id)
        )
    """)

    # 4. PersonResearchInterests Table (Many-to-Many)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS PersonResearchInterests (
            person_id INTEGER NOT NULL,
            interest_id INTEGER NOT NULL,
            PRIMARY KEY (person_id, interest_id),
            FOREIGN KEY (person_id) REFERENCES Persons(person_id) ON DELETE CASCADE,
            FOREIGN KEY (interest_id) REFERENCES ResearchInterests(interest_id) ON DELETE CASCADE
        )
    """)

    # 4b. PersonPreviousInstitutions Table (Many-to-Many for previous affiliations)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS PersonPreviousInstitutions (
            person_id INTEGER NOT NULL,
            institution_id INTEGER NOT NULL,
            start_year INTEGER,
            end_year INTEGER,
            position_title TEXT,
            PRIMARY KEY (person_id, institution_id),
            FOREIGN KEY (person_id) REFERENCES Persons(person_id) ON DELETE CASCADE,
            FOREIGN KEY (institution_id) REFERENCES Institutions(institution_id) ON DELETE CASCADE
        )
    """)

    # 4c. CoAuthorships Table (explicit co-authorship relationships)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS CoAuthorships (
            coauthorship_id INTEGER PRIMARY KEY AUTOINCREMENT,
            person_one_id INTEGER NOT NULL,
            person_two_id INTEGER NOT NULL,
            publication_id INTEGER,
            collaboration_count INTEGER DEFAULT 1,  -- Number of times they co-authored
            first_collaboration_year INTEGER,
            last_collaboration_year INTEGER,
            FOREIGN KEY (person_one_id) REFERENCES Persons(person_id) ON DELETE CASCADE,
            FOREIGN KEY (person_two_id) REFERENCES Persons(person_id) ON DELETE CASCADE,
            FOREIGN KEY (publication_id) REFERENCES Publications(publication_id) ON DELETE SET NULL,
            CHECK(person_one_id != person_two_id)
        )
    """)

    # 4d. GrantCollaborations Table (grant funding collaborations)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS GrantCollaborations (
            grant_id INTEGER PRIMARY KEY AUTOINCREMENT,
            grant_name TEXT,
            funding_agency TEXT,
            start_year INTEGER,
            end_year INTEGER,
            person_one_id INTEGER NOT NULL,
            person_two_id INTEGER NOT NULL,
            FOREIGN KEY (person_one_id) REFERENCES Persons(person_id) ON DELETE CASCADE,
            FOREIGN KEY (person_two_id) REFERENCES Persons(person_id) ON DELETE CASCADE,
            CHECK(person_one_id != person_two_id)
        )
    """)

    # 4e. ConferenceAttendance Table (conference/workshop co-attendance)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ConferenceAttendance (
            attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
            conference_name TEXT NOT NULL,
            conference_year INTEGER,
            location TEXT,
            person_one_id INTEGER NOT NULL,
            person_two_id INTEGER NOT NULL,
            relationship_type TEXT CHECK(relationship_type IN ('Co-Attendee', 'Co-Organizer', 'Co-PC-Member', 'Co-Chair')),
            FOREIGN KEY (person_one_id) REFERENCES Persons(person_id) ON DELETE CASCADE,
            FOREIGN KEY (person_two_id) REFERENCES Persons(person_id) ON DELETE CASCADE,
            CHECK(person_one_id != person_two_id)
        )
    """)

    # 5. Publications Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Publications (
            publication_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            publication_year INTEGER,
            topic TEXT,
            author_id INTEGER,
            keywords TEXT,  -- JSON array stored as text
            co_authors_name TEXT,  -- JSON array stored as text
            recommendation_id INTEGER,
            abstract TEXT,
            link TEXT,
            FOREIGN KEY (author_id) REFERENCES Persons(person_id),
            FOREIGN KEY (recommendation_id) REFERENCES Persons(person_id)
        )
    """)

    # 6. Conflicts_Of_Interest Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Conflicts_Of_Interest (
            conflict_id INTEGER PRIMARY KEY AUTOINCREMENT,
            person_one_id INTEGER NOT NULL,
            person_two_id INTEGER NOT NULL,
            reason TEXT,
            similarity_score REAL,
            FOREIGN KEY (person_one_id) REFERENCES Persons(person_id) ON DELETE CASCADE,
            FOREIGN KEY (person_two_id) REFERENCES Persons(person_id) ON DELETE CASCADE,
            CHECK(person_one_id != person_two_id)
        )
    """)

    # 7. Users Table (for authentication - separate from Persons)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            image_url TEXT,
            interests TEXT,  -- Comma-separated string (kept for backward compatibility)
            person_id INTEGER,  -- Link to Persons table if user is also a Person
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (person_id) REFERENCES Persons(person_id)
        )
    """)

    # 7b. UserResearchInterests Table (Many-to-Many relationship)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS UserResearchInterests (
            user_id INTEGER NOT NULL,
            interest_id INTEGER NOT NULL,
            PRIMARY KEY (user_id, interest_id),
            FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (interest_id) REFERENCES ResearchInterests(interest_id) ON DELETE CASCADE
        )
    """)

    # 8. ReviewSubmissions Table (Papers submitted for review)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ReviewSubmissions (
            submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,  -- User who submitted
            title TEXT NOT NULL,
            publication_year INTEGER,
            abstract TEXT,
            link TEXT,
            topic TEXT,
            keywords TEXT,  -- JSON array or comma-separated
            author_name TEXT NOT NULL,
            co_authors_name TEXT,  -- JSON array or comma-separated

            -- Author information for COI detection
            author_affiliation_id INTEGER,  -- Current academic affiliation
            author_workplace_id INTEGER,  -- Current workplace/company
            author_bachelor_institution_id INTEGER,
            author_master_institution_id INTEGER,
            author_phd_institution_id INTEGER,
            author_advisor_name TEXT,  -- Advisor name (may not be in Persons table)
            author_research_group TEXT,
            author_city TEXT,
            author_state TEXT,
            author_country TEXT,

            -- Submission metadata
            submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_review', 'reviewed', 'rejected', 'withdrawn')),

            FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
            FOREIGN KEY (author_affiliation_id) REFERENCES Institutions(institution_id),
            FOREIGN KEY (author_workplace_id) REFERENCES Companies(company_id),
            FOREIGN KEY (author_bachelor_institution_id) REFERENCES Institutions(institution_id),
            FOREIGN KEY (author_master_institution_id) REFERENCES Institutions(institution_id),
            FOREIGN KEY (author_phd_institution_id) REFERENCES Institutions(institution_id)
        )
    """)

    # 9. PaperReviewerAssignments Table (Track reviewer assignments)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS PaperReviewerAssignments (
            assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            submission_id INTEGER NOT NULL,
            reviewer_person_id INTEGER NOT NULL,
            assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'assigned' CHECK(status IN ('assigned', 'in_progress', 'completed', 'declined')),
            FOREIGN KEY (submission_id) REFERENCES ReviewSubmissions(submission_id) ON DELETE CASCADE,
            FOREIGN KEY (reviewer_person_id) REFERENCES Persons(person_id) ON DELETE CASCADE,
            UNIQUE(submission_id, reviewer_person_id)
        )
    """)

    # 10. Reviews Table (Store reviewer submissions)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Reviews (
            review_id INTEGER PRIMARY KEY AUTOINCREMENT,
            submission_id INTEGER NOT NULL,
            reviewer_person_id INTEGER NOT NULL,
            review_text TEXT NOT NULL,
            submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (submission_id) REFERENCES ReviewSubmissions(submission_id) ON DELETE CASCADE,
            FOREIGN KEY (reviewer_person_id) REFERENCES Persons(person_id) ON DELETE CASCADE,
            UNIQUE(submission_id, reviewer_person_id)
        )
    """)

    # Create indexes for better query performance
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_persons_email ON Persons(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_persons_orcid ON Persons(orcid_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_persons_workplace ON Persons(workplace_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_persons_advisor ON Persons(advisor_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_persons_city_state ON Persons(city, state)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_publications_author ON Publications(author_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_publications_year ON Publications(publication_year)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_publications_topic ON Publications(topic)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_conflicts_person_one ON Conflicts_Of_Interest(person_one_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_conflicts_person_two ON Conflicts_Of_Interest(person_two_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_coauthorships_person_one ON CoAuthorships(person_one_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_coauthorships_person_two ON CoAuthorships(person_two_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_grant_collaborations_person_one ON GrantCollaborations(person_one_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_grant_collaborations_person_two ON GrantCollaborations(person_two_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_conference_attendance_person_one ON ConferenceAttendance(person_one_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_conference_attendance_person_two ON ConferenceAttendance(person_two_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_review_submissions_user ON ReviewSubmissions(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_review_submissions_status ON ReviewSubmissions(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_review_submissions_date ON ReviewSubmissions(submission_date)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_paper_reviewer_assignments_submission ON PaperReviewerAssignments(submission_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_paper_reviewer_assignments_reviewer ON PaperReviewerAssignments(reviewer_person_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_paper_reviewer_assignments_status ON PaperReviewerAssignments(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_reviews_submission ON Reviews(submission_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON Reviews(reviewer_person_id)")

    conn.commit()
    conn.close()
    print("✅ Database schema created successfully!")

if __name__ == "__main__":
    # Create database directory if it doesn't exist
    SCRIPT_DIR.mkdir(exist_ok=True)
    create_enums_and_tables()

