"""Logistics quote calculator — estimates shipping costs based on real parameters."""
import math

# Approximate distances between major hubs (km)
DISTANCE_MATRIX = {
    ("Dongguan", "Frankfurt"): 9200,
    ("Dongguan", "Los Angeles"): 11700,
    ("Dongguan", "Tokyo"): 2900,
    ("Huizhou", "Frankfurt"): 9200,
    ("Huizhou", "Los Angeles"): 11700,
    ("Huizhou", "Tokyo"): 2900,
    ("Shenzhen", "Frankfurt"): 9200,
    ("Shenzhen", "Los Angeles"): 11700,
    ("Shenzhen", "Tokyo"): 2900,
    ("Shenzhen", "London"): 9600,
    ("Shenzhen", "Singapore"): 2600,
    ("Shenzhen", "New York"): 12900,
    ("Hong Kong", "Frankfurt"): 9200,
    ("Hong Kong", "Los Angeles"): 11600,
    ("Hong Kong", "Tokyo"): 2800,
    ("Hong Kong", "London"): 9600,
    ("Hong Kong", "Singapore"): 2500,
    ("Hong Kong", "New York"): 12900,
    ("Guangzhou", "Frankfurt"): 9100,
    ("Guangzhou", "Los Angeles"): 11600,
    ("Guangzhou", "Tokyo"): 2900,
    ("Shanghai", "Frankfurt"): 8900,
    ("Shanghai", "Los Angeles"): 10400,
    ("Shanghai", "Tokyo"): 1800,
    ("Shanghai", "London"): 9200,
    ("Shanghai", "Singapore"): 3800,
    ("Shanghai", "New York"): 11800,
    ("Tokyo", "Frankfurt"): 9400,
    ("Tokyo", "Los Angeles"): 8800,
    ("Tokyo", "London"): 9600,
    ("Tokyo", "New York"): 10800,
    ("Singapore", "Frankfurt"): 10300,
    ("Singapore", "Los Angeles"): 14100,
    ("Singapore", "London"): 10800,
    ("Seoul", "Frankfurt"): 8600,
    ("Seoul", "Los Angeles"): 9500,
    ("Taipei", "Frankfurt"): 9400,
    ("Taipei", "Los Angeles"): 10900,
    ("Bangkok", "Frankfurt"): 9000,
    ("Bangkok", "Los Angeles"): 13300,
    ("Ho Chi Minh City", "Frankfurt"): 9700,
    ("Mumbai", "Frankfurt"): 6600,
    ("Mumbai", "Los Angeles"): 14000,
}

# Urgency multipliers
URGENCY_MULTIPLIER = {
    "express": 2.0,
    "standard": 1.0,
    "economy": 0.55,
}

# Category-specific rate modifiers
CATEGORY_MODIFIER = {
    "parcel": 1.0,
    "air_freight": 0.55,
    "ocean": 0.035,
}


def _get_distance(origin: str, destination: str) -> float:
    """Get the approximate distance in km between two locations."""
    # Try exact match
    d = DISTANCE_MATRIX.get((origin, destination))
    if d:
        return d
    # Try reversed
    d = DISTANCE_MATRIX.get((destination, origin))
    if d:
        return d
    # Try partial match (origin city in key)
    origin_lower = origin.lower()
    dest_lower = destination.lower()
    for (o, d), dist in DISTANCE_MATRIX.items():
        if o.lower() in origin_lower and d.lower() in dest_lower:
            return dist
        if o.lower() in dest_lower and d.lower() in origin_lower:
            return dist
    # Default: estimate ~8000 km
    return 8000.0


def _calculate_volumetric_weight(length_cm: float, width_cm: float, height_cm: float) -> float:
    """Calculate volumetric weight in kg (DIM divisor 5000 for air/express)."""
    return (length_cm * width_cm * height_cm) / 5000.0


def calculate_quote(
    origin: str,
    destination: str,
    weight_kg: float,
    category: str,
    urgency: str = "standard",
    length_cm: float = 0,
    width_cm: float = 0,
    height_cm: float = 0,
    base_rate_per_kg: float = 0,
    quantity: int = 1,
) -> dict:
    """
    Calculate a shipping quote estimate.

    Returns a dict with price_hkd, price_usd, transit_days, co2_kg, and breakdown.
    """
    distance_km = _get_distance(origin, destination)

    # Effective weight (max of actual and volumetric)
    vol_weight = _calculate_volumetric_weight(length_cm, width_cm, height_cm) if length_cm else 0
    effective_weight = max(weight_kg, vol_weight) * quantity

    # Base rate
    cat_mod = CATEGORY_MODIFIER.get(category, 0.1)
    if base_rate_per_kg > 0:
        rate_per_kg = base_rate_per_kg * cat_mod
    else:
        # Default rates by category if carrier has no specific rate
        if category == "parcel":
            rate_per_kg = 8.0 * cat_mod
        elif category == "air_freight":
            rate_per_kg = 4.0 * cat_mod
        elif category == "ocean":
            rate_per_kg = 0.15 * cat_mod
        else:
            rate_per_kg = 6.0 * cat_mod

    urgency_mult = URGENCY_MULTIPLIER.get(urgency, 1.0)
    distance_factor = distance_km / 5000.0  # normalized distance factor

    # Price calculation in HKD
    base_price_hkd = effective_weight * rate_per_kg * distance_factor * urgency_mult
    fuel_surcharge_hkd = base_price_hkd * 0.15  # 15% fuel surcharge
    handling_hkd = 50.0 * quantity if category == "parcel" else 150.0 * quantity
    total_hkd = round(base_price_hkd + fuel_surcharge_hkd + handling_hkd, 2)
    total_usd = round(total_hkd / 7.8, 2)

    # Transit time estimate
    if category == "parcel":
        base_transit = max(1, math.ceil(distance_km / 2500))
    elif category == "air_freight":
        base_transit = max(1, math.ceil(distance_km / 5000))
    elif category == "ocean":
        base_transit = max(5, math.ceil(distance_km / 400))
    else:
        base_transit = max(1, math.ceil(distance_km / 3000))

    if urgency == "express":
        transit_min = max(1, base_transit - 1)
        transit_max = max(1, base_transit)
    elif urgency == "economy":
        transit_min = base_transit + 2
        transit_max = base_transit + 7
    else:
        transit_min = base_transit
        transit_max = base_transit + 2

    # CO2 estimate (kg per kg of cargo)
    if category == "ocean":
        co2_per_kg = 0.015 * distance_km / 1000
    elif category == "air_freight":
        co2_per_kg = 0.6 * distance_km / 1000
    else:
        co2_per_kg = 0.45 * distance_km / 1000
    co2_total = round(co2_per_kg * effective_weight, 1)

    return {
        "price_hkd": max(total_hkd, 50.0),
        "price_usd": max(total_usd, 6.5),
        "transit_min_days": transit_min,
        "transit_max_days": transit_max,
        "co2_kg": f"{co2_total} kg",
        "breakdown": {
            "base_price_hkd": round(base_price_hkd, 2),
            "fuel_surcharge_hkd": round(fuel_surcharge_hkd, 2),
            "handling_hkd": handling_hkd,
            "distance_km": distance_km,
            "effective_weight_kg": round(effective_weight, 2),
            "rate_per_kg": round(rate_per_kg, 2),
            "urgency_multiplier": urgency_mult,
        },
    }
