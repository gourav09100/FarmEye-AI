export type Analysis = { id:string; cropName:string; issue:string; confidence:number; severity:string; nextSteps:string[]; createdAt:string; preliminary:boolean; image?:string };
export type CropAnalysisRequest = { cropName:string; image:File };
export interface CropAnalysisProvider { analyze(request:CropAnalysisRequest):Promise<Analysis> }
export type Crop = { id:string; name:string; variety:string; plantedAt:string; area:string; status:string; image?:string; latestAnalysis?:Analysis };
export type Expense = { id:string; category:string; description:string; amount:number; date:string };
export type ChatMessage = { id:string; role:'user'|'assistant'; text:string; createdAt:string };
export type AssistantLanguage = 'auto'|'en'|'hi'|'or';
export type AssistantRequest = { question:string; language:AssistantLanguage };
export interface FarmingAssistantProvider { respond(request:AssistantRequest):Promise<string> }
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

type AssistantTopic='rice-fertilizer'|'fertilizer'|'tomato-yellowing'|'water-saving'|'watering'|'pests'|'leaf-symptoms'|'general';
type ReplyLanguage=Exclude<AssistantLanguage,'auto'>;

const replyText:Record<ReplyLanguage,Record<AssistantTopic,string>>={
 en:{
  'rice-fertilizer':'For rice, fertilizer needs depend on the soil, variety, and crop stage. Use a soil test or your local agriculture officer/KVK recommendation; do not guess a urea or DAP dose. Follow locally advised timing and split applications. This is general guidance, not a guaranteed recommendation.',
  fertilizer:'Fertilizer needs depend on the crop, soil, and growth stage. Check a soil test and recent applications, then follow local agriculture or KVK guidance instead of guessing a dose. Too much fertilizer can harm crops and water.',
  'tomato-yellowing':'Yellow tomato leaves can be linked to watering or drainage stress, nutrient imbalance, pests, or disease. Check whether older or newer leaves are affected, inspect leaf undersides, and feel the soil before watering. Avoid adding fertilizer or spraying until you have clearer evidence; ask a local crop expert if it spreads.',
  'water-saving':'To use less water, check soil moisture before irrigating, fix leaks, and water near the root zone. Drip irrigation, mulch, and leveling can help where suitable. Adjust for soil, crop stage, and recent rain; local conditions vary.',
  watering:'Check soil about 5–7 cm below the surface before watering. If it is still moist, wait; when watering is needed, target the root zone and use the cooler part of the day. Soil type, crop stage, and recent rain all matter, so avoid relying on a fixed schedule alone.',
  pests:'First identify the pest and how widely it is present. Inspect several plants and the undersides of leaves, and keep a clear photo or sample. Do not spray until the pest is identified; follow the product label and ask a local agriculture officer about suitable control.',
  'leaf-symptoms':'Yellow leaves can have several causes, including too much or too little water, poor drainage, nutrient imbalance, pests, or disease. Note whether older or newer leaves are affected, inspect leaf undersides, and check soil moisture. Avoid adding fertilizer or spraying until the cause is clearer; seek local advice if it spreads.',
  general:'I can offer general starting points. Note the crop and growth stage, how many plants are affected, and what changed recently (weather, irrigation, or inputs). For fertilizer or treatment decisions, check local conditions with an agriculture officer or KVK. This demo is not guaranteed advice.'
 },
 hi:{
  'rice-fertilizer':'धान में खाद की जरूरत मिट्टी, किस्म और फसल की अवस्था पर निर्भर करती है। मिट्टी की जांच या स्थानीय कृषि अधिकारी/KVK की सलाह लें; यूरिया या DAP की मात्रा अनुमान से न डालें। खाद का समय और मात्रा स्थानीय सलाह के अनुसार रखें। यह सामान्य जानकारी है, पक्की सिफारिश नहीं।',
  fertilizer:'खाद की जरूरत फसल, मिट्टी और बढ़वार की अवस्था पर निर्भर करती है। मिट्टी की जांच और पहले डाली गई खाद की जानकारी देखें, फिर कृषि अधिकारी या KVK की सलाह लें। बिना सलाह मात्रा का अनुमान न लगाएं।',
  'tomato-yellowing':'टमाटर की पीली पत्तियों के कारण पानी या निकास की समस्या, पोषक तत्वों का असंतुलन, कीट या रोग हो सकते हैं। देखें कि पुरानी या नई पत्तियां प्रभावित हैं, पत्तियों के नीचे कीट जांचें और पानी देने से पहले मिट्टी देखें। कारण स्पष्ट होने से पहले खाद या दवा न डालें; समस्या फैलने पर स्थानीय विशेषज्ञ से पूछें।',
  'water-saving':'पानी बचाने के लिए सिंचाई से पहले मिट्टी की नमी जांचें, रिसाव ठीक करें और जड़ों के पास पानी दें। जहां उपयुक्त हो, ड्रिप सिंचाई, मल्च और खेत को समतल करना मदद कर सकता है। मिट्टी, फसल की अवस्था और हाल की बारिश के अनुसार तरीका बदलें।',
  watering:'पानी देने से पहले मिट्टी में लगभग 5–7 सेमी नीचे नमी जांचें। मिट्टी नम हो तो रुकें; जरूरत होने पर जड़ों के पास और ठंडे समय में पानी दें। मिट्टी, फसल की अवस्था और हाल की बारिश देखें—केवल तय समय-सारणी पर निर्भर न रहें।',
  pests:'पहले कीट की पहचान करें और देखें कि कितने पौधों पर है। कई पौधों तथा पत्तियों के नीचे जांच करें और साफ फोटो या नमूना रखें। कीट की पहचान से पहले छिड़काव न करें; दवा के लेबल का पालन करें और स्थानीय कृषि अधिकारी से सही उपाय पूछें।',
  'leaf-symptoms':'पत्तियों का पीला होना अधिक या कम पानी, जल निकास की समस्या, पोषक तत्वों का असंतुलन, कीट या रोग से हो सकता है। देखें कि पुरानी या नई पत्तियां प्रभावित हैं, पत्तियों के नीचे कीट जांचें और मिट्टी की नमी देखें। कारण स्पष्ट होने से पहले खाद या दवा न डालें; समस्या फैलने पर स्थानीय सलाह लें।',
  general:'मैं सामान्य शुरुआती जानकारी दे सकता हूँ। फसल और उसकी अवस्था, कितने पौधे प्रभावित हैं, और हाल में मौसम, सिंचाई या खाद में क्या बदलाव हुआ—यह लिखें। खाद या उपचार के फैसले से पहले कृषि अधिकारी या KVK से स्थानीय सलाह लें। यह डेमो है, पक्की सलाह नहीं।'
 },
 or:{
  'rice-fertilizer':'ଧାନ ପାଇଁ ସାରର ଆବଶ୍ୟକତା ମାଟି, କିସମ ଓ ଫସଲର ଅବସ୍ଥା ଉପରେ ନିର୍ଭର କରେ। ମାଟି ପରୀକ୍ଷା କରନ୍ତୁ କିମ୍ବା ସ୍ଥାନୀୟ କୃଷି ଅଧିକାରୀ/KVKଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ; ଅନୁମାନରେ ୟୁରିଆ କିମ୍ବା DAP ଦିଅନ୍ତୁ ନାହିଁ। ଏହା ସାଧାରଣ ସୂଚନା, ନିଶ୍ଚିତ ସୁପାରିଶ ନୁହେଁ।',
  fertilizer:'ସାରର ଆବଶ୍ୟକତା ଫସଲ, ମାଟି ଓ ବୃଦ୍ଧିର ଅବସ୍ଥା ଉପରେ ନିର୍ଭର କରେ। ମାଟି ପରୀକ୍ଷା ଓ ପୂର୍ବରୁ ଦିଆଯାଇଥିବା ସାରର ତଥ୍ୟ ଦେଖନ୍ତୁ; ଅନୁମାନରେ ମାତ୍ରା ନିର୍ଦ୍ଧାରଣ ନକରି ସ୍ଥାନୀୟ କୃଷି ଅଧିକାରୀ/KVKଙ୍କ ପରାମର୍ଶ ନିଅନ୍ତୁ।',
  'tomato-yellowing':'ଟମାଟୋ ପତ୍ର ହଳଦିଆ ହେବାର କାରଣ ପାଣି କିମ୍ବା ନିଷ୍କାସନ ସମସ୍ୟା, ପୋଷକ ଅସନ୍ତୁଳନ, ପୋକ କିମ୍ବା ରୋଗ ହୋଇପାରେ। ପୁରୁଣା କି ନୂଆ ପତ୍ର ପ୍ରଭାବିତ ହୋଇଛି ଦେଖନ୍ତୁ, ପତ୍ର ତଳେ ପୋକ ଖୋଜନ୍ତୁ ଏବଂ ପାଣି ଦେବା ପୂର୍ବରୁ ମାଟି ଯାଞ୍ଚ କରନ୍ତୁ। କାରଣ ନଜାଣି ସାର କିମ୍ବା ଔଷଧ ଦିଅନ୍ତୁ ନାହିଁ; ସମସ୍ୟା ବଢ଼ିଲେ ସ୍ଥାନୀୟ ବିଶେଷଜ୍ଞଙ୍କୁ ପଚାରନ୍ତୁ।',
  'water-saving':'ପାଣି ବଞ୍ଚାଇବାକୁ ସେଚନ ପୂର୍ବରୁ ମାଟିର ଆର୍ଦ୍ରତା ଯାଞ୍ଚ କରନ୍ତୁ, ପାଇପର ଲିକ୍ ଠିକ୍ କରନ୍ତୁ ଏବଂ ମୂଳ ପାଖରେ ପାଣି ଦିଅନ୍ତୁ। ଉପଯୁକ୍ତ ହେଲେ ଡ୍ରିପ୍ ସେଚନ, ମଲ୍ଚ ଓ ଜମି ସମତଳ କରିବା ସାହାଯ୍ୟ କରିପାରେ। ମାଟି, ଫସଲର ଅବସ୍ଥା ଓ ବର୍ଷା ଅନୁସାରେ ବଦଳ କରନ୍ତୁ।',
  watering:'ପାଣି ଦେବା ପୂର୍ବରୁ ମାଟିର ୫–୭ ସେମି ତଳେ ଆର୍ଦ୍ରତା ଯାଞ୍ଚ କରନ୍ତୁ। ମାଟି ଓଦା ଥିଲେ ଅପେକ୍ଷା କରନ୍ତୁ; ଆବଶ୍ୟକ ହେଲେ ମୂଳ ପାଖରେ ଓ ଦିନର ଥଣ୍ଡା ସମୟରେ ପାଣି ଦିଅନ୍ତୁ। ମାଟି, ଫସଲର ଅବସ୍ଥା ଓ ସମ୍ପ୍ରତି ବର୍ଷାକୁ ଧ୍ୟାନ ଦିଅନ୍ତୁ।',
  pests:'ପ୍ରଥମେ ପୋକକୁ ଚିହ୍ନଟ କରନ୍ତୁ ଏବଂ କେତେ ଗଛରେ ଅଛି ଦେଖନ୍ତୁ। ଅନେକ ଗଛ ଓ ପତ୍ରର ତଳ ଭାଗ ଯାଞ୍ଚ କରି ସ୍ପଷ୍ଟ ଫଟୋ କିମ୍ବା ନମୁନା ରଖନ୍ତୁ। ପୋକ ଚିହ୍ନଟ ପୂର୍ବରୁ ଔଷଧ ଛିଞ୍ଚନ୍ତୁ ନାହିଁ; ଲେବଲ୍ ମାନନ୍ତୁ ଓ ସ୍ଥାନୀୟ କୃଷି ଅଧିକାରୀଙ୍କୁ ପଚାରନ୍ତୁ।',
  'leaf-symptoms':'ପତ୍ର ହଳଦିଆ ହେବାର କାରଣ ଅଧିକ କିମ୍ବା କମ୍ ପାଣି, ନିଷ୍କାସନ ସମସ୍ୟା, ପୋଷକ ଅସନ୍ତୁଳନ, ପୋକ କିମ୍ବା ରୋଗ ହୋଇପାରେ। ପୁରୁଣା କି ନୂଆ ପତ୍ର ପ୍ରଭାବିତ ଦେଖନ୍ତୁ, ପତ୍ର ତଳେ ପୋକ ଯାଞ୍ଚ କରନ୍ତୁ ଏବଂ ମାଟିର ଆର୍ଦ୍ରତା ଦେଖନ୍ତୁ। କାରଣ ସ୍ପଷ୍ଟ ନହେବା ପର୍ଯ୍ୟନ୍ତ ସାର କିମ୍ବା ଔଷଧ ଦିଅନ୍ତୁ ନାହିଁ; ସମସ୍ୟା ବଢ଼ିଲେ ସ୍ଥାନୀୟ ପରାମର୍ଶ ନିଅନ୍ତୁ।',
  general:'ମୁଁ ସାଧାରଣ ସୂଚନା ଦେଇପାରିବି। ଫସଲ ଓ ଏହାର ଅବସ୍ଥା, କେତେ ଗଛ ପ୍ରଭାବିତ, ଏବଂ ପାଣିପାଗ, ସେଚନ କିମ୍ବା ସାରରେ କଣ ବଦଳିଛି ଲେଖନ୍ତୁ। ସାର କିମ୍ବା ଚିକିତ୍ସା ନିଷ୍ପତ୍ତି ପୂର୍ବରୁ କୃଷି ଅଧିକାରୀ/KVKଙ୍କୁ ପଚାରନ୍ତୁ। ଏହା ଡେମୋ ସୂଚନା, ନିଶ୍ଚିତ ପରାମର୍ଶ ନୁହେଁ।'
 }
};

