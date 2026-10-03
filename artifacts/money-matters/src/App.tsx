import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Bell, BriefcaseBusiness, CarFront,
  ArrowUp, Check, ChevronDown, CircleHelp, Coffee, CreditCard, FileText, Home,
  LogOut, Pencil, Plus, Search, Settings, ShoppingBag,
  Trash2, TrendingDown, TrendingUp, UserRound, Wallet, X,
} from 'lucide-react';

type TxType = 'debit' | 'credit';
type Transaction = { id: string; title: string; category: string; type: TxType; amount: number; date: string; account: string; note: string; user?: string };
type Profile = { name: string; email: string; phone: string; currency: string; username?: string; birthdate?: string; presentAddress?: string; permanentAddress?: string; city?: string; postalCode?: string; country?: string };
const STORE_TX = 'money-matters-transactions-v3';
const STORE_PROFILE = 'money-matters-profile-v1';
const dateDaysAgo = (days: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};
const lastSixMonths = () => Array.from({ length: 6 }, (_, index) => {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() - (5 - index));
  return {
    key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
    name: date.toLocaleDateString('en-US', { month: 'short' }),
  };
});
const monthlyCashFlow = (transactions: Transaction[]) => lastSixMonths().map(({ key, name }) => {
  const month = transactions.filter(transaction => transaction.date.startsWith(key));
  return {
    name,
    income: month.filter(transaction => transaction.type === 'credit').reduce((sum, transaction) => sum + transaction.amount, 0),
    expense: month.filter(transaction => transaction.type === 'debit').reduce((sum, transaction) => sum + transaction.amount, 0),
  };
});
const seedTransactions: Transaction[] = [
  { id:'t01',title:'Salary deposit',category:'Income',type:'credit',amount:4250,date:dateDaysAgo(2),account:'Everyday account',note:'Monthly salary' },
  { id:'t02',title:'Whole Foods Market',category:'Groceries',type:'debit',amount:86.42,date:dateDaysAgo(1),account:'Everyday account',note:'Weekly groceries' },
  { id:'t03',title:'Apartment rent',category:'Housing',type:'debit',amount:1480,date:dateDaysAgo(8),account:'Everyday account',note:'Monthly rent' },
  { id:'t04',title:'Blue Bottle Coffee',category:'Food & drink',type:'debit',amount:7.85,date:dateDaysAgo(9),account:'Visa •• 4812',note:'' },
  { id:'t05',title:'Freelance project',category:'Income',type:'credit',amount:725,date:dateDaysAgo(12),account:'Everyday account',note:'Brand identity project' },
  { id:'t06',title:'Metro Transit',category:'Transport',type:'debit',amount:32,date:dateDaysAgo(18),account:'Visa •• 4812',note:'Monthly pass' },
  { id:'t07',title:'Internet bill',category:'Bills',type:'debit',amount:64.99,date:dateDaysAgo(23),account:'Everyday account',note:'' },
  { id:'t08',title:'Pharmacy',category:'Health',type:'debit',amount:24.55,date:dateDaysAgo(31),account:'Visa •• 4812',note:'' },
  { id:'t09',title:'Dinner at Nopa',category:'Food & drink',type:'debit',amount:58.2,date:dateDaysAgo(39),account:'Visa •• 4812',note:'Dinner with Maya' },
  { id:'t10',title:'Dividend payment',category:'Income',type:'credit',amount:38.16,date:dateDaysAgo(47),account:'Savings account',note:'Quarterly dividend' },
  { id:'t11',title:'Bookshop',category:'Shopping',type:'debit',amount:31.5,date:dateDaysAgo(58),account:'Visa •• 4812',note:'' },
  { id:'t12',title:'Electricity',category:'Bills',type:'debit',amount:91.73,date:dateDaysAgo(69),account:'Everyday account',note:'Monthly usage' },
  { id:'t13',title:'Salary deposit',category:'Income',type:'credit',amount:4250,date:dateDaysAgo(76),account:'Everyday account',note:'Monthly salary' },
  { id:'t14',title:'City parking',category:'Transport',type:'debit',amount:18,date:dateDaysAgo(84),account:'Visa •• 4812',note:'' },
  { id:'t15',title:'Dinner at Sora',category:'Food & drink',type:'debit',amount:72.45,date:dateDaysAgo(97),account:'Visa •• 4812',note:'' },
];
const defaultProfile: Profile = { name:'Charlene Reed',email:'charlenereed@gmail.com',phone:'+1 (415) 555-0182',currency:'USD',username:'Charlene Reed',birthdate:'1990-01-25',presentAddress:'San Jose, California, USA',permanentAddress:'San Jose, California, USA',city:'San Jose',postalCode:'45962',country:'USA' };
const adminTransactions: Transaction[] = [
  {id:'a01',title:'Monthly salary',category:'Income',type:'credit',amount:5180,date:dateDaysAgo(1),account:'Checking •• 9201',note:'Payroll',user:'Alex Morgan'},
  {id:'a02',title:'Rent payment',category:'Housing',type:'debit',amount:1625,date:dateDaysAgo(2),account:'Checking •• 9201',note:'Monthly rent',user:'Priya Shah'},
  {id:'a03',title:'Groceries',category:'Groceries',type:'debit',amount:132.64,date:dateDaysAgo(4),account:'Visa •• 1004',note:'Market run',user:'Jordan Lee'},
  {id:'a04',title:'Client invoice',category:'Income',type:'credit',amount:890,date:dateDaysAgo(6),account:'Checking •• 3108',note:'Design retainer',user:'Elena Cruz'},
  {id:'a05',title:'Gym membership',category:'Health',type:'debit',amount:54,date:dateDaysAgo(8),account:'Visa •• 4812',note:'Monthly plan',user:'Alex Morgan'},
  {id:'a06',title:'Coffee & lunch',category:'Food & drink',type:'debit',amount:27.8,date:dateDaysAgo(11),account:'Debit •• 3022',note:'',user:'Priya Shah'},
  {id:'a07',title:'Online purchase',category:'Shopping',type:'debit',amount:118.2,date:dateDaysAgo(15),account:'Visa •• 1717',note:'Household',user:'Marcus Chen'},
  {id:'a08',title:'Reimbursement',category:'Income',type:'credit',amount:164.5,date:dateDaysAgo(22),account:'Checking •• 3108',note:'Travel expenses',user:'Jordan Lee'},
  {id:'a09',title:'Water bill',category:'Bills',type:'debit',amount:46.7,date:dateDaysAgo(30),account:'Checking •• 9201',note:'',user:'Elena Cruz'},
  {id:'a10',title:'Train ticket',category:'Transport',type:'debit',amount:38.5,date:dateDaysAgo(39),account:'Visa •• 7734',note:'',user:'Marcus Chen'},
  {id:'a11',title:'Salary deposit',category:'Income',type:'credit',amount:4650,date:dateDaysAgo(48),account:'Checking •• 3022',note:'Payroll',user:'Priya Shah'},
];
const currencySymbol = (code: string) => ({USD:'$',EUR:'€',GBP:'£',CAD:'CA$',AUD:'A$'}[code] || '$');
function loadTransactions(): Transaction[] {
  try { const value = localStorage.getItem(STORE_TX); if (!value) return seedTransactions; const parsed: unknown = JSON.parse(value); if (!Array.isArray(parsed)) return seedTransactions;
    return parsed.filter((t): t is Transaction => !!t && typeof t === 'object' && typeof t.id==='string' && typeof t.title==='string' && (t.type==='debit'||t.type==='credit') && Number.isFinite(t.amount) && typeof t.date==='string' && typeof t.category==='string' && typeof t.account==='string').map(t=>({...t,note:typeof t.note==='string'?t.note:''}));
  } catch { return seedTransactions; }
}
function loadProfile(): Profile {
  try { const raw=localStorage.getItem(STORE_PROFILE); if (!raw) return defaultProfile; const p=JSON.parse(raw); if (p&&typeof p.name==='string'&&typeof p.email==='string'&&typeof p.phone==='string'&&typeof p.currency==='string') return {...defaultProfile,...p,username:typeof p.username==='string'&&p.username.trim()&&p.username!==defaultProfile.name?p.username:p.name}; } catch { /* recover from damaged storage */ }
  return defaultProfile;
}
const money = (amount:number,currency='USD') => `${currencySymbol(currency)}${Math.abs(amount).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const shortDate = (date:string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'});
const transactionDateTime = (date:string) => { const value=new Date(`${date}T12:00:00`);return `${String(value.getDate()).padStart(2,'0')} ${value.toLocaleDateString('en-US',{month:'short'})}, 12.30 AM`; };
const txIcon = (category:string) => category==='Groceries'?ShoppingBag:category==='Transport'?CarFront:category==='Income'?ArrowDownLeft:category==='Bills'?FileText:category==='Food & drink'?Coffee:category==='Housing'?Home:CreditCard;
const initials = (name:string) => name.split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();

function AppData({children}:{children:(data:{transactions:Transaction[];setTransactions:(next:Transaction[])=>void;profile:Profile;setProfile:(p:Profile)=>void;toast:(s:string)=>void})=>ReactNode}) {
  const [transactions,setTransactionsState]=useState<Transaction[]>(loadTransactions);
  const [profile,setProfileState]=useState<Profile>(loadProfile);
  const [message,setMessage]=useState('');
  useEffect(()=>{try{localStorage.setItem(STORE_TX,JSON.stringify(transactions));}catch{/* local persistence unavailable */}},[transactions]);
  useEffect(()=>{try{localStorage.setItem(STORE_PROFILE,JSON.stringify(profile));}catch{/* local persistence unavailable */}},[profile]);
  useEffect(()=>{if(!message)return;const timer=window.setTimeout(()=>setMessage(''),2600);return()=>window.clearTimeout(timer);},[message]);
  const setTransactions=(next:Transaction[])=>setTransactionsState(next);
  const setProfile=(p:Profile)=>setProfileState(p);
  return <>{children({transactions,setTransactions,profile,setProfile,toast:setMessage})}{message&&<div role="status" className="toast-note"><Check size={14} style={{display:'inline',marginRight:7,verticalAlign:'-2px'}}/>{message}</div>}</>;
}

function RouterShell({children,onLogout,profile}:{children:ReactNode;onLogout:()=>void;profile:Profile}) {
  const [path,setPath]=useLocation();
  const [popover,setPopover]=useState<'help'|'notifications'|null>(null);
  const admin=path.startsWith('/admin');
  const nav=admin?[
    {label:'Dashboard',href:'/admin/dashboard',icon:Home},
    {label:'All Transactions',href:'/admin/transactions',icon:ArrowLeftRight},
  ]:[
    {label:'Dashboard',href:'/dashboard',icon:Home},
    {label:'All Transactions',href:'/transactions',icon:ArrowLeftRight},
    {label:'Profile',href:'/profile',icon:UserRound},
  ];
  return <div className="app-frame">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 2.5 27 7v8.4c0 6.4-4.4 11.3-11 14.1C10.4 26.7 6 21.8 6 15.4V7l10-4.5Z" fill="#fff" stroke="#efb743" strokeWidth="1.5"/><path d="M9.3 10.1h13.4v9.7H9.3z" rx="2" fill="#42b8a9"/><path d="M11.5 12.4h9v5h-9z" fill="#fff"/><circle cx="16" cy="14.9" r="1.3" fill="#f2ad37"/><path d="M12 7.5 16 5.8l4 1.7" fill="none" stroke="#41b6a7" strokeWidth="1.5" strokeLinecap="round"/></svg></span><span>Money Matters</span></div>
      <nav aria-label="Main navigation">{nav.map(item=><a key={item.href} href={item.href} onClick={e=>{e.preventDefault();setPath(item.href)}} className={`nav-link ${path===item.href||(path==='/'&&item.href==='/dashboard')||(item.href==='/transactions'&&path.startsWith('/transactions'))?'active':''}`} data-testid={`link-${item.label.toLowerCase().replaceAll(' ','-')}`}><item.icon size={17}/><span>{item.label}</span></a>)}</nav>
      <div className="sidebar-bottom">
        <div className="user-chip"><div className="avatar">{admin?'MM':initials(profile.name)}</div><div className="user-chip-copy"><strong>{admin?'Money Matters':profile.name}</strong><small>{admin?'Administrator':profile.email}</small></div><button aria-label={`Switch to ${admin?'personal':'admin'} workspace`} title={`Switch to ${admin?'personal':'admin'} workspace`} className="icon-button workspace-toggle" onClick={()=>setPath(admin?'/dashboard':'/admin/dashboard')}><ArrowLeftRight size={14}/></button><button aria-label="Log out" className="icon-button" onClick={onLogout}><LogOut size={15}/></button></div>
      </div>
    </aside>
    <main className="shell-main">
       <header className="topbar"><div className="crumb">{admin?'Admin':'Personal'}</div><div className="top-actions"><button className="top-user" aria-label={`Switch to ${admin?'personal':'admin'} workspace`} onClick={()=>setPath(admin?'/dashboard':'/admin/dashboard')}><span className="avatar" style={{width:28,height:28,fontSize:9}}>{admin?'MM':initials(profile.name)}</span>{admin?'Admin':profile.name.split(' ')[0]}<ChevronDown size={12}/></button><button className="icon-button" aria-label="Log out" onClick={onLogout}><LogOut size={15}/></button></div></header>
      {children}
    </main>
  </div>;
}

function PageTitle({eyebrow,title,description,action}:{eyebrow?:string;title:string;description?:string;action?:ReactNode}) {
  return <div className="page-heading"><div>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description&&<p>{description}</p>}</div>{action}</div>;
}
function Metrics({transactions,currency}:{transactions:Transaction[];currency:string}) {
  const credits=transactions.filter(t=>t.type==='credit').reduce((s,t)=>s+t.amount,0);
  const debits=transactions.filter(t=>t.type==='debit').reduce((s,t)=>s+t.amount,0);
  const net=credits-debits;
  const metrics=[{label:'Total balance',value:money(net,currency),sub:'Across all transactions',icon:Wallet},{label:'Total income',value:money(credits,currency),sub:`${transactions.filter(t=>t.type==='credit').length} incoming transactions`,icon:TrendingUp},{label:'Total expenses',value:money(debits,currency),sub:`${transactions.filter(t=>t.type==='debit').length} outgoing transactions`,icon:TrendingDown},{label:'Savings rate',value:`${credits?Math.max(0,Math.round((net/credits)*100)):0}%`,sub:'Share of income retained',icon:BriefcaseBusiness}];
  return <div className="metric-grid">{metrics.map((m,i)=><div className="metric-card" key={m.label} data-testid={`metric-${i}`}><div className="metric-top">{m.label}<span className="metric-icon"><m.icon size={15}/></span></div><div className="metric-value">{m.value}</div><div className={`metric-sub ${i===0?'positive':''}`}>{m.sub}</div></div>)}</div>;
}
function TrendChart({transactions,title='Debit & Credit Overview',subtitle='Weekly activity'}:{transactions:Transaction[];title?:string;subtitle?:string}) {
  const days=useMemo(()=>Array.from({length:7},(_,index)=>{
    const today=new Date();today.setHours(12,0,0,0);
    const daysBack=((today.getDay()+2)%7)||7;
    const d=new Date(today);d.setDate(today.getDate()-daysBack-6+index);
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const list=transactions.filter(t=>t.date===key);
    return {name:d.toLocaleDateString('en-US',{weekday:'short'}),credit:list.filter(t=>t.type==='credit').reduce((s,t)=>s+t.amount,0),debit:list.filter(t=>t.type==='debit').reduce((s,t)=>s+t.amount,0)};
  }),[transactions]);
  const max=Math.max(...days.flatMap(m=>[m.credit,m.debit]),100);
  const credits=days.reduce((s,d)=>s+d.credit,0),debits=days.reduce((s,d)=>s+d.debit,0);
  return <section className="panel chart-panel"><div className="panel-head"><div><div className="panel-title">{title}</div><div className="panel-note">{subtitle}</div></div><div className="chart-legend"><span><i className="legend-dot"/>Debit</span><span><i className="legend-dot blue"/>Credit</span></div></div>
    <div className="weekly-summary">{money(debits)} Debited &amp; {money(credits)} Credited in this Week</div>
    <div className="chart-area"><svg className="chart-svg" viewBox="0 0 510 220" role="img" aria-label="Weekly debit and credit chart">
      {[45,90,135,180].map(y=><line key={y} x1="25" x2="500" y1={y} y2={y} stroke="#edf0f5" strokeDasharray="3 5"/>)}
      {days.map((m,i)=>{const x=28+i*68;const h1=m.debit/max*145;const h2=m.credit/max*145;return <g key={m.name}><rect x={x+7} y={188-h1} width="19" height={h1} rx="5" fill="#4c73ed"/><rect x={x+31} y={188-h2} width="19" height={h2} rx="5" fill="#f3a20b"/></g>})}
    </svg></div><div className="chart-labels">{days.map(m=><span key={m.name}>{m.name}</span>)}</div>
  </section>;
}
function CategoryBreakdown({transactions,currency}:{transactions:Transaction[];currency:string}) {
  const thisMonth=transactions.filter(t=>t.date.startsWith(lastSixMonths()[5]?.key||''));
  const debits=thisMonth.filter(t=>t.type==='debit');
  const total=debits.reduce((s,t)=>s+t.amount,0);
  const groups=Object.entries(debits.reduce<Record<string,number>>((acc,t)=>{acc[t.category]=(acc[t.category]||0)+t.amount;return acc;},{})).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const palette=['#eaf5ee','#f8efe8','#edf3f8','#f4eff8','#f8edf0'];
  return <section className="panel"><div className="panel-head"><div><div className="panel-title">Spending by category</div><div className="panel-note">Where your money went</div></div><span style={{color:'#9ca9a2',fontSize:10}}>This month</span></div>
    <div className="breakdown">{groups.length?groups.map(([category,value],i)=>{const Icon=txIcon(category);return <div className="breakdown-row" key={category}><span className="category-mark" style={{background:palette[i]}}><Icon size={14}/></span><span className="breakdown-text"><strong>{category}</strong><small>{total?Math.round(value/total*100):0}% of expenses</small></span><span className="breakdown-amount">{money(value,currency)}<small>{thisMonth.filter(t=>t.category===category&&t.type==='debit').length} transactions</small></span></div>}):<div className="empty-state">Your spending summary will appear here.</div>}</div>
  </section>;
}

function TransactionsTable({transactions,currency,onEdit,onDelete,admin=false,showUserName=false,ownerName='User',compact=false,showActions=false}:{transactions:Transaction[];currency:string;onEdit?:(tx:Transaction)=>void;onDelete?:(tx:Transaction)=>void;admin?:boolean;showUserName?:boolean;ownerName?:string;compact?:boolean;showActions?:boolean}) {
  const withUser=admin||showUserName;
  return <div className="table-scroll"><table className={`data-table ${compact?'compact-table':''}`}><thead>{!compact&&<tr>{withUser&&<th>User Name</th>}<th>Transaction Name</th><th>Category</th><th>Date</th><th style={{textAlign:'right'}}>Amount</th>{showActions&&!admin&&<th aria-label="Actions"/>}</tr>}</thead><tbody>
    {transactions.map(tx=><tr key={tx.id} data-testid={`row-transaction-${tx.id}`}>
      {withUser&&<td><div className="member-name"><span className={`direction-icon ${tx.type}`} aria-hidden="true">{tx.type==='credit'?<ArrowUpRight size={14}/>:<ArrowDownLeft size={14}/>}</span><span className="member-avatar">{initials(tx.user||ownerName)}</span><span>{tx.user||ownerName}</span></div></td>}
      <td><div className="transaction-name">{!withUser&&<span className={`direction-icon ${tx.type}`} aria-hidden="true">{tx.type==='credit'?<ArrowUpRight size={14}/>:<ArrowDownLeft size={14}/>}</span>}{tx.title}</div></td>
      <td>{tx.category}</td><td>{transactionDateTime(tx.date)}</td>
      <td style={{textAlign:'right'}} className={`amount ${tx.type==='credit'?'positive':''}`}>{tx.type==='debit'?'−':'+'}{money(tx.amount,currency)}</td>
      {showActions&&!admin&&<td><div className="row-actions"><button className="icon-button" title="Edit transaction" aria-label={`Edit ${tx.title}`} onClick={()=>onEdit?.(tx)}><Pencil size={14}/></button><button className="icon-button" title="Delete transaction" aria-label={`Delete ${tx.title}`} onClick={()=>onDelete?.(tx)}><Trash2 size={14}/></button></div></td>}
    </tr>)}
    </tbody></table>{transactions.length===0&&<div className="empty-state"><span className="empty-icon"><ArrowLeftRight size={18}/></span>No transactions found. Try changing your search or add a transaction.</div>}</div>;
}

function AccountIllustration({kind}:{kind:'credit'|'debit'}) {
  return <svg className={`account-illustration ${kind}`} viewBox="0 0 132 94" aria-hidden="true">
    <ellipse cx="70" cy="82" rx="49" ry="7" fill="#eef3ff"/>
    {kind==='credit'?<>
      <g fill="#dce9ff" stroke="#aac4ff" strokeWidth="1.4"><path d="M18 62h28v8H18z"/><ellipse cx="32" cy="62" rx="14" ry="5"/><ellipse cx="32" cy="70" rx="14" ry="5"/><path d="M22 52h28v8H22z"/><ellipse cx="36" cy="52" rx="14" ry="5"/><ellipse cx="36" cy="60" rx="14" ry="5"/></g>
      <path d="M77 37c-8 0-14 7-14 16 0 6 3 10 7 13l-3 15h31l-5-18c4-3 6-7 6-12 0-8-6-14-13-14H77Z" fill="#5481eb"/><circle cx="82" cy="26" r="11" fill="#f5c8a5"/><path d="M71 26c1-10 7-15 14-15 7 1 11 5 12 12l-7-3-8 3-5 7-6-4Z" fill="#4b5369"/><path d="M70 81h12l-1 8H67zM86 81h12l4 8H84z" fill="#45577f"/>
      <g fill="#f8d779" stroke="#e9b94b" strokeWidth="1.2"><ellipse cx="111" cy="61" rx="11" ry="4"/><path d="M100 61v14c0 3 5 5 11 5s11-2 11-5V61" fill="#f5d16f"/><ellipse cx="111" cy="75" rx="11" ry="4"/><ellipse cx="111" cy="54" rx="11" ry="4"/></g>
    </>:<>
      <g fill="#dce9ff" stroke="#aac4ff" strokeWidth="1.4"><path d="M16 66h26v8H16z"/><ellipse cx="29" cy="66" rx="13" ry="5"/><ellipse cx="29" cy="74" rx="13" ry="5"/><path d="M21 55h26v8H21z"/><ellipse cx="34" cy="55" rx="13" ry="5"/><ellipse cx="34" cy="63" rx="13" ry="5"/></g>
      <path d="M70 43h42a5 5 0 0 1 5 5v27H65V48a5 5 0 0 1 5-5Z" fill="#4c74e8"/><path d="M65 53h52v8H65z" fill="#e8efff"/><circle cx="102" cy="68" r="3" fill="#f1ba52"/>
      <circle cx="56" cy="30" r="10" fill="#f4c5a1"/><path d="M46 29c0-9 6-14 13-14 6 0 10 4 11 10l-9-2-9 8-6-2Z" fill="#515a71"/><path d="M48 42c-9 2-14 10-13 20l4 18h27l-4-20c5-7 0-17-8-18H48Z" fill="#ef7990"/><path d="M40 79h14l-1 10H38zM55 79h14l4 10H54z" fill="#4c5977"/>
      <g fill="#f8d779" stroke="#e9b94b" strokeWidth="1.2"><ellipse cx="27" cy="46" rx="9" ry="3.5"/><path d="M18 46v13c0 3 4 4 9 4s9-1 9-4V46" fill="#f5d16f"/><ellipse cx="27" cy="59" rx="9" ry="3.5"/></g>
    </>}
  </svg>;
}

function Dashboard({transactions,profile}:{transactions:Transaction[];profile:Profile}) {
  const [,setPath]=useLocation();
  const sorted=[...transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,3);
  const income=transactions.filter(t=>t.type==='credit').reduce((s,t)=>s+t.amount,0),expense=transactions.filter(t=>t.type==='debit').reduce((s,t)=>s+t.amount,0);
  return <div className="page-wrap"><PageTitle title="Accounts" description={`Welcome back, ${profile.name.split(' ')[0]}. Here is your money overview.`} action={<button className="btn btn-primary" onClick={()=>{setPath('/transactions');window.setTimeout(()=>window.dispatchEvent(new Event('open-add-tx')),100)}}><Plus size={14}/>Add Transaction</button>}/>
    <div className="account-summary"><div className="account-tile credit-tile"><span className="account-total">{money(income,profile.currency)}</span><span>Credit</span><AccountIllustration kind="credit"/><span className="account-sign">+</span></div><div className="account-tile debit-tile"><span className="account-total">{money(expense,profile.currency)}</span><span>Debit</span><AccountIllustration kind="debit"/><span className="account-sign">−</span></div></div>
    <section className="panel recent-panel"><div className="panel-head table-head"><div className="panel-title">Last Transaction</div><a className="btn btn-small" href="/transactions" onClick={e=>{e.preventDefault();setPath('/transactions')}}>View all <ArrowLeftRight size={12}/></a></div><TransactionsTable transactions={sorted} currency={profile.currency} ownerName={profile.name} showUserName compact/></section>
    <div className="dashboard-columns weekly-layout"><TrendChart transactions={transactions}/></div>
  </div>;
}

function TransactionDialog({open,onClose,onSave,edit,currency}:{open:boolean;onClose:()=>void;onSave:(data:Omit<Transaction,'id'>,id?:string)=>void;edit:Transaction|null;currency:string}) {
  const [error,setError]=useState('');
  useEffect(()=>{setError('');},[edit,open]);
  useEffect(()=>{if(!open)return;const closeOnEscape=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',closeOnEscape);return()=>window.removeEventListener('keydown',closeOnEscape)},[open,onClose]);
  if(!open)return null;
  function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const title=String(f.get('title')||'').trim();const amount=Number(f.get('amount'));const date=String(f.get('date')||'');if(title.length<2){setError('Add a transaction name with at least 2 characters.');return}if(!Number.isFinite(amount)||amount<=0){setError('Enter an amount greater than zero.');return}if(!date){setError('Choose a transaction date.');return}
    onSave({title,category:String(f.get('category')),type:String(f.get('type')) as TxType,amount,date,account:edit?.account||'Everyday account',note:edit?.note||''},edit?.id);}
  return <div className="dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="tx-dialog-title"><div className="dialog-head"><div><h2 id="tx-dialog-title">{edit?'Update Transaction':'Add Transaction'}</h2><p>{edit?'Update the details of this transaction.':'Record an income or expense.'}</p></div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={17}/></button></div>
    <form className="dialog-body" onSubmit={submit}><div className="form-grid">
      <div className="field"><label htmlFor="tx-title">Transaction Name</label><input id="tx-title" name="title" defaultValue={edit?.title||''} placeholder="e.g. Weekly groceries" required autoFocus/></div>
      <div className="field"><label htmlFor="tx-type">Type</label><select id="tx-type" name="type" defaultValue={edit?.type||'debit'}><option value="debit">Debit</option><option value="credit">Credit</option></select></div>
      <div className="field"><label htmlFor="tx-category">Category</label><select id="tx-category" name="category" defaultValue={edit?.category||'Groceries'}>{['Groceries','Housing','Food & drink','Transport','Bills','Health','Shopping','Income','Other'].map(c=><option key={c}>{c}</option>)}</select></div>
      <div className="field"><label htmlFor="tx-amount">Amount</label><div className="amount-input"><span>{currencySymbol(currency)}</span><input id="tx-amount" name="amount" defaultValue={edit?.amount??''} placeholder="0.00" inputMode="decimal" type="number" min="0.01" step="0.01" required/></div></div>
      <div className="field"><label htmlFor="tx-date">Date</label><input id="tx-date" name="date" type="date" defaultValue={edit?.date||dateDaysAgo(0)} required/></div>
    </div>{error&&<div role="alert" style={{color:'#bf5e58',fontSize:10,marginTop:12}}>{error}</div>}<div className="dialog-footer"><button type="button" className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" type="submit"><Check size={13}/>{edit?'Save Changes':'Add Transaction'}</button></div></form></section></div>;
}
function ConfirmDialog({title,description,confirm,onCancel,danger=true}:{title:string;description:string;confirm:()=>void;onCancel:()=>void;danger?:boolean}) {
  useEffect(()=>{const closeOnEscape=(e:KeyboardEvent)=>{if(e.key==='Escape')onCancel()};window.addEventListener('keydown',closeOnEscape);return()=>window.removeEventListener('keydown',closeOnEscape)},[onCancel]);
  return <div className="dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onCancel()}}><section className="dialog small confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><div className={`confirm-icon ${danger?'warning':'logout'}`}>{danger?<Trash2 size={18}/>:<LogOut size={18}/>}</div><div className="confirm-content"><button className="icon-button confirm-close" aria-label="Close dialog" onClick={onCancel}><X size={16}/></button><h2 id="confirm-title">{title}</h2><p className="confirm-copy">{description}</p><div className="dialog-footer"><button className="btn" onClick={onCancel}>{danger?'No, Leave it':'Cancel'}</button><button className="btn btn-danger" onClick={confirm}>{danger?'Yes, Delete':'Yes, Logout'}</button></div></div></section></div>;
}

function TransactionPage({transactions,setTransactions,profile,toast}:{transactions:Transaction[];setTransactions:(t:Transaction[])=>void;profile:Profile;toast:(m:string)=>void}) {
  const [path,setPath]=useLocation();
  const [search,setSearch]=useState('');const [sort,setSort]=useState('newest');const [category,setCategory]=useState('All categories');
  const [dialog,setDialog]=useState(false);const [editing,setEditing]=useState<Transaction|null>(null);const [deleting,setDeleting]=useState<Transaction|null>(null);
  const mode=path.endsWith('/debit')?'debit':path.endsWith('/credit')?'credit':'all';
  useEffect(()=>{const open=()=>{setEditing(null);setDialog(true)};window.addEventListener('open-add-tx',open);return()=>window.removeEventListener('open-add-tx',open)},[]);
  const filtered=useMemo(()=>{let list=transactions.filter(t=>mode==='all'||t.type===mode);if(category!=='All categories')list=list.filter(t=>t.category===category);if(search.trim()){const q=search.toLowerCase();list=list.filter(t=>[t.title,t.category,t.account,t.note].some(x=>x.toLowerCase().includes(q)));}return [...list].sort((a,b)=>sort==='oldest'?a.date.localeCompare(b.date):sort==='amount-high'?b.amount-a.amount:sort==='amount-low'?a.amount-b.amount:b.date.localeCompare(a.date));},[transactions,mode,category,search,sort]);
  function save(data:Omit<Transaction,'id'>,id?:string){if(id)setTransactions(transactions.map(t=>t.id===id?{...t,...data}:t));else setTransactions([{...data,id:`tx-${Date.now()}`},...transactions]);setDialog(false);setEditing(null);toast(id?'Transaction updated':'Transaction added');}
  function remove(){if(deleting){setTransactions(transactions.filter(t=>t.id!==deleting.id));toast('Transaction deleted');setDeleting(null);}}
  const create=()=>{setEditing(null);setDialog(true)};
  return <div className="page-wrap"><PageTitle title="Transactions" action={<button className="btn btn-primary" onClick={create}><Plus size={14}/>Add Transaction</button>}/>
    <div className="transaction-tabs-row"><div className="tabs" aria-label="Transaction type"><a className={`tab ${mode==='all'?'active':''}`} href="/transactions" onClick={e=>{e.preventDefault();setPath('/transactions')}}>All Transactions</a><a className={`tab ${mode==='debit'?'active':''}`} href="/transactions/debit" onClick={e=>{e.preventDefault();setPath('/transactions/debit')}}>Debit</a><a className={`tab ${mode==='credit'?'active':''}`} href="/transactions/credit" onClick={e=>{e.preventDefault();setPath('/transactions/credit')}}>Credit</a></div>
      <details className="transaction-filters"><summary aria-label="Search, filter and sort transactions" title="Search, filter and sort"><Search size={15}/></summary><div className="table-tools"><label className="searchbox"><Search size={13}/><input aria-label="Search transactions" placeholder="Search transactions" value={search} onChange={e=>setSearch(e.target.value)} data-testid="input-search-transactions"/></label><select aria-label="Filter by category" className="select" value={category} onChange={e=>setCategory(e.target.value)}><option>All categories</option>{Array.from(new Set(transactions.map(t=>t.category))).map(c=><option key={c}>{c}</option>)}</select><select aria-label="Sort transactions" className="select" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="amount-high">Highest amount</option><option value="amount-low">Lowest amount</option></select></div></details>
    </div>
    <section className="panel transactions-panel">
      <TransactionsTable transactions={filtered} currency={profile.currency} ownerName={profile.name} showUserName={mode==='all'} showActions={mode!=='all'} onEdit={t=>{setEditing(t);setDialog(true)}} onDelete={setDeleting}/>
    </section>
    <TransactionDialog open={dialog} onClose={()=>setDialog(false)} onSave={save} edit={editing} currency={profile.currency}/>
    {deleting&&<ConfirmDialog title="Are you sure you want to Delete?" description={`“${deleting.title}” will be deleted immediately. You can't undo this action.`} onCancel={()=>setDeleting(null)} confirm={remove}/>}
  </div>;
}

