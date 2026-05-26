"""Seed data that mirrors the frontend mock data in src/App.jsx."""
import uuid
from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.activity import Activity
from app.models.buyer import Buyer
from app.models.carrier import Carrier
from app.models.location import Location
from app.models.quote import Quote
from app.models.shipment import Shipment
from app.models.supplier import Supplier
from app.db.carrier_seed import CARRIER_SEEDS

LOCATION_SEEDS = [
    # China
    {"country": "China", "state": "Guangdong", "city": "Shenzhen", "is_major_hub": True},
    {"country": "China", "state": "Guangdong", "city": "Guangzhou", "is_major_hub": True},
    {"country": "China", "state": "Guangdong", "city": "Dongguan", "is_major_hub": True},
    {"country": "China", "state": "Guangdong", "city": "Huizhou", "is_major_hub": False},
    {"country": "China", "state": "Guangdong", "city": "Zhuhai", "is_major_hub": False},
    {"country": "China", "state": "Zhejiang", "city": "Hangzhou", "is_major_hub": True},
    {"country": "China", "state": "Zhejiang", "city": "Ningbo", "is_major_hub": False},
    {"country": "China", "state": "Jiangsu", "city": "Suzhou", "is_major_hub": True},
    {"country": "China", "state": "Jiangsu", "city": "Nanjing", "is_major_hub": False},
    {"country": "China", "state": "Shanghai", "city": "Shanghai", "is_major_hub": True},
    {"country": "China", "state": "Beijing", "city": "Beijing", "is_major_hub": True},
    {"country": "China", "state": "Sichuan", "city": "Chengdu", "is_major_hub": True},
    {"country": "China", "state": "Hubei", "city": "Wuhan", "is_major_hub": False},
    {"country": "China", "state": "Fujian", "city": "Xiamen", "is_major_hub": False},
    {"country": "China", "state": "Hong Kong", "city": "Hong Kong", "is_major_hub": True},
    {"country": "China", "state": "Taiwan", "city": "Taipei", "is_major_hub": True},
    {"country": "China", "state": "Taiwan", "city": "Hsinchu", "is_major_hub": True},
    {"country": "China", "state": "Taiwan", "city": "Taoyuan", "is_major_hub": False},
    # United States
    {"country": "United States", "state": "California", "city": "San Jose", "is_major_hub": True},
    {"country": "United States", "state": "California", "city": "San Francisco", "is_major_hub": True},
    {"country": "United States", "state": "California", "city": "Los Angeles", "is_major_hub": False},
    {"country": "United States", "state": "Texas", "city": "Austin", "is_major_hub": True},
    {"country": "United States", "state": "Texas", "city": "Dallas", "is_major_hub": False},
    {"country": "United States", "state": "Arizona", "city": "Phoenix", "is_major_hub": True},
    {"country": "United States", "state": "Oregon", "city": "Portland", "is_major_hub": False},
    {"country": "United States", "state": "Massachusetts", "city": "Boston", "is_major_hub": True},
    # Japan
    {"country": "Japan", "state": "Tokyo", "city": "Tokyo", "is_major_hub": True},
    {"country": "Japan", "state": "Osaka", "city": "Osaka", "is_major_hub": True},
    {"country": "Japan", "state": "Kanagawa", "city": "Yokohama", "is_major_hub": False},
    {"country": "Japan", "state": "Aichi", "city": "Nagoya", "is_major_hub": False},
    # South Korea
    {"country": "South Korea", "state": "Gyeonggi", "city": "Suwon", "is_major_hub": True},
    {"country": "South Korea", "state": "Seoul", "city": "Seoul", "is_major_hub": True},
    {"country": "South Korea", "state": "Gyeonggi", "city": "Seongnam", "is_major_hub": False},
    # Germany
    {"country": "Germany", "state": "Bavaria", "city": "Munich", "is_major_hub": True},
    {"country": "Germany", "state": "Baden-Württemberg", "city": "Stuttgart", "is_major_hub": True},
    {"country": "Germany", "state": "Hesse", "city": "Frankfurt", "is_major_hub": False},
    {"country": "Germany", "state": "Saxony", "city": "Dresden", "is_major_hub": False},
    # Vietnam
    {"country": "Vietnam", "state": "Bắc Ninh", "city": "Bắc Ninh", "is_major_hub": True},
    {"country": "Vietnam", "state": "Ho Chi Minh City", "city": "Ho Chi Minh City", "is_major_hub": False},
    {"country": "Vietnam", "state": "Hanoi", "city": "Hanoi", "is_major_hub": False},
    # Thailand
    {"country": "Thailand", "state": "Bangkok", "city": "Bangkok", "is_major_hub": True},
    {"country": "Thailand", "state": "Chonburi", "city": "Chonburi", "is_major_hub": False},
    # Malaysia
    {"country": "Malaysia", "state": "Penang", "city": "George Town", "is_major_hub": True},
    {"country": "Malaysia", "state": "Kuala Lumpur", "city": "Kuala Lumpur", "is_major_hub": False},
    # Singapore
    {"country": "Singapore", "state": "Singapore", "city": "Singapore", "is_major_hub": True},
    # India
    {"country": "India", "state": "Karnataka", "city": "Bengaluru", "is_major_hub": True},
    {"country": "India", "state": "Maharashtra", "city": "Mumbai", "is_major_hub": False},
    {"country": "India", "state": "Tamil Nadu", "city": "Chennai", "is_major_hub": True},
    # UK
    {"country": "United Kingdom", "state": "England", "city": "London", "is_major_hub": False},
    {"country": "United Kingdom", "state": "England", "city": "Cambridge", "is_major_hub": False},
    # Sweden
    {"country": "Sweden", "state": "Stockholm", "city": "Stockholm", "is_major_hub": False},
]

