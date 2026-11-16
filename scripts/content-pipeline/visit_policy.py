"""Offer completeness follows real visit scope, not invented extra attractions."""
def requires_activity_photos(country):
    """DACH compact visits need a licensed cover, not extra image quotas."""
    return country not in {'de', 'at', 'ch', 'it'}

def required_offer_count(country, plan):
    if country == 'us':
        return 15
    activities = {stop['name'] for day in (plan or {}).get('days', []) for stop in day['stops']}
    return 9 + min(3, len(activities))