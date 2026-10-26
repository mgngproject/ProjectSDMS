insert into public.kategori (nama) values
  ('IDE'), ('IDH'), ('BGN'), ('TPBW/TPP'), ('Magang'), ('PKWT'), ('Inagov')
on conflict (nama) do nothing;