SUPPLIER_SEEDS = [
    {
        "name": "Shenzhen PCB Co.",
        "location": "Nanshan, SZ",
        "country": "China",
        "state": "Guangdong",
        "city": "Shenzhen",
        "match_score": 94,
        "stars": 5,
        "lead_days": 7,
        "lead_label": "7 days",
        "price_low": 0.80,
        "price_high": 1.20,
        "price_label": "$0.80–$1.20/unit",
        "components": ["FR4 PCB", "Multilayer PCB", "HASL Finish"],
        "certifications": ["ISO 9001", "ISO 14001", "IATF 16949"],
        "min_order_qty": 100,
        "contact_name": "Li Wei",
        "contact_email": "liwei@szpcb.cn",
        "contact_phone": "+86 755 2666 1234",
    },
    {
        "name": "GBA Circuit Works",
        "location": "Futian, SZ",
        "country": "China",
        "state": "Guangdong",
        "city": "Shenzhen",
        "match_score": 88,
        "stars": 4,
        "lead_days": 10,
        "lead_label": "10 days",
        "price_low": 0.65,
        "price_high": 0.95,
        "price_label": "$0.65–$0.95/unit",
        "components": ["SMT Assembly", "PCB Fab", "ENIG Finish"],
        "certifications": ["ISO 9001", "ISO 13485"],
        "min_order_qty": 200,
        "contact_name": "Chen Xiaoming",
        "contact_email": "cxm@gba-circuits.cn",
        "contact_phone": "+86 755 8321 5678",
    },
    {
        "name": "Dragon Electronics",
        "location": "Longhua, SZ",
        "country": "China",
        "state": "Guangdong",
        "city": "Shenzhen",
        "match_score": 82,
        "stars": 4,
        "lead_days": 14,
        "lead_label": "14 days",
        "price_low": 0.55,
        "price_high": 0.80,
        "price_label": "$0.55–$0.80/unit",
        "components": ["FR4 PCB", "HASL Finish", "Wave Soldering"],
        "certifications": ["ISO 9001", "UL Certified"],
        "min_order_qty": 500,
        "contact_name": "Zhang Long",
        "contact_email": "zhanglong@dragonelec.cn",
        "contact_phone": "+86 755 2812 9012",
    },
    {
        "name": "Pearl River Fab",
        "location": "Guangzhou",
        "country": "China",
        "state": "Guangdong",
        "city": "Guangzhou",
        "match_score": 79,
        "stars": 3,
        "lead_days": 12,
        "lead_label": "12 days",
        "price_low": 0.45,
        "price_high": 0.70,
        "price_label": "$0.45–$0.70/unit",
        "components": ["PCB Fab", "CNC Machining", "Aluminum PCB"],
        "certifications": ["ISO 9001"],
        "min_order_qty": 300,
        "contact_name": "Huang Li",
        "contact_email": "huangl@pearlriver.cn",
        "contact_phone": "+86 20 3876 2345",
    },
    {
        "name": "HK Precision Mfg",
        "location": "Kwun Tong, HK",
        "country": "China",
        "state": "Hong Kong",
        "city": "Hong Kong",
        "match_score": 75,
        "stars": 4,
        "lead_days": 8,
        "lead_label": "8 days",
        "price_low": 1.10,
        "price_high": 1.60,
        "price_label": "$1.10–$1.60/unit",
        "components": ["Precision PCB", "ENIG Finish", "Rigid-Flex"],
        "certifications": ["ISO 9001", "AS9100D", "ISO 13485"],
        "min_order_qty": 50,
        "contact_name": "Michael Cheung",
        "contact_email": "mcheung@hkprecision.hk",
        "contact_phone": "+852 2345 6789",
    },
]

