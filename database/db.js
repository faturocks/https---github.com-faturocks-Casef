const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class PenalCodeDatabase {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, 'penal-code.db');
    }

    async init() {
        try {
            // Create database directory if it doesn't exist
            const dbDir = path.dirname(this.dbPath);
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }

            // Initialize database
            this.db = new Database(this.dbPath);
            this.db.pragma('journal_mode = WAL');
            
            // Create tables
            await this.createTables();
            
            // Initialize with data if tables are empty
            await this.initializeData();
            
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }

    createTables() {
        const createTablesSQL = `
            -- Articles table
            CREATE TABLE IF NOT EXISTS articles (
                id TEXT PRIMARY KEY,
                title_id TEXT,
                title_en TEXT,
                language TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Sections table (individual penal code sections)
            CREATE TABLE IF NOT EXISTS sections (
                id TEXT PRIMARY KEY,
                article_id TEXT NOT NULL,
                code TEXT,
                code_id TEXT,
                code_en TEXT,
                name TEXT,
                title TEXT,
                title_id TEXT,
                title_en TEXT,
                text TEXT,
                text_id TEXT,
                text_en TEXT,
                punishment TEXT,
                fine TEXT,
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
                article_id TEXT,
                section_id TEXT,
                title TEXT NOT NULL,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Calculator history table
            CREATE TABLE IF NOT EXISTS calculations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                sections TEXT NOT NULL, -- JSON array of section IDs
                total_fine_min REAL,
                total_fine_max REAL,
                total_jail_min_days INTEGER,
                total_jail_max_days INTEGER,
                breakdown TEXT NOT NULL, -- JSON object with detailed breakdown
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Create indexes for better performance
            CREATE INDEX IF NOT EXISTS idx_sections_article_id ON sections(article_id);
            CREATE INDEX IF NOT EXISTS idx_sections_language ON sections(language);
            CREATE INDEX IF NOT EXISTS idx_definitions_section_id ON definitions(section_id);
            CREATE INDEX IF NOT EXISTS idx_bookmarks_article_id ON bookmarks(article_id);
            CREATE INDEX IF NOT EXISTS idx_bookmarks_section_id ON bookmarks(section_id);
        `;

        this.db.exec(createTablesSQL);
    }

    async initializeData() {
        // Check if data already exists
        const articleCount = this.db.prepare('SELECT COUNT(*) as count FROM articles').get();
        if (articleCount.count > 0) {
            console.log('Database already contains data, skipping initialization');
            return;
        }

        // Load and insert sample data
        await this.loadSampleData();
    }

    async loadSampleData() {
        // Sample Los Santos Penal Code data
        const sampleData = {
            en: [
                {
                    id: 'title-1',
                    title: 'TITLE 1. CRIMES AGAINST PERSONS',
                    sections: [
                        {
                            id: 'title-1-101',
                            code: '1 01',
                            name: 'Murder',
                            text: 'The unlawful killing of a human being with malice aforethought. **Murder** is divided into degrees based on premeditation and circumstances. [cite: LSPC 1-101]',
                            punishment: '25 years to life imprisonment',
                            fine: '$50,000 - $100,000'
                        },
                        {
                            id: 'title-1-102',
                            code: '1 02',
                            name: 'Manslaughter',
                            text: 'The unlawful killing of a human being without malice aforethought. This includes voluntary and involuntary manslaughter. [cite: LSPC 1-102]',
                            punishment: '5 - 15 years imprisonment',
                            fine: '$15,000 - $30,000'
                        },
                        {
                            id: 'title-1-103',
                            code: '1 03',
                            name: 'Assault',
                            text: 'An intentional act that creates a reasonable apprehension of imminent harmful or offensive contact. **Degrees of assault** vary based on severity and weapon use. [cite: LSPC 1-103]',
                            punishment: '6 months - 3 years imprisonment',
                            fine: '$5,000 - $15,000'
                        }
                    ]
                },
                {
                    id: 'title-2',
                    title: 'TITLE 2. CRIMES AGAINST PROPERTY',
                    sections: [
                        {
                            id: 'title-2-201',
                            code: '2 01',
                            name: 'Theft',
                            text: 'The unlawful taking of another person\'s property with intent to permanently deprive them of it. **Petty theft** and **grand theft** are distinguished by value. [cite: LSPC 2-201]',
                            punishment: '1 - 5 years imprisonment',
                            fine: '$2,500 - $10,000'
                        },
                        {
                            id: 'title-2-202',
                            code: '2 02',
                            name: 'Burglary',
                            text: 'The unlawful entry into a building or structure with intent to commit a crime therein. **First degree burglary** involves occupied dwellings. [cite: LSPC 2-202]',
                            punishment: '2 - 8 years imprisonment',
                            fine: '$5,000 - $25,000'
                        },
                        {
                            id: 'title-2-203',
                            code: '2 03',
                            name: 'Robbery',
                            text: 'The unlawful taking of property from another person through force or threat of force. **Armed robbery** carries enhanced penalties. [cite: LSPC 2-203]',
                            punishment: '3 - 10 years imprisonment',
                            fine: '$10,000 - $50,000'
                        }
                    ]
                }
            ],
            id: [
                {
                    id: 'title-1',
                    title_id: 'JUDUL 1. KEJAHATAN TERHADAP ORANG',
                    sections: [
                        {
                            id: 'title-1-101',
                            code_id: '1 01',
                            title_id: 'Pembunuhan',
                            text_id: 'Pembunuhan manusia secara melawan hukum dengan niat jahat. **Pembunuhan** dibagi ke dalam tingkatan berdasarkan perencanaan dan keadaan. [cite: LSPC 1-101]',
                            punishment: 'Penjara 25 tahun sampai seumur hidup',
                            fine: '$50,000 - $100,000'
                        },
                        {
                            id: 'title-1-102',
                            code_id: '1 02',
                            title_id: 'Pembunuhan Tanpa Rencana',
                            text_id: 'Pembunuhan manusia secara melawan hukum tanpa niat jahat. Termasuk pembunuhan sukarela dan tidak sukarela. [cite: LSPC 1-102]',
                            punishment: 'Penjara 5 - 15 tahun',
                            fine: '$15,000 - $30,000'
                        },
                        {
                            id: 'title-1-103',
                            code_id: '1 03',
                            title_id: 'Penyerangan',
                            text_id: 'Tindakan sengaja yang menciptakan kekhawatiran yang wajar akan kontak berbahaya atau menyinggung yang akan segera terjadi. **Tingkat penyerangan** bervariasi berdasarkan keparahan dan penggunaan senjata. [cite: LSPC 1-103]',
                            punishment: 'Penjara 6 bulan - 3 tahun',
                            fine: '$5,000 - $15,000'
                        }
                    ]
                },
                {
                    id: 'title-2',
                    title_id: 'JUDUL 2. KEJAHATAN TERHADAP HARTA BENDA',
                    sections: [
                        {
                            id: 'title-2-201',
                            code_id: '2 01',
                            title_id: 'Pencurian',
                            text_id: 'Pengambilan harta orang lain secara melawan hukum dengan maksud untuk merampas secara permanen. **Pencurian ringan** dan **pencurian berat** dibedakan berdasarkan nilai. [cite: LSPC 2-201]',
                            punishment: 'Penjara 1 - 5 tahun',
                            fine: '$2,500 - $10,000'
                        },
                        {
                            id: 'title-2-202',
                            code_id: '2 02',
                            title_id: 'Pembobolan',
                            text_id: 'Masuk secara melawan hukum ke dalam bangunan atau struktur dengan maksud melakukan kejahatan di dalamnya. **Pembobolan tingkat pertama** melibatkan tempat tinggal yang berpenghuni. [cite: LSPC 2-202]',
                            punishment: 'Penjara 2 - 8 tahun',
                            fine: '$5,000 - $25,000'
                        },
                        {
                            id: 'title-2-203',
                            code_id: '2 03',
                            title_id: 'Perampokan',
                            text_id: 'Pengambilan harta dari orang lain secara melawan hukum melalui kekerasan atau ancaman kekerasan. **Perampokan bersenjata** memiliki hukuman yang lebih berat. [cite: LSPC 2-203]',
                            punishment: 'Penjara 3 - 10 tahun',
                            fine: '$10,000 - $50,000'
                        }
                    ]
                }
            ]
        };

        // Insert data for both languages
        const insertArticle = this.db.prepare(`
            INSERT INTO articles (id, title_id, title_en, language) 
            VALUES (?, ?, ?, ?)
        `);

        const insertSection = this.db.prepare(`
            INSERT INTO sections (
                id, article_id, code, code_id, code_en, name, title, title_id, title_en, 
                text, text_id, text_en, punishment, fine, language
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        this.db.transaction(() => {
            // Insert English data
            sampleData.en.forEach(article => {
                insertArticle.run(article.id, article.title, article.title, 'en');
                
                article.sections.forEach(section => {
                    insertSection.run(
                        section.id, article.id, section.code, section.code, section.code,
                        section.name, section.name, section.name, section.name,
                        section.text, section.text, section.text,
                        section.punishment, section.fine, 'en'
                    );
                });
            });

            // Insert Indonesian data
            sampleData.id.forEach(article => {
                insertArticle.run(article.id + '-id', article.title_id, article.title_id, 'id');
                
                article.sections.forEach(section => {
                    insertSection.run(
                        section.id + '-id', article.id + '-id', section.code_id, section.code_id, section.code_id,
                        section.title_id, section.title_id, section.title_id, section.title_id,
                        section.text_id, section.text_id, section.text_id,
                        section.punishment, section.fine, 'id'
                    );
                });
            });
        })();

        console.log('Sample data loaded successfully');
    }

    // Get all articles for a language
    async getArticles(language = 'en') {
        const articles = this.db.prepare(`
            SELECT * FROM articles WHERE language = ? ORDER BY id
        `).all(language);

        const result = [];
        for (const article of articles) {
            const sections = this.db.prepare(`
                SELECT * FROM sections WHERE article_id = ? ORDER BY code
            `).all(article.id);

            result.push({
                id: article.id,
                title: language === 'en' ? article.title_en : article.title_id,
                title_id: article.title_id,
                title_en: article.title_en,
                sections: sections.map(section => ({
                    id: section.id,
                    code: language === 'en' ? section.code_en || section.code : section.code_id || section.code,
                    name: language === 'en' ? section.title_en || section.name : section.title_id || section.name,
                    text: language === 'en' ? section.text_en || section.text : section.text_id || section.text,
                    punishment: section.punishment,
                    fine: section.fine
                }))
            });
        }

        return result;
    }

    // Search articles
    async searchArticles(query, language = 'en') {
        const searchQuery = `%${query.toLowerCase()}%`;
        const sections = this.db.prepare(`
            SELECT s.*, a.title_en, a.title_id 
            FROM sections s
            JOIN articles a ON s.article_id = a.id
            WHERE s.language = ? AND (
                LOWER(s.code) LIKE ? OR
                LOWER(s.code_id) LIKE ? OR
                LOWER(s.name) LIKE ? OR
                LOWER(s.title) LIKE ? OR
                LOWER(s.text) LIKE ? OR
                LOWER(s.text_id) LIKE ?
            )
            ORDER BY s.code
        `).all(language, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery);

        return sections.map(section => ({
            id: section.id,
            articleTitle: language === 'en' ? section.title_en : section.title_id,
            code: language === 'en' ? section.code_en || section.code : section.code_id || section.code,
            name: language === 'en' ? section.title_en || section.name : section.title_id || section.name,
            text: language === 'en' ? section.text_en || section.text : section.text_id || section.text,
            punishment: section.punishment,
            fine: section.fine
        }));
    }

    // Bookmark operations
    async getBookmarks() {
        return this.db.prepare(`
            SELECT * FROM bookmarks ORDER BY created_at DESC
        `).all();
    }

    async addBookmark(articleId, title, notes = '') {
        return this.db.prepare(`
            INSERT INTO bookmarks (article_id, title, notes) VALUES (?, ?, ?)
        `).run(articleId, title, notes);
    }

    async removeBookmark(articleId) {
        return this.db.prepare(`
            DELETE FROM bookmarks WHERE article_id = ?
        `).run(articleId);
    }

    // Calculator history operations
    async saveCalculation(calculationData) {
        return this.db.prepare(`
            INSERT INTO calculations (
                name, sections, total_fine_min, total_fine_max, 
                total_jail_min_days, total_jail_max_days, breakdown, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            calculationData.name,
            JSON.stringify(calculationData.sections),
            calculationData.totalFineMin,
            calculationData.totalFineMax,
            calculationData.totalJailMinDays,
            calculationData.totalJailMaxDays,
            JSON.stringify(calculationData.breakdown),
            calculationData.notes || ''
        );
    }

    async getCalculations() {
        const calculations = this.db.prepare(`
            SELECT * FROM calculations ORDER BY created_at DESC
        `).all();

        return calculations.map(calc => ({
            ...calc,
            sections: JSON.parse(calc.sections),
            breakdown: JSON.parse(calc.breakdown)
        }));
    }

    async deleteCalculation(calculationId) {
        return this.db.prepare(`
            DELETE FROM calculations WHERE id = ?
        `).run(calculationId);
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

module.exports = PenalCodeDatabase;
