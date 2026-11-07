CREATE TABLE IF NOT EXISTS visitors (
 parish TEXT NOT NULL,
 id TEXT NOT NULL,
 PRIMARY KEY (parish,id)
);
CREATE TABLE IF NOT EXISTS daily_visitors (
 parish TEXT NOT NULL,
 day TEXT NOT NULL,
 id TEXT NOT NULL,
 PRIMARY KEY (parish,day,id)
);