BUYER_SEEDS = [
    {
        "name": "TechHardware GmbH",
        "country_flag": "🇩🇪",
        "country": "Germany",
        "fit_score": 91,
        "interest": "IoT Sensors",
        "stage": "Identified",
        "contact_name": "Hans Mueller",
        "contact_email": "hans@techhardware.de",
        "contact_phone": "+49 89 123 4567",
        "last_contact": "May 8, 2026",
        "fit_product": 0.94,
        "fit_market": 0.88,
        "fit_budget": 0.92,
        "fit_timeline": 0.85,
        "notes": "Looking for IoT sensor modules with BLE connectivity. Volume: 50K units/yr.",
    },
    {
        "name": "MakerSpace Labs",
        "country_flag": "🇺🇸",
        "country": "USA",
        "fit_score": 87,
        "interest": "PCB Assemblies",
        "stage": "Contacted",
        "contact_name": "Sarah Chen",
        "contact_email": "sarah@makerspace.io",
        "contact_phone": "+1 415 555 9876",
        "last_contact": "May 7, 2026",
        "fit_product": 0.91,
        "fit_market": 0.85,
        "fit_budget": 0.80,
        "fit_timeline": 0.88,
        "notes": "Startup scaling from prototype to production. Needs flexible MOQ.",
    },
    {
        "name": "Nordic Components",
        "country_flag": "🇸🇪",
        "country": "Sweden",
        "fit_score": 83,
        "interest": "Custom Electronics",
        "stage": "Engaged",
        "contact_name": "Erik Lindqvist",
        "contact_email": "erik@nordiccomp.se",
        "contact_phone": "+46 8 555 1234",
        "last_contact": "May 6, 2026",
        "fit_product": 0.82,
        "fit_market": 0.86,
        "fit_budget": 0.79,
        "fit_timeline": 0.84,
        "notes": "Sent initial quote for custom PCB + SMT assembly. Awaiting feedback.",
    },
    {
        "name": "Osaka Electronics",
        "country_flag": "🇯🇵",
        "country": "Japan",
        "fit_score": 79,
        "interest": "Consumer Hardware",
        "stage": "Relationship",
        "contact_name": "Yuki Tanaka",
        "contact_email": "yuki@osakaelec.jp",
        "contact_phone": "+81 6 6555 0123",
        "last_contact": "May 5, 2026",
        "fit_product": 0.80,
        "fit_market": 0.78,
        "fit_budget": 0.81,
        "fit_timeline": 0.77,
        "notes": "Long-term partner. Quarterly orders of 100K+ units. Excellent payment record.",
    },
    {
        "name": "London Robotics",
        "country_flag": "🇬🇧",
        "country": "UK",
        "fit_score": 76,
        "interest": "Robotics Components",
        "stage": "Contacted",
        "contact_name": "James Okafor",
        "contact_email": "james@londonrobotics.co",
        "contact_phone": "+44 20 7946 0123",
        "last_contact": "May 4, 2026",
        "fit_product": 0.77,
        "fit_market": 0.74,
        "fit_budget": 0.78,
        "fit_timeline": 0.73,
        "notes": "Needs precision CNC machined parts for robotic arm assemblies.",
    },
    {
        "name": "SF Hardware Co",
        "country_flag": "🇺🇸",
        "country": "USA",
        "fit_score": 72,
        "interest": "Wearables",
        "stage": "Identified",
        "contact_name": "Priya Sharma",
        "contact_email": "priya@sfhardware.com",
        "contact_phone": "+1 628 555 4321",
        "last_contact": "May 3, 2026",
        "fit_product": 0.73,
        "fit_market": 0.76,
        "fit_budget": 0.68,
        "fit_timeline": 0.70,
        "notes": "Exploring rigid-flex PCBs for next-gen fitness tracker.",
    },
]

