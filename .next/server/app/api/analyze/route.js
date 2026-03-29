"use strict";(()=>{var e={};e.id=652,e.ids=[652],e.modules={5166:e=>{e.exports=require("mammoth")},517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},4193:e=>{e.exports=require("pdf-parse")},2609:e=>{e.exports=require("encoding")},7147:e=>{e.exports=require("fs")},3685:e=>{e.exports=require("http")},5687:e=>{e.exports=require("https")},7561:e=>{e.exports=require("node:fs")},4492:e=>{e.exports=require("node:stream")},2477:e=>{e.exports=require("node:stream/web")},1017:e=>{e.exports=require("path")},4577:e=>{e.exports=require("punycode")},2781:e=>{e.exports=require("stream")},7310:e=>{e.exports=require("url")},3837:e=>{e.exports=require("util")},1267:e=>{e.exports=require("worker_threads")},9796:e=>{e.exports=require("zlib")},2823:(e,t,r)=>{r.r(t),r.d(t,{headerHooks:()=>d,originalPathname:()=>g,requestAsyncStorage:()=>p,routeModule:()=>l,serverHooks:()=>c,staticGenerationAsyncStorage:()=>m,staticGenerationBailout:()=>x});var a={};r.r(a),r.d(a,{POST:()=>POST,maxDuration:()=>u}),r(8976);var o=r(884),s=r(6132),i=r(5798),n=r(6134);async function extractTextFromFile(e,t,a){let o=a.toLowerCase();try{if("application/pdf"===t||o.endsWith(".pdf")){let t=(await Promise.resolve().then(r.t.bind(r,4193,23))).default,a=await t(e);return a.text}if("application/vnd.openxmlformats-officedocument.wordprocessingml.document"===t||o.endsWith(".docx")){let t=await Promise.resolve().then(r.t.bind(r,5166,23)),a=await t.extractRawText({buffer:e});return a.value}if("text/plain"===t||o.endsWith(".txt"))return e.toString("utf-8");return""}catch(e){return console.error(`Error extracting text from ${a}:`,e),""}}let u=300;async function POST(e){try{let t=await e.formData(),r=t.getAll("files"),a=t.get("role"),o=t.get("comments")||"";if(!r||0===r.length)return i.Z.json({error:"Файлы не выбраны"},{status:400});let s=new n.ZP({apiKey:process.env.ANTHROPIC_API_KEY}),u=[],l=[];for(let e of r){let t=Buffer.from(await e.arrayBuffer());if(e.type.startsWith("image/")||e.name.match(/\.(jpg|jpeg|png)$/i)){let r=e.type.startsWith("image/")?e.type:"image/jpeg";l.push({type:"image",source:{type:"base64",media_type:r,data:t.toString("base64")}})}else{let r=await extractTextFromFile(t,e.type,e.name);r.trim()&&u.push(`[Файл: ${e.name}]
${r}`)}}let p="customer"===a?"заказчика":"подрядчика",m=u.join("\n\n---\n\n"),c=o.trim()?`
ДОПОЛНИТЕЛЬНЫЕ ИНСТРУКЦИИ ОТ ПОЛЬЗОВАТЕЛЯ:
${o.trim()}
`:"",d=[...l,{type:"text",text:`Ты — опытный российский юрист, специализирующийся на договорном праве. Твоя задача — тщательно проанализировать предоставленный договор с позиции ${p} и подготовить профессиональное заключение.
${c}
${m?`ТЕКСТ ДОГОВОРА:

${m}`:"Договор предоставлен в виде изображений выше. Извлеки и проанализируй весь текст."}

Предоставь детальный анализ в формате JSON строго по следующей структуре:

{
  "contractTitle": "полное название/тип договора",
  "overallRisk": "high|medium|low",
  "summary": "подробное резюме договора: что это за договор, ключевые условия, общая оценка — 3-4 абзаца",
  "risks": [
    {
      "severity": "high|medium|low",
      "clause": "номер или название пункта",
      "description": "детальное описание риска для ${p}",
      "recommendation": "конкретная рекомендация как устранить или снизить риск"
    }
  ],
  "problematicClauses": [
    {
      "number": "номер пункта",
      "title": "название или краткое описание пункта",
      "issue": "в чём конкретно проблема этого пункта",
      "risk": "чем именно это грозит ${p}"
    }
  ],
  "missingClauses": [
    "описание важного условия, которого нет в договоре, но которое необходимо ${p}"
  ],
  "strengths": [
    "конкретная сильная сторона договора выгодная ${p}"
  ],
  "weaknesses": [
    "конкретная слабая сторона договора невыгодная ${p}"
  ],
  "recommendations": [
    "конкретная рекомендация по улучшению договора в интересах ${p}"
  ],
  "disagreementProtocol": [
    {
      "clauseNumber": "номер пункта",
      "clauseTitle": "название/описание пункта",
      "originalText": "точный или близкий к оригиналу текст спорного пункта",
      "issue": "почему этот пункт неприемлем для ${p}",
      "proposedText": "готовая альтернативная формулировка этого пункта — юридически грамотная, конкретная, защищающая интересы ${p}",
      "justification": "правовое обоснование предлагаемых изменений"
    }
  ]
}

Требования:
- Минимум 5-8 рисков
- Минимум 5-8 проблемных пунктов
- Минимум 5 отсутствующих условий
- Минимум 5-8 пунктов в протоколе разногласий
- Анализируй строго с позиции ${p}
- Протокол разногласий — это официальный юридический документ, формулировки должны быть готовы к использованию
- Верни ТОЛЬКО валидный JSON без markdown-блоков, пояснений и дополнительного текста`}],x=await s.messages.create({model:"claude-sonnet-4-6",max_tokens:8e3,messages:[{role:"user",content:d}]}),g="text"===x.content[0].type?x.content[0].text:"",f=g.match(/\{[\s\S]*\}/);if(!f)throw console.error("No JSON in response:",g.substring(0,500)),Error("Некорректный ответ от API");let h=JSON.parse(f[0]);return h.role=a,h.analysisDate=new Date().toLocaleDateString("ru-RU",{year:"numeric",month:"long",day:"numeric"}),i.Z.json(h)}catch(t){console.error("Analysis error:",t);let e=t instanceof Error?t.message:"Неизвестная ошибка";return i.Z.json({error:`Ошибка при анализе договора: ${e}`},{status:500})}}let l=new o.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/analyze/route",pathname:"/api/analyze",filename:"route",bundlePath:"app/api/analyze/route"},resolvedPagePath:"/Users/egorkolobov/game/contract-analyzer/app/api/analyze/route.ts",nextConfigOutput:"",userland:a}),{requestAsyncStorage:p,staticGenerationAsyncStorage:m,serverHooks:c,headerHooks:d,staticGenerationBailout:x}=l,g="/api/analyze/route"}};var t=require("../../../webpack-runtime.js");t.C(e);var __webpack_exec__=e=>t(t.s=e),r=t.X(0,[955,134],()=>__webpack_exec__(2823));module.exports=r})();