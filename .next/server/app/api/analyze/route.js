"use strict";(()=>{var e={};e.id=652,e.ids=[652],e.modules={5166:e=>{e.exports=require("mammoth")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},4193:e=>{e.exports=require("pdf-parse")},2609:e=>{e.exports=require("encoding")},7147:e=>{e.exports=require("fs")},3685:e=>{e.exports=require("http")},5687:e=>{e.exports=require("https")},7561:e=>{e.exports=require("node:fs")},4492:e=>{e.exports=require("node:stream")},2477:e=>{e.exports=require("node:stream/web")},1017:e=>{e.exports=require("path")},4577:e=>{e.exports=require("punycode")},2781:e=>{e.exports=require("stream")},7310:e=>{e.exports=require("url")},3837:e=>{e.exports=require("util")},1267:e=>{e.exports=require("worker_threads")},9796:e=>{e.exports=require("zlib")},2823:(e,t,r)=>{r.r(t),r.d(t,{headerHooks:()=>x,originalPathname:()=>d,requestAsyncStorage:()=>p,routeModule:()=>c,serverHooks:()=>m,staticGenerationAsyncStorage:()=>u,staticGenerationBailout:()=>g});var o={};r.r(o),r.d(o,{POST:()=>POST,maxDuration:()=>i}),r(8976);var s=r(884),a=r(6132),n=r(5798),l=r(6134);async function extractTextFromFile(e,t,o){let s=o.toLowerCase();try{if("application/pdf"===t||s.endsWith(".pdf")){let t=(await Promise.resolve().then(r.t.bind(r,4193,23))).default,o=await t(e);return o.text}if("application/vnd.openxmlformats-officedocument.wordprocessingml.document"===t||s.endsWith(".docx")){let t=await Promise.resolve().then(r.t.bind(r,5166,23)),o=await t.extractRawText({buffer:e});return o.value}if("text/plain"===t||s.endsWith(".txt"))return e.toString("utf-8");return""}catch(e){return console.error(`Error extracting text from ${o}:`,e),""}}let i=300;function extractText(e){return e.content.filter(e=>"text"===e.type).map(e=>e.text).join("\n")}async function POST(e){try{let t=await e.formData(),r=t.getAll("files"),o=t.get("role"),s=t.get("comments")||"";if(!r||0===r.length)return n.Z.json({error:"Файлы не выбраны"},{status:400});let a=new l.ZP({apiKey:process.env.ANTHROPIC_API_KEY}),i=[],c=[];for(let e of r){let t=Buffer.from(await e.arrayBuffer());if(e.type.startsWith("image/")||e.name.match(/\.(jpg|jpeg|png)$/i)){let r=e.type.startsWith("image/")?e.type:"image/jpeg";c.push({type:"image",source:{type:"base64",media_type:r,data:t.toString("base64")}})}else{let r=await extractTextFromFile(t,e.type,e.name);r.trim()&&i.push(`[Файл: ${e.name}]
${r}`)}}let p="customer"===o?"ЗАКАЗЧИКА":"ПОДРЯДЧИКА",u="customer"===o?"заказчика":"подрядчика",m=i.join("\n\n---\n\n"),x=s.trim()?`
ДОПОЛНИТЕЛЬНЫЕ ИНСТРУКЦИИ ОТ ПОЛЬЗОВАТЕЛЯ:
${s.trim()}
`:"",g=m?`ТЕКСТ ДОГОВОРА:

${m}`:"Договор предоставлен в виде изображений выше.",d=`Ты профессиональный российский юрист с опытом более 15 лет в договорном праве. Анализируй договор максимально детально и критично, защищая интересы указанной стороны.
${x}
В начале анализа укажи: "Я представляю интересы: ${p}"

ОБЯЗАТЕЛЬНО ПРОВЕРЬ И ОПИШИ:

1. РИСКИ ДЛЯ МОЕЙ СТОРОНЫ
   - Финансовые риски
   - Операционные риски
   - Правовые риски
   - Скрытые риски и ловушки

2. ОТВЕТСТВЕННОСТЬ СТОРОН
   - Размер и условия штрафов и неустоек
   - Основания для расторжения
   - Форс-мажор — насколько широко трактуется
   - Ограничение ответственности — справедливо ли

3. МЕСТО СУДЕБНОГО РАЗБИРАТЕЛЬСТВА
   - Где рассматриваются споры
   - Выгодно ли это моей стороне
   - Альтернативные варианты разрешения споров

4. СООТВЕТСТВИЕ ГК РФ
   - Прямые противоречия нормам ГК РФ
   - Условия которые суд может признать недействительными
   - Ссылки на конкретные статьи ГК РФ

5. ОБЯЗАННОСТИ СТОРОН
   - Полный перечень моих обязанностей
   - Полный перечень обязанностей другой стороны
   - Несбалансированность обязанностей

6. ПРОБЛЕМНЫЕ ПУНКТЫ
   - Размытые формулировки которые трактуются против меня
   - Односторонние условия
   - Чего не хватает в договоре

7. ОБЩАЯ ОЦЕНКА
   - Насколько договор выгоден моей стороне (1-10)
   - Топ-3 самых критичных проблемы
   - Рекомендация: подписывать / подписывать с правками / не подписывать

${g}`;console.log("[API] ЗАПРОС 1: анализ договора"),console.log("[API] Analysis prompt length:",d.length);let f=await a.messages.create({model:"claude-sonnet-4-6",max_tokens:8e3,messages:[{role:"user",content:[...c,{type:"text",text:d}]}]}),P=extractText(f);if(console.log("[API] Analysis stop_reason:",f.stop_reason),console.log("[API] Analysis result length:",P.length),console.log("[API] Analysis result first 200:",P.slice(0,200)),!P.trim())throw Error("Анализ вернул пустой текст. Проверьте API ключ и содержимое файлов.");let h=`На основе этого анализа договора составь протокол разногласий с позиции ${u}.

Верни ТОЛЬКО JSON-объект (без markdown, без пояснений, первый символ — {):
{
  "contractTitle": "название договора из анализа",
  "overallRisk": "high|medium|low",
  "protocolItems": [
    {
      "number": 1,
      "clauseRef": "п. 3.1",
      "clauseTitle": "Название пункта",
      "originalText": "Текущая редакция пункта",
      "proposedText": "Предлагаемая редакция — готовая юридическая формулировка",
      "justification": "Обоснование правки со ссылкой на норму",
      "legalRef": "Ст. 421 ГК РФ"
    }
  ]
}

Для каждого проблемного пункта из анализа — отдельная строка в protocolItems.
Минимум 8 пунктов.
proposedText не должен быть пустым.

Вот анализ:
${P}`;console.log("[API] ЗАПРОС 2: протокол разногласий"),console.log("[API] Protocol prompt length:",h.length),console.log("[API] Protocol prompt first 200:",h.slice(0,200));let y=await a.messages.create({model:"claude-sonnet-4-6",max_tokens:8e3,messages:[{role:"user",content:[{type:"text",text:h}]}]}),A=extractText(y);console.log("[API] Protocol stop_reason:",y.stop_reason),console.log("[API] Protocol response length:",A.length),A.trim()?console.log("[API] Protocol response first 200:",A.slice(0,200)):console.log("[API] PROTOCOL RESPONSE IS EMPTY");let I=function(e){let t=e.replace(/^```(?:json)?\s*/im,"").replace(/```\s*$/m,"").trim(),r=t.indexOf("{"),o=t.lastIndexOf("}");if(-1===r||-1===o)return{};try{return JSON.parse(t.slice(r,o+1))}catch{try{return JSON.parse(t.slice(r,o+1).replace(/[\x00-\x1F\x7F]/g," "))}catch(t){return console.error("[API] Protocol JSON parse failed:",t,"\nRaw:",e.slice(0,400)),{}}}}(A);return console.log("[API] Protocol items count:",(I.protocolItems||[]).length),0===(I.protocolItems||[]).length&&console.warn("[API] ⚠️ protocolItems пустой. Raw:",A.slice(0,600)),n.Z.json({contractTitle:I.contractTitle||r[0]?.name||"Договор",overallRisk:I.overallRisk||"medium",role:o,analysisDate:new Date().toLocaleDateString("ru-RU",{year:"numeric",month:"long",day:"numeric"}),analysisText:P,protocolItems:I.protocolItems||[]})}catch(t){console.error("[API] Error:",t);let e=t instanceof Error?t.message:"Неизвестная ошибка";return n.Z.json({error:`Ошибка при анализе договора: ${e}`},{status:500})}}let c=new s.AppRouteRouteModule({definition:{kind:a.x.APP_ROUTE,page:"/api/analyze/route",pathname:"/api/analyze",filename:"route",bundlePath:"app/api/analyze/route"},resolvedPagePath:"/Users/egorkolobov/game/contract-analyzer/app/api/analyze/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:p,staticGenerationAsyncStorage:u,serverHooks:m,headerHooks:x,staticGenerationBailout:g}=c,d="/api/analyze/route"}};var t=require("../../../webpack-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),r=t.X(0,[955,134],()=>__webpack_exec__(2823));module.exports=r})();