SHIPMENT_SEEDS = [
    {
        "id": "DHL-883821",
        "origin": "Hong Kong",
        "destination": "Frankfurt, Germany",
        "buyer_country": "Germany",
        "carrier": "DHL Express",
        "buyer_name": "TechHardware GmbH",
        "status": "in_transit",
        "stages": [
            {"label": "Package Received", "loc": "Kwun Tong, HK", "date": "May 8, 2026 14:22", "done": True},
            {"label": "Local Transit", "loc": "Hong Kong", "date": "May 9, 2026 08:15", "done": True},
            {"label": "Customs Clearance", "loc": "Hong Kong Intl.", "date": "May 10, 2026 11:30", "done": False, "current": True},
            {"label": "International Transit", "loc": "HK → FRA", "date": "Pending", "done": False},
            {"label": "Germany Transit", "loc": "Frankfurt", "date": "Pending", "done": False},
            {"label": "Delivered", "loc": "Frankfurt, Germany", "date": "Pending", "done": False},
        ],
    },
    {
        "id": "SF-449021",
        "origin": "Shenzhen",
        "destination": "Tokyo, Japan",
        "buyer_country": "Japan",
        "carrier": "SF Express",
        "buyer_name": "Osaka Electronics",
        "status": "delivered",
        "stages": [
            {"label": "Package Received", "loc": "Futian, SZ", "date": "Apr 28, 2026 09:10", "done": True},
            {"label": "Local Transit", "loc": "Shenzhen → HK", "date": "Apr 29, 2026 16:45", "done": True},
            {"label": "Customs Clearance", "loc": "Hong Kong Intl.", "date": "Apr 30, 2026 10:20", "done": True},
            {"label": "International Transit", "loc": "HK → NRT", "date": "May 1, 2026 22:00", "done": True},
            {"label": "Japan Transit", "loc": "Tokyo", "date": "May 3, 2026 07:30", "done": True},
            {"label": "Delivered", "loc": "Tokyo, Japan", "date": "May 3, 2026 14:15", "done": True},
        ],
    },
    {
        "id": "FWD-221983",
        "origin": "Shenzhen",
        "destination": "Los Angeles, USA",
        "buyer_country": "USA",
        "carrier": "FWD",
        "buyer_name": "MakerSpace Labs",
        "status": "in_transit",
        "stages": [
            {"label": "Package Received", "loc": "Longhua, SZ", "date": "May 6, 2026 11:00", "done": True},
            {"label": "Local Transit", "loc": "Shenzhen", "date": "May 7, 2026 09:30", "done": True},
            {"label": "Customs Clearance", "loc": "Shenzhen Intl.", "date": "May 8, 2026 15:45", "done": False, "current": True},
            {"label": "International Transit", "loc": "SZ → LAX", "date": "Pending", "done": False},
            {"label": "USA Transit", "loc": "Los Angeles", "date": "Pending", "done": False},
            {"label": "Delivered", "loc": "Los Angeles, USA", "date": "Pending", "done": False},
        ],
    },
]

