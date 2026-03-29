"use strict";(()=>{var e={};e.id=652,e.ids=[652],e.modules={5166:e=>{e.exports=require("mammoth")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},4193:e=>{e.exports=require("pdf-parse")},2609:e=>{e.exports=require("encoding")},7147:e=>{e.exports=require("fs")},3685:e=>{e.exports=require("http")},5687:e=>{e.exports=require("https")},7561:e=>{e.exports=require("node:fs")},4492:e=>{e.exports=require("node:stream")},2477:e=>{e.exports=require("node:stream/web")},1017:e=>{e.exports=require("path")},4577:e=>{e.exports=require("punycode")},2781:e=>{e.exports=require("stream")},7310:e=>{e.exports=require("url")},3837:e=>{e.exports=require("util")},1267:e=>{e.exports=require("worker_threads")},9796:e=>{e.exports=require("zlib")},2823:(e,t,r)=>{r.r(t),r.d(t,{headerHooks:()=>x,originalPathname:()=>d,requestAsyncStorage:()=>p,routeModule:()=>c,serverHooks:()=>m,staticGenerationAsyncStorage:()=>u,staticGenerationBailout:()=>g});var o={};r.r(o),r.d(o,{POST:()=>POST,maxDuration:()=>i}),r(8976);var a=r(884),s=r(6132),n=r(5798),l=r(6134);async function extractTextFromFile(e,t,o){let a=o.toLowerCase();try{if("application/pdf"===t||a.endsWith(".pdf")){let t=(await Promise.resolve().then(r.t.bind(r,4193,23))).default,o=await t(e);return o.text}if("application/vnd.openxmlformats-officedocument.wordprocessingml.document"===t||a.endsWith(".docx")){let t=await Promise.resolve().then(r.t.bind(r,5166,23)),o=await t.extractRawText({buffer:e});return o.value}if("text/plain"===t||a.endsWith(".txt"))return e.toString("utf-8");return""}catch(e){return console.error(`Error extracting text from ${o}:`,e),""}}let i=300;async function POST(e){try{let t=await e.formData(),r=t.getAll("files"),o=t.get("role"),a=t.get("comments")||"";if(!r||0===r.length)return n.Z.json({error:"Файлы не выбраны"},{status:400});let s=new l.ZP({apiKey:process.env.ANTHROPIC_API_KEY}),i=[],c=[];for(let e of r){let t=Buffer.from(await e.arrayBuffer());if(e.type.startsWith("image/")||e.name.match(/\.(jpg|jpeg|png)$/i)){let r=e.type.startsWith("image/")?e.type:"image/jpeg";c.push({type:"image",source:{type:"base64",media_type:r,data:t.toString("base64")}})}else{let r=await extractTextFromFile(t,e.type,e.name);r.trim()&&i.push(`[Файл: ${e.name}]
${r}`)}}let p="customer"===o?"ЗАКАЗЧИКА":"ПОДРЯДЧИКА",u="customer"===o?"заказчика":"подрядчика",m=i.join("\n\n---\n\n"),x=a.trim()?`
ДОПОЛНИТЕЛЬНЫЕ ИНСТРУКЦИИ ОТ ПОЛЬЗОВАТЕЛЯ:
${a.trim()}
`:"",g=m?`ТЕКСТ ДОГОВОРА:

${m}`:"Договор предоставлен в виде изображений выше. Извлеки и проанализируй весь текст.",d=`Ты профессиональный российский юрист с опытом более 15 лет в договорном праве. Анализируй договор максимально детально и критично, защищая интересы указанной стороны.
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

${g}`,f=await s.messages.create({model:"claude-sonnet-4-6",max_tokens:1e4,messages:[{role:"user",content:[...c,{type:"text",text:d}]}]}),h=f.content.filter(e=>"text"===e.type).map(e=>e.text).join("\n");if(console.log("[STEP 1] Analysis stop_reason:",f.stop_reason),console.log("[STEP 1] Analysis text length:",h.length),console.log("[STEP 1] Analysis text preview:",h.slice(0,200)),!h.trim())throw Error("Анализ вернул пустой текст. Проверьте API ключ и содержимое файлов.");let y=`Ты профессиональный российский юрист. Тебе предоставлены:
1) Текст договора
2) Готовый юридический анализ этого договора с позиции ${u}
${x}
На основе ПРОБЛЕМНЫХ ПУНКТОВ, выявленных в анализе, составь Протокол разногласий.
Каждый проблемный пункт из анализа должен стать отдельной строкой протокола с конкретной альтернативной формулировкой.

ВАЖНО: верни результат строго в виде JSON-объекта. Без пояснений до или после. Без markdown-блоков.
Структура:
{
  "contractTitle": "полное название договора из текста",
  "overallRisk": "high",
  "protocolItems": [
    {
      "number": 1,
      "clauseRef": "п. 3.1",
      "clauseTitle": "Краткое название пункта",
      "originalText": "Дословный текст спорного пункта из договора",
      "proposedText": "Новая редакция этого пункта — юридически грамотная, защищающая интересы ${u}, готовая к подписанию без дополнительных правок",
      "justification": "Почему оригинальный пункт ущемляет интересы ${u} и чем обоснована предлагаемая редакция",
      "legalRef": "Ст. 421 ГК РФ"
    }
  ]
}

Требования к protocolItems:
- Включи ВСЕ проблемные пункты из анализа — каждый должен быть в протоколе
- Минимум 8 пунктов, в идеале 10–14
- overallRisk — итоговая оценка риска: "high", "medium" или "low"
- proposedText обязателен и не должен быть пустым — это готовая юридическая формулировка
- Первый символ ответа должен быть {

=== АНАЛИЗ ДОГОВОРА ===
${h}

=== ${g} ===`;console.log("[STEP 2] Protocol prompt length:",y.length),console.log("[STEP 2] Analysis text in prompt (first 100):",y.includes(h.slice(0,50))?"YES ✓":"NO ✗");let P=await s.messages.create({model:"claude-sonnet-4-6",max_tokens:1e4,messages:[{role:"user",content:[...c,{type:"text",text:y}]}]}),w=P.content.filter(e=>"text"===e.type).map(e=>e.text).join("\n")||"{}";console.log("[STEP 2] Protocol stop_reason:",P.stop_reason),console.log("[STEP 2] Protocol raw length:",w.length),console.log("[STEP 2] Protocol raw preview:",w.slice(0,500));let T=function(e){let t=e.replace(/^```(?:json)?\s*/im,"").replace(/```\s*$/m,"").trim(),r=t.indexOf("{"),o=t.lastIndexOf("}");if(-1===r||-1===o)return{};try{return JSON.parse(t.slice(r,o+1))}catch{try{return JSON.parse(t.slice(r,o+1).replace(/[\x00-\x1F\x7F]/g," "))}catch(t){return console.error("Protocol JSON parse failed:",t,"\nRaw:",e.slice(0,400)),{}}}}(w);return console.log("[STEP 2] Protocol contractTitle:",T.contractTitle),console.log("[STEP 2] Protocol overallRisk:",T.overallRisk),console.log("[STEP 2] Protocol items count:",(T.protocolItems||[]).length),0===(T.protocolItems||[]).length&&console.warn("[STEP 2] ⚠️ protocolItems is empty! Raw response was:",w.slice(0,800)),n.Z.json({contractTitle:T.contractTitle||r[0]?.name||"Договор",overallRisk:T.overallRisk||"medium",role:o,analysisDate:new Date().toLocaleDateString("ru-RU",{year:"numeric",month:"long",day:"numeric"}),analysisText:h,protocolItems:T.protocolItems||[]})}catch(t){console.error("Analysis error:",t);let e=t instanceof Error?t.message:"Неизвестная ошибка";return n.Z.json({error:`Ошибка при анализе договора: ${e}`},{status:500})}}let c=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/analyze/route",pathname:"/api/analyze",filename:"route",bundlePath:"app/api/analyze/route"},resolvedPagePath:"/Users/egorkolobov/game/contract-analyzer/app/api/analyze/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:p,staticGenerationAsyncStorage:u,serverHooks:m,headerHooks:x,staticGenerationBailout:g}=c,d="/api/analyze/route"}};var t=require("../../../webpack-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),r=t.X(0,[955,134],()=>__webpack_exec__(2823));module.exports=r})();