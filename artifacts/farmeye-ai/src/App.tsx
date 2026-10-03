import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Link, Route, Switch, useLocation } from 'wouter';
import { Activity, ArrowRight, BarChart3, Bell, Camera, Check, ChevronDown, CircleHelp, Cloud, CloudRain, Droplets, FileText, Home, ImagePlus, Leaf, MapPin, Menu, Mic, Plus, Sprout, Sun, Trash2, Upload, Wallet, Wind, X } from 'lucide-react';
import { demoAdapters, readFarm, sampleWeather, writeFarm, type Analysis, type AssistantLanguage, type AssistantRequest, type Crop, type Expense, type FarmData, type ChatMessage } from './data';
import './index.css';

const navItems=[{href:'/dashboard',label:'Today',icon:Home},{href:'/crop-doctor',label:'Crop doctor',icon:Camera},{href:'/assistant',label:'Ask FarmEye',icon:CircleHelp},{href:'/weather',label:'Weather',icon:Cloud},{href:'/expenses',label:'Expenses',icon:Wallet},{href:'/history',label:'Field history',icon:FileText}];
const todayLabel=new Intl.DateTimeFormat('en-IN',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
const weekdayLabel=new Intl.DateTimeFormat('en-IN',{weekday:'long'}).format(new Date());
const rupees=(n:number)=>`₹${n.toLocaleString('en-IN')}`;
const niceDate=(s:string)=>new Intl.DateTimeFormat('en-IN',{day:'numeric',month:'short',year:'numeric'}).format(new Date(s));
const uid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random());

function App(){
 const [farm,setFarm]=useState<FarmData>(()=>readFarm());
 const [storageError,setStorageError]=useState(false);
 const [toast,setToast]=useState('');
 const [location]=useLocation();
 const [mobileOpen,setMobileOpen]=useState(false);
 useEffect(()=>{const saved=writeFarm(farm);setStorageError(!saved)},[farm]);
 useEffect(()=>{if(storageError)setToast('Farm data could not be saved on this device. Changes may not survive a refresh.')},[storageError]);
 useEffect(()=>{if(!toast)return;const t=window.setTimeout(()=>setToast(''),2800);return()=>window.clearTimeout(t)},[toast]);
 useEffect(()=>setMobileOpen(false),[location]);
 const updateFarm=(fn:(current:FarmData)=>FarmData)=>setFarm(current=>fn(current));
  const shell=(children:ReactNode)=><div className="app-shell"><aside className="hidden lg:flex fixed inset-y-0 left-0 w-[248px] bg-[#20392c] text-[#eeeedd] flex-col px-5 py-6 z-30"><Link href="/dashboard" className="flex items-center gap-3 px-2 mb-10"><div className="w-10 h-10 rounded-[14px] bg-[#dce7a6] text-[#284634] flex items-center justify-center"><Sprout size={23}/></div><div><div className="font-bold text-[18px] tracking-tight">FarmEye<span className="text-[#dce7a6]"> AI</span></div><div className="text-[10px] text-[#a7b7a0] tracking-[.18em] uppercase">Your farm, in focus</div></div></Link><div className="text-[10px] uppercase tracking-[.18em] text-[#a6b49e] px-3 mb-3">Farm workspace</div><nav className="space-y-1">{navItems.map(({href,label,icon:Icon})=><Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ','-')}`} className={`flex items-center gap-3 py-3 px-3 rounded-xl text-[14px] font-medium transition-colors hover:bg-white/10 ${location===href||location==='/'&&href==='/dashboard'?'nav-active':''}`}><Icon size={18} strokeWidth={1.8}/>{label}{label==='Crop doctor'&&<span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#a9c66d]"/>}</Link>)}</nav><div className="mt-auto rounded-2xl bg-[#2c4938] border border-white/10 p-4 soft-dots"><div className="w-9 h-9 rounded-xl bg-[#405d46] flex items-center justify-center mb-3"><Leaf size={18} className="text-[#dce7a6]"/></div><p className="text-sm font-semibold">A note on FarmEye</p><p className="text-xs text-[#b7c3b1] leading-relaxed mt-1">A helpful demo companion. Recommendations need a local expert’s eye.</p><div className="text-[10px] mt-3 text-[#dce7a6] uppercase tracking-wider">Demo workspace</div></div><div className="flex items-center gap-3 mt-5 px-2"><div className="w-9 h-9 rounded-full bg-[#d5dfb5] flex items-center justify-center text-sm font-bold text-[#294434]">AP</div><div className="min-w-0"><p className="text-sm font-semibold truncate">{farm.farmer.name}</p><p className="text-[11px] text-[#b3c0ac] truncate">{farm.farmer.farm}</p></div><button className="ml-auto text-[#b3c0ac] hover:text-white" aria-label="Farm profile details" onClick={()=>setToast(`${farm.farmer.farm} · ${farm.farmer.location}`)}><ChevronDown size={16}/></button></div></aside><div className="lg:pl-[248px] min-h-[100dvh]"><header className="sticky top-0 z-20 bg-[#f2f0e7]/95 backdrop-blur border-b border-[#e1dfd3] px-4 sm:px-7 lg:px-10 h-[68px] flex items-center justify-between"><div className="flex items-center gap-3"><button className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-black/5" aria-label="Open navigation" onClick={()=>setMobileOpen(!mobileOpen)}><Menu size={20}/></button><div className="lg:hidden flex items-center gap-2 font-bold"><Sprout size={20} className="text-[#416b43]"/>FarmEye <span className="text-[#728b48]">AI</span></div><div className="hidden lg:block text-[13px] text-[#7b8173]">{farm.farmer.location}<span className="mx-2">/</span><span className="text-[#374c3b] font-medium">{navItems.find(n=>n.href===location)?.label||'Today'}</span></div></div><div className="flex items-center gap-3"><div className="hidden sm:flex items-center gap-2 text-xs text-[#6f796e] bg-[#e9e8dd] px-3 py-2 rounded-full"><span className="w-2 h-2 rounded-full bg-[#87a557]"/>{todayLabel}</div><button onClick={()=>setToast('You’re all caught up.')} className="w-9 h-9 rounded-full border border-[#dfded2] flex items-center justify-center hover:bg-white" aria-label="Notifications"><Bell size={17}/></button><div className="w-9 h-9 rounded-full bg-[#d5dfb5] flex items-center justify-center text-xs font-bold text-[#294434] lg:hidden">AP</div></div></header>{mobileOpen&&<div className="lg:hidden fixed inset-0 z-40 bg-[#182d22]/40" onClick={()=>setMobileOpen(false)}><div className="bg-[#20392c] text-[#eeeedd] w-[min(82vw,300px)] h-full p-5" onClick={e=>e.stopPropagation()}><div className="flex justify-between mb-7"><div className="font-bold text-lg flex gap-2"><Sprout/>FarmEye AI</div><button aria-label="Close navigation" onClick={()=>setMobileOpen(false)}><X/></button></div><nav className="space-y-1">{navItems.map(({href,label,icon:Icon})=><Link key={href} href={href} className={`flex items-center gap-3 py-3 px-3 rounded-xl text-sm ${location===href?'nav-active':''}`}><Icon size={18}/>{label}</Link>)}</nav></div></div>}<main className="px-4 sm:px-7 lg:px-10 py-7 sm:py-9 max-w-[1500px] mx-auto pb-28 lg:pb-10 animate-in"><Switch><Route path="/"><Dashboard farm={farm}/></Route><Route path="/dashboard"><Dashboard farm={farm}/></Route><Route path="/crop-doctor"><CropDoctor farm={farm} updateFarm={updateFarm} notify={setToast}/></Route><Route path="/assistant"><Assistant farm={farm} updateFarm={updateFarm}/></Route><Route path="/weather"><Weather/></Route><Route path="/expenses"><Expenses farm={farm} updateFarm={updateFarm} notify={setToast}/></Route><Route path="/history"><History farm={farm} updateFarm={updateFarm} notify={setToast}/></Route><Route><NotFound/></Route></Switch></main><nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#fbfaf5]/95 backdrop-blur border-t border-[#dedccf] px-1 pt-2 pb-[max(8px,env(safe-area-inset-bottom))] flex justify-around">{navItems.map(({href,label,icon:Icon})=><Link key={href} href={href} className={`flex flex-col items-center gap-1 px-1 py-1.5 rounded-lg text-[9px] min-w-0 ${location===href?'text-[#3f7047]':'text-[#828679]'}`}><Icon size={19}/><span className="truncate max-w-[54px]">{label==='Ask FarmEye'?'Ask':label==='Field history'?'History':label==='Crop doctor'?'Crops':label}</span></Link>)}</nav>{toast&&<div role="status" className="fixed z-50 bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 bg-[#20392c] text-[#f7f5eb] text-sm px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in"><Check size={16} className="text-[#dce7a6]"/>{toast}</div>}</div></div>;
 return shell(<></>);
}
function PageTitle({eyebrow,title,subtitle,action}:{eyebrow:string;title:string;subtitle:string;action?:ReactNode}){return <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7"><div><div className="text-[10px] uppercase tracking-[.18em] text-[#82906e] font-bold mb-2">{eyebrow}</div><h1 className="serif text-[32px] sm:text-[38px] leading-[1.08] text-[#263d2f]">{title}</h1><p className="text-sm text-[#788075] mt-2">{subtitle}</p></div>{action}</div>}
function Card({children,className=''}:{children:ReactNode;className?:string}){return <section className={`panel p-5 sm:p-6 ${className}`}>{children}</section>}
function Eyebrow({children}:{children:ReactNode}){return <div className="text-[10px] uppercase tracking-[.15em] text-[#82906e] font-bold">{children}</div>}
function Button({children,onClick,type='button',variant='primary',disabled=false,className='','data-testid':testId}:{children:ReactNode;onClick?:()=>void;type?:'button'|'submit';variant?:'primary'|'outline'|'ghost';disabled?:boolean;className?:string;'data-testid'?:string}){const styles={primary:'bg-[#315c3e] text-[#f8f5e9] hover:bg-[#264b32] shadow-sm',outline:'border border-[#d7d8ca] text-[#36533c] hover:bg-[#f0f1e6]',ghost:'text-[#60725f] hover:bg-[#eff0e7]'};return <button type={type} data-testid={testId} onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}>{children}</button>}

function Dashboard({farm}:{farm:FarmData}){
 const total=farm.expenses.reduce((s,e)=>s+e.amount,0);
 return <><PageTitle eyebrow={`${todayLabel} · farm overview`} title={`Good morning, ${farm.farmer.name.split(' ')[0]}.`} subtitle={`${farm.farmer.farm} · ${farm.farmer.location}`} action={<Link href="/crop-doctor" className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-[#315c3e] text-white hover:bg-[#264b32]"><Camera size={16}/>Check a crop</Link>}/>
 <div className="grid grid-cols-1 xl:grid-cols-[1.55fr_.9fr] gap-5">
 <div className="space-y-5">
  <div className="relative overflow-hidden rounded-[22px] bg-[#294b37] text-[#f6f4e8] p-6 sm:p-8 min-h-[228px] flex flex-col justify-between soft-dots"><div className="absolute right-[-28px] top-[-52px] w-64 h-64 rounded-full border border-[#dce7a6]/15"/><div className="absolute right-8 top-9 w-36 h-36 rounded-full border border-[#dce7a6]/20"/><div className="relative z-10"><span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-[#f4f2df]/10 border border-white/10 text-[11px] text-[#dce7a6]"><span className="w-1.5 h-1.5 bg-[#dce7a6] rounded-full"/>TODAY ON YOUR FARM</span><h2 className="serif text-[29px] sm:text-[35px] leading-tight mt-5 max-w-[410px]">A steady day starts with a good look.</h2><p className="text-sm text-[#c2cfbd] mt-2 max-w-[380px]">Warm afternoon ahead. Check the soil before your next irrigation.</p></div><div className="relative z-10 flex flex-wrap gap-2 mt-6"><Link href="/weather" className="text-xs font-semibold flex items-center gap-2 bg-[#dce7a6] text-[#2b4634] rounded-lg px-3.5 py-2.5">See farm weather <ArrowRight size={14}/></Link><Link href="/assistant" className="text-xs text-[#f5f3e9] border border-white/25 rounded-lg px-3.5 py-2.5 hover:bg-white/10">Ask a question</Link></div><div className="absolute right-9 bottom-8 text-[#dce7a6]/70 hidden sm:block"><Sprout size={66} strokeWidth={1}/></div></div>
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3"><Metric icon={<Sprout size={17}/>} label="Active crops" value={String(farm.crops.length)} note="Across 3.5 acres" tone="green"/><Metric icon={<Activity size={17}/>} label="Field notes" value={String(farm.reports.length)} note="Saved reports" tone="gold"/><Metric icon={<Wallet size={17}/>} label="This month" value={rupees(total)} note="Recorded expenses" tone="blue"/></div>
  <Card><div className="flex justify-between items-start gap-3 mb-5"><div><Eyebrow>Growing now</Eyebrow><h3 className="serif text-xl mt-1">Your crops</h3></div><Link className="text-xs font-semibold text-[#53734c] flex items-center gap-1" href="/history">View field history <ArrowRight size={14}/></Link></div><div className="divide-y divide-[#eceae0]">{farm.crops.length===0?<Empty icon={<Sprout/>} title="No crops on record" body="Add a crop in Crop doctor to start a field record." href="/crop-doctor" link="Add your first crop"/>:farm.crops.slice(0,4).map(c=><div key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0" data-testid={`crop-summary-${c.id}`}><div className="w-10 h-10 rounded-xl bg-[#e9edda] text-[#53724a] flex items-center justify-center"><Leaf size={19}/></div><div className="min-w-0 flex-1"><div className="font-semibold text-sm">{c.name} <span className="text-[#929486] font-normal">· {c.variety}</span></div><div className="text-xs text-[#858a7e] mt-0.5">{c.area} · planted {niceDate(c.plantedAt)}</div></div><span className="text-[10px] rounded-full bg-[#edf0e2] text-[#59754f] px-2.5 py-1">{c.status}</span></div>)}</div></Card>
 </div>
 <div className="space-y-5">
 <WeatherMini/>
 <Card className="!bg-[#f2ead9] !border-[#e8dcc1]"><div className="flex gap-3"><div className="w-9 h-9 shrink-0 rounded-xl bg-[#eadcbf] text-[#927342] flex items-center justify-center"><Bell size={17}/></div><div className="min-w-0"><div className="flex flex-wrap justify-between items-center gap-2"><Eyebrow>AI farming alerts · sample</Eyebrow><span className="text-[9px] uppercase tracking-wider rounded-full bg-white/60 text-[#927342] px-2 py-1">Check today</span></div><h3 className="font-semibold text-sm mt-2">A quick soil check may help</h3><p className="text-xs leading-relaxed text-[#756e5e] mt-1">Demo alert based on the sample outlook: check soil moisture before irrigating on a warm afternoon.</p><Link href="/weather" className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-[#795f37]">Review weather outlook <ArrowRight size={13}/></Link></div></div></Card>
 <Card className="bg-[#e8ebd8] border-[#d9dec8]"><div className="flex items-start justify-between"><div><Eyebrow>Field check-in</Eyebrow><h3 className="serif text-xl mt-1">Anything look different?</h3></div><div className="w-10 h-10 rounded-full bg-[#d4dfbb] flex items-center justify-center text-[#507047]"><ImagePlus size={19}/></div></div><p className="text-sm text-[#66705e] mt-3 leading-relaxed">A clear photo can help you keep track of changes. Demo analysis is preliminary, not a diagnosis.</p><Link href="/crop-doctor" className="inline-flex items-center gap-2 mt-4 text-sm font-bold text-[#315c3e]">Take a crop photo <ArrowRight size={16}/></Link></Card>
 <Card><div className="flex justify-between items-center mb-4"><div><Eyebrow>Recent activity</Eyebrow><h3 className="serif text-xl mt-1">Field notes</h3></div><FileText className="text-[#728565]" size={19}/></div>{farm.reports.length===0?<div className="rounded-xl bg-[#f3f2eb] p-4 text-sm text-[#798073]">Your saved crop reports will show up here.</div>:farm.reports.slice(0,2).map(report=><div key={report.id} className="py-3 border-t border-[#eeece3]"><div className="flex justify-between gap-3"><span className="font-semibold text-sm">{report.cropName}</span><span className="text-[10px] text-[#87907e]">{niceDate(report.createdAt)}</span></div><p className="text-xs text-[#737d70] mt-1">{report.issue}</p></div>)}<Link href="/history" className="mt-4 text-xs font-semibold text-[#53734c] inline-flex items-center gap-1">Open history <ArrowRight size={13}/></Link></Card>
 </div></div></>
}
function Metric({icon,label,value,note,tone}:{icon:ReactNode;label:string;value:string;note:string;tone:string}){return <div className="panel px-4 py-4"><div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tone==='green'?'bg-[#e7eedb] text-[#587b4b]':tone==='gold'?'bg-[#f3e9d4] text-[#a1783e]':'bg-[#dfe9e8] text-[#49756f]'}`}>{icon}</div><div className="text-[11px] text-[#7d8377] mt-3">{label}</div><div className="text-[19px] font-bold tracking-tight mt-0.5">{value}</div><div className="text-[10px] text-[#92978c] mt-1">{note}</div></div>}
function WeatherMini(){return <Card className="!p-0 overflow-hidden"><div className="p-5 bg-[#e9eddf] flex justify-between items-center"><div><Eyebrow>Farm weather · sample</Eyebrow><div className="text-sm text-[#65705f] mt-1">Nashik, Maharashtra</div></div><div className="w-12 h-12 rounded-2xl weather-sun flex items-center justify-center text-white"><Sun size={25}/></div></div><div className="px-5 pt-4 pb-5"><div className="flex items-end gap-2"><span className="serif text-[38px] leading-none">31°</span><span className="text-sm text-[#778072] mb-1">Warm, showers possible</span></div><div className="grid grid-cols-3 gap-2 mt-5 text-xs"><div className="flex items-center gap-1.5 text-[#6e796a]"><CloudRain size={14}/>35% rain</div><div className="flex items-center gap-1.5 text-[#6e796a]"><Droplets size={14}/>61% humid</div><div className="flex items-center gap-1.5 text-[#6e796a]"><Wind size={14}/>12 km/h</div></div><Link href="/weather" className="flex justify-between items-center text-xs font-semibold text-[#53734c] border-t border-[#eeece3] mt-4 pt-3">Plan around weather <ArrowRight size={14}/></Link></div></Card>}
function Empty({icon,title,body,href,link}:{icon:ReactNode;title:string;body:string;href:string;link:string}){return <div className="py-10 text-center"><div className="mx-auto w-12 h-12 rounded-2xl bg-[#edf0e3] text-[#69815a] flex items-center justify-center">{icon}</div><h3 className="font-semibold mt-3">{title}</h3><p className="text-sm text-[#82877b] max-w-sm mx-auto mt-1">{body}</p><Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-[#53734c] mt-4">{link}<ArrowRight size={15}/></Link></div>}

function CropDoctor({farm,updateFarm,notify}:{farm:FarmData;updateFarm:(fn:(c:FarmData)=>FarmData)=>void;notify:(s:string)=>void}){
 const [cropId,setCropId]=useState(farm.crops[0]?.id||'');
 const [image,setImage]=useState('');
  const [imageFile,setImageFile]=useState<File|null>(null);
 const [fileName,setFileName]=useState('');
  const [uploading,setUploading]=useState(false);
  const [uploadError,setUploadError]=useState('');
 const [loading,setLoading]=useState(false);
 const [analysis,setAnalysis]=useState<Analysis|null>(null);
  const [analysisError,setAnalysisError]=useState('');
 const [showAdd,setShowAdd]=useState(false);
 const [cropName,setCropName]=useState(''); const [variety,setVariety]=useState(''); const [area,setArea]=useState('');
 const fileRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{if(!farm.crops.some(c=>c.id===cropId))setCropId(farm.crops[0]?.id||'')},[farm.crops,cropId]);
 const chosen=farm.crops.find(c=>c.id===cropId);
  const handleFile=(e:ChangeEvent<HTMLInputElement>)=>{const input=e.currentTarget;const f=input.files?.[0];if(!f)return;input.value='';if(!f.type.startsWith('image/')){setUploadError('Choose an image file such as JPG, PNG, or WEBP.');return}if(f.size>5*1024*1024){setUploadError('Image is too large. Choose a photo under 5 MB.');return}setUploadError('');setAnalysisError('');setAnalysis(null);setUploading(true);const reader=new FileReader();reader.onload=()=>{if(typeof reader.result!=='string'){setUploadError('Could not preview that photo. Try another image.');setUploading(false);return}setImage(reader.result);setImageFile(f);setFileName(f.name);setUploading(false)};reader.onerror=()=>{setUploadError('Could not read that photo. Try another image.');setUploading(false)};reader.readAsDataURL(f)};
  const analyze=async()=>{if(!image||!imageFile){setUploadError('Choose a crop photo before analysis.');return}if(!chosen){setAnalysisError('Choose or add a crop before analysis.');return}setLoading(true);setAnalysisError('');setAnalysis(null);try{const result=await demoAdapters.cropAnalysis.analyze({cropName:chosen.name,image:imageFile});setAnalysis({...result,image})}catch{setAnalysisError('The demo analysis could not be completed. Try another photo, or try again in a moment.')}finally{setLoading(false)}};
 const save=()=>{if(!analysis)return;updateFarm(d=>({...d,reports:[analysis,...d.reports],crops:d.crops.map(c=>c.id===cropId?{...c,latestAnalysis:analysis}:c)}));notify('Preliminary report saved to Field history.');setAnalysis(null)};
 const addCrop=(e:FormEvent)=>{e.preventDefault();if(!cropName.trim()||!area.trim())return;const crop:Crop={id:uid(),name:cropName.trim(),variety:variety.trim()||'Variety not noted',plantedAt:new Date().toISOString().slice(0,10),area:area.trim(),status:'New planting'};updateFarm(d=>({...d,crops:[crop,...d.crops]}));setCropId(crop.id);setShowAdd(false);setCropName('');setVariety('');setArea('');notify(`${crop.name} added to your crops.`)};
  return <><PageTitle eyebrow="Crop doctor · photo intake" title="Take a closer look." subtitle="Upload a crop photo for a crop-specific demo observation. Your image is not sent to an AI service."/><div className="grid lg:grid-cols-[1.05fr_.95fr] gap-5 items-start"><div className="space-y-5"><Card><div className="flex items-center justify-between mb-4"><div><Eyebrow>Step 1 · Choose a crop</Eyebrow><h2 className="font-bold text-lg mt-1">Which field are we looking at?</h2></div><button type="button" className="text-xs font-semibold text-[#55744d] flex gap-1 items-center" onClick={()=>setShowAdd(!showAdd)}><Plus size={14}/> Add crop</button></div>{showAdd&&<form onSubmit={addCrop} className="grid sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#f0f1e8] mb-4"><label className="text-xs font-semibold">Crop name<input required value={cropName} onChange={e=>setCropName(e.target.value)} placeholder="e.g. Chilli" className="field mt-1"/></label><label className="text-xs font-semibold">Variety<input value={variety} onChange={e=>setVariety(e.target.value)} placeholder="Optional" className="field mt-1"/></label><label className="text-xs font-semibold">Area<input required value={area} onChange={e=>setArea(e.target.value)} placeholder="e.g. 0.5 acres" className="field mt-1"/></label><div className="flex items-end gap-2"><Button type="submit" className="!py-2">Save crop</Button><Button variant="ghost" onClick={()=>setShowAdd(false)} className="!py-2">Cancel</Button></div></form>}<label htmlFor="crop-select" className="sr-only">Select a crop</label><select id="crop-select" value={cropId} onChange={e=>{setCropId(e.target.value);setAnalysis(null);setAnalysisError('')}} className="field">{farm.crops.length===0?<option value="">Add a crop to begin</option>:farm.crops.map(c=><option key={c.id} value={c.id}>{c.name} · {c.variety} · {c.area}</option>)}</select><div className="flex justify-between items-center mt-5 mb-3 gap-3"><Eyebrow>Step 2 · Add a clear photo</Eyebrow><span className="text-[11px] text-[#8b8f83] text-right">JPG, PNG or WEBP · up to 5 MB</span></div><input className="sr-only" ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} aria-label="Upload or take a crop photo"/>{image?<div className="relative overflow-hidden rounded-2xl border border-[#deded1] bg-[#ecebe2]"><img src={image} alt={`Preview of ${fileName || 'selected crop photo'}`} className="w-full max-h-[340px] object-contain"/><div className="absolute bottom-3 left-3 max-w-[80%] truncate rounded-lg bg-[#20392c]/85 text-white text-xs px-3 py-2">{fileName}</div><button type="button" aria-label="Remove selected image" onClick={()=>{setImage('');setImageFile(null);setFileName('');setAnalysis(null);setAnalysisError('');setUploadError('');if(fileRef.current)fileRef.current.value=''}} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#20392c]/80 text-white flex items-center justify-center"><X size={17}/></button></div>:<button type="button" onClick={()=>fileRef.current?.click()} disabled={uploading} className="w-full min-h-[190px] rounded-2xl border-2 border-dashed border-[#cdd2c2] bg-[#f4f4ed] hover:bg-[#eff1e7] transition-colors flex flex-col items-center justify-center text-center p-5 disabled:opacity-60"><div className="w-12 h-12 rounded-2xl bg-[#e4ead8] text-[#648057] flex items-center justify-center">{uploading?<span className="w-5 h-5 rounded-full border-2 border-[#648057]/30 border-t-[#648057] animate-spin"/>:<Upload size={21}/>}</div><span className="font-semibold mt-3">{uploading?'Reading your photo…':'Tap to take a photo or upload'}</span><span className="text-xs text-[#858b7e] mt-1">Focus on the affected leaves, fruit, or stem</span></button>}{uploading&&image&&<p role="status" className="text-xs text-[#6c765f] mt-2">Reading the selected photo…</p>}{uploadError&&<p role="alert" className="text-xs text-[#a3483e] bg-[#f7e8e3] rounded-lg px-3 py-2 mt-3">{uploadError}</p>}<div className="mt-4 flex flex-col sm:flex-row gap-3"><Button onClick={analyze} disabled={loading||uploading||!image||!imageFile||farm.crops.length===0} className="flex-1" data-testid="button-analyze-crop">{loading?<><span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"/>Analyzing crop…</>:<><Camera size={16}/>Analyze Crop</>}</Button>{image&&<Button variant="outline" onClick={()=>fileRef.current?.click()} disabled={loading||uploading}><ImagePlus size={16}/>Change photo</Button>}</div></Card><Card className="!bg-[#f5eee0] !border-[#e8ddc8]"><div className="flex gap-3"><div className="w-9 h-9 shrink-0 rounded-xl bg-[#e9dcc3] flex items-center justify-center text-[#956c3b]"><CircleHelp size={18}/></div><div><h3 className="text-sm font-bold">Use this as a starting point, not a diagnosis</h3><p className="text-xs leading-relaxed text-[#756e5e] mt-1">This is a DEMO/MOCK observation, not a diagnosis. Photo quality, crop stage, and local conditions affect what symptoms can mean. For serious or uncertain cases, verify with a qualified agricultural expert or your local KVK before treatment.</p></div></div></Card></div>
  <div className="space-y-5"><Card className="min-h-[340px]"><div className="flex items-center justify-between gap-3 mb-5"><div><Eyebrow>Step 3 · Review the result</Eyebrow><h2 className="font-bold text-lg mt-1">Preliminary observation</h2></div><span className="text-[10px] uppercase tracking-wider rounded-full bg-[#f3ead6] text-[#927443] px-2.5 py-1">DEMO / MOCK</span></div>{loading?<div role="status" aria-live="polite" className="min-h-[230px] rounded-xl border border-dashed border-[#dddcd0] flex flex-col items-center justify-center text-center p-6"><span className="w-8 h-8 rounded-full border-[3px] border-[#8fa17b]/30 border-t-[#55744d] animate-spin"/><p className="font-semibold mt-4">Analyzing crop...</p><p className="text-sm text-[#858a7e] mt-1 max-w-xs">Preparing a crop-specific demo observation. The image stays on this device.</p></div>:analysisError?<div role="alert" className="rounded-xl bg-[#f7e8e3] text-[#8e4138] p-4 text-sm">{analysisError}</div>:analysis?<div className="animate-in"><div className="rounded-xl bg-[#f4f0e4] p-4"><div className="text-[10px] uppercase text-[#8b8067] tracking-wider">Crop name</div><div className="font-semibold text-sm mt-1">{analysis.cropName}</div><div className="flex justify-between items-start gap-3 mt-4"><div className="min-w-0"><div className="text-[10px] uppercase text-[#8b8067] tracking-wider">Possible issue</div><h3 className="serif text-2xl mt-1">{analysis.issue}</h3></div><div className="shrink-0 text-right"><div className="font-bold text-xl text-[#9b7846]">{analysis.confidence}%</div><div className="text-[10px] text-[#8b8067]">demo confidence</div></div></div><div className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${analysis.severity==='High'?'bg-[#f7e5e1] text-[#a3483e]':analysis.severity==='Low'?'bg-[#e8eddd] text-[#55734a]':'bg-[#efe2c7] text-[#86683a]'}`}>Severity: {analysis.severity}</div></div><div className="mt-5"><Eyebrow>Suggested next steps</Eyebrow><ul className="mt-3 space-y-3">{analysis.nextSteps.map((step,index)=><li key={step} className="flex gap-3 text-sm text-[#596354]"><span className="w-6 h-6 shrink-0 rounded-full bg-[#edf0e3] text-[#5d7850] flex items-center justify-center text-xs font-bold">{index+1}</span>{step}</li>)}</ul></div><div className="mt-5 rounded-xl border border-[#e8ddc8] bg-[#f8f2e8] px-3 py-2.5 text-xs leading-relaxed text-[#756e5e]">Preliminary demo result only. For serious or uncertain symptoms, verify with a qualified agricultural expert or your local KVK before treatment.</div><div className="mt-5 flex flex-wrap gap-2"><Button onClick={save}><Check size={16}/>Save to field history</Button><Button variant="outline" onClick={()=>setAnalysis(null)}>Clear result</Button></div><p className="mt-3 text-[11px] text-[#8b8d80]">Generated {niceDate(analysis.createdAt)} · Simulated crop-specific result; no AI service connected.</p></div>:<div className="min-h-[230px] rounded-xl border border-dashed border-[#dddcd0] flex flex-col items-center justify-center text-center p-6"><div className="w-12 h-12 rounded-2xl bg-[#edf0e4] text-[#738462] flex items-center justify-center"><Activity size={21}/></div><p className="font-semibold mt-3">Your observation will appear here</p><p className="text-sm text-[#858a7e] mt-1 max-w-xs">Choose a crop and photo, then analyze for a simulated preliminary observation.</p></div>}</Card><Card><Eyebrow>Photo tips</Eyebrow><div className="mt-3 space-y-2.5 text-sm text-[#657061]"><p className="flex gap-2"><Check size={15} className="text-[#6d8b56] shrink-0 mt-0.5"/>Use daylight and focus on one affected area.</p><p className="flex gap-2"><Check size={15} className="text-[#6d8b56] shrink-0 mt-0.5"/>Include healthy tissue for comparison.</p><p className="flex gap-2"><Check size={15} className="text-[#6d8b56] shrink-0 mt-0.5"/>Avoid wet leaves, harsh shadows, and motion blur.</p></div></Card></div></div></>
}
function Assistant({farm,updateFarm}:{farm:FarmData;updateFarm:(fn:(c:FarmData)=>FarmData)=>void}){
 const [text,setText]=useState('');
 const [language,setLanguage]=useState<AssistantLanguage>('auto');
 const [listening,setListening]=useState(false);
 const [speechNote,setSpeechNote]=useState('');
 const [inputError,setInputError]=useState('');
 const [chatError,setChatError]=useState('');
 const [pendingQuestion,setPendingQuestion]=useState<AssistantRequest|null>(null);
 const [sending,setSending]=useState(false);
 const bottom=useRef<HTMLDivElement>(null);
 const sendingRef=useRef(false);
 const requestId=useRef(0);
 const recognitionRef=useRef<SpeechRecognitionLike|null>(null);
 useEffect(()=>{
  if(farm.chat.length===0&&!sending&&!chatError)return;
  bottom.current?.scrollIntoView({behavior:'smooth',block:'end'});
 },[farm.chat.length,sending,chatError]);

 const requestReply=async(request:AssistantRequest)=>{
  const activeRequest=++requestId.current;
  sendingRef.current=true;
  setSending(true);
  setChatError('');
  try{
   const reply=await demoAdapters.assistant.respond(request);
   if(activeRequest!==requestId.current)return;
   const answer:ChatMessage={id:uid(),role:'assistant',text:reply,createdAt:new Date().toISOString()};
   updateFarm(data=>({...data,chat:[...data.chat,answer]}));
   setPendingQuestion(null);
  }catch{
   if(activeRequest!==requestId.current)return;
   setPendingQuestion(request);
   setChatError('The demo could not prepare a reply. Your question is still here; try again, or rephrase it.');
  }finally{
   if(activeRequest===requestId.current){
    sendingRef.current=false;
    setSending(false);
   }
  }
 };

 const send=(value=text)=>{
  const question=value.trim();
  if(sendingRef.current)return;
  if(!question){
   setInputError('Type a farming question before sending.');
   return;
  }
  setInputError('');
  setChatError('');
  setPendingQuestion(null);
  setText('');
  const user:ChatMessage={id:uid(),role:'user',text:question,createdAt:new Date().toISOString()};
  updateFarm(data=>({...data,chat:[...data.chat,user]}));
  void requestReply({question,language});
 };

 const mic=()=>{
  if(listening){
   recognitionRef.current?.stop();
   return;
  }
  const w=window as Window&{webkitSpeechRecognition?:new()=>SpeechRecognitionLike;SpeechRecognition?:new()=>SpeechRecognitionLike};
  const Recognition=w.SpeechRecognition||w.webkitSpeechRecognition;
  if(!Recognition){
   setSpeechNote('Voice input is not supported in this browser. You can type your question instead.');
   return;
  }
  try{
   const recognition=new Recognition();
   recognitionRef.current=recognition;
   recognition.lang=language==='hi'?'hi-IN':language==='or'?'or-IN':'en-IN';
   recognition.interimResults=false;
   recognition.onstart=()=>{
    setListening(true);
    setSpeechNote('Listening. Speak your question clearly.');
   };
   recognition.onresult=event=>{
    const heard=event.results[0]?.[0]?.transcript.trim()||'';
    if(!heard){
     setSpeechNote('No words were detected. Try again or type your question.');
     return;
    }
    setText(previous=>previous?`${previous} ${heard}`:heard);
    setInputError('');
    setSpeechNote('Voice input added to your question. Review it, then tap Send.');
   };
   recognition.onerror=event=>{
    setSpeechNote(event.error==='not-allowed'
     ?'Microphone permission was denied. Allow access in browser settings or type your question.'
     :'Could not hear that clearly. Try again or type your question.');
   };
   recognition.onend=()=>{
    setListening(false);
    recognitionRef.current=null;
   };
   recognition.start();
  }catch{
   setListening(false);
   recognitionRef.current=null;
   setSpeechNote('Microphone could not start. Check browser permission or type your question.');
  }
 };

 const reset=()=>{
  requestId.current++;
  sendingRef.current=false;
  recognitionRef.current?.stop();
  recognitionRef.current=null;
  setListening(false);
  setSending(false);
  setChatError('');
  setPendingQuestion(null);
  updateFarm(data=>({...data,chat:[]}));
 };

 const examples=[
  'Which fertilizer is suitable for rice?',
  'Why are my tomato leaves turning yellow?',
  'When should I water my crop?',
  'How can I reduce water usage?',
 ];
 const retry=()=>{
  if(pendingQuestion&&!sendingRef.current)void requestReply(pendingQuestion);
 };

 return <>
  <PageTitle eyebrow="Ask FarmEye · demo assistant" title="A practical question, answered." subtitle="Ask about crops, soil, pests, or irrigation. Demo guidance is not guaranteed advice; verify important decisions with a local expert." action={farm.chat.length>0?<Button variant="outline" onClick={reset} disabled={sending}><Trash2 size={15}/>Clear conversation</Button>:null}/>
  <div className="max-w-4xl mx-auto grid lg:grid-cols-[1fr_245px] gap-5 items-start">
   <Card className="!p-0 overflow-hidden">
    <div className="p-4 sm:px-6 border-b border-[#eceae0] flex flex-wrap items-center justify-between gap-3">
     <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-[#e7ecd9] rounded-xl flex items-center justify-center text-[#59784c]"><Sprout size={20}/></div>
      <div>
       <div className="font-bold text-sm">FarmEye field helper</div>
       <div className="flex items-center gap-1.5 text-[11px] text-[#7c8676]"><span className="w-1.5 h-1.5 rounded-full bg-[#d3a35b]"/>Demo replies · not connected to AI</div>
      </div>
     </div>
     <label className="flex items-center gap-2 text-[11px] font-semibold text-[#6e7968]">
      Reply language
      <select aria-label="Reply language" data-testid="select-chat-language" value={language} onChange={event=>setLanguage(event.target.value as AssistantLanguage)} className="field !w-auto !py-2 !text-xs">
       <option value="auto">Match question</option>
       <option value="en">English</option>
       <option value="hi">हिन्दी</option>
       <option value="or">ଓଡ଼ିଆ</option>
      </select>
     </label>
    </div>
    <div className="max-h-[55vh] min-h-[310px] overflow-y-auto p-4 sm:p-6 space-y-4" data-testid="chat-messages" role="log" aria-label="Chat messages" aria-live="polite">
     {farm.chat.length===0
      ?<div className="py-7">
        <div className="text-center">
         <div className="serif text-2xl">What’s happening in your field?</div>
         <p className="text-sm text-[#82877b] mt-2">Choose an example or ask a question in English, Hindi, or Odia.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-2 mt-6">
         {examples.map((example,index)=><button key={example} type="button" data-testid={`button-quick-question-${index+1}`} onClick={()=>send(example)} disabled={sending} className="min-h-[76px] text-left text-xs sm:text-sm text-[#53684e] bg-[#f0f2e8] hover:bg-[#e8ecdc] border border-[#e2e5d7] rounded-xl p-3 transition-colors disabled:opacity-60">
          <span>{example}</span><ArrowRight size={13} className="mt-2"/>
         </button>)}
        </div>
       </div>
      :farm.chat.map(message=><div key={message.id} data-testid={`${message.role}-message-${message.id}`} className={`flex ${message.role==='user'?'justify-end':'justify-start'}`}>
        <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role==='user'?'bg-[#315c3e] text-white rounded-br-sm':'bg-[#f0f1e8] text-[#40513e] rounded-bl-sm'}`}>
         <p className="whitespace-pre-wrap">{message.text}</p>
         <div className={`text-[10px] mt-2 ${message.role==='user'?'text-white/60':'text-[#88907f]'}`}>{message.role==='user'?'You':'FarmEye'} · {new Intl.DateTimeFormat('en-IN',{hour:'numeric',minute:'2-digit'}).format(new Date(message.createdAt))}</div>
        </div>
       </div>)}
     {sending&&<div role="status" aria-label="FarmEye is typing" className="flex items-center gap-2 text-xs text-[#788274]">
      <span className="flex gap-1"><i className="w-1.5 h-1.5 rounded-full bg-[#7c9464] animate-bounce"/><i className="w-1.5 h-1.5 rounded-full bg-[#7c9464] animate-bounce [animation-delay:120ms]"/><i className="w-1.5 h-1.5 rounded-full bg-[#7c9464] animate-bounce [animation-delay:240ms]"/></span>
      FarmEye is thinking…
     </div>}
     {chatError&&<div role="alert" data-testid="chat-error" className="rounded-xl border border-[#efd5ca] bg-[#fbefeb] p-3 text-xs text-[#8e4138]">
      <p>{chatError}</p>
      <Button onClick={retry} disabled={sending||!pendingQuestion} variant="outline" className="!py-2 !px-3 mt-2 !text-xs">Try again</Button>
     </div>}
     <div ref={bottom}/>
    </div>
    <div className="px-3 sm:px-5 py-2.5 border-t border-[#efede4] bg-[#fbfaf6] text-[10px] leading-relaxed text-[#827a68]">
     General demo information only—not a guaranteed diagnosis or treatment plan. Check local conditions and confirm important decisions with a qualified agricultural expert or KVK.
    </div>
    <form onSubmit={event=>{event.preventDefault();send()}} className="border-t border-[#eceae0] p-3 sm:p-4">
     <div className="flex gap-2 items-end">
      <label className="sr-only" htmlFor="chat-question">Ask a farming question</label>
      <textarea id="chat-question" data-testid="input-chat-question" value={text} onChange={event=>{setText(event.target.value);if(event.target.value.trim())setInputError('')}} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();send()}}} placeholder="Ask about a crop, symptom, or farm task…" rows={1} aria-invalid={Boolean(inputError)} aria-describedby={inputError?'chat-input-error':undefined} className="field flex-1 min-h-[46px] max-h-32 resize-y py-3"/>
      <button type="button" onClick={mic} disabled={sending} aria-label={listening?'Stop voice input':'Use voice input'} data-testid="button-chat-mic" className={`shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center disabled:opacity-50 ${listening?'bg-[#e8e6d5] border-[#7f9360] text-[#527244]':'border-[#d9dacd] text-[#71816b] hover:bg-[#eff0e7]'}`}><Mic size={18}/></button>
      <Button type="submit" disabled={!text.trim()||sending} className="h-11 px-3 sm:px-4 shrink-0" data-testid="button-chat-send">Send <ArrowRight size={15}/></Button>
     </div>
     {inputError&&<div id="chat-input-error" role="alert" className="text-xs text-[#a3483e] mt-2">{inputError}</div>}
     {speechNote&&<div role="status" className="text-xs text-[#796d50] mt-2">{speechNote}</div>}
    </form>
   </Card>
   <aside className="space-y-4">
    <Card className="!bg-[#e9eddf] !border-[#dbe0cf]">
     <Eyebrow>Made for the field</Eyebrow>
     <p className="font-semibold mt-2">Clear, useful starting points.</p>
     <p className="text-xs text-[#6f7968] mt-2 leading-relaxed">Replies use local demo guidance. Your questions stay on this device; no AI service or API key is configured.</p>
    </Card>
    <Card>
     <Eyebrow>Good details to include</Eyebrow>
     <ul className="mt-3 space-y-3 text-xs text-[#667061]"><li className="flex gap-2"><span className="text-[#79915d]">01</span>Crop and its growth stage</li><li className="flex gap-2"><span className="text-[#79915d]">02</span>When the issue first appeared</li><li className="flex gap-2"><span className="text-[#79915d]">03</span>Recent weather or farm inputs</li></ul>
    </Card>
   </aside>
  </div>
 </>
}
type SpeechRecognitionLike={
 lang:string;
 interimResults:boolean;
 onstart:((event:Event)=>void)|null;
 onresult:((event:SpeechRecognitionEvent)=>void)|null;
 onerror:((event:SpeechRecognitionErrorEvent)=>void)|null;
 onend:((event:Event)=>void)|null;
 start:()=>void;
 stop:()=>void;
};
type SpeechRecognitionEvent=Event&{results:ArrayLike<ArrayLike<{transcript:string}>>};
type SpeechRecognitionErrorEvent=Event&{error:string};

function Weather(){
 const [unit,setUnit]=useState<'C'|'F'>('C');
 const [refresh,setRefresh]=useState(false);
 const [selectedDay,setSelectedDay]=useState('Today');
 const [reviewed,setReviewed]=useState<string[]>(()=>{try{const parsed=JSON.parse(localStorage.getItem('farmeye-weather-reviewed-v1')||'[]');return Array.isArray(parsed)?parsed.filter((value):value is string=>typeof value==='string'):[]}catch{return[]}});
 const [reviewError,setReviewError]=useState('');
 const selected=sampleWeather.days.find(day=>day.day===selectedDay)||sampleWeather.days[0];
 const convert=(c:number)=>unit==='C'?c:Math.round(c*9/5+32);
 const refreshSample=()=>{setRefresh(true);window.setTimeout(()=>setRefresh(false),450)};
 const icon=(name:string,size=23):ReactNode=>{if(name==='sun')return <Sun size={size}/>;if(name==='rain')return <CloudRain size={size}/>;return <Cloud size={size}/>};
 const toggleReviewed=(id:string)=>{const next=reviewed.includes(id)?reviewed.filter(value=>value!==id):[...reviewed,id];try{localStorage.setItem('farmeye-weather-reviewed-v1',JSON.stringify(next));setReviewed(next);setReviewError('')}catch{setReviewError('This reminder could not be saved on this device.')}};
 const fieldChecks=[
  {id:'after-rain',title:'After rain',detail:'Check field drainage before irrigating again.',icon:<Droplets size={16} className="text-[#64816b] shrink-0"/>},
  {id:'before-spraying',title:'Before spraying',detail:'Check actual wind and the product label first.',icon:<Wind size={16} className="text-[#64816b] shrink-0"/>},
  {id:'warm-afternoons',title:'Warm afternoons',detail:'Observe plants for stress during field rounds.',icon:<Sun size={16} className="text-[#a17a44] shrink-0"/>},
 ];
 const activeCheck=selected.rain>=60?fieldChecks[0]:selected.high>=30?fieldChecks[2]:fieldChecks[1];
 const activeReviewed=reviewed.includes(activeCheck.id);
 return <><PageTitle eyebrow="Weather intelligence · sample data" title="Read the sky, plan the day." subtitle="A sample outlook for Nashik. No live weather service is connected." action={<Button variant="outline" onClick={refreshSample} disabled={refresh}><Activity size={15}/>{refresh?'Refreshing sample…':'Refresh sample'}</Button>}/><div className="grid xl:grid-cols-[1.3fr_.7fr] gap-5"><div className="space-y-5"><Card className="!p-0 overflow-hidden"><div className="bg-[#294b37] text-[#f6f3e6] p-6 sm:p-8 relative overflow-hidden soft-dots"><div className="absolute right-10 top-[-20px] w-44 h-44 rounded-full border border-[#e6dcaa]/20"/><div className="flex justify-between relative"><div><div className="flex items-center gap-1.5 text-xs text-[#d1dbc2]"><MapPin size={14}/>Nashik, Maharashtra <span className="ml-1 bg-white/10 rounded px-2 py-0.5 text-[9px] uppercase tracking-wider">Sample</span></div><div className="serif text-[62px] leading-none mt-6">{convert(selected.high)}°<span className="text-2xl text-[#bfccb9]">/{convert(selected.low)}°</span></div><div className="text-sm text-[#d0dac8] mt-2">{selected.label}</div></div><div className="w-[76px] h-[76px] rounded-[25px] weather-sun flex items-center justify-center self-center shadow-inner">{icon(selected.icon,38)}</div></div><div className="text-[11px] text-[#b8c8b3] mt-6">{selected.day==='Today'?weekdayLabel:selected.day} · selected sample outlook, not a live forecast</div></div><div className="grid grid-cols-3 divide-x divide-[#edebe1] p-4"><WeatherStat label="Rain chance" value={`${selected.rain}%`} icon={<CloudRain size={16}/>}/><WeatherStat label="Humidity · today" value={`${sampleWeather.humidity}%`} icon={<Droplets size={16}/>}/><WeatherStat label="Wind · today" value={`${sampleWeather.wind} km/h`} icon={<Wind size={16}/>}/></div></Card><Card><div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5"><div><Eyebrow>Next five days · sample</Eyebrow><h2 className="serif text-xl mt-1">A week at a glance</h2><p className="text-xs text-[#858a7e] mt-1">Choose a day to see its forecast and field reminder.</p></div><div className="flex self-start sm:self-auto rounded-lg bg-[#efeee6] p-1" aria-label="Temperature units"><button type="button" aria-pressed={unit==='C'} onClick={()=>setUnit('C')} className={`px-2.5 py-1 rounded-md text-xs font-semibold ${unit==='C'?'bg-white shadow-sm':''}`}>°C</button><button type="button" aria-pressed={unit==='F'} onClick={()=>setUnit('F')} className={`px-2.5 py-1 rounded-md text-xs font-semibold ${unit==='F'?'bg-white shadow-sm':''}`}>°F</button></div></div><div className="grid grid-cols-2 sm:grid-cols-5 gap-2">{sampleWeather.days.map(day=><button type="button" key={day.day} aria-pressed={selected.day===day.day} onClick={()=>setSelectedDay(day.day)} className={`rounded-xl text-center p-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#718b5d] ${selected.day===day.day?'bg-[#e9eddf] ring-1 ring-[#b8c6a7]':'bg-[#f4f3ed] hover:bg-[#edeee4]'}`}><span className="text-xs font-semibold">{day.day}</span><span className="text-[#b5864b] flex justify-center my-4">{icon(day.icon)}</span><span className="text-sm font-bold">{convert(day.high)}° <span className="text-[#929588] font-normal">{convert(day.low)}°</span></span><span className="text-[10px] text-[#7a8970] mt-2 flex gap-1 justify-center items-center"><CloudRain size={11}/>{day.rain}%</span></button>)}</div></Card></div><div className="space-y-5"><Card><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#f3e7d1] text-[#987342] flex items-center justify-center">{activeCheck.icon}</div><div><Eyebrow>Field reminder · sample</Eyebrow><div className="font-semibold mt-0.5">{activeCheck.title}{selected.day!=='Today'?` · ${selected.day}`:''}</div></div></div><p className="text-sm text-[#697363] leading-relaxed mt-4">{selected.rain>=60?'Rain is likely in this sample outlook. Check drainage and soil moisture before your next irrigation.':selected.high>=30?'Warm conditions are shown in this sample outlook. Check soil moisture before irrigating and avoid spraying during the hottest part of the day.':'Conditions vary. Check the actual wind and product label before spraying.'}</p><button type="button" aria-pressed={activeReviewed} onClick={()=>toggleReviewed(activeCheck.id)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#f0f1e8] hover:bg-[#e8ecdc] text-xs font-semibold text-[#53684e] px-3 py-2">{activeReviewed?<Check size={14}/>:<Check size={14} className="opacity-40"/>}{activeReviewed?'Checked for today':'Mark reminder checked'}</button><div className="text-[10px] text-[#9a8b70] mt-3">General reminder only · confirm local conditions</div></Card><Card className="!bg-[#eef0e5] !border-[#dde1d2]"><Eyebrow>Weather and your crops</Eyebrow><h3 className="serif text-xl mt-2">Small signals matter.</h3><div className="mt-4 space-y-2">{fieldChecks.map(check=>{const isReviewed=reviewed.includes(check.id);return <button key={check.id} type="button" aria-pressed={isReviewed} onClick={()=>toggleReviewed(check.id)} className="w-full flex items-center gap-3 rounded-xl p-3 text-left text-sm text-[#65705f] hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#718b5d]"><span>{check.icon}</span><span className="flex-1 min-w-0"><b>{check.title}</b><br/><span className="text-xs">{check.detail}</span></span><span className="shrink-0 text-[10px] font-semibold text-[#69815a]">{isReviewed?'Checked':'Mark checked'}</span></button>})}</div>{reviewError&&<p role="alert" className="text-xs text-[#a3483e] mt-3">{reviewError}</p>}</Card><div className="rounded-xl border border-dashed border-[#d6d5c9] p-4 text-xs text-[#818578] leading-relaxed"><b className="text-[#586451]">Data honesty:</b> All figures and outlooks on this screen are illustrative sample data. FarmEye is not connected to a weather provider.</div></div></div></>}
function WeatherStat({label,value,icon}:{label:string;value:string;icon:ReactNode}){return <div className="flex items-center justify-center gap-2 py-1"><span className="text-[#71876a]">{icon}</span><div><div className="text-sm font-bold">{value}</div><div className="text-[10px] text-[#8a8f82]">{label}</div></div></div>}

function Expenses({farm,updateFarm,notify}:{farm:FarmData;updateFarm:(fn:(c:FarmData)=>FarmData)=>void;notify:(s:string)=>void}){
 const [category,setCategory]=useState('Seeds & seedlings');const [description,setDescription]=useState('');const [amount,setAmount]=useState('');const [date,setDate]=useState(new Date().toISOString().slice(0,10));const [error,setError]=useState('');
 const sum=farm.expenses.reduce((a,e)=>a+e.amount,0);const grouped=useMemo(()=>farm.expenses.reduce<Record<string,number>>((o,e)=>({...o,[e.category]:(o[e.category]||0)+e.amount}),{}),[farm.expenses]);const cats=['Seeds & seedlings','Fertilizer','Pesticides','Labour','Irrigation','Equipment','Transport','Other'];
 const add=(e:FormEvent)=>{e.preventDefault();const n=Number(amount);if(!description.trim()){setError('Add a short description so you can recognize this expense.');return}if(!Number.isFinite(n)||n<=0){setError('Enter an amount greater than ₹0.');return}const item:Expense={id:uid(),category,description:description.trim(),amount:n,date};updateFarm(d=>({...d,expenses:[item,...d.expenses]}));setDescription('');setAmount('');setError('');notify('Expense added to your records.')};
 const remove=(id:string)=>{if(!window.confirm('Delete this expense from your records?'))return;updateFarm(d=>({...d,expenses:d.expenses.filter(x=>x.id!==id)}));notify('Expense deleted.')};
 const max=Math.max(1,...Object.values(grouped));
 return <><PageTitle eyebrow="Farm ledger · saved on this device" title="Know where it goes." subtitle="Record day-to-day farm spending and keep a simple running total."/><div className="grid xl:grid-cols-[.75fr_1.25fr] gap-5 items-start"><div className="space-y-5"><Card className="bg-[#294b37] !border-[#294b37] text-[#f5f2e5] overflow-hidden relative"><div className="absolute right-[-12px] bottom-[-30px] text-white/5"><BarChart3 size={150}/></div><div className="relative"><Eyebrow><span className="text-[#c6d5b4]">Recorded spending · all time</span></Eyebrow><div className="serif text-[42px] mt-2">{rupees(sum)}</div><div className="text-xs text-[#bfccb9] mt-1">{farm.expenses.length} entries in this ledger</div><div className="flex gap-3 mt-6 border-t border-white/15 pt-4 text-xs"><span className="text-[#d5dfc9]">{Object.keys(grouped).length} categories</span><span className="text-white/30">·</span><span className="text-[#d5dfc9]">Stored on this device</span></div></div></Card><Card><Eyebrow>Record an expense</Eyebrow><form onSubmit={add} className="mt-4 space-y-3"><label className="block text-xs font-semibold">Category<select value={category} onChange={e=>setCategory(e.target.value)} className="field mt-1">{cats.map(c=><option key={c}>{c}</option>)}</select></label><label className="block text-xs font-semibold">What was it for?<input value={description} onChange={e=>setDescription(e.target.value)} placeholder="e.g. Drip connectors for east plot" className="field mt-1"/></label><div className="grid grid-cols-2 gap-3"><label className="block text-xs font-semibold">Amount (₹)<input type="number" min="1" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" className="field mt-1"/></label><label className="block text-xs font-semibold">Date<input type="date" value={date} onChange={e=>setDate(e.target.value)} className="field mt-1"/></label></div>{error&&<p role="alert" className="text-xs text-[#a3483e] bg-[#f7e8e3] rounded-lg px-3 py-2">{error}</p>}<Button type="submit" className="w-full"><Plus size={16}/>Add expense</Button></form></Card></div><div className="space-y-5"><Card><div className="flex justify-between items-start mb-5"><div><Eyebrow>Where the money goes</Eyebrow><h2 className="serif text-xl mt-1">Category summary</h2></div><BarChart3 size={18} className="text-[#708264]"/></div>{Object.keys(grouped).length===0?<p className="text-sm text-[#858a7e] py-6 text-center">Categories will appear as you add expenses.</p>:<div className="space-y-4">{Object.entries(grouped).sort((a,b)=>b[1]-a[1]).map(([name,value])=><div key={name}><div className="flex justify-between text-xs mb-2"><span className="font-semibold">{name}</span><span className="text-[#75806f]">{rupees(value)} <span className="text-[#a0a397]">· {Math.round(value/sum*100)}%</span></span></div><div className="h-2 rounded-full bg-[#edede4] overflow-hidden"><div className="h-full rounded-full bg-[#7d9b5d] transition-all" style={{width:`${value/max*100}%`}}/></div></div>)}</div>}</Card><Card className="!p-0 overflow-hidden"><div className="p-5 sm:px-6 flex justify-between items-center border-b border-[#eceae0]"><div><Eyebrow>Transaction list</Eyebrow><h2 className="serif text-xl mt-1">Recent expenses</h2></div><span className="text-xs text-[#87907f]">{farm.expenses.length} total</span></div>{farm.expenses.length===0?<div className="p-5"><Empty icon={<Wallet/>} title="Your ledger is clear" body="Add your first expense to begin tracking farm costs." href="/expenses" link="Add an expense"/></div>:<div className="divide-y divide-[#eeece3]">{farm.expenses.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(ex=><div key={ex.id} className="flex items-center gap-3 px-5 sm:px-6 py-4" data-testid={`expense-row-${ex.id}`}><div className="w-9 h-9 rounded-xl bg-[#f0f0e5] text-[#72805c] flex items-center justify-center"><Wallet size={16}/></div><div className="min-w-0 flex-1"><div className="font-semibold text-sm truncate">{ex.description}</div><div className="text-[11px] text-[#858b7e] mt-0.5">{ex.category} · {niceDate(ex.date)}</div></div><div className="font-bold text-sm">{rupees(ex.amount)}</div><button onClick={()=>remove(ex.id)} aria-label={`Delete ${ex.description}`} className="w-8 h-8 rounded-lg text-[#9b9386] hover:bg-[#f6e7e3] hover:text-[#a14c40] flex items-center justify-center"><Trash2 size={15}/></button></div>)}</div>}</Card></div></div></>
}

function History({farm,updateFarm,notify}:{farm:FarmData;updateFarm:(fn:(c:FarmData)=>FarmData)=>void;notify:(s:string)=>void}){
 const [filter,setFilter]=useState('All records');
 const [showAdd,setShowAdd]=useState(false);
 const [cropName,setCropName]=useState('');
 const [variety,setVariety]=useState('');
 const [area,setArea]=useState('');
 const [plantedAt,setPlantedAt]=useState(()=>{const date=new Date();date.setMinutes(date.getMinutes()-date.getTimezoneOffset());return date.toISOString().slice(0,10)});
 const [status,setStatus]=useState('New planting');
 const [error,setError]=useState('');
 const cropNames=Array.from(new Set([...farm.crops.map(c=>c.name),...farm.reports.map(r=>r.cropName)]));
 const filtered=farm.reports.filter(r=>filter==='All records'||r.cropName===filter);
 const addCrop=(event:FormEvent)=>{event.preventDefault();const name=cropName.trim();if(!name){setError('Enter a crop name to save this record.');return}if(!plantedAt){setError('Choose a planting date.');return}const crop:Crop={id:uid(),name,variety:variety.trim()||'Variety not noted',area:area.trim()||'Area not noted',plantedAt,status};updateFarm(data=>({...data,crops:[crop,...data.crops]}));setCropName('');setVariety('');setArea('');setPlantedAt(()=>{const date=new Date();date.setMinutes(date.getMinutes()-date.getTimezoneOffset());return date.toISOString().slice(0,10)});setStatus('New planting');setError('');setShowAdd(false);notify(`${name} added to your crop history.`)};
 const deleteCrop=(crop:Crop)=>{if(!window.confirm(`Delete ${crop.name} from crop history? Saved photo reports will remain in your field notebook.`))return;updateFarm(data=>({...data,crops:data.crops.filter(item=>item.id!==crop.id)}));notify(`${crop.name} removed. Saved photo reports were kept.`)};
 return <><PageTitle eyebrow="Your field notebook · saved locally" title="A record of what you noticed." subtitle="Crops and saved preliminary reports stay on this device." action={<Button variant="outline" onClick={()=>{setShowAdd(value=>!value);setError('')}}><Plus size={15}/>{showAdd?'Close form':'Add crop'}</Button>}/><div className="grid lg:grid-cols-[.7fr_1.3fr] gap-5 items-start"><div className="space-y-5"><Card><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-[#e9eddf] flex items-center justify-center text-[#5b7650]"><Sprout size={20}/></div><div><Eyebrow>On the farm</Eyebrow><div className="font-semibold mt-0.5">{farm.crops.length} crop records</div></div></div>{showAdd&&<form onSubmit={addCrop} className="grid sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#f0f1e8] mt-5"><label className="text-xs font-semibold">Crop name<input required value={cropName} onChange={event=>setCropName(event.target.value)} placeholder="e.g. Chilli" className="field mt-1"/></label><label className="text-xs font-semibold">Planting date<input required type="date" value={plantedAt} onChange={event=>setPlantedAt(event.target.value)} className="field mt-1"/></label><label className="text-xs font-semibold">Status<select value={status} onChange={event=>setStatus(event.target.value)} className="field mt-1"><option>New planting</option><option>Vegetative growth</option><option>Flowering</option><option>Fruit set</option><option>Harvesting</option><option>Completed</option></select></label><label className="text-xs font-semibold">Variety<input value={variety} onChange={event=>setVariety(event.target.value)} placeholder="Optional" className="field mt-1"/></label><label className="text-xs font-semibold sm:col-span-2">Area<input value={area} onChange={event=>setArea(event.target.value)} placeholder="Optional, e.g. 0.5 acres" className="field mt-1"/></label>{error&&<p role="alert" className="sm:col-span-2 text-xs text-[#a3483e] bg-[#f7e8e3] rounded-lg px-3 py-2">{error}</p>}<div className="sm:col-span-2 flex gap-2"><Button type="submit" className="!py-2"><Check size={15}/>Save crop</Button><Button variant="ghost" onClick={()=>{setShowAdd(false);setError('')}} className="!py-2">Cancel</Button></div></form>}<div className="mt-5 divide-y divide-[#eceae0]">{farm.crops.length===0?<div className="py-7 text-center"><div className="font-semibold text-sm">No crops saved yet</div><p className="text-xs text-[#82877b] mt-1">Add a crop to start your field record.</p><button type="button" onClick={()=>setShowAdd(true)} className="mt-3 text-xs font-semibold text-[#53734c]">Add your first crop</button></div>:farm.crops.map(c=><div className="py-3 first:pt-0 last:pb-0" key={c.id} data-testid={`history-crop-${c.id}`}><div className="flex items-start gap-2"><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><span className="font-semibold text-sm">{c.name}</span><span className="text-[10px] text-[#69815a] bg-[#edf0e4] rounded-full px-2 py-1">{c.status}</span></div><div className="text-xs text-[#84897d] mt-1">{c.variety} · {c.area}</div><div className="text-[10px] text-[#a0a294] mt-1">Planted {niceDate(c.plantedAt)}</div></div><button type="button" onClick={()=>deleteCrop(c)} aria-label={`Delete ${c.name} crop`} className="w-8 h-8 shrink-0 rounded-lg text-[#9b9386] hover:bg-[#f6e7e3] hover:text-[#a14c40] flex items-center justify-center"><Trash2 size={15}/></button></div></div>)}</div></Card><Card className="!bg-[#edf0e4] !border-[#dfe3d4]"><Eyebrow>Field notebook</Eyebrow><p className="text-sm text-[#65705f] mt-2 leading-relaxed">Keep photos and notes in one place. Demo findings are only preliminary: revisit them with an agricultural expert before acting.</p></Card></div><div><Card className="!p-0 overflow-hidden"><div className="p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eceae0]"><div><Eyebrow>Photo observations</Eyebrow><h2 className="serif text-xl mt-1">Saved reports</h2></div><label className="sr-only" htmlFor="history-filter">Filter reports by crop</label><select id="history-filter" className="field !w-auto !py-2 !text-xs" value={filter} onChange={event=>setFilter(event.target.value)}><option>All records</option>{cropNames.map(name=><option key={name}>{name}</option>)}</select></div>{filtered.length===0?<div className="p-5"><Empty icon={<FileText/>} title={farm.reports.length?'No reports for this crop':'No saved observations yet'} body={farm.reports.length?'Choose another crop filter or start a new field check.':'Take a crop photo to create your first preliminary field report.'} href="/crop-doctor" link="Start a field check"/></div>:<div className="divide-y divide-[#eeece3]">{filtered.map(r=><ReportCard key={r.id} report={r}/>)}</div>}</Card></div></div></>
}
function ReportCard({report}:{report:Analysis}){const [open,setOpen]=useState(false);return <article className="p-5 sm:px-6" data-testid={`report-${report.id}`}>{report.image&&<img src={report.image} alt={`Saved photo for ${report.cropName}`} className="w-full h-36 object-cover rounded-xl mb-4"/>}<div className="flex gap-3 items-start"><div className="w-10 h-10 rounded-xl bg-[#f2ead9] text-[#927646] flex items-center justify-center shrink-0"><Activity size={18}/></div><div className="flex-1 min-w-0"><div className="flex flex-wrap justify-between gap-2"><div className="font-semibold">{report.cropName} <span className="font-normal text-[#a1a194]">· {niceDate(report.createdAt)}</span></div><span className="text-[10px] rounded-full bg-[#f3ead8] text-[#927441] px-2.5 py-1">{report.severity}</span></div><h3 className="serif text-lg mt-1">{report.issue}</h3><p className="text-xs text-[#82887b] mt-1">{report.confidence}% demo match · Preliminary, simulated observation</p><button onClick={()=>setOpen(!open)} className="mt-3 text-xs font-semibold text-[#55744d] flex items-center gap-1">{open?'Hide next steps':'Review next steps'}<ChevronDown size={14} className={open?'rotate-180 transition-transform':'transition-transform'}/></button>{open&&<ol className="mt-3 space-y-2 text-sm text-[#64705e]">{report.nextSteps.map((step,i)=><li key={step} className="flex gap-2"><span className="text-[#8aa06e] font-bold">{i+1}.</span>{step}</li>)}</ol>}</div></div><div className="text-[10px] text-[#9a9486] mt-4 border-t border-[#efede5] pt-3">Confirm with a qualified agricultural expert before treatment.</div></article>}
function NotFound(){return <div className="panel p-10 text-center max-w-lg mx-auto mt-10"><div className="w-12 h-12 bg-[#e9eddf] rounded-2xl text-[#668257] mx-auto flex items-center justify-center"><MapPin/></div><h1 className="serif text-3xl mt-4">This field path is unclear.</h1><p className="text-sm text-[#7e8478] mt-2">The page you’re looking for isn’t on this farm map.</p><Link href="/dashboard" className="inline-flex mt-5 text-sm font-semibold text-[#55744d] items-center gap-2">Back to today <ArrowRight size={15}/></Link></div>}
export default App;