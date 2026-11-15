"""Offer completeness follows real visit scope, not invented extra attractions."""
def required_offer_count(country, plan):
    if country not in ('ca', 'gb'):
        return 15
    activities = {stop['name'] for day in (plan or {}).get('days', []) for stop in day['stops']}
    return 9 + min(3, len(activities))