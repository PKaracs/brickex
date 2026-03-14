insert into storage.buckets (id, name, public, file_size_limit)
values
  ('brickex-project-assets', 'brickex-project-assets', false, 52428800),
  ('brickex-generations', 'brickex-generations', false, 52428800),
  ('brickex-exports', 'brickex-exports', false, 52428800),
  ('objects', 'objects', true, 52428800)
on conflict (id) do nothing;