QUOTE_SEEDS = [
    {"carrier": "SF Express", "service": "International Express", "transit_min_days": 5, "transit_max_days": 7,
     "price_hkd": 284, "price_usd": 36, "co2_kg": "12 kg", "origin": "Shenzhen", "destination": "Frankfurt", "cargo_type": "Electronics"},
    {"carrier": "DHL", "service": "Express Worldwide", "transit_min_days": 3, "transit_max_days": 5,
     "price_hkd": 412, "price_usd": 53, "co2_kg": "9 kg", "origin": "Shenzhen", "destination": "Frankfurt", "cargo_type": "Electronics"},
    {"carrier": "Air Freight", "service": "Charter Cargo", "transit_min_days": 2, "transit_max_days": 3,
     "price_hkd": 1840, "price_usd": 236, "co2_kg": "32 kg", "origin": "Shenzhen", "destination": "Frankfurt", "cargo_type": "Electronics"},
    {"carrier": "Ocean LCL", "service": "Sea Freight", "transit_min_days": 25, "transit_max_days": 30,
     "price_hkd": 96, "price_usd": 12, "co2_kg": "2 kg", "origin": "Shenzhen", "destination": "Frankfurt", "cargo_type": "Electronics"},
]

ACTIVITY_SEEDS = [
    {"tag": "Sourcing", "text": "Supplier match found: Shenzhen PCB Co. — 94% match", "time_label": "2 min ago"},
    {"tag": "Buyers", "text": "Buyer lead identified: TechHardware GmbH, Germany", "time_label": "1 hr ago"},
    {"tag": "Logistics", "text": "Shipment DHL-883821 cleared customs", "time_label": "3 hrs ago"},
    {"tag": "Sourcing", "text": "RFQ package generated for BOM_v3.xlsx", "time_label": "Yesterday"},
]


async def seed_database(session: AsyncSession) -> None:
    """Insert seed data if tables are empty."""

    from sqlalchemy import select, func

    # Suppliers
    result = await session.execute(select(func.count()).select_from(Supplier))
    if result.scalar() == 0:
        for s in SUPPLIER_SEEDS:
            session.add(Supplier(**s))
        await session.flush()

    # Buyers
    result = await session.execute(select(func.count()).select_from(Buyer))
    if result.scalar() == 0:
        for b in BUYER_SEEDS:
            session.add(Buyer(**b))
        await session.flush()

    # Shipments
    result = await session.execute(select(func.count()).select_from(Shipment))
    if result.scalar() == 0:
        for s in SHIPMENT_SEEDS:
            session.add(Shipment(**s))
        await session.flush()

    # Quotes
    result = await session.execute(select(func.count()).select_from(Quote))
    if result.scalar() == 0:
        for q in QUOTE_SEEDS:
            session.add(Quote(**q))
        await session.flush()

    # Activities
    result = await session.execute(select(func.count()).select_from(Activity))
    if result.scalar() == 0:
        for a in ACTIVITY_SEEDS:
            session.add(Activity(**a))
        await session.flush()

    # Locations
    result = await session.execute(select(func.count()).select_from(Location))
    if result.scalar() == 0:
        for l in LOCATION_SEEDS:
            session.add(Location(**l))
        await session.flush()

    # Carriers
    result = await session.execute(select(func.count()).select_from(Carrier))
    if result.scalar() == 0:
        for c in CARRIER_SEEDS:
            session.add(Carrier(**c))
        await session.flush()

    await session.commit()
