const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ujfpepmszqrptmcauqaa.supabase.co';
const supabaseServiceKey = process.argv[2]; // I'll need the service role key for user creation if it doesn't exist

if (!supabaseServiceKey) {
  console.error("Service key required as first argument.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAthlete() {
  const email = 'Andersondjeemo@gmail.com';
  const fullName = 'Anderson Djeemo';

  try {
    // 1. Check if profile exists
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    let userId;
    if (!profile) {
      console.log("Profile not found, checking auth...");
      // Check auth (via service role)
      const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) throw authError;

      const authUser = users.find(u => u.email === email);
      if (!authUser) {
        console.log("Creating new auth user...");
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: email,
          password: 'TemporaryPassword123!', // User should reset this
          email_confirm: true,
          user_metadata: { full_name: fullName }
        });
        if (createError) throw createError;
        userId = newUser.user.id;
      } else {
        userId = authUser.id;
      }

      console.log("Creating profile...");
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          full_name: fullName,
          role: 'athlete',
          status: 'active',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      if (insertError) throw insertError;
      profile = newProfile;
    } else {
      userId = profile.id;
      console.log("Updating existing profile role to athlete...");
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'athlete', status: 'active' })
        .eq('id', userId);
      if (updateError) throw updateError;
    }

    // 2. Link or create Athlete record
    console.log("Managing athlete record...");
    const { data: athlete, error: athleteError } = await supabase
      .from('athletes')
      .select('*')
      .eq('name', 'ANDERSON DJEEMO')
      .maybeSingle();

    if (athleteError) throw athleteError;

    if (athlete) {
      console.log("Updating existing athlete record with profile_id...");
      await supabase
        .from('athletes')
        .update({ profile_id: userId })
        .eq('id', athlete.id);
    } else {
      console.log("Creating new athlete record...");
      await supabase
        .from('athletes')
        .insert({
          profile_id: userId,
          name: 'ANDERSON DJEEMO',
          title: 'FMF HEAD TRAINER / Founder',
          bio: 'Founder and Head Trainer at Fitness Power Hour.',
          specialties: ['High Intensity Training', 'Strength & Conditioning', 'Functional Movement'],
          social_links: {
            instagram: 'https://instagram.com/',
            tiktok: 'https://tiktok.com/',
            twitter: 'https://twitter.com/',
            facebook: 'https://facebook.com/'
          }
        });
    }

    console.log("🎉 Athlete setup successfully completed for Andersondjeemo@gmail.com");

  } catch (err) {
    console.error("❌ Setup failed:", err.message);
  }
}

setupAthlete();
