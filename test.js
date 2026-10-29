// Self-checks for engine.js. Run: node test.js
const C=require('./engine.js');let fails=0,checks=0;
const ok=(c,msg)=>{checks++;if(!c){fails++;console.log('FAIL:',msg)}};
const ap=s=>C.scrState(C.parse(s));
const rs=n=>{const a=[];let l=-1;while(a.length<n){const f=Math.floor(Math.random()*6);if(f===l)continue;l=f;a.push('URFDLB'[f]+['','2',"'"][Math.floor(Math.random()*3)])}return a.join(' ')};
// 1. face-turn model
ok(ap('R R R R').every(v=>v===0),'R^4 = identity');
ok(ap("R U R' U' ".repeat(6)).every(v=>v===0),"(R U R' U')^6 = identity");
ok(ap('R U '.repeat(105)).slice(0,20).every(v=>v===0),'(R U)^105 = identity (pieces)');
ok(ap('F2').every((v,i)=>v===ap('F F')[i]),'F2 = F F');
// 2. solutions are valid, optimal (vs brute force) and obey options
const exists=(o,len)=>{const H=C.hand(o.hand);const d=(seq,lax,lt)=>{if(seq.length===len)return C.verify(o,seq);for(let m=0;m<H.mv.length;m++){const M=H.mv[m];if(M.ax===lax&&M.t<=lt)continue;seq.push(m);const r=d(seq,M.ax,M.t);seq.pop();if(r)return true}return false};return d([],-1,-1)};
for(let it=0;it<8;it++){const h=it%2?'L':'R',mv=C.hand(h).mv;
 for(const o of C.orients(ap(rs(3)),h,it%3)){const r=C.solve(o,18,true,300,{});
  ok(C.verify(o,r[0]),'solution reaches CPFB');
  if(r[0].length>=1&&r[0].length<=4)ok(!exists(o,r[0].length-1),'no shorter solution exists');
  const nm=C.solve(o,18,true,300,{noM:true});ok(!nm.some(x=>x.some(m=>mv[m].name[0]==='M')),'No M respected');}}
// 3. options on a random-state scramble
const sc=C.randScramble();ok(!sc.split(' ').some((t,i,a)=>i&&t[0]===a[i-1][0]),'generated scramble has no repeated face');
for(const h of ['R','L'])for(const o of C.orients(ap(sc),h,1)){const mv=C.hand(h).mv,nF=x=>x.filter(m=>mv[m].name[0]==='F').length;
 const base=C.solve(o,18,true,300,{}),few=C.solve(o,18,true,20000,{fewF:true}),ln=C.solve(o,18,true,300,{lineOpt:true}),pl=C.solve(o,18,true,300,{plus:{cost:base[0].length}});
 ok(nF(few[0])<=nF(base[0]),'fewest F never worse');ok(few.slice(0,3).every(x=>C.verify(o,x)),'fewF solutions valid');
 ok(C.verify(o,ln[0]),'line-optimal solution valid');ok(!pl||pl.slice(0,3).every(x=>x.length===base[0].length+1&&C.verify(o,x)),'+1 solutions valid');}
console.log(checks+' checks, '+fails+' failed');process.exit(fails?1:0);
