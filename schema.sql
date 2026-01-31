-- ScopeGuard Database Schema
-- SQLite compatible

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    stripe_customer_id TEXT,
    subscription_status TEXT DEFAULT 'free', -- free, pro, business
    subscription_id TEXT
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    client_name TEXT NOT NULL,
    project_name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active', -- active, completed, archived
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Scope items (what's included in the project)
CREATE TABLE IF NOT EXISTS scope_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    description TEXT NOT NULL, -- "3 homepage designs", "10 blog posts"
    limit_value INTEGER, -- 3, 10, etc. (NULL = unlimited)
    limit_type TEXT, -- "count", "hours", "revisions"
    used_count INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Client requests (everything the client asks for)
CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    source TEXT, -- "email", "slack", "call", "meeting"
    status TEXT DEFAULT 'pending', -- pending, in-scope, out-of-scope, change-order-sent
    priority TEXT DEFAULT 'medium', -- low, medium, high, urgent
    scope_item_id INTEGER, -- NULL if out-of-scope
    requested_at INTEGER DEFAULT (strftime('%s', 'now')),
    reviewed_at INTEGER,
    notes TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (scope_item_id) REFERENCES scope_items(id) ON DELETE SET NULL
);

-- Request attachments (files, screenshots, etc.)
CREATE TABLE IF NOT EXISTS request_attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);

-- Time tracking for requests
CREATE TABLE IF NOT EXISTS time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    description TEXT,
    started_at INTEGER NOT NULL,
    ended_at INTEGER, -- NULL if timer is still running
    duration_seconds INTEGER, -- Calculated when ended
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Communication log (track all client interactions)
CREATE TABLE IF NOT EXISTS communication_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    communication_type TEXT NOT NULL, -- email, call, meeting, chat, other
    subject TEXT,
    notes TEXT NOT NULL,
    occurred_at INTEGER NOT NULL, -- When the communication happened
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Activity audit log (track all changes)
CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    entity_type TEXT NOT NULL, -- project, request, scope_item, change_order, etc.
    entity_id INTEGER NOT NULL,
    action TEXT NOT NULL, -- created, updated, deleted, status_changed
    changes TEXT, -- JSON object with before/after values
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Change orders (generated from out-of-scope requests)
CREATE TABLE IF NOT EXISTS change_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL, -- Dollar amount for the change
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    approved_at INTEGER,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Link requests to change orders (many-to-many)
CREATE TABLE IF NOT EXISTS change_order_requests (
    change_order_id INTEGER NOT NULL,
    request_id INTEGER NOT NULL,
    PRIMARY KEY (change_order_id, request_id),
    FOREIGN KEY (change_order_id) REFERENCES change_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES requests(id) ON DELETE CASCADE
);

-- Client portal access tokens (share project with clients)
CREATE TABLE IF NOT EXISTS portal_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at INTEGER, -- NULL = never expires
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    last_accessed_at INTEGER,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Subscriptions log (track Stripe events)
CREATE TABLE IF NOT EXISTS subscription_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_type TEXT NOT NULL, -- subscription.created, subscription.updated, etc.
    stripe_event_id TEXT UNIQUE,
    data TEXT, -- JSON blob of event data
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_scope_items_project_id ON scope_items(project_id);
CREATE INDEX IF NOT EXISTS idx_requests_project_id ON requests(project_id);
CREATE INDEX IF NOT EXISTS idx_request_attachments_request_id ON request_attachments(request_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_request_id ON time_entries(request_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_project_id ON communication_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_communication_logs_occurred_at ON communication_logs(occurred_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);
CREATE INDEX IF NOT EXISTS idx_change_orders_project_id ON change_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_portal_tokens_token ON portal_tokens(token);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- View: Project overview with scope usage
CREATE VIEW IF NOT EXISTS v_project_overview AS
SELECT
    p.id,
    p.project_name,
    p.client_name,
    p.status,
    COUNT(DISTINCT si.id) as total_scope_items,
    COUNT(DISTINCT r.id) as total_requests,
    SUM(CASE WHEN r.status = 'out-of-scope' THEN 1 ELSE 0 END) as out_of_scope_count,
    SUM(CASE WHEN r.status = 'in-scope' THEN 1 ELSE 0 END) as in_scope_count,
    COUNT(DISTINCT co.id) as change_orders_count
FROM projects p
LEFT JOIN scope_items si ON p.id = si.project_id
LEFT JOIN requests r ON p.id = r.project_id
LEFT JOIN change_orders co ON p.id = co.project_id
GROUP BY p.id;
