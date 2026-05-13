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
  { name: 'Shenzhen PCB Co.',   loc: 'Nanshan, SZ',   match: 94, stars: 5, leadDays: 7,  lead: '7 days',  priceLow: 0.80, priceHigh: 1.20, price: '$0.80–$1.20/unit', components: ['FR4 PCB', 'Multilayer PCB', 'HASL Finish'] },
  { name: 'GBA Circuit Works',  loc: 'Futian, SZ',    match: 88, stars: 4, leadDays: 10, lead: '10 days', priceLow: 0.65, priceHigh: 0.95, price: '$0.65–$0.95/unit', components: ['SMT Assembly', 'PCB Fab', 'ENIG Finish'] },
  { name: 'Dragon Electronics', loc: 'Longhua, SZ',   match: 82, stars: 4, leadDays: 14, lead: '14 days', priceLow: 0.55, priceHigh: 0.80, price: '$0.55–$0.80/unit', components: ['FR4 PCB', 'HASL Finish', 'Wave Soldering'] },
  { name: 'Pearl River Fab',    loc: 'Guangzhou',     match: 79, stars: 3, leadDays: 12, lead: '12 days', priceLow: 0.45, priceHigh: 0.70, price: '$0.45–$0.70/unit', components: ['PCB Fab', 'CNC Machining', 'Aluminum PCB'] },
  { name: 'HK Precision Mfg',  loc: 'Kwun Tong, HK', match: 75, stars: 4, leadDays: 8,  lead: '8 days',  priceLow: 1.10, priceHigh: 1.60, price: '$1.10–$1.60/unit', components: ['Precision PCB', 'ENIG Finish', 'Rigid-Flex'] },
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
              <span className="lx-sidebar__logo-text">LOGXUS</span>
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
        {PAGE_TITLE[page] || 'Logxus'}
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
const COMPONENT_MAP = {
  pcb:        ['FR4 PCB', 'Multilayer PCB', 'Aluminum PCB'],
  circuit:    ['FR4 PCB', 'Precision PCB'],
  iot:        ['SMT Assembly', 'Quality Testing'],
  sensor:     ['SMT Assembly', 'Quality Testing', 'FR4 PCB'],
  assembly:   ['SMT Assembly'],
  smt:        ['SMT Assembly'],
  cnc:        ['CNC Machining'],
  machining:  ['CNC Machining'],
  precision:  ['Precision PCB', 'ENIG Finish'],
  flex:       ['Rigid-Flex'],
  rigid:      ['Rigid-Flex'],
  enig:       ['ENIG Finish'],
  hasl:       ['HASL Finish'],
  soldering:  ['Wave Soldering'],
  wave:       ['Wave Soldering'],
  multilayer: ['Multilayer PCB', 'FR4 PCB'],
  aluminum:   ['Aluminum PCB'],
  wearable:   ['Rigid-Flex', 'SMT Assembly'],
  consumer:   ['FR4 PCB', 'HASL Finish', 'Wave Soldering'],
};

