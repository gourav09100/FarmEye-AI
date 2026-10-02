export type Analysis = { id:string; cropName:string; issue:string; confidence:number; severity:string; nextSteps:string[]; createdAt:string; preliminary:boolean; image?:string };
export type CropAnalysisRequest = { cropName:string; image:File };
export interface CropAnalysisProvider { analyze(request:CropAnalysisRequest):Promise<Analysis> }
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
 severity:'Medium',
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
const cropDemoResults:Record<string,Omit<Analysis,'id'|'cropName'|'createdAt'|'preliminary'|'image'>>={
 tomato:{
  issue:'Possible early blight pattern',
  confidence:72,
  severity:'Medium',
  nextSteps:['Check lower leaves for dark spots with yellow edges and watch whether they spread.','Keep foliage dry where practical and note recent rain or overhead watering.','Compare a new photo in a few days; confirm with a local crop specialist before treatment.']
 },
 rice:{
  issue:'Possible rice blast-like leaf lesions',
  confidence:69,
  severity:'Medium',
  nextSteps:['Look for elongated lesions with pale centres on several plants; other causes can look similar.','Take a clear close-up and note the variety, crop stage, and recent field conditions.','Ask a local agriculture expert before applying fungicide or changing water management.']
 },
 potato:{
  issue:'Possible early blight-like leaf spots',
  confidence:74,
  severity:'Medium',
  nextSteps:['Inspect older lower leaves for spots with ring-like markings and check whether nearby plants are affected.','Note recent rain and watering, and avoid handling wet foliage where practical.','Confirm the cause with a local agriculture expert before choosing a treatment.']
 },
 wheat:{
  issue:'Possible rust-like leaf symptoms',
  confidence:67,
  severity:'Medium',
  nextSteps:['Check both sides of several leaves for orange-brown raised pustules and note whether they are spreading.','Record the crop stage and take clear photos of affected and healthy leaves for comparison.','Consult a local agriculture expert before using a fungicide or changing field practices.']
 },
 other:{
  issue:'Possible leaf stress or spot pattern',
  confidence:52,
  severity:'Low',
  nextSteps:['Compare affected leaves with healthy plants and note how many plants show similar changes.','Check both leaf sides and record recent weather, watering, and farm inputs.','Treat this demo result as a prompt for closer inspection, not a diagnosis.']
 }
};

// Implement this interface with a server-backed provider when a real vision API is configured.
// Keep provider credentials on the server; the demo provider never sends the selected image anywhere.
export const demoCropAnalysisProvider:CropAnalysisProvider={
 async analyze({cropName}){
  await new Promise<void>(resolve=>setTimeout(resolve,850));
  const normalized=cropName.trim().toLowerCase();
  const key=normalized.includes('rice')||normalized.includes('paddy')?'rice':normalized.includes('tomato')?'tomato':normalized.includes('potato')?'potato':normalized.includes('wheat')?'wheat':'other';
  const result=cropDemoResults[key];
  return {...result,id:crypto.randomUUID(),cropName:cropName.trim()||'Unspecified crop',createdAt:new Date().toISOString(),preliminary:true,nextSteps:[...result.nextSteps]};
 }
};

export const demoAdapters={
 cropAnalysis:demoCropAnalysisProvider,
 answer(question:string) {
  const q=question.toLowerCase();
   if(q.includes('thrips'))return 'To check for thrips, tap a flower or young leaf over white paper and look for tiny, slender insects. Silvery streaks and small dark specks can be clues, but other problems can look similar. Inspect several plants and ask your local agriculture officer before choosing a treatment.';
  if(q.includes('spot')||q.includes('blight')||q.includes('fung'))return 'Leaf spots can have several causes, so a photo alone is not enough to confirm a disease. Check whether spots are spreading, inspect nearby plants, and note recent rain and watering. Keep foliage dry where practical and confirm with a local crop specialist before treatment.';
  if(q.includes('yellow')||q.includes('leaf'))return 'Yellow leaves can have several causes. Note whether the older or newer leaves are affected, check both sides for pests, and feel the soil before watering. Recent rain, drainage, and fertilizer changes are useful clues; avoid adding nutrients until the cause is clearer.';
  if(q.includes('after rain')||q.includes('after it rains')||q.includes('after a shower'))return 'After rain, do not irrigate by schedule alone. Check soil moisture about 5–7 cm below the surface and look for standing water or blocked drainage. Resume watering only when the crop and soil need it; field conditions vary across a plot.';
   if(q.includes('water')||q.includes('irrigat'))return 'For a practical check, feel the soil 5–7 cm below the surface before irrigating. Water near the root zone in the cooler part of the day, and adjust for soil type, crop stage, and recent rain. This is general demo guidance; local conditions matter.';
   if(q.includes('fertiliz')||q.includes('nutrient'))return 'Before changing fertilizer, note the crop stage and which leaves are affected, then review recent applications and irrigation. A soil test or local extension recommendation is safer than guessing a dose; needs depend on the field and crop stage.';
   if(q.includes('pest')||q.includes('insect'))return 'First identify the insect and check how much of the crop is affected. Inspect several plants, including the underside of leaves, and preserve a clear photo or sample. Ask your local agriculture officer before applying any pesticide.';
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