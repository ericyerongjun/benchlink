import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Search, Users, Truck, Database, Settings,
  Bell, Upload, X, ArrowUp, ArrowDown, Package, Clock,
  ChevronRight, Filter, Plus, MapPin, Mail, Phone, FileText,
  TrendingUp, Send, Download, Calendar, Leaf, Zap, Globe,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:          '#0D1B2A',
  surface:     '#1C2B39',
  surfaceHi:   '#22334A',
  teal:        '#0E7C7B',
  bright:      '#16B4B2',
  text:        '#F4F6F8',
  muted:       '#6B7A8D',
  success:     '#2ECC71',
  warning:     '#F39C12',
  danger:      '#E74C3C',
  border:      '#1E3248',
};
const glow  = { boxShadow: '0 0 16px rgba(14,124,123,0.4)' };
const card  = { background: C.surface, borderRadius: 8, border: `1px solid ${C.border}` };

// ─── Static data ──────────────────────────────────────────────────────────────
const CHART_DATA = [
  { week: 'Wk 1', requests: 4 },  { week: 'Wk 2', requests: 6 },
  { week: 'Wk 3', requests: 5 },  { week: 'Wk 4', requests: 9 },
  { week: 'Wk 5', requests: 7 },  { week: 'Wk 6', requests: 11 },
  { week: 'Wk 7', requests: 10 }, { week: 'Wk 8', requests: 12 },
];

const SUPPLIERS = [
  { name: 'Shenzhen PCB Co.',   loc: 'Nanshan, SZ',   match: 94, stars: 5, lead: '7 days',  price: '$0.80–$1.20/unit' },
  { name: 'GBA Circuit Works',  loc: 'Futian, SZ',    match: 88, stars: 4, lead: '10 days', price: '$0.65–$0.95/unit' },
  { name: 'Dragon Electronics', loc: 'Longhua, SZ',   match: 82, stars: 4, lead: '14 days', price: '$0.55–$0.80/unit' },
  { name: 'Pearl River Fab',    loc: 'Guangzhou',     match: 79, stars: 3, lead: '12 days', price: '$0.45–$0.70/unit' },
  { name: 'HK Precision Mfg',  loc: 'Kwun Tong, HK', match: 75, stars: 4, lead: '8 days',  price: '$1.10–$1.60/unit' },
];

const BUYERS = [
  { id:1, name:'TechHardware GmbH', flag:'🇩🇪', fit:91, interest:'IoT Sensors',         stage:'Identified',   contact:'Hans Mueller',    email:'hans@techhardware.de',    phone:'+49 89 123 4567',  lastContact:'May 8, 2026'  },
  { id:2, name:'MakerSpace Labs',   flag:'🇺🇸', fit:87, interest:'PCB Assemblies',       stage:'Contacted',    contact:'Sarah Chen',       email:'sarah@makerspace.io',     phone:'+1 415 555 9876',  lastContact:'May 7, 2026'  },
  { id:3, name:'Nordic Components', flag:'🇸🇪', fit:83, interest:'Custom Electronics',   stage:'Engaged',      contact:'Erik Lindqvist',   email:'erik@nordiccomp.se',      phone:'+46 8 555 1234',   lastContact:'May 6, 2026'  },
  { id:4, name:'Osaka Electronics', flag:'🇯🇵', fit:79, interest:'Consumer Hardware',    stage:'Relationship', contact:'Yuki Tanaka',       email:'yuki@osakaelec.jp',       phone:'+81 6 6555 0123',  lastContact:'May 5, 2026'  },
  { id:5, name:'London Robotics',   flag:'🇬🇧', fit:76, interest:'Robotics Components',  stage:'Contacted',    contact:'James Okafor',     email:'james@londonrobotics.co', phone:'+44 20 7946 0123', lastContact:'May 4, 2026'  },
  { id:6, name:'SF Hardware Co',    flag:'🇺🇸', fit:72, interest:'Wearables',            stage:'Identified',   contact:'Priya Sharma',     email:'priya@sfhardware.com',    phone:'+1 628 555 4321',  lastContact:'May 3, 2026'  },
];

const KANBAN_COLS = ['Identified', 'Contacted', 'Engaged', 'Relationship'];

const ACTIVITY = [
  { dot: C.bright,   tag:'Sourcing',  text:'Supplier match found: Shenzhen PCB Co. — 94% match', time:'2 min ago' },
  { dot: C.warning,  tag:'Buyers',    text:'Buyer lead identified: TechHardware GmbH, Germany',  time:'1 hr ago'  },
  { dot: C.success,  tag:'Logistics', text:'Shipment DHL-883821 cleared customs',                 time:'3 hrs ago' },
  { dot: C.muted,    tag:'Sourcing',  text:'RFQ package generated for BOM_v3.xlsx',              time:'Yesterday' },
];

const QUOTES = [
  { carrier:'SF Express',  service:'International Express', transit:'5–7 days',   hkd:284,  usd:36,  co2:'12 kg',  col:'#E74C3C' },
  { carrier:'DHL',         service:'Express Worldwide',     transit:'3–5 days',   hkd:412,  usd:53,  co2:'9 kg',   col:'#F39C12' },
  { carrier:'Air Freight', service:'Charter Cargo',         transit:'2–3 days',   hkd:1840, usd:236, co2:'32 kg',  col:'#3498DB' },
  { carrier:'Ocean LCL',   service:'Sea Freight',           transit:'25–30 days', hkd:96,   usd:12,  co2:'2 kg',   col:'#2ECC71' },
];

