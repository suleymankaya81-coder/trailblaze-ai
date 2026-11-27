- Country exploration uses CountryExplorationMap and lazy browser-only CountryMapCanvas on English/German/French country directories, with published coordinates and shared countryMapLinks. Why: one map per country without runtime routing or inferred access permission.

- Destination views use stored content only; never call live AI enrichment on page load, and keep its former endpoint disabled. Why: visitors and crawlers must not trigger paid inference.
