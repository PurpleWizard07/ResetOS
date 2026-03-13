"use client";

import { useState, useMemo, useEffect } from "react";
import { supabase } from '@/lib/supabase';

const C = {
  bg:'#09090E',surf:'#111119',high:'#1A1A27',bord:'#252538',
  text:'#E2E2F0',mut:'#5E5E7A',acc:'#7B70FF',accBg:'rgba(123,112,255,0.1)',
  accBord:'rgba(123,112,255,0.3)',suc:'#3DD6A3',sucBg:'rgba(61,214,163,0.1)',
  war:'#F5A623',warBg:'rgba(245,166,35,0.1)',dan:'#FF5E5E',danBg:'rgba(255,94,94,0.1)',
  blue:'#60A5FA',blueBg:'rgba(96,165,250,0.1)',pink:'#F472B6',pinkBg:'rgba(244,114,182,0.1)',
};

const toDay=()=>new Date().toISOString().split('T')[0];
const daysAgo=(n)=>{const d=new Date();d.setDate(d.getDate()-n);return d.toISOString().split('T')[0];};
const fmt=(d)=>new Date(d+'T00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
const fmtLong=(d)=>new Date(d+'T00:00').toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
const nowT=()=>new Date().toTimeString().slice(0,5);
const shiftDate=(dStr,delta)=>{const d=new Date(dStr+'T00:00');d.setDate(d.getDate()+delta);return d.toISOString().split('T')[0];};
const iD=(n)=>Date.now()-n*1000;
const getDayName=(n)=>['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][n];

const calcStreak=(dates)=>{
  if(!dates.length) return 0;
  const unique=[...new Set(dates)].sort().reverse();
  const todayD=new Date();todayD.setHours(0,0,0,0);
  const diffFirst=Math.floor((todayD-new Date(unique[0]+'T00:00:00'))/86400000);
  if(diffFirst>1) return 0;
  let streak=0,exp=diffFirst;
  for(let d of unique){
    const diff=Math.floor((todayD-new Date(d+'T00:00:00'))/86400000);
    if(diff===exp){streak++;exp++;}else break;
  }
  return streak;
};

// Seed
const iWater=[
  {id:iD(5),date:daysAgo(0),amount:300,time:'08:30'},{id:iD(4),date:daysAgo(0),amount:500,time:'10:15'},
  {id:iD(3),date:daysAgo(0),amount:200,time:'12:00'},{id:iD(2),date:daysAgo(0),amount:600,time:'14:30'},
  {id:iD(9),date:daysAgo(1),amount:3100,time:'20:00'},{id:iD(8),date:daysAgo(2),amount:3200,time:'20:00'},
  {id:iD(7),date:daysAgo(3),amount:3000,time:'20:00'},
];
const iVits=[
  {id:1,name:'Vitamin D3',dose:'2000 IU',frequency:'daily',color:C.war},
  {id:2,name:'Omega-3',dose:'1000mg',frequency:'daily',color:C.blue},
  {id:3,name:'Magnesium',dose:'400mg',frequency:'daily',color:C.suc},
  {id:4,name:'Zinc',dose:'25mg',frequency:'Mon,Wed,Fri',color:C.pink},
];
const iVitLogs=[
  {id:iD(30),vitaminId:1,date:daysAgo(0)},{id:iD(31),vitaminId:2,date:daysAgo(0)},
  {id:iD(32),vitaminId:3,date:daysAgo(1)},{id:iD(33),vitaminId:1,date:daysAgo(1)},
];
const iDSA=[
  {id:iD(10),date:daysAgo(0),name:'Two Sum',source:'LeetCode',link:'https://leetcode.com/problems/two-sum',tags:['Array','HashMap'],difficulty:'Easy',notes:'Classic O(n) hashmap approach. Store complement as key, index as value. Single pass through the array.'},
  {id:iD(11),date:daysAgo(1),name:'Valid Parentheses',source:'LeetCode',link:'',tags:['Stack','String'],difficulty:'Easy',notes:'Push open brackets onto stack. For each closing bracket, check if top of stack matches. Return stack.length===0 at end.'},
  {id:iD(12),date:daysAgo(2),name:'Longest Substring Without Repeating',source:'LeetCode',link:'',tags:['Sliding Window','String'],difficulty:'Medium',notes:'Sliding window with a map tracking last seen index of each char. When duplicate found, move left pointer past the previous occurrence. Track max window throughout.'},
  {id:iD(13),date:daysAgo(3),name:'Merge Intervals',source:'LeetCode',link:'',tags:['Array','Sorting'],difficulty:'Medium',notes:'Sort by start time. Iterate: if current.start <= last.end, merge by updating last.end = max(last.end, current.end). Otherwise push new interval.'},
  {id:iD(14),date:daysAgo(4),name:'LRU Cache',source:'LeetCode',link:'',tags:['Design','LinkedList','HashMap'],difficulty:'Hard',notes:'Doubly linked list + hashmap. Head = most recently used, tail = LRU. On get: move node to head. On put: add to head, if over capacity remove tail and hashmap entry. Both ops O(1).'},
];
const iPerf=[
  {id:iD(15),date:daysAgo(0),type:'Shadowboxing',notes:'6 rounds. Worked on footwork and jab combos.'},
  {id:iD(16),date:daysAgo(1),type:'Stretching',notes:'30 min full body. Hip flexors feeling tight.'},
  {id:iD(17),date:daysAgo(2),type:'Shadowboxing',notes:'8 rounds heavy. Focus on head movement.'},
  {id:iD(18),date:daysAgo(3),type:'Exercise',notes:'Push/pull/legs. 45 min.'},
];
const iJournal=[
  {id:iD(19),date:daysAgo(0),title:'Day 1',content:'Solved 2 DSA problems today. Shadowboxing felt good.\nNeed to improve sleep schedule — getting to bed too late.'},
  {id:iD(20),date:daysAgo(1),title:'',content:'Good day. Finished LeetCode after 45 mins of being stuck. Stretching helped with the back pain.'},
  {id:iD(21),date:daysAgo(2),title:'Clarity',content:'Started tracking water properly. Hit 3.2L. Feeling more focused. Diet still off.'},
];
const iWeight=[
  {id:iD(22),date:daysAgo(0),weight:78.5,note:'Morning'},{id:iD(23),date:daysAgo(2),weight:78.8,note:''},
  {id:iD(24),date:daysAgo(4),weight:79.0,note:'After weekend'},{id:iD(25),date:daysAgo(7),weight:79.3,note:''},
];
const iCompanies=[
  {id:iD(26),name:'Uber',ctc:'45 LPA',role:'SDE-2',status:'Interview',note:'Recruiter from LinkedIn'},
  {id:iD(27),name:'PhonePe',ctc:'50 LPA',role:'Staff SDE',status:'OA',note:'Strong referral'},
  {id:iD(28),name:'Swiggy',ctc:'42 LPA',role:'Senior SDE',status:'Not Applied',note:''},
];
const iSD=[
  {id:1,topic:'Design URL Shortener',notes:'Hashing (MD5/base62), collision handling, Redis cache, read-heavy so optimize reads. Consider analytics table separately.',refs:['Grokking System Design']},
  {id:2,topic:'Design WhatsApp',notes:'WebSockets for real-time messaging. Message queue for offline delivery. Cassandra for messages (append-heavy). S3 for media. Presence service separately.',refs:[]},
];
const iInterviews=[
  {id:iD(40),date:daysAgo(1),company:'Uber',type:'DSA',round:'Round 1',result:'Passed',notes:'Asked Graph BFS/DFS. Solved 2/3. Struggled with the DP variant.'},
  {id:iD(41),date:daysAgo(5),company:'PhonePe',type:'System Design',round:'Round 2',result:'Pending',notes:'Design a payment ledger. Discussed ACID, distributed transactions, event sourcing.'},
];
const iFundamentals={
  'Operating Systems':[
    {id:1,title:'Process Scheduling',file:'os_scheduling.html',notes:'Round Robin, Priority, FCFS, SJF. Context switching overhead.'},
    {id:2,title:'Memory Management',file:'os_memory.html',notes:'Paging, segmentation, virtual memory, page replacement algorithms.'},
    {id:3,title:'Deadlocks',file:'os_deadlocks.html',notes:'Coffman conditions, Banker\'s algorithm, detection and recovery.'},
  ],
  'DBMS':[
    {id:4,title:'Normalization',file:'dbms_normalization.html',notes:'1NF, 2NF, 3NF, BCNF with examples.'},
    {id:5,title:'Transactions & ACID',file:'dbms_acid.html',notes:'Atomicity, Consistency, Isolation, Durability. Isolation levels.'},
    {id:6,title:'Indexing',file:'dbms_indexing.html',notes:'B-tree, hash indexes. Clustered vs non-clustered.'},
  ],
  'Networking':[
    {id:7,title:'TCP/IP & OSI',file:'net_osi.html',notes:'7 layers, encapsulation, TCP handshake, UDP vs TCP.'},
    {id:8,title:'HTTP/HTTPS',file:'net_http.html',notes:'HTTP methods, status codes, HTTPS handshake, HTTP/2 vs HTTP/3.'},
  ],
  'OOP':[
    {id:9,title:'SOLID Principles',file:'oop_solid.html',notes:'SRP, OCP, LSP, ISP, DIP with real examples.'},
    {id:10,title:'Design Patterns',file:'oop_patterns.html',notes:'Creational, Structural, Behavioral. Singleton, Factory, Observer.'},
  ],
};
const iMisc={
  'Git & Version Control':[
    {id:1,title:'Git Internals',file:'git_internals.html',notes:'Objects, refs, commits, trees, blobs. How git stores data.'},
    {id:2,title:'Branching Strategies',file:'git_branching.html',notes:'GitFlow, trunk-based development, feature flags.'},
  ],
  'Linux & Shell':[
    {id:3,title:'Shell Scripting',file:'linux_shell.html',notes:'Bash basics, pipes, redirects, cron jobs.'},
  ],
  'Docker & Kubernetes':[
    {id:4,title:'Docker Fundamentals',file:'docker_basics.html',notes:'Images, containers, volumes, networking, compose.'},
  ],
};

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
const Badge=({children,color='mut'})=>{
  const map={acc:[C.accBg,C.acc],suc:[C.sucBg,C.suc],war:[C.warBg,C.war],dan:[C.danBg,C.dan],mut:[C.bord,C.mut],blue:[C.blueBg,C.blue],pink:[C.pinkBg,C.pink]};
  const [bg,col]=map[color]||map.mut;
  return <span style={{background:bg,color:col,padding:'2px 7px',borderRadius:'4px',fontSize:'11px',fontWeight:600,letterSpacing:'0.02em',display:'inline-block'}}>{children}</span>;
};
const Btn=({children,onClick,variant='primary',size='md',disabled,full})=>{
  const vs={primary:{bg:C.acc,color:'#fff',border:'none'},ghost:{bg:'transparent',color:C.text,border:`1px solid ${C.bord}`},success:{bg:C.sucBg,color:C.suc,border:`1px solid rgba(61,214,163,0.25)`},danger:{bg:C.danBg,color:C.dan,border:`1px solid rgba(255,94,94,0.25)`},accent:{bg:C.accBg,color:C.acc,border:`1px solid ${C.accBord}`}};
  const ss={sm:'5px 11px',md:'8px 16px',lg:'11px 22px'};const fs={sm:'11px',md:'13px',lg:'14px'};const v=vs[variant]||vs.primary;
  return(<button onClick={onClick} disabled={disabled} style={{background:v.bg,color:v.color,border:v.border,padding:ss[size],fontSize:fs[size],fontWeight:600,borderRadius:'8px',cursor:disabled?'not-allowed':'pointer',opacity:disabled?0.45:1,fontFamily:'inherit',outline:'none',display:'inline-flex',alignItems:'center',gap:'6px',width:full?'100%':'auto',justifyContent:'center',transition:'opacity 0.15s'}}>{children}</button>);
};
const Input=({value,onChange,placeholder,type='text',style={}})=>(
  <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{background:C.high,border:`1px solid ${C.bord}`,borderRadius:'8px',padding:'9px 12px',color:C.text,fontFamily:'inherit',fontSize:'13px',outline:'none',width:'100%',...style}}/>
);
const Textarea=({value,onChange,placeholder,rows=4})=>(
  <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{background:C.high,border:`1px solid ${C.bord}`,borderRadius:'8px',padding:'9px 12px',color:C.text,fontFamily:'inherit',fontSize:'13px',outline:'none',width:'100%',resize:'vertical',lineHeight:1.6}}/>
);
const Sel=({value,onChange,options,style={}})=>(
  <select value={value} onChange={e=>onChange(e.target.value)} style={{background:C.high,border:`1px solid ${C.bord}`,borderRadius:'8px',padding:'9px 12px',color:C.text,fontFamily:'inherit',fontSize:'13px',outline:'none',width:'100%',cursor:'pointer',...style}}>
    {options.map(o=><option key={o.v||o} value={o.v||o}>{o.l||o}</option>)}
  </select>
);
const Card=({children,style={},onClick})=>(
  <div onClick={onClick} style={{background:C.surf,border:`1px solid ${C.bord}`,borderRadius:'12px',padding:'20px',cursor:onClick?'pointer':'default',...style}}>{children}</div>
);
const SLabel=({children})=>(
  <div style={{color:C.mut,fontSize:'10px',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:'10px'}}>{children}</div>
);
const PH=({title,right})=>(
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
    <h2 style={{fontSize:'22px',fontWeight:800,letterSpacing:'-0.02em',margin:0}}>{title}</h2>
    {right&&<div style={{display:'flex',gap:'6px',alignItems:'center'}}>{right}</div>}
  </div>
);
const Modal=({children,onClose,title})=>(
  <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px'}}>
    <div onClick={e=>e.stopPropagation()} style={{background:C.surf,border:`1px solid ${C.bord}`,borderRadius:'14px',padding:'24px',width:'100%',maxWidth:'540px',maxHeight:'85vh',overflowY:'auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
        <div style={{fontWeight:700,fontSize:'16px'}}>{title}</div>
        <button onClick={onClose} style={{background:'none',border:'none',color:C.mut,cursor:'pointer',fontSize:'22px',lineHeight:1,padding:'0 2px'}}>×</button>
      </div>
      {children}
    </div>
  </div>
);
const Cal=({activeDates,selectedDate,onSelect,calDate,setCalDate,todayStr,dotColor=C.acc})=>{
  const year=calDate.getFullYear(),month=calDate.getMonth();
  const first=new Date(year,month,1).getDay(),days=new Date(year,month+1,0).getDate();
  const label=calDate.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  const set=new Set(activeDates);
  return(
    <div style={{background:C.high,borderRadius:'10px',padding:'16px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
        <button onClick={()=>setCalDate(new Date(year,month-1,1))} style={{background:'none',border:'none',color:C.mut,cursor:'pointer',fontSize:'18px',lineHeight:1,padding:'0 4px'}}>‹</button>
        <span style={{fontSize:'12px',fontWeight:700}}>{label}</span>
        <button onClick={()=>setCalDate(new Date(year,month+1,1))} style={{background:'none',border:'none',color:C.mut,cursor:'pointer',fontSize:'18px',lineHeight:1,padding:'0 4px'}}>›</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'2px',textAlign:'center'}}>
        {['S','M','T','W','T','F','S'].map((d,i)=><div key={i} style={{color:C.mut,fontSize:'10px',fontWeight:600,padding:'3px 0'}}>{d}</div>)}
        {Array.from({length:first}).map((_,i)=><div key={'e'+i}/>)}
        {Array.from({length:days}).map((_,i)=>{
          const day=i+1;const ds=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const active=set.has(ds),isTod=ds===todayStr,isSel=ds===selectedDate;
          return(<div key={day} onClick={()=>onSelect(ds)} style={{width:'26px',height:'26px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'6px',margin:'1px auto',fontSize:'11px',cursor:'pointer',background:isSel?dotColor:active?dotColor+'22':isTod?C.bord:'transparent',color:isSel?'#fff':active?dotColor:isTod?C.text:C.mut,fontWeight:active||isTod?700:400,transition:'all 0.1s'}}>{day}</div>);
        })}
      </div>
    </div>
  );
};

// ─── SIDEBAR COMPONENTS ───────────────────────────────────────────────────────
function NavItem({label,active,onClick,dot,sub}){
  return(
    <button onClick={onClick} style={{width:'100%',display:'flex',alignItems:'center',gap:'8px',padding:sub?'6px 10px':'8px 10px',borderRadius:'7px',background:active?C.accBg:'transparent',border:'none',color:active?C.acc:C.mut,fontFamily:'inherit',fontSize:sub?'12px':'13px',fontWeight:active?700:500,cursor:'pointer',textAlign:'left',marginBottom:'1px',transition:'all 0.1s'}}>
      <span style={{flex:1}}>{label}</span>
      {dot&&<span style={{width:'6px',height:'6px',borderRadius:'50%',background:C.suc,flexShrink:0}}/>}
    </button>
  );
}
function NavGroup({label,open,onClick,dot}){
  return(
    <button onClick={onClick} style={{width:'100%',display:'flex',alignItems:'center',gap:'6px',padding:'8px 10px',borderRadius:'7px',background:'transparent',border:'none',cursor:'pointer',marginBottom:'1px',fontFamily:'inherit'}}>
      <span style={{flex:1,color:C.acc,fontSize:'13px',fontWeight:700,textAlign:'left'}}>{label}</span>
      {dot&&<span style={{width:'6px',height:'6px',borderRadius:'50%',background:C.suc}}/>}
      <span style={{color:C.mut,fontSize:'11px',transform:open?'rotate(90deg)':'none',display:'inline-block',transition:'transform 0.2s'}}>›</span>
    </button>
  );
}
function Divider(){return <div style={{height:'1px',background:C.bord,margin:'6px 0'}}/>;}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LifeOS(){
  const [view,setView]=useState('dashboard');
  const [calDate,setCalDate]=useState(new Date());
  const [selectedDate,setSelectedDate]=useState(toDay());
  const [wellnessOpen,setWellnessOpen]=useState(false);
  const [lpaOpen,setLpaOpen]=useState(false);

  const [waterLogs,setWaterLogs]=useState(iWater);
  const [waterGoal,setWaterGoal]=useState(3000);
  const [wCustom,setWCustom]=useState('');
  const [waterDate,setWaterDate]=useState(toDay());
  const [vitamins,setVitamins]=useState(iVits);
  const [vitaminLogs,setVitaminLogs]=useState(iVitLogs);
  const [skinPhotos,setSkinPhotos]=useState({});
  const [skinRoutineItems,setSkinRoutineItems]=useState([]); // { id, name, routine }
  const [skinRoutineLogs,setSkinRoutineLogs]=useState([]); // { id, item_id, date }
  const [skinRoutineForm,setSkinRoutineForm]=useState({ routine:'morning', name:'' });
  const [skinRoutineWeekAnchor,setSkinRoutineWeekAnchor]=useState(toDay());
  const [skinCompareMode,setSkinCompareMode]=useState(false);
  const [skinCmpA,setSkinCmpA]=useState('');
  const [skinCmpB,setSkinCmpB]=useState('');
  const [journal,setJournal]=useState(iJournal);
  const [jForm,setJForm]=useState({title:'',content:''});
  const [jEditing,setJEditing]=useState(false);
  const [journalDate,setJournalDate]=useState(toDay());
  const [dsa,setDsa]=useState(iDSA);
  const [dsaForm,setDsaForm]=useState({name:'',source:'LeetCode',link:'',tags:'',difficulty:'Medium',notes:''});
  const [dsaFilter,setDsaFilter]=useState({source:'All',difficulty:'All',tag:''});
  const [expandedDsa,setExpandedDsa]=useState(null);
  const [perf,setPerf]=useState(iPerf);
  const [perfForm,setPerfForm]=useState({type:'Shadowboxing',notes:''});
  const [weight,setWeight]=useState(iWeight);
  const [wForm,setWForm]=useState({weight:'',note:''});
  const [weightDate,setWeightDate]=useState(toDay());
  const [companies,setCompanies]=useState(iCompanies);
  const [coForm,setCoForm]=useState({name:'',ctc:'',role:'',status:'Not Applied',note:''});
  const [showCoForm,setShowCoForm]=useState(false);
  const [systemDesign,setSystemDesign]=useState(iSD);
  const [sdModal,setSdModal]=useState(null);
  const [sdForm,setSdForm]=useState({topic:'',notes:'',refs:''});
  const [interviews,setInterviews]=useState(iInterviews);
  const [ivForm,setIvForm]=useState({company:'',type:'DSA',round:'Round 1',result:'Passed',notes:''});
  const [showIvForm,setShowIvForm]=useState(false);
  const [showVitForm,setShowVitForm]=useState(false);
  const [vitForm,setVitForm]=useState({name:'',dose:'',frequency:'daily',color:C.acc});
  const [editingVitamin,setEditingVitamin]=useState(null);
  const [expandedTopic,setExpandedTopic]=useState(null);
  const [vitWeekAnchor,setVitWeekAnchor]=useState(toDay());

  const setAllDates=(dateStr)=>{
    setSelectedDate(dateStr);
    setWaterDate(dateStr);
    setJournalDate(dateStr);
    setWeightDate(dateStr);
  };

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          waterRes,
          vitaminsRes,
          vitaminLogsRes,
          weightRes,
          dsaRes,
          strengthRes,
          journalRes,
          companiesRes,
          systemDesignRes,
          interviewsRes,
          skinPhotosRes,
          skinRoutineItemsRes,
          skinRoutineLogsRes
        ] = await Promise.all([
          supabase.from('water_logs').select('*').order('created_at', { ascending: true }),
          supabase.from('vitamins').select('*').order('created_at', { ascending: true }),
          supabase.from('vitamin_logs').select('*'),
          supabase.from('weight_logs').select('*').order('date', { ascending: false }),
          supabase.from('dsa_problems').select('*').order('date', { ascending: false }),
          supabase.from('strength_logs').select('*').order('date', { ascending: false }),
          supabase.from('journal_entries').select('*').order('date', { ascending: false }),
          supabase.from('companies').select('*'),
          supabase.from('system_design').select('*'),
          supabase.from('interviews').select('*').order('date', { ascending: false }),
          supabase.from('skin_photos').select('*'),
          supabase.from('skin_routine_items').select('*').order('created_at', { ascending: true }),
          supabase.from('skin_routine_logs').select('*')
        ]);

        if (waterRes.data) setWaterLogs(waterRes.data);
        if (vitaminsRes.data) setVitamins(vitaminsRes.data);
        if (vitaminLogsRes.data) setVitaminLogs(vitaminLogsRes.data);
        if (weightRes.data) setWeight(weightRes.data);
        if (dsaRes.data) setDsa(dsaRes.data);
        if (strengthRes.data) setPerf(strengthRes.data);
        if (journalRes.data) setJournal(journalRes.data);
        if (companiesRes.data) setCompanies(companiesRes.data);
        if (systemDesignRes.data) setSystemDesign(systemDesignRes.data);
        if (interviewsRes.data) setInterviews(interviewsRes.data);
        
        // Convert skin photos array to map { date: url }
        if (skinPhotosRes.data) {
          const photoMap = skinPhotosRes.data.reduce((acc, row) => {
            const url = row.photo_url || row.url || row.image_url || row.path;
            if (url) acc[row.date] = url;
            return acc;
          }, {});
          setSkinPhotos(photoMap);
        }

        if (skinRoutineItemsRes?.data) setSkinRoutineItems(skinRoutineItemsRes.data);
        if (skinRoutineLogsRes?.data) setSkinRoutineLogs(skinRoutineLogsRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Upload skin photo to Supabase Storage
  const uploadSkin = async (file, date) => {
    try {
      // Optimistic local preview so you immediately see the photo
      const localUrl = URL.createObjectURL(file);
      setSkinPhotos(p => ({ ...p, [date]: localUrl }));

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('skin-photos')
        .upload(`${date}.jpg`, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Generate signed URL
      const { data: urlData } = await supabase.storage
        .from('skin-photos')
        .createSignedUrl(`${date}.jpg`, 60 * 60 * 24 * 365); // 1 year expiry

      if (urlData?.signedUrl) {
        // Upsert to skin_photos table
        await supabase
          .from('skin_photos')
          .upsert({ date: date, photo_url: urlData.signedUrl }, { onConflict: 'date' });

        // Update React state
        setSkinPhotos(p => ({ ...p, [date]: urlData.signedUrl }));
      }
    } catch (error) {
      console.error('Error uploading skin photo:', error);
    }
  };

  const addSkinRoutineItem = async () => {
    if(!skinRoutineForm.name.trim()) return;
    try{
      const payload = { routine: skinRoutineForm.routine, name: skinRoutineForm.name.trim() };
      const { data, error } = await supabase
        .from('skin_routine_items')
        .insert(payload)
        .select()
        .single();
      if(error) throw error;
      if(data) setSkinRoutineItems(p=>[...p,data]);
      setSkinRoutineForm(f=>({ ...f, name:'' }));
    }catch(e){
      console.error('Error adding routine item:', e);
    }
  };

  const deleteSkinRoutineItem = async (item) => {
    try{
      await supabase.from('skin_routine_items').delete().eq('id', item.id);
      setSkinRoutineItems(p=>p.filter(x=>x.id!==item.id));
      setSkinRoutineLogs(p=>p.filter(l=>l.item_id!==item.id));
    }catch(e){
      console.error('Error deleting routine item:', e);
    }
  };

  const toggleSkinRoutine = async (itemId, dateStr) => {
    const ex = skinRoutineLogs.find(l=>l.item_id===itemId && l.date===dateStr);
    try{
      if(ex){
        await supabase.from('skin_routine_logs').delete().eq('id', ex.id);
        setSkinRoutineLogs(p=>p.filter(l=>l.id!==ex.id));
      }else{
        const { data, error } = await supabase
          .from('skin_routine_logs')
          .insert({ item_id: itemId, date: dateStr })
          .select()
          .single();
        if(error) throw error;
        if(data) setSkinRoutineLogs(p=>[...p,data]);
      }
    }catch(e){
      console.error('Error toggling routine log:', e);
    }
  };

  const todayStr=toDay();
  const todayWater=useMemo(()=>waterLogs.filter(l=>l.date===todayStr).reduce((s,l)=>s+l.amount,0),[waterLogs,todayStr]);
  const waterPct=Math.min(100,Math.round((todayWater/waterGoal)*100));
  const todayDSA=dsa.filter(p=>p.date===todayStr).length;
  const todayJournal=journal.some(e=>e.date===todayStr);
  const todayWorkout=perf.some(l=>l.date===todayStr);
  const dsaStreak=useMemo(()=>calcStreak([...new Set(dsa.map(p=>p.date))]),[dsa]);
  const workoutStreak=useMemo(()=>calcStreak([...new Set(perf.map(l=>l.date))]),[perf]);
  const journalStreak=useMemo(()=>calcStreak(journal.map(e=>e.date)),[journal]);
  const waterStreak=useMemo(()=>{const t=waterLogs.reduce((a,l)=>{a[l.date]=(a[l.date]||0)+l.amount;return a},{});return calcStreak(Object.entries(t).filter(([,v])=>v>=waterGoal).map(([d])=>d));},[waterLogs,waterGoal]);
  const streaks=[{l:'DSA',v:dsaStreak,c:C.acc},{l:'Strength',v:workoutStreak,c:C.suc},{l:'Journal',v:journalStreak,c:C.war},{l:'Water',v:waterStreak,c:C.blue}];

  const go=(v)=>{
    setView(v);
    if(['water','weight','vitamin','skin'].includes(v)) setWellnessOpen(true);
    if(['dsa','fundamentals','systemdesign','misc','interview','companies'].includes(v)) setLpaOpen(true);
  };
  const addWater=async(a,dateOverride)=>{
    const targetDate=dateOverride||waterDate||todayStr;
    const { data } = await supabase
      .from('water_logs')
      .insert({ date: targetDate, amount: a, time: nowT() })
      .select()
      .single();
    if (data) setWaterLogs(p=>[...p, data]);
  };
  const addDSA=async()=>{
    if(!dsaForm.name.trim()) return;
    const { data } = await supabase
      .from('dsa_problems')
      .insert({
        date: todayStr,
        name: dsaForm.name,
        source: dsaForm.source,
        link: dsaForm.link,
        tags: dsaForm.tags.split(',').map(t=>t.trim()).filter(Boolean),
        difficulty: dsaForm.difficulty,
        notes: dsaForm.notes
      })
      .select()
      .single();
    if (data) {
      setDsa(p=>[...p, data]);
      setDsaForm({name:'',source:'LeetCode',link:'',tags:'',difficulty:'Medium',notes:''});
    }
  };
  const addPerf=async()=>{
    const { data } = await supabase
      .from('strength_logs')
      .insert({ date: todayStr, type: perfForm.type, notes: perfForm.notes })
      .select()
      .single();
    if (data) {
      setPerf(p=>[...p, data]);
      setPerfForm({type:'Shadowboxing',notes:''});
    }
  };
  const addWeight=async(dateOverride)=>{
    if(!wForm.weight) return;
    const targetDate = dateOverride || weightDate || todayStr;
    const { data } = await supabase
      .from('weight_logs')
      .insert({ date: targetDate, weight: parseFloat(wForm.weight), note: wForm.note })
      .select()
      .single();
    if (data) {
      setWeight(p=>[...p, data]);
      setWForm({weight:'',note:''});
    }
  };
  const addCompany=async()=>{
    if(!coForm.name.trim()) return;
    const { data } = await supabase
      .from('companies')
      .insert({ name: coForm.name, ctc: coForm.ctc, role: coForm.role, status: coForm.status, note: coForm.note })
      .select()
      .single();
    if (data) {
      setCompanies(p=>[...p, data]);
      setCoForm({name:'',ctc:'',role:'',status:'Not Applied',note:''});
      setShowCoForm(false);
    }
  };
  const saveJournal=async(targetDate)=>{
    if(!jForm.content.trim()) return;
    const dateToUse = targetDate || journalDate || todayStr;
    const ex=journal.findIndex(e=>e.date===dateToUse);
    
    if(ex>=0) {
      // Update existing entry
      const existingEntry = journal[ex];
      const { data } = await supabase
        .from('journal_entries')
        .update({ title: jForm.title, content: jForm.content })
        .eq('id', existingEntry.id)
        .select()
        .single();
      if (data) setJournal(p=>p.map((e,i)=>i===ex?data:e));
    } else {
      // Insert new entry
      const { data } = await supabase
        .from('journal_entries')
        .insert({ date: dateToUse, title: jForm.title, content: jForm.content })
        .select()
        .single();
      if (data) setJournal(p=>[...p, data]);
    }
    
    setJForm({title:'',content:''});
    setJEditing(false);
  };
  const toggleVit=async(vitId,date)=>{
    const ex=vitaminLogs.find(l=>l.vitaminId===vitId&&l.date===date);
    if(ex) {
      // Delete existing log
      await supabase.from('vitamin_logs').delete().eq('id', ex.id);
      setVitaminLogs(p=>p.filter(l=>l.id!==ex.id));
    } else {
      // Insert new log
      const { data } = await supabase
        .from('vitamin_logs')
        .insert({ vitaminId: vitId, date: date })
        .select()
        .single();
      if (data) setVitaminLogs(p=>[...p, data]);
    }
  };
  const saveVitamin=async()=>{
    if(!vitForm.name.trim()) return;
    if(editingVitamin){
      const { data } = await supabase
        .from('vitamins')
        .update({ name: vitForm.name, dose: vitForm.dose, frequency: vitForm.frequency, color: vitForm.color })
        .eq('id', editingVitamin.id)
        .select()
        .single();
      if (data) {
        setVitamins(p=>p.map(v=>v.id===editingVitamin.id?data:v));
        setEditingVitamin(null);
      }
    }else{
      const { data } = await supabase
        .from('vitamins')
        .insert({ name: vitForm.name, dose: vitForm.dose, frequency: vitForm.frequency, color: vitForm.color })
        .select()
        .single();
      if (data) {
        setVitamins(p=>[...p, data]);
      }
    }
    setVitForm({name:'',dose:'',frequency:'daily',color:C.acc});
    setShowVitForm(false);
  };

  const deleteVitamin = async (vitamin) => {
    await supabase.from('vitamins').delete().eq('id', vitamin.id);
    setVitamins(p => p.filter(v => v.id !== vitamin.id));
    setVitaminLogs(p => p.filter(l => l.vitaminId !== vitamin.id));
  };
  const handleSkin=(e,date)=>{const f=e.target.files[0];if(!f) return;uploadSkin(f,date);};
  const saveSD=async()=>{
    if(!sdForm.topic.trim()) return;
    const refs = sdForm.refs.split(',').map(r=>r.trim()).filter(Boolean);
    
    if(sdModal==='new') {
      const { data } = await supabase
        .from('system_design')
        .insert({ topic: sdForm.topic, notes: sdForm.notes, refs: refs })
        .select()
        .single();
      if (data) setSystemDesign(p=>[...p, data]);
    } else {
      const { data } = await supabase
        .from('system_design')
        .update({ topic: sdForm.topic, notes: sdForm.notes, refs: refs })
        .eq('id', sdModal.id)
        .select()
        .single();
      if (data) setSystemDesign(p=>p.map(s=>s.id===sdModal.id?data:s));
    }
    
    setSdModal(null);
    setSdForm({topic:'',notes:'',refs:''});
  };
  const addInterview=async()=>{
    const { data } = await supabase
      .from('interviews')
      .insert({ date: todayStr, company: ivForm.company, type: ivForm.type, round: ivForm.round, result: ivForm.result, notes: ivForm.notes })
      .select()
      .single();
    if (data) {
      setInterviews(p=>[...p, data]);
      setIvForm({company:'',type:'DSA',round:'Round 1',result:'Passed',notes:''});
      setShowIvForm(false);
    }
  };

  // ── SIDEBAR ──────────────────────────────────────────────────────────────────
  const Sidebar=()=>(
    <div style={{width:'210px',minWidth:'210px',background:C.surf,borderRight:`1px solid ${C.bord}`,padding:'20px 10px',display:'flex',flexDirection:'column',position:'sticky',top:0,height:'100vh',overflowY:'auto'}}>
      <div style={{display:'flex',alignItems:'center',gap:'9px',padding:'0 8px 22px'}}>
        <div style={{width:'28px',height:'28px',background:C.acc,borderRadius:'7px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,color:'#fff',fontSize:'14px'}}>L</div>
        <span style={{fontWeight:800,fontSize:'15px',letterSpacing:'-0.03em'}}>LifeOS</span>
      </div>
      <NavItem label='Dashboard' active={view==='dashboard'} onClick={()=>go('dashboard')}/>
      <Divider/>
      <NavGroup label='Wellness' open={wellnessOpen} onClick={()=>setWellnessOpen(o=>!o)} dot={waterPct>=100||weight.some(w=>w.date===todayStr)}/>
      {wellnessOpen&&<div style={{marginLeft:'8px',borderLeft:`1px solid ${C.bord}`,paddingLeft:'8px',marginBottom:'4px'}}>
        <NavItem label='Water' active={view==='water'} onClick={()=>go('water')} dot={waterPct>=100} sub/>
        <NavItem label='Weight' active={view==='weight'} onClick={()=>go('weight')} dot={weight.some(w=>w.date===todayStr)} sub/>
        <NavItem label='Vitamins' active={view==='vitamin'} onClick={()=>go('vitamin')} sub/>
        <NavItem label='Skin' active={view==='skin'} onClick={()=>go('skin')} dot={!!skinPhotos[todayStr]} sub/>
      </div>}
      <NavItem label='Strength' active={view==='strength'} onClick={()=>go('strength')} dot={todayWorkout}/>
      <Divider/>
      <NavGroup label='40+ LPA' open={lpaOpen} onClick={()=>setLpaOpen(o=>!o)} dot={todayDSA>0}/>
      {lpaOpen&&<div style={{marginLeft:'8px',borderLeft:`1px solid ${C.bord}`,paddingLeft:'8px',marginBottom:'4px'}}>
        <NavItem label='DSA' active={view==='dsa'} onClick={()=>go('dsa')} dot={todayDSA>0} sub/>
        <NavItem label='Fundamentals' active={view==='fundamentals'} onClick={()=>go('fundamentals')} sub/>
        <NavItem label='System Design' active={view==='systemdesign'} onClick={()=>go('systemdesign')} sub/>
        <NavItem label='Miscellaneous' active={view==='misc'} onClick={()=>go('misc')} sub/>
        <NavItem label='Interview' active={view==='interview'} onClick={()=>go('interview')} dot={interviews.some(i=>i.date===todayStr)} sub/>
        <NavItem label='Companies' active={view==='companies'} onClick={()=>go('companies')} sub/>
      </div>}
      <Divider/>
      <NavItem label='Journal' active={view==='journal'} onClick={()=>go('journal')} dot={todayJournal}/>
      <div style={{marginTop:'auto',borderTop:`1px solid ${C.bord}`,paddingTop:'14px'}}>
        <SLabel>Streaks</SLabel>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
          {streaks.map(s=><div key={s.l} style={{textAlign:'center'}}>
            <div style={{fontWeight:800,fontSize:'18px',color:s.c,fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>{s.v}</div>
            <div style={{color:C.mut,fontSize:'9px',fontWeight:600,letterSpacing:'0.08em',marginTop:'2px',textTransform:'uppercase'}}>{s.l}</div>
          </div>)}
        </div>
      </div>
    </div>
  );

  // ── VIEWS ─────────────────────────────────────────────────────────────────────

  const VDashboard=()=>{
    const h=new Date().getHours();
    const greet=h<12?'Good morning.':h<17?'Good afternoon.':'Good evening.';
    const today=[
      {label:'Water',done:waterPct>=100,value:`${waterPct}% · ${todayWater}ml`,nav:'water'},
      {label:'DSA',done:todayDSA>0,value:`${todayDSA} solved today`,nav:'dsa'},
      {label:'Journal',done:todayJournal,value:todayJournal?'Written':'Not written',nav:'journal'},
      {label:'Strength',done:todayWorkout,value:todayWorkout?'Logged':'Not logged',nav:'strength'},
    ];
    return(<div>
      <div style={{marginBottom:'32px'}}>
        <div style={{color:C.mut,fontSize:'11px',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'4px'}}>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</div>
        <h1 style={{fontSize:'30px',fontWeight:800,letterSpacing:'-0.03em',margin:0}}>{greet}</h1>
      </div>
      <div style={{marginBottom:'24px'}}>
        <SLabel>Streaks</SLabel>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px'}}>
          {streaks.map(s=><Card key={s.l} style={{padding:'18px',textAlign:'center'}}>
            <div style={{fontSize:'32px',fontWeight:800,color:s.c,fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>{s.v}</div>
            <div style={{color:C.mut,fontSize:'10px',fontWeight:600,letterSpacing:'0.08em',marginTop:'5px',textTransform:'uppercase'}}>{s.l}</div>
          </Card>)}
        </div>
      </div>
      <div style={{marginBottom:'24px'}}>
        <SLabel>Today</SLabel>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'10px'}}>
          {today.map(s=><Card key={s.label} onClick={()=>go(s.nav)} style={{padding:'16px',display:'flex',alignItems:'center',gap:'12px',cursor:'pointer'}}>
            <div style={{width:'36px',height:'36px',borderRadius:'8px',flexShrink:0,background:s.done?C.sucBg:C.bord,display:'flex',alignItems:'center',justifyContent:'center',color:s.done?C.suc:C.mut,fontWeight:800,fontSize:'14px'}}>{s.done?'✓':'·'}</div>
            <div>
              <div style={{fontWeight:700,fontSize:'14px',color:s.done?C.text:C.mut}}>{s.label}</div>
              <div style={{fontSize:'12px',color:s.done?C.suc:C.mut,marginTop:'1px'}}>{s.value}</div>
            </div>
          </Card>)}
        </div>
      </div>
      <div>
        <SLabel>Quick Add</SLabel>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          <Btn onClick={()=>addWater(300)} variant='accent'>+ 300ml</Btn>
          <Btn onClick={()=>addWater(500)} variant='accent'>+ 500ml</Btn>
          <Btn onClick={()=>{go('journal');setJEditing(true);}} variant='ghost'>+ Journal</Btn>
          <Btn onClick={()=>go('dsa')} variant='ghost'>+ DSA</Btn>
          <Btn onClick={()=>go('strength')} variant='ghost'>+ Workout</Btn>
        </div>
      </div>
    </div>);
  };

  const VWater=()=>{
    const activeDate = waterDate || todayStr;
    const activeLogs = waterLogs.filter(l=>l.date===activeDate).sort((a,b)=>a.time<b.time?-1:1);
    const selLog=waterLogs.filter(l=>l.date===selectedDate);
    return(<div>
      <PH title='Water' right={<Badge color={waterPct>=100?'suc':'acc'}>{waterPct}% of goal</Badge>}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
        <div>
          <Card style={{marginBottom:'12px'}}>
            <SLabel>{activeDate===todayStr?'Today':fmtLong(activeDate)} — {waterLogs.filter(l=>l.date===activeDate).reduce((s,l)=>s+l.amount,0)}ml / {waterGoal}ml</SLabel>
            <div style={{background:C.bord,borderRadius:'999px',height:'8px',marginBottom:'16px',overflow:'hidden'}}>
              <div style={{background:`linear-gradient(90deg,${C.acc},${C.blue})`,height:'100%',width:`${waterPct}%`,borderRadius:'999px',transition:'width 0.4s'}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'10px'}}>
              {[200,300,500].map(a=><button key={a} onClick={()=>addWater(a)} style={{background:C.accBg,border:`1px solid ${C.accBord}`,borderRadius:'8px',color:C.acc,fontFamily:'inherit',fontWeight:700,fontSize:'14px',padding:'12px 0',cursor:'pointer'}}>+{a}</button>)}
            </div>
            <div style={{display:'flex',gap:'8px',marginBottom:'8px'}}>
              <Input type='number' value={wCustom} onChange={setWCustom} placeholder='Custom ml'/>
              <Btn onClick={()=>{if(wCustom){addWater(parseInt(wCustom));setWCustom('')}}}>Add</Btn>
            </div>
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              <span style={{color:C.mut,fontSize:'11px'}}>For date:</span>
              <Input type='date' value={waterDate} onChange={setWaterDate} style={{maxWidth:'150px'}}/>
            </div>
          </Card>
          <Card>
            <SLabel>Log for {activeDate===todayStr?'today':fmt(activeDate)}</SLabel>
            {activeLogs.length===0?<div style={{color:C.mut,textAlign:'center',padding:'10px 0'}}>Nothing yet</div>
            :activeLogs.map((l,i)=><div key={l.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:i<activeLogs.length-1?`1px solid ${C.bord}`:'none'}}>
              <div>
                <span style={{fontWeight:600}}>{l.amount} ml</span>
                <span style={{color:C.mut,fontSize:'12px',fontFamily:"'JetBrains Mono',monospace",marginLeft:'6px'}}>{l.time}</span>
              </div>
              <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                <button
                  onClick={async()=>{
                    const nextAmountStr = window.prompt('New amount (ml)', String(l.amount));
                    if(!nextAmountStr) return;
                    const nextAmount = parseInt(nextAmountStr,10);
                    if(Number.isNaN(nextAmount) || nextAmount<=0) return;
                    const { data } = await supabase
                      .from('water_logs')
                      .update({ amount: nextAmount })
                      .eq('id', l.id)
                      .select()
                      .single();
                    if(data){
                      setWaterLogs(p=>p.map(x=>x.id===l.id?data:x));
                    }
                  }}
                  style={{background:'transparent',border:`1px solid ${C.bord}`,borderRadius:'6px',color:C.mut,cursor:'pointer',fontSize:'11px',padding:'2px 6px'}}
                >
                  Edit
                </button>
                <button
                  onClick={async()=>{
                    const ok = window.confirm('Delete this entry?');
                    if(!ok) return;
                    await supabase.from('water_logs').delete().eq('id', l.id);
                    setWaterLogs(p=>p.filter(x=>x.id!==l.id));
                  }}
                  style={{background:'transparent',border:'none',color:C.dan,cursor:'pointer',fontSize:'13px'}}
                >
                  ✕
                </button>
              </div>
            </div>)}
          </Card>
        </div>
        <div>
          <Cal activeDates={[...new Set(waterLogs.map(l=>l.date))]} selectedDate={selectedDate} onSelect={setAllDates} calDate={calDate} setCalDate={setCalDate} todayStr={todayStr}/>
          {selectedDate&&selectedDate!==todayStr&&<Card style={{marginTop:'10px'}}>
            <SLabel>{fmt(selectedDate)}</SLabel>
            {selLog.length===0?<div style={{color:C.mut}}>No entries</div>:<>
              <div style={{fontWeight:800,fontSize:'20px',fontFamily:"'JetBrains Mono',monospace",marginBottom:'4px'}}>{selLog.reduce((s,l)=>s+l.amount,0)} ml</div>
              {selLog.map(l=><div key={l.id} style={{color:C.mut,fontSize:'12px'}}>+{l.amount} ml at {l.time}</div>)}
            </>}
          </Card>}
          <Card style={{marginTop:'10px'}}>
            <SLabel>Daily goal</SLabel>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px'}}>
              {[2000,2500,3000,3500].map(g=><button key={g} onClick={()=>setWaterGoal(g)} style={{background:waterGoal===g?C.acc:C.high,border:`1px solid ${waterGoal===g?C.acc:C.bord}`,borderRadius:'6px',color:waterGoal===g?'#fff':C.mut,fontFamily:'inherit',fontSize:'11px',fontWeight:700,padding:'8px 4px',cursor:'pointer',transition:'all 0.15s'}}>{g/1000}L</button>)}
            </div>
          </Card>
        </div>
      </div>
    </div>);
  };

  const VVitamin=()=>{
    const last7=Array.from({length:7},(_,i)=>shiftDate(vitWeekAnchor, i-6));
    const isTaken=(vitId,date)=>vitaminLogs.some(l=>l.vitaminId===vitId&&l.date===date);

    const parseFrequencyDays = (freq) => {
      if (!freq) return new Set();
      const f = freq.toLowerCase().trim();
      if (!f) return new Set();
      const codes = ['sun','mon','tue','wed','thu','fri','sat'];
      if (f.includes('daily')) return new Set(codes);
      if (f.includes('weekday')) return new Set(['mon','tue','wed','thu','fri']);
      if (f.includes('weekend')) return new Set(['sat','sun']);
      const tokens = f.split(/[, ]+/).map(t=>t.trim()).filter(Boolean);
      const set = new Set();
      tokens.forEach(t=>{
        const match = codes.find(c=>c.startsWith(t.slice(0,3)));
        if (match) set.add(match);
      });
      return set;
    };

    const matchesFrequency = (freq, dateStr) => {
      const selected = parseFrequencyDays(freq);
      if (!selected.size) return true; // no frequency configured -> track everyday
      const d = new Date(dateStr + 'T00:00');
      const dayIdx = d.getDay();
      const codes = ['sun','mon','tue','wed','thu','fri','sat'];
      const day = codes[dayIdx];
      return selected.has(day);
    };
    return(<div>
      <PH title='Vitamins' right={<Btn size='sm' onClick={()=>{
        setEditingVitamin(null);
        setVitForm({name:'',dose:'',frequency:'daily',color:C.acc});
        setShowVitForm(f=>!f);
      }}>+ Add Vitamin</Btn>}/>
      {showVitForm&&<Card style={{marginBottom:'16px'}}>
        <SLabel>{editingVitamin?'Edit vitamin':'New vitamin'}</SLabel>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'8px',marginBottom:'8px'}}>
          <Input value={vitForm.name} onChange={v=>setVitForm(f=>({...f,name:v}))} placeholder='Vitamin name *'/>
          <Input value={vitForm.dose} onChange={v=>setVitForm(f=>({...f,dose:v}))} placeholder='Dose'/>
        </div>
        <div style={{marginBottom:'10px'}}>
          <div style={{color:C.mut,fontSize:'11px',marginBottom:'4px'}}>Frequency — pick days you expect to take</div>
          {(() => {
            const codes = ['mon','tue','wed','thu','fri','sat','sun'];
            const labels = ['M','T','W','T','F','S','S'];
            const selected = parseFrequencyDays(vitForm.frequency || '');
            const toggleDay = (code) => {
              const next = new Set(selected);
              if (next.has(code)) next.delete(code); else next.add(code);
              const ordered = codes.filter(c=>next.has(c));
              const value = ordered.length===7 ? 'daily' : ordered.join(',');
              setVitForm(f=>({...f,frequency:value}));
            };
            const setPreset = (type) => {
              if (type==='clear') {
                setVitForm(f=>({...f,frequency:''}));
              } else if (type==='daily') {
                setVitForm(f=>({...f,frequency:'daily'}));
              } else if (type==='weekdays') {
                setVitForm(f=>({...f,frequency:'mon,tue,wed,thu,fri'}));
              } else if (type==='weekends') {
                setVitForm(f=>({...f,frequency:'sat,sun'}));
              }
            };
            return (
              <>
                <div style={{display:'flex',gap:'4px',marginBottom:'6px'}}>
                  {codes.map((code,idx)=>(
                    <button
                      key={code}
                      type='button'
                      onClick={()=>toggleDay(code)}
                      style={{
                        flex:1,
                        padding:'6px 0',
                        borderRadius:'6px',
                        border:`1px solid ${selected.has(code)?C.acc:C.bord}`,
                        background:selected.has(code)?C.accBg:C.high,
                        color:selected.has(code)?C.acc:C.mut,
                        fontSize:'11px',
                        cursor:'pointer'
                      }}
                    >
                      {labels[idx]}
                    </button>
                  ))}
                </div>
                <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
                  <button type='button' onClick={()=>setPreset('daily')} style={{border:'none',background:'transparent',color:C.mut,fontSize:'11px',cursor:'pointer'}}>Daily</button>
                  <button type='button' onClick={()=>setPreset('weekdays')} style={{border:'none',background:'transparent',color:C.mut,fontSize:'11px',cursor:'pointer'}}>Weekdays</button>
                  <button type='button' onClick={()=>setPreset('weekends')} style={{border:'none',background:'transparent',color:C.mut,fontSize:'11px',cursor:'pointer'}}>Weekends</button>
                  <button type='button' onClick={()=>setPreset('clear')} style={{border:'none',background:'transparent',color:C.mut,fontSize:'11px',cursor:'pointer'}}>Clear</button>
                </div>
              </>
            );
          })()}
        </div>
        <div style={{display:'flex',gap:'8px'}}><Btn onClick={saveVitamin} disabled={!vitForm.name.trim()}>{editingVitamin?'Update':'Save'}</Btn><Btn onClick={()=>{setShowVitForm(false);setEditingVitamin(null);}} variant='ghost'>Cancel</Btn></div>
      </Card>}
      <Card style={{marginBottom:'16px',overflowX:'auto'}}>
        <SLabel>This week</SLabel>
        {last7.length===7&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px',color:C.mut,fontSize:'11px'}}>
          <span>Week {fmt(last7[0])} – {fmt(last7[6])}</span>
          <div style={{display:'flex',gap:'6px'}}>
            <button
              type='button'
              onClick={()=>setVitWeekAnchor(shiftDate(vitWeekAnchor,-7))}
              style={{background:'transparent',border:`1px solid ${C.bord}`,borderRadius:'6px',color:C.mut,fontSize:'11px',padding:'3px 8px',cursor:'pointer'}}
            >
              ‹ Prev
            </button>
            <button
              type='button'
              onClick={()=>setVitWeekAnchor(shiftDate(vitWeekAnchor,7))}
              style={{background:'transparent',border:`1px solid ${C.bord}`,borderRadius:'6px',color:C.mut,fontSize:'11px',padding:'3px 8px',cursor:'pointer'}}
            >
              Next ›
            </button>
          </div>
        </div>}
        <table style={{width:'100%',borderCollapse:'collapse',minWidth:'800px'}}>
          <thead><tr>
            <th style={{color:C.mut,fontSize:'11px',textAlign:'left',padding:'4px 8px',fontWeight:600,width:'180px'}}>Supplement</th>
            {last7.map(d=>{const dt=new Date(d+'T00:00');return<th key={d} style={{color:d===todayStr?C.text:C.mut,fontSize:'10px',textAlign:'center',padding:'4px 6px',fontWeight:d===todayStr?700:500}}>
              <div>{getDayName(dt.getDay())}</div><div style={{fontWeight:400,marginTop:'1px'}}>{dt.getDate()}</div>
            </th>;})}
          </tr></thead>
          <tbody>{vitamins.map(v=><tr key={v.id} style={{borderTop:`1px solid ${C.bord}`}}>
            <td style={{padding:'10px 8px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',justifyContent:'space-between'}}>
                <div style={{display:'flex',flexDirection:'column',gap:'2px'}}>
                  <div style={{fontWeight:600,fontSize:'13px'}}>{v.name}</div>
                  <div style={{fontSize:'10px',color:C.mut}}>{v.dose}{v.frequency ? ` · ${v.frequency}` : ''}</div>
                </div>
                <div style={{display:'flex',gap:'4px'}}>
                  <button
                    onClick={()=>{
                      setEditingVitamin(v);
                      setVitForm({name:v.name,dose:v.dose,frequency:v.frequency,color:v.color});
                      setShowVitForm(true);
                    }}
                    style={{background:'transparent',border:`1px solid ${C.bord}`,borderRadius:'6px',color:C.mut,fontSize:'11px',padding:'3px 6px',cursor:'pointer'}}
                  >
                    Edit
                  </button>
                  <button
                    onClick={()=>{if(window.confirm('Delete this vitamin and its logs?')) deleteVitamin(v);}}
                    style={{background:'transparent',border:`1px solid ${C.bord}`,borderRadius:'6px',color:C.dan,fontSize:'11px',padding:'3px 6px',cursor:'pointer'}}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </td>
            {last7.map(d=>{
              const taken=isTaken(v.id,d);
              const expected = matchesFrequency(v.frequency, d);
              const baseBorder = expected ? `1px solid ${C.bord}` : `1px dashed ${C.bord}`;
              const baseOpacity = expected ? 1 : 0.35;
              const bg = taken ? C.acc : 'transparent';
              const color = taken ? '#fff' : C.mut;
              const cellOpacity = taken ? 1 : baseOpacity;
              return<td
                key={d}
                style={{
                  textAlign:'center',
                  padding:'10px 6px',
                  opacity:cellOpacity,
                  borderLeft:baseBorder,
                  borderRight:baseBorder
                }}>
                <button
                  onClick={()=>toggleVit(v.id,d)}
                  style={{
                    width:'28px',
                    height:'28px',
                    borderRadius:'7px',
                    border: taken ? `1px solid ${C.accBord}` : baseBorder,
                    background:bg,
                    cursor:'pointer',
                    display:'inline-flex',
                    alignItems:'center',
                    justifyContent:'center',
                    transition:'all 0.15s',
                    fontSize:'14px',
                    color
                  }}>
                  {taken ? '✓' : '·'}
                </button>
            </td>;})}
          </tr>)}</tbody>
        </table>
      </Card>
      <SLabel>Today</SLabel>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px'}}>
        {vitamins.map(v=>{const taken=isTaken(v.id,todayStr);return<Card key={v.id} onClick={()=>toggleVit(v.id,todayStr)} style={{padding:'14px',cursor:'pointer',display:'flex',alignItems:'center',gap:'12px',background:taken?C.accBg:C.surf,border:`1px solid ${taken?C.accBord:C.bord}`,transition:'all 0.15s'}}>
          <div style={{width:'32px',height:'32px',borderRadius:'8px',background:C.high,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',flexShrink:0}}>
            {taken?<span style={{color:C.acc,fontWeight:800}}>✓</span>:<span style={{color:C.mut}}>○</span>}
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:'13px',color:taken?C.text:C.mut}}>{v.name}</div>
            <div style={{fontSize:'11px',color:taken?C.acc:C.mut}}>
              {v.dose}{v.frequency ? ` · ${v.frequency}` : ''} · {taken?'Taken ✓':'Tap to mark'}
            </div>
          </div>
        </Card>;})}
      </div>
    </div>);
  };

  const VSkin=()=>{
    const photoDatesSorted=Object.keys(skinPhotos).sort().reverse();
    const week7 = Array.from({length:7},(_,i)=>shiftDate(skinRoutineWeekAnchor, i-6));
    const isDone = (itemId, dateStr) => skinRoutineLogs.some(l=>l.item_id===itemId && l.date===dateStr);
    const itemsBy = (routine) => skinRoutineItems.filter(i=>i.routine===routine);
    return(<div>
      <PH title='Skin' right={<Btn onClick={()=>setSkinCompareMode(m=>!m)} variant={skinCompareMode?'accent':'ghost'} size='sm'>{skinCompareMode?'Exit Compare':'⇔ Compare'}</Btn>}/>
      {skinCompareMode?(<Card>
        <SLabel>Side-by-side comparison</SLabel>
        <div style={{display:'flex',gap:'12px',marginBottom:'16px'}}>
          <div style={{flex:1}}>
            <div style={{color:C.mut,fontSize:'11px',marginBottom:'6px'}}>Date A</div>
            <Sel value={skinCmpA} onChange={setSkinCmpA} options={[{v:'',l:'Select date'},...photoDatesSorted.map(d=>({v:d,l:fmt(d)}))]}/>
          </div>
          <div style={{flex:1}}>
            <div style={{color:C.mut,fontSize:'11px',marginBottom:'6px'}}>Date B</div>
            <Sel value={skinCmpB} onChange={setSkinCmpB} options={[{v:'',l:'Select date'},...photoDatesSorted.map(d=>({v:d,l:fmt(d)}))]}/>
          </div>
        </div>
        {skinCmpA&&skinCmpB?<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
          {[skinCmpA,skinCmpB].map(d=><div key={d} style={{textAlign:'center'}}>
            <div style={{color:C.mut,fontSize:'12px',fontWeight:600,marginBottom:'8px'}}>{fmtLong(d)}</div>
            <img src={skinPhotos[d]} alt='' style={{width:'100%',aspectRatio:'3/4',objectFit:'cover',borderRadius:'10px',border:`1px solid ${C.bord}`}}/>
          </div>)}
        </div>:<div style={{color:C.mut,textAlign:'center',padding:'40px'}}>Select two dates above to compare</div>}
      </Card>):(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
          <div>
            <Card>
              <SLabel>Today — {fmt(todayStr)}</SLabel>
              {skinPhotos[todayStr]?<div style={{position:'relative'}}>
                <img src={skinPhotos[todayStr]} alt='' style={{width:'100%',aspectRatio:'3/4',objectFit:'cover',borderRadius:'10px',border:`1px solid ${C.bord}`}}/>
                <label style={{position:'absolute',bottom:'10px',right:'10px',background:'rgba(17,17,25,0.85)',border:`1px solid ${C.bord}`,borderRadius:'8px',padding:'6px 12px',color:C.text,fontSize:'11px',fontWeight:600,cursor:'pointer',backdropFilter:'blur(4px)'}}>
                  Retake <input type='file' accept='image/*' style={{display:'none'}} onChange={e=>handleSkin(e,todayStr)}/>
                </label>
              </div>:<label style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',aspectRatio:'3/4',borderRadius:'10px',border:`2px dashed ${C.bord}`,cursor:'pointer',gap:'10px'}}>
                <div style={{fontSize:'32px',color:C.mut}}>+</div>
                <div style={{color:C.mut,fontSize:'13px'}}>Upload today's photo</div>
                <input type='file' accept='image/*' style={{display:'none'}} onChange={e=>handleSkin(e,todayStr)}/>
              </label>}
            </Card>

            <div style={{marginTop:'12px',display:'grid',gap:'12px'}}>
              {(['morning','night']).map((r)=>(
                <Card key={r} style={{padding:'16px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                    <SLabel>{r==='morning'?'Morning routine':'Night routine'}</SLabel>
                    <Badge color='mut'>{itemsBy(r).length}</Badge>
                  </div>

                  <div style={{display:'flex',gap:'8px',marginBottom:'10px'}}>
                    <Input
                      value={skinRoutineForm.routine===r ? skinRoutineForm.name : ''}
                      onChange={(v)=>setSkinRoutineForm({ routine:r, name:v })}
                      placeholder={r==='morning'?'Add item (e.g. sunscreen)':'Add item (e.g. retinol)'}
                    />
                    <Btn onClick={addSkinRoutineItem} disabled={skinRoutineForm.routine!==r || !skinRoutineForm.name.trim()}>Add</Btn>
                  </div>

                  {itemsBy(r).length===0 ? (
                    <div style={{color:C.mut,fontSize:'12px'}}>No items yet.</div>
                  ) : (
                    <div style={{overflowX:'auto'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px',color:C.mut,fontSize:'11px'}}>
                        <span>Week {fmt(week7[0])} – {fmt(week7[6])}</span>
                        <div style={{display:'flex',gap:'6px'}}>
                          <button type='button' onClick={()=>setSkinRoutineWeekAnchor(shiftDate(skinRoutineWeekAnchor,-7))} style={{background:'transparent',border:`1px solid ${C.bord}`,borderRadius:'6px',color:C.mut,fontSize:'11px',padding:'3px 8px',cursor:'pointer'}}>‹ Prev</button>
                          <button type='button' onClick={()=>setSkinRoutineWeekAnchor(shiftDate(skinRoutineWeekAnchor,7))} style={{background:'transparent',border:`1px solid ${C.bord}`,borderRadius:'6px',color:C.mut,fontSize:'11px',padding:'3px 8px',cursor:'pointer'}}>Next ›</button>
                        </div>
                      </div>

                      <table style={{width:'100%',borderCollapse:'collapse',minWidth:'560px'}}>
                        <thead>
                          <tr>
                            <th style={{color:C.mut,fontSize:'11px',textAlign:'left',padding:'4px 8px',fontWeight:600,width:'180px'}}>Item</th>
                            {week7.map(d=>{
                              const dt=new Date(d+'T00:00');
                              return (
                                <th key={d} style={{color:d===todayStr?C.text:C.mut,fontSize:'10px',textAlign:'center',padding:'4px 6px',fontWeight:d===todayStr?700:500}}>
                                  <div>{getDayName(dt.getDay())}</div>
                                  <div style={{fontWeight:400,marginTop:'1px'}}>{dt.getDate()}</div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {itemsBy(r).map(item=>(
                            <tr key={item.id} style={{borderTop:`1px solid ${C.bord}`}}>
                              <td style={{padding:'8px'}}>
                                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'8px'}}>
                                  <span style={{fontWeight:600,fontSize:'13px'}}>{item.name}</span>
                                  <button onClick={()=>{ if(window.confirm('Delete this routine item?')) deleteSkinRoutineItem(item); }} style={{background:'transparent',border:'none',color:C.dan,cursor:'pointer',fontSize:'13px'}}>✕</button>
                                </div>
                              </td>
                              {week7.map(d=>{
                                const done = isDone(item.id, d);
                                return (
                                  <td key={d} style={{textAlign:'center',padding:'8px 6px'}}>
                                    <button
                                      onClick={()=>toggleSkinRoutine(item.id, d)}
                                      style={{
                                        width:'28px',
                                        height:'28px',
                                        borderRadius:'7px',
                                        border: done ? `1px solid ${C.accBord}` : `1px solid ${C.bord}`,
                                        background: done ? C.acc : 'transparent',
                                        color: done ? '#fff' : C.mut,
                                        cursor:'pointer',
                                        fontSize:'14px',
                                        fontWeight:800,
                                        display:'inline-flex',
                                        alignItems:'center',
                                        justifyContent:'center'
                                      }}
                                    >
                                      {done?'✓':'·'}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
          <div>
            <Cal activeDates={Object.keys(skinPhotos)} selectedDate={selectedDate} onSelect={setAllDates} calDate={calDate} setCalDate={setCalDate} todayStr={todayStr} dotColor={C.pink}/>
            {selectedDate&&skinPhotos[selectedDate]&&selectedDate!==todayStr&&<Card style={{marginTop:'10px'}}>
              <SLabel>{fmtLong(selectedDate)}</SLabel>
              <img src={skinPhotos[selectedDate]} alt='' style={{width:'100%',aspectRatio:'3/4',objectFit:'cover',borderRadius:'8px'}}/>
            </Card>}
            {photoDatesSorted.length>0&&<Card style={{marginTop:'10px'}}>
              <SLabel>All photos ({photoDatesSorted.length})</SLabel>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px'}}>
                {photoDatesSorted.slice(0,9).map(d=><div key={d} onClick={()=>setSelectedDate(d)} style={{cursor:'pointer',position:'relative',borderRadius:'6px',overflow:'hidden',border:`1px solid ${selectedDate===d?C.pink:C.bord}`}}>
                  <img src={skinPhotos[d]} alt='' style={{width:'100%',aspectRatio:'1',objectFit:'cover'}}/>
                  <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.7)',padding:'4px',textAlign:'center'}}>
                    <span style={{color:'#fff',fontSize:'9px',fontWeight:600}}>{fmt(d)}</span>
                  </div>
                </div>)}
              </div>
            </Card>}
          </div>
        </div>
      )}
    </div>);
  };

  const VStrength=()=>{
    const activeDates=[...new Set(perf.map(l=>l.date))];
    const todayLogs=perf.filter(l=>l.date===todayStr);
    const selLogs=perf.filter(l=>l.date===selectedDate);
    return(<div>
      <PH title='Strength' right={<Badge color='suc'>{workoutStreak}d streak</Badge>}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
        <div>
          <Card style={{marginBottom:'12px'}}>
            <SLabel>Log workout</SLabel>
            <div style={{display:'grid',gap:'8px'}}>
              <Sel value={perfForm.type} onChange={v=>setPerfForm(f=>({...f,type:v}))} options={['Shadowboxing','Stretching','Exercise','Running','Cycling','Yoga','HIIT','Other']}/>
              <Textarea value={perfForm.notes} onChange={v=>setPerfForm(f=>({...f,notes:v}))} placeholder='Sets, reps, rounds, duration...' rows={4}/>
              <Btn onClick={addPerf} full>Log Workout</Btn>
            </div>
          </Card>
          {todayLogs.length>0&&<Card><SLabel>Today</SLabel>
            {todayLogs.map((l,i)=><div key={l.id} style={{padding:'10px 0',borderBottom:i<todayLogs.length-1?`1px solid ${C.bord}`:'none'}}>
              <div style={{fontWeight:700,color:C.suc,fontSize:'13px',marginBottom:'4px'}}>{l.type}</div>
              {l.notes&&<div style={{color:C.mut,fontSize:'12px',lineHeight:1.6,whiteSpace:'pre-wrap'}}>{l.notes}</div>}
            </div>)}
          </Card>}
        </div>
        <div>
          <Cal activeDates={activeDates} selectedDate={selectedDate} onSelect={setAllDates} calDate={calDate} setCalDate={setCalDate} todayStr={todayStr} dotColor={C.suc}/>
          {selLogs.length>0&&selectedDate!==todayStr&&<Card style={{marginTop:'10px'}}>
            <SLabel>{fmtLong(selectedDate)}</SLabel>
            {selLogs.map((l,i)=><div key={l.id} style={{padding:'10px 0',borderBottom:i<selLogs.length-1?`1px solid ${C.bord}`:'none'}}>
              <div style={{fontWeight:700,color:C.suc,fontSize:'13px',marginBottom:'4px'}}>{l.type}</div>
              {l.notes&&<div style={{color:C.mut,fontSize:'12px',lineHeight:1.6}}>{l.notes}</div>}
            </div>)}
          </Card>}
        </div>
      </div>
    </div>);
  };

  const VDSA=()=>{
    const diffCol={Easy:'suc',Medium:'war',Hard:'dan'};
    const sources=['All',...new Set(dsa.map(p=>p.source))];
    const filtered=dsa.filter(p=>{
      if(dsaFilter.source!=='All'&&p.source!==dsaFilter.source) return false;
      if(dsaFilter.difficulty!=='All'&&p.difficulty!==dsaFilter.difficulty) return false;
      if(dsaFilter.tag&&!p.tags.some(t=>t.toLowerCase().includes(dsaFilter.tag.toLowerCase()))) return false;
      return true;
    }).sort((a,b)=>b.date.localeCompare(a.date));
    return(<div>
      <PH title='DSA' right={<><Badge color='acc'>{dsaStreak}d streak</Badge><Badge color='suc'>{dsa.length} solved</Badge><Badge color='mut'>today: {todayDSA}</Badge></>}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
        <div>
          <Card>
            <SLabel>Log problem</SLabel>
            <div style={{display:'grid',gap:'8px'}}>
              <Input value={dsaForm.name} onChange={v=>setDsaForm(f=>({...f,name:v}))} placeholder='Problem name *'/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                <Sel value={dsaForm.source} onChange={v=>setDsaForm(f=>({...f,source:v}))} options={['LeetCode','GeeksForGeeks','CodeForces','HackerRank','InterviewBit','Other']}/>
                <Sel value={dsaForm.difficulty} onChange={v=>setDsaForm(f=>({...f,difficulty:v}))} options={['Easy','Medium','Hard']}/>
              </div>
              <Input value={dsaForm.link} onChange={v=>setDsaForm(f=>({...f,link:v}))} placeholder='Problem link (optional)'/>
              <Input value={dsaForm.tags} onChange={v=>setDsaForm(f=>({...f,tags:v}))} placeholder='Tags: Array, DP, Graph ...'/>
              <Textarea value={dsaForm.notes} onChange={v=>setDsaForm(f=>({...f,notes:v}))} placeholder='Approach, complexity, key insight...' rows={4}/>
              <Btn onClick={addDSA} disabled={!dsaForm.name.trim()} full>Add Problem</Btn>
            </div>
          </Card>
        </div>
        <div>
          <Card style={{marginBottom:'10px',padding:'14px'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px'}}>
              <Sel value={dsaFilter.source} onChange={v=>setDsaFilter(f=>({...f,source:v}))} options={sources}/>
              <Sel value={dsaFilter.difficulty} onChange={v=>setDsaFilter(f=>({...f,difficulty:v}))} options={['All','Easy','Medium','Hard']}/>
              <Input value={dsaFilter.tag} onChange={v=>setDsaFilter(f=>({...f,tag:v}))} placeholder='Filter by tag'/>
            </div>
          </Card>
          <div style={{display:'grid',gap:'6px',maxHeight:'520px',overflowY:'auto'}}>
            {filtered.map(p=>{
              const exp=expandedDsa===p.id;
              return(<Card key={p.id} style={{padding:'12px',cursor:'pointer',borderColor:exp?C.accBord:C.bord,transition:'border-color 0.15s'}} onClick={()=>setExpandedDsa(exp?null:p.id)}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div style={{flex:1,minWidth:0,marginRight:'8px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'4px'}}>
                      <span style={{fontWeight:700,fontSize:'13px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</span>
                      {p.link&&<a href={p.link} target='_blank' rel='noreferrer' onClick={e=>e.stopPropagation()} style={{color:C.acc,fontSize:'11px',flexShrink:0}}>↗</a>}
                    </div>
                    <div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>{p.tags.map(t=><Badge key={t} color='mut'>{t}</Badge>)}</div>
                  </div>
                  <div style={{display:'flex',gap:'4px',alignItems:'center',flexShrink:0}}>
                    <Badge color={diffCol[p.difficulty]}>{p.difficulty}</Badge>
                    <span style={{color:C.mut,fontSize:'11px',marginLeft:'4px'}}>{exp?'▲':'▼'}</span>
                  </div>
                </div>
                {exp&&<div style={{marginTop:'12px',paddingTop:'12px',borderTop:`1px solid ${C.bord}`}}>
                  <div style={{display:'flex',gap:'6px',flexWrap:'wrap',marginBottom:'10px'}}>
                    <Badge color='mut'>{p.source}</Badge><Badge color='mut'>{fmt(p.date)}</Badge>
                  </div>
                  {p.notes?<div style={{background:C.bg,borderRadius:'8px',padding:'12px',color:C.mut,fontSize:'13px',lineHeight:1.75,whiteSpace:'pre-wrap',fontFamily:"'JetBrains Mono',monospace"}}>{p.notes}</div>
                  :<div style={{color:C.mut,fontSize:'12px'}}>No notes added.</div>}
                </div>}
              </Card>);
            })}
            {filtered.length===0&&<div style={{color:C.mut,textAlign:'center',padding:'40px'}}>No problems match filters</div>}
          </div>
        </div>
      </div>
    </div>);
  };

  const VNotes=({data,title})=>(
    <div>
      <PH title={title}/>
      <div style={{display:'grid',gap:'10px'}}>
        {Object.entries(data).map(([subject,topics])=><Card key={subject} style={{padding:'0',overflow:'hidden'}}>
          <div style={{padding:'14px 18px',background:C.high,borderBottom:`1px solid ${C.bord}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div style={{fontWeight:700,fontSize:'14px'}}>{subject}</div>
            <Badge color='mut'>{topics.length}</Badge>
          </div>
          <div style={{padding:'4px 0'}}>
            {topics.map((topic,i)=><div key={topic.id}>
              <div onClick={()=>setExpandedTopic(expandedTopic===topic.id?null:topic.id)} style={{padding:'12px 18px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:i>0?`1px solid ${C.bord}`:'none'}}>
                <span style={{fontWeight:600,fontSize:'13px'}}>{topic.title}</span>
                <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                  <span style={{color:C.mut,fontSize:'10px',fontFamily:"'JetBrains Mono',monospace"}}>{topic.file}</span>
                  <span style={{color:C.mut,fontSize:'11px'}}>{expandedTopic===topic.id?'▲':'▼'}</span>
                </div>
              </div>
              {expandedTopic===topic.id&&<div style={{padding:'0 18px 16px',background:C.bg}}>
                <div style={{color:C.mut,fontSize:'13px',lineHeight:1.7,marginBottom:'12px'}}>{topic.notes}</div>
                <div style={{background:C.high,border:`2px dashed ${C.bord}`,borderRadius:'8px',padding:'14px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
                  <div style={{fontSize:'20px'}}>📄</div>
                  <div>
                    <div style={{fontWeight:600,fontSize:'12px',color:C.text,marginBottom:'2px'}}>{topic.file}</div>
                    <div style={{color:C.mut,fontSize:'11px'}}>Place this HTML file in your project — it will render here once connected</div>
                  </div>
                </div>
              </div>}
            </div>)}
          </div>
        </Card>)}
      </div>
    </div>
  );

  const VSystemDesign=()=>(
    <div>
      <PH title='System Design' right={<Btn size='sm' onClick={()=>{setSdModal('new');setSdForm({topic:'',notes:'',refs:''});}}>+ Add Topic</Btn>}/>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'12px'}}>
        {systemDesign.map(s=><Card key={s.id} style={{padding:'0',overflow:'hidden'}}>
          <div style={{padding:'14px 18px',background:C.high,borderBottom:`1px solid ${C.bord}`,display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div style={{fontWeight:700,fontSize:'14px',flex:1,marginRight:'8px'}}>{s.topic}</div>
            <Btn size='sm' variant='ghost' onClick={()=>{setSdModal(s);setSdForm({topic:s.topic,notes:s.notes,refs:s.refs.join(', ')});}}>Edit</Btn>
          </div>
          <div style={{padding:'14px 18px'}}>
            {s.notes?<div style={{color:C.mut,fontSize:'13px',lineHeight:1.7,marginBottom:s.refs.length?'10px':'0'}}>{s.notes}</div>:<div style={{color:C.mut,fontSize:'12px',fontStyle:'italic'}}>No notes yet.</div>}
            {s.refs.length>0&&<div style={{display:'flex',gap:'4px',flexWrap:'wrap'}}>{s.refs.map((r,i)=><Badge key={i} color='acc'>{r}</Badge>)}</div>}
          </div>
        </Card>)}
        <div onClick={()=>{setSdModal('new');setSdForm({topic:'',notes:'',refs:''});}} style={{border:`2px dashed ${C.bord}`,borderRadius:'12px',padding:'30px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'8px',cursor:'pointer',color:C.mut,minHeight:'120px'}}>
          <div style={{fontSize:'24px'}}>+</div><div style={{fontSize:'13px'}}>New Topic</div>
        </div>
      </div>
      {sdModal&&<Modal title={sdModal==='new'?'New System Design Topic':'Edit Topic'} onClose={()=>setSdModal(null)}>
        <div style={{display:'grid',gap:'10px'}}>
          <Input value={sdForm.topic} onChange={v=>setSdForm(f=>({...f,topic:v}))} placeholder='Topic (e.g. Design WhatsApp) *'/>
          <Textarea value={sdForm.notes} onChange={v=>setSdForm(f=>({...f,notes:v}))} placeholder='Key concepts, architecture decisions, trade-offs...' rows={8}/>
          <Input value={sdForm.refs} onChange={v=>setSdForm(f=>({...f,refs:v}))} placeholder='References (comma separated)'/>
          <div style={{display:'flex',gap:'8px'}}><Btn onClick={saveSD} disabled={!sdForm.topic.trim()} full>Save</Btn><Btn onClick={()=>setSdModal(null)} variant='ghost'>Cancel</Btn></div>
        </div>
      </Modal>}
    </div>
  );

  const VInterview=()=>{
    const rCol={Passed:'suc',Failed:'dan',Pending:'war','No Show':'mut'};
    const tCol={DSA:'acc','System Design':'blue',Behavioral:'war',Mixed:'pink'};
    return(<div>
      <PH title='Interview' right={<Btn size='sm' onClick={()=>setShowIvForm(f=>!f)}>+ Log Interview</Btn>}/>
      {showIvForm&&<Card style={{marginBottom:'16px'}}>
        <SLabel>Log interview experience</SLabel>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'8px'}}>
          <Input value={ivForm.company} onChange={v=>setIvForm(f=>({...f,company:v}))} placeholder='Company *'/>
          <Sel value={ivForm.type} onChange={v=>setIvForm(f=>({...f,type:v}))} options={['DSA','System Design','Behavioral','Mixed']}/>
          <Input value={ivForm.round} onChange={v=>setIvForm(f=>({...f,round:v}))} placeholder='Round'/>
        </div>
        <div style={{marginBottom:'8px'}}>
          <Sel value={ivForm.result} onChange={v=>setIvForm(f=>({...f,result:v}))} options={['Passed','Pending','Failed','No Show']}/>
        </div>
        <Textarea value={ivForm.notes} onChange={v=>setIvForm(f=>({...f,notes:v}))} placeholder='Questions asked, approach, feedback, what to improve...' rows={4}/>
        <div style={{display:'flex',gap:'8px',marginTop:'8px'}}><Btn onClick={addInterview} disabled={!ivForm.company.trim()}>Save</Btn><Btn onClick={()=>setShowIvForm(false)} variant='ghost'>Cancel</Btn></div>
      </Card>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'20px'}}>
        {['Passed','Pending','Failed','No Show'].map(r=><Card key={r} style={{padding:'14px',textAlign:'center'}}>
          <div style={{fontSize:'26px',fontWeight:800,color:C[rCol[r]]||C.mut,fontFamily:"'JetBrains Mono',monospace"}}>{interviews.filter(i=>i.result===r).length}</div>
          <div style={{color:C.mut,fontSize:'11px',marginTop:'3px'}}>{r}</div>
        </Card>)}
      </div>
      <div style={{display:'grid',gap:'10px'}}>
        {[...interviews].sort((a,b)=>b.date.localeCompare(a.date)).map(iv=><Card key={iv.id} style={{padding:'16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
            <div style={{fontWeight:700,fontSize:'14px'}}>{iv.company} — {iv.round}</div>
            <Badge color='mut'>{fmt(iv.date)}</Badge>
          </div>
          <div style={{display:'flex',gap:'6px',marginBottom:iv.notes?'10px':'0'}}>
            <Badge color={tCol[iv.type]}>{iv.type}</Badge>
            <Badge color={rCol[iv.result]}>{iv.result}</Badge>
          </div>
          {iv.notes&&<div style={{color:C.mut,fontSize:'13px',lineHeight:1.7,whiteSpace:'pre-wrap'}}>{iv.notes}</div>}
        </Card>)}
        {interviews.length===0&&<div style={{color:C.mut,textAlign:'center',padding:'60px'}}>No interviews logged yet</div>}
      </div>
    </div>);
  };

  const VCompanies=()=>{
    const statOpts=['Not Applied','Applied','OA','Interview','Rejected','Offer'];
    const statCol={'Not Applied':'mut',Applied:'acc',OA:'war',Interview:'war',Rejected:'dan',Offer:'suc'};
    return(<div>
      <PH title='Companies' right={<Btn onClick={()=>setShowCoForm(f=>!f)}>+ Add Company</Btn>}/>
      {showCoForm&&<Card style={{marginBottom:'16px'}}>
        <SLabel>New company</SLabel>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'8px',marginBottom:'8px'}}>
          <Input value={coForm.name} onChange={v=>setCoForm(f=>({...f,name:v}))} placeholder='Company *'/>
          <Input value={coForm.ctc} onChange={v=>setCoForm(f=>({...f,ctc:v}))} placeholder='Target CTC'/>
          <Input value={coForm.role} onChange={v=>setCoForm(f=>({...f,role:v}))} placeholder='Role'/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:'8px',marginBottom:'8px'}}>
          <Sel value={coForm.status} onChange={v=>setCoForm(f=>({...f,status:v}))} options={statOpts}/>
          <Input value={coForm.note} onChange={v=>setCoForm(f=>({...f,note:v}))} placeholder='Note'/>
        </div>
        <div style={{display:'flex',gap:'8px'}}><Btn onClick={addCompany} disabled={!coForm.name.trim()}>Save</Btn><Btn onClick={()=>setShowCoForm(false)} variant='ghost'>Cancel</Btn></div>
      </Card>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'10px',marginBottom:'16px'}}>
        {['Applied','OA','Interview','Offer'].map(s=><Card key={s} style={{padding:'14px',textAlign:'center'}}>
          <div style={{fontSize:'26px',fontWeight:800,color:s==='Offer'?C.suc:C.text,fontFamily:"'JetBrains Mono',monospace"}}>{companies.filter(c=>c.status===s).length}</div>
          <div style={{color:C.mut,fontSize:'11px',marginTop:'3px'}}>{s}</div>
        </Card>)}
      </div>
      <div style={{display:'grid',gap:'8px'}}>
        {companies.map(c=><Card key={c.id} style={{padding:'14px'}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1.5fr 2fr',gap:'12px',alignItems:'center'}}>
            <div><div style={{fontWeight:700,fontSize:'13px'}}>{c.name}</div><div style={{color:C.mut,fontSize:'11px'}}>{c.role}</div></div>
            <div style={{fontWeight:700,color:C.acc,fontSize:'13px'}}>{c.ctc}</div>
            <Badge color={statCol[c.status]}>{c.status}</Badge>
            <Sel value={c.status} onChange={async(v)=>{
              await supabase.from('companies').update({status:v}).eq('id',c.id);
              setCompanies(p=>p.map(co=>co.id===c.id?{...co,status:v}:co));
            }} options={statOpts} style={{fontSize:'11px',padding:'4px 8px'}}/>
            <div style={{color:C.mut,fontSize:'12px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.note}</div>
          </div>
        </Card>)}
      </div>
    </div>);
  };

  const VWeight=()=>{
    const sorted=[...weight].sort((a,b)=>b.date.localeCompare(a.date));
    const latest=sorted[0],prev=sorted[1];
    const diff=latest&&prev?(latest.weight-prev.weight).toFixed(1):null;
    return(<div>
      <PH title='Weight'/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
        <div>
          {latest&&<Card style={{marginBottom:'12px'}}>
            <SLabel>Latest</SLabel>
            <div style={{display:'flex',alignItems:'baseline',gap:'4px',marginBottom:'4px'}}>
              <span style={{fontSize:'42px',fontWeight:800,fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>{latest.weight}</span>
              <span style={{color:C.mut,fontSize:'16px'}}>kg</span>
            </div>
            {diff!==null&&<div style={{color:parseFloat(diff)<0?C.suc:parseFloat(diff)>0?C.dan:C.mut,fontWeight:600,marginBottom:'4px'}}>{parseFloat(diff)>0?'+':''}{diff} kg from prev</div>}
            <div style={{color:C.mut,fontSize:'12px'}}>{fmt(latest.date)}</div>
          </Card>}
          <Card>
            <SLabel>Log weight</SLabel>
            <div style={{display:'grid',gap:'8px'}}>
              <Input type='date' value={weightDate} onChange={v=>setWeightDate(v)} placeholder=''/>
              <Input type='number' value={wForm.weight} onChange={v=>setWForm(f=>({...f,weight:v}))} placeholder='Weight in kg'/>
              <Input value={wForm.note} onChange={v=>setWForm(f=>({...f,note:v}))} placeholder='Note (optional)'/>
              <Btn onClick={()=>addWeight()} disabled={!wForm.weight} full>Log</Btn>
            </div>
          </Card>
        </div>
        <Card>
          <SLabel>History</SLabel>
          {sorted.map((l,i)=><div key={l.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:i<sorted.length-1?`1px solid ${C.bord}`:'none'}}>
            <div>
              <span style={{fontWeight:700,fontSize:'18px',fontFamily:"'JetBrains Mono',monospace"}}>{l.weight}</span>
              <span style={{color:C.mut,fontSize:'13px'}}> kg</span>
              {l.note&&<div style={{color:C.mut,fontSize:'11px'}}>{l.note}</div>}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <span style={{color:C.mut,fontSize:'12px',fontFamily:"'JetBrains Mono',monospace"}}>{fmt(l.date)}</span>
              <button
                onClick={async()=>{
                  if(!window.confirm('Delete this weight entry?')) return;
                  await supabase.from('weight_logs').delete().eq('id', l.id);
                  setWeight(p=>p.filter(x=>x.id!==l.id));
                }}
                style={{background:'transparent',border:'none',color:C.dan,cursor:'pointer',fontSize:'13px'}}
              >
                ✕
              </button>
            </div>
          </div>)}
        </Card>
      </div>
    </div>);
  };

  const VJournal=()=>{
    const todayEntry=journal.find(e=>e.date===todayStr);
    const selEntry=journal.find(e=>e.date===selectedDate);
    const showForm=jEditing||!todayEntry;
    return(<div>
      <PH title='Journal' right={<Badge color='war'>{journalStreak}d streak</Badge>}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px'}}>
        <div>
          <Card>
            <SLabel>{showForm?(todayEntry?'Edit entry':'New entry'): 'Today — '+fmtLong(todayStr)}</SLabel>
            {showForm?<div style={{display:'grid',gap:'8px'}}>
              <Input type='date' value={journalDate} onChange={v=>setJournalDate(v)} placeholder=''/>
              <Input value={jForm.title} onChange={v=>setJForm(f=>({...f,title:v}))} placeholder='Title (optional)'/>
              <Textarea value={jForm.content} onChange={v=>setJForm(f=>({...f,content:v}))} placeholder={'What happened today?\nHow do you feel?\nWhat are you working towards?'} rows={8}/>
              <div style={{display:'flex',gap:'8px'}}>
                <Btn onClick={()=>saveJournal(journalDate)} disabled={!jForm.content.trim()} full>Save</Btn>
                {todayEntry&&<Btn onClick={()=>{setJEditing(false);setJForm({title:'',content:''});setJournalDate(todayStr);}} variant='ghost'>Cancel</Btn>}
              </div>
            </div>:<div>
              {todayEntry.title&&<div style={{fontWeight:700,fontSize:'15px',marginBottom:'10px'}}>{todayEntry.title}</div>}
              <div style={{color:C.mut,fontSize:'13px',lineHeight:1.8,whiteSpace:'pre-wrap',marginBottom:'16px'}}>{todayEntry.content}</div>
              <div style={{display:'flex',gap:'8px'}}>
                <Btn onClick={()=>{setJForm({title:todayEntry.title,content:todayEntry.content});setJournalDate(todayStr);setJEditing(true);}} variant='ghost' size='sm'>Edit</Btn>
                <Btn
                  onClick={async()=>{
                    if(!window.confirm('Delete today\'s entry?')) return;
                    await supabase.from('journal_entries').delete().eq('id', todayEntry.id);
                    setJournal(p=>p.filter(e=>e.id!==todayEntry.id));
                  }}
                  variant='ghost'
                  size='sm'
                >
                  Delete
                </Btn>
              </div>
            </div>}
          </Card>
        </div>
        <div>
          <Cal activeDates={journal.map(e=>e.date)} selectedDate={selectedDate} onSelect={setAllDates} calDate={calDate} setCalDate={setCalDate} todayStr={todayStr} dotColor={C.war}/>
          {selEntry&&selectedDate!==todayStr&&<Card style={{marginTop:'10px'}}>
            <SLabel>{fmtLong(selectedDate)}</SLabel>
            {selEntry.title&&<div style={{fontWeight:700,fontSize:'14px',marginBottom:'8px'}}>{selEntry.title}</div>}
            <div style={{color:C.mut,fontSize:'13px',lineHeight:1.8,whiteSpace:'pre-wrap',marginBottom:'12px'}}>{selEntry.content}</div>
            <div style={{display:'flex',gap:'8px'}}>
              <Btn
                onClick={()=>{
                  setJForm({title:selEntry.title,content:selEntry.content});
                  setJournalDate(selectedDate);
                  setJEditing(true);
                }}
                variant='ghost'
                size='sm'
              >
                Edit
              </Btn>
              <Btn
                onClick={async()=>{
                  if(!window.confirm('Delete this entry?')) return;
                  await supabase.from('journal_entries').delete().eq('id', selEntry.id);
                  setJournal(p=>p.filter(e=>e.id!==selEntry.id));
                }}
                variant='ghost'
                size='sm'
              >
                Delete
              </Btn>
            </div>
          </Card>}
        </div>
      </div>
    </div>);
  };

  const views={
    dashboard: VDashboard,
    water: VWater,
    weight: VWeight,
    vitamin: VVitamin,
    skin: VSkin,
    strength: VStrength,
    dsa: VDSA,
    fundamentals: () => <VNotes data={iFundamentals} title='Fundamentals'/>,
    systemdesign: VSystemDesign,
    misc: () => <VNotes data={iMisc} title='Miscellaneous'/>,
    interview: VInterview,
    companies: VCompanies,
    journal: VJournal,
  };

  const ActiveView = views[view] || VDashboard;

  return(<>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      ::-webkit-scrollbar{width:4px;height:4px;}
      ::-webkit-scrollbar-track{background:transparent;}
      ::-webkit-scrollbar-thumb{background:${C.bord};border-radius:99px;}
      input,textarea,select{outline:none;}
      input::placeholder,textarea::placeholder{color:${C.mut};}
      input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;}
      button:active{transform:scale(0.97);}
      a{text-decoration:none;}
      select option{background:${C.high};}
    `}</style>
    <div style={{fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",background:C.bg,color:C.text,minHeight:'100vh',display:'flex',fontSize:'14px'}}>
      {Sidebar()}
      <div style={{flex:1,padding:'36px 44px',overflowY:'auto',maxHeight:'100vh'}}>
        {ActiveView()}
      </div>
    </div>
  </>);
}