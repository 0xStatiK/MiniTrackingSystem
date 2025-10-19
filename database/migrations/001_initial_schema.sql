-- sqlite
-- database/migration/001_initial_schema.sql

-- Users Table

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Factions Table
CREATE TABLE IF NOT EXISTS factions(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_factions_name ON factions(name);

-- Unit types table
CREATE TABLE IF NOT EXISTS unit_types(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT
);

CREATE INDEX IF NOT EXISTS idx_unit_types_name ON unit_types(name);

-- Miniatures table
CREATE TABLE IF NOT EXISTS miniatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    faction_id INTEGER,
    unit_type_id INTEGER,
    points_value INTEGER,
    base_size TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faction_id) REFERENCES factions(id),
    FOREIGN KEY (unit_type_id) REFERENCES unit_types(id)
);

CREATE INDEX IF NOT EXISTS idx_miniatures_faction ON miniatures(faction_id);
CREATE INDEX IF NOT EXISTS idx_miniatures_unit_type ON miniatures(unit_type_id);
CREATE INDEX IF NOT EXISTS idx_miniatures_name ON miniatures(name);

-- Lists table
CREATE TABLE IF NOT EXISTS lists (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lists_user_id ON lists(user_id);
CREATE INDEX IF NOT EXISTS idx_lists_is_public ON lists(is_public);

-- List items table
CREATE TABLE IF NOT EXISTS list_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id INTEGER NOT NULL,
    miniature_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    assembly_status TEXT CHECK(assembly_status IN ('Not Started', 'In Progress', 'Assembled')) DEFAULT 'Not Started',
    painting_status TEXT CHECK(painting_status IN ('Unpainted', 'Primed', 'Base Coated', 'Detailed', 'Finished')) DEFAULT 'Unpainted',
    notes TEXT,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
    FOREIGN KEY (miniature_id) REFERENCES miniatures(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_list_items_list_id ON list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_list_items_miniature_id ON list_items(miniature_id);

-- Metadata table
CREATE TABLE IF NOT EXISTS metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    list_item_id INTEGER NOT NULL,
    paint_colors TEXT,
    techniques TEXT,
    purchase_date DATE,
    cost REAL,
    storage_location TEXT,
    custom_notes TEXT,
    FOREIGN KEY (list_item_id) REFERENCES list_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_metadata_list_item_id ON metadata(list_item_id);
