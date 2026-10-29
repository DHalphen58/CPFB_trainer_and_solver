// CPFB solver engine (no DOM). Browser: exposes window.CPFB. Node: module.exports.
(function(){
const X=[1,0,0,0,0,1,0,-1,0],Y=[0,0,-1,0,1,0,1,0,0],Z=[0,1,0,-1,0,0,0,0,1],I3=[1,0,0,0,1,0,0,0,1];
const mmul=(A,B)=>{const r=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)r.push(A[3*i]*B[j]+A[3*i+1]*B[3+j]+A[3*i+2]*B[6+j]);return r};
const mvec=(A,v)=>[A[0]*v[0]+A[1]*v[1]+A[2]*v[2],A[3]*v[0]+A[4]*v[1]+A[5]*v[2],A[6]*v[0]+A[7]*v[1]+A[8]*v[2]];
const tr=A=>[A[0],A[3],A[6],A[1],A[4],A[7],A[2],A[5],A[8]];
const ROT=[I3],KEY={[I3.join()]:0};
for(let i=0;i<ROT.length;i++)for(const g of [X,Y,Z]){const n=mmul(g,ROT[i]),k=n.join();if(!(k in KEY)){KEY[k]=ROT.length;ROT.push(n)}}
const ri=A=>KEY[A.join()];
const MUL=new Uint8Array(576);for(let a=0;a<24;a++)for(let b=0;b<24;b++)MUL[a*24+b]=ri(mmul(ROT[a],ROT[b]));
const pw=(q,n)=>{let c=q;for(let i=1;i<n;i++)c=MUL[q*24+c];return c};
// rotation strings (physical whole-cube rotations about fixed axes)
const RS={0:''};{let fr=[0];const G=[['x',X],['y',Y],['z',Z]];while(fr.length){const nf=[];for(const s of fr)for(const [n,g] of G){let c=s;for(let t=1;t<=3;t++){c=MUL[ri(t===1?g:t===2?mmul(g,g):tr(g))*24+s];if(!(c in RS)){RS[c]=(RS[s]?RS[s]+' ':'')+n+(t===2?'2':t===3?"'":'');nf.push(c)}}}fr=nf}}
// cubies
const CPOS=[],EPOS=[],NPOS=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
for(const a of [1,-1])for(const b of [1,-1])for(const c of [1,-1])CPOS.push([a,b,c]);
for(const [i,j] of [[0,1],[0,2],[1,2]])for(const a of [1,-1])for(const b of [1,-1]){const v=[0,0,0];v[i]=a;v[j]=b;EPOS.push(v)}
const HV=[...CPOS,...EPOS,...NPOS],pk=v=>v.join(),HI={};HV.forEach((v,i)=>HI[pk(v)]=i);
const CI={},EI={},NI={};CPOS.forEach((v,i)=>CI[pk(v)]=i);EPOS.forEach((v,i)=>EI[pk(v)]=i);NPOS.forEach((v,i)=>NI[pk(v)]=i);
const FACE={U:[1,[1],Y],D:[1,[-1],tr(Y)],R:[0,[1],X],L:[0,[-1],tr(X)],F:[2,[1],Z],B:[2,[-1],tr(Z)]};
function layer(st,ax,l,Q){for(let k=0;k<26;k++){const p=mvec(ROT[st[k]],HV[k]);if(l.includes(p[ax]))st[k]=MUL[Q*24+st[k]]}}
function parse(s){const t=s.replace(/[’‘]/g,"'").trim(),r=[];if(!t)return r;for(const w of t.split(/\s+/)){const m=/^([URFDLB])(2|')?$/.exec(w);if(!m)return null;r.push([m[1],m[2]==='2'?2:m[2]?3:1])}return r}
function scrState(ms){const st=new Uint8Array(26);for(const [f,n] of ms){const [ax,l,q]=FACE[f];layer(st,ax,l,pw(ri(q),n))}return st}
const COL={'1,0,0':'R','-1,0,0':'O','0,1,0':'W','0,-1,0':'Y','0,0,1':'G','0,0,-1':'B'};
const CNAME={R:'Red',O:'Orange',W:'White',Y:'Yellow',G:'Green',B:'Blue'};
// ---- per-hand tables ----
const FACT=[1,1,2,6,24,120,720,5040];
function rank(p){const n=p.length;let r=0;for(let i=0;i<n;i++){let c=0;for(let j=i+1;j<n;j++)if(p[j]<p[i])c++;r+=c*FACT[n-1-i]}return r}
function unrank(r,n){const a=[],u=[];for(let i=0;i<n;i++){let c=Math.floor(r/FACT[n-1-i]);r%=FACT[n-1-i];let v=0;for(;;v++){if(u[v])continue;if(c--===0)break}u[v]=1;a.push(v)}return a}
function enc(kind,p,v){const ax=v.findIndex(x=>x);if(kind===0)return CI[pk(p)]*3+[1,0,2].indexOf(ax);const nz=[0,1,2].filter(a=>p[a]);return EI[pk(p)]*2+(ax===nz[0]?0:1)}
function dec(kind,c){let p,v=[0,0,0],ax;if(kind===0){p=CPOS[(c/3)|0];ax=[1,0,2][c%3]}else{p=EPOS[c>>1];ax=[0,1,2].filter(a=>p[a])[c&1]}v[ax]=p[ax];return[p,v]}
const HD={};
function hand(h,nf){const key=h+(nf?'n':'');if(HD[key])return HD[key];const sx=h==='R'?1:-1;
 const xs=h==='R'?[['M',[0],tr(X)],['L',[-1],tr(X)],['Lw',[-1,0],tr(X)]]:[['M',[0],tr(X)],['R',[1],X],['Rw',[0,1],X]];
 const T=[xs,[['U',[1],Y],['Uw',[0,1],Y]],nf?[['S',[0],Z]]:[['S',[0],Z],['F',[1],Z],['Fw',[0,1],Z]]],mv=[];
 T.forEach((arr,ax)=>arr.forEach(([n,l,q],t)=>{const Q=ri(q);for(let a=0;a<3;a++)mv.push({ax,t,l,Q:pw(Q,a+1),name:n+['',"2","'"][a]})}));
 const NM=mv.length,step=(v,m)=>m.l.includes(v[m.ax])?mvec(ROT[m.Q],v):v;
 const TC=new Uint8Array(NM*24),TE=new Uint8Array(NM*24),TN=new Uint8Array(NM*6),PMAP=new Uint8Array(NM*8);
 mv.forEach((m,i)=>{for(let c=0;c<24;c++)for(const [kind,T2] of [[0,TC],[1,TE]]){const [p,v]=dec(kind,c);T2[i*24+c]=enc(kind,step(p,m),step(v,m)===v?v:mvec(ROT[m.Q],v))}
  // vec must rotate only if position rotates
  for(let c=0;c<24;c++)for(const [kind,T2] of [[0,TC],[1,TE]]){const [p,v]=dec(kind,c),mv2=m.l.includes(p[m.ax]);T2[i*24+c]=mv2?enc(kind,mvec(ROT[m.Q],p),mvec(ROT[m.Q],v)):c}
  for(let j=0;j<6;j++)TN[i*6+j]=NI[pk(step(NPOS[j],m))];for(let j=0;j<8;j++)PMAP[i*8+j]=CI[pk(step(CPOS[j],m))]});
 const dbc=CI[pk([sx,-1,-1])],P7=[],i7=new Int8Array(8).fill(-1);CPOS.forEach((_,j)=>{if(j!==dbc){i7[j]=P7.length;P7.push(j)}});
 const PM=new Uint16Array(5040*NM),COM=new Uint16Array(2187*NM);
 for(let r=0;r<5040;r++){const p=unrank(r,7);for(let m=0;m<NM;m++){const np=[];for(let i=0;i<7;i++)np[i7[PMAP[m*8+P7[i]]]]=p[i];PM[r*NM+m]=rank(np)}}
 for(let co=0;co<2187;co++){const d=[];let x=co;for(let i=0;i<7;i++){d.push(x%3);x=(x/3)|0}for(let m=0;m<NM;m++){let s=0;const nd=[];for(let i=0;i<7;i++){const nc=TC[m*24+P7[i]*3+d[i]];nd[i7[(nc/3)|0]]=nc%3}for(let i=6;i>=0;i--)s=s*3+nd[i];COM[co*NM+m]=s}}
 // table B: distance to "corners 2-gen solvable"
 const B=new Uint8Array(5040*2187).fill(255),two=[];mv.forEach((M,i)=>{if((M.ax===0&&M.t===1)||(M.ax===1&&M.t===0))two.push(i)});
 {const q=[0];B[0]=0;for(let h2=0;h2<q.length;h2++){const i=q[h2],r=(i/2187)|0,co=i%2187;for(const m of two){const n=PM[r*NM+m]*2187+COM[co*NM+m];if(B[n]===255){B[n]=0;q.push(n)}}}}
 for(let d=0,any=true;any;d++){any=false;for(let i=0;i<B.length;i++){if(B[i]!==d)continue;const r=(i/2187)|0,co=i%2187;for(let m=0;m<NM;m++){const n=PM[r*NM+m]*2187+COM[co*NM+m];if(B[n]===255){B[n]=d+1;any=true}}}}
 // table A: block (DFR corner, DR/FR/BR edges, R/L centre)
 const tg={c:[sx,-1,1],e:[[sx,-1,0],[sx,0,1],[sx,0,-1]],n:[sx,0,0]};
 const g=[CI[pk(tg.c)]*3,...tg.e.map(e=>EI[pk(e)]*2),NI[pk(tg.n)]];
 const A=new Uint8Array(24*24*24*24*6).fill(255),gi=(((g[0]*24+g[1])*24+g[2])*24+g[3])*6+g[4];A[gi]=0;
 for(let d=0,any=true;any;d++){any=false;for(let i=0;i<A.length;i++){if(A[i]!==d)continue;let x=i;const n=x%6;x=(x-n)/6;const e3=x%24;x=(x-e3)/24;const e2=x%24;x=(x-e2)/24;const e1=x%24,cc=(x-e1)/24;
  for(let m=0;m<NM;m++){const o=m*24,k=((((TC[o+cc]*24+TE[o+e1])*24+TE[o+e2])*24+TE[o+e3])*6)+TN[m*6+n];if(A[k]===255){A[k]=d+1;any=true}}}}
 return HD[key]={mv,TC,TE,TN,PM,COM,A,B,P7,i7,tg,sx,dbc,gi}}
// ---- orientations ----
function orients(scr,h,axis){const H=hand(h),sx=H.sx,out=[];
 for(let c=0;c<8;c++){const hv=HV[c],d=[0,0,0];d[axis]=hv[axis];let Ms=null;
  for(const M of ROT){const a=mvec(M,hv),b=mvec(M,d);if(a[0]===sx&&a[1]===-1&&a[2]===-1&&b[0]===0&&b[1]===-1&&b[2]===0){Ms=M;break}}
  const g1=mmul(Ms,tr(ROT[scr[c]])),gi=ri(g1),st=new Uint8Array(26);for(let k=0;k<26;k++)st[k]=MUL[gi*24+scr[k]];
  const ht=tr(Ms),tcode=(kind,t,ref)=>{const k=HI[pk(mvec(ht,t))],r=mvec(ht,ref),p=mvec(ROT[st[k]],HV[k]),w=mvec(ROT[st[k]],r);return enc(kind,p,w)};
  const refC=t=>[0,t[1],0],refE=t=>{const a=[0,1,2].find(i=>t[i]);const v=[0,0,0];v[a]=t[a];return v};
  const cc=tcode(0,H.tg.c,refC(H.tg.c)),es=H.tg.e.map(e=>tcode(1,e,refE(e)));
  const nk=HI[pk(mvec(ht,H.tg.n))],nj=NI[pk(mvec(ROT[st[nk]],HV[nk]))];
  const perm=[],dg=[];for(let k=0;k<8;k++){const t=mvec(Ms,HV[k]);if(CI[pk(t)]===H.dbc)continue;const p=mvec(ROT[st[k]],HV[k]),w=mvec(ROT[st[k]],mvec(ht,refC(t)));perm[H.i7[CI[pk(p)]]]=H.i7[CI[pk(t)]];dg[H.i7[CI[pk(p)]]]=enc(0,p,w)%3}
  let co=0;for(let i=6;i>=0;i--)co=co*3+dg[i];
  let top='',front='';for(let k=20;k<26;k++){const p=mvec(ROT[st[k]],HV[k]);if(pk(p)==='0,1,0')top=CNAME[COL[pk(HV[k])]];if(pk(p)==='0,0,1')front=CNAME[COL[pk(HV[k])]]}
  const cl={};for(let i=0;i<3;i++){const v=[0,0,0];v[i]=HV[c][i];cl[pk(mvec(Ms,v))]=COL[pk(v)]}const corner=[cl['0,-1,0'],cl[sx+',0,0'],cl['0,0,-1']].join('/');
  out.push({c,gi,rot:RS[gi],st,h:Ms,cc,es,nj,perm:rank(perm),co,top,front,corner,hand:h})}
 return out}
function normCost(c){c=c||{};if(Array.isArray(c))c={S:c};return{S:c.S||[1,1,1],Uw:c.Uw||[1,1,1],M:c.M||[1,1,1]}}
function mvCost(n,c){const t=n.startsWith('Uw')?'Uw':n[0]==='S'?'S':n[0]==='M'?'M':null;return t?c[t][n.endsWith('2')?1:n.endsWith("'")?2:0]:1}
function solCost(h,x,c){c=normCost(c);const mv=hand(h).mv;return Math.round(x.reduce((a,m)=>a+mvCost(mv[m].name,c),0)*1e6)/1e6}
function f01(size,seeds,nb,isF,NM){const D=new Uint8Array(size).fill(255);let cur=[];for(const x of seeds){D[x]=0;cur.push(x)}
 for(let c=0;cur.length;c++){const cand=[];for(let h=0;h<cur.length;h++){const i=cur[h];for(let m=0;m<NM;m++){const n=nb(i,m);
   if(isF[m]){if(D[n]===255){D[n]=254;cand.push(n)}}else if(D[n]>c){D[n]=c;cur.push(n)}}}
  cur=cand.filter(i=>D[i]===254);for(const i of cur)D[i]=c+1}return D}
function fTables(H){if(H.FA)return H;const {mv,TC,TE,TN,PM,COM,B}=H,NM=mv.length,isF=mv.map(m=>m.name[0]==='F');
 H.FA=f01(24*24*24*24*6,[H.gi],(i,m)=>{const n=i%6;let x=(i-n)/6;const e3=x%24;x=(x-e3)/24;const e2=x%24;x=(x-e2)/24;const e1=x%24,cc=(x-e1)/24,q=m*24;return ((((TC[q+cc]*24+TE[q+e1])*24+TE[q+e2])*24+TE[q+e3])*6)+TN[m*6+n]},isF,NM);
 const seeds=[];for(let i=0;i<B.length;i++)if(B[i]===0)seeds.push(i);
 H.FB=f01(B.length,seeds,(i,m)=>PM[((i/2187)|0)*NM+m]*2187+COM[(i%2187)*NM+m],isF,NM);H.isF=isF;return H}
// fewest F/Fw moves first (exact), then shortest length for that F count
function solveF(o,maxd,cap,opt){opt=opt||{};cap=cap||300;const H=fTables(hand(o.hand)),{TC,TE,TN,PM,COM,A,B,FA,FB,mv,isF}=H,NM=mv.length;let capped=false,res,sol=[],nextT=Infinity;const cs=normCost(opt.cost),fl=[].concat(cs.S,cs.Uw,cs.M),CMv=mv.map(m=>mvCost(m.name,cs)),hs=Math.min(1,...fl);
 function dfs(cc,e1,e2,e3,n,p,co,g,bd,f,kb,lax,lt,dp){const ia=((((cc*24+e1)*24+e2)*24+e3)*6)+n,ib=p*2187+co;
  if(f+(opt.noCP?FA[ia]:Math.max(FA[ia],FB[ib]))>kb)return false;const h=opt.noCP?A[ia]:Math.max(A[ia],B[ib]);
  if(h===0&&!(opt.skipRoot&&dp===0)){res.push(sol.slice(0,dp));if(res.length>=cap)capped=true;return capped}{const ff=g+h*hs;if(ff>bd+1e-9){if(ff<nextT)nextT=ff;return false}}
  for(let m=0;m<NM;m++){const M=mv[m];if(M.ax===lax&&M.t<=lt)continue;if(opt.noM&&M.name[0]==='M')continue;const q=m*24;sol[dp]=m;
   if(dfs(TC[q+cc],TE[q+e1],TE[q+e2],TE[q+e3],TN[m*6+n],PM[p*NM+m],COM[co*NM+m],g+CMv[m],bd,f+(isF[m]?1:0),kb,M.ax,M.t,dp+1))return true}return false}
 const ia=((((o.cc*24+o.es[0])*24+o.es[1])*24+o.es[2])*6)+o.nj,ib=o.perm*2187+o.co,k0=opt.noCP?FA[ia]:Math.max(FA[ia],FB[ib]),h0=opt.noCP?A[ia]:Math.max(A[ia],B[ib]);
 for(let k=opt.kOnly===undefined?k0:opt.kOnly;k<=(opt.kOnly===undefined?12:opt.kOnly);k++)for(let bd=opt.bdOnly===undefined?h0*hs:opt.bdOnly,mx=maxd*Math.max(1,...fl);bd<=mx+1e-9;){res=[];nextT=Infinity;dfs(o.cc,o.es[0],o.es[1],o.es[2],o.nj,o.perm,o.co,0,bd,0,k,-1,-1,0);if(res.length){res.capped=capped;res.fcount=k;return res}if(opt.once)return null;if(nextT===Infinity)break;bd=nextT}return null}
function lineTab(H){if(H.LA)return H.LA;const {mv,TC,TE,tg}=H,NM=mv.length,LA=new Uint8Array(576).fill(255);LA[CI[pk(tg.c)]*3*24+EI[pk(tg.e[0])]*2]=0;
 for(let d=0,any=true;any;d++){any=false;for(let i=0;i<576;i++){if(LA[i]!==d)continue;const cc=(i/24)|0,e=i%24;for(let m=0;m<NM;m++){const n=TC[m*24+cc]*24+TE[m*24+e];if(LA[n]===255){LA[n]=d+1;any=true}}}}
 return H.LA=LA}
// cheapest way to reach "CP line" (1x1x3 bar DBx-Dx-DFx + CP)
function lineCost(o,opt){opt=opt||{};const H=hand(o.hand),LA=lineTab(H),{TC,TE,PM,COM,B,mv}=H,NM=mv.length,cs=normCost(opt.cost),fl=[].concat(cs.S,cs.Uw,cs.M),CMv=mv.map(m=>mvCost(m.name,cs)),hs=Math.min(1,...fl);let nextT=Infinity,found=-1;
 function dfs(cc,e,p,co,g,bd,lax,lt){const h=Math.max(LA[cc*24+e],opt.noCP?0:B[p*2187+co]);if(h===0){found=g;return true}const ff=g+h*hs;if(ff>bd+1e-9){if(ff<nextT)nextT=ff;return false}
  for(let m=0;m<NM;m++){const M=mv[m];if(M.ax===lax&&M.t<=lt)continue;if(opt.noM&&M.name[0]==='M')continue;if(dfs(TC[m*24+cc],TE[m*24+e],PM[p*NM+m],COM[co*NM+m],g+CMv[m],bd,M.ax,M.t))return true}return false}
 for(let bd=0;;){nextT=Infinity;if(dfs(o.cc,o.es[0],o.perm,o.co,0,bd,-1,-1))return found;if(nextT===Infinity||bd>60)return null;bd=nextT}}
function lineFilter(o,r,opt){const c=lineCost(o,opt);if(c===null)return[];const H=hand(o.hand),LA=lineTab(H),{TC,TE,PM,COM,B,mv}=H,NM=mv.length,cs=normCost(opt.cost),CMv=mv.map(m=>mvCost(m.name,cs));
 return r.filter(x=>{let cc=o.cc,e=o.es[0],p=o.perm,co=o.co,g=0;const ok=()=>LA[cc*24+e]===0&&(opt.noCP||B[p*2187+co]===0);
  if(ok())return true;for(const m of x){cc=TC[m*24+cc];e=TE[m*24+e];p=PM[p*NM+m];co=COM[co*NM+m];g+=CMv[m];if(g>c+1e-9)return false;if(ok())return true}return false})}
// all optimal-cost CP-line prefixes (with the coordinates they end in)
function lineAll(o,opt,cstar,cap){const H=hand(o.hand),LA=lineTab(H),{TC,TE,TN,PM,COM,B,mv}=H,NM=mv.length,cs=normCost(opt.cost),fl=[].concat(cs.S,cs.Uw,cs.M),CMv=mv.map(m=>mvCost(m.name,cs)),hs=Math.min(1,...fl),out=[],sol=[];
 function dfs(cc,e1,e2,e3,n,p,co,g,lax,lt,dp){const h=Math.max(LA[cc*24+e1],opt.noCP?0:B[p*2187+co]);if(h===0){out.push({seq:sol.slice(0,dp),cc,es:[e1,e2,e3],nj:n,perm:p,co,cost:g});return out.length>=cap}
  if(g+h*hs>cstar+1e-9)return false;
  for(let m=0;m<NM;m++){const M=mv[m];if(M.ax===lax&&M.t<=lt)continue;if(opt.noM&&M.name[0]==='M')continue;sol[dp]=m;
   if(dfs(TC[m*24+cc],TE[m*24+e1],TE[m*24+e2],TE[m*24+e3],TN[m*6+n],PM[p*NM+m],COM[co*NM+m],g+CMv[m],M.ax,M.t,dp+1))return true}return false}
 dfs(o.cc,o.es[0],o.es[1],o.es[2],o.nj,o.perm,o.co,0,-1,-1,0);return out}
// shortest CPFB whose route passes through an optimal CP line
function solveLine(o,maxd,cap,opt){let c=lineCost(o,opt);if(c===null)return null;if(opt.plusLine)c=Math.round((c+1)*1e6)/1e6;const H=hand(o.hand),mv=H.mv,cs=normCost(opt.cost),cost=x=>x.reduce((a,m)=>a+mvCost(mv[m].name,cs),0),nF=x=>x.filter(m=>mv[m].name[0]==='F').length;
 let best=null,res=[],capped=false;const sub=Object.assign({},opt,{lineOpt:false,plus:null,plusLine:false});
for(const p of lineAll(o,opt,c,3000)){if(opt.plusLine&&Math.abs(p.cost-c)>1e-9)continue;
  if(opt.plus){const T=opt.plus.cost+1,rem=Math.round((T-p.cost)*1e6)/1e6;if(rem<0)continue;
   const so=opt.fewF?Object.assign({},sub,{kOnly:opt.plus.F-nF(p.seq),bdOnly:rem,once:true}):Object.assign({},sub,{from:rem,once:true});if(opt.fewF&&so.kOnly<0)continue;
   const r=opt.fewF?solveF(Object.assign({},o,p),maxd,cap,so):solve1(Object.assign({},o,p),maxd,true,cap,so);
   if(r)for(const x of r)if(Math.abs(p.cost+cost(x)-T)<1e-9)res.push(p.seq.concat(x));continue}
  const r=opt.fewF?solveF(Object.assign({},o,p),maxd,cap,sub):solve1(Object.assign({},o,p),maxd,true,cap,sub);if(!r)continue;
  const key=[opt.fewF?nF(p.seq)+r.fcount:0,Math.round((p.cost+cost(r[0]))*1e6)/1e6];
  if(best&&(key[0]>best[0]||(key[0]===best[0]&&key[1]>best[1]+1e-9)))continue;
  if(!best||key[0]<best[0]||key[1]<best[1]-1e-9){best=key;res=[]}
  if(r.capped)capped=true;for(const x of r)res.push(p.seq.concat(x))}
 if(!res.length)return null;const seen=new Set();res=res.filter(x=>{const k=x.join();if(seen.has(k))return false;seen.add(k);return true}).slice(0,cap);res.capped=capped||res.length>=cap;if(opt.fewF&&best)res.fcount=best[0];return res}
function solve(o,maxd,all,cap,opt){opt=opt||{};const T=opt.plus?opt.plus.cost+1:0;let r=opt.lineOpt&&all?solveLine(o,maxd,cap||300,opt):opt.plus?(opt.fewF?solveF(o,maxd,cap,Object.assign({},opt,{kOnly:opt.plus.F,bdOnly:T,once:true,skipRoot:opt.plus.cost===0})):solve1(o,maxd,all,cap,Object.assign({},opt,{from:T,once:true,skipRoot:opt.plus.cost===0}))):opt.fewF?solveF(o,maxd,cap,opt):solve1(o,maxd,all,cap,opt);
 if(opt.plus&&r){const mv0=hand(o.hand).mv,cs0=normCost(opt.cost),cc=x=>x.reduce((a,m)=>a+mvCost(mv0[m].name,cs0),0),k=r.filter(x=>Math.abs(cc(x)-T)<1e-9);k.capped=r.capped;k.fcount=r.fcount;r=k;if(!r.length)return null}
 if(all&&r&&r.length>1){const mv=hand(o.hand).mv,key=x=>{let k=-1;x.forEach((m,i)=>{if(mv[m].name[0]==='F')k=i});return k},ks=new Map(r.map(x=>[x,key(x)])),sc=x=>x.filter(m=>mv[m].name[0]==='S').length,ss=new Map(r.map(x=>[x,sc(x)]));r.sort((a,b)=>ks.get(a)-ks.get(b)||ss.get(a)-ss.get(b))}
 return r}
function solve1(o,maxd,all,cap,opt){cap=cap||300;opt=opt||{};let capped=false,nodes=0,timed=false;const fmax=opt.fmax===undefined?99:opt.fmax;const H=hand(o.hand,opt.noF),{TC,TE,TN,PM,COM,A,B,mv}=H,sol=[],res=[],NM=mv.length,cs=normCost(opt.cost),fl=[].concat(cs.S,cs.Uw,cs.M),CMv=mv.map(m=>mvCost(m.name,cs)),hs=Math.min(1,...fl);let nextT=Infinity;
 function dfs(cc,e1,e2,e3,n,p,co,g,bd,lax,lt,fc,dp){if(opt.deadline&&(++nodes&8191)===0&&Date.now()>opt.deadline)timed=true;if(timed)return true;const ha=A[((((cc*24+e1)*24+e2)*24+e3)*6)+n],h=opt.noCP?ha:Math.max(ha,B[p*2187+co]);
  if(h===0&&!(opt.skipRoot&&dp===0)){res.push(sol.slice(0,dp));if(all&&res.length>=cap)capped=true;return !all||capped}{const ff=g+h*hs;if(ff>bd+1e-9){if(ff<nextT)nextT=ff;return false}}
  for(let m=0;m<NM;m++){const M=mv[m];if(M.ax===lax&&M.t<=lt)continue;if(opt.noM&&M.name[0]==='M')continue;const isF=M.name[0]==='F';if(isF&&fc>=fmax)continue;const q=m*24;sol[dp]=m;
   if(dfs(TC[q+cc],TE[q+e1],TE[q+e2],TE[q+e3],TN[m*6+n],PM[p*NM+m],COM[co*NM+m],g+CMv[m],bd,M.ax,M.t,fc+(isF?1:0),dp+1))return true}return false}
 for(let bd=opt.from||0,mx=maxd*Math.max(1,...fl);bd<=mx+1e-9;){nextT=Infinity;dfs(o.cc,o.es[0],o.es[1],o.es[2],o.nj,o.perm,o.co,0,bd,-1,-1,0,0);if(timed){if(opt.st)opt.st.timed=true;return null}if(res.length){if(!all)return res[0];let r=res;if(opt.minF){const f=x=>x.filter(m=>mv[m].name[0]==='F').length,mn=Math.min(...res.map(f));r=res.filter(x=>f(x)===mn)}r.capped=capped;return r}if(opt.once)return null;if(nextT===Infinity)break;bd=nextT}return null}
// full-state verification (independent of the coordinate tables)
function verify(o,sol,noCP,line){const H=hand(o.hand),st=Uint8Array.from(o.st);for(const m of sol){const M=H.mv[m];layer(st,M.ax,M.l,M.Q)}
 const hI=ri(o.h);const ok=[...(line?[H.tg.e[0]]:H.tg.e),H.tg.c].every(t=>{const k=HI[pk(mvec(tr(o.h),t))];return st[k]===hI});
 const nk=HI[pk(mvec(tr(o.h),H.tg.n))];if(!line&&pk(mvec(ROT[st[nk]],HV[nk]))!==pk(H.tg.n))return false;if(!ok||st[HI[pk(mvec(tr(o.h),[H.sx,-1,-1]))]]!==hI)return false;if(noCP)return true;
 const key=s=>{let r='';for(let k=0;k<8;k++)r+=String.fromCharCode(65+s[k]);return r},sx=o.hand==='R'?[0,-1,[1,Y]]:[0,1,[1,Y]];
 const g2=[[0,o.hand==='R'?[-1]:[1],o.hand==='R'?tr(X):X],[1,[1],Y]].map(([a,l,q])=>[a,l,ri(q)]);
 const ck=o.hand+hI;let seen=VCACHE[ck];
 if(!seen){const s0=new Uint8Array(26).fill(hI),qu=[s0];seen=new Set([key(s0)]);
  for(let i=0;i<qu.length;i++)for(const [a,l,q] of g2){const n=Uint8Array.from(qu[i]);layer(n,a,l,q);const k=key(n);if(!seen.has(k)){seen.add(k);qu.push(n)}}VCACHE[ck]=seen}
 return seen.has(key(st))}
const VCACHE={};

// ---- random-state scramble (two-phase) ----
const Z8=[0,0,0,0,0,0,0,0],Z12=[0,0,0,0,0,0,0,0,0,0,0,0];
const KB=[
[[3,0,1,2,4,5,6,7],Z8,[3,0,1,2,4,5,6,7,8,9,10,11],Z12],
[[4,1,2,0,7,5,6,3],[2,0,0,1,1,0,0,2],[8,1,2,3,11,5,6,7,4,9,10,0],Z12],
[[1,5,2,3,0,4,6,7],[1,2,0,0,2,1,0,0],[0,9,2,3,4,8,6,7,1,5,10,11],[0,1,0,0,0,1,0,0,1,1,0,0]],
[[0,1,2,3,5,6,7,4],Z8,[0,1,2,3,5,6,7,4,8,9,10,11],Z12],
[[0,2,6,3,4,1,5,7],[0,1,2,0,0,2,1,0],[0,1,10,3,4,5,9,7,8,2,6,11],Z12],
[[0,1,3,7,4,5,2,6],[0,0,1,2,0,0,2,1],[0,1,2,11,4,5,6,10,8,9,3,7],[0,0,0,1,0,0,0,1,0,0,1,1]]
].map(([cp,co,ep,eo])=>({cp,co,ep,eo}));
const KID={cp:[0,1,2,3,4,5,6,7],co:Z8,ep:[0,1,2,3,4,5,6,7,8,9,10,11],eo:Z12};
function kmul(a,b){const r={cp:[],co:[],ep:[],eo:[]};for(let i=0;i<8;i++){r.cp[i]=a.cp[b.cp[i]];r.co[i]=(a.co[b.cp[i]]+b.co[i])%3}for(let i=0;i<12;i++){r.ep[i]=a.ep[b.ep[i]];r.eo[i]=(a.eo[b.ep[i]]+b.eo[i])%2}return r}
const KM=[];KB.forEach(b=>{let q=b;for(let k=0;k<3;k++){KM.push(q);q=kmul(q,b)}});
const Cnk=[];for(let n=0;n<13;n++){Cnk[n]=[];for(let k=0;k<5;k++)Cnk[n][k]=k===0?1:n===0?0:Cnk[n-1][k-1]+Cnk[n-1][k]}
const twC=co=>{let t=0;for(let i=0;i<7;i++)t=t*3+co[i];return t},flC=eo=>{let t=0;for(let i=0;i<11;i++)t=t*2+eo[i];return t};
const slC=ep=>{let a=0,x=0;for(let j=11;j>=0;j--)if(ep[j]>=8){a+=Cnk[11-j][x+1];x++}return a};
const P2=[0,1,2,9,10,11,4,13,7,16];let KT=null;
function kInit(){if(KT)return KT;
 const twMv=new Uint16Array(2187*18),flMv=new Uint16Array(2048*18),slMv=new Uint16Array(495*18);
 for(let t=0;t<2187;t++){const co=[];let x=t,q=0;for(let i=6;i>=0;i--){co[i]=x%3;x=(x-co[i])/3;q+=co[i]}co[7]=(3-q%3)%3;const c={cp:KID.cp,co,ep:KID.ep,eo:Z12};for(let m=0;m<18;m++)twMv[t*18+m]=twC(kmul(c,KM[m]).co)}
 for(let t=0;t<2048;t++){const eo=[];let x=t,q=0;for(let i=10;i>=0;i--){eo[i]=x%2;x=(x-eo[i])/2;q+=eo[i]}eo[11]=q%2;const c={cp:KID.cp,co:Z8,ep:KID.ep,eo};for(let m=0;m<18;m++)flMv[t*18+m]=flC(kmul(c,KM[m]).eo)}
 const reps=[];for(let a=0;a<12;a++)for(let b=a+1;b<12;b++)for(let c=b+1;c<12;c++)for(let d=c+1;d<12;d++){const ep=[],ps=[a,b,c,d];let o=0,n=0;for(let i=0;i<12;i++)ep[i]=ps.includes(i)?8+n++:o++;reps[slC(ep)]=ep}
 reps.forEach((ep,k)=>{const c={cp:KID.cp,co:Z8,ep,eo:Z12};for(let m=0;m<18;m++)slMv[k*18+m]=slC(kmul(c,KM[m]).ep)});
 const mk=(n1,m1,n2,m2,nm)=>{const T=new Uint8Array(n1*n2).fill(255);T[0]=0;for(let d=0,any=true;any;d++){any=false;for(let i=0;i<T.length;i++){if(T[i]!==d)continue;const a=(i/n2)|0,b=i%n2;for(let m=0;m<nm;m++){const n=m1[a*nm+m]*n2+m2[b*nm+m];if(T[n]===255){T[n]=d+1;any=true}}}}return T};
 const cpMv=new Uint16Array(40320*10),epMv=new Uint16Array(40320*10),spMv=new Uint8Array(24*10);
 for(let r=0;r<40320;r++){const p=unrank(r,8);const c1={cp:p,co:Z8,ep:KID.ep,eo:Z12},c2={cp:KID.cp,co:Z8,ep:[...p,8,9,10,11],eo:Z12};
  for(let j=0;j<10;j++){cpMv[r*10+j]=rank(kmul(c1,KM[P2[j]]).cp);epMv[r*10+j]=rank(kmul(c2,KM[P2[j]]).ep.slice(0,8))}}
 for(let r=0;r<24;r++){const p=unrank(r,4),c={cp:KID.cp,co:Z8,ep:[0,1,2,3,4,5,6,7,...p.map(x=>x+8)],eo:Z12};for(let j=0;j<10;j++)spMv[r*10+j]=rank(kmul(c,KM[P2[j]]).ep.slice(8).map(x=>x-8))}
 return KT={twMv,flMv,slMv,ptTS:mk(2187,twMv,495,slMv,18),ptFS:mk(2048,flMv,495,slMv,18),cpMv,epMv,spMv,pA:mk(40320,cpMv,24,spMv,10),pB:mk(40320,epMv,24,spMv,10)}}
function kSolve(st,limitMs,good){kInit();const {twMv,flMv,slMv,ptTS,ptFS,cpMv,epMv,spMv,pA,pB}=KT,t0=Date.now(),seq=[];let best=null;good=good||21;
 function phase2(g1){let c=st;for(let i=0;i<g1;i++)c=kmul(c,KM[seq[i]]);
  const cp=rank(c.cp),ep=rank(c.ep.slice(0,8)),sp=rank(c.ep.slice(8).map(x=>x-8)),lim=(best?best.length-1:30)-g1,s2=[];
  function d2(cp,ep,sp,g,bd,lf){const h=Math.max(pA[cp*24+sp],pB[ep*24+sp]);if(h===0)return true;if(g+h>bd)return false;
   for(let j=0;j<10;j++){const m=P2[j],fc=(m/3)|0;if(fc===lf||(lf>=3&&fc===lf-3))continue;s2[g]=m;if(d2(cpMv[cp*10+j],epMv[ep*10+j],spMv[sp*10+j],g+1,bd,fc))return true}return false}
  for(let bd=0;bd<=lim;bd++)if(d2(cp,ep,sp,0,bd,-1))return seq.slice(0,g1).concat(s2.slice(0,bd));return null}
 function d1(t,f,s,g,bd,lf){if(best&&Date.now()-t0>limitMs)return true;const h=Math.max(ptTS[t*495+s],ptFS[f*495+s]);if(h>bd-g)return false;
  if(g===bd){if(h===0){const r=phase2(g);if(r&&(!best||r.length<best.length)){best=r;if(best.length<=good)return true}}return false}
  for(let m=0;m<18;m++){const fc=(m/3)|0;if(fc===lf||(lf>=3&&fc===lf-3))continue;seq[g]=m;if(d1(twMv[t*18+m],flMv[f*18+m],slMv[s*18+m],g+1,bd,fc))return true}return false}
 for(let bd=0;bd<=14;bd++)if(d1(twC(st.co),flC(st.eo),slC(st.ep),0,bd,-1))break;return best}
function randState(){const sh=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 const par=p=>{let c=0;for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++)if(p[i]>p[j])c++;return c%2};
 const cp=sh([0,1,2,3,4,5,6,7]),ep=sh([0,1,2,3,4,5,6,7,8,9,10,11]);if(par(cp)!==par(ep))[ep[0],ep[1]]=[ep[1],ep[0]];
 const co=[],eo=[];let a=0,b=0;for(let i=0;i<7;i++){co[i]=Math.floor(Math.random()*3);a+=co[i]}co[7]=(3-a%3)%3;for(let i=0;i<11;i++){eo[i]=Math.floor(Math.random()*2);b+=eo[i]}eo[11]=b%2;return{cp,co,ep,eo}}
function normSeq(ms){let a=ms.map(m=>[(m/3)|0,(m%3)+1]);
 for(;;){const s0=JSON.stringify(a),out=[];let i=0;
  while(i<a.length){const ax=a[i][0]%3,amt={};let j=i;while(j<a.length&&a[j][0]%3===ax){amt[a[j][0]]=((amt[a[j][0]]||0)+a[j][1])%4;j++}
   Object.keys(amt).map(Number).sort((x,y)=>x-y).forEach(f=>{if(amt[f])out.push([f,amt[f]])});i=j}
  a=out;if(JSON.stringify(a)===s0)break}
 return a.map(([f,k])=>f*3+k-1)}
function randScramble(){const sol=kSolve(randState(),500);return normSeq(sol.slice().reverse().map(m=>(m/3|0)*3+2-m%3)).map(m=>'URFDLB'[(m/3)|0]+['',"2","'"][m%3]).join(' ')}
function diag(o,sol){const H=hand(o.hand),st=Uint8Array.from(o.st);for(const m of sol){const M=H.mv[m];layer(st,M.ax,M.l,M.Q)}
 const hI=ri(o.h),out={};out.block=[...H.tg.e,H.tg.c].map(t=>st[HI[pk(mvec(tr(o.h),t))]]===hI);
 const nk=HI[pk(mvec(tr(o.h),H.tg.n))];out.centre=pk(mvec(ROT[st[nk]],HV[nk]))===pk(H.tg.n);
 const cs=[];for(let k=0;k<8;k++){const t=mvec(o.h,HV[k]),p=mvec(ROT[st[k]],HV[k]);cs.push((pk(t)===pk(p)?'pos-ok':'pos-off')+(st[k]===hI?'/ori-ok':'/ori-off'))}out.corners=cs;return out}
const api={lineFilter,lineCost,solCost,normSeq,diag,kSolve,randScramble,randState,kmul,KM,KID,kInit,parse,scrState,orients,solve,verify,hand,RS,CNAME};
if(typeof window!=='undefined')window.CPFB=api;if(typeof module!=='undefined')module.exports=api;
})();
