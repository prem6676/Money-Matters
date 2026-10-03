import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import {
  ArrowDownLeft, ArrowLeftRight, Bell, BriefcaseBusiness, CarFront,
  ArrowUp, Check, ChevronDown, CircleHelp, Coffee, CreditCard, FileText, Home,
  LogOut, Pencil, Plus, Search, Settings, ShoppingBag,
  Trash2, TrendingDown, TrendingUp, UserRound, Wallet, X,
} from 'lucide-react';

type TxType = 'debit' | 'credit';
type Transaction = { id: string; title: string; category: string; type: TxType; amount: number; date: string; account: string; note: string; user?: string };
type Profile = { name: string; email: string; phone: string; currency: string };
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
const defaultProfile: Profile = { name:'Alex Morgan',email:'alex.morgan@email.com',phone:'+1 (415) 555-0182',currency:'USD' };
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
  try { const raw=localStorage.getItem(STORE_PROFILE); if (!raw) return defaultProfile; const p=JSON.parse(raw); if (p&&typeof p.name==='string'&&typeof p.email==='string'&&typeof p.phone==='string'&&typeof p.currency==='string') return p; } catch { /* recover from damaged storage */ }
  return defaultProfile;
}
const money = (amount:number,currency='USD') => `${currencySymbol(currency)}${Math.abs(amount).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const shortDate = (date:string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'});
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

function RouterShell({children,onLogout}:{children:ReactNode;onLogout:()=>void}) {
  const [path,setPath]=useLocation();
  const [popover,setPopover]=useState<'help'|'notifications'|null>(null);
  const admin=path.startsWith('/admin');
  const nav=admin?[
    {label:'Overview',href:'/admin/dashboard',icon:Home},
    {label:'Transactions',href:'/admin/transactions',icon:ArrowLeftRight},
  ]:[
    {label:'Overview',href:'/dashboard',icon:Home},
    {label:'Transactions',href:'/transactions',icon:ArrowLeftRight},
    {label:'My profile',href:'/profile',icon:UserRound},
  ];
  const activeTitle=path.includes('transactions')?'Transactions':path==='/profile'?'My profile':'Overview';
  return <div className="app-frame">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Wallet size={16}/></span><span>Money Matters</span></div>
      <div className="nav-label">{admin?'Administration':'Workspace'}</div>
    <nav aria-label="Main navigation">{nav.map(item=><a key={item.href} href={item.href} onClick={e=>{e.preventDefault();setPath(item.href)}} className={`nav-link ${path===item.href||(path==='/'&&item.href==='/dashboard')||(item.href==='/transactions'&&path.startsWith('/transactions'))?'active':''}`} data-testid={`link-${item.label.toLowerCase().replaceAll(' ','-')}`}><item.icon size={16}/><span>{item.label}</span></a>)}</nav>
      <div className="sidebar-bottom">
        <div className="workspace-switch"><span className="switch-label">View workspace</span><div className="switch-options"><a href="/dashboard" onClick={e=>{e.preventDefault();setPath('/dashboard')}} className={!admin?'active':''}>Personal</a><a href="/admin/dashboard" onClick={e=>{e.preventDefault();setPath('/admin/dashboard')}} className={admin?'active':''}>Admin</a></div></div>
        <div className="user-chip"><div className="avatar">{admin?'MM':'AM'}</div><div><strong>{admin?'Money Matters':'Alex Morgan'}</strong><small>{admin?'Administrator':'Personal account'}</small></div><button aria-label="Log out" className="icon-button" style={{marginLeft:'auto'}} onClick={onLogout}><LogOut size={15}/></button></div>
      </div>
    </aside>
    <main className="shell-main">
       <header className="topbar"><div className="crumb"><span>{admin?'Admin':'Personal'}</span><span style={{padding:'0 8px',color:'#c0c9c4'}}>/</span><b>{activeTitle}</b></div><div className="top-actions"><button className="icon-button mobile-menu" aria-label="Scroll to top" onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}><ArrowUp size={16}/></button><div style={{position:'relative'}}><button className="icon-button" aria-label="Help" aria-expanded={popover==='help'} onClick={()=>setPopover(popover==='help'?null:'help')}><CircleHelp size={16}/></button>{popover==='help'&&<div className="top-popover"><strong>Need a hand?</strong><span>Your money overview and transaction tools are always here.</span><a href="mailto:support@moneymatters.app">Contact support</a></div>}</div><div style={{position:'relative'}}><button className="icon-button" aria-label="Notifications" aria-expanded={popover==='notifications'} onClick={()=>setPopover(popover==='notifications'?null:'notifications')}><Bell size={16}/></button>{popover==='notifications'&&<div className="top-popover"><strong>You're all caught up</strong><span>No new account alerts at the moment.</span><button onClick={()=>setPopover(null)}>Dismiss</button></div>}</div><button className="top-user" aria-label={`Switch to ${admin?'personal':'admin'} workspace`} onClick={()=>setPath(admin?'/dashboard':'/admin/dashboard')}><span className="avatar" style={{width:28,height:28,fontSize:9}}>{admin?'MM':'AM'}</span>{admin?'Admin':'Alex'}<ChevronDown size={12}/></button><button className="icon-button" aria-label="Log out" onClick={onLogout}><LogOut size={15}/></button></div></header>
      {children}
    </main>
  </div>;
}

function PageTitle({eyebrow,title,description,action}:{eyebrow?:string;title:string;description:string;action?:ReactNode}) {
  return <div className="page-heading"><div>{eyebrow&&<div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1><p>{description}</p></div>{action}</div>;
}
function Metrics({transactions,currency}:{transactions:Transaction[];currency:string}) {
  const credits=transactions.filter(t=>t.type==='credit').reduce((s,t)=>s+t.amount,0);
  const debits=transactions.filter(t=>t.type==='debit').reduce((s,t)=>s+t.amount,0);
  const net=credits-debits;
  const metrics=[{label:'Total balance',value:money(net,currency),sub:'Across all transactions',icon:Wallet},{label:'Total income',value:money(credits,currency),sub:`${transactions.filter(t=>t.type==='credit').length} incoming transactions`,icon:TrendingUp},{label:'Total expenses',value:money(debits,currency),sub:`${transactions.filter(t=>t.type==='debit').length} outgoing transactions`,icon:TrendingDown},{label:'Savings rate',value:`${credits?Math.max(0,Math.round((net/credits)*100)):0}%`,sub:'Share of income retained',icon:BriefcaseBusiness}];
  return <div className="metric-grid">{metrics.map((m,i)=><div className="metric-card" key={m.label} data-testid={`metric-${i}`}><div className="metric-top">{m.label}<span className="metric-icon"><m.icon size={15}/></span></div><div className="metric-value">{m.value}</div><div className={`metric-sub ${i===0?'positive':''}`}>{m.sub}</div></div>)}</div>;
}
function TrendChart({transactions,title='Cash flow',subtitle='Income and expenses over time'}:{transactions:Transaction[];title?:string;subtitle?:string}) {
  const months=useMemo(()=>monthlyCashFlow(transactions),[transactions]);
  const max=Math.max(...months.flatMap(m=>[m.income,m.expense]),1000);
  const points=months.map((m,i)=>({x:35+i*88,y:190-(m.income/max)*145}));
  const line=points.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ');
  return <section className="panel chart-panel"><div className="panel-head"><div><div className="panel-title">{title}</div><div className="panel-note">{subtitle}</div></div><div className="chart-legend"><span><i className="legend-dot"/>Income</span><span><i className="legend-dot blue"/>Expenses</span></div></div>
    <div className="chart-area"><svg className="chart-svg" viewBox="0 0 510 220" role="img" aria-label="Monthly income and expense chart">
      {[45,90,135,180].map(y=><line key={y} x1="25" x2="500" y1={y} y2={y} stroke="#edf2ef" strokeDasharray="3 5"/>)}
      {months.map((m,i)=>{const x=28+i*88;const h1=m.income/max*140;const h2=m.expense/max*140;return <g key={m.name}><rect x={x+11} y={188-h1} width="20" height={h1} rx="5" fill="#56a77b"/><rect x={x+34} y={188-h2} width="20" height={h2} rx="5" fill="#9cc9dc"/></g>})}
      <path d={line} fill="none" stroke="#317d58" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {points.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#317d58" strokeWidth="2"/> )}
    </svg></div><div className="chart-labels">{months.map(m=><span key={m.name}>{m.name}</span>)}</div>
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

function TransactionsTable({transactions,currency,onEdit,onDelete,admin=false}:{transactions:Transaction[];currency:string;onEdit?:(tx:Transaction)=>void;onDelete?:(tx:Transaction)=>void;admin?:boolean}) {
  return <div className="table-scroll"><table className="data-table"><thead><tr><th>Transaction</th>{admin&&<th>Member</th>}<th>Category</th><th>Date</th><th>Account</th><th>Type</th><th style={{textAlign:'right'}}>Amount</th>{!admin&&<th/>}</tr></thead><tbody>
    {transactions.map(tx=>{const Icon=txIcon(tx.category);return <tr key={tx.id} data-testid={`row-transaction-${tx.id}`}><td><div className="transaction-name"><span className="tx-icon"><Icon size={14}/></span>{tx.title}</div></td>{admin&&<td>{tx.user||'Alex Morgan'}</td>}<td>{tx.category}</td><td>{shortDate(tx.date)}</td><td>{tx.account}</td><td><span className={`type-pill ${tx.type}`}>{tx.type==='credit'?'Credit':'Debit'}</span></td><td style={{textAlign:'right'}} className={`amount ${tx.type==='credit'?'positive':''}`}>{tx.type==='debit'?'−':'+'}{money(tx.amount,currency)}</td>{!admin&&<td><div className="row-actions"><button className="icon-button" title="Edit transaction" aria-label={`Edit ${tx.title}`} onClick={()=>onEdit?.(tx)}><Pencil size={13}/></button><button className="icon-button" title="Delete transaction" aria-label={`Delete ${tx.title}`} onClick={()=>onDelete?.(tx)}><Trash2 size={13}/></button></div></td>}</tr>})}
    </tbody></table>{transactions.length===0&&<div className="empty-state"><span className="empty-icon"><ArrowLeftRight size={18}/></span>No transactions found. Try changing your search or add a transaction.</div>}</div>;
}
function Dashboard({transactions,profile}:{transactions:Transaction[];profile:Profile}) {
  const [,setPath]=useLocation();
  const sorted=[...transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5);
  return <div className="page-wrap"><PageTitle eyebrow="Your finances, at a glance" title={`Good morning, ${profile.name.split(' ')[0]}`} description="Here's what's happening with your money today." action={<button className="btn btn-primary" onClick={()=>{setPath('/transactions');window.setTimeout(()=>window.dispatchEvent(new Event('open-add-tx')),100)}}><Plus size={14}/>Add transaction</button>}/>
    <Metrics transactions={transactions} currency={profile.currency}/><div className="dashboard-columns"><TrendChart transactions={transactions}/><CategoryBreakdown transactions={transactions} currency={profile.currency}/></div>
    <section className="panel recent-panel"><div className="panel-head table-head"><div><div className="panel-title">Recent transactions</div><div className="panel-note">Your latest account activity</div></div><a className="btn btn-small" href="/transactions" onClick={e=>{e.preventDefault();setPath('/transactions')}}>View all <ArrowLeftRight size={12}/></a></div><TransactionsTable transactions={sorted} currency={profile.currency}/></section>
  </div>;
}

function TransactionDialog({open,onClose,onSave,edit,currency}:{open:boolean;onClose:()=>void;onSave:(data:Omit<Transaction,'id'>,id?:string)=>void;edit:Transaction|null;currency:string}) {
  const [error,setError]=useState('');
  useEffect(()=>{setError('');},[edit,open]);
  useEffect(()=>{if(!open)return;const closeOnEscape=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',closeOnEscape);return()=>window.removeEventListener('keydown',closeOnEscape)},[open,onClose]);
  if(!open)return null;
  function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();const f=new FormData(e.currentTarget);const title=String(f.get('title')||'').trim();const amount=Number(f.get('amount'));const date=String(f.get('date')||'');if(title.length<2){setError('Add a transaction name with at least 2 characters.');return}if(!Number.isFinite(amount)||amount<=0){setError('Enter an amount greater than zero.');return}if(!date){setError('Choose a transaction date.');return}
    onSave({title,category:String(f.get('category')),type:String(f.get('type')) as TxType,amount,date,account:String(f.get('account')||'Everyday account'),note:String(f.get('note')||'')},edit?.id);}
  return <div className="dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="dialog" role="dialog" aria-modal="true" aria-labelledby="tx-dialog-title"><div className="dialog-head"><div><h2 id="tx-dialog-title">{edit?'Edit transaction':'Add transaction'}</h2><p>{edit?'Update the details of this transaction.':'Keep your money picture up to date.'}</p></div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={17}/></button></div>
    <form className="dialog-body" onSubmit={submit}><div className="form-grid">
      <div className="field" style={{gridColumn:'1 / -1'}}><label htmlFor="tx-title">Transaction name</label><input id="tx-title" name="title" defaultValue={edit?.title||''} placeholder="e.g. Weekly groceries" required autoFocus/></div>
      <div className="field"><label htmlFor="tx-type">Type</label><select id="tx-type" name="type" defaultValue={edit?.type||'debit'}><option value="debit">Debit / expense</option><option value="credit">Credit / income</option></select></div>
      <div className="field"><label htmlFor="tx-amount">Amount ({currencySymbol(currency)})</label><input id="tx-amount" name="amount" defaultValue={edit?.amount??''} placeholder="0.00" inputMode="decimal" type="number" min="0.01" step="0.01" required/></div>
      <div className="field"><label htmlFor="tx-category">Category</label><select id="tx-category" name="category" defaultValue={edit?.category||'Groceries'}>{['Groceries','Housing','Food & drink','Transport','Bills','Health','Shopping','Income','Other'].map(c=><option key={c}>{c}</option>)}</select></div>
      <div className="field"><label htmlFor="tx-date">Date</label><input id="tx-date" name="date" type="date" defaultValue={edit?.date||new Date().toISOString().slice(0,10)} required/></div>
      <div className="field" style={{gridColumn:'1 / -1'}}><label htmlFor="tx-account">Account</label><select id="tx-account" name="account" defaultValue={edit?.account||'Everyday account'}><option>Everyday account</option><option>Savings account</option><option>Visa •• 4812</option><option>Cash</option></select></div>
      <div className="field" style={{gridColumn:'1 / -1'}}><label htmlFor="tx-note">Note <span style={{fontWeight:400,color:'#a3ada7'}}>· optional</span></label><textarea id="tx-note" name="note" defaultValue={edit?.note||''} placeholder="Add a detail to remember"/></div>
    </div>{error&&<div role="alert" style={{color:'#bf5e58',fontSize:10,marginTop:12}}>{error}</div>}<div className="dialog-footer"><button type="button" className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary" type="submit"><Check size={13}/>{edit?'Save changes':'Add transaction'}</button></div></form></section></div>;
}
function ConfirmDialog({title,description,confirm,onCancel,danger=true}:{title:string;description:string;confirm:()=>void;onCancel:()=>void;danger?:boolean}) {
  useEffect(()=>{const closeOnEscape=(e:KeyboardEvent)=>{if(e.key==='Escape')onCancel()};window.addEventListener('keydown',closeOnEscape);return()=>window.removeEventListener('keydown',closeOnEscape)},[onCancel]);
  return <div className="dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onCancel()}}><section className="dialog small" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title"><div className="dialog-head"><div><h2 id="confirm-title">{title}</h2><p>Please confirm this action.</p></div><button className="icon-button" aria-label="Close dialog" onClick={onCancel}><X size={17}/></button></div><div className="dialog-body"><div className="confirm-copy">{description}</div><div className="dialog-footer"><button className="btn" onClick={onCancel}>Cancel</button><button className={`btn ${danger?'btn-danger':'btn-primary'}`} onClick={confirm}>{danger?<Trash2 size={13}/>:<LogOut size={13}/>} {danger?'Delete':'Log out'}</button></div></div></section></div>;
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
  return <div className="page-wrap"><PageTitle eyebrow="Your activity" title="Transactions" description="Every detail, in one clear view." action={<button className="btn btn-primary" onClick={create}><Plus size={14}/>Add transaction</button>}/>
    <div className="tabs" aria-label="Transaction type"><a className={`tab ${mode==='all'?'active':''}`} href="/transactions" onClick={e=>{e.preventDefault();setPath('/transactions')}}>All activity</a><a className={`tab ${mode==='debit'?'active':''}`} href="/transactions/debit" onClick={e=>{e.preventDefault();setPath('/transactions/debit')}}>Expenses</a><a className={`tab ${mode==='credit'?'active':''}`} href="/transactions/credit" onClick={e=>{e.preventDefault();setPath('/transactions/credit')}}>Income</a></div>
    <Metrics transactions={transactions} currency={profile.currency}/>
    <section className="panel transactions-panel"><div className="panel-head table-head"><div><div className="panel-title">{mode==='debit'?'Expenses':mode==='credit'?'Income':'All transactions'} <span style={{color:'#a0aaa5',fontSize:10,fontFamily:'DM Sans',fontWeight:500}}>({filtered.length})</span></div><div className="panel-note">Search, filter and manage your activity</div></div><div className="table-tools"><label className="searchbox"><Search size={13}/><input aria-label="Search transactions" placeholder="Search transactions" value={search} onChange={e=>setSearch(e.target.value)} data-testid="input-search-transactions"/></label><select aria-label="Filter by category" className="select" value={category} onChange={e=>setCategory(e.target.value)}><option>All categories</option>{Array.from(new Set(transactions.map(t=>t.category))).map(c=><option key={c}>{c}</option>)}</select><select aria-label="Sort transactions" className="select" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="amount-high">Highest amount</option><option value="amount-low">Lowest amount</option></select></div></div>
      <TransactionsTable transactions={filtered} currency={profile.currency} onEdit={t=>{setEditing(t);setDialog(true)}} onDelete={setDeleting}/>
    </section>
    <TransactionDialog open={dialog} onClose={()=>setDialog(false)} onSave={save} edit={editing} currency={profile.currency}/>
    {deleting&&<ConfirmDialog title="Delete transaction?" description={`“${deleting.title}” will be removed from your transaction history. This action can't be undone.`} onCancel={()=>setDeleting(null)} confirm={remove}/>}
  </div>;
}

