let db=blank();
let currentUser=null;
function blank(){return {customers:[],transactions:[],settings:{storeName:'',ownerName:'',storePhone:''}}}
function cacheKey(){return currentUser?'sukiledger_cache_'+currentUser.id:null}
function save(){
 if(!currentUser) return;
 const snapshot=JSON.stringify(db);
 localStorage.setItem(cacheKey(),snapshot);
 renderAll();
 syncCloud(snapshot);
}
let syncTimer=null;
function syncCloud(snapshot){
 clearTimeout(syncTimer);
 syncTimer=setTimeout(async()=>{
  if(!currentUser) return;
  const uid=currentUser.id;
  try{
   const {error}=await supabase.from('sukiledger_data').upsert({user_id:uid,data:JSON.parse(snapshot),updated_at:new Date().toISOString()},{onConflict:'user_id'});
   if(error) throw error;
   if(currentUser && currentUser.id===uid) setSyncStatus('Naka-save sa cloud');
  }catch(err){console.error(err);setSyncStatus('Hindi ma-sync. Suriin ang internet.');toast('Hindi na-sync sa cloud. Panatilihin ang internet at subukang muli.');}
 },250);
}
function setSyncStatus(message){const el=document.getElementById('syncStatus');if(el)el.textContent=message}
function showAuthPanel(id){document.getElementById('loginPanel').hidden=id!=='loginPanel';document.getElementById('signupPanel').hidden=id!=='signupPanel';document.getElementById('authMessage').textContent=''}
function authMessage(message,isError=true){const el=document.getElementById('authMessage');el.style.color=isError?'#bd4545':'#26724c';el.textContent=message}
async function activateSession(user){
 currentUser=user;
 document.body.classList.add('authenticated');
 document.getElementById('authGate').style.display='none';
 document.getElementById('accountEmail').textContent=user.email||'Account';
 setSyncStatus('Kinukuha ang records...');
 db=blank();
 try{
  const {data,error}=await supabase.from('sukiledger_data').select('data').eq('user_id',user.id).maybeSingle();
  if(error)throw error;
  if(data&&data.data)db={...blank(),...data.data};
  else{
   const cached=localStorage.getItem(cacheKey());
   if(cached)db={...blank(),...JSON.parse(cached)};
   const {error:saveError}=await supabase.from('sukiledger_data').upsert({user_id:user.id,data:db},{onConflict:'user_id'});
   if(saveError)throw saveError;
  }
  localStorage.setItem(cacheKey(),JSON.stringify(db));renderAll();setSyncStatus('Naka-sync sa cloud');
 }catch(err){console.error(err);setSyncStatus('Sync error');authMessage('Hindi makuha ang cloud records. Suriin ang Supabase setup at internet connection.')}
}
async function logout(){
 if(!confirm('Mag-logout sa SukiLedger?'))return;
 await supabase.auth.signOut();currentUser=null;db=blank();
 document.body.classList.remove('authenticated');
 document.getElementById('authGate').style.display='grid';
 document.getElementById('accountEmail').textContent='';
 showAuthPanel('loginPanel');setSyncStatus('');
}

const money=n=>'₱'+Number(n||0).toLocaleString('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2});
const today=()=>new Date().toISOString().slice(0,10);
const fmtDate=d=>d?new Date(d+'T00:00:00').toLocaleDateString('en-PH',{year:'numeric',month:'short',day:'numeric'}):'—';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
function totals(id){let tx=db.transactions.filter(t=>!id||t.customerId===id);let debt=tx.filter(t=>t.type==='debt').reduce((a,t)=>a+t.amount,0);let paid=tx.filter(t=>t.type==='payment').reduce((a,t)=>a+t.amount,0);return {debt,paid,balance:Math.max(0,debt-paid)}}
function customerName(id){return db.customers.find(c=>c.id===id)?.name||'Deleted customer'}
function toast(msg){let el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2400)}
function openModal(id){if(id==='debtModal'){fillCustomerSelect();document.getElementById('dDate').value=today();document.getElementById('dTime').value=new Date().toTimeString().slice(0,5);document.getElementById('debtItemsBody').innerHTML='';addDebtItemRow();calcDebt()}if(id==='paymentModal')document.getElementById('pDate').value=today();document.getElementById(id).classList.add('show')}
function closeModal(id){document.getElementById(id).classList.remove('show')}
function showPage(page){document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));document.getElementById('pageTitle').textContent=({dashboard:'Dashboard',customers:'Mga Customer',transactions:'Mga Transaksyon',reports:'Mga Ulat at Backup',settings:'Settings'})[page];if(page==='customers')renderCustomers();if(page==='transactions')renderTransactions();window.scrollTo(0,0)}
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
function renderAll(){let all=totals(),due=db.customers.filter(c=>totals(c.id).balance>0);['sDebt','rDebt'].forEach(id=>document.getElementById(id).textContent=money(all.debt));['sPaid','rPaid'].forEach(id=>document.getElementById(id).textContent=money(all.paid));['sBalance','rBalance'].forEach(id=>document.getElementById(id).textContent=money(all.balance));document.getElementById('sCount').textContent=due.length;document.getElementById('rCustomers').textContent=db.customers.length;document.getElementById('today').textContent=new Date().toLocaleDateString('en-PH',{weekday:'short',year:'numeric',month:'short',day:'numeric'});document.getElementById('printDate').textContent='Inilimbag: '+new Date().toLocaleString('en-PH');let recent=[...db.transactions].sort((a,b)=>(b.createdAt||b.date).localeCompare(a.createdAt||a.date)).slice(0,8);document.getElementById('recentRows').innerHTML=recent.length?recent.map(t=>`<tr><td>${fmtDate(t.date)}</td><td class="namecell">${esc(customerName(t.customerId))}</td><td>${esc(t.description||'—')}</td><td class="amount">${money(t.amount)}</td><td><span class="status ${t.type==='payment'?'paid':'unpaid'}">${t.type==='payment'?'Bayad':'Utang'}</span></td></tr>`).join(''):`<tr><td colspan="5" class="empty">Wala pang naitalang transaksyon.</td></tr>`;document.getElementById('dueList').innerHTML=due.length?due.sort((a,b)=>totals(b.id).balance-totals(a.id).balance).slice(0,6).map(c=>`<div class="customer-row"><div><b>${esc(c.name)}</b><span class="sub">${esc(c.phone||'Walang contact number')}</span></div><div class="amount">${money(totals(c.id).balance)}</div></div>`).join(''):'<div class="empty">Walang customer na may natitirang utang. 🎉</div>';renderCustomers();renderTransactions();document.getElementById('storeName').value=db.settings.storeName||'';document.getElementById('ownerName').value=db.settings.ownerName||'';document.getElementById('storePhone').value=db.settings.storePhone||''}
function renderCustomers(){let q=(document.getElementById('customerSearch')?.value||'').toLowerCase(),f=document.getElementById('customerFilter')?.value||'all';let list=db.customers.filter(c=>c.name.toLowerCase().includes(q)||String(c.phone||'').includes(q)).filter(c=>f==='all'||(f==='due'?totals(c.id).balance>0:totals(c.id).balance===0));document.getElementById('customerList').innerHTML=list.length?list.map(c=>{let t=totals(c.id);return `<div class="customer-row"><div style="min-width:0"><b>${esc(c.name)}</b><span class="sub">${esc(c.phone||'No contact')} · ${esc(c.address||'No address')}</span><span class="sub">${t.balance>0?'May natitirang utang':'Walang balanse'}</span></div><div style="text-align:right;white-space:nowrap"><div class="amount">${money(t.balance)}</div><button class="btn light small" onclick="viewCustomer('${c.id}')">Tingnan</button></div></div>`}).join(''):'<div class="empty">Walang customer na nakita. Magdagdag ng bagong customer.</div>'}
function renderTransactions(){let q=(document.getElementById('txSearch')?.value||'').toLowerCase(),f=document.getElementById('txType')?.value||'all';let list=[...db.transactions].sort((a,b)=>(b.createdAt||b.date).localeCompare(a.createdAt||a.date)).filter(t=>(f==='all'||t.type===f)&&(customerName(t.customerId).toLowerCase().includes(q)||(t.description||'').toLowerCase().includes(q)));document.getElementById('txRows').innerHTML=list.length?list.map(t=>`<tr><td>${fmtDate(t.date)}</td><td class="namecell">${esc(customerName(t.customerId))}</td><td><span class="status ${t.type==='payment'?'paid':'unpaid'}">${t.type==='payment'?'Bayad':'Utang'}</span></td><td>${esc(t.description||'—')}</td><td class="amount">${money(t.amount)}</td><td class="no-print"><button class="btn red small" onclick="deleteTx('${t.id}')">Burahin</button></td></tr>`).join(''):`<tr><td colspan="6" class="empty">Wala pang transaksyon.</td></tr>`}
function fillCustomerSelect(){let s=document.getElementById('dCustomer');s.innerHTML=db.customers.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');if(!db.customers.length){s.innerHTML='<option value="">Magdagdag muna ng customer</option>'}}
function addDebtItemRow(item={}){
 const body=document.getElementById('debtItemsBody');const tr=document.createElement('tr');
 tr.innerHTML=`<td><input class="di-qty" type="number" min="0.01" step="0.01" value="${esc(item.qty??1)}" style="width:82px;padding:8px;border:1px solid var(--line);border-radius:8px"></td><td><input class="di-name" maxlength="120" value="${esc(item.name||'')}" placeholder="Hal. Nescafe 25g" style="width:100%;min-width:130px;padding:8px;border:1px solid var(--line);border-radius:8px"></td><td><input class="di-unit" maxlength="24" value="${esc(item.unit||'pcs')}" placeholder="kg / pcs / pack" style="width:90px;padding:8px;border:1px solid var(--line);border-radius:8px"></td><td><input class="di-price" type="number" min="0.01" step="0.01" value="${esc(item.price??'')}" placeholder="0.00" style="width:110px;padding:8px;border:1px solid var(--line);border-radius:8px"></td><td class="di-total amount">₱0.00</td><td><button class="btn red small" type="button" aria-label="Remove item">×</button></td>`;
 tr.querySelectorAll('input').forEach(el=>el.addEventListener('input',calcDebt));tr.querySelector('button').addEventListener('click',()=>{tr.remove();if(!body.children.length)addDebtItemRow();calcDebt()});body.appendChild(tr);calcDebt();
}
function readDebtItems(){return [...document.querySelectorAll('#debtItemsBody tr')].map(tr=>({qty:Number(tr.querySelector('.di-qty').value),name:tr.querySelector('.di-name').value.trim(),unit:tr.querySelector('.di-unit').value.trim(),price:Number(tr.querySelector('.di-price').value)})).filter(x=>x.name&&x.qty>0&&x.price>0)}
function calcDebt(){let total=0;document.querySelectorAll('#debtItemsBody tr').forEach(tr=>{let q=Number(tr.querySelector('.di-qty').value)||0,p=Number(tr.querySelector('.di-price').value)||0,v=Math.round(q*p*100)/100;total+=v;tr.querySelector('.di-total').textContent=money(v)});let el=document.getElementById('dTotal');if(el)el.textContent=money(total)}
document.getElementById('customerForm').addEventListener('submit',e=>{e.preventDefault();let name=document.getElementById('cName').value.trim();if(!name)return;db.customers.push({id:uid(),name,phone:document.getElementById('cPhone').value.trim(),address:document.getElementById('cAddress').value.trim(),notes:document.getElementById('cNotes').value.trim(),createdAt:new Date().toISOString()});save();e.target.reset();closeModal('customerModal');toast('Nadagdag ang customer!')});
document.getElementById('debtForm').addEventListener('submit',e=>{e.preventDefault();let customerId=document.getElementById('dCustomer').value,items=readDebtItems();if(!customerId||!items.length)return toast('Maglagay ng kahit isang item na may quantity at presyo.');let amount=Math.round(items.reduce((a,x)=>a+x.qty*x.price,0)*100)/100;let date=document.getElementById('dDate').value||today(),time=document.getElementById('dTime').value||new Date().toTimeString().slice(0,5),notes=document.getElementById('dNotes').value.trim();let description=items.map(x=>`${x.qty} ${x.unit} ${x.name} (${money(x.price)} bawat ${x.unit}) = ${money(x.qty*x.price)}`).join('; ')+(notes?' — '+notes:'');db.transactions.push({id:uid(),customerId,type:'debt',items,description,amount,date,time,createdAt:new Date().toISOString()});save();e.target.reset();closeModal('debtModal');toast('Naitala ang daily list ng utang!')});
function viewCustomer(id){let c=db.customers.find(x=>x.id===id);if(!c)return;let t=totals(id),tx=[...db.transactions].filter(x=>x.customerId===id).sort((a,b)=>a.date.localeCompare(b.date));document.getElementById('detailName').textContent=c.name;document.getElementById('detailContent').innerHTML=`<p class="muted">${esc(c.phone||'Walang contact number')} ${c.address?' · '+esc(c.address):''}</p><div class="detail-total"><span>Natitirang balanse</span><strong>${money(t.balance)}</strong></div><div class="actions no-print"><button class="btn" onclick="startPayment('${id}')">＋ Magtala ng Bayad</button><button class="btn light" onclick="startDebtFor('${id}')">＋ Dagdag Utang</button><button class="btn outline" onclick="printCustomer('${id}')">🖨 Print Ledger</button></div><h3 style="font-size:14px;margin-top:20px">Ledger History</h3><div class="table-wrap"><table style="min-width:0"><thead><tr><th>Petsa</th><th>Detalye</th><th>Halaga</th></tr></thead><tbody>${tx.length?tx.map(x=>`<tr><td>${fmtDate(x.date)}<span class="sub">${esc(x.time||'')}</span></td><td>${x.type==='payment'?'Bayad: ':'Utang: '}${x.items?.length?x.items.map(i=>`${esc(i.qty)} ${esc(i.unit||'')} ${esc(i.name)} × ${money(i.price)} = ${money(i.qty*i.price)}`).join('<br>'):esc(x.description)}</td><td class="amount">${x.type==='payment'?'-':'+'}${money(x.amount)}</td></tr>`).join(''):'<tr><td colspan="3" class="empty">Wala pang history.</td></tr>'}</tbody></table></div><p class="hint">Total utang: ${money(t.debt)} · Total bayad: ${money(t.paid)}</p><div class="actions no-print"><button class="btn red small" onclick="deleteCustomer('${id}')">Burahin ang Customer</button></div>`;openModal('customerDetailModal')}
function startPayment(id){let c=db.customers.find(x=>x.id===id),t=totals(id);if(!c||t.balance<=0)return toast('Walang natitirang balanse.');closeModal('customerDetailModal');document.getElementById('pCustomer').value=id;document.getElementById('pName').value=c.name;document.getElementById('pBalance').textContent=money(t.balance);document.getElementById('pAmount').max=t.balance.toFixed(2);document.getElementById('pAmount').value=t.balance.toFixed(2);document.getElementById('pDate').value=today();openModal('paymentModal')}
function startDebtFor(id){closeModal('customerDetailModal');openModal('debtModal');document.getElementById('dCustomer').value=id}
document.getElementById('paymentForm').addEventListener('submit',e=>{e.preventDefault();let id=document.getElementById('pCustomer').value,amount=Math.round(Number(document.getElementById('pAmount').value)*100)/100,b=totals(id).balance;if(amount<=0||amount>b+0.001)return toast('Hindi puwedeng lumampas sa natitirang balanse.');db.transactions.push({id:uid(),customerId:id,type:'payment',description:document.getElementById('pNotes').value.trim()||'Payment received',amount,date:document.getElementById('pDate').value||today(),createdAt:new Date().toISOString()});save();closeModal('paymentModal');toast('Naitala ang bayad!')});
function deleteTx(id){if(!confirm('Sigurado ka bang buburahin ang transaksyong ito?'))return;db.transactions=db.transactions.filter(t=>t.id!==id);save();toast('Nabura ang transaksyon.')}
function deleteCustomer(id){if(!confirm('Burahin ang customer at lahat ng kanyang utang/bayad history?'))return;db.customers=db.customers.filter(c=>c.id!==id);db.transactions=db.transactions.filter(t=>t.customerId!==id);closeModal('customerDetailModal');save();toast('Nabura ang customer at records.')}
function saveSettings(){db.settings={storeName:document.getElementById('storeName').value.trim(),ownerName:document.getElementById('ownerName').value.trim(),storePhone:document.getElementById('storePhone').value.trim()};save();toast('Na-save ang settings!')}
function exportBackup(){let blob=new Blob([JSON.stringify({...db,backupCreatedAt:new Date().toISOString(),app:'SukiLedger'},null,2)],{type:'application/json'}),a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='SukiLedger-Backup-'+today()+'.json';a.click();URL.revokeObjectURL(url);toast('Na-download ang backup.')}
function restoreBackup(e){let file=e.target.files[0];if(!file)return;let r=new FileReader();r.onload=()=>{try{let d=JSON.parse(r.result);if(!Array.isArray(d.customers)||!Array.isArray(d.transactions))throw Error();if(!confirm('Papaltan ng backup na ito ang kasalukuyang records sa device na ito. Ituloy?'))return;db={customers:d.customers,transactions:d.transactions,settings:d.settings||blank().settings};save();toast('Matagumpay ang restore!')}catch(err){alert('Hindi valid na SukiLedger backup file.')}};r.readAsText(file);e.target.value=''}
function clearAll(){if(!confirm('Babala: buburahin ang LAHAT ng customer, utang, at bayad sa account mo sa cloud. Mag-backup muna kung kailangan. Ituloy?'))return;if(!confirm('Sigurado ka na? Hindi na ito maibabalik maliban kung may backup.'))return;db=blank();save();toast('Nabura na ang local records.')}
function printReport(){showPage('dashboard');window.print()}
function printCustomer(id){let c=db.customers.find(x=>x.id===id);if(!c)return;let t=totals(id),tx=db.transactions.filter(x=>x.customerId===id).sort((a,b)=>a.date.localeCompare(b.date));let w=window.open('','_blank');if(!w)return alert('Payagan ang pop-up para makapag-print.');w.document.write(`<html><head><title>Ledger - ${esc(c.name)}</title><style>body{font:14px Arial;padding:30px;color:#222}h2,p{text-align:center}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ccc;padding:9px;text-align:left}.right{text-align:right}.sum{margin-top:18px;text-align:right;font-weight:bold}small{color:#555}</style></head><body><h2>${esc(db.settings.storeName||'SUKILEDGER')}</h2><p>INDIVIDUAL CUSTOMER LEDGER</p><b>Customer:</b> ${esc(c.name)}<br><b>Contact:</b> ${esc(c.phone||'—')}<br><b>Address:</b> ${esc(c.address||'—')}<table><tr><th>Date</th><th>Type</th><th>Details</th><th class="right">Amount</th></tr>${tx.map(x=>`<tr><td>${fmtDate(x.date)}</td><td>${x.type==='payment'?'Payment':'Utang'}</td><td>${x.items?.length?x.items.map(i=>`${esc(i.qty)} ${esc(i.unit||'')} ${esc(i.name)} × ${money(i.price)} = ${money(i.qty*i.price)}`).join('<br>'):esc(x.description)}${x.time?' <small>'+esc(x.time)+'</small>':''}</td><td class="right">${money(x.amount)}</td></tr>`).join('')}</table><div class="sum">Total Utang: ${money(t.debt)}<br>Total Bayad: ${money(t.paid)}<br>Balance: ${money(t.balance)}</div><p style="text-align:left;margin-top:55px">_____________________________<br>Lagda ng Customer</p><small>Printed: ${new Date().toLocaleString('en-PH')}</small><script>window.onload=()=>window.print()<\/script></body></html>`);w.document.close()}
document.getElementById('loginForm').addEventListener('submit',async e=>{
 e.preventDefault();authMessage('Nagla-login...',false);
 const {data,error}=await supabase.auth.signInWithPassword({email:document.getElementById('loginEmail').value.trim(),password:document.getElementById('loginPassword').value});
 if(error){authMessage(error.message);return;}await activateSession(data.user);
});
document.getElementById('signupForm').addEventListener('submit',async e=>{
 e.preventDefault();
 const email=document.getElementById('signupEmail').value.trim(),password=document.getElementById('signupPassword').value;
 if(password!==document.getElementById('signupPassword2').value){authMessage('Hindi magkapareho ang password.');return;}
 authMessage('Ginagawa ang account...',false);
 const {data,error}=await supabase.auth.signUp({email,password});
 if(error){authMessage(error.message);return;}
 if(data.session&&data.user){authMessage('Matagumpay ang account creation!',false);await activateSession(data.user);}
 else{authMessage('Account created! Tingnan ang email para i-confirm, pagkatapos ay mag-login.',false);showAuthPanel('loginPanel');}
});
async function initAuth(){
 if(!window.supabase||!window.SUKILEDGER_SUPABASE_URL||window.SUKILEDGER_SUPABASE_URL.includes('PASTE_')||!window.SUKILEDGER_SUPABASE_ANON_KEY||window.SUKILEDGER_SUPABASE_ANON_KEY.includes('PASTE_')){
  authMessage('Kailangan munang ilagay ang Supabase Project URL at anon key sa config.js.');return;
 }
 window.supabase=window.supabase.createClient(window.SUKILEDGER_SUPABASE_URL,window.SUKILEDGER_SUPABASE_ANON_KEY);
 const {data:{session}}=await supabase.auth.getSession();
 if(session?.user)await activateSession(session.user);
 supabase.auth.onAuthStateChange(async(event,session)=>{
  if(session?.user&&(!currentUser||currentUser.id!==session.user.id))await activateSession(session.user);
  if(!session&&currentUser){currentUser=null;db=blank();document.body.classList.remove('authenticated');document.getElementById('authGate').style.display='grid';}
 });
}
initAuth();
if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
if(!window.isSecureContext && location.protocol!=='file:')console.warn('PWA installation needs HTTPS or localhost.');
