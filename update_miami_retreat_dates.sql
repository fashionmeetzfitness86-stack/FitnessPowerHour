-- ============================================================
-- FMF — Update Miami Beach Transformation Retreat Dates & Prices
-- Run this in your Supabase SQL Editor
-- ============================================================

UPDATE public.retreats
SET
  description = E'🏝️ THE EXPERIENCE\n\nThis is not a vacation.\nThis is a full lifestyle reset.\n\nFor a limited time, you will step into the FMF system:\n\n• Structured daily training\n• Clean discipline-driven routine\n• Elite Miami Beach environment\n• Direct access to high-level coaching\n\nYou don''t come here to "try fitness."\nYou come here to transform your body, your habits, and your mindset.\n\n💰 PROGRAM OPTIONS\n\n🔹 2-WEEK TRANSFORMATION — $10,000\nDuration: August 1st – August 14th (14 Days)\n\nPerfect for:\n• Rapid reset\n• Fat loss / conditioning\n• Breaking bad habits\n• Rebuilding discipline\n\nIncludes:\n• 2 daily training sessions (morning + evening)\n• Beach workouts + rooftop sessions\n• Mobility, recovery & stretching sessions\n• Daily structure & coaching\n• Nutrition guidance\n• Lifestyle discipline framework\n\n🔸 1-MONTH FULL IMMERSION — $15,000\nDuration: August 1st – August 31st (30 Days)\n⚠️ STRICTLY LIMITED: ONLY 4 SPOTS AVAILABLE\n\nThis is the complete transformation.\n\nPerfect for:\n• Total body recomposition\n• Long-term habit installation\n• High-level physical and mental upgrade\n• Lifestyle overhaul\n\nIncludes everything from the 2-week program +:\n• Deeper coaching & performance tracking\n• Advanced calisthenics progression\n• Extended recovery & regeneration protocols\n• Full integration into the FMF lifestyle system\n• Stronger accountability & structure\n\n🏋️ DAILY STRUCTURE (EXAMPLE)\n8:30 AM — Rooftop Training (Strength / Calisthenics)\n10:00 AM — Beach Workout (Conditioning / Mobility)\nAfternoon — Recovery / Sauna / Stretching\nEvening — Optional Training / Lifestyle Integration\n\n📍 LOCATIONS\nMiami Beach (Primary)\nRooftop training (hotel partnerships)\nBeach training zones\nPrivate workout environments\n\nExact details provided upon confirmation.\n\n🧠 WHAT YOU GAIN\n• Discipline\n• Structure\n• Lean, athletic body\n• Increased energy\n• Mental clarity\n• Stronger identity\n\nThis is not temporary.\nThis is who you become after the program.',
  start_date = '2026-08-01T09:00:00Z',
  end_date = '2026-08-31T17:00:00Z',
  price = 10000,
  updated_at = NOW()
WHERE title = 'Miami Beach Transformation Retreat';

-- Reload schema cache just in case
NOTIFY pgrst, 'reload schema';