function ProfilePage({profile,setProfile,toast}:{profile:Profile;setProfile:(p:Profile)=>void;toast:(m:string)=>void}) {
  const [form,setForm]=useState(profile);useEffect(()=>setForm(profile),[profile]);
  function submit(e:FormEvent){e.preventDefault();if(form.name.trim().length<2||!form.email.includes('@'))return;setProfile({...form,name:form.name.trim()});toast('Profile details saved');}
  return <div className="page-wrap"><PageTitle eyebrow="Your account" title="My profile" description="Manage your personal details and preferences."/>
    <div className="profile-grid"><section className="panel profile-card"><div className="profile-big-avatar">{initials(profile.name)}</div><h2>{profile.name}</h2><p>{profile.email}</p><span className="profile-badge">Personal account</span><div style={{textAlign:'left',borderTop:'1px solid #edf1ee',marginTop:23,paddingTop:17}}><div style={{fontSize:9,textTransform:'uppercase',letterSpacing:'.8px',fontWeight:700,color:'#a1aca5',marginBottom:9}}>Account details</div><div style={{fontSize:11,color:'#748078',lineHeight:2.1}}>Member since <b style={{color:'#4c5d54'}}>January 2024</b><br/>Plan <b style={{color:'#4c5d54'}}>Personal</b></div></div></section>
      <form className="panel profile-form" onSubmit={submit}><div className="panel-title" style={{marginBottom:5}}>Personal information</div><div className="panel-note" style={{marginBottom:22}}>Your profile is only visible to you.</div><div className="form-grid"><div className="field"><label htmlFor="profile-name">Full name</label><input id="profile-name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} minLength={2} required data-testid="input-profile-name"/></div><div className="field"><label htmlFor="profile-email">Email address</label><input id="profile-email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required data-testid="input-profile-email"/></div><div className="field"><label htmlFor="profile-phone">Phone number</label><input id="profile-phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div><div className="field"><label htmlFor="profile-currency">Preferred currency</label><select id="profile-currency" value={form.currency} onChange={e=>setForm({...form,currency:e.target.value})}><option value="USD">USD — US Dollar</option><option value="EUR">EUR — Euro</option><option value="GBP">GBP — Pound sterling</option><option value="CAD">CAD — Canadian Dollar</option><option value="AUD">AUD — Australian Dollar</option></select></div></div><div className="form-actions"><button className="btn btn-primary" type="submit"><Check size={13}/>Save changes</button></div></form></div>
  </div>;
}

