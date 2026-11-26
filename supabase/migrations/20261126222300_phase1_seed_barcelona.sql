-- Phase 1.4: Seed Barcelona Locations, Session Types, 15 Weekly Ongoing Rules, 4 Weeks of Sessions & Studio Settings

-- 1. Studio Settings (singleton id = 1)
INSERT INTO public.studio_settings (
  id,
  cancellation_window_hours,
  whatsapp_number,
  contact_email,
  instagram_url,
  studio_hours_en,
  studio_hours_es,
  banner_message_en,
  banner_message_es,
  banner_active
)
VALUES (
  1,
  12,
  '+34 612 345 678',
  'hello@alexmoreno.fit',
  'https://instagram.com/alexmoreno.fit',
  'Mon–Fri 07:00–20:30 · Sat–Sun 09:00–12:00',
  'Lun–Vie 07:00–20:30 · Sáb–Dom 09:00–12:00',
  NULL,
  NULL,
  false
)
ON CONFLICT (id) DO NOTHING;

-- 2. Barcelona Locations (5 spots)
INSERT INTO public.locations (slug, name, place, neighborhood, landmark_en, landmark_es, metro, maps_url, sort_order)
VALUES
  (
    'eixample-studio',
    'Eixample Studio',
    'Studio',
    'Eixample Esquerra',
    'Private strength studio on Carrer d''Aragó with racks, barbells & showers',
    'Estudio privado en Carrer d''Aragó con racks, barras y duchas',
    'L1 Urgell / L5 Hospital Clínic',
    'https://www.google.com/maps/search/?api=1&query=Eixample+Barcelona+Spain',
    1
  ),
  (
    'barceloneta-beach',
    'Barceloneta Beach',
    'Outdoor',
    'Barceloneta',
    'Sand & promenade conditioning next to Espigó del Gas steps',
    'Acondicionamiento en arena y paseo junto a los escalones del Espigó del Gas',
    'L4 Barceloneta',
    'https://www.google.com/maps/search/?api=1&query=Barceloneta+Beach+Barcelona',
    2
  ),
  (
    'parc-de-la-ciutadella',
    'Parc de la Ciutadella',
    'Outdoor',
    'Ciutat Vella / Born',
    'Shaded gravel esplanade beside the Cascada Monumental north steps',
    'Explanada con sombra junto a las escaleras norte de la Cascada Monumental',
    'L1 Arc de Triomf / L4 Ciutadella',
    'https://www.google.com/maps/search/?api=1&query=Cascada+Monumental+Parc+de+la+Ciutadella+Barcelona',
    3
  ),
  (
    'montjuic',
    'Montjuïc',
    'Outdoor',
    'Sants-Montjuïc',
    'Olympic ring hills and south esplanade outside Estadi Olímpic',
    'Cuestas del anillo olímpico y explanada sur frente al Estadi Olímpic',
    'L1/L3 Espanya + Funicular',
    'https://www.google.com/maps/search/?api=1&query=Estadi+Olimpic+Montjuic+Barcelona',
    4
  ),
  (
    'poblenou',
    'Poblenou',
    'Outdoor',
    'Poblenou / 22@',
    'Waterfront plaza stairs at the foot of Rambla del Poblenou',
    'Escaleras y plaza marítima al final de la Rambla del Poblenou',
    'L4 Llacuna / Poblenou',
    'https://www.google.com/maps/search/?api=1&query=Rambla+del+Poblenou+Barcelona',
    5
  )
ON CONFLICT (slug) DO NOTHING;