function SourcingView() {
  const [uploaded, setUploaded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showRfq, setShowRfq] = useState(false);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [aiThinking, setAiThinking] = useState(false);
  const [detectedComponents, setDetectedComponents] = useState([]);

  // Filter & sort state
  const [filterComponent, setFilterComponent] = useState(null);
  const [filterLocation, setFilterLocation] = useState(null);
  const [sortKey, setSortKey] = useState(null);     // 'match' | 'stars' | 'leadDays' | 'priceLow'
  const [sortDir, setSortDir] = useState('asc');

  const chatEndRef = useRef(null);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiThinking]);

  // All unique components & locations for filter chips
  const allComponents = useMemo(() => {
    const set = new Set();
    SUPPLIERS.forEach(s => s.components.forEach(c => set.add(c)));
    return [...set].sort();
  }, []);

  const allLocations = useMemo(() => {
    const set = new Set();
    SUPPLIERS.forEach(s => set.add(s.loc));
    return [...set].sort();
  }, []);

  // Processed supplier list
  const processedSuppliers = useMemo(() => {
    let list = [...SUPPLIERS];
    if (filterComponent) {
      list = list.filter(s => s.components.some(c => c === filterComponent));
    }
    if (filterLocation) {
      list = list.filter(s => s.loc === filterLocation);
    }
    if (sortKey) {
      list.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }
    return list;
  }, [filterComponent, filterLocation, sortKey, sortDir]);

  const handleSort = (key) => {
    if (sortKey === key) {
      // Cycle: asc → desc → none
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

  // Chat: simulate agentic AI analysis
  const handleChatSubmit = (e) => {
    e?.preventDefault();
    const q = chatInput.trim();
    if (!q) return;

    const userMsg = { role: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setAiThinking(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const lower = q.toLowerCase();
      const detected = new Set();
      Object.entries(COMPONENT_MAP).forEach(([keyword, comps]) => {
        if (lower.includes(keyword)) comps.forEach(c => detected.add(c));
      });
      // If nothing matched, fallback to a generic set
      const detectedArr = detected.size > 0 ? [...detected] : ['FR4 PCB', 'SMT Assembly', 'Quality Testing'];

      const aiMsg = {
        role: 'ai',
        text: detected.size > 0
          ? `Agentic AI analyzed your request. Detected **${detectedArr.length}** relevant component categories from our supplier database.`
          : `No specific components matched your query. Showing all available supplier components for your review.`,
        components: detectedArr,
      };
      setMessages(prev => [...prev, aiMsg]);
      setDetectedComponents(detectedArr);
      setAiThinking(false);
      setUploaded(true); // triggers AI Analysis panel too
    }, 1400 + Math.random() * 800);
  };

  const handleFilterToggle = (type, value) => {
    if (type === 'component') {
      setFilterComponent(prev => prev === value ? null : value);
    } else {
      setFilterLocation(prev => prev === value ? null : value);
    }
  };

  const clearFilters = () => {
    setFilterComponent(null);
    setFilterLocation(null);
    setSortKey(null);
    setSortDir('asc');
  };

  const hasActiveFilters = filterComponent || filterLocation || sortKey;

  return (
    <div className="lx-sourcing">
      {/* ── Agentic AI Chatbox ── */}
      <Card className="lx-chatbox">
        <div className="lx-chatbox__header">
          <Zap size={15} style={{ color: C.bright }} />
          <span style={{ color: C.text, fontWeight: 700, fontSize: 14 }}>Agentic AI Sourcing</span>
          <Badge color={C.success}>Online</Badge>
        </div>

        {/* Messages area */}
        <div className="lx-chatbox__messages">
          {messages.length === 0 && !aiThinking && (
            <div className="lx-chatbox__empty">
              <Zap size={22} style={{ color: C.muted, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
              Describe your product requirements and our agentic AI will analyze components<br />
              and match the best suppliers from the database.<br />
              <span style={{ color: C.bright }}>Try: "I need multilayer PCBs for IoT sensors"</span>
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
              <div style={{ color: C.text, fontSize: 13, lineHeight: 1.6 }}>{m.text}</div>
              {m.components && (
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
          />
          <Btn variant="primary" onClick={handleChatSubmit} icon={<Send size={14} />}
            style={{ padding: '9px 16px', fontSize: 12, flexShrink: 0 }}>
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
              { label: 'DETECTED COMPONENTS',   content: <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{detectedComponents.map(c => <Badge key={c} color={C.bright}>{c}</Badge>)}</div> },
              { label: 'MANUFACTURING PROCESS', content: <span style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>PCB Manufacturing — Multi-layer assembly</span> },
              { label: 'QUALITY FLAGS',         content: <span style={{ color: C.warning, fontWeight: 600, fontSize: 13 }}>⚠ 2 advisory items — review recommended</span> },
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
          {/* Component filter */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="lx-filter-bar__label">Filter by Component</div>
            <div className="lx-filter-bar__chips">
              {allComponents.map(c => (
                <button key={c} onClick={() => handleFilterToggle('component', c)}
                  className={`lx-filter-chip${filterComponent === c ? ' lx-filter-chip--active' : ''}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Location filter */}
          <div style={{ minWidth: 160 }}>
            <div className="lx-filter-bar__label">Filter by Location</div>
            <div className="lx-filter-bar__chips">
              {allLocations.map(loc => (
                <button key={loc} onClick={() => handleFilterToggle('location', loc)}
                  className={`lx-filter-chip${filterLocation === loc ? ' lx-filter-chip--active' : ''}`}>
                  <MapPin size={10} style={{ marginRight: 2, verticalAlign: 'middle' }} />
                  {loc}
                </button>
              ))}
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
          <Badge>{processedSuppliers.length} of {SUPPLIERS.length} results</Badge>
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
        <Btn variant="primary" onClick={() => setShowRfq(true)} icon={<FileText size={15} />} style={{ padding: '11px 24px', fontSize: 14 }}>
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
  const [currency, setCurrency] = useState('HKD');
  const [cargoType, setCargoType] = useState('Parcel');
  const [urgency, setUrgency] = useState('Standard');
  const [dest, setDest] = useState('Los Angeles, USA');
  const [weight, setWeight] = useState('2.5');

  return (
    <div className="lx-logistics">
      {/* Quote form */}
      <Card>
        <SectionTitle icon={<Globe size={16} />}>Get Shipping Quotes</SectionTitle>
        <div className="lx-quote-form__fields">
          <div>
            <label className="lx-quote-form__label">FROM</label>
            <select className="lx-quote-form__input">
              <option>Hong Kong</option>
              <option>Shenzhen</option>
              <option>Guangzhou</option>
            </select>
          </div>
          <div>
            <label className="lx-quote-form__label">TO</label>
            <input value={dest} onChange={e => setDest(e.target.value)} className="lx-quote-form__input" />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="lx-quote-form__label">CARGO TYPE</label>
          <div className="lx-quote-form__chips">
            {['Parcel', 'Air Freight', 'Ocean FCL', 'Ocean LCL'].map(t => (
              <button key={t} onClick={() => setCargoType(t)}
                className={`lx-quote-form__chip${cargoType === t ? ' lx-quote-form__chip--active' : ''}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="lx-quote-form__row">
          <div>
            <label className="lx-quote-form__label">WEIGHT (KG)</label>
            <input value={weight} onChange={e => setWeight(e.target.value)} className="lx-quote-form__input" />
          </div>
          <div>
            <label className="lx-quote-form__label">DIMENSIONS (CM)</label>
            <input defaultValue="30 × 20 × 15" className="lx-quote-form__input" />
          </div>
          <div>
            <label className="lx-quote-form__label">URGENCY</label>
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

        <Btn variant="primary" onClick={() => setQuotesLoaded(true)} icon={<ChevronRight size={15} />} style={{ padding: '10px 22px', fontSize: 13 }}>
          Get Quotes
        </Btn>
      </Card>

      {/* Results */}
      {quotesLoaded && (
        <Card className="lx-table-card fade-in">
          <div className="lx-table-card__header" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="lx-table-card__title">Available Quotes</span>
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
          <div className="lx-table-card__scroll">
            <table className="lx-table lx-quote-table">
              <thead>
                <tr className="lx-table__head">
                  {['Carrier', 'Service', 'Transit', 'Price', 'CO₂ Est.', ''].map(h => (
                    <th key={h} className="lx-table__th">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {QUOTES.map((q, i) => (
                  <tr key={i} className="lx-table__row">
                    <td className="lx-table__td">
                      <span className="lx-quote-carrier" style={{ background: q.col, color: '#fff' }}>{q.carrier}</span>
                    </td>
                    <td className="lx-table__td" style={{ color: C.text }}>{q.service}</td>
                    <td className="lx-table__td">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={11} />{q.transit}
                      </div>
                    </td>
                    <td className="lx-table__td">
                      <span style={{ color: C.text, fontWeight: 800, fontSize: 16 }}>
                        {currency === 'HKD' ? `$${q.hkd}` : `$${q.usd}`}
                      </span>
                      <span style={{ color: C.muted, fontSize: 11, marginLeft: 4 }}>{currency}</span>
                    </td>
                    <td className="lx-table__td">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.success }}>
                        <Leaf size={11} />{q.co2} CO₂
                      </div>
                    </td>
                    <td className="lx-table__td">
                      <Btn variant="primary" style={{ padding: '6px 16px', fontSize: 11 }}>Book Now</Btn>
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
        <div className="lx-shipments">
          {SHIPMENTS.map((s, i) => {
            const allDone = s.stages.every(st => st.done);
            const inProgress = s.stages.find(st => st.current);
            const currentIdx = s.stages.findIndex(st => st.current);
            const progressPct = allDone ? 100 : currentIdx >= 0 ? Math.round((currentIdx / (s.stages.length - 1)) * 100) : 0;
            return (
              <div key={i}>
                {/* Shipment header */}
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
                      <span className="lx-shipment__arrow">→</span>
                      <span>{s.destination}</span>
                      <span className="lx-shipment__pipe">|</span>
                      <Users size={11} style={{ color: C.muted }} />
                      <span>{s.buyer}</span>
                    </div>
                  </div>
                  {/* Progress ring */}
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

                {/* Tracking timeline */}
                <div className="lx-timeline">
                  {s.stages.map((st, j) => {
                    const isLast = j === s.stages.length - 1;
                    const dotClass = st.done ? 'lx-timeline__dot--done' : st.current ? 'lx-timeline__dot--current' : 'lx-timeline__dot--pending';
                    const labelClass = st.done ? 'lx-timeline__label--done' : st.current ? 'lx-timeline__label--current' : 'lx-timeline__label--pending';
                    const detailClass = st.date === 'Pending' ? ' lx-timeline__detail--pending' : '';
                    return (
                      <div key={j} className="lx-timeline__step">
                        {/* Left rail */}
                        <div className="lx-timeline__rail">
                          <div className={`lx-timeline__dot ${dotClass}`}>
                            {st.done && <span className="lx-timeline__dot-check">✓</span>}
                          </div>
                          {!isLast && (
                            <div className={`lx-timeline__connector ${st.done ? 'lx-timeline__connector--done' : 'lx-timeline__connector--pending'}`} />
                          )}
                        </div>
                        {/* Content */}
                        <div className={`lx-timeline__content ${isLast ? 'lx-timeline__step:last-child' : ''}`}>
                          <div className={`lx-timeline__label ${labelClass}`}>{st.label}</div>
                          <div className={`lx-timeline__detail${detailClass}`}>
                            {st.loc} {st.date !== 'Pending' && <span>— {st.date}</span>}
                            {st.date === 'Pending' && <span>— Awaiting update</span>}
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
