"use strict";(()=>{var e={};e.id=652,e.ids=[652],e.modules={5166:e=>{e.exports=require("mammoth")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},4193:e=>{e.exports=require("pdf-parse")},2609:e=>{e.exports=require("encoding")},7147:e=>{e.exports=require("fs")},3685:e=>{e.exports=require("http")},5687:e=>{e.exports=require("https")},7561:e=>{e.exports=require("node:fs")},4492:e=>{e.exports=require("node:stream")},2477:e=>{e.exports=require("node:stream/web")},1017:e=>{e.exports=require("path")},4577:e=>{e.exports=require("punycode")},2781:e=>{e.exports=require("stream")},7310:e=>{e.exports=require("url")},3837:e=>{e.exports=require("util")},1267:e=>{e.exports=require("worker_threads")},9796:e=>{e.exports=require("zlib")},2823:(e,t,r)=>{r.r(t),r.d(t,{headerHooks:()=>x,originalPathname:()=>f,requestAsyncStorage:()=>u,routeModule:()=>p,serverHooks:()=>m,staticGenerationAsyncStorage:()=>c,staticGenerationBailout:()=>d});var o={};r.r(o),r.d(o,{POST:()=>POST,maxDuration:()=>l}),r(8976);var a=r(884),s=r(6132),n=r(5798),i=r(6134);async function extractTextFromFile(e,t,o){let a=o.toLowerCase();try{if("application/pdf"===t||a.endsWith(".pdf")){let t=(await Promise.resolve().then(r.t.bind(r,4193,23))).default,o=await t(e);return o.text}if("application/vnd.openxmlformats-officedocument.wordprocessingml.document"===t||a.endsWith(".docx")){let t=await Promise.resolve().then(r.t.bind(r,5166,23)),o=await t.extractRawText({buffer:e});return o.value}if("text/plain"===t||a.endsWith(".txt"))return e.toString("utf-8");return""}catch(e){return console.error(`Error extracting text from ${o}:`,e),""}}let l=300;async function POST(e){try{let t=await e.formData(),r=t.getAll("files"),o=t.get("role"),a=t.get("comments")||"";if(!r||0===r.length)return n.Z.json({error:"Файлы не выбраны"},{status:400});let s=new i.ZP({apiKey:process.env.ANTHROPIC_API_KEY}),l=[],p=[];for(let e of r){let t=Buffer.from(await e.arrayBuffer());if(e.type.startsWith("image/")||e.name.match(/\.(jpg|jpeg|png)$/i)){let r=e.type.startsWith("image/")?e.type:"image/jpeg";p.push({type:"image",source:{type:"base64",media_type:r,data:t.toString("base64")}})}else{let r=await extractTextFromFile(t,e.type,e.name);r.trim()&&l.push(`[Файл: ${e.name}]
${r}`)}}let u="customer"===o?"ЗАКАЗЧИКА":"ПОДРЯДЧИКА",c="customer"===o?"заказчика":"подрядчика",m=l.join("\n\n---\n\n"),x=a.trim()?`
ДОПОЛНИТЕЛЬНЫЕ ИНСТРУКЦИИ ОТ ПОЛЬЗОВАТЕЛЯ:
${a.trim()}
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

${d}`,g=`Ты профессиональный российский юрист. На основе договора составь протокол разногласий с позиции ${c}.
${x}
Верни результат строго в формате JSON (без markdown-блоков):
{
  "contractTitle": "полное название договора",
  "overallRisk": "high|medium|low",
  "protocolItems": [
    {
      "number": 1,
      "clauseRef": "п. 3.1",
      "clauseTitle": "Краткое название пункта",
      "originalText": "Точный текст пункта из договора",
      "proposedText": "Новая редакция — юридически грамотная, готовая к подписанию",
      "justification": "Подробное обоснование правки: почему данный пункт ущемляет интересы ${c} и каков правовой аргумент",
      "legalRef": "Ст. 450 ГК РФ (или иной нормативный акт)"
    }
  ]
}

Требования:
- Минимум 8–12 пунктов в протоколе
- proposedText — готов к вставке в официальный документ без правок
- justification — содержательный, со ссылкой на конкретную норму
- Защищай интересы ${c}
- Верни ТОЛЬКО валидный JSON

${d}`,y=[...p,{type:"text",text:f}],h=[...p,{type:"text",text:g}],[w,q]=await Promise.all([s.messages.create({model:"claude-sonnet-4-6",max_tokens:8e3,messages:[{role:"user",content:y}]}),s.messages.create({model:"claude-sonnet-4-6",max_tokens:6e3,messages:[{role:"user",content:h}]})]),v="text"===w.content[0].type?w.content[0].text:"",_="text"===q.content[0].type?q.content[0].text:"{}",P=_.replace(/^```(?:json)?\s*/i,"").replace(/\s*```\s*$/,"").trim(),$=P.indexOf("{"),T=P.lastIndexOf("}"),k=-1!==$&&-1!==T?P.slice($,T+1):"{}",b={};try{b=JSON.parse(k)}catch(e){console.error("Protocol JSON parse error:",e,"\nRaw:",_.slice(0,300))}return n.Z.json({contractTitle:b.contractTitle||r[0]?.name||"Договор",overallRisk:b.overallRisk||"medium",role:o,analysisDate:new Date().toLocaleDateString("ru-RU",{year:"numeric",month:"long",day:"numeric"}),analysisText:v,protocolItems:b.protocolItems||[]})}catch(t){console.error("Analysis error:",t);let e=t instanceof Error?t.message:"Неизвестная ошибка";return n.Z.json({error:`Ошибка при анализе договора: ${e}`},{status:500})}}let p=new a.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/analyze/route",pathname:"/api/analyze",filename:"route",bundlePath:"app/api/analyze/route"},resolvedPagePath:"/Users/egorkolobov/game/contract-analyzer/app/api/analyze/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:u,staticGenerationAsyncStorage:c,serverHooks:m,headerHooks:x,staticGenerationBailout:d}=p,f="/api/analyze/route"}};var t=require("../../../webpack-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),r=t.X(0,[955,134],()=>__webpack_exec__(2823));module.exports=r})();