const hasAny=(text:string,terms:string[])=>terms.some(term=>text.includes(term));

function detectReplyLanguage(question:string,preferred:AssistantLanguage):ReplyLanguage{
 if(preferred!=='auto')return preferred;
 if(/[\u0B00-\u0B7F]/.test(question))return 'or';
 if(/[\u0900-\u097F]/.test(question))return 'hi';
 if(/\b(kemiti|kebe|kipari|mu|mora|chasa|dhan)\b/i.test(question))return 'or';
 if(/\b(kya|kyun|kaise|kab|mera|meri|fasal|khet|khad|sinchai|paani)\b/i.test(question))return 'hi';
 return 'en';
}

function classifyAssistantTopic(question:string):AssistantTopic{
 const q=question.toLowerCase();
 const fertilizer=hasAny(q,['fertiliz','manure','nutrient','urea','dap','খাদ','उर्वरक','खाद','ସାର','ଖତ']);
 const rice=hasAny(q,['rice','paddy','धान','चावल','ଧାନ','ଚାଉଳ']);
 if(fertilizer&&rice)return 'rice-fertilizer';
 if(fertilizer)return 'fertilizer';
 const tomato=hasAny(q,['tomato','ଟମାଟୋ','टमाटर']);
 const yellowing=hasAny(q,['yellow','ହଳଦିଆ','ହଳଦୀଆ','पीला','पीली','पीले','पील']);
 const leaf=hasAny(q,['leaf','leaves','पत्त','ପତ୍ର']);
 if(tomato&&yellowing)return 'tomato-yellowing';
 if(yellowing&&leaf)return 'leaf-symptoms';
 const water=hasAny(q,['water','irrigat','पानी','सिंचाई','ଜଳ','ପାଣି','ସେଚନ']);
 const saving=hasAny(q,['reduc','less','save','conserv','usage','saving','कम','बच','ସଞ୍ଚୟ','କମ୍','ବଞ୍ଚା']);
 if(water&&saving)return 'water-saving';
 if(water)return 'watering';
 if(hasAny(q,['pest','insect','thrip','aphid','कीट','कीड़ा','कीड़े','ପୋକ','କୀଟ']))return 'pests';
 if(leaf||hasAny(q,['spot','blight','rust','fung']))return 'leaf-symptoms';
 return 'general';
}

// Replace this demo implementation with a server-backed provider when an AI API is configured.
// Keep API credentials and any real model calls on the server; this provider makes no network requests.
export const demoFarmingAssistantProvider:FarmingAssistantProvider={
 async respond({question,language}){
  if(!question.trim())throw new Error('A farming question is required.');
  await new Promise<void>(resolve=>setTimeout(resolve,550));
  const replyLanguage=detectReplyLanguage(question,language);
  const topic=classifyAssistantTopic(question);
  return replyText[replyLanguage][topic];
 }
};

export const demoAdapters={
 cropAnalysis:demoCropAnalysisProvider,
 assistant:demoFarmingAssistantProvider
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