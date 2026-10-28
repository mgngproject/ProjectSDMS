insert into public.kategori (nama) values
  ('IDE'), ('IDH'), ('BGN'), ('TPBW/TPP'), ('Magang'), ('PKWT'), ('Inagov'), ('TAD')
on conflict (nama) do nothing;
