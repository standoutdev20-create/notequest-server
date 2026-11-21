export default [
  {
    slug: "relational-databases",
    title: "How Relational Databases Work",
    module: "Foundations",
    duration: 12,
    summary: "Tables, rows, columns, keys, and why almost every app stores data this way.",
    sections: [
      {
        heading: "Tables, rows and columns",
        paragraphs: [
          "A relational database stores data in **tables**. Each **row** is one record (a user, an order) and each **column** is one attribute (name, email, price). Every column has a type, such as `INTEGER`, `TEXT`, `DATE` or `BOOLEAN`.",
        ],
      },
      {
        heading: "Primary and foreign keys",
        paragraphs: [
          "A **primary key** uniquely identifies each row, usually an `id`. A **foreign key** is a column that points to another table's primary key. That's how tables relate to each other.",
        ],
        code: `CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE notes (
  id      SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title   TEXT NOT NULL,
  body    TEXT
);`,
        language: "SQL",
      },
      {
        heading: "SQL vs NoSQL",
        paragraphs: [
          "- **SQL databases** (PostgreSQL, MySQL, SQLite): strict schemas, powerful joins, strong consistency. Great default for most apps.\n- **Document databases** (MongoDB): flexible JSON-like documents, easy to start with, good for nested data.\n- **Key-value stores** (Redis): extremely fast caches and counters.",
          "Learn SQL first. The ideas of keys, relationships and indexes apply everywhere.",
        ],
      },
    ],
    keyPoints: [
      "Tables hold rows (records) and typed columns (attributes).",
      "Primary keys identify rows; foreign keys link tables.",
      "Constraints like NOT NULL and UNIQUE protect data quality.",
      "SQL is the right default; NoSQL fits specific needs.",
    ],
  },
  {
    slug: "select-queries",
    title: "Querying with SELECT",
    module: "Writing SQL",
    duration: 15,
    summary: "Read exactly the data you need with SELECT, WHERE, ORDER BY and LIMIT.",
    sections: [
      {
        heading: "The shape of a query",
        paragraphs: ["Every read query answers: which columns, from which table, which rows, in what order?"],
        code: `SELECT name, email
FROM users
WHERE created_at >= '2026-01-01'
ORDER BY created_at DESC
LIMIT 10;`,
        language: "SQL",
      },
      {
        heading: "Filtering rows",
        paragraphs: [
          "- Comparison: `=`, `<>`, `<`, `>=`\n- Ranges and lists: `BETWEEN 10 AND 20`, `IN ('React', 'Vue')`\n- Patterns: `LIKE '%sql%'` (`%` matches anything)\n- Missing values: `IS NULL`. Note that `= NULL` never works.",
        ],
      },
      {
        heading: "Aggregating",
        paragraphs: ["Aggregate functions summarise many rows: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`. Combine them with `GROUP BY` to get one row per group, and filter groups with `HAVING`."],
        code: `SELECT category, COUNT(*) AS articles, AVG(views) AS avg_views
FROM posts
WHERE status = 'published'
GROUP BY category
HAVING COUNT(*) >= 2
ORDER BY avg_views DESC;`,
        language: "SQL",
      },
    ],
    keyPoints: [
      "SELECT columns FROM table WHERE condition ORDER BY … LIMIT …",
      "Use IS NULL, never = NULL.",
      "GROUP BY makes one row per group; HAVING filters groups.",
      "Only select the columns you need.",
    ],
  },
  {
    slug: "joins",
    title: "Combining Tables with JOINs",
    module: "Writing SQL",
    duration: 15,
    summary: "Answer real questions by combining related tables.",
    sections: [
      {
        heading: "INNER JOIN",
        paragraphs: ["An inner join returns rows that have a match in **both** tables."],
        code: `SELECT users.name, notes.title
FROM notes
INNER JOIN users ON users.id = notes.user_id;`,
        language: "SQL",
      },
      {
        heading: "LEFT JOIN",
        paragraphs: ["A left join keeps **every** row from the left table, filling in `NULL` where there's no match. Perfect for \"including people with zero…\" questions."],
        code: `-- every user, with how many notes they've written (including 0)
SELECT u.name, COUNT(n.id) AS notes
FROM users u
LEFT JOIN notes n ON n.user_id = u.id
GROUP BY u.id, u.name
ORDER BY notes DESC;`,
        language: "SQL",
      },
      {
        heading: "Choosing a join",
        paragraphs: [
          "- **INNER**: only matching pairs.\n- **LEFT**: everything on the left, matches if any.\n- **RIGHT**: the mirror of LEFT (rarely needed; just swap the table order).\n- **FULL OUTER**: everything from both sides.",
          "Use short table aliases (`u`, `n`) to keep queries readable, and always join on keys.",
        ],
      },
    ],
    keyPoints: [
      "JOINs combine rows from related tables using keys.",
      "INNER JOIN keeps only matches; LEFT JOIN keeps all left rows.",
      "COUNT(column) ignores NULLs, which is handy with LEFT JOIN.",
      "Aliases keep multi-table queries readable.",
    ],
  },
  {
    slug: "insert-update-delete",
    title: "Changing Data Safely",
    module: "Writing SQL",
    duration: 12,
    summary: "INSERT, UPDATE and DELETE, plus transactions that keep data consistent.",
    sections: [
      {
        heading: "Writing data",
        paragraphs: [],
        code: `INSERT INTO users (name, email) VALUES ('Asha', 'asha@example.com');

UPDATE users SET name = 'Asha R.' WHERE id = 7;

DELETE FROM notes WHERE id = 42;`,
        language: "SQL",
      },
      {
        heading: "Always use WHERE",
        paragraphs: [
          "`UPDATE users SET role = 'admin';` without a `WHERE` changes **every** row. Before running an update or delete, run the same `WHERE` as a `SELECT` first to see exactly which rows will be affected.",
        ],
      },
      {
        heading: "Transactions",
        paragraphs: ["A transaction groups statements so they all succeed or all fail. Moving money between accounts is the classic example."],
        code: `BEGIN;
UPDATE accounts SET balance = balance - 500 WHERE id = 1;
UPDATE accounts SET balance = balance + 500 WHERE id = 2;
COMMIT;   -- or ROLLBACK; to undo both`,
        language: "SQL",
      },
      {
        heading: "Never build SQL with string concatenation",
        paragraphs: ["Concatenating user input into SQL enables **SQL injection**, one of the most common security bugs. Always use parameterised queries provided by your driver or ORM."],
        code: `// ❌ dangerous
db.query("SELECT * FROM users WHERE email = '" + email + "'");

// ✅ safe
db.query("SELECT * FROM users WHERE email = $1", [email]);`,
        language: "JavaScript",
      },
    ],
    keyPoints: [
      "INSERT adds rows, UPDATE changes them, DELETE removes them.",
      "Preview the WHERE clause with SELECT before changing data.",
      "Transactions make multi-step changes all-or-nothing.",
      "Use parameterised queries to prevent SQL injection.",
    ],
  },
  {
    slug: "indexes-and-normalization",
    title: "Indexes and Normalization",
    module: "Design & Performance",
    duration: 15,
    summary: "Design clean schemas and make queries fast.",
    sections: [
      {
        heading: "Normalization",
        paragraphs: [
          "Normalization means storing each fact **once**. If a user's email is copied into every note row, changing it means updating hundreds of rows, and they can drift out of sync. Instead, store it in `users` and reference it by `user_id`.",
          "- **1NF**: one value per cell, no repeating groups.\n- **2NF/3NF**: every column depends on the key and nothing else.\n- Denormalize deliberately only when you've measured a performance need.",
        ],
      },
      {
        heading: "Indexes",
        paragraphs: [
          "Without an index, the database scans every row to find matches. An **index** is a sorted lookup structure (usually a B-tree) that finds rows in O(log n).",
        ],
        code: `CREATE INDEX idx_notes_user ON notes (user_id);

-- composite index for "latest notes for a user"
CREATE INDEX idx_notes_user_updated ON notes (user_id, updated_at DESC);`,
        language: "SQL",
      },
      {
        heading: "Indexes aren't free",
        paragraphs: [
          "Every index speeds up reads but slows down writes and uses disk space. Index columns you frequently filter, join or sort by. Use `EXPLAIN` to see whether a query uses an index.",
        ],
        code: `EXPLAIN SELECT * FROM notes WHERE user_id = 7 ORDER BY updated_at DESC;`,
        language: "SQL",
      },
    ],
    keyPoints: [
      "Normalize so each fact lives in one place.",
      "Indexes turn full scans into fast lookups.",
      "Index columns used in WHERE, JOIN and ORDER BY.",
      "Use EXPLAIN to verify query plans.",
    ],
  },
];