const SHIPMENTS = [
  {
    id: 'DHL-883821',
    origin: 'Hong Kong',
    destination: 'Frankfurt, Germany',
    buyerCountry: 'Germany',
    carrier: 'DHL Express',
    buyer: 'TechHardware GmbH',
    stages: [
      { label: 'Package Received',    loc: 'Kwun Tong, HK',      date: 'May 8, 2026 14:22',  done: true },
      { label: 'Local Transit',       loc: 'Hong Kong',          date: 'May 9, 2026 08:15',  done: true },
      { label: 'Customs Clearance',   loc: 'Hong Kong Intl.',    date: 'May 10, 2026 11:30', done: false, current: true },
      { label: 'International Transit', loc: 'HK → FRA',          date: 'Pending',             done: false },
      { label: 'Germany Transit',     loc: 'Frankfurt',          date: 'Pending',             done: false },
      { label: 'Delivered',           loc: 'Frankfurt, Germany', date: 'Pending',             done: false },
    ],
  },
  {
    id: 'SF-449021',
    origin: 'Shenzhen',
    destination: 'Tokyo, Japan',
    buyerCountry: 'Japan',
    carrier: 'SF Express',
    buyer: 'Osaka Electronics',
    stages: [
      { label: 'Package Received',    loc: 'Futian, SZ',         date: 'Apr 28, 2026 09:10', done: true },
      { label: 'Local Transit',       loc: 'Shenzhen → HK',      date: 'Apr 29, 2026 16:45', done: true },
      { label: 'Customs Clearance',   loc: 'Hong Kong Intl.',    date: 'Apr 30, 2026 10:20', done: true },
      { label: 'International Transit', loc: 'HK → NRT',          date: 'May 1, 2026 22:00',  done: true },
      { label: 'Japan Transit',       loc: 'Tokyo',              date: 'May 3, 2026 07:30',  done: true },
      { label: 'Delivered',           loc: 'Tokyo, Japan',       date: 'May 3, 2026 14:15',  done: true },
    ],
  },
  {
    id: 'FWD-221983',
    origin: 'Shenzhen',
    destination: 'Los Angeles, USA',
    buyerCountry: 'USA',
    carrier: 'FWD',
    buyer: 'MakerSpace Labs',
    stages: [
      { label: 'Package Received',    loc: 'Longhua, SZ',        date: 'May 6, 2026 11:00',  done: true },
      { label: 'Local Transit',       loc: 'Shenzhen',           date: 'May 7, 2026 09:30',  done: true },
      { label: 'Customs Clearance',   loc: 'Shenzhen Intl.',     date: 'May 8, 2026 15:45',  done: false, current: true },
      { label: 'International Transit', loc: 'SZ → LAX',          date: 'Pending',             done: false },
      { label: 'USA Transit',         loc: 'Los Angeles',        date: 'Pending',             done: false },
      { label: 'Delivered',           loc: 'Los Angeles, USA',   date: 'Pending',             done: false },
    ],
  },
];

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Badge({ children, color = C.bright, size = 'sm' }) {
  return (
    <span style={{
      background: `${color}22`, color, border: `1px solid ${color}44`,
      borderRadius: 4, padding: size === 'sm' ? '2px 7px' : '4px 10px',
      fontSize: size === 'sm' ? 11 : 12, fontWeight: 600, whiteSpace: 'nowrap',
      letterSpacing: '0.03em',
    }}>
      {children}
    </span>
  );
}

function Stars({ n }) {
  return <span style={{ color: C.warning, letterSpacing: 1 }}>{'★'.repeat(n)}{'☆'.repeat(5 - n)}</span>;
}

function Divider() {
  return <div style={{ borderBottom: `1px solid ${C.border}` }} />;
}

function Btn({ children, onClick, variant = 'primary', icon, style: sx = {}, fullWidth }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
    cursor: 'pointer', border: 'none', transition: 'all 0.15s',
    width: fullWidth ? '100%' : undefined,
  };
  const styles = {
    primary: { background: C.teal, color: C.text, ...glow },
    outline:  { background: 'transparent', color: C.bright, border: `1px solid ${C.bright}` },
    ghost:    { background: 'transparent', color: C.muted, border: `1px solid ${C.border}` },
    danger:   { background: C.danger, color: '#fff' },
  };
  return (
    <button onClick={onClick} style={{ ...base, ...styles[variant], ...sx }}>
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
}

