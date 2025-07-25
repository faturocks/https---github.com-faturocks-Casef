-- Los Santos Penal Code Database Schema
-- This file contains the database structure for the desktop application

-- Articles table (main titles/chapters)
CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title_id TEXT,          -- Indonesian title
    title_en TEXT,          -- English title
    language TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sections table (individual penal code sections)
CREATE TABLE IF NOT EXISTS sections (
    id TEXT PRIMARY KEY,
    article_id TEXT NOT NULL,
    code TEXT,              -- Section code (e.g., "1 01")
    code_id TEXT,           -- Indonesian section code
    code_en TEXT,           -- English section code
    name TEXT,              -- Section name/title
    title TEXT,             -- Section title
    title_id TEXT,          -- Indonesian section title
    title_en TEXT,          -- English section title
    text TEXT,              -- Section content
    text_id TEXT,           -- Indonesian section content
    text_en TEXT,           -- English section content
    punishment TEXT,        -- Punishment description
    fine TEXT,              -- Fine description
    language TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles (id)
);

-- Definitions table (for articles with definition format)
CREATE TABLE IF NOT EXISTS definitions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_id TEXT NOT NULL,
    term TEXT NOT NULL,
    definition TEXT NOT NULL,
    citation TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections (id)
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id TEXT,        -- Can bookmark entire articles
    section_id TEXT,        -- Or specific sections
    title TEXT NOT NULL,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Calculator history table
CREATE TABLE IF NOT EXISTS calculations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sections TEXT NOT NULL,         -- JSON array of section IDs
    total_fine_min REAL,           -- Minimum total fine
    total_fine_max REAL,           -- Maximum total fine
    total_jail_min_days INTEGER,   -- Minimum jail time in days
    total_jail_max_days INTEGER,   -- Maximum jail time in days
    breakdown TEXT NOT NULL,       -- JSON object with detailed breakdown
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sections_article_id ON sections(article_id);
CREATE INDEX IF NOT EXISTS idx_sections_language ON sections(language);
CREATE INDEX IF NOT EXISTS idx_sections_code ON sections(code);
CREATE INDEX IF NOT EXISTS idx_definitions_section_id ON definitions(section_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_article_id ON bookmarks(article_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_section_id ON bookmarks(section_id);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at);

-- Full-text search indexes for better search performance
CREATE VIRTUAL TABLE IF NOT EXISTS sections_fts USING fts5(
    id,
    code,
    title,
    text,
    content='sections',
    content_rowid='rowid'
);

-- Triggers to keep FTS table in sync
CREATE TRIGGER IF NOT EXISTS sections_fts_insert AFTER INSERT ON sections
BEGIN
    INSERT INTO sections_fts(id, code, title, text) 
    VALUES (NEW.id, NEW.code, NEW.title, NEW.text);
END;

CREATE TRIGGER IF NOT EXISTS sections_fts_delete AFTER DELETE ON sections
BEGIN
    DELETE FROM sections_fts WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS sections_fts_update AFTER UPDATE ON sections
BEGIN
    DELETE FROM sections_fts WHERE id = OLD.id;
    INSERT INTO sections_fts(id, code, title, text) 
    VALUES (NEW.id, NEW.code, NEW.title, NEW.text);
END;
