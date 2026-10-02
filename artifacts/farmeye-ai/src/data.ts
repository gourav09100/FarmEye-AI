export type Analysis = { id:string; cropName:string; issue:string; confidence:number; severity:string; nextSteps:string[]; createdAt:string; preliminary:boolean; image?:string };
export type Crop = { id:string; name:string; variety:string; plantedAt:string; area:string; status:string; image?:string; latestAnalysis?:Analysis };
export type Expense = { id:string; category:string; description:string; amount:number; date:string };
export type ChatMessage = { id:string; role:'user'|'assistant'; text:string; createdAt:string };
export type FarmData = { farmer:{name:string;farm:string;location:string}; crops:Crop[]; expenses:Expense[]; reports:Analysis[]; chat:ChatMessage[] };
const KEY='farmeye-demo-v1';
const localDateString=(offset:number)=>{
 const date=new Date();
 date.setDate(date.getDate()+offset);
 return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
};
const sampleReport:Analysis={
 id:'report-sample-1',
 cropName:'Tomato',
 issue:'Possible leaf spot pattern',
 confidence:68,
 severity:'Monitor',
 nextSteps:['Check lower leaves for changes over the next few days.','Note whether spots spread after rain or overhead watering.','Ask a local agriculture expert before choosing a treatment.'],
 createdAt:`${localDateString(-8)}T09:30:00.000Z`,
 preliminary:true
};
export const seed:FarmData={
 farmer:{name:'Arjun Patil',farm:'Sahyadri Fields',location:'Nashik, Maharashtra'},
 crops:[
  {id:'crop-1',name:'Tomato',variety:'Abhinav hybrid',plantedAt:localDateString(-70),area:'1.2 acres',status:'Flowering',latestAnalysis:sampleReport},
  {id:'crop-2',name:'Onion',variety:'N-53',plantedAt:localDateString(-105),area:'0.8 acres',status:'Bulb formation'},
  {id:'crop-3',name:'Grapes',variety:'Thompson Seedless',plantedAt:'2025-08-25',area:'1.5 acres',status:'Fruit set'}
 ],
 expenses:[
  {id:'ex-1',category:'Seeds & seedlings',description:'Tomato seedlings — north plot',amount:2450,date:localDateString(-1)},
  {id:'ex-2',category:'Fertilizer',description:'Neem cake and compost',amount:1680,date:localDateString(-1)},
  {id:'ex-3',category:'Labour',description:'Drip line maintenance',amount:1200,date:localDateString(0)},
  {id:'ex-4',category:'Irrigation',description:'Pump electricity',amount:860,date:localDateString(0)}
 ],
 reports:[sampleReport],
 chat:[]
};
export function readFarm():FarmData {
 try {
  const raw=localStorage.getItem(KEY);
  if(!raw)return seed;
  const parsed=JSON.parse(raw) as Partial<FarmData>;
  const saved={...seed,...parsed,farmer:seed.farmer};
  return {...saved,reports:saved.reports.length?saved.reports:seed.reports};
 } catch { return seed; }
}
export function writeFarm(data:FarmData):boolean {
 try {
  const durableData:FarmData={
   ...data,
   crops:data.crops.map(crop=>({
    ...crop,
    image:undefined,
    latestAnalysis:crop.latestAnalysis?{...crop.latestAnalysis,image:undefined}:undefined
   })),
   reports:data.reports.map(({image,...report})=>report)
  };
  localStorage.setItem(KEY,JSON.stringify(durableData));
  return true;
 } catch { return false; }
}
export const demoAdapters={
 analyze(cropName:string):Analysis {
  return {id:crypto.randomUUID(),cropName,issue:'Possible early blight pattern',confidence:72,severity:'Watch closely',nextSteps:['Check lower leaves for dark spots with yellow edges.','Avoid overhead watering; keep foliage dry where possible.','Take another photo in 2–3 days and compare changes.'],createdAt:new Date().toISOString(),preliminary:true};
 },
 answer(question:string) {
  const q=question.toLowerCase();
  if(q.includes('water')||q.includes('irrigat'))return 'For a practical check, feel the soil 5–7 cm below the surface before irrigating. Water at the root zone in the cooler part of the day, and adjust for soil type and recent rain. This is general demo guidance; local conditions matter.';
  if(q.includes('yellow')||q.includes('leaf'))return 'Yellow leaves can have several causes, including watering, nutrient availability, or pests. Check whether older or newer leaves are affected, inspect both leaf sides, and note recent irrigation or fertilizer changes before choosing a treatment.';
  if(q.includes('pest')||q.includes('insect'))return 'First identify the insect and check how much of the crop is affected. Inspect a few plants across the plot, preserve a sample or clear photo, and ask your local agriculture officer before applying any pesticide.';
  return 'I can help think through this. Start by noting the crop stage, how many plants are affected, and what changed recently (weather, irrigation, or inputs). For a treatment decision, confirm with your local agriculture officer or KVK. This is a demo response, not connected AI advice.';
 }
};
const outlook=[
 {icon:'sun',high:31,low:19,rain:35,label:'Warm, chance of showers'},
 {icon:'cloud',high:29,low:18,rain:55,label:'Clouds building'},
 {icon:'rain',high:27,low:18,rain:72,label:'Scattered showers'},
 {icon:'sun',high:30,low:17,rain:10,label:'Clear intervals'},
 {icon:'cloud',high:32,low:19,rain:20,label:'Partly cloudy'}
];
export const sampleWeather={
 high:31,low:19,rainChance:35,humidity:61,wind:12,
 days:outlook.map((day,index)=>{
  const date=new Date();
  date.setDate(date.getDate()+index);
  return {...day,day:index===0?'Today':new Intl.DateTimeFormat('en-IN',{weekday:'short'}).format(date)};
 })
};