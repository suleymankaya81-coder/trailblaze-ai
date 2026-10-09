UPDATE public.destinations
SET trip_duration_days = replace(replace(replace(trip_duration_days, 'â' || chr(128) || chr(147), '–'), 'â' || chr(128) || chr(148), '—'), 'â' || chr(128) || chr(153), '’')
WHERE trip_duration_days ~ 'â';