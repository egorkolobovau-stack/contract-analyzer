"use strict";(()=>{var e={};e.id=652,e.ids=[652],e.modules={5166:e=>{e.exports=require("mammoth")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},4193:e=>{e.exports=require("pdf-parse")},2609:e=>{e.exports=require("encoding")},7147:e=>{e.exports=require("fs")},3685:e=>{e.exports=require("http")},5687:e=>{e.exports=require("https")},7561:e=>{e.exports=require("node:fs")},4492:e=>{e.exports=require("node:stream")},2477:e=>{e.exports=require("node:stream/web")},1017:e=>{e.exports=require("path")},4577:e=>{e.exports=require("punycode")},2781:e=>{e.exports=require("stream")},7310:e=>{e.exports=require("url")},3837:e=>{e.exports=require("util")},1267:e=>{e.exports=require("worker_threads")},9796:e=>{e.exports=require("zlib")},2823:(e,t,r)=>{r.r(t),r.d(t,{headerHooks:()=>x,originalPathname:()=>f,requestAsyncStorage:()=>u,routeModule:()=>p,serverHooks:()=>m,staticGenerationAsyncStorage:()=>c,staticGenerationBailout:()=>d});var a={};r.r(a),r.d(a,{POST:()=>POST,maxDuration:()=>l}),r(8976);var o=r(884),s=r(6132),n=r(5798),i=r(6134);async function extractTextFromFile(e,t,a){let o=a.toLowerCase();try{if("application/pdf"===t||o.endsWith(".pdf")){let t=(await Promise.resolve().then(r.t.bind(r,4193,23))).default,a=await t(e);return a.text}if("application/vnd.openxmlformats-officedocument.wordprocessingml.document"===t||o.endsWith(".docx")){let t=await Promise.resolve().then(r.t.bind(r,5166,23)),a=await t.extractRawText({buffer:e});return a.value}if("text/plain"===t||o.endsWith(".txt"))return e.toString("utf-8");return""}catch(e){return console.error(`Error extracting text from ${a}:`,e),""}}let l=300;async function POST(e){try{let t=await e.formData(),r=t.getAll("files"),a=t.get("role"),o=t.get("comments")||"";if(!r||0===r.length)return n.Z.json({error:"Файлы не выбраны"},{status:400});let s=new i.ZP({apiKey:process.env.ANTHROPIC_API_KEY}),l=[],p=[];for(let e of r){let t=Buffer.from(await e.arrayBuffer());if(e.type.startsWith("image/")||e.name.match(/\.(jpg|jpeg|png)$/i)){let r=e.type.startsWith("image/")?e.type:"image/jpeg";p.push({type:"image",source:{type:"base64",media_type:r,data:t.toString("base64")}})}else{let r=await extractTextFromFile(t,e.type,e.name);r.trim()&&l.push(`[Файл: ${e.name}]
${r}`)}}let u="customer"===a?"ЗАКАЗЧИКА":"ПОДРЯДЧИКА",c="customer"===a?"заказчика":"подрядчика",m=l.join("\n\n---\n\n"),x=o.trim()?`
ДОПОЛНИТЕЛЬНЫЕ ИНСТРУКЦИИ ОТ ПОЛЬЗОВАТЕЛЯ:
${o.trim()}
`:"",d=m?`ТЕКСТ ДОГОВОРА:

${m}`:"Договор предоставлен в виде изображений выше. Извлеки и проанализируй весь текст.",f=`Ты профессиональный российский юрист с опытом более 15 лет в договорном праве. Анализируй договор максимально детально и критично, защищая интересы указанной стороны.
${x}
В начале анализа укажи: "Я представляю интересы: ${u}"

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

${d}`,g=await s.messages.create({model:"claude-sonnet-4-6",max_tokens:8e3,messages:[{role:"user",content:[...p,{type:"text",text:f}]}]}),y="text"===g.content[0].type?g.content[0].text:"",h=`Ты профессиональный российский юрист. Тебе предоставлены:
1) Текст договора
2) Готовый юридический анализ этого договора с позиции ${c}
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
      "proposedText": "Новая редакция этого пункта — юридически грамотная, защищающая интересы ${c}, готовая к подписанию без дополнительных правок",
      "justification": "Почему оригинальный пункт ущемляет интересы ${c} и чем обоснована предлагаемая редакция",
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
${y}

=== ${d} ===`,w=await s.messages.create({model:"claude-sonnet-4-6",max_tokens:6e3,messages:[{role:"user",content:[...p,{type:"text",text:h}]}]}),q="text"===w.content[0].type?w.content[0].text:"{}",v=function(e){let t=e.replace(/^```(?:json)?\s*/im,"").replace(/```\s*$/m,"").trim(),r=t.indexOf("{"),a=t.lastIndexOf("}");if(-1===r||-1===a)return{};try{return JSON.parse(t.slice(r,a+1))}catch{try{return JSON.parse(t.slice(r,a+1).replace(/[\x00-\x1F\x7F]/g," "))}catch(t){return console.error("Protocol JSON parse failed:",t,"\nRaw:",e.slice(0,400)),{}}}}(q);return n.Z.json({contractTitle:v.contractTitle||r[0]?.name||"Договор",overallRisk:v.overallRisk||"medium",role:a,analysisDate:new Date().toLocaleDateString("ru-RU",{year:"numeric",month:"long",day:"numeric"}),analysisText:y,protocolItems:v.protocolItems||[]})}catch(t){console.error("Analysis error:",t);let e=t instanceof Error?t.message:"Неизвестная ошибка";return n.Z.json({error:`Ошибка при анализе договора: ${e}`},{status:500})}}let p=new o.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/analyze/route",pathname:"/api/analyze",filename:"route",bundlePath:"app/api/analyze/route"},resolvedPagePath:"/Users/egorkolobov/game/contract-analyzer/app/api/analyze/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:u,staticGenerationAsyncStorage:c,serverHooks:m,headerHooks:x,staticGenerationBailout:d}=p,f="/api/analyze/route"}};var t=require("../../../webpack-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),r=t.X(0,[955,134],()=>__webpack_exec__(2823));module.exports=r})();