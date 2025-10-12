create table if not exists cases (
  id bigserial primary key,
  reference varchar(36) not null,
  status varchar(32) not null default 'NEW',
  created_at timestamptz not null default now()
);
