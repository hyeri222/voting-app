CREATE TABLE IF NOT EXISTS polls (
  id          serial PRIMARY KEY,
  question    text NOT NULL,
  closed_at   timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS options (
  id       serial PRIMARY KEY,
  poll_id  integer NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  label    text NOT NULL,
  position integer NOT NULL
);

CREATE TABLE IF NOT EXISTS votes (
  id         serial PRIMARY KEY,
  poll_id    integer NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id  integer NOT NULL REFERENCES options(id) ON DELETE CASCADE,
  voter_id   text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poll_id, voter_id)
);

CREATE INDEX IF NOT EXISTS options_poll_id_idx ON options(poll_id);

-- Cleanup from when 운영자 accounts and sessions lived in the database.
ALTER TABLE polls DROP COLUMN IF EXISTS created_by;
DROP TABLE IF EXISTS operator_sessions;
DROP TABLE IF EXISTS operators;
