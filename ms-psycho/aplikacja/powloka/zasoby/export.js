const fs=require('fs');const L=require('./logo.js');const W7=require('./white.js');
const {chromium}=require('playwright');
const OUT=__dirname+'/';
const s=37/838, CW=62, CH=66, vw=CW/s, vh=CH/s, x0=(760-vw)/2, y0=(838-vh)/2;
const pick=(id)=>W7.list.find(v=>v.id===id);
const mkSvg=(v,sfx)=>{
  let svg=L.svg({sfx,defs:v.defs,layers:v.layers,coreW:v.coreW||30,coreA:v.coreA});
  svg=svg.replace('<svg viewBox="0 0 760 838" xmlns="http://www.w3.org/2000/svg"',
    `<svg viewBox="${x0.toFixed(1)} ${y0.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}" width="${CW}" height="${CH}" xmlns="http://www.w3.org/2000/svg"`);
  return svg.replace('aria-label="Nawigator Medyczny"','aria-label="Konsylium AI"');
};
(async()=>{ const b=await chromium.launch();
 for(const [id,name] of [['7b-grawer-wklesly','jasny'],['7b-ciemny','ciemny']]){
  const v=pick(id); const svg=mkSvg(v,'k'+name[0]); fs.writeFileSync(OUT+`logo-k-7b-${name}.svg`,svg);
  for(const dsf of [1,2,3]){ const ctx=await b.newContext({viewport:{width:CW,height:CH},deviceScaleFactor:dsf});const p=await ctx.newPage();
   await p.setContent(`<html><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${CW}" height="${CH}" style="display:block"></body></html>`);
   await p.waitForTimeout(300); await p.screenshot({path:OUT+`logo-k-7b-${name}${dsf>1?'@'+dsf+'x':''}.png`,omitBackground:true}); await ctx.close(); }
  // podgląd na jasnej tafli
  const ctx=await b.newContext({viewport:{width:260,height:120},deviceScaleFactor:3});const p=await ctx.newPage();
  await p.setContent(`<html><body style="margin:0;background:${name==='jasny'?'linear-gradient(135deg,#eef3f2,#dfe8e6)':'#1c2426'}"><img src="data:image/png;base64,${fs.readFileSync(OUT+`logo-k-7b-${name}@3x.png`).toString('base64')}" width="48" height="51" style="display:block;position:absolute;left:29px;top:14px"><img src="data:image/png;base64,${fs.readFileSync('/home/claude/nawigatormedyczny/makiety/logo-lod/logo-7b-'+name+'@3x.png').toString('base64')}" width="48" height="51" style="display:block;position:absolute;left:150px;top:14px"></body></html>`);
  await p.waitForTimeout(300); await p.screenshot({path:OUT+`podglad-${name}.png`}); await ctx.close();
 } await b.close(); })().catch(e=>{console.error(e);process.exit(1)});