function Card({ children, style: sx = {}, onClick, className }) {
  return (
    <div onClick={onClick} className={className}
      style={{ ...card, padding: 20, ...sx }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      {icon && <span style={{ color: C.bright, display: 'flex' }}>{icon}</span>}
      <span style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>{children}</span>
      {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', label: 'Dashboard',  Icon: LayoutDashboard },
  { id: 'sourcing',  label: 'Sourcing',   Icon: Search          },
  { id: 'buyers',    label: 'Buyers',     Icon: Users           },
  { id: 'logistics', label: 'Logistics',  Icon: Truck           },
  { id: 'data',      label: 'Data',       Icon: Database        },
  { id: 'settings',  label: 'Settings',   Icon: Settings        },
];

function Sidebar({ active, onNav, collapsed }) {
  return (
    <aside style={{
      width: collapsed ? 58 : 220, flexShrink: 0,
      background: C.surface, borderRight: `1px solid ${C.border}`,
      display: 'flex', flexDirection: 'column',
      transition: 'width 0.25s ease', overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '18px 0' : '18px 16px',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 8, borderBottom: `1px solid ${C.border}`, marginBottom: 8,
      }}>
        {collapsed
          ? <span style={{ color: C.bright, fontWeight: 900, fontSize: 17 }}>L</span>
          : <>
              <span style={{ color: C.text, fontWeight: 900, fontSize: 19, letterSpacing: '0.1em' }}>LOGXUS</span>
              <span style={{
                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                background: C.bright, boxShadow: `0 0 8px ${C.bright}`,
              }} />
            </>
        }
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '0 6px' }}>
        {NAV.map(({ id, label, Icon }) => {
          const active_ = active === id;
          return (
            <button key={id} onClick={() => onNav(id)} title={collapsed ? label : undefined}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: 10, padding: collapsed ? '11px 0' : '11px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 7, marginBottom: 2, cursor: 'pointer',
                border: 'none', borderLeft: active_ ? `3px solid ${C.bright}` : '3px solid transparent',
                background: active_ ? `${C.teal}28` : 'transparent',
                color: active_ ? C.bright : C.muted,
                fontWeight: active_ ? 600 : 400, fontSize: 13,
                transition: 'all 0.18s',
              }}>
              <Icon size={17} />
              {!collapsed && label}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div style={{ padding: '10px 16px 16px', color: C.muted, fontSize: 10, letterSpacing: '0.06em' }}>
          v2.4.1 · GBA EDITION
        </div>
      )}
    </aside>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
const PAGE_TITLE = {
  dashboard: 'Dashboard',   sourcing:  'Supplier Sourcing',
  buyers:    'Buyer Discovery', logistics: 'Logistics Coordination',
  data:      'Data & Reports',  settings:  'Settings',
};

function Navbar({ page }) {
  return (
    <header style={{
      height: 58, background: C.surface, borderBottom: `1px solid ${C.border}`,
      display: 'flex', alignItems: 'center', padding: '0 22px', gap: 14, flexShrink: 0,
    }}>
      <h1 style={{ color: C.text, fontSize: 17, fontWeight: 700, whiteSpace: 'nowrap' }}>
        {PAGE_TITLE[page] || 'Logxus'}
      </h1>

      <div style={{ flex: 1, maxWidth: 360, position: 'relative', marginLeft: 12 }}>
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
        <input placeholder="Search suppliers, buyers, shipments…"
          style={{
            width: '100%', background: C.bg, border: `1px solid ${C.border}`,
            borderRadius: 7, padding: '7px 10px 7px 30px',
            color: C.text, fontSize: 12, outline: 'none',
          }} />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={19} style={{ color: C.muted }} />
          <span style={{
            position: 'absolute', top: -4, right: -4, background: C.danger,
            color: '#fff', borderRadius: '50%', width: 15, height: 15,
            fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>3</span>
        </div>
        <div style={{
          width: 33, height: 33, borderRadius: '50%',
          background: `linear-gradient(135deg, ${C.teal}, ${C.bright})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', flexShrink: 0,
        }}>EL</div>
      </div>
    </header>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function KpiCard({ Icon, label, value, trend, up }) {
  return (
    <Card style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ color: C.muted, fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
            {label}
          </div>
          <div style={{ color: C.text, fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{value}</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            marginTop: 10, fontSize: 12, fontWeight: 600,
            color: up ? C.success : C.danger,
          }}>
            {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {trend}
          </div>
        </div>
        <div style={{
          width: 42, height: 42, borderRadius: 10,
          background: `${C.teal}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: C.bright, flexShrink: 0,
        }}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

function DashboardView({ onNav }) {
  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <KpiCard Icon={Search} label="Active Sourcing Requests" value="12" trend="+3 this week" up />
        <KpiCard Icon={Users}  label="Open Buyer Leads"         value="47" trend="+8 this week" up />
        <KpiCard Icon={Truck}  label="Pending Shipments"        value="6"  trend="-1 this week" up={false} />
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        {/* Activity feed */}
        <Card style={{ flex: '1 1 300px', minWidth: 0 }}>
          <SectionTitle icon={<TrendingUp size={16} />}>Recent Activity</SectionTitle>
          {ACTIVITY.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: i < ACTIVITY.length - 1 ? 16 : 0, position: 'relative' }}>
              {i < ACTIVITY.length - 1 && (
                <div style={{ position: 'absolute', left: 7, top: 16, bottom: 0, width: 2, background: C.border }} />
              )}
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: a.dot, flexShrink: 0, marginTop: 2, boxShadow: `0 0 8px ${a.dot}88` }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' }}>
                  <Badge color={a.dot}>{a.tag}</Badge>
                  <span style={{ color: C.muted, fontSize: 11 }}>{a.time}</span>
                </div>
                <div style={{ color: C.text, fontSize: 13 }}>{a.text}</div>
              </div>
            </div>
          ))}
        </Card>

      </div>

      {/* Chart */}
      <Card>
        <SectionTitle icon={<TrendingUp size={16} />} right={<Badge>Last 8 Weeks</Badge>}>
          Sourcing Requests Over Time
        </SectionTitle>
        <ResponsiveContainer width="100%" height={170}>
          <AreaChart data={CHART_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
            <defs>
              <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.bright} stopOpacity={0.28} />
                <stop offset="95%" stopColor={C.bright} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="week" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }}
              labelStyle={{ color: C.muted }}
              cursor={{ stroke: C.border, strokeWidth: 1 }}
            />
            <Area type="monotone" dataKey="requests" stroke={C.bright} strokeWidth={2} fill="url(#tg)" dot={{ fill: C.bright, r: 3, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Buyers & Suppliers with Shipment Processes */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Users size={15} style={{ color: C.bright }} />
          <span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>Buyers & Suppliers</span>
          <Badge>{BUYERS.length + SUPPLIERS.length} partners</Badge>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
            <thead>
              <tr style={{ background: `${C.bg}99` }}>
                {['Type', 'Name', 'Location', 'Shipment Route', 'Carrier', 'Transit', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: C.muted, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BUYERS.map((b, i) => {
                const route = (() => {
                  if (b.flag === '🇩🇪') return { route: 'HK → Frankfurt', carrier: 'DHL Express', transit: '3–5 days', status: 'Active' };
                  if (b.flag === '🇺🇸' && b.name.includes('MakerSpace')) return { route: 'Shenzhen → Los Angeles', carrier: 'FWD', transit: '12–16 days', status: 'In Transit' };
                  if (b.flag === '🇺🇸') return { route: 'HK → San Francisco', carrier: 'SF Express', transit: '5–7 days', status: 'Active' };
                  if (b.flag === '🇸🇪') return { route: 'HK → Stockholm', carrier: 'DHL Express', transit: '3–5 days', status: 'Active' };
                  if (b.flag === '🇯🇵') return { route: 'HK → Tokyo', carrier: 'SF Express', transit: '3–5 days', status: 'Delivered' };
                  if (b.flag === '🇬🇧') return { route: 'HK → London', carrier: 'Air Freight', transit: '2–3 days', status: 'Active' };
                  return { route: '—', carrier: '—', transit: '—', status: 'Pending' };
                })();
                const statusColor = route.status === 'Delivered' ? C.success : route.status === 'In Transit' ? C.warning : route.status === 'Active' ? C.bright : C.muted;
                return (
                  <tr key={`b-${i}`} style={{ borderBottom: `1px solid ${C.border}`, transition: 'all 0.15s' }}>
                    <td style={{ padding: '11px 16px' }}><Badge color="#60A5FA">Buyer</Badge></td>
                    <td style={{ padding: '11px 16px', color: C.text, fontWeight: 600, fontSize: 13 }}>{b.flag} {b.name}</td>
                    <td style={{ padding: '11px 16px', color: C.muted, fontSize: 12 }}>{b.contact}</td>
                    <td style={{ padding: '11px 16px', color: C.text, fontSize: 12, fontFamily: 'monospace' }}>{route.route}</td>
                    <td style={{ padding: '11px 16px', color: C.muted, fontSize: 12 }}>{route.carrier}</td>
                    <td style={{ padding: '11px 16px', color: C.muted, fontSize: 12 }}>{route.transit}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ color: statusColor, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />{route.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {SUPPLIERS.map((s, i) => {
                const route = (() => {
                  if (s.loc.includes('SZ') || s.loc.includes('Shenzhen')) return { route: 'Shenzhen → Global', carrier: 'Multi-carrier', transit: '7–30 days', status: 'Active' };
                  if (s.loc.includes('Guangzhou')) return { route: 'Guangzhou → Global', carrier: 'Multi-carrier', transit: '10–30 days', status: 'Active' };
                  if (s.loc.includes('HK')) return { route: 'HK → Global', carrier: 'Multi-carrier', transit: '3–30 days', status: 'Active' };
                  return { route: '—', carrier: '—', transit: '—', status: 'Pending' };
                })();
                return (
                  <tr key={`s-${i}`} style={{ borderBottom: `1px solid ${C.border}`, transition: 'all 0.15s' }}>
                    <td style={{ padding: '11px 16px' }}><Badge color={C.success}>Supplier</Badge></td>
                    <td style={{ padding: '11px 16px', color: C.text, fontWeight: 600, fontSize: 13 }}>{s.name}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.muted, fontSize: 12 }}>
                        <MapPin size={11} />{s.loc}
                      </div>
                    </td>
                    <td style={{ padding: '11px 16px', color: C.text, fontSize: 12, fontFamily: 'monospace' }}>{route.route}</td>
                    <td style={{ padding: '11px 16px', color: C.muted, fontSize: 12 }}>{route.carrier}</td>
                    <td style={{ padding: '11px 16px', color: C.muted, fontSize: 12 }}>{route.transit}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ color: C.bright, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.bright, display: 'inline-block' }} />{route.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Sourcing ─────────────────────────────────────────────────────────────────
function AnimatedPct({ target }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0;
    const tick = () => {
      cur = Math.min(cur + 3, target);
      setVal(cur);
      if (cur < target) setTimeout(tick, 14);
    };
    const id = setTimeout(tick, 300);
    return () => clearTimeout(id);
  }, [target]);
  return <>{val}%</>;
}

function RfqModal({ onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }}>
      <div style={{ background: C.surface, borderRadius: 12, width: '100%', maxWidth: 640, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>Bilingual RFQ Preview</div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>Auto-generated · EN | ZH · RFQ-2026-0134</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex' }}>
            <X size={19} />
          </button>
        </div>
        <div style={{ padding: 22 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { flag: '🇬🇧', lang: 'English', lines: [
                ['Request for Quotation', true],
                ['Date: May 10, 2026', false],
                ['Ref: RFQ-2026-0134', false],
                ['', false],
                ['Product: 4-Layer FR4 PCB', true],
                ['Qty: 5,000 units', false],
                ['Spec: 1.6 mm, HASL finish', false],
                ['Deadline: June 15, 2026', false],
                ['Terms: Net 30 · FOB Shenzhen', false],
              ]},
              { flag: '🇨🇳', lang: '中文', lines: [
                ['询价单', true],
                ['日期：2026年5月10日', false],
                ['编号：RFQ-2026-0134', false],
                ['', false],
                ['产品：四层FR4印刷电路板', true],
                ['数量：5,000 件', false],
                ['规格：1.6mm，HASL工艺', false],
                ['截止：2026年6月15日', false],
                ['条款：净30天 · FOB深圳', false],
              ]},
            ].map(col => (
              <div key={col.flag} style={{ background: C.bg, borderRadius: 8, padding: 16 }}>
                <div style={{ color: C.bright, fontWeight: 700, fontSize: 12, marginBottom: 10 }}>{col.flag} {col.lang}</div>
                {col.lines.map(([txt, bold], i) => (
                  <div key={i} style={{ color: txt ? (bold ? C.text : C.muted) : 'transparent', fontWeight: bold ? 700 : 400, fontSize: 12, lineHeight: '1.8', minHeight: 21 }}>
                    {txt || ' '}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" icon={<Download size={14} />} sx={{ fontSize: 12 }}>Download PDF</Btn>
            <Btn variant="primary" icon={<Send size={14} />} style={{ ...glow, fontSize: 12 }}>Send via Email</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupplierRow({ s }) {
  const [hover, setHover] = useState(false);
  const pctColor = s.match >= 90 ? C.success : s.match >= 80 ? C.bright : C.warning;
  return (
    <tr onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        borderBottom: `1px solid ${C.border}`, transition: 'all 0.15s',
        background: hover ? `${C.teal}12` : 'transparent',
        borderLeft: hover ? `3px solid ${C.bright}` : '3px solid transparent',
      }}>
      <td style={{ padding: '12px 16px', color: C.text, fontWeight: 600, fontSize: 13 }}>{s.name}</td>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: C.muted, fontSize: 12 }}>
          <MapPin size={11} />{s.loc}
        </div>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 54, height: 5, borderRadius: 3, background: C.border, overflow: 'hidden' }}>
            <div style={{ width: `${s.match}%`, height: '100%', background: pctColor, borderRadius: 3 }} />
          </div>
          <span style={{ color: C.text, fontWeight: 700, fontSize: 13, minWidth: 36 }}>
            <AnimatedPct target={s.match} />
          </span>
        </div>
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13 }}><Stars n={s.stars} /></td>
      <td style={{ padding: '12px 16px', color: C.muted, fontSize: 13 }}>{s.lead}</td>
      <td style={{ padding: '12px 16px', color: C.text, fontSize: 13 }}>{s.price}</td>
      <td style={{ padding: '12px 16px' }}>
        <Btn variant="outline" style={{ padding: '5px 12px', fontSize: 11 }}>View RFQ</Btn>
      </td>
    </tr>
  );
}

function SourcingView() {
  const [uploaded, setUploaded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showRfq, setShowRfq] = useState(false);

  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Drop zone */}
      <Card
        style={{
          border: `2px dashed ${dragging ? C.bright : C.border}`,
          background: dragging ? `${C.teal}14` : C.surface,
          textAlign: 'center', padding: '36px 20px', cursor: 'pointer', transition: 'all 0.2s',
        }}
        onClick={() => setUploaded(true)}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); setUploaded(true); }}
      >
        <Upload size={38} style={{ color: dragging ? C.bright : C.muted, marginBottom: 12, transition: 'all 0.2s' }} />
        <div style={{ color: C.text, fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
          Drag & drop PCB, CAD, BOM, or CNC files
        </div>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 14 }}>
          Supports .gbr · .dxf · .xlsx · .step · .iges &nbsp;—&nbsp; max 50 MB
        </div>
        <Badge color={C.bright}>Click to browse or drop files</Badge>
      </Card>

      {/* AI Analysis */}
      {uploaded && (
        <Card style={{ border: `1px solid ${C.teal}55` }} className="fade-in">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Zap size={15} style={{ color: C.bright }} />
            <span style={{ color: C.text, fontWeight: 700 }}>AI Analysis</span>
            <Badge color={C.success}>Complete</Badge>
            <span style={{ marginLeft: 'auto', color: C.muted, fontSize: 11 }}>BOM_v3.xlsx · 2.4 MB · Processed in 3.2s</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { label: 'DETECTED PROCESS',       content: <span style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>PCB Manufacturing — 4-layer FR4</span> },
              { label: 'DESIGN FLAGS',            content: <span style={{ color: C.warning, fontWeight: 600, fontSize: 13 }}>⚠ 2 silkscreen warnings, 1 drill advisory</span> },
              { label: 'RECOMMENDED CATEGORIES', content: <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{['PCB Fab','SMT Assembly','Quality Testing'].map(t=><Badge key={t}>{t}</Badge>)}</div> },
            ].map(({ label, content }) => (
              <div key={label} style={{ background: C.bg, borderRadius: 8, padding: 14 }}>
                <div style={{ color: C.muted, fontSize: 10, letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
                {content}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Supplier table */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>Supplier Matches</span>
          <Badge>{SUPPLIERS.length} results</Badge>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <Btn variant="ghost" icon={<Filter size={12} />} style={{ padding: '5px 11px', fontSize: 11 }}>Filter</Btn>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
            <thead>
              <tr style={{ background: `${C.bg}99` }}>
                {['Supplier Name','Location','Match %','Reliability','Lead Time','Price Range',''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: C.muted, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUPPLIERS.map((s, i) => <SupplierRow key={i} s={s} />)}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn variant="primary" onClick={() => setShowRfq(true)} icon={<FileText size={15} />} style={{ padding: '11px 24px', fontSize: 14, ...glow }}>
          Generate RFQ Package
        </Btn>
      </div>

      {showRfq && <RfqModal onClose={() => setShowRfq(false)} />}
    </div>
  );
}

// ─── Buyers ───────────────────────────────────────────────────────────────────
function BuyerCard({ b, selected, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={() => onClick(b)}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        background: selected ? `${C.teal}28` : hover ? C.surfaceHi : C.bg,
        border: `1px solid ${selected ? C.teal : hover ? `${C.bright}55` : C.border}`,
        borderRadius: 8, padding: 13, cursor: 'pointer', marginBottom: 8, transition: 'all 0.18s',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
        <div style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{b.flag} {b.name}</div>
        <Badge color={b.fit >= 88 ? C.success : b.fit >= 78 ? C.bright : C.warning} size="sm">
          {b.fit}%
        </Badge>
      </div>
      <div style={{ color: C.muted, fontSize: 11, marginBottom: 8 }}>{b.interest}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: C.muted, fontSize: 10 }}>Last: {b.lastContact}</span>
        <span style={{ color: C.bright, fontSize: 11, fontWeight: 500 }}>Details →</span>
      </div>
    </div>
  );
}

function BuyerDrawer({ b, onClose }) {
  const [notes, setNotes] = useState('Interested in Q3 samples. Budget ~$50k. Decision maker confirmed.');
  const initials = b.contact.split(' ').map(n => n[0]).join('');

  return (
    <div style={{
      position: 'fixed', right: 0, top: 0, bottom: 0, width: 360,
      background: C.surface, borderLeft: `1px solid ${C.border}`,
      zIndex: 400, display: 'flex', flexDirection: 'column',
      boxShadow: '-12px 0 40px rgba(0,0,0,0.45)', overflowY: 'auto',
    }} className="fade-in">
      {/* Header */}
      <div style={{ padding: '18px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 17 }}>{b.flag} {b.name}</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
            <Badge color={b.fit >= 88 ? C.success : C.bright} size="sm">{b.fit}% fit</Badge>
            <Badge color={C.muted} size="sm">{b.interest}</Badge>
            <Badge color={C.teal} size="sm">{b.stage}</Badge>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex', marginTop: 2 }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Fit score bar */}
        <div style={{ background: C.bg, borderRadius: 8, padding: 14 }}>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: '0.06em', marginBottom: 10 }}>FIT SCORE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 8, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${b.fit}%`, height: '100%', background: `linear-gradient(90deg, ${C.teal}, ${C.bright})`, borderRadius: 4, transition: 'width 0.8s ease' }} />
            </div>
            <span style={{ color: C.text, fontWeight: 800, fontSize: 20, minWidth: 46 }}>{b.fit}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            {['Product Fit','Market Fit','Budget Fit','Timeline'].map((l, i) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ color: C.muted, fontSize: 9, letterSpacing: '0.04em' }}>{l}</div>
                <div style={{ color: C.bright, fontSize: 11, fontWeight: 700, marginTop: 2 }}>
                  {[b.fit - 3, b.fit + 2, b.fit - 6, b.fit - 1][i]}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div style={{ background: C.bg, borderRadius: 8, padding: 14 }}>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: '0.06em', marginBottom: 10 }}>CONTACT</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${C.teal}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.bright, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
              {initials}
            </div>
            <span style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{b.contact}</span>
          </div>
          {[
            { Icon: Mail,  val: b.email },
            { Icon: Phone, val: b.phone },
          ].map(({ Icon, val }) => (
            <div key={val} style={{ display: 'flex', alignItems: 'center', gap: 7, color: C.muted, fontSize: 12, marginBottom: 5 }}>
              <Icon size={11} />{val}
            </div>
          ))}
        </div>

        {/* Activity */}
        <div>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: '0.06em', marginBottom: 10 }}>ACTIVITY LOG</div>
          {[
            { date: 'May 8, 2026',  text: 'Initial email sent with product catalog' },
            { date: 'May 5, 2026',  text: 'LinkedIn connection accepted' },
            { date: 'Apr 28, 2026', text: 'Lead identified via AI discovery engine' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.bright, marginTop: 5, flexShrink: 0 }} />
              <div>
                <div style={{ color: C.text, fontSize: 12, lineHeight: 1.5 }}>{a.text}</div>
                <div style={{ color: C.muted, fontSize: 10, marginTop: 2 }}>{a.date}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div>
          <div style={{ color: C.muted, fontSize: 10, letterSpacing: '0.06em', marginBottom: 8 }}>NOTES</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            style={{
              width: '100%', background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: 10, color: C.text, fontSize: 12,
              resize: 'vertical', minHeight: 76, outline: 'none',
              lineHeight: 1.6, boxSizing: 'border-box',
            }} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Btn variant="ghost"   icon={<Plus size={13} />}        fullWidth>Add Note</Btn>
          <Btn variant="ghost"   icon={<Calendar size={13} />}    fullWidth>Schedule Follow-up</Btn>
          <Btn variant="primary" icon={<ChevronRight size={13} />} fullWidth style={glow}>Move to Next Stage</Btn>
        </div>
      </div>
    </div>
  );
}

function BuyersView() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted }} />
        <input placeholder="Describe your product or target market to find matching buyers…"
          style={{
            width: '100%', background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: '11px 130px 11px 36px', color: C.text, fontSize: 13, outline: 'none',
          }} />
        <Btn variant="primary" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', padding: '6px 16px', fontSize: 12, ...glow }}>
          AI Match
        </Btn>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {[
          { label: 'Total Leads', val: '47', color: C.bright },
          { label: 'Avg Fit Score', val: '81%', color: C.success },
          { label: 'This Week', val: '+8', color: C.warning },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: s.color, fontWeight: 700, fontSize: 18 }}>{s.val}</span>
            <span style={{ color: C.muted, fontSize: 12 }}>{s.label}</span>
            <div style={{ width: 1, height: 16, background: C.border, marginLeft: 8 }} />
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {KANBAN_COLS.map(col => {
          const colBuyers = BUYERS.filter(b => b.stage === col);
          const colColor = { Identified: C.muted, Contacted: C.warning, Engaged: C.bright, Relationship: C.success }[col];
          return (
            <div key={col}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: colColor }} />
                <span style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{col}</span>
                <span style={{ background: `${colColor}22`, color: colColor, borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
                  {colBuyers.length}
                </span>
              </div>
              <div style={{ background: `${C.bg}99`, borderRadius: 8, padding: 8, minHeight: 180, border: `1px solid ${C.border}` }}>
                {colBuyers.map(b => (
                  <BuyerCard key={b.id} b={b} selected={selected?.id === b.id} onClick={setSelected} />
                ))}
                {colBuyers.length === 0 && (
                  <div style={{ color: C.muted, fontSize: 12, textAlign: 'center', paddingTop: 28, lineHeight: 1.6 }}>
                    No buyers<br />in this stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected && <BuyerDrawer b={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ─── Logistics ────────────────────────────────────────────────────────────────
function LogisticsView() {
  const [quotesLoaded, setQuotesLoaded] = useState(false);
  const [currency, setCurrency] = useState('HKD');
  const [cargoType, setCargoType] = useState('Parcel');
  const [urgency, setUrgency] = useState('Standard');
  const [dest, setDest] = useState('Los Angeles, USA');
  const [weight, setWeight] = useState('2.5');

  return (
    <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Quote form */}
      <Card>
        <SectionTitle icon={<Globe size={16} />}>Get Shipping Quotes</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ color: C.muted, fontSize: 10, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>FROM</label>
            <select style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none' }}>
              <option>Hong Kong</option>
              <option>Shenzhen</option>
              <option>Guangzhou</option>
            </select>
          </div>
          <div>
            <label style={{ color: C.muted, fontSize: 10, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>TO</label>
            <input value={dest} onChange={e => setDest(e.target.value)}
              style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ color: C.muted, fontSize: 10, letterSpacing: '0.06em', display: 'block', marginBottom: 8 }}>CARGO TYPE</label>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {['Parcel', 'Air Freight', 'Ocean FCL', 'Ocean LCL'].map(t => (
              <button key={t} onClick={() => setCargoType(t)} style={{
                padding: '7px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                background: cargoType === t ? C.teal : 'transparent',
                color: cargoType === t ? '#fff' : C.muted,
                border: `1px solid ${cargoType === t ? C.teal : C.border}`, transition: 'all 0.15s',
              }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 180px', gap: 14, marginBottom: 18 }}>
          <div>
            <label style={{ color: C.muted, fontSize: 10, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>WEIGHT (KG)</label>
            <input value={weight} onChange={e => setWeight(e.target.value)}
              style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ color: C.muted, fontSize: 10, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>DIMENSIONS (CM)</label>
            <input defaultValue="30 × 20 × 15"
              style={{ width: '100%', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 7, padding: '9px 12px', color: C.text, fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ color: C.muted, fontSize: 10, letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>URGENCY</label>
            <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: 7, overflow: 'hidden' }}>
              {['Standard', 'Express'].map(u => (
                <button key={u} onClick={() => setUrgency(u)} style={{
                  flex: 1, padding: '9px 0', cursor: 'pointer', fontSize: 12, fontWeight: 500, border: 'none',
                  background: urgency === u ? C.teal : 'transparent',
                  color: urgency === u ? '#fff' : C.muted, transition: 'all 0.15s',
                }}>{u}</button>
              ))}
            </div>
          </div>
        </div>

        <Btn variant="primary" onClick={() => setQuotesLoaded(true)} icon={<ChevronRight size={15} />} style={{ ...glow, padding: '10px 22px', fontSize: 13 }}>
          Get Quotes
        </Btn>
      </Card>

      {/* Results */}
      {quotesLoaded && (
        <Card style={{ padding: 0, overflow: 'hidden' }} className="fade-in">
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>Available Quotes</span>
              <Badge color={C.success}>4 options</Badge>
            </div>
            <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
              {['HKD', 'USD'].map(c => (
                <button key={c} onClick={() => setCurrency(c)} style={{
                  padding: '5px 13px', fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none',
                  background: currency === c ? C.teal : 'transparent',
                  color: currency === c ? '#fff' : C.muted, transition: 'all 0.15s',
                }}>{c}</button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 580 }}>
              <thead>
                <tr style={{ background: `${C.bg}99` }}>
                  {['Carrier', 'Service', 'Transit', 'Price', 'CO₂ Est.', ''].map(h => (
                    <th key={h} style={{ padding: '9px 16px', textAlign: 'left', color: C.muted, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {QUOTES.map((q, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ background: q.col, color: '#fff', borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {q.carrier}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', color: C.text, fontSize: 13 }}>{q.service}</td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.muted, fontSize: 12 }}>
                        <Clock size={11} />{q.transit}
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ color: C.text, fontWeight: 800, fontSize: 16 }}>
                        {currency === 'HKD' ? `$${q.hkd}` : `$${q.usd}`}
                      </span>
                      <span style={{ color: C.muted, fontSize: 11, marginLeft: 4 }}>{currency}</span>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.success, fontSize: 12 }}>
                        <Leaf size={11} />{q.co2} CO₂
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <Btn variant="primary" style={{ padding: '6px 16px', fontSize: 11, ...glow }}>Book Now</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Active shipments — FedEx-style tracking */}
      <Card>
        <SectionTitle icon={<Package size={16} />}>Active Shipments</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {SHIPMENTS.map((s, i) => {
            const allDone = s.stages.every(st => st.done);
            const inProgress = s.stages.find(st => st.current);
            const currentIdx = s.stages.findIndex(st => st.current);
            const progressPct = allDone ? 100 : currentIdx >= 0 ? Math.round((currentIdx / (s.stages.length - 1)) * 100) : 0;
            return (
              <div key={i}>
                {/* Shipment header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  flexWrap: 'wrap', gap: 8, marginBottom: 14,
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ color: C.text, fontWeight: 700, fontSize: 14, fontFamily: 'monospace' }}>{s.id}</span>
                      <Badge color={allDone ? C.success : C.bright}>{s.carrier}</Badge>
                      {inProgress && <Badge color={C.warning}>In Progress</Badge>}
                      {allDone && <Badge color={C.success}>Delivered</Badge>}
                    </div>
                    <div style={{ color: C.muted, fontSize: 11, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span>{s.origin}</span>
                      <span style={{ color: C.bright }}>→</span>
                      <span>{s.destination}</span>
                      <span style={{ margin: '0 4px', color: C.border }}>|</span>
                      <Users size={11} style={{ color: C.muted }} />
                      <span>{s.buyer}</span>
                    </div>
                  </div>
                  {/* Progress ring */}
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%',
                    background: `conic-gradient(${allDone ? C.success : C.bright} ${progressPct}%, ${C.border} ${progressPct}%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', background: C.surface,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ color: allDone ? C.success : C.bright, fontWeight: 800, fontSize: 12 }}>
                        {progressPct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tracking timeline */}
                <div style={{ paddingLeft: 4 }}>
                  {s.stages.map((st, j) => {
                    const isLast = j === s.stages.length - 1;
                    const dotColor = st.done ? C.success : st.current ? C.bright : C.border;
                    const textColor = st.done ? C.text : st.current ? C.bright : C.muted;
                    const dotShadow = st.current ? `0 0 10px ${C.bright}` : st.done ? `0 0 6px ${C.success}88` : 'none';
                    return (
                      <div key={j} style={{ display: 'flex', gap: 10, minHeight: isLast ? 0 : 42 }}>
                        {/* Left rail */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                          <div style={{
                            width: st.current ? 14 : 10,
                            height: st.current ? 14 : 10,
                            borderRadius: '50%',
                            background: dotColor,
                            boxShadow: dotShadow,
                            border: st.current ? `3px solid ${C.bright}44` : st.done ? `2px solid ${C.success}44` : `2px solid ${C.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.3s',
                            zIndex: 1,
                            animation: st.current ? 'countUp 1.8s ease-in-out infinite' : 'none',
                          }}>
                            {st.done && <span style={{ color: '#fff', fontSize: 7 }}>✓</span>}
                          </div>
                          {!isLast && (
                            <div style={{
                              width: 2, flex: 1, minHeight: 8,
                              background: st.done ? C.success : C.border,
                              margin: '3px 0',
                            }} />
                          )}
                        </div>
                        {/* Content */}
                        <div style={{
                          paddingBottom: isLast ? 0 : 12,
                          flex: 1, minWidth: 0,
                        }}>
                          <div style={{
                            color: textColor, fontWeight: st.current ? 700 : st.done ? 600 : 400,
                            fontSize: 13, marginBottom: 2, transition: 'color 0.3s',
                          }}>
                            {st.label}
                          </div>
                          <div style={{ color: st.done || st.current ? C.muted : C.border, fontSize: 11 }}>
                            {st.loc} {st.date !== 'Pending' && <span>— {st.date}</span>}
                            {st.date === 'Pending' && <span style={{ color: C.border, fontStyle: 'italic' }}>— Awaiting update</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {i < SHIPMENTS.length - 1 && <Divider />}
                {i < SHIPMENTS.length - 1 && <div style={{ height: 8 }} />}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ─── Placeholder ──────────────────────────────────────────────────────────────
function ComingSoon({ label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
      <Database size={48} style={{ color: C.border }} />
      <div style={{ color: C.muted, fontSize: 15 }}>{label} — Coming soon</div>
      <div style={{ color: C.muted, fontSize: 12 }}>This section is under active development.</div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const check = () => setCollapsed(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const navigate = (p) => {
    setVisible(false);
    setTimeout(() => { setPage(p); setVisible(true); }, 140);
  };

  const view = {
    dashboard: <DashboardView onNav={navigate} />,
    sourcing:  <SourcingView />,
    buyers:    <BuyersView />,
    logistics: <LogisticsView />,
    data:      <ComingSoon label="Data & Reports" />,
    settings:  <ComingSoon label="Settings" />,
  }[page];

  return (
    <div style={{
      display: 'flex', height: '100vh', background: C.bg,
      color: C.text, fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden',
    }}>
      <Sidebar active={page} onNav={navigate} collapsed={collapsed} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <Navbar page={page} />
        <main style={{
          flex: 1, overflowY: 'auto',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.14s ease',
        }}>
          {view}
        </main>
      </div>
    </div>
  );
}
