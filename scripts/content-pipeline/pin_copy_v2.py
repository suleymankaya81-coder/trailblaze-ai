"""Pure "Design the Exit" pin copy (Pinterest, Oct 2026): lead with the reader's trip,
then give the concrete next step — days, arrival airport, drive time, booking need.
No I/O so it can be unit-tested."""
import re

BOOKING = {"none": "No entry reservation", "moderate": "Reserve ahead in peak season", "high": "Reservation required"}


def drive_label(minutes):
    if minutes is None:
        return None
    if minutes < 60:
        return f"{minutes} min drive"
    h = round(minutes / 30) / 2
    return f"{h:g} hr drive"


def arrival(airport, minutes):
    if not airport:
        return None
    d = drive_label(minutes)
    return f"Fly into {airport}" + (f" · {d}" if d else "")


def days_from(raw):
    n = re.search(r"\d+", raw or "")
    return max(1, int(n.group())) if n else 2


def join(*parts):
    return " · ".join(p for p in parts if p)


def card(kind, d, extra=None):
    """Return (sub, info) lines for the card. d: destination dict, extra: loop data."""
    dur = d.get("dur")
    arr = arrival(d.get("airport"), d.get("drive_minutes"))
    booking = BOOKING.get(d.get("permit_level") or "")
    season = d.get("best_season")
    if kind == "destination":
        return (f"{dur} route: stops & drive times" if dur else "Route map & day-by-day stops", join(arr, booking))
    if kind == "best_time":
        return ("Crowds, weather & permits by month", season and f"Best window: {season}" or arr or "")
    if kind == "things_to_do":
        return ("Hikes, scenic drives & day plans", join(arr, booking))
    if kind == "glamping":
        return ("Cabins, glamping & RV sites nearby", join(arr, season and f"Best: {season}"))
    if kind == "trip_planner":
        return (f"{dur} plan, stop by stop" if dur else "Day-by-day plan", join(arr, booking))
    if kind == "rv_camping":
        return ("Where to park the RV & what to book", join(arr, booking))
    if kind == "fly_drive":
        return ("Flights, rental car & first night sorted", arr or (season and f"Best: {season}") or "")
    if kind == "no_reservation":
        return ("Entry rules, workarounds & backup stops", join(booking, season and f"Best: {season}"))
    if kind in ("loop", "corridor"):
        e = extra or {}
        return (f"{e['stops']} stops · about {e['days']} days", e.get("info") or "One free map with every stop")
    raise KeyError(kind)


def csv_title(kind, name, extra=None):
    e = extra or {}
    t = {"loop": f"{name}: {e.get('stops')} Stops in About {e.get('days')} Days",
         "corridor": f"{name}: Fly In, Drive the Loop, Fly Home",
         "rv_camping": f"{name} RV Trip: Where to Camp & What to Book",
         "fly_drive": f"Fly into {e.get('airport') or 'the Area'}, Drive to {name}: Trip Plan",
         "no_reservation": f"No Reservation for {name}? Entry Rules & Backup Plans",
         "destination": f"{name} Road Trip: Route Map, Stops & Drive Times",
         "best_time": f"Best Time to Visit {name}: Weather, Crowds & Permits",
         "things_to_do": f"Best Things to Do in {name}: Hikes & Scenic Drives",
         "glamping": f"Where to Stay Near {name}: Glamping, Cabins & RV Sites",
         "trip_planner": f"{name} Itinerary: A Day-by-Day Road Trip Plan"}[kind]
    return t[:100]


def csv_description(kind, name, sub, info, extra=None):
    e = extra or {}
    if kind in ("loop", "corridor"):
        lead = f"Turn \"some day\" into a real plan: {e.get('stop_names', '')}."
        body = f"{sub}. {info}. Open the free route map, pick your days and get back to the road."
    elif kind == "rv_camping":
        lead = f"Taking the RV to {name}? Here's the short version so you can stop scrolling and start packing."
        body = f"{sub}. {info}. Campgrounds, hookups and booking timing in one free guide."
    elif kind == "fly_drive":
        lead = f"Fly in, pick up the car and be at {name} before lunch."
        body = f"{sub}. {info}. Airport, drive time, rental and first-night tips in one free guide."
    elif kind == "no_reservation":
        lead = f"Couldn't get a reservation for {name}? You still have options."
        body = f"{sub}. {info}. Entry windows, backup stops and official sources in one free guide."
    else:
        lead = f"Planning a trip to {name}? Start here."
        body = f"{sub}. {info}. Free guide with maps, drive times and booking tips."
    return re.sub(r"\s+", " ", f"{lead} {body}").replace(". .", ".")[:500]
