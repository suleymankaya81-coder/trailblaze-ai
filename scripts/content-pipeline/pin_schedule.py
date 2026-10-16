"""Account-wide RSS release allowance; independent of rendering and I/O."""
import datetime
from collections import defaultdict, deque

DAILY_LIMIT = 200


def release_schedule(items, start, existing=None):
    """Balance boards, preserve assigned dates, and never overbook a UTC day."""
    existing = existing or {}
    releases = dict(existing)
    used = defaultdict(int)
    for date in existing.values():
        used[date.astimezone(datetime.timezone.utc).date()] += 1
    boards = defaultdict(deque)
    for item in sorted(items, key=lambda x: (-x["score"], x["key"])):
        if item["key"] not in existing:
            boards[item["feed"]].append(item["key"])
    day = start.astimezone(datetime.timezone.utc)
    while any(boards.values()):
        if used[day.date()] >= DAILY_LIMIT:
            day = datetime.datetime.combine(day.date() + datetime.timedelta(days=1), datetime.time(), datetime.timezone.utc)
            continue
        for feed in sorted(boards):
            if boards[feed] and used[day.date()] < DAILY_LIMIT:
                releases[boards[feed].popleft()] = day
                used[day.date()] += 1
    return releases