"use client";

import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { C } from "@/ui/theme";
import {
  toDay,
  daysAgo,
  fmt,
  fmtLong,
  nowT,
  shiftDate,
  iD,
  getDayName,
  calcStreak,
} from "@/lib/dateUtils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Badge,
  Btn,
  Input,
  Textarea,
  Sel,
  Card,
  SLabel,
  PH,
  Modal,
  Cal,
  NavItem,
  NavGroup,
  Divider,
} from "@/ui/primitives";

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
  {id:iD(30),vitamin_id:1,date:daysAgo(0)},{id:iD(31),vitamin_id:2,date:daysAgo(0)},
  {id:iD(32),vitamin_id:3,date:daysAgo(1)},{id:iD(33),vitamin_id:1,date:daysAgo(1)},
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
const iSleep=[]; // { id, date, start_time, end_time, durationHours }
const iCracker=[]; // { id, date, content, act, urge, note }
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

// UI primitives and sidebar components are imported from "@/ui/primitives"

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
  const [sleepLogs,setSleepLogs]=useState(iSleep);
  const [sleepDate,setSleepDate]=useState(shiftDate(toDay(),-1));
  const [sleepForm,setSleepForm]=useState({start_time:'23:30',end_time:'07:00'});
  const [crackerLogs,setCrackerLogs]=useState(iCracker);
  const [crackerDate,setCrackerDate]=useState(toDay());
  const [crackerForm,setCrackerForm]=useState({content:false,act:false,urge:false,note:''});
  const [vitamins,setVitamins]=useState(iVits);
  const [vitaminLogs,setVitaminLogs]=useState(iVitLogs);
  const [skinPhotos,setSkinPhotos]=useState({});
  const [skinPending,setSkinPending]=useState({}); // { date: [{file, localUrl}] } — not yet saved
  const [skinSaving,setSkinSaving]=useState(false);
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
  const [strengthDate,setStrengthDate]=useState(toDay());
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
  const [htmlNotes,setHtmlNotes]=useState([]); // { id, section, name, storage_path, created_at }
  const [htmlNoteForm,setHtmlNoteForm]=useState({ section:'fundamentals', name:'', file:null });
  const [htmlNoteModal,setHtmlNoteModal]=useState(null); // note row
  const [htmlNoteHtml,setHtmlNoteHtml]=useState(''); // fetched html

  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const setAllDates=(dateStr)=>{
    setSelectedDate(dateStr);
    setWaterDate(dateStr);
    setSleepDate(dateStr);
    setCrackerDate(dateStr);
    setJournalDate(dateStr);
    setWeightDate(dateStr);
    setStrengthDate(dateStr);
  };

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          waterRes,
          sleepRes,
          crackerRes,
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
          skinRoutineLogsRes,
          htmlNotesRes
        ] = await Promise.all([
          supabase.from('water_logs').select('*').order('created_at', { ascending: true }),
          supabase.from('sleep_logs').select('*').order('date', { ascending: false }),
          supabase.from('cracker_logs').select('*').order('date', { ascending: false }),
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
          supabase.from('skin_routine_logs').select('*'),
          supabase.from('html_notes').select('*').order('created_at', { ascending: true })
        ]);

        if (waterRes.data) setWaterLogs(waterRes.data);
        if (sleepRes.data) {
          // Map duration_hours to durationHours for consistency
          const mappedSleep = sleepRes.data.map(s => ({...s, durationHours: s.duration_hours}));
          setSleepLogs(mappedSleep);
        }
        if (crackerRes.data) setCrackerLogs(crackerRes.data);
        if (vitaminsRes.data) setVitamins(vitaminsRes.data);
        if (vitaminLogsRes.data) setVitaminLogs(vitaminLogsRes.data);
        if (weightRes.data) setWeight(weightRes.data);
        if (dsaRes.data) setDsa(dsaRes.data);
        if (strengthRes.data) setPerf(strengthRes.data);
        if (journalRes.data) setJournal(journalRes.data);
        if (companiesRes.data) setCompanies(companiesRes.data);
        if (systemDesignRes.data) setSystemDesign(systemDesignRes.data);
        if (interviewsRes.data) setInterviews(interviewsRes.data);
        
        // Convert skin photos array to map { date: url[] }
        if (skinPhotosRes.data) {
          const photoMap = skinPhotosRes.data.reduce((acc, row) => {
            const url = row.photo_url || row.url || row.image_url || row.path;
            if (url) {
              if (!acc[row.date]) acc[row.date] = [];
              acc[row.date].push({ url, id: row.id, path: row.path || row.storage_path });
            }
            return acc;
          }, {});
          setSkinPhotos(photoMap);
        }

        if (skinRoutineItemsRes?.data) setSkinRoutineItems(skinRoutineItemsRes.data);
        if (skinRoutineLogsRes?.data) setSkinRoutineLogs(skinRoutineLogsRes.data);
        if (htmlNotesRes?.data) setHtmlNotes(htmlNotesRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  // Stage files locally — no Supabase calls until saveSkinPhotos()
  const handleSkin = (e, date) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newEntries = files.map(file => ({ file, localUrl: URL.createObjectURL(file), tempId: `temp_${Date.now()}_${Math.random()}` }));
    setSkinPending(p => ({ ...p, [date]: [...(p[date]||[]), ...newEntries] }));
    e.target.value = '';
  };

  // Remove a pending (not yet saved) photo
  const removePending = (date, tempId) => {
    setSkinPending(p => {
      const updated = (p[date]||[]).filter(x=>x.tempId!==tempId);
      if (!updated.length) { const n={...p}; delete n[date]; return n; }
      return { ...p, [date]: updated };
    });
  };

  // Upload all pending photos for a date and save to DB
  const saveSkinPhotos = async (date) => {
    const pending = skinPending[date] || [];
    if (!pending.length) return;

    // Verify session exists before attempting upload
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert('Not logged in — please refresh and sign in again.'); return; }

    setSkinSaving(true);
    try {
      const saved = [];
      for (const entry of pending) {
        const storagePath = `${date}_${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('skin-photos')
          .upload(storagePath, entry.file, { upsert: false });
        if (uploadError) throw uploadError;

        const { data: urlData, error: urlError } = await supabase.storage
          .from('skin-photos')
          .createSignedUrl(storagePath, 60 * 60 * 24 * 365);
        if (urlError) throw urlError;

        const { data: inserted, error: dbError } = await supabase
          .from('skin_photos')
          .insert({ date, photo_url: urlData.signedUrl, path: storagePath })
          .select()
          .single();
        if (dbError) throw dbError;

        saved.push({ url: urlData.signedUrl, id: inserted.id, path: storagePath });
      }
      setSkinPhotos(p => ({ ...p, [date]: [...(p[date]||[]), ...saved] }));
      setSkinPending(p => { const n={...p}; delete n[date]; return n; });
    } catch (err) {
      console.error('Error saving skin photos:', err);
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSkinSaving(false);
    }
  };

  const deleteSkinPhoto = async (date, photo) => {
    try {
      if (photo.path) await supabase.storage.from('skin-photos').remove([photo.path]);
      await supabase.from('skin_photos').delete().eq('id', photo.id);
      setSkinPhotos(p => {
        const updated = (p[date]||[]).filter(x=>x.id!==photo.id);
        if (!updated.length) { const n={...p}; delete n[date]; return n; }
        return { ...p, [date]: updated };
      });
    } catch (e) {
      console.error('Error deleting skin photo:', e);
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

  const addHtmlNote = async () => {
    if(!htmlNoteForm.name.trim() || !htmlNoteForm.file) return;
    try{
      const safeName = htmlNoteForm.name.trim().replace(/[^a-z0-9-_ ]/gi,'').replace(/\s+/g,'-').toLowerCase() || 'note';
      const ext = (htmlNoteForm.file.name.split('.').pop() || 'html').toLowerCase();
      const filename = `${safeName}-${Date.now()}.${ext==='htm'?'html':ext}`;
      const storagePath = `${htmlNoteForm.section}/${filename}`;

      const { error: upErr } = await supabase.storage
        .from('html-notes')
        .upload(storagePath, htmlNoteForm.file, { upsert: true, contentType: 'text/html' });
      if(upErr) throw upErr;

      const { data, error } = await supabase
        .from('html_notes')
        .insert({ section: htmlNoteForm.section, name: htmlNoteForm.name.trim(), storage_path: storagePath })
        .select()
        .single();
      if(error) throw error;
      if(data) setHtmlNotes(p=>[...p,data]);
      setHtmlNoteForm({ section: htmlNoteForm.section, name:'', file:null });
    }catch(e){
      console.error('Error adding html note:', e);
    }
  };

  const deleteHtmlNote = async (note) => {
    try{
      await supabase.from('html_notes').delete().eq('id', note.id);
      if(note.storage_path){
        await supabase.storage.from('html-notes').remove([note.storage_path]);
      }
      setHtmlNotes(p=>p.filter(n=>n.id!==note.id));
      if(htmlNoteModal?.id===note.id){
        setHtmlNoteModal(null);
        setHtmlNoteHtml('');
      }
    }catch(e){
      console.error('Error deleting html note:', e);
    }
  };

  const openHtmlNote = async (note) => {
    try{
      setHtmlNoteModal(note);
      setHtmlNoteHtml('Loading…');
      const { data, error } = await supabase.storage.from('html-notes').download(note.storage_path);
      if(error) throw error;
      const text = await data.text();
      setHtmlNoteHtml(text);
    }catch(e){
      console.error('Error opening html note:', e);
      setHtmlNoteHtml('Failed to load note.');
    }
  };

  const todayStr=toDay();
  const lastNightStr=shiftDate(todayStr,-1);
  const calcSleepDurationHours=(start,end)=>{
    if(!start||!end) return 0;
    const [sh,sm]=start.split(':').map(Number);
    const [eh,em]=end.split(':').map(Number);
    if(Number.isNaN(sh)||Number.isNaN(sm)||Number.isNaN(eh)||Number.isNaN(em)) return 0;
    let startMin=sh*60+sm;
    let endMin=eh*60+em;
    if(endMin<=startMin) endMin+=24*60; // crosses midnight
    const diff=endMin-startMin;
    return diff/60;
  };
  const todayWater=useMemo(()=>waterLogs.filter(l=>l.date===todayStr).reduce((s,l)=>s+l.amount,0),[waterLogs,todayStr]);
  const waterPct=Math.min(100,Math.round((todayWater/waterGoal)*100));
  const todayDSA=dsa.filter(p=>p.date===todayStr).length;
  const todayJournal=journal.some(e=>e.date===todayStr);
  const todayWorkout=perf.some(l=>l.date===todayStr);
  const todaySleepHours=useMemo(()=>{
    const entry=sleepLogs.find(l=>l.date===lastNightStr);
    return entry?entry.durationHours:0;
  },[sleepLogs,lastNightStr]);
  const lastSlipDate=useMemo(()=>{
    const slipDates=crackerLogs.filter(l=>l.content||l.act).map(l=>l.date);
    if(!slipDates.length) return null;
    return slipDates.slice().sort().slice(-1)[0];
  },[crackerLogs]);
  const daysSinceSlip=useMemo(()=>{
    if(!lastSlipDate) return null;
    const today=new Date(todayStr+'T00:00');
    const last=new Date(lastSlipDate+'T00:00');
    return Math.max(0,Math.floor((today-last)/86400000));
  },[lastSlipDate,todayStr]);
  const dsaStreak=useMemo(()=>calcStreak([...new Set(dsa.map(p=>p.date))]),[dsa]);
  const workoutStreak=useMemo(()=>calcStreak([...new Set(perf.map(l=>l.date))]),[perf]);
  const journalStreak=useMemo(()=>calcStreak(journal.map(e=>e.date)),[journal]);
  const waterStreak=useMemo(()=>{const t=waterLogs.reduce((a,l)=>{a[l.date]=(a[l.date]||0)+l.amount;return a},{});return calcStreak(Object.entries(t).filter(([,v])=>v>=waterGoal).map(([d])=>d));},[waterLogs,waterGoal]);
  const sleepStreak=useMemo(()=>{
    const goodDates=sleepLogs.filter(l=>l.durationHours>=7.5).map(l=>l.date);
    return calcStreak([...new Set(goodDates)]);
  },[sleepLogs]);
  const streaks=[{l:'DSA',v:dsaStreak,c:C.acc},{l:'Strength',v:workoutStreak,c:C.suc},{l:'Journal',v:journalStreak,c:C.war},{l:'Water',v:waterStreak,c:C.blue},{l:'Sleep',v:sleepStreak,c:C.pink}];

  const go=(v)=>{
    setView(v);
    setMobileMenuOpen(false);
    if(['water','weight','sleep','cracker','vitamin','skin'].includes(v)) setWellnessOpen(true);
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
  const addPerf=async(dateOverride)=>{
    const targetDate = dateOverride || strengthDate || todayStr;
    const { data } = await supabase
      .from('strength_logs')
      .insert({ date: targetDate, type: perfForm.type, notes: perfForm.notes })
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
    const ex=vitaminLogs.find(l=>l.vitamin_id===vitId&&l.date===date);
    if(ex) {
      // Delete existing log
      await supabase.from('vitamin_logs').delete().eq('id', ex.id);
      setVitaminLogs(p=>p.filter(l=>l.id!==ex.id));
    } else {
      // Insert new log
      const { data } = await supabase
        .from('vitamin_logs')
        .insert({ vitamin_id: vitId, date: date })
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
    <div style={{
      width:'210px',minWidth:'210px',background:C.surf,borderRight:`1px solid ${C.bord}`,padding:'20px 10px',display:'flex',flexDirection:'column',position:isMobile?'fixed':'sticky',top:0,height:'100vh',overflowY:'auto',zIndex:1001,
      ...(isMobile?{left:mobileMenuOpen?0:'-210px',transition:'left 0.2s ease',boxShadow:mobileMenuOpen?'4px 0 20px rgba(0,0,0,0.3)':undefined}:{})
    }}>
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
        <NavItem label='Sleep' active={view==='sleep'} onClick={()=>go('sleep')} dot={sleepLogs.some(l=>l.date===lastNightStr)} sub/>
        <NavItem label='Cracker' active={view==='cracker'} onClick={()=>go('cracker')} dot={!!daysSinceSlip && daysSinceSlip>0} sub/>
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
      {label:'Sleep',done:todaySleepHours>0,value:todaySleepHours?`${todaySleepHours.toFixed(1)}h last night`:'Not logged',nav:'sleep'},
      {label:'DSA',done:todayDSA>0,value:`${todayDSA} solved today`,nav:'dsa'},
      {label:'Journal',done:todayJournal,value:todayJournal?'Written':'Not written',nav:'journal'},
      {label:'Strength',done:todayWorkout,value:todayWorkout?'Logged':'Not logged',nav:'strength'},
    ];
    const interviewsToday=interviews.filter(i=>i.date===todayStr).length;
    const offers=companies.filter(c=>c.status==='Offer').length;
    const applied=companies.filter(c=>c.status==='Applied' || c.status==='OA' || c.status==='Interview').length;
    const dsaTodayLabel=todayDSA===0?'None yet':todayDSA===1?'1 problem':'${todayDSA} problems';
    const journalTodayLabel=todayJournal?'Written':'Not yet';
    return(<div>
      <div style={{marginBottom:'32px'}}>
        <div style={{color:C.mut,fontSize:'11px',fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:'4px'}}>{new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</div>
        <h1 style={{fontSize:isMobile?'24px':'30px',fontWeight:800,letterSpacing:'-0.03em',margin:0}}>{greet}</h1>
      </div>
      <div style={{marginBottom:'24px'}}>
        <SLabel>Streaks</SLabel>
        <div style={{display:'grid',gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)',gap:'10px'}}>
          {streaks.map(s=><Card key={s.l} style={{padding:'18px',textAlign:'center'}}>
            <div style={{fontSize:'32px',fontWeight:800,color:s.c,fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>{s.v}</div>
            <div style={{color:C.mut,fontSize:'10px',fontWeight:600,letterSpacing:'0.08em',marginTop:'5px',textTransform:'uppercase'}}>{s.l}</div>
          </Card>)}
        </div>
      </div>
      <div style={{marginBottom:'24px'}}>
        <SLabel>Today</SLabel>
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(2,1fr)',gap:'10px'}}>
          {today.map(s=><Card key={s.label} onClick={()=>go(s.nav)} style={{padding:'16px',display:'flex',alignItems:'center',gap:'12px',cursor:'pointer'}}>
            <div style={{width:'36px',height:'36px',borderRadius:'8px',flexShrink:0,background:s.done?C.sucBg:C.bord,display:'flex',alignItems:'center',justifyContent:'center',color:s.done?C.suc:C.mut,fontWeight:800,fontSize:'14px'}}>{s.done?'✓':'·'}</div>
            <div>
              <div style={{fontWeight:700,fontSize:'14px',color:s.done?C.text:C.mut}}>{s.label}</div>
              <div style={{fontSize:'12px',color:s.done?C.suc:C.mut,marginTop:'1px'}}>{s.value}</div>
            </div>
          </Card>)}
        </div>
      </div>
      <div style={{marginBottom:'24px'}}>
        <SLabel>Career snapshot</SLabel>
        <div style={{display:'grid',gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(3,1fr)',gap:'10px'}}>
          <Card style={{padding:'14px'}}>
            <div style={{fontSize:'12px',color:C.mut,marginBottom:'4px'}}>Interviews today</div>
            <div style={{fontSize:'24px',fontWeight:800,fontFamily:"'JetBrains Mono',monospace"}}>{interviewsToday}</div>
          </Card>
          <Card style={{padding:'14px'}}>
            <div style={{fontSize:'12px',color:C.mut,marginBottom:'4px'}}>Active pipelines</div>
            <div style={{fontSize:'24px',fontWeight:800,fontFamily:"'JetBrains Mono',monospace"}}>{applied}</div>
          </Card>
          <Card style={{padding:'14px'}}>
            <div style={{fontSize:'12px',color:C.mut,marginBottom:'4px'}}>Offers</div>
            <div style={{fontSize:'24px',fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:offers>0?C.suc:C.text}}>{offers}</div>
          </Card>
        </div>
      </div>
      <div style={{marginBottom:'24px'}}>
        <SLabel>Study focus</SLabel>
        <Card style={{padding:'14px',display:'grid',gridTemplateColumns:isMobile?'1fr':'1.2fr 1.2fr 1fr',gap:'10px',alignItems:'center'}}>
          <div>
            <div style={{color:C.mut,fontSize:'11px',marginBottom:'4px'}}>DSA today</div>
            <div style={{fontSize:'13px',fontWeight:600}}>{dsaTodayLabel}</div>
          </div>
          <div>
            <div style={{color:C.mut,fontSize:'11px',marginBottom:'4px'}}>Journal</div>
            <div style={{fontSize:'13px',fontWeight:600}}>{journalTodayLabel}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <Btn size='sm' variant='ghost' onClick={()=>go('dsa')}>Go to prep →</Btn>
          </div>
        </Card>
      </div>
      <div style={{marginBottom:'4px'}}>
        <SLabel>Quick Add</SLabel>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
          <Btn onClick={()=>addWater(300)} variant='accent'>+ 300ml</Btn>
          <Btn onClick={()=>addWater(500)} variant='accent'>+ 500ml</Btn>
          <Btn onClick={()=>go('sleep')} variant='ghost'>+ Sleep</Btn>
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
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:'20px'}}>
        <div>
          <Card style={{marginBottom:'12px'}}>
            <SLabel>{activeDate===todayStr?'Today':fmtLong(activeDate)} — {waterLogs.filter(l=>l.date===activeDate).reduce((s,l)=>s+l.amount,0)}ml / {waterGoal}ml</SLabel>
            <div style={{background:C.bord,borderRadius:'999px',height:'8px',marginBottom:'16px',overflow:'hidden'}}>
              <div style={{background:`linear-gradient(90deg,${C.acc},${C.blue})`,height:'100%',width:`${waterPct}%`,borderRadius:'999px',transition:'width 0.4s'}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:isMobile?'repeat(3,1fr)':'1fr 1fr 1fr',gap:'8px',marginBottom:'10px'}}>
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

  const VSleep=()=>{
    const activeDate=sleepDate||lastNightStr;
    const existingForDate=sleepLogs.find(l=>l.date===activeDate);
    const formDuration=sleepForm.start_time&&sleepForm.end_time?calcSleepDurationHours(sleepForm.start_time,sleepForm.end_time):0;
    const displayDuration=existingForDate?existingForDate.durationHours:formDuration;
    const badgeText=displayDuration?`${displayDuration.toFixed(1)}h`:'Not logged';
    const badgeColor=displayDuration>=7.5? 'suc' : 'acc';
    const recent=[...sleepLogs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,14);
    return(<div>
      <PH title='Sleep' right={<Badge color={badgeColor}>{badgeText}</Badge>}/>
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1.1fr 0.9fr',gap:'20px'}}>
        <div>
          <Card style={{marginBottom:'12px'}}>
            <SLabel>Log sleep</SLabel>
            <div style={{display:'grid',gap:'10px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                <div>
                  <div style={{color:C.mut,fontSize:'11px',marginBottom:'4px'}}>Night of</div>
                  <Input type='date' value={sleepDate} onChange={v=>setSleepDate(v)} style={{fontSize:'13px'}}/>
                </div>
                <div>
                  <div style={{color:C.mut,fontSize:'11px',marginBottom:'4px'}}>Duration (auto)</div>
                  <div style={{fontWeight:700,fontSize:'20px',fontFamily:"'JetBrains Mono',monospace"}}>
                    {displayDuration?displayDuration.toFixed(2):'—'} <span style={{color:C.mut,fontSize:'12px'}}>h</span>
                  </div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
                <div>
                  <div style={{color:C.mut,fontSize:'11px',marginBottom:'4px'}}>Sleep time</div>
                  <Input type='time' value={sleepForm.start_time} onChange={v=>setSleepForm(f=>({...f,start_time:v}))}/>
                  <div style={{color:C.mut,fontSize:'11px',marginTop:'2px'}}>Usually when you go to bed (e.g. 23:30)</div>
                </div>
                <div>
                  <div style={{color:C.mut,fontSize:'11px',marginBottom:'4px'}}>Wake time</div>
                  <Input type='time' value={sleepForm.end_time} onChange={v=>setSleepForm(f=>({...f,end_time:v}))}/>
                  <div style={{color:C.mut,fontSize:'11px',marginTop:'2px'}}>If earlier than sleep time, counts as next day</div>
                </div>
              </div>
              <Btn
                onClick={async()=>{
                  if(!sleepForm.start_time||!sleepForm.end_time) return;
                  const dur=calcSleepDurationHours(sleepForm.start_time,sleepForm.end_time);
                  if(!dur) return;
                  const d=sleepDate||lastNightStr;
                  
                  // Check if entry exists for this date
                  const existing = sleepLogs.find(l=>l.date===d);
                  
                  if(existing) {
                    // Update existing entry
                    const { data } = await supabase
                      .from('sleep_logs')
                      .update({ start_time: sleepForm.start_time, end_time: sleepForm.end_time, duration_hours: dur })
                      .eq('id', existing.id)
                      .select()
                      .single();
                    if(data) {
                      setSleepLogs(p=>p.map(l=>l.id===existing.id?{...data, durationHours: data.duration_hours}:l));
                    }
                  } else {
                    // Insert new entry
                    const { data } = await supabase
                      .from('sleep_logs')
                      .insert({ date: d, start_time: sleepForm.start_time, end_time: sleepForm.end_time, duration_hours: dur })
                      .select()
                      .single();
                    if(data) {
                      setSleepLogs(p=>[...p, {...data, durationHours: data.duration_hours}]);
                    }
                  }
                }}
                disabled={!sleepForm.start_time||!sleepForm.end_time}
                full
              >
                Save sleep
              </Btn>
              {existingForDate&&<div style={{color:C.mut,fontSize:'11px',marginTop:'2px'}}>Overwrites previous entry for this night.</div>}
            </div>
          </Card>
        </div>
        <div>
          <Card>
            <SLabel>Last 14 nights</SLabel>
            {recent.length===0
              ?<div style={{color:C.mut,textAlign:'center',padding:'16px 0'}}>No sleep logged yet</div>
              :recent.map((l,i)=>(
                <div key={l.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:i<recent.length-1?`1px solid ${C.bord}`:'none'}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:'13px'}}>{fmtLong(l.date)}</div>
                    <div style={{color:C.mut,fontSize:'11px',fontFamily:"'JetBrains Mono',monospace",marginTop:'2px'}}>
                      {l.start_time} → {l.end_time}
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <span style={{fontWeight:700,fontSize:'15px',fontFamily:"'JetBrains Mono',monospace",color:l.durationHours>=7.5?C.suc:C.acc}}>
                      {l.durationHours.toFixed(1)}h
                    </span>
                    <button
                      onClick={async()=>{
                        await supabase.from('sleep_logs').delete().eq('id',l.id);
                        setSleepLogs(p=>p.filter(x=>x.id!==l.id));
                      }}
                      style={{background:'transparent',border:'none',color:C.dan,cursor:'pointer',fontSize:'13px',padding:'2px 4px'}}
                    >✕</button>
                  </div>
                </div>
              ))
            }
          </Card>
        </div>
      </div>
    </div>);
  };

  const VCracker=()=>{
    const activeDate=crackerDate||todayStr;
    const entryForDate=crackerLogs.find(l=>l.date===activeDate);
    const slipToday=entryForDate && (entryForDate.content||entryForDate.act);
    const urgeToday=entryForDate && entryForDate.urge;
    const slipDates=[...new Set(crackerLogs.filter(l=>l.content||l.act).map(l=>l.date))];
    const cleanSince=typeof daysSinceSlip==='number'?`${daysSinceSlip} day${daysSinceSlip===1?'':'s'} clean`:'No slips logged yet';
    const badgeColor=!lastSlipDate?'suc':daysSinceSlip>=7?'suc':daysSinceSlip>=1?'acc':'dan';
    const badgeText=!lastSlipDate?'Starting fresh':daysSinceSlip===0?'Slipped today':cleanSince;
    const recent=[...crackerLogs].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10);
    const toggleField=(field)=>{
      setCrackerForm(f=>({...f,[field]:!f[field]}));
    };
    const saveEntry=async()=>{
      const hasData=crackerForm.content||crackerForm.act||crackerForm.urge||crackerForm.note.trim();
      const d=activeDate;
      if(!hasData){
        // If empty and existing entry, delete it to avoid noise
        if(entryForDate){
          await supabase.from('cracker_logs').delete().eq('id', entryForDate.id);
          setCrackerLogs(p=>p.filter(l=>l.date!==d));
        }
        return;
      }
      
      if(entryForDate) {
        // Update existing entry
        const { data } = await supabase
          .from('cracker_logs')
          .update({ content: crackerForm.content, act: crackerForm.act, urge: crackerForm.urge, note: crackerForm.note.trim() })
          .eq('id', entryForDate.id)
          .select()
          .single();
        if(data) {
          setCrackerLogs(p=>p.map(l=>l.id===entryForDate.id?data:l));
        }
      } else {
        // Insert new entry
        const { data } = await supabase
          .from('cracker_logs')
          .insert({ date: d, content: crackerForm.content, act: crackerForm.act, urge: crackerForm.urge, note: crackerForm.note.trim() })
          .select()
          .single();
        if(data) {
          setCrackerLogs(p=>[...p, data]);
        }
      }
    };
    return(<div>
      <PH title='Cracker' right={<Badge color={badgeColor}>{badgeText}</Badge>}/>
      <div style={{marginBottom:'16px'}}>
        <SLabel>Clean streak</SLabel>
        <Card style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'16px',padding:'16px 18px'}}>
          <div>
            <div style={{fontSize:'12px',color:C.mut,marginBottom:'4px'}}>Days since last slip</div>
            <div style={{fontSize:'32px',fontWeight:800,fontFamily:"'JetBrains Mono',monospace",color:badgeColor==='suc'?C.suc:badgeColor==='acc'?C.acc:C.dan}}>
              {typeof daysSinceSlip==='number' ? daysSinceSlip : '—'}
            </div>
          </div>
          <div style={{textAlign:'right',maxWidth:'260px',fontSize:'12px',color:C.mut,lineHeight:1.6}}>
            When you go a full day without watching anything or acting on it, tomorrow this number increases.
            Each quiet day is a win—this card is here to make that visible.
          </div>
        </Card>
      </div>
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1.1fr 0.9fr',gap:'20px'}}>
        <div>
          <Card style={{marginBottom:'12px'}}>
            <SLabel>Today\'s check-in</SLabel>
            <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:'10px',marginBottom:'10px'}}>
              <div>
                <div style={{color:C.mut,fontSize:'11px',marginBottom:'4px'}}>Date</div>
                <Input type='date' value={crackerDate} onChange={v=>setCrackerDate(v)}/>
              </div>
              <div>
                <div style={{color:C.mut,fontSize:'11px',marginBottom:'4px'}}>Status</div>
                <div style={{fontSize:'13px',fontWeight:600}}>
                  {slipToday?'Slip logged':urgeToday?'Urge resisted':'Not logged'}
                </div>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(3,1fr)',gap:'8px',marginBottom:'10px'}}>
              <button
                type='button'
                onClick={()=>toggleField('content')}
                style={{
                  padding:'10px 8px',
                  borderRadius:'8px',
                  border:`1px solid ${crackerForm.content?C.dan:C.bord}`,
                  background:crackerForm.content?C.danBg:C.high,
                  color:crackerForm.content?C.dan:C.mut,
                  fontSize:'11px',
                  fontWeight:600,
                  cursor:'pointer'
                }}
              >
                Watched adult content
              </button>
              <button
                type='button'
                onClick={()=>toggleField('act')}
                style={{
                  padding:'10px 8px',
                  borderRadius:'8px',
                  border:`1px solid ${crackerForm.act?C.dan:C.bord}`,
                  background:crackerForm.act?C.danBg:C.high,
                  color:crackerForm.act?C.dan:C.mut,
                  fontSize:'11px',
                  fontWeight:600,
                  cursor:'pointer'
                }}
              >
                Acted on it
              </button>
              <button
                type='button'
                onClick={()=>toggleField('urge')}
                style={{
                  padding:'10px 8px',
                  borderRadius:'8px',
                  border:`1px solid ${crackerForm.urge?C.suc:C.bord}`,
                  background:crackerForm.urge?C.sucBg:C.high,
                  color:crackerForm.urge?C.suc:C.mut,
                  fontSize:'11px',
                  fontWeight:600,
                  cursor:'pointer'
                }}
              >
                Urge noticed & resisted
              </button>
            </div>
            <Textarea
              value={crackerForm.note}
              onChange={v=>setCrackerForm(f=>({...f,note:v}))}
              placeholder='Notes (what triggered it, where you were, what helped, what you can change next time)...'
              rows={4}
            />
            <div style={{display:'flex',gap:'8px',marginTop:'10px'}}>
              <Btn onClick={saveEntry} full>Save</Btn>
              {entryForDate&&(
                <Btn
                  variant='ghost'
                  onClick={async()=>{
                    await supabase.from('cracker_logs').delete().eq('id', entryForDate.id);
                    setCrackerForm({content:false,act:false,urge:false,note:''});
                    setCrackerLogs(p=>p.filter(l=>l.date!==activeDate));
                  }}
                >
                  Clear day
                </Btn>
              )}
            </div>
          </Card>
          <Card>
            <SLabel>Recent days</SLabel>
            {recent.length===0?<div style={{color:C.mut,textAlign:'center',padding:'16px 0'}}>No history yet. Start with today.</div>:recent.map(l=>{
              const label=fmt(l.date);
              const tags=[];
              if(l.content) tags.push('content');
              if(l.act) tags.push('acted');
              if(l.urge) tags.push('urge resisted');
              const isClean=!l.content && !l.act && l.urge;
              return(
                <div key={l.id} style={{padding:'8px 0',borderBottom:`1px solid ${C.bord}`,display:'flex',justifyContent:'space-between',gap:'10px'}}>
                  <div>
                    <div style={{fontSize:'13px',fontWeight:600}}>{label}</div>
                    <div style={{fontSize:'11px',color:isClean?C.suc:C.mut,marginTop:'2px'}}>
                      {tags.length?tags.join(' · '):'No data'}
                    </div>
                    {l.note&&<div style={{fontSize:'11px',color:C.mut,marginTop:'4px'}}>{l.note}</div>}
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
        <div>
          <Card style={{marginBottom:'12px'}}>
            <SLabel>Calendar</SLabel>
            <Cal
              activeDates={slipDates}
              selectedDate={selectedDate}
              onSelect={setAllDates}
              calDate={calDate}
              setCalDate={setCalDate}
              todayStr={todayStr}
              dotColor={C.dan}
            />
          </Card>
          <Card>
            <SLabel>Guidelines</SLabel>
            <div style={{color:C.mut,fontSize:'12px',lineHeight:1.7}}>
              The goal here is simple: no adult content. Use this page to honestly track exposure, actions, and when you successfully ride out an urge.
              Over time you\'ll see patterns in triggers and build longer clean stretches.
            </div>
          </Card>
        </div>
      </div>
    </div>);
  };

  const VVitamin=()=>{
    const last7=Array.from({length:7},(_,i)=>shiftDate(vitWeekAnchor, i-6));
    const isTaken=(vitId,date)=>vitaminLogs.some(l=>l.vitamin_id===vitId&&l.date===date);

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
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'2fr 1fr',gap:'8px',marginBottom:'8px'}}>
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
        <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
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
              const bg = taken ? C.accBg : 'transparent';
              const color = taken ? C.acc : C.mut;
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
        </div>
      </Card>
    </div>);
  };

  const VSkin=()=>{
    const photoDatesSorted=Object.keys(skinPhotos).sort().reverse();
    const totalPhotoCount = photoDatesSorted.reduce((s,d)=>s+(skinPhotos[d]||[]).length,0);
    const week7 = Array.from({length:7},(_,i)=>shiftDate(skinRoutineWeekAnchor, i-6));
    const isDone = (itemId, dateStr) => skinRoutineLogs.some(l=>l.item_id===itemId && l.date===dateStr);
    const itemsBy = (routine) => skinRoutineItems.filter(i=>i.routine===routine);

    // Renders saved + pending photos for a date, with save button if pending exist
    const PhotoGrid = ({ date }) => {
      const saved = skinPhotos[date] || [];
      const pending = skinPending[date] || [];
      const hasPending = pending.length > 0;
      return (
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px'}}>
            {saved.map((photo,i)=>(
              <div key={photo.id||i} style={{position:'relative',borderRadius:'8px',overflow:'hidden',border:`1px solid ${C.bord}`,aspectRatio:'1'}}>
                <img src={photo.url} alt='' style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                <button
                  onClick={()=>{ if(window.confirm('Delete this photo?')) deleteSkinPhoto(date, photo); }}
                  style={{position:'absolute',top:'4px',right:'4px',background:'rgba(0,0,0,0.6)',border:'none',borderRadius:'50%',width:'22px',height:'22px',color:'#fff',cursor:'pointer',fontSize:'12px',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}
                >✕</button>
              </div>
            ))}
            {pending.map((entry)=>(
              <div key={entry.tempId} style={{position:'relative',borderRadius:'8px',overflow:'hidden',border:`2px dashed ${C.war}`,aspectRatio:'1'}}>
                <img src={entry.localUrl} alt='' style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.75}}/>
                <button
                  onClick={()=>removePending(date, entry.tempId)}
                  style={{position:'absolute',top:'4px',right:'4px',background:'rgba(0,0,0,0.6)',border:'none',borderRadius:'50%',width:'22px',height:'22px',color:'#fff',cursor:'pointer',fontSize:'12px',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}
                >✕</button>
                <div style={{position:'absolute',bottom:'4px',left:'4px',background:'rgba(0,0,0,0.55)',borderRadius:'4px',padding:'2px 5px',fontSize:'9px',color:C.war,fontWeight:700}}>pending</div>
              </div>
            ))}
            <label style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',aspectRatio:'1',borderRadius:'8px',border:`2px dashed ${C.bord}`,cursor:'pointer',gap:'4px'}}>
              <div style={{fontSize:'22px',color:C.mut}}>+</div>
              <div style={{color:C.mut,fontSize:'10px'}}>Add</div>
              <input type='file' accept='image/*' capture='environment' multiple style={{display:'none'}} onChange={e=>handleSkin(e,date)}/>
            </label>
          </div>
          {hasPending&&<Btn onClick={()=>saveSkinPhotos(date)} full disabled={skinSaving} style={{marginTop:'10px'}}>
            {skinSaving?'Saving…':`Save ${pending.length} photo${pending.length>1?'s':''}`}
          </Btn>}
        </div>
      );
    };

    // Today's card
    const TodayCard = () => {
      const saved = skinPhotos[todayStr] || [];
      const pending = skinPending[todayStr] || [];
      const hasAny = saved.length > 0 || pending.length > 0;
      return (
        <Card>
          <SLabel>Today — {fmt(todayStr)}</SLabel>
          {hasAny
            ? <PhotoGrid date={todayStr}/>
            : <label style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',aspectRatio:'3/4',borderRadius:'10px',border:`2px dashed ${C.bord}`,cursor:'pointer',gap:'10px',marginTop:'8px'}}>
                <div style={{fontSize:'32px',color:C.mut}}>+</div>
                <div style={{color:C.mut,fontSize:'13px'}}>Add today's photo</div>
                <input type='file' accept='image/*' capture='environment' multiple style={{display:'none'}} onChange={e=>handleSkin(e,todayStr)}/>
              </label>
          }
        </Card>
      );
    };

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
          {[skinCmpA,skinCmpB].map(d=>{
            const photos = skinPhotos[d]||[];
            return (<div key={d} style={{textAlign:'center'}}>
              <div style={{color:C.mut,fontSize:'12px',fontWeight:600,marginBottom:'8px'}}>{fmtLong(d)}</div>
              {photos.length===1
                ? <img src={photos[0].url} alt='' style={{width:'100%',aspectRatio:'3/4',objectFit:'cover',borderRadius:'10px',border:`1px solid ${C.bord}`}}/>
                : <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'4px'}}>
                    {photos.map((p,i)=><img key={i} src={p.url} alt='' style={{width:'100%',aspectRatio:'1',objectFit:'cover',borderRadius:'6px',border:`1px solid ${C.bord}`}}/>)}
                  </div>
              }
            </div>);
          })}
        </div>:<div style={{color:C.mut,textAlign:'center',padding:'40px'}}>Select two dates above to compare</div>}
      </Card>):(
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:'20px'}}>
          <div>
            <TodayCard/>

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
            {selectedDate&&(skinPhotos[selectedDate]||skinPending[selectedDate])&&selectedDate!==todayStr&&<Card style={{marginTop:'10px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                <SLabel>{fmtLong(selectedDate)}</SLabel>
              </div>
              <PhotoGrid date={selectedDate}/>
            </Card>}
            {photoDatesSorted.length>0&&<Card style={{marginTop:'10px'}}>
              <SLabel>All photos ({totalPhotoCount})</SLabel>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px'}}>
                {photoDatesSorted.slice(0,12).map(d=>{
                  const photos=skinPhotos[d]||[];
                  const first=photos[0];
                  if(!first) return null;
                  return (<div key={d} onClick={()=>setSelectedDate(d)} style={{cursor:'pointer',position:'relative',borderRadius:'6px',overflow:'hidden',border:`2px solid ${selectedDate===d?C.pink:C.bord}`}}>
                    <img src={first.url} alt='' style={{width:'100%',aspectRatio:'1',objectFit:'cover'}}/>
                    <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.75))',padding:'4px 4px 3px',display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
                      <span style={{color:'#fff',fontSize:'9px',fontWeight:600}}>{fmt(d)}</span>
                      {photos.length>1&&<span style={{color:'rgba(255,255,255,0.8)',fontSize:'9px',fontWeight:600}}>+{photos.length-1}</span>}
                    </div>
                  </div>);
                })}
              </div>
            </Card>}
          </div>
        </div>
      )}
    </div>);
  };

  const VStrength=()=>{
    const activeDates=[...new Set(perf.map(l=>l.date))];
    const activeDate = strengthDate || todayStr;
    const activeLogs=perf.filter(l=>l.date===activeDate);
    const selLogs=perf.filter(l=>l.date===selectedDate);
    return(<div>
      <PH title='Strength' right={<Badge color='suc'>{workoutStreak}d streak</Badge>}/>
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:'20px'}}>
        <div>
          <Card style={{marginBottom:'12px'}}>
            <SLabel>Log workout</SLabel>
            <div style={{display:'grid',gap:'8px'}}>
              <Input type='date' value={strengthDate} onChange={v=>setStrengthDate(v)} />
              <Input value={perfForm.type} onChange={v=>setPerfForm(f=>({...f,type:v}))} placeholder='Workout type (e.g. Pull day, Run, Yoga)'/>
              <Textarea value={perfForm.notes} onChange={v=>setPerfForm(f=>({...f,notes:v}))} placeholder='Sets, reps, rounds, duration...' rows={4}/>
              <Btn onClick={()=>addPerf()} full disabled={!perfForm.type.trim()}>Log Workout</Btn>
            </div>
          </Card>
          <Card>
            <SLabel>Logs for {activeDate===todayStr?'today':fmtLong(activeDate)}</SLabel>
            {activeLogs.length===0
              ? <div style={{color:C.mut,textAlign:'center',padding:'10px 0'}}>No logs</div>
              : activeLogs.map((l,i)=><div key={l.id} style={{padding:'10px 0',borderBottom:i<activeLogs.length-1?`1px solid ${C.bord}`:'none'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'10px'}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,color:C.suc,fontSize:'13px',marginBottom:'4px'}}>{l.type}</div>
                      {l.notes&&<div style={{color:C.mut,fontSize:'12px',lineHeight:1.6,whiteSpace:'pre-wrap'}}>{l.notes}</div>}
                    </div>
                    <div style={{display:'flex',gap:'6px',flexShrink:0}}>
                      <button
                        onClick={async()=>{
                          const nextType = window.prompt('Workout type', l.type || '');
                          if(nextType===null) return;
                          const nextNotes = window.prompt('Notes', l.notes || '');
                          if(nextNotes===null) return;
                          const { data } = await supabase
                            .from('strength_logs')
                            .update({ type: nextType, notes: nextNotes })
                            .eq('id', l.id)
                            .select()
                            .single();
                          if(data) setPerf(p=>p.map(x=>x.id===l.id?data:x));
                        }}
                        style={{background:'transparent',border:`1px solid ${C.bord}`,borderRadius:'6px',color:C.mut,cursor:'pointer',fontSize:'11px',padding:'2px 6px'}}
                      >
                        Edit
                      </button>
                      <button
                        onClick={async()=>{
                          if(!window.confirm('Delete this workout log?')) return;
                          await supabase.from('strength_logs').delete().eq('id', l.id);
                          setPerf(p=>p.filter(x=>x.id!==l.id));
                        }}
                        style={{background:'transparent',border:'none',color:C.dan,cursor:'pointer',fontSize:'13px'}}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>)
            }
          </Card>
        </div>
        <div>
          <Cal activeDates={activeDates} selectedDate={selectedDate} onSelect={setAllDates} calDate={calDate} setCalDate={setCalDate} todayStr={todayStr} dotColor={C.suc}/>
          {selLogs.length>0&&selectedDate!==todayStr&&<Card style={{marginTop:'10px'}}>
            <SLabel>{fmtLong(selectedDate)}</SLabel>
            {selLogs.map((l,i)=><div key={l.id} style={{padding:'10px 0',borderBottom:i<selLogs.length-1?`1px solid ${C.bord}`:'none'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'10px'}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,color:C.suc,fontSize:'13px',marginBottom:'4px'}}>{l.type}</div>
                  {l.notes&&<div style={{color:C.mut,fontSize:'12px',lineHeight:1.6,whiteSpace:'pre-wrap'}}>{l.notes}</div>}
                </div>
                <div style={{display:'flex',gap:'6px',flexShrink:0}}>
                  <button
                    onClick={async()=>{
                      const nextType = window.prompt('Workout type', l.type || '');
                      if(nextType===null) return;
                      const nextNotes = window.prompt('Notes', l.notes || '');
                      if(nextNotes===null) return;
                      const { data } = await supabase
                        .from('strength_logs')
                        .update({ type: nextType, notes: nextNotes })
                        .eq('id', l.id)
                        .select()
                        .single();
                      if(data) setPerf(p=>p.map(x=>x.id===l.id?data:x));
                    }}
                    style={{background:'transparent',border:`1px solid ${C.bord}`,borderRadius:'6px',color:C.mut,cursor:'pointer',fontSize:'11px',padding:'2px 6px'}}
                  >
                    Edit
                  </button>
                  <button
                    onClick={async()=>{
                      if(!window.confirm('Delete this workout log?')) return;
                      await supabase.from('strength_logs').delete().eq('id', l.id);
                      setPerf(p=>p.filter(x=>x.id!==l.id));
                    }}
                    style={{background:'transparent',border:'none',color:C.dan,cursor:'pointer',fontSize:'13px'}}
                  >
                    ✕
                  </button>
                </div>
              </div>
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
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:'20px'}}>
        <div>
          <Card>
            <SLabel>Log problem</SLabel>
            <div style={{display:'grid',gap:'8px'}}>
              <Input value={dsaForm.name} onChange={v=>setDsaForm(f=>({...f,name:v}))} placeholder='Problem name *'/>
              <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:'8px'}}>
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
            <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr 1fr',gap:'8px'}}>
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

  const VFundamentals=()=>{
    const section='fundamentals';
    const notes = htmlNotes.filter(n=>n.section===section).slice().sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')));
    const isActiveSection = htmlNoteForm.section===section;
    const fileLabel = isActiveSection && htmlNoteForm.file ? htmlNoteForm.file.name : 'Choose HTML file';
    return (
      <div>
        <PH title='Fundamentals' />

        <Card style={{marginBottom:'14px'}}>
          <SLabel>Add note</SLabel>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'minmax(0,2fr) minmax(0,1.4fr)',gap:'10px',alignItems:'stretch'}}>
            <Input
              value={isActiveSection ? htmlNoteForm.name : ''}
              onChange={v=>setHtmlNoteForm({ section, name:v, file:isActiveSection?htmlNoteForm.file:null })}
              placeholder='Note name (e.g. TCP Notes)'
            />
            <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
              <label
                style={{
                  display:'inline-flex',
                  alignItems:'center',
                  justifyContent:'space-between',
                  gap:'8px',
                  padding:'8px 12px',
                  borderRadius:'8px',
                  border:`1px dashed ${C.bord}`,
                  background:C.high,
                  color:C.mut,
                  fontSize:'12px',
                  cursor:'pointer'
                }}
              >
                <span style={{whiteSpace:'nowrap'}}>Upload HTML</span>
                <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:isActiveSection && htmlNoteForm.file?C.text:C.mut}}>
                  {fileLabel}
                </span>
                <input
                  type='file'
                  accept='.html,.htm,text/html'
                  style={{display:'none'}}
                  onChange={(e)=>{
                    const file = e.target.files?.[0] || null;
                    setHtmlNoteForm({ section, name:isActiveSection?htmlNoteForm.name:'', file });
                  }}
                />
              </label>
              <span style={{color:C.mut,fontSize:'11px'}}>Your own HTML notes will render inside the app.</span>
            </div>
          </div>
          <div style={{marginTop:'10px',display:'flex',gap:'8px',justifyContent:'flex-start'}}>
            <Btn
              onClick={addHtmlNote}
              disabled={!(isActiveSection && htmlNoteForm.name.trim() && htmlNoteForm.file)}
            >
              Upload
            </Btn>
            <Btn onClick={()=>setHtmlNoteForm({ section, name:'', file:null })} variant='ghost'>Clear</Btn>
          </div>
        </Card>

        <div style={{display:'grid',gap:'10px'}}>
          {notes.map(n=>(
            <Card key={n.id} style={{padding:'14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'10px'}}>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:'14px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.name}</div>
                  <div style={{color:C.mut,fontSize:'11px',marginTop:'2px',fontFamily:"'JetBrains Mono',monospace"}}>{n.storage_path}</div>
                </div>
                <div style={{display:'flex',gap:'8px',flexShrink:0}}>
                  <Btn size='sm' variant='ghost' onClick={()=>openHtmlNote(n)}>Open</Btn>
                  <Btn size='sm' variant='danger' onClick={()=>{ if(window.confirm('Delete this note?')) deleteHtmlNote(n); }}>Delete</Btn>
                </div>
              </div>
            </Card>
          ))}
          {notes.length===0 && <div style={{color:C.mut,textAlign:'center',padding:'50px'}}>No notes yet. Upload an HTML file above.</div>}
        </div>

        {htmlNoteModal && (
          <Modal title={htmlNoteModal.name} onClose={()=>{ setHtmlNoteModal(null); setHtmlNoteHtml(''); }}>
            <div style={{border:`1px solid ${C.bord}`,borderRadius:'10px',overflow:'hidden',background:C.bg}}>
              <iframe
                title={htmlNoteModal.name}
                sandbox="allow-same-origin"
                srcDoc={htmlNoteHtml || ''}
                style={{width:'100%',height:'70vh',border:'none',background:'#fff'}}
              />
            </div>
          </Modal>
        )}
      </div>
    );
  };

  const VMisc=()=>{
    const section='misc';
    const notes = htmlNotes.filter(n=>n.section===section).slice().sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||'')));
    const isActiveSection = htmlNoteForm.section===section;
    const fileLabel = isActiveSection && htmlNoteForm.file ? htmlNoteForm.file.name : 'Choose HTML file';
    return (
      <div>
        <PH title='Miscellaneous' />

        <Card style={{marginBottom:'14px'}}>
          <SLabel>Add note</SLabel>
          <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'minmax(0,2fr) minmax(0,1.4fr)',gap:'10px',alignItems:'stretch'}}>
            <Input
              value={isActiveSection ? htmlNoteForm.name : ''}
              onChange={v=>setHtmlNoteForm({ section, name:v, file:isActiveSection?htmlNoteForm.file:null })}
              placeholder='Note name (e.g. Git Internals)'
            />
            <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
              <label
                style={{
                  display:'inline-flex',
                  alignItems:'center',
                  justifyContent:'space-between',
                  gap:'8px',
                  padding:'8px 12px',
                  borderRadius:'8px',
                  border:`1px dashed ${C.bord}`,
                  background:C.high,
                  color:C.mut,
                  fontSize:'12px',
                  cursor:'pointer'
                }}
              >
                <span style={{whiteSpace:'nowrap'}}>Upload HTML</span>
                <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:isActiveSection && htmlNoteForm.file?C.text:C.mut}}>
                  {fileLabel}
                </span>
                <input
                  type='file'
                  accept='.html,.htm,text/html'
                  style={{display:'none'}}
                  onChange={(e)=>{
                    const file = e.target.files?.[0] || null;
                    setHtmlNoteForm({ section, name:isActiveSection?htmlNoteForm.name:'', file });
                  }}
                />
              </label>
              <span style={{color:C.mut,fontSize:'11px'}}>Your own HTML notes will render inside the app.</span>
            </div>
          </div>
          <div style={{marginTop:'10px',display:'flex',gap:'8px',justifyContent:'flex-start'}}>
            <Btn
              onClick={addHtmlNote}
              disabled={!(isActiveSection && htmlNoteForm.name.trim() && htmlNoteForm.file)}
            >
              Upload
            </Btn>
            <Btn onClick={()=>setHtmlNoteForm({ section, name:'', file:null })} variant='ghost'>Clear</Btn>
          </div>
        </Card>

        <div style={{display:'grid',gap:'10px'}}>
          {notes.map(n=>(
            <Card key={n.id} style={{padding:'14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'10px'}}>
                <div style={{minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:'14px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{n.name}</div>
                  <div style={{color:C.mut,fontSize:'11px',marginTop:'2px',fontFamily:"'JetBrains Mono',monospace"}}>{n.storage_path}</div>
                </div>
                <div style={{display:'flex',gap:'8px',flexShrink:0}}>
                  <Btn size='sm' variant='ghost' onClick={()=>openHtmlNote(n)}>Open</Btn>
                  <Btn size='sm' variant='danger' onClick={()=>{ if(window.confirm('Delete this note?')) deleteHtmlNote(n); }}>Delete</Btn>
                </div>
              </div>
            </Card>
          ))}
          {notes.length===0 && <div style={{color:C.mut,textAlign:'center',padding:'50px'}}>No notes yet. Upload an HTML file above.</div>}
        </div>

        {htmlNoteModal && (
          <Modal title={htmlNoteModal.name} onClose={()=>{ setHtmlNoteModal(null); setHtmlNoteHtml(''); }}>
            <div style={{border:`1px solid ${C.bord}`,borderRadius:'10px',overflow:'hidden',background:C.bg}}>
              <iframe
                title={htmlNoteModal.name}
                sandbox="allow-same-origin"
                srcDoc={htmlNoteHtml || ''}
                style={{width:'100%',height:'70vh',border:'none',background:'#fff'}}
              />
            </div>
          </Modal>
        )}
      </div>
    );
  };

  const VSystemDesign=()=>(
    <div>
      <PH title='System Design' right={<Btn size='sm' onClick={()=>{setSdModal('new');setSdForm({topic:'',notes:'',refs:''});}}>+ Add Topic</Btn>}/>
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'repeat(2,1fr)',gap:'12px'}}>
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
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr 1fr',gap:'8px',marginBottom:'8px'}}>
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
      <div style={{display:'grid',gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)',gap:'10px',marginBottom:'20px'}}>
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
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr 1fr',gap:'8px',marginBottom:'8px'}}>
          <Input value={coForm.name} onChange={v=>setCoForm(f=>({...f,name:v}))} placeholder='Company *'/>
          <Input value={coForm.ctc} onChange={v=>setCoForm(f=>({...f,ctc:v}))} placeholder='Target CTC'/>
          <Input value={coForm.role} onChange={v=>setCoForm(f=>({...f,role:v}))} placeholder='Role'/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 2fr',gap:'8px',marginBottom:'8px'}}>
          <Sel value={coForm.status} onChange={v=>setCoForm(f=>({...f,status:v}))} options={statOpts}/>
          <Input value={coForm.note} onChange={v=>setCoForm(f=>({...f,note:v}))} placeholder='Note'/>
        </div>
        <div style={{display:'flex',gap:'8px'}}><Btn onClick={addCompany} disabled={!coForm.name.trim()}>Save</Btn><Btn onClick={()=>setShowCoForm(false)} variant='ghost'>Cancel</Btn></div>
      </Card>}
      <div style={{display:'grid',gridTemplateColumns:isMobile?'repeat(2,1fr)':'repeat(4,1fr)',gap:'10px',marginBottom:'16px'}}>
        {['Applied','OA','Interview','Offer'].map(s=><Card key={s} style={{padding:'14px',textAlign:'center'}}>
          <div style={{fontSize:'26px',fontWeight:800,color:s==='Offer'?C.suc:C.text,fontFamily:"'JetBrains Mono',monospace"}}>{companies.filter(c=>c.status===s).length}</div>
          <div style={{color:C.mut,fontSize:'11px',marginTop:'3px'}}>{s}</div>
        </Card>)}
      </div>
      <Card style={{padding:'0',overflow:'hidden'}}>
        <div style={{overflowX:'auto',WebkitOverflowScrolling:'touch'}}>
        <div style={{minWidth:isMobile?'560px':undefined}}>
        <div style={{padding:'12px 14px',background:C.high,borderBottom:`1px solid ${C.bord}`,display:'grid',gridTemplateColumns:'2fr 1fr 1fr 2fr 160px',gap:'12px',alignItems:'center'}}>
          <div style={{color:C.mut,fontSize:'11px',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase'}}>Company</div>
          <div style={{color:C.mut,fontSize:'11px',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase'}}>CTC</div>
          <div style={{color:C.mut,fontSize:'11px',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase'}}>Status</div>
          <div style={{color:C.mut,fontSize:'11px',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase'}}>Note</div>
          <div style={{color:C.mut,fontSize:'11px',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',textAlign:'right'}}>Actions</div>
        </div>
        <div style={{display:'grid'}}>
          {companies.map((c,i)=>(
            <div key={c.id} style={{padding:'12px 14px',display:'grid',gridTemplateColumns:'2fr 1fr 1fr 2fr 160px',gap:'12px',alignItems:'center',borderBottom:i<companies.length-1?`1px solid ${C.bord}`:'none'}}>
              <div style={{minWidth:0}}>
                <div style={{fontWeight:700,fontSize:'13px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
                <div style={{color:C.mut,fontSize:'11px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.role}</div>
              </div>
              <div style={{fontWeight:700,color:C.acc,fontSize:'13px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.ctc}</div>
              <Badge color={statCol[c.status]}>{c.status}</Badge>
              <div style={{color:C.mut,fontSize:'12px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}} title={c.note||''}>{c.note}</div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:'6px'}}>
                <button
                  onClick={async()=>{
                    const nextStatus = window.prompt(`Status (${statOpts.join(', ')})`, c.status || '');
                    if(nextStatus===null) return;
                    const statusVal = statOpts.includes(nextStatus) ? nextStatus : c.status;
                    const nextRole = window.prompt('Role', c.role || '');
                    if(nextRole===null) return;
                    const nextCtc = window.prompt('CTC', c.ctc || '');
                    if(nextCtc===null) return;
                    const nextNote = window.prompt('Note', c.note || '');
                    if(nextNote===null) return;
                    const { data } = await supabase
                      .from('companies')
                      .update({ status: statusVal, role: nextRole, ctc: nextCtc, note: nextNote })
                      .eq('id', c.id)
                      .select()
                      .single();
                    if(data) setCompanies(p=>p.map(x=>x.id===c.id?data:x));
                  }}
                  style={{background:'transparent',border:`1px solid ${C.bord}`,borderRadius:'6px',color:C.mut,fontSize:'11px',padding:'3px 8px',cursor:'pointer'}}
                >
                  Edit
                </button>
                <button
                  onClick={async()=>{
                    if(!window.confirm('Delete this company?')) return;
                    await supabase.from('companies').delete().eq('id', c.id);
                    setCompanies(p=>p.filter(x=>x.id!==c.id));
                  }}
                  style={{background:'transparent',border:`1px solid ${C.bord}`,borderRadius:'6px',color:C.dan,fontSize:'11px',padding:'3px 8px',cursor:'pointer'}}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {companies.length===0&&<div style={{color:C.mut,textAlign:'center',padding:'40px'}}>No companies yet</div>}
        </div>
        </div>
        </div>
      </Card>
    </div>);
  };

  const VWeight=()=>{
    const sorted=[...weight].sort((a,b)=>b.date.localeCompare(a.date));
    const latest=sorted[0],prev=sorted[1];
    const diff=latest&&prev?(latest.weight-prev.weight).toFixed(1):null;
    return(<div>
      <PH title='Weight'/>
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:'20px'}}>
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
    // active date is whatever the user last picked (defaults to today)
    const activeDate = journalDate || todayStr;
    const activeEntry = journal.find(e=>e.date===activeDate);
    const isToday = activeDate===todayStr;
    const showForm = jEditing || !activeEntry;

    const startEdit = (entry) => {
      setJForm({title: entry?.title||'', content: entry?.content||''});
      setJEditing(true);
    };
    const cancelEdit = () => { setJEditing(false); setJForm({title:'',content:''}); };
    const deleteEntry = async (entry) => {
      if(!window.confirm('Delete this entry?')) return;
      await supabase.from('journal_entries').delete().eq('id', entry.id);
      setJournal(p=>p.filter(e=>e.id!==entry.id));
      setJEditing(false);
      setJForm({title:'',content:''});
    };

    return(<div>
      <PH title='Journal' right={<Badge color='war'>{journalStreak}d streak</Badge>}/>
      <div style={{display:'grid',gridTemplateColumns:isMobile?'1fr':'1fr 1fr',gap:'20px'}}>
        <div>
          <Card>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
              <SLabel style={{marginBottom:0}}>
                {isToday ? `Today — ${fmtLong(todayStr)}` : fmtLong(activeDate)}
              </SLabel>
              {!showForm&&activeEntry&&(
                <div style={{display:'flex',gap:'6px'}}>
                  <Btn onClick={()=>startEdit(activeEntry)} variant='ghost' size='sm'>Edit</Btn>
                  <Btn onClick={()=>deleteEntry(activeEntry)} variant='ghost' size='sm'>Delete</Btn>
                </div>
              )}
            </div>
            {showForm?(
              <div style={{display:'grid',gap:'8px'}}>
                <Input value={jForm.title} onChange={v=>setJForm(f=>({...f,title:v}))} placeholder='Title (optional)'/>
                <Textarea value={jForm.content} onChange={v=>setJForm(f=>({...f,content:v}))} placeholder={'What happened today?\nHow do you feel?\nWhat are you working towards?'} rows={8}/>
                <div style={{display:'flex',gap:'8px'}}>
                  <Btn onClick={()=>saveJournal(activeDate)} disabled={!jForm.content.trim()} full>Save</Btn>
                  {activeEntry&&<Btn onClick={cancelEdit} variant='ghost'>Cancel</Btn>}
                </div>
              </div>
            ):(
              <div>
                {activeEntry.title&&<div style={{fontWeight:700,fontSize:'15px',marginBottom:'10px'}}>{activeEntry.title}</div>}
                <div style={{color:C.mut,fontSize:'13px',lineHeight:1.8,whiteSpace:'pre-wrap'}}>{activeEntry.content}</div>
              </div>
            )}
          </Card>
        </div>
        <div>
          <Cal
            activeDates={journal.map(e=>e.date)}
            selectedDate={activeDate}
            onSelect={(d)=>{ setAllDates(d); setJournalDate(d); setJEditing(false); setJForm({title:'',content:''}); }}
            calDate={calDate}
            setCalDate={setCalDate}
            todayStr={todayStr}
            dotColor={C.war}
          />
          {journal.length>0&&<Card style={{marginTop:'10px'}}>
            <SLabel>Recent entries</SLabel>
            <div style={{display:'grid',gap:'2px'}}>
              {journal.slice(0,8).map(e=>(
                <button
                  key={e.id}
                  onClick={()=>{ setJournalDate(e.date); setAllDates(e.date); setJEditing(false); setJForm({title:'',content:''}); }}
                  style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 10px',borderRadius:'8px',border:'none',background:activeDate===e.date?C.acc:'transparent',color:activeDate===e.date?'#fff':C.text,cursor:'pointer',textAlign:'left',gap:'10px'}}
                >
                  <span style={{fontSize:'12px',fontWeight:600,color:activeDate===e.date?'#fff':C.mut,flexShrink:0}}>{fmt(e.date)}</span>
                  <span style={{fontSize:'12px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>
                    {e.title || e.content.split('\n')[0].slice(0,50)}
                  </span>
                </button>
              ))}
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
    sleep: VSleep,
    cracker: VCracker,
    vitamin: VVitamin,
    skin: VSkin,
    strength: VStrength,
    dsa: VDSA,
    fundamentals: VFundamentals,
    systemdesign: VSystemDesign,
    misc: VMisc,
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
    {isMobile&&mobileMenuOpen&&(
      <div role="button" tabIndex={0} onClick={()=>setMobileMenuOpen(false)} onKeyDown={(e)=>e.key==='Escape'&&setMobileMenuOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:1000}} aria-label="Close menu" />
    )}
    <div style={{fontFamily:"'Plus Jakarta Sans',-apple-system,sans-serif",background:C.bg,color:C.text,minHeight:'100vh',display:'flex',fontSize:'14px'}}>
      {Sidebar()}
      <div style={{flex:1,width:isMobile?'100%':undefined,padding:isMobile?'16px':'36px 44px',overflowY:'auto',maxHeight:'100vh'}}>
        {isMobile&&(
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
            <button type="button" onClick={()=>setMobileMenuOpen(true)} style={{background:C.surf,border:`1px solid ${C.bord}`,borderRadius:'8px',color:C.text,padding:'10px 14px',fontSize:'16px',cursor:'pointer',fontFamily:'inherit'}} aria-label="Open menu">☰ Menu</button>
            <span style={{fontWeight:800,fontSize:'16px'}}>LifeOS</span>
          </div>
        )}
        {ActiveView()}
      </div>
    </div>
  </>);
}