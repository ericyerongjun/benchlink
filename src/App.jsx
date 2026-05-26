import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from './hooks/useTheme.js';
import {
  LayoutDashboard, Search, Users, Truck, Database, Settings,
  Bell, Upload, X, ArrowUp, ArrowDown, Package, Clock,
  ChevronRight, Filter, Plus, MapPin, Mail, Phone, FileText,
  TrendingUp, Send, Download, Calendar, Leaf, Zap, Globe,
  Sun, Moon,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:        'var(--c-bg)',
  surface:   'var(--c-surface)',
  surfaceHi: 'var(--c-surface-hi)',
  teal:      'var(--c-teal)',
  bright:    'var(--c-bright)',
  text:      'var(--c-text)',
  muted:     'var(--c-muted)',
  success:   'var(--c-success)',
  warning:   'var(--c-warning)',
  danger:    'var(--c-danger)',
  border:    'var(--c-border)',
};
const glow  = { boxShadow: 'var(--s-card)' };
const card  = {
  background: 'var(--c-surface)',
  borderRadius: 'var(--r-lg)',
  border: '1px solid var(--c-border)',
};

// ─── Static data ──────────────────────────────────────────────────────────────
const CHART_DATA = [
  { week: 'Wk 1', requests: 4 },  { week: 'Wk 2', requests: 6 },
  { week: 'Wk 3', requests: 5 },  { week: 'Wk 4', requests: 9 },
  { week: 'Wk 5', requests: 7 },  { week: 'Wk 6', requests: 11 },
  { week: 'Wk 7', requests: 10 }, { week: 'Wk 8', requests: 12 },
];

const SUPPLIERS = [
  { name: 'Shenzhen PCB Co.',   loc: 'Nanshan, SZ',   country: 'China', state: 'Guangdong', city: 'Shenzhen', match: 94, stars: 5, leadDays: 7,  lead: '7 days',  priceLow: 0.80, priceHigh: 1.20, price: '$0.80–$1.20/unit', components: ['FR4 PCB', 'Multilayer PCB', 'HASL Finish'] },
  { name: 'GBA Circuit Works',  loc: 'Futian, SZ',    country: 'China', state: 'Guangdong', city: 'Shenzhen', match: 88, stars: 4, leadDays: 10, lead: '10 days', priceLow: 0.65, priceHigh: 0.95, price: '$0.65–$0.95/unit', components: ['SMT Assembly', 'PCB Fab', 'ENIG Finish'] },
  { name: 'Dragon Electronics', loc: 'Longhua, SZ',   country: 'China', state: 'Guangdong', city: 'Shenzhen', match: 82, stars: 4, leadDays: 14, lead: '14 days', priceLow: 0.55, priceHigh: 0.80, price: '$0.55–$0.80/unit', components: ['FR4 PCB', 'HASL Finish', 'Wave Soldering'] },
  { name: 'Pearl River Fab',    loc: 'Guangzhou',     country: 'China', state: 'Guangdong', city: 'Guangzhou', match: 79, stars: 3, leadDays: 12, lead: '12 days', priceLow: 0.45, priceHigh: 0.70, price: '$0.45–$0.70/unit', components: ['PCB Fab', 'CNC Machining', 'Aluminum PCB'] },
  { name: 'HK Precision Mfg',  loc: 'Kwun Tong, HK',  country: 'China', state: 'Hong Kong', city: 'Hong Kong', match: 75, stars: 4, leadDays: 8,  lead: '8 days',  priceLow: 1.10, priceHigh: 1.60, price: '$1.10–$1.60/unit', components: ['Precision PCB', 'ENIG Finish', 'Rigid-Flex'] },
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
  { dot: C.border,  tag:'Sourcing',  text:'RFQ package generated for BOM_v3.xlsx',              time:'Yesterday' },
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
    <span
      className={`lx-badge${size === 'lg' ? ' lx-badge--lg' : ''}`}
      style={{ background: `color-mix(in srgb, ${color} var(--badge-pct), transparent)`, color }}
    >
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
  return (
    <button
      onClick={onClick}
      className={`lx-btn lx-btn--${variant}${fullWidth ? ' lx-btn--full' : ''}`}
      style={sx}
    >
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
}

function Card({ children, style: sx = {}, onClick, className }) {
  return (
    <div onClick={onClick} className={`lx-card${className ? ' ' + className : ''}`} style={sx}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, children, right }) {
  return (
    <div className="lx-section-title">
      {icon && <span className="lx-section-title__icon">{icon}</span>}
      <span className="lx-section-title__text">{children}</span>
      {right && <div className="lx-section-title__right">{right}</div>}
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

function Sidebar({ active, onNav, collapsed, theme }) {
  return (
    <aside className={`lx-sidebar ${collapsed ? 'lx-sidebar--collapsed' : 'lx-sidebar--expanded'}`}>
      {/* Logo */}
      <div className="lx-sidebar__logo">
        {collapsed
          ? <span className="lx-sidebar__logo-text" style={{ color: C.bright, fontSize: 17 }}>L</span>
          : <>
              <span className="lx-sidebar__logo-text">BENCHLINK</span>
              <span className="lx-sidebar__logo-dot" />
            </>
        }
      </div>

      {/* Nav */}
      <nav className="lx-sidebar__nav">
        {NAV.map(({ id, label, Icon }) => {
          const active_ = active === id;
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              title={collapsed ? label : undefined}
              className={`lx-sidebar__nav-item${active_ ? ' lx-sidebar__nav-item--active' : ''}`}
            >
              <Icon size={17} />
              {!collapsed && label}
            </button>
          );
        })}
      </nav>

      {/* Theme toggle */}
      <button
        className="lx-sidebar__theme-toggle"
        onClick={theme.toggle}
        title={collapsed ? (theme.effective === 'dark' ? 'Dark Mode' : 'Light Mode') : undefined}
      >
        {theme.effective === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        {!collapsed && (theme.effective === 'dark' ? 'Dark Mode' : 'Light Mode')}
      </button>

      {!collapsed && (
        <div className="lx-sidebar__footer">
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
    <header className="lx-navbar">
      <h1 className="lx-navbar__title">
        {PAGE_TITLE[page] || 'Benchlink'}
      </h1>

      <div className="lx-navbar__search-wrap">
        <Search size={14} className="lx-navbar__search-icon" />
        <input className="lx-navbar__search-input" placeholder="Search suppliers, buyers, shipments…" />
      </div>

      <div className="lx-navbar__actions">
        <div className="lx-navbar__bell">
          <Bell size={19} />
          <span className="lx-navbar__bell-badge">3</span>
        </div>
        <div className="lx-navbar__avatar">EL</div>
      </div>
    </header>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function KpiCard({ Icon, label, value, trend, up }) {
  return (
    <Card style={{ flex: 1, minWidth: 0 }}>
      <div className="lx-kpi__row">
        <div>
          <div className="lx-kpi__label">{label}</div>
          <div className="lx-kpi__value">{value}</div>
          <div className={`lx-kpi__trend ${up ? 'lx-kpi__trend--up' : 'lx-kpi__trend--down'}`}>
            {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
            {trend}
          </div>
        </div>
        <div className="lx-kpi__icon">
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

function DashboardView({ onNav }) {
  return (
    <div className="lx-dashboard">
      {/* KPIs */}
      <div className="lx-dashboard__kpi-row">
        <KpiCard Icon={Search} label="Active Sourcing Requests" value="12" trend="+3 this week" up />
        <KpiCard Icon={Users}  label="Open Buyer Leads"         value="47" trend="+8 this week" up />
        <KpiCard Icon={Truck}  label="Pending Shipments"        value="6"  trend="-1 this week" up={false} />
      </div>

      <div className="lx-dashboard__row">
        {/* Activity feed */}
        <Card style={{ flex: '1 1 300px', minWidth: 0 }}>
          <SectionTitle icon={<TrendingUp size={16} />}>Recent Activity</SectionTitle>
          {ACTIVITY.map((a, i) => (
            <div key={i} className="lx-activity__item">
              {i < ACTIVITY.length - 1 && <div className="lx-activity__line" />}
              <div className="lx-activity__dot" style={{ background: a.dot }} />
              <div className="lx-activity__body">
                <div className="lx-activity__header">
                  <Badge color={a.dot}>{a.tag}</Badge>
                  <span className="lx-activity__time">{a.time}</span>
                </div>
                <div className="lx-activity__text">{a.text}</div>
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
                <stop offset="5%"  stopColor={C.bright} stopOpacity={0.18} />
                <stop offset="95%" stopColor={C.bright} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="week" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: 12, color: 'var(--c-text)', fontSize: 12, boxShadow: 'var(--s-tooltip)' }}
              labelStyle={{ color: 'var(--c-muted)' }}
              cursor={{ stroke: 'var(--c-border)', strokeWidth: 1 }}
            />
            <Area type="monotone" dataKey="requests" stroke={C.bright} strokeWidth={2.5} fill="url(#tg)" dot={{ fill: C.bright, r: 3, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Buyers & Suppliers with Shipment Processes */}
      <Card className="lx-table-card">
        <div className="lx-table-card__header">
          <Users size={15} style={{ color: C.bright }} />
          <span className="lx-table-card__title">Buyers & Suppliers</span>
          <Badge>{BUYERS.length + SUPPLIERS.length} partners</Badge>
        </div>
        <div className="lx-table-card__scroll">
          <table className="lx-table">
            <thead>
              <tr className="lx-table__head">
                {['Type', 'Name', 'Location', 'Shipment Route', 'Carrier', 'Transit', 'Status'].map(h => (
                  <th key={h} className="lx-table__th">{h}</th>
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
                  <tr key={`b-${i}`} className="lx-table__row">
                    <td className="lx-table__td"><Badge color="#60A5FA">Buyer</Badge></td>
                    <td className="lx-table__td--name">{b.flag} {b.name}</td>
                    <td className="lx-table__td">{b.contact}</td>
                    <td className="lx-table__td--route">{route.route}</td>
                    <td className="lx-table__td">{route.carrier}</td>
                    <td className="lx-table__td">{route.transit}</td>
                    <td className="lx-table__td">
                      <span className="lx-table__status" style={{ color: statusColor }}>
                        <span className="lx-table__status-dot" style={{ background: statusColor }} />{route.status}
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
                  <tr key={`s-${i}`} className="lx-table__row">
                    <td className="lx-table__td"><Badge color={C.success}>Supplier</Badge></td>
                    <td className="lx-table__td--name">{s.name}</td>
                    <td className="lx-table__td">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={11} />{s.loc}
                      </div>
                    </td>
                    <td className="lx-table__td--route">{route.route}</td>
                    <td className="lx-table__td">{route.carrier}</td>
                    <td className="lx-table__td">{route.transit}</td>
                    <td className="lx-table__td">
                      <span className="lx-table__status" style={{ color: C.bright }}>
                        <span className="lx-table__status-dot" style={{ background: C.bright }} />{route.status}
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
    <div className="lx-modal">
      <div className="lx-modal__box">
        <div className="lx-modal__header">
          <div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 16 }}>Bilingual RFQ Preview</div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>Auto-generated · EN | ZH · RFQ-2026-0134</div>
          </div>
          <button onClick={onClose} className="lx-drawer__close-btn">
            <X size={19} />
          </button>
        </div>
        <div className="lx-modal__body">
          <div className="lx-modal__grid">
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
              <div key={col.flag} className="lx-modal__col">
                <div className="lx-modal__col-title">{col.flag} {col.lang}</div>
                {col.lines.map(([txt, bold], i) => (
                  <div key={i} className={`lx-modal__col-line ${txt ? (bold ? 'lx-modal__col-line--bold' : 'lx-modal__col-line--muted') : ''}`} style={!txt ? { color: 'transparent' } : {}}>
                    {txt || ' '}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="lx-modal__actions">
            <Btn variant="ghost" icon={<Download size={14} />} style={{ fontSize: 12 }}>Download PDF</Btn>
            <Btn variant="primary" icon={<Send size={14} />} style={{ fontSize: 12 }}>Send via Email</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function SupplierRow({ s }) {
  const pctColor = s.match >= 90 ? C.success : s.match >= 80 ? C.bright : C.warning;
  return (
    <tr className="lx-supplier-row">
      <td className="lx-table__td">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {s.components.map(c => (
            <Badge key={c} color={C.teal} size="sm">{c}</Badge>
          ))}
        </div>
      </td>
      <td className="lx-table__td--name">{s.name}</td>
      <td className="lx-table__td">
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={11} />{s.loc}
        </div>
      </td>
      <td className="lx-table__td">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="lx-match-bar">
            <div style={{ width: `${s.match}%`, height: '100%', background: pctColor, borderRadius: 3 }} />
          </div>
          <span style={{ color: C.text, fontWeight: 700, fontSize: 13, minWidth: 36 }}>
            <AnimatedPct target={s.match} />
          </span>
        </div>
      </td>
      <td className="lx-table__td"><Stars n={s.stars} /></td>
      <td className="lx-table__td">{s.lead}</td>
      <td className="lx-table__td" style={{ color: C.text }}>{s.price}</td>
      <td className="lx-table__td">
        <Btn variant="outline" style={{ padding: '5px 12px', fontSize: 11 }}>View RFQ</Btn>
      </td>
    </tr>
  );
}

// ─── Agentic AI keyword → component mapping ──────────────────────────────────

function SourcingView() {
  const [uploaded, setUploaded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showRfq, setShowRfq] = useState(false);

  // Chat + API state
  const [sessionId, setSessionId] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [aiThinking, setAiThinking] = useState(false);
  const [detectedComponents, setDetectedComponents] = useState([]);

  // Location filter state (hierarchical)
  const [locCountry, setLocCountry] = useState('');
  const [locState, setLocState] = useState('');
  const [locCity, setLocCity] = useState('');
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Component filter state
  const [filterComponent, setFilterComponent] = useState(null);
  const [accumulatedComponents, setAccumulatedComponents] = useState([]);

  // Sort state
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  // API-fetched suppliers (null = use fallback static data)
  const [apiSuppliers, setApiSuppliers] = useState(null);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  const chatEndRef = useRef(null);

  // API base URL
  const API = '/api/v1';

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiThinking]);

  // Load countries on mount
  useEffect(() => {
    fetch(API + '/locations/countries')
      .then(r => r.json())
      .then(d => { if (d.success) setCountries(d.data); });
  }, []);

  // Load accumulated components on mount
  useEffect(() => {
    fetch(API + '/sourcing/components')
      .then(r => r.json())
      .then(d => { if (d.success) setAccumulatedComponents(d.data); });
  }, []);

  // When country changes, load states
  useEffect(() => {
    if (!locCountry) { setStates([]); setLocState(''); return; }
    fetch(API + '/locations/' + encodeURIComponent(locCountry) + '/states')
      .then(r => r.json())
      .then(d => { if (d.success) setStates(d.data); });
  }, [locCountry]);

  // When state changes, load cities
  useEffect(() => {
    if (!locCountry || !locState) { setCities([]); setLocCity(''); return; }
    fetch(API + '/locations/' + encodeURIComponent(locCountry) + '/' + encodeURIComponent(locState) + '/cities')
      .then(r => r.json())
      .then(d => { if (d.success) setCities(d.data); });
  }, [locCountry, locState]);

  // Fetch suppliers from backend when filters change
  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (filterComponent) params.set('component', filterComponent);
    if (locCountry) params.set('country', locCountry);
    if (locState) params.set('state', locState);
    if (locCity) params.set('city', locCity);
    if (sortKey) {
      const sortMap = { match: 'match', stars: 'stars', leadDays: 'lead_days', priceLow: 'price_low' };
      params.set('sort_by', sortMap[sortKey] || sortKey);
      params.set('sort_dir', sortDir);
    }
    params.set('per_page', '50');

    setSuppliersLoading(true);
    fetch(API + '/suppliers?' + params.toString())
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        if (d.success) {
          const mapped = d.data.map(s => ({
            name: s.name,
            loc: s.location,
            country: s.country,
            state: s.state,
            city: s.city,
            match: s.match_score,
            stars: s.stars,
            leadDays: s.lead_days,
            lead: s.lead_label,
            priceLow: s.price_low,
            priceHigh: s.price_high,
            price: s.price_label,
            components: s.components || [],
          }));
          setApiSuppliers(mapped);
        }
      })
      .catch(() => { if (!cancelled) setApiSuppliers(null); })
      .finally(() => { if (!cancelled) setSuppliersLoading(false); });

    return () => { cancelled = true; };
  }, [filterComponent, locCountry, locState, locCity, sortKey, sortDir]);

  // Supplier list: use API data when available, fall back to static filtering
  const processedSuppliers = useMemo(() => {
    if (apiSuppliers !== null) return apiSuppliers;
    let list = [...SUPPLIERS];
    if (filterComponent) {
      list = list.filter(s => s.components.some(c => c === filterComponent));
    }
    if (locCity) {
      list = list.filter(s => s.city === locCity);
    } else if (locState) {
      list = list.filter(s => s.state === locState);
    } else if (locCountry) {
      list = list.filter(s => s.country === locCountry);
    }
    if (sortKey) {
      list.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    return list;
  }, [apiSuppliers, filterComponent, locCountry, locState, locCity, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortDir === 'asc') { setSortDir('desc'); }
      else if (sortDir === 'desc') { setSortKey(null); setSortDir('asc'); }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortIndicator = (key) => {
    if (sortKey !== key) return <span style={{ color: C.border, fontSize: 10, marginLeft: 2 }}>↕</span>;
    return <span style={{ color: C.bright, fontSize: 10, marginLeft: 2 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  // Chat: call real backend agentic AI
  const handleChatSubmit = async (e) => {
    e?.preventDefault();
    const q = chatInput.trim();
    if (!q) return;

    const userMsg = { role: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setAiThinking(true);

    try {
      // Create session if needed
      let sid = sessionId;
      if (!sid) {
        const res = await fetch(API + '/sourcing/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const d = await res.json();
        if (d.success) { sid = d.data.id; setSessionId(sid); }
      }

      // Send message to agent
      const res = await fetch(API + '/sourcing/sessions/' + sid + '/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: q }),
      });
      const d = await res.json();

      if (!d.success) throw new Error(d.error?.message || 'API error');

      const components = d.data.components || [];
      const componentNames = components.map(c => c.name);

      // Update accumulated components from server
      const accRes = await fetch(API + '/sourcing/components');
      const accData = await accRes.json();
      if (accData.success) setAccumulatedComponents(accData.data);

      // Parse markdown content for display
      const contentText = d.data.content;

      const aiMsg = {
        role: 'ai',
        text: contentText,
        components: componentNames,
      };
      setMessages(prev => [...prev, aiMsg]);
      setDetectedComponents(prev => {
        const existing = new Set(prev.map(n => n.toLowerCase()));
        const merged = [...prev];
        componentNames.forEach(n => {
          if (!existing.has(n.toLowerCase())) {
            merged.push(n);
            existing.add(n.toLowerCase());
          }
        });
        return merged;
      });
      setUploaded(true);
    } catch (err) {
      const errorMsg = {
        role: 'ai',
        text: 'Error connecting to AI agent. Please ensure the backend is running and your DeepSeek API key is configured.',
        components: [],
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setAiThinking(false);
    }
  };

  const handleFilterToggle = (type, value) => {
    if (type === 'component') {
      setFilterComponent(prev => prev === value ? null : value);
    }
  };

  const clearFilters = () => {
    setFilterComponent(null);
    setLocCountry(''); setLocState(''); setLocCity('');
    setSortKey(null);
    setSortDir('asc');
    setApiSuppliers(null);
  };

  const hasActiveFilters = filterComponent || locCountry || sortKey;

  // Simple markdown renderer for bullet points
  const renderContent = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Bold bullet: - **Name**: explanation
      const bulletMatch = line.match(/^-\s*\*\*(.+?)\*\*\s*:\s*(.+)/);
      if (bulletMatch) {
        const name = bulletMatch[1].trim();
        const explanation = bulletMatch[2].trim();
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4, paddingLeft: 4 }}>
            <span style={{ color: C.bright, fontSize: 14, flexShrink: 0 }}>•</span>
            <button
              onClick={() => handleFilterToggle('component', name)}
              style={{
                background: 'none', border: 'none', color: filterComponent === name ? C.bright : C.teal,
                fontWeight: 700, cursor: 'pointer', fontSize: 13, padding: 0, textAlign: 'left',
              }}
            >
              {name}
            </button>
            <span style={{ color: C.muted, fontSize: 12 }}>— {explanation}</span>
          </div>
        );
      }
      // Regular bullet: - text
      if (line.match(/^[-•]\s/)) {
        return (
          <div key={i} style={{ color: C.text, fontSize: 13, paddingLeft: 12, marginBottom: 6, lineHeight: 1.6 }}>
            {line}
          </div>
        );
      }
      // Bold heading: **text**
      const boldMatch = line.match(/^\*\*(.+?)\*\*$/);
      if (boldMatch) {
        return <div key={i} style={{ color: C.text, fontWeight: 700, fontSize: 13, marginTop: 10, marginBottom: 6 }}>{boldMatch[1]}</div>;
      }
      // Empty line
      if (!line.trim()) return <div key={i} style={{ height: 6 }} />;
      // Regular text
      return <div key={i} style={{ color: C.text, fontSize: 13, lineHeight: 1.6, marginBottom: 2 }}>{line}</div>;
    });
  };

  return (
    <div className="lx-sourcing">
      {/* ── Agentic AI Chatbox ── */}
      <Card className="lx-chatbox">
        <div className="lx-chatbox__header">
          <Zap size={15} style={{ color: C.bright }} />
          <span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>Agentic AI Sourcing</span>
          <Badge color={C.success}>Online</Badge>
          {sessionId && <span style={{ color: C.muted, fontSize: 10, marginLeft: 'auto' }}>Session active</span>}
        </div>

        {/* Messages area */}
        <div className="lx-chatbox__messages">
          {messages.length === 0 && !aiThinking && (
            <div className="lx-chatbox__empty">
              <Zap size={22} style={{ color: C.muted, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
              Describe your product requirements and our agentic AI will analyze components<br />
              and match the best suppliers from the database.<br />
              <span style={{ color: C.bright }}>Try: "I need to build a laptop docking station for Mac"</span>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 12 }} className="fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{
                  background: m.role === 'user' ? C.teal : C.bright,
                  color: '#fff', borderRadius: 4, padding: '1px 7px', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                }}>
                  {m.role === 'user' ? 'YOU' : 'AI'}
                </span>
                <span style={{ color: C.muted, fontSize: 10 }}>
                  {m.role === 'user' ? 'Just now' : 'Analysis complete'}
                </span>
              </div>
              <div style={{ color: C.text, fontSize: 13, lineHeight: 1.6 }}>
                {m.role === 'ai' ? renderContent(m.text) : m.text}
              </div>
              {m.components && m.components.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                  {m.components.map(c => (
                    <button key={c}
                      onClick={() => handleFilterToggle('component', c)}
                      className={`lx-filter-chip${filterComponent === c ? ' lx-filter-chip--active' : ''}`}
                      style={filterComponent === c ? undefined : { color: C.bright }}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {aiThinking && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 12 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', background: C.bright,
                animation: 'countUp 0.6s ease-in-out infinite',
              }} />
              Agentic AI analyzing your requirements...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat input */}
        <form onSubmit={handleChatSubmit} className="lx-chatbox__input-row">
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Describe your product or paste BOM requirements..."
            className="lx-chatbox__input"
            disabled={aiThinking}
          />
          <Btn variant="primary" onClick={handleChatSubmit} icon={<Send size={14} />}
            style={{ padding: '9px 16px', fontSize: 12, flexShrink: 0 }} disabled={aiThinking}>
            Analyze
          </Btn>
        </form>
      </Card>

      {/* ── Drop zone (secondary) ── */}
      <Card
        className={`lx-dropzone${dragging ? ' lx-dropzone--active' : ''}`}
        onClick={() => setUploaded(true)}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); setUploaded(true); }}
      >
        <div className="lx-dropzone__inner">
          <Upload size={16} style={{ color: dragging ? C.bright : C.muted }} />
          Drop PCB, CAD, BOM, or CNC files here &nbsp;—&nbsp; .gbr · .dxf · .xlsx · .step · .iges
        </div>
      </Card>

      {/* ── AI Analysis panel ── */}
      {uploaded && detectedComponents.length > 0 && (
        <Card className="lx-ai-panel fade-in">
          <div className="lx-ai-panel__header">
            <Zap size={15} style={{ color: C.bright }} />
            <span style={{ color: C.text, fontWeight: 700 }}>AI Component Analysis</span>
            <Badge color={C.success}>Complete</Badge>
            <span style={{ marginLeft: 'auto', color: C.muted, fontSize: 11 }}>
              {detectedComponents.length} components detected · Matched {processedSuppliers.length} suppliers
            </span>
          </div>
          <div className="lx-ai-panel__grid">
            {[
              { label: 'DETECTED COMPONENTS', content: <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxHeight: 80, overflowY: 'auto' }}>{detectedComponents.map(c => <Badge key={c} color={C.bright} size="sm">{c}</Badge>)}</div> },
              { label: 'MANUFACTURING HUBS', content: <span style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>GBA / Global · {detectedComponents.length} component types analyzed</span> },
              { label: 'SESSION STATUS', content: <span style={{ color: C.success, fontWeight: 600, fontSize: 13 }}>✓ Active · {processedSuppliers.length} suppliers matched</span> },
            ].map(({ label, content }) => (
              <div key={label} className="lx-ai-panel__cell">
                <div className="lx-ai-panel__cell-label">{label}</div>
                {content}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Filter / Sort bar ── */}
      <Card className="lx-filter-bar">
        <div className="lx-filter-bar__row">
          {/* Component filter — from AI analysis */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="lx-filter-bar__label">Filter by Component (AI detected)</div>
            <div className="lx-filter-bar__chips" style={{ maxHeight: 120, overflowY: 'auto' }}>
              {accumulatedComponents.length === 0 && (
                <span style={{ color: C.muted, fontSize: 11, fontStyle: 'italic' }}>Components will appear after AI analysis</span>
              )}
              {accumulatedComponents.map(c => (
                <button key={c} onClick={() => handleFilterToggle('component', c)}
                  className={`lx-filter-chip${filterComponent === c ? ' lx-filter-chip--active' : ''}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Location filter — hierarchical dropdowns */}
          <div style={{ minWidth: 280 }}>
            <div className="lx-filter-bar__label">Filter by Location</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <select
                value={locCountry}
                onChange={e => { setLocCountry(e.target.value); setLocState(''); setLocCity(''); }}
                className="lx-location-select">
                <option value="">Country</option>
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {locCountry && states.length > 0 && (
                <select
                  value={locState}
                  onChange={e => { setLocState(e.target.value); setLocCity(''); }}
                  className="lx-location-select">
                  <option value="">State / Province</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
              {locState && cities.length > 0 && (
                <select
                  value={locCity}
                  onChange={e => setLocCity(e.target.value)}
                  className="lx-location-select">
                  <option value="">City</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button onClick={clearFilters}
              style={{
                background: 'transparent', border: `1px solid ${C.danger}44`, color: C.danger,
                borderRadius: 5, padding: '5px 10px', fontSize: 11, fontWeight: 600,
                cursor: 'pointer', marginTop: 16, display: 'flex', alignItems: 'center', gap: 4,
              }}>
              <X size={12} /> Clear all
            </button>
          )}
        </div>
      </Card>

      {/* ── Supplier table ── */}
      <Card className="lx-table-card">
        <div className="lx-table-card__header">
          <span className="lx-table-card__title">Supplier Matches</span>
          <Badge>{processedSuppliers.length} results</Badge>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
            {sortKey && (
              <span style={{ color: C.muted, fontSize: 10, letterSpacing: '0.04em' }}>
                Sorted by {sortKey === 'match' ? 'Match %' : sortKey === 'stars' ? 'Reliability' : sortKey === 'leadDays' ? 'Lead Time' : 'Price'}
                {' '}({sortDir === 'asc' ? 'ascending' : 'descending'})
              </span>
            )}
          </div>
        </div>
        <div className="lx-table-card__scroll">
          <table className="lx-table lx-sourcing-table">
            <thead>
              <tr className="lx-table__head">
                {[
                  { label: 'Component',     key: null },
                  { label: 'Supplier Name', key: null },
                  { label: 'Location',      key: null },
                  { label: 'Match %',       key: 'match' },
                  { label: 'Reliability',   key: 'stars' },
                  { label: 'Lead Time',     key: 'leadDays' },
                  { label: 'Price Range',   key: 'priceLow' },
                  { label: '',              key: null },
                ].map(({ label, key }) => (
                  <th key={label}
                    onClick={key ? () => handleSort(key) : undefined}
                    className={`lx-table__th${key ? ' lx-table__th--sortable' : ''}`}>
                    {label}{key && sortIndicator(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedSuppliers.length > 0 ? (
                processedSuppliers.map((s, i) => <SupplierRow key={i} s={s} />)
              ) : (
                <tr>
                  <td colSpan={8} className="lx-table__empty">
                    No suppliers match the current filters.
                    <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: C.bright, cursor: 'pointer', fontWeight: 600, marginLeft: 4, fontSize: 13 }}>
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Btn variant="outline" onClick={() => setShowRfq(true)}
          icon={<FileText size={14} />}
          style={{ fontSize: 12 }}>
          Generate RFQ Package
        </Btn>
      </div>
      {showRfq && <RfqModal onClose={() => setShowRfq(false)} />}
    </div>
  );
}


// ─── Buyers ───────────────────────────────────────────────────────────────────
function BuyerCard({ b, selected, onClick }) {
  return (
    <div onClick={() => onClick(b)}
      className={`lx-buyer-card${selected ? ' lx-buyer-card--selected' : ''}`}
    >
      <div className="lx-buyer-card__top">
        <div className="lx-buyer-card__name">{b.flag} {b.name}</div>
        <Badge color={b.fit >= 88 ? C.success : b.fit >= 78 ? C.bright : C.warning} size="sm">
          {b.fit}%
        </Badge>
      </div>
      <div className="lx-buyer-card__interest">{b.interest}</div>
      <div className="lx-buyer-card__bottom">
        <span className="lx-buyer-card__last-contact">Last: {b.lastContact}</span>
        <span className="lx-buyer-card__cta">Details →</span>
      </div>
    </div>
  );
}

function BuyerDrawer({ b, onClose }) {
  const [notes, setNotes] = useState('Interested in Q3 samples. Budget ~$50k. Decision maker confirmed.');
  const initials = b.contact.split(' ').map(n => n[0]).join('');

  return (
    <div className="lx-drawer fade-in">
      {/* Header */}
      <div className="lx-drawer__header">
        <div>
          <div className="lx-drawer__name">{b.flag} {b.name}</div>
          <div className="lx-drawer__badges">
            <Badge color={b.fit >= 88 ? C.success : C.bright} size="sm">{b.fit}% fit</Badge>
            <Badge color={C.muted} size="sm">{b.interest}</Badge>
            <Badge color={C.teal} size="sm">{b.stage}</Badge>
          </div>
        </div>
        <button onClick={onClose} className="lx-drawer__close-btn">
          <X size={18} />
        </button>
      </div>

      <div className="lx-drawer__body">
        {/* Fit score bar */}
        <div className="lx-drawer__section">
          <div className="lx-drawer__section-label">FIT SCORE</div>
          <div className="lx-drawer__fit-bar">
            <div className="lx-drawer__fit-track">
              <div className="lx-drawer__fit-fill" style={{ width: `${b.fit}%` }} />
            </div>
            <span className="lx-drawer__fit-value">{b.fit}%</span>
          </div>
          <div className="lx-drawer__fit-grid">
            {['Product Fit','Market Fit','Budget Fit','Timeline'].map((l, i) => (
              <div key={l} className="lx-drawer__fit-cell">
                <div className="lx-drawer__fit-cell-label">{l}</div>
                <div className="lx-drawer__fit-cell-value">
                  {[b.fit - 3, b.fit + 2, b.fit - 6, b.fit - 1][i]}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="lx-drawer__section">
          <div className="lx-drawer__section-label">CONTACT</div>
          <div className="lx-drawer__contact-row">
            <div className="lx-drawer__contact-avatar">{initials}</div>
            <span className="lx-drawer__contact-name">{b.contact}</span>
          </div>
          {[
            { Icon: Mail,  val: b.email },
            { Icon: Phone, val: b.phone },
          ].map(({ Icon, val }) => (
            <div key={val} className="lx-drawer__contact-info">
              <Icon size={11} />{val}
            </div>
          ))}
        </div>

        {/* Activity */}
        <div>
          <div className="lx-drawer__section-label">ACTIVITY LOG</div>
          {[
            { date: 'May 8, 2026',  text: 'Initial email sent with product catalog' },
            { date: 'May 5, 2026',  text: 'LinkedIn connection accepted' },
            { date: 'Apr 28, 2026', text: 'Lead identified via AI discovery engine' },
          ].map((a, i) => (
            <div key={i} className="lx-drawer__activity-item">
              <div className="lx-drawer__activity-dot" />
              <div>
                <div className="lx-drawer__activity-text">{a.text}</div>
                <div className="lx-drawer__activity-date">{a.date}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div>
          <div className="lx-drawer__section-label">NOTES</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="lx-drawer__notes" />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Btn variant="ghost"   icon={<Plus size={13} />}        fullWidth>Add Note</Btn>
          <Btn variant="ghost"   icon={<Calendar size={13} />}    fullWidth>Schedule Follow-up</Btn>
          <Btn variant="primary" icon={<ChevronRight size={13} />} fullWidth>Move to Next Stage</Btn>
        </div>
      </div>
    </div>
  );
}

function BuyersView() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="lx-buyers">
      {/* Search */}
      <div className="lx-buyers__search-wrap">
        <Search size={15} className="lx-buyers__search-icon" />
        <input className="lx-buyers__search-input" placeholder="Describe your product or target market to find matching buyers…" />
        <Btn variant="primary" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', padding: '6px 16px', fontSize: 12 }}>AI Match</Btn>
      </div>

      {/* Stats bar */}
      <div className="lx-buyers__stats">
        {[
          { label: 'Total Leads', val: '47', color: C.bright },
          { label: 'Avg Fit Score', val: '81%', color: C.success },
          { label: 'This Week', val: '+8', color: C.warning },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="lx-buyers__stat-value" style={{ color: s.color }}>{s.val}</span>
            <span className="lx-buyers__stat-label">{s.label}</span>
            <div className="lx-buyers__stat-divider" />
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="lx-kanban">
        {KANBAN_COLS.map(col => {
          const colBuyers = BUYERS.filter(b => b.stage === col);
          const colColor = { Identified: C.muted, Contacted: C.warning, Engaged: C.bright, Relationship: C.success }[col];
          return (
            <div key={col}>
              <div className="lx-kanban__col-header">
                <div className="lx-kanban__col-dot" style={{ background: colColor }} />
                <span className="lx-kanban__col-label">{col}</span>
                <span className="lx-kanban__col-count" style={{ background: `${colColor}22`, color: colColor }}>
                  {colBuyers.length}
                </span>
              </div>
              <div className="lx-kanban__col-body">
                {colBuyers.map(b => (
                  <BuyerCard key={b.id} b={b} selected={selected?.id === b.id} onClick={setSelected} />
                ))}
                {colBuyers.length === 0 && (
                  <div className="lx-kanban__col-empty">
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
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState('HKD');
  const [cargoType, setCargoType] = useState('parcel');
  const [urgency, setUrgency] = useState('standard');
  const [origin, setOrigin] = useState('Shenzhen');
  const [dest, setDest] = useState('Frankfurt');
  const [weight, setWeight] = useState('10');
  const [lengthCm, setLengthCm] = useState('30');
  const [widthCm, setWidthCm] = useState('20');
  const [heightCm, setHeightCm] = useState('15');
  const [quantity, setQuantity] = useState('1');
  const [quotes, setQuotes] = useState([]);

  const API = '/api/v1';

  const handleGetQuotes = async () => {
    setLoading(true);
    setQuotesLoaded(false);
    try {
      const res = await fetch(API + '/logistics/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: origin,
          destination: dest,
          cargo_type: 'Electronics',
          weight_kg: parseFloat(weight) || 0,
          length_cm: parseFloat(lengthCm) || 0,
          width_cm: parseFloat(widthCm) || 0,
          height_cm: parseFloat(heightCm) || 0,
          quantity: parseInt(quantity) || 1,
          urgency: urgency,
        }),
      });
      const d = await res.json();
      if (d.success) {
        setQuotes(d.data);
      }
    } catch (err) {
      console.error('Failed to get quotes:', err);
    } finally {
      setLoading(false);
      setQuotesLoaded(true);
    }
  };

  const categoryLabels = { parcel: 'Parcel/Express', air_freight: 'Air Freight', ocean: 'Ocean Freight', forwarder: 'Forwarder' };
  const categoryColors = { parcel: '#E74C3C', air_freight: '#3498DB', ocean: '#2ECC71', forwarder: '#F39C12' };

  return (
    <div className="lx-logistics">
      <Card>
        <SectionTitle icon={<Globe size={16} />}>Get Shipping Quotes</SectionTitle>
        <div className="lx-quote-form__fields">
          <div>
            <label className="lx-quote-form__label">FROM</label>
            <select value={origin} onChange={e => setOrigin(e.target.value)} className="lx-quote-form__input">
              <option>Shenzhen</option>
              <option>Guangzhou</option>
              <option>Hong Kong</option>
              <option>Dongguan</option>
              <option>Huizhou</option>
            </select>
          </div>
          <div>
            <label className="lx-quote-form__label">TO</label>
            <input value={dest} onChange={e => setDest(e.target.value)} placeholder="Frankfurt" className="lx-quote-form__input" />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="lx-quote-form__label">CARRIER TYPE</label>
          <div className="lx-quote-form__chips">
            {Object.entries(categoryLabels).map(([k, v]) => (
              <button key={k} onClick={() => setCargoType(k)}
                className={`lx-quote-form__chip${cargoType === k ? ' lx-quote-form__chip--active' : ''}`}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="lx-quote-form__row">
          <div>
            <label className="lx-quote-form__label">WEIGHT (KG)</label>
            <input value={weight} onChange={e => setWeight(e.target.value)} className="lx-quote-form__input" type="number" min="0" />
          </div>
          <div>
            <label className="lx-quote-form__label">QTY</label>
            <input value={quantity} onChange={e => setQuantity(e.target.value)} className="lx-quote-form__input" type="number" min="1" style={{ width: 60 }} />
          </div>
          <div>
            <label className="lx-quote-form__label">L x W x H (CM)</label>
            <div style={{ display: 'flex', gap: 4 }}>
              <input value={lengthCm} onChange={e => setLengthCm(e.target.value)} placeholder="L" className="lx-quote-form__input" type="number" min="0" style={{ width: 55 }} />
              <span style={{ color: C.muted, fontSize: 11, alignSelf: 'center' }}>x</span>
              <input value={widthCm} onChange={e => setWidthCm(e.target.value)} placeholder="W" className="lx-quote-form__input" type="number" min="0" style={{ width: 55 }} />
              <span style={{ color: C.muted, fontSize: 11, alignSelf: 'center' }}>x</span>
              <input value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="H" className="lx-quote-form__input" type="number" min="0" style={{ width: 55 }} />
            </div>
          </div>
          <div>
            <label className="lx-quote-form__label">URGENCY</label>
            <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: 7, overflow: 'hidden' }}>
              {['standard', 'express', 'economy'].map(u => (
                <button key={u} onClick={() => setUrgency(u)} style={{
                  flex: 1, padding: '9px 0', cursor: 'pointer', fontSize: 12, fontWeight: 500, border: 'none',
                  background: urgency === u ? C.teal : 'transparent',
                  color: urgency === u ? '#fff' : C.muted, transition: 'all 0.15s', textTransform: 'capitalize',
                }}>{u}</button>
              ))}
            </div>
          </div>
        </div>

        <Btn variant="primary" onClick={handleGetQuotes} icon={<ChevronRight size={15} />} style={{ padding: '10px 22px', fontSize: 13 }} disabled={loading}>
          {loading ? 'Calculating...' : 'Get Quotes'}
        </Btn>
      </Card>

      {quotesLoaded && (
        <Card className="lx-table-card fade-in">
          <div className="lx-table-card__header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="lx-table-card__title">Available Quotes</span>
              <Badge color={C.success}>{quotes.length} options</Badge>
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
          <div className="lx-table-card__scroll">
            <table className="lx-table lx-quote-table">
              <thead>
                <tr className="lx-table__head">
                  {['Carrier', 'Type', 'Country', 'Transit', 'Price', 'CO2 Est.', ''].map(h => (
                    <th key={h} className="lx-table__th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quotes.length === 0 && (
                  <tr><td colSpan={7} className="lx-table__empty">No quotes available for this route. Try a different origin/destination.</td></tr>
                )}
                {quotes.map((q, i) => (
                  <tr key={i} className="lx-table__row">
                    <td className="lx-table__td">
                      <span className="lx-quote-carrier" style={{ background: categoryColors[q.category] || C.teal, color: '#fff' }}>
                        {q.carrier.length > 28 ? q.carrier.slice(0, 25) + '...' : q.carrier}
                      </span>
                    </td>
                    <td className="lx-table__td" style={{ color: C.text, fontSize: 11 }}>
                      {categoryLabels[q.category] || q.category}
                    </td>
                    <td className="lx-table__td" style={{ color: C.muted, fontSize: 11 }}>{q.country}</td>
                    <td className="lx-table__td">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={11} />{q.transit}
                      </div>
                    </td>
                    <td className="lx-table__td">
                      <span style={{ color: C.text, fontWeight: 800, fontSize: 16 }}>
                        {currency === 'HKD' ? `$${q.price_hkd}` : `$${q.price_usd}`}
                      </span>
                      <span style={{ color: C.muted, fontSize: 11, marginLeft: 4 }}>{currency}</span>
                    </td>
                    <td className="lx-table__td">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.success }}>
                        <Leaf size={11} />{q.co2_kg} CO2
                      </div>
                    </td>
                    <td className="lx-table__td">
                      <Btn variant="primary" style={{ padding: '6px 16px', fontSize: 11 }}>Book</Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <SectionTitle icon={<Package size={16} />}>Active Shipments</SectionTitle>
        <div className="lx-shipments">
          {SHIPMENTS.map((s, i) => {
            const allDone = s.stages.every(st => st.done);
            const inProgress = s.stages.find(st => st.current);
            const currentIdx = s.stages.findIndex(st => st.current);
            const progressPct = allDone ? 100 : currentIdx >= 0 ? Math.round((currentIdx / (s.stages.length - 1)) * 100) : 0;
            return (
              <div key={i}>
                <div className="lx-shipment__header">
                  <div className="lx-shipment__info">
                    <div className="lx-shipment__id-row">
                      <span className="lx-shipment__id">{s.id}</span>
                      <Badge color={allDone ? C.success : C.bright}>{s.carrier}</Badge>
                      {inProgress && <Badge color={C.warning}>In Progress</Badge>}
                      {allDone && <Badge color={C.success}>Delivered</Badge>}
                    </div>
                    <div className="lx-shipment__route">
                      <span>{s.origin}</span>
                      <span className="lx-shipment__arrow">{'→'}</span>
                      <span>{s.destination}</span>
                      <span className="lx-shipment__pipe">|</span>
                      <Users size={11} style={{ color: C.muted }} />
                      <span>{s.buyer}</span>
                    </div>
                  </div>
                  <div className="lx-progress-ring" style={{
                    background: `conic-gradient(${allDone ? C.success : C.bright} ${progressPct}%, ${C.border} ${progressPct}%)`,
                  }}>
                    <div className="lx-progress-ring__inner">
                      <span className="lx-progress-ring__pct" style={{ color: allDone ? C.success : C.bright }}>
                        {progressPct}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="lx-timeline">
                  {s.stages.map((st, j) => {
                    const isLast = j === s.stages.length - 1;
                    const dotClass = st.done ? 'lx-timeline__dot--done' : st.current ? 'lx-timeline__dot--current' : 'lx-timeline__dot--pending';
                    const labelClass = st.done ? 'lx-timeline__label--done' : st.current ? 'lx-timeline__label--current' : 'lx-timeline__label--pending';
                    const detailClass = st.date === 'Pending' ? ' lx-timeline__detail--pending' : '';
                    return (
                      <div key={j} className="lx-timeline__step">
                        <div className="lx-timeline__rail">
                          <div className={`lx-timeline__dot ${dotClass}`}>
                            {st.done && <span className="lx-timeline__dot-check">{'✓'}</span>}
                          </div>
                          {!isLast && (
                            <div className={`lx-timeline__connector ${st.done ? 'lx-timeline__connector--done' : 'lx-timeline__connector--pending'}`} />
                          )}
                        </div>
                        <div className={`lx-timeline__content ${isLast ? 'lx-timeline__step:last-child' : ''}`}>
                          <div className={`lx-timeline__label ${labelClass}`}>{st.label}</div>
                          <div className={`lx-timeline__detail${detailClass}`}>
                            {st.loc} {st.date !== 'Pending' && <span>{' — '}{st.date}</span>}
                            {st.date === 'Pending' && <span>{' — '}Awaiting update</span>}
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


// ─── Settings ─────────────────────────────────────────────────────────────────
function SettingsView({ theme }) {
  return (
    <div className="lx-settings">
      <Card>
        <SectionTitle icon={<Settings size={16} />}>Appearance</SectionTitle>
        <p className="lx-settings__p">
          System automatically follows your device's preference.
        </p>
        <div className="lx-settings__radio-group">
          {[
            { value: 'system', label: 'System', hint: 'Follows your device theme' },
            { value: 'light',  label: 'Light',  hint: 'Always use light mode' },
            { value: 'dark',   label: 'Dark',   hint: 'Always use dark mode' },
          ].map(({ value, label, hint }) => (
            <label key={value}
              className={`lx-settings__radio-row${theme.preference === value ? ' lx-settings__radio-row--active' : ''}`}>
              <input
                type="radio"
                name="theme"
                value={value}
                checked={theme.preference === value}
                onChange={() => theme.setTheme(value)}
                className="lx-settings__radio-input"
              />
              <div>
                <div className="lx-settings__radio-label">{label}</div>
                <div className="lx-settings__radio-hint">{hint}</div>
              </div>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <div className="lx-settings__placeholder">
          More settings coming soon
        </div>
      </Card>
    </div>
  );
}

// ─── Placeholder ──────────────────────────────────────────────────────────────
function ComingSoon({ label }) {
  return (
    <div className="lx-coming-soon">
      <Database size={48} className="lx-coming-soon__icon" />
      <div className="lx-coming-soon__title">{label} — Coming soon</div>
      <div className="lx-coming-soon__sub">This section is under active development.</div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [visible, setVisible] = useState(true);
  const theme = useTheme();

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
    settings:  <SettingsView theme={theme} />,
  }[page];

  return (
    <div style={{
      display: 'flex', height: '100vh', background: C.bg,
      color: C.text, fontFamily: "'Inter', system-ui, sans-serif", overflow: 'hidden',
    }}>
      <Sidebar active={page} onNav={navigate} collapsed={collapsed} theme={theme} />
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