function AdminDashboard() {
  const users=['Alex Morgan','Priya Shah','Jordan Lee','Elena Cruz','Marcus Chen'];
  const [,setPath]=useLocation();
  const balance=adminTransactions.reduce((s,t)=>s+(t.type==='credit'?t.amount:-t.amount),0);
  const adminIncome=adminTransactions.filter(t=>t.type==='credit').reduce((s,t)=>s+t.amount,0);
  const adminSpend=adminTransactions.filter(t=>t.type==='debit').reduce((s,t)=>s+t.amount,0);
  const memberCount=new Set(adminTransactions.map(t=>t.user)).size;
  return <div className="page-wrap"><div className="admin-banner"><Settings size={12}/> ADMIN VIEW · SAMPLE DATA</div><PageTitle eyebrow="Platform overview" title="Admin dashboard" description="A clear picture of activity across your community."/>
    <div className="metric-grid">{[{label:'Sample members',value:memberCount.toLocaleString(),sub:'Member accounts represented',icon:UserRound},{label:'Transactions in sample',value:adminTransactions.length.toLocaleString(),sub:'Recent member activity',icon:ArrowLeftRight},{label:'Money in',value:money(adminIncome,'USD'),sub:'Combined sample income',icon:TrendingUp},{label:'Money out',value:money(adminSpend,'USD'),sub:`Net flow ${money(balance,'USD')}`,icon:TrendingDown}].map((m,i)=><div className="metric-card" key={m.label}><div className="metric-top">{m.label}<span className="metric-icon"><m.icon size={15}/></span></div><div className="metric-value">{m.value}</div><div className="metric-sub">{m.sub}</div></div>)}</div>
     <div className="dashboard-columns"><TrendChart transactions={adminTransactions} title="Platform cash flow" subtitle="Sample transaction activity · last six months"/><section className="panel"><div className="panel-head"><div><div className="panel-title">Member accounts</div><div className="panel-note">Recently active</div></div></div><div className="breakdown">{users.slice(0,4).map((name,i)=><div className="breakdown-row" key={name}><span className="avatar">{initials(name)}</span><span className="breakdown-text"><strong>{name}</strong><small>{['Active now','Active 2h ago','Active yesterday','Active 3d ago'][i]}</small></span><span className="profile-badge">Active</span></div>)}</div></section></div>
    <section className="panel recent-panel"><div className="panel-head table-head"><div><div className="panel-title">Latest transactions</div><div className="panel-note">Recent sample activity across member accounts</div></div><a className="btn btn-small" href="/admin/transactions" onClick={e=>{e.preventDefault();setPath('/admin/transactions')}}>View all <ArrowLeftRight size={12}/></a></div><TransactionsTable transactions={adminTransactions.slice(0,5)} currency="USD" admin/></section>
  </div>;
}
function AdminTransactions() {
  const [search,setSearch]=useState('');const [type,setType]=useState('all');const [sort,setSort]=useState('newest');
  const rows=useMemo(()=>adminTransactions.filter(t=>(type==='all'||t.type===type)&&[t.title,t.category,t.user||'',t.account].some(v=>v.toLowerCase().includes(search.toLowerCase()))).sort((a,b)=>sort==='oldest'?a.date.localeCompare(b.date):b.date.localeCompare(a.date)),[search,type,sort]);
  return <div className="page-wrap"><div className="admin-banner"><Settings size={12}/> ADMIN VIEW · SAMPLE DATA</div><PageTitle eyebrow="Platform activity" title="All transactions" description="Review transaction activity across all sample members."/>
    <section className="panel transactions-panel"><div className="panel-head table-head"><div><div className="panel-title">Transaction log <span style={{color:'#a0aaa5',fontSize:10,fontFamily:'DM Sans',fontWeight:500}}>({rows.length})</span></div><div className="panel-note">Showing realistic sample member data</div></div><div className="table-tools"><label className="searchbox"><Search size={13}/><input placeholder="Search members or activity" aria-label="Search admin transactions" value={search} onChange={e=>setSearch(e.target.value)}/></label><select className="select" aria-label="Filter transaction type" value={type} onChange={e=>setType(e.target.value)}><option value="all">All types</option><option value="debit">Debit</option><option value="credit">Credit</option></select><select className="select" aria-label="Sort admin transactions" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option></select></div></div><TransactionsTable transactions={rows} currency="USD" admin/></section>
  </div>;
}
function LogoutConfirm({onCancel,onConfirm}:{onCancel:()=>void;onConfirm:()=>void}) { return <ConfirmDialog title="Log out of Money Matters?" description="You'll need to sign in again to see your accounts and transaction history." onCancel={onCancel} confirm={onConfirm} danger={false}/>; }

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
    return <><RouterShell onLogout={()=>setShowLogout(true)}>{body}</RouterShell>{showLogout&&<LogoutConfirm onCancel={()=>setShowLogout(false)} onConfirm={()=>{setShowLogout(false);setPath('/dashboard');data.toast('You are safely signed out');}}/>}</>;
  }}</AppData>;
}
const queryClient = new QueryClient();
function Router() { const [location]=useLocation(); return <ErrorBoundary resetKey={location}><RoutedApp/></ErrorBoundary>; }
function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/,'')}><Router/></WouterRouter><Toaster/></TooltipProvider></QueryClientProvider>;
}
export default App;