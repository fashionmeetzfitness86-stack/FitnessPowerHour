-- 1. Create Profile and Link to Athlete (Run this in Supabase SQL Editor)
-- Replace 'USER_ID_FROM_AUTH' with the actual UUID from the auth.users table 
-- after creating the user in the 'Authentication' tab with email 'Andersondjeemo@gmail.com'

DO $$
DECLARE
    v_user_id uuid := 'USER_ID_FROM_AUTH'; -- PASTE THE UUID HERE
BEGIN
    -- Ensure user_id is changed from placeholder
    IF v_user_id = 'USER_ID_FROM_AUTH' THEN
        RAISE EXCEPTION 'Please replace USER_ID_FROM_AUTH with the actual UUID from your Supabase Auth dashboard.';
    END IF;

    -- Upsert Profile
    INSERT INTO public.profiles (id, full_name, email, role, status, tier)
    VALUES (v_user_id, 'Anderson Djeemo', 'Andersondjeemo@gmail.com', 'athlete', 'active', 'Free Access')
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = 'athlete',
        status = 'active';

    -- Upsert Athlete Profile
    INSERT INTO public.athletes (profile_id, name, title, bio, specialties, training_focus, image_url, is_active)
    VALUES (
        v_user_id, 
        'ANDERSON DJEEMO', 
        'FMF HEAD TRAINER / Founder', 
        'To inspire people to develop strength through training and intentional living. Founder and Head Trainer at Fitness Power Hour.',
        ARRAY['High Intensity Training', 'Strength & Conditioning', 'Functional Movement'],
        'High performance discipline and intentional movement.',
        'https://picsum.photos/seed/anderson/400/400', -- Placeholder or provide real URL
        true
    )
    ON CONFLICT (profile_id) DO UPDATE SET
        title = EXCLUDED.title,
        bio = EXCLUDED.bio,
        specialties = EXCLUDED.specialties;

    RAISE NOTICE 'Athlete Anderson Djeemo initialized successfully.';
END $$;
