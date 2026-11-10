-- Permanent addresses: address.keep = 1 means the address, its mails, its sent items and its account
-- binding can't be deleted by anything (cleanup, admin, users, custom SQL). The admin "DB migration"
-- button runs the same thing; this file is for setting it up by hand.
ALTER TABLE address ADD COLUMN keep INTEGER DEFAULT 0;
CREATE TRIGGER IF NOT EXISTS address_keep_row BEFORE DELETE ON address WHEN OLD.keep = 1 BEGIN SELECT RAISE(IGNORE); END;
CREATE TRIGGER IF NOT EXISTS address_keep_mails BEFORE DELETE ON raw_mails WHEN EXISTS (SELECT 1 FROM address WHERE name = OLD.address AND keep = 1) BEGIN SELECT RAISE(IGNORE); END;
CREATE TRIGGER IF NOT EXISTS address_keep_sent BEFORE DELETE ON sendbox WHEN EXISTS (SELECT 1 FROM address WHERE name = OLD.address AND keep = 1) BEGIN SELECT RAISE(IGNORE); END;
CREATE TRIGGER IF NOT EXISTS address_keep_owner BEFORE DELETE ON users_address WHEN EXISTS (SELECT 1 FROM address WHERE id = OLD.address_id AND keep = 1) BEGIN SELECT RAISE(IGNORE); END;