function ProfilePage({profile,setProfile,toast}:{profile:Profile;setProfile:(p:Profile)=>void;toast:(m:string)=>void}) {
  const [form,setForm]=useState(profile);useEffect(()=>setForm(profile),[profile]);
  const [,setPath]=useLocation();
  function submit(e:FormEvent){e.preventDefault();if(form.name.trim().length<2||!form.email.includes('@'))return;setProfile({...form,name:form.name.trim()});toast('Profile details saved');}
  const openAdd=()=>{setPath('/transactions');window.setTimeout(()=>window.dispatchEvent(new Event('open-add-tx')),100)};
  return <div className="page-wrap"><PageTitle title="Profile" action={<button className="btn btn-primary" onClick={openAdd}><Plus size={14}/>Add Transaction</button>}/>
    <section className="panel profile-editor"><div className="profile-identity"><div className="profile-big-avatar">{initials(profile.name)}</div></div>
      <form className="profile-form" onSubmit={submit}><div className="form-grid">
        <div className="field"><label htmlFor="profile-name">Your Name</label><input id="profile-name" autoComplete="name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} minLength={2} required data-testid="input-profile-name"/></div>
        <div className="field"><label htmlFor="profile-username">User Name</label><input id="profile-username" autoComplete="username" value={form.username||form.name} onChange={e=>setForm({...form,username:e.target.value})}/></div>
        <div className="field"><label htmlFor="profile-email">Email</label><input id="profile-email" type="email" autoComplete="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required data-testid="input-profile-email"/></div>
        <div className="field"><label htmlFor="profile-password">Password</label><input id="profile-password" type="password" placeholder="••••••••" autoComplete="off" readOnly/></div>
        <div className="field"><label htmlFor="profile-birthdate">Date of Birth</label><input id="profile-birthdate" type="date" value={form.birthdate||''} onChange={e=>setForm({...form,birthdate:e.target.value})}/></div>
        <div className="field"><label htmlFor="profile-present">Present Address</label><input id="profile-present" autoComplete="street-address" value={form.presentAddress||''} onChange={e=>setForm({...form,presentAddress:e.target.value})}/></div>
        <div className="field"><label htmlFor="profile-address">Permanent Address</label><input id="profile-address" value={form.permanentAddress||''} onChange={e=>setForm({...form,permanentAddress:e.target.value})}/></div>
        <div className="field"><label htmlFor="profile-city">City</label><input id="profile-city" autoComplete="address-level2" value={form.city||''} onChange={e=>setForm({...form,city:e.target.value})}/></div>
        <div className="field"><label htmlFor="profile-postal">Postal Code</label><input id="profile-postal" autoComplete="postal-code" value={form.postalCode||''} onChange={e=>setForm({...form,postalCode:e.target.value})}/></div>
        <div className="field"><label htmlFor="profile-country">Country</label><input id="profile-country" autoComplete="country-name" value={form.country||''} onChange={e=>setForm({...form,country:e.target.value})}/></div>
      </div><details className="profile-preferences"><summary>Phone and currency preferences</summary><div className="form-grid"><div className="field"><label htmlFor="profile-phone">Phone number</label><input id="profile-phone" autoComplete="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div><div className="field"><label htmlFor="profile-currency">Currency</label><select id="profile-currency" value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}><option value="USD">USD — US Dollar</option><option value="EUR">EUR — Euro</option><option value="GBP">GBP — Pound sterling</option><option value="CAD">CAD — Canadian Dollar</option><option value="AUD">AUD — Australian Dollar</option></select></div></div></details>
      <div className="form-actions"><button className="btn btn-primary" type="submit"><Check size={13}/>Save Changes</button></div></form>
    </section>
  </div>;
}