-- 3. Reusable Session Types (11 class blueprints)
INSERT INTO public.session_types (
  slug, title, description, focus, place, default_location_id,
  default_duration_min, default_max_slots, default_price_eur, level, equipment
)
VALUES
  (
    'strength-foundations',
    'Strength Foundations',
    'Compound lower- and upper-body lifts with progressive load tracking and individual form cues.',
    'Strength',
    'Studio',
    (SELECT id FROM public.locations WHERE slug = 'eixample-studio'),
    60, 6, 25.00, 'All levels',
    ARRAY['Barbells', 'Power racks', 'Kettlebells', 'Dumbbells']
  ),
  (
    'lunch-express',
    'Lunch Express',
    'High-output kettlebell and bodyweight intervals engineered to fit cleanly between work calls.',
    'Conditioning',
    'Outdoor',
    (SELECT id FROM public.locations WHERE slug = 'parc-de-la-ciutadella'),
    45, 8, 20.00, 'All levels',
    ARRAY['Kettlebells', 'Resistance bands', 'Jump ropes']
  ),
  (
    'mobility-reset',
    'Mobility Reset',
    'Targeted hip, thoracic, and shoulder mobility paired with end-range strength to undo desk posture.',
    'Mobility',
    'Studio',
    (SELECT id FROM public.locations WHERE slug = 'eixample-studio'),
    45, 8, 20.00, 'Beginner-friendly',
    ARRAY['Mats', 'Dowels', 'Foam rollers', 'Light bands']
  ),
  (
    'beach-conditioning',
    'Beach Conditioning',
    'Sunrise sand carries, sled-style drags, and aerobic intervals with zero wasted time.',
    'Conditioning',
    'Outdoor',
    (SELECT id FROM public.locations WHERE slug = 'barceloneta-beach'),
    45, 10, 20.00, 'All levels',
    ARRAY['Kettlebells', 'Sandbags', 'Battle ropes']
  ),
  (
    'barbell-strength',
    'Barbell Strength',
    'Structured squat, deadlift, and press blocks programmed on a 6-week progression cycle.',
    'Strength',
    'Studio',
    (SELECT id FROM public.locations WHERE slug = 'eixample-studio'),
    60, 6, 25.00, 'Intermediate',
    ARRAY['Olympic barbells', 'Bumper plates', 'Power racks']
  ),
  (
    'urban-circuit',
    'Urban Circuit',
    'Stair work, loaded carries, and tempo circuits using Poblenou''s open waterfront plazas.',
    'Conditioning',
    'Outdoor',
    (SELECT id FROM public.locations WHERE slug = 'poblenou'),
    45, 8, 20.00, 'All levels',
    ARRAY['Kettlebells', 'TRX straps', 'Mini-bands']
  ),
  (
    'hill-intervals',
    'Hill Intervals',
    'Paced incline repeats and lower-body stamina blocks on Montjuïc''s Olympic ring climbs.',
    'Conditioning',
    'Outdoor',
    (SELECT id FROM public.locations WHERE slug = 'montjuic'),
    50, 8, 20.00, 'Intermediate',
    ARRAY['Timing cones', 'Resistance bands', 'Kettlebells']
  ),
  (
    'strength-express',
    'Strength Express',
    'Focused 45-minute supersets hitting two main strength lifts and core before heading back to work.',
    'Strength',
    'Studio',
    (SELECT id FROM public.locations WHERE slug = 'eixample-studio'),
    45, 6, 22.00, 'All levels',
    ARRAY['Barbells', 'Dumbbells', 'Kettlebells']
  ),
  (
    'park-strength',
    'Park Strength',
    'Weekend full-body kettlebell and suspension strength session in the shade of Ciutadella.',
    'Strength',
    'Outdoor',
    (SELECT id FROM public.locations WHERE slug = 'parc-de-la-ciutadella'),
    60, 10, 22.00, 'All levels',
    ARRAY['Kettlebells', 'TRX straps', 'Sandbags']
  ),
  (
    'mobility-flow',
    'Mobility Flow',
    'Active mobility, breathwork, and core control by the sea to recover from a heavy training week.',
    'Mobility',
    'Outdoor',
    (SELECT id FROM public.locations WHERE slug = 'barceloneta-beach'),
    45, 12, 18.00, 'Beginner-friendly',
    ARRAY['Mats', 'Light bands']
  ),
  (
    'sunday-long-session',
    'Sunday Long Session',
    'Team-paced aerobic base and strength-endurance session overlooking the city.',
    'Conditioning',
    'Outdoor',
    (SELECT id FROM public.locations WHERE slug = 'montjuic'),
    60, 10, 22.00, 'All levels',
    ARRAY['Kettlebells', 'Sandbags', 'Resistance bands']
  )
ON CONFLICT (slug) DO NOTHING;

-- 4. 15 Weekly Ongoing Availability Rules (0 = Mon .. 6 = Sun)
WITH seed_rules(type_slug, location_slug, weekday, start_time, duration_min, max_slots, price_eur) AS (
  VALUES
    ('strength-foundations', 'eixample-studio',       0, '07:00'::time, 60,  6, 25.00),
    ('lunch-express',        'parc-de-la-ciutadella', 0, '13:00'::time, 45,  8, 20.00),
    ('mobility-reset',       'eixample-studio',       0, '19:00'::time, 45,  8, 20.00),
    ('beach-conditioning',   'barceloneta-beach',     1, '07:00'::time, 45, 10, 20.00),
    ('barbell-strength',     'eixample-studio',       1, '18:30'::time, 60,  6, 25.00),
    ('strength-foundations', 'eixample-studio',       2, '07:00'::time, 60,  6, 25.00),
    ('urban-circuit',        'poblenou',              2, '13:00'::time, 45,  8, 20.00),
    ('mobility-reset',       'eixample-studio',       2, '19:30'::time, 45,  8, 20.00),
    ('hill-intervals',       'montjuic',              3, '07:00'::time, 50,  8, 20.00),
    ('barbell-strength',     'eixample-studio',       3, '18:30'::time, 60,  6, 25.00),
    ('beach-conditioning',   'barceloneta-beach',     4, '07:00'::time, 45, 10, 20.00),
    ('strength-express',     'eixample-studio',       4, '13:00'::time, 45,  6, 22.00),
    ('park-strength',        'parc-de-la-ciutadella', 5, '09:00'::time, 60, 10, 22.00),
    ('mobility-flow',        'barceloneta-beach',     5, '11:00'::time, 45, 12, 18.00),
    ('sunday-long-session',  'montjuic',              6, '10:00'::time, 60, 10, 22.00)
)
INSERT INTO public.session_availability_rules (
  session_type_id,
  location_id,
  weekday,
  start_time,
  duration_min,
  max_slots,
  price_eur,
  availability_mode,
  effective_from,
  effective_until,
  is_active
)
SELECT
  st.id,
  l.id,
  sr.weekday,
  sr.start_time,
  sr.duration_min,
  sr.max_slots,
  sr.price_eur,
  'ongoing',
  current_date,
  NULL,
  true
FROM seed_rules sr
JOIN public.session_types st ON st.slug = sr.type_slug
JOIN public.locations l ON l.slug = sr.location_slug
WHERE NOT EXISTS (
  SELECT 1
  FROM public.session_availability_rules existing
  WHERE existing.session_type_id = st.id
    AND existing.location_id = l.id
    AND existing.weekday = sr.weekday
    AND existing.start_time = sr.start_time
);

-- 5. Materialize initial 4 weeks of concrete dated sessions
SELECT public.generate_sessions_for_range(current_date, (current_date + 28)::date);
