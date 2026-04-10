CREATE OR REPLACE FUNCTION check_membership_save() RETURNS trigger AS $BODY$ BEGIN 
  IF (NEW.favorites IS DISTINCT FROM OLD.favorites OR NEW.bookmarks IS DISTINCT FROM OLD.bookmarks) THEN 
    IF NOT (NEW.tier = 'Basic' OR NEW.membership_status = 'active' OR NEW.role IN ('admin', 'super_admin', 'athlete')) THEN 
      RAISE EXCEPTION 'upgrade_required: Upgrade to membership to bookmark videos and build your program.'; 
    END IF; 
  END IF; 
  RETURN NEW; 
END; $BODY$ LANGUAGE plpgsql; 

DROP TRIGGER IF EXISTS enforce_membership_save_trigger ON profiles; 

CREATE TRIGGER enforce_membership_save_trigger 
BEFORE UPDATE ON profiles 
FOR EACH ROW 
EXECUTE FUNCTION check_membership_save();