function AdminDashboard() {
  const users=['Alex Morgan','Priya Shah','Jordan Lee','Elena Cruz','Marcus Chen'];
  const [,setPath]=useLocation();
  const balance=adminTransactions.reduce((s,t)=>s+(t.type==='credit'?t.amount:-t.amount),0);
  const adminIncome=adminTransactions.filter(t=>t.type==='credit').reduce((s,t)=>s+t.amount,0);
  const adminSpend=adminTransactions.filter(t=>t.type==='debit').reduce((s,t)=>s+t.amount,0);
  const memberCount=new Set(adminTransactions.map(t=>t.user)).size;
  return <div className="page-wrap"><PageTitle title="Admin Dashboard" description="A clear picture of activity across your community."/>
    <div className="metric-grid">{[{label:'Sample members',value:memberCount.toLocaleString(),sub:'Member accounts represented',icon:UserRound},{label:'Transactions in sample',value:adminTransactions.length.toLocaleString(),sub:'Recent member activity',icon:ArrowLeftRight},{label:'Money in',value:money(adminIncome,'USD'),sub:'Combined sample income',icon:TrendingUp},{label:'Money out',value:money(adminSpend,'USD'),sub:`Net flow ${money(balance,'USD')}`,icon:TrendingDown}].map((m,i)=><div className="metric-card" key={m.label}><div className="metric-top">{m.label}<span className="metric-icon"><m.icon size={15}/></span></div><div className="metric-value">{m.value}</div><div className="metric-sub">{m.sub}</div></div>)}</div>
     <div className="dashboard-columns"><TrendChart transactions={adminTransactions} title="Debit & Credit Overview" subtitle="Activity this week"/><section className="panel"><div className="panel-head"><div><div className="panel-title">Member accounts</div><div className="panel-note">Recently active</div></div></div><div className="breakdown">{users.slice(0,4).map((name,i)=><div className="breakdown-row" key={name}><span className="avatar">{initials(name)}</span><span className="breakdown-text"><strong>{name}</strong><small>{['Active now','Active 2h ago','Active yesterday','Active 3d ago'][i]}</small></span><span className="profile-badge">Active</span></div>)}</div></section></div>
     <section className="panel recent-panel"><div className="panel-head table-head"><div className="panel-title">Latest transactions</div><a className="btn btn-small" href="/admin/transactions" onClick={e=>{e.preventDefault();setPath('/admin/transactions')}}>View all <ArrowLeftRight size={12}/></a></div><TransactionsTable transactions={adminTransactions.slice(0,5)} currency="USD" admin compact/></section>
  </div>;
}
function AdminTransactions() {
  const [search,setSearch]=useState('');const [type,setType]=useState('all');const [sort,setSort]=useState('newest');
  const rows=useMemo(()=>adminTransactions.filter(t=>(type==='all'||t.type===type)&&[t.title,t.category,t.user||'',t.account].some(v=>v.toLowerCase().includes(search.toLowerCase()))).sort((a,b)=>sort==='oldest'?a.date.localeCompare(b.date):b.date.localeCompare(a.date)),[search,type,sort]);
  return <div className="page-wrap"><PageTitle title="All Transactions"/>
    <div className="admin-tools-row"><details className="transaction-filters"><summary aria-label="Search and filter admin transactions" title="Search and filter"><Search size={15}/></summary><div className="table-tools"><label className="searchbox"><Search size={13}/><input placeholder="Search members or activity" aria-label="Search admin transactions" value={search} onChange={e=>setSearch(e.target.value)}/></label><select className="select" aria-label="Filter transaction type" value={type} onChange={e=>setType(e.target.value)}><option value="all">All types</option><option value="debit">Debit</option><option value="credit">Credit</option></select><select className="select" aria-label="Sort admin transactions" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option></select></div></details></div>
    <section className="panel transactions-panel"><TransactionsTable transactions={rows} currency="USD" admin/></section>
  </div>;
}
function LogoutConfirm({onCancel,onConfirm}:{onCancel:()=>void;onConfirm:()=>void}) { return <ConfirmDialog title="Are you sure you want to Logout?" description="You will be signed out of Money Matters. You can sign back in at any time." onCancel={onCancel} confirm={onConfirm} danger={false}/>; }

function RoutedApp() {
  const [path,setPath]=useLocation();
  const [showLogout,setShowLogout]=useState(false);
  return <AppData>{data=>{
    const body=<Switch>
      <Route path="/dashboard"><Dashboard transactions={data.transactions} profile={data.profile}/></Route>
      <Route path="/transactions"><TransactionPage {...data}/></Route>
      <Route path="/transactions/debit"><TransactionPage {...data}/></Route>
      <Route path="/transactions/credit"><TransactionPage {...data}/></Route>
      <Route path="/profile"><ProfilePage profile={data.profile} setProfile={data.setProfile} toast={data.toast}/></Route>
      <Route path="/admin/dashboard"><AdminDashboard/></Route>
      <Route path="/admin/transactions"><AdminTransactions/></Route>
      <Route path="/"><Dashboard transactions={data.transactions} profile={data.profile}/></Route>
      <Route component={NotFound}/>
    </Switch>;
    return <><RouterShell profile={data.profile} onLogout={()=>setShowLogout(true)}>{body}</RouterShell>{showLogout&&<LogoutConfirm onCancel={()=>setShowLogout(false)} onConfirm={()=>{setShowLogout(false);setPath('/dashboard');data.toast('You are safely signed out');}}/>}</>;
  }}</AppData>;
}
const queryClient = new QueryClient();
function Router() { const [location]=useLocation(); return <ErrorBoundary resetKey={location}><RoutedApp/></ErrorBoundary>; }
function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}><Router/></WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>;
}
export default App;