// Editable catalog: cross-training access and family allowances await academy confirmation.
window.RGJ_PRICING={version:'proposal-1',individual:{2:800,3:1000,4:1200},family:{2:2000,3:2700,4:3200},yoga:888,programs:{martialarts:['Martial Arts','Artes marciales'],yoga:['Yoga','Yoga']}};
window.RGJQuote=function(params){
 const c=window.RGJ_PRICING,group=params.get('group')==='family'?'family':'individual',program=params.get('class')==='yoga'?'yoga':'martialarts';
 const members=group==='family'&&[2,3,4].includes(Number(params.get('members')))?Number(params.get('members')):group==='family'?2:1;
 const frequency=program==='yoga'?2:group==='family'?4:[2,3,4].includes(Number(params.get('frequency')))?Number(params.get('frequency')):2;
 const amount=program==='yoga'?c.yoga*members:group==='family'?c.family[members]:c.individual[frequency];
 return {group,program,members,frequency,amount,provisional:true};
};
window.initPlanFinder=function(){
 const root=document.getElementById('plan-finder');if(!root)return;
 const visiting=root.closest('.membership-section').querySelector('.membership-actions');
 const en=document.documentElement.lang==='en',t=(a,b)=>en?a:b,c=window.RGJ_PRICING;
 const params=window.RGJ_STANDALONE?new URL(location.hash.slice(1)||'/en/','https://local.test').searchParams:new URLSearchParams(location.search);
 let state=window.RGJQuote(params);
 const money=n=>'$'+n.toLocaleString(en?'en-US':'es-MX',{maximumFractionDigits:2});
 const query=()=>new URLSearchParams({group:state.group,class:state.program,members:String(state.members),frequency:String(state.frequency)});
 const choice=(name,value,label,selected,extra='')=>`<label class="planner-choice"><input type="radio" name="${name}" value="${value}" ${selected?'checked':''}><span>${label}</span>${extra}</label>`;
 const assumptions=()=>state.program==='yoga'?[t('Yoga is offered twice per week. Family estimates use $888 per person; any family discount must be confirmed.','Yoga se ofrece dos veces por semana. La estimación familiar usa $888 por persona; cualquier descuento familiar debe confirmarse.')]:[t('Mix any included martial arts within your weekly allowance.','Combina las artes marciales incluidas dentro de tu límite semanal.'),t('Includes Jiu-Jitsu, Judo, Kickboxing, Boxing and Self-defense. Cross-training access and the limit for 4+ sessions await academy confirmation.','Incluye Jiu-Jitsu, Judo, Kickboxing, Box y Defensa personal. El acceso combinado y el límite de 4+ sesiones requieren confirmación.'),state.group==='family'?t('Provisional family allowance: 4+ sessions per week per person; academy confirmation required.','Frecuencia familiar provisional: 4+ sesiones semanales por persona; requiere confirmación.'):null].filter(Boolean);
 const allowance=()=>state.program==='yoga'?t('2 sessions per week','2 sesiones por semana')+(state.group==='family'?' '+t('per person','por persona'):''):(state.frequency===4?'4+':state.frequency)+' '+t('sessions per week','sesiones por semana')+(state.group==='family'?' '+t('per person','por persona'):'');

 function render(focusName){
 const names=c.programs[state.program],family=state.group==='family',yoga=state.program==='yoga';
 root.innerHTML=`<div class="planner-layout"><div class="planner-steps"><fieldset><legend>01 / ${t('WHO IS TRAINING?','¿QUIÉN VA A ENTRENAR?')}</legend><div class="planner-segmented">${choice('group','individual',t('Individual','Individual'),!family)}${choice('group','family',t('Family','Familia'),family)}</div>${family?`<fieldset class="planner-members"><legend>${t('Number of family members','Número de integrantes')}</legend><div class="planner-options three">${[2,3,4].map(n=>choice('members',n,n+' '+t('people','personas'),state.members===n)).join('')}</div></fieldset><p>${t('Choose a membership category for your family.','Elige una categoría de membresía para tu familia.')}</p>`:''}</fieldset><fieldset><legend>02 / ${t('CHOOSE YOUR MEMBERSHIP','ELIGE TU MEMBRESÍA')}</legend><div class="planner-options two">${Object.entries(c.programs).map(([key,label])=>choice('class',key,label[en?0:1],key===state.program)).join('')}</div></fieldset>${yoga?'':`<fieldset><legend>03 / ${t('HOW OFTEN WILL YOU TRAIN?','¿CON QUÉ FRECUENCIA?')}</legend><div class="planner-options">${(yoga?[2]:family?[4]:[2,3,4]).map(n=>choice('frequency',n,(n===4?'4+':n)+' '+t('sessions per week','sesiones por semana')+(family?' '+t('per person','por persona'):''),state.frequency===n,`<strong>${money(yoga?c.yoga*state.members:family?c.family[state.members]:c.individual[n])}<small> MXN / ${t('month','mes')}</small></strong>`)).join('')}</div><p>${t('Available options depend on the program and membership type.','Las opciones dependen del programa y tipo de membresía.')}</p></fieldset>`}</div><div class="planner-right"><aside class="planner-summary"><p class="eyebrow">${t('YOUR PLAN','TU PLAN')}</p><div class="planner-overview" aria-live="polite" aria-atomic="true"><div class="planner-identity"><h3>${family?t('Family','Familia'):t('Individual','Individual')} · ${names[en?0:1]}</h3><div class="planner-badges"><span class="planner-badge planner-badge-people">${state.members} ${t(state.members===1?'person':'people',state.members===1?'persona':'personas')}</span><span class="planner-badge planner-badge-frequency">${allowance()}</span></div></div><div class="planner-price"><strong class="planner-total">${money(state.amount)}</strong><p>MXN / ${t('month','mes')} ${family?'· '+t('household total','total familiar'):''}</p>${family?`<p>${money(state.amount/state.members)} MXN / ${t('person per month','persona al mes')}</p>`:''}</div></div><div class="planner-inclusions"><h4>${t('INCLUDED','INCLUYE')}</h4><p>${yoga?t('Yoga membership','Membresía de Yoga'):t('Jiu-Jitsu · Judo · Kickboxing · Boxing · Self-defense','Jiu-Jitsu · Judo · Kickboxing · Box · Defensa personal')}</p>${yoga?'':`<p>${t('Mix any included martial arts within your weekly allowance.','Combina las artes marciales incluidas dentro de tu límite semanal.')}</p>`}</div><a class="button planner-select" href="#">${t('ASK ABOUT THIS PLAN','CONSULTAR ESTE PLAN')} <svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 19 19 5M5 5h14v14"/></svg></a></aside></div></div>`;
 if(visiting)root.querySelector('.planner-right').append(visiting);
 const summary=`${t('Hello, please confirm this plan:','Hola, por favor confirma este plan:')} ${family?t('Family','Familia'):'Individual'}, ${state.members} ${t('people','personas')}, ${names[en?0:1]}, ${allowance()}. ${money(state.amount)} MXN/${t('month total','mes total')}.`;
 root.querySelector('.planner-select').href='https://wa.me/526643686611?text='+encodeURIComponent(summary);
 root.querySelector('.planner-select').target='_blank';root.querySelector('.planner-select').rel='noopener';
 if(focusName)root.querySelector(`input[name="${focusName}"]:checked`)?.focus();
 }
 root.onchange=e=>{if(!e.target.matches('input[type=radio]'))return;const q=query();q.set(e.target.name,e.target.value);state=window.RGJQuote(q);render(e.target.name);};render();
};
window.initializeSite = function () {
  'use strict';
  const listeners = new AbortController();
  window.initPlanFinder();
  const en = document.documentElement.lang === 'en';
  const lang = en ? 'en' : 'es';
  const toggle = document.querySelector('.menu-toggle');
  const dialog = document.querySelector('#mobile-menu');
  let originalOverflow = '';
  const closeMenu = () => { if (dialog?.open) dialog.close(); };
  if (toggle && dialog) {
    toggle.addEventListener('click', () => {
      originalOverflow = document.body.style.overflow;
      dialog.showModal();
      document.body.style.overflow = 'hidden';
      toggle.setAttribute('aria-expanded', 'true');
      dialog.querySelector('.mobile-menu-close').focus();
    });
    dialog.querySelector('.mobile-menu-close').addEventListener('click', closeMenu);
    dialog.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    dialog.addEventListener('close', () => {
      document.body.style.overflow = originalOverflow;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 960) closeMenu(); }, {signal:listeners.signal});
  }
  document.querySelectorAll('[data-language]').forEach(a => {
    if (location.hash && !window.RGJ_STANDALONE) a.href += location.hash;
    a.addEventListener('click', () => {
      try { localStorage.setItem('rgj-language', a.dataset.language); } catch {}
    });
  });
  // Explicit language URLs always win. Save the currently selected locale for future UI use.
  try { localStorage.setItem('rgj-language', lang); } catch {}
  const isHttps = value => {
    try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; }
  };
  const isStripe = (value, host) => isHttps(value) && new URL(value).hostname === host;
  const stripeLocale = url => { const u = new URL(url); u.searchParams.set('locale', lang); return u.href; };
  const make = (tag, className, text) => { const e = document.createElement(tag); if(className)e.className=className; if(text)e.textContent=text; return e; };

  const makeIcon = (name) => {
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('class','icon');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d', {up:'M12 20V4m-6 6 6-6 6 6',down:'M12 4v16m-6-6 6 6 6-6',sort:'M8 20V4m-4 4 4-4 4 4M16 4v16m-4-4 4 4 4-4',arrow:'M5 19 19 5M5 5h14v14',play:'m8 5 11 7-11 7Z',pause:'M8 5v14M16 5v14'}[name]);
    svg.append(path);return svg;
  };
  const actionLabel=(node,text)=>node.replaceChildren(document.createTextNode(text+' '),makeIcon('arrow'));
  const link = (url, text, cls) => { const a = make('a', cls); actionLabel(a,text); a.href=url; a.target='_blank';a.rel='noopener';return a; };
  let config = null;
  const route = document.querySelector('#waiver-route');
  function renderWaiver() {
    if (!route) return;
    const type = document.querySelector('[name="student-type"]:checked')?.value === 'minor' ? 'minor' : 'adult';
    route.replaceChildren();
    route.append(make('h3','',type==='adult' ? (en?'For the adult student':'Para el alumno adulto') : (en?'For a parent or guardian':'Para el padre, la madre o el tutor')));
    route.append(make('p','',type==='adult' ? (en?'Request the adult student waiver and review it before signing.':'Solicita la carta responsiva para alumnos adultos y revísala antes de firmar.') : (en?'Ask the academy for the minor student waiver and its parent or guardian signing requirements.':'Solicita a la academia la carta responsiva para menores y los requisitos de firma del padre, madre o tutor.')));
    const target = config?.waivers?.[type]?.[lang];
    const ready = config?.waivers?.enabled === true && Boolean(config.waivers.approvedVersion?.trim()) && isHttps(target);
    const start = document.querySelector('#waiver-start');
    start.hidden = !ready;
    document.querySelector('#waiver-pending').hidden = ready;
    document.querySelector('#waiver-inquiry').hidden = ready;
    if (ready) {
      start.href = target;
      actionLabel(start,en?'Open secure waiver form':'Abrir formulario seguro');
      route.append(make('p','',en?'Continue to the academy’s signing provider to enter student details, review the approved document, and sign. Completion is confirmed by that provider.':'Continúa al proveedor de firma de la academia para ingresar los datos del alumno, revisar el documento aprobado y firmar. El proveedor confirmará la finalización.'));
    } else {
      start.removeAttribute('href');
      const message = en ? `Hello, please send me the ${type==='minor'?'minor student waiver and parent/guardian signing requirements':'adult student waiver'}.` : (type==='minor'?'Hola, ¿me comparten la carta responsiva para menores y los requisitos de firma del padre, madre o tutor?':'Hola, ¿me comparten la carta responsiva para alumnos adultos?');
      document.querySelector('#waiver-inquiry').href='https://wa.me/526643686611?text='+encodeURIComponent(message);
    }
  }
  function renderMemberships() {
    const catalog = document.querySelector('#plan-catalog');
    if (!catalog) return;
    const data=config?.memberships;
    // Plan prices and renewal/cancellation disclosures must be supplied in both languages.
    const plans=data?.enabled === true && Array.isArray(data.plans) ? data.plans.filter(p => p.name?.es && p.name?.en && p.price?.es && p.price?.en && p.terms?.es && p.terms?.en && isStripe(p.checkoutUrl,'buy.stripe.com')) : [];
    catalog.replaceChildren();
    for (const p of plans) {
      const card=make('article','plan-card');
      card.append(make('h3','',p.name[lang]),make('p','price',p.price[lang]),make('p','plan-terms',p.terms[lang]),link(stripeLocale(p.checkoutUrl),en?'Subscribe securely':'Suscribirme de forma segura','button dark'));
      catalog.append(card);
    }
    document.querySelector('#membership-pending').hidden=plans.length>0;
    if (data?.enabled === true && isStripe(data.portalUrl,'billing.stripe.com')) {
      const portal=document.querySelector('#member-portal');
      portal.href=data.portalUrl;actionLabel(portal,en?'Manage my membership':'Administrar mi membresía');
      document.querySelector('#portal-description').textContent=en?'Securely sign in with your email to manage your membership and billing through the payment provider.':'Accede de forma segura con tu correo para administrar tu membresía y pagos con el proveedor de cobro.';
    }
  }
  document.querySelectorAll('[name="student-type"]').forEach(r => r.addEventListener('change',renderWaiver));
  renderWaiver();
  if(route || document.querySelector('#plan-catalog')) {
    (window.RGJ_CONFIG ? Promise.resolve({ok:true,json:()=>Promise.resolve(window.RGJ_CONFIG)}) : fetch('/integrations.json', {cache:'no-store',signal:listeners.signal})).then(r=>{if(!r.ok)throw new Error('Configuration unavailable');return r.json();}).then(data=>{config=data;renderMemberships();renderWaiver();}).catch(()=>{
      // Fail closed: show honest availability and direct academy contact, never a success screen.
      config=null;renderMemberships();renderWaiver();
    });
  }

  const ticker = document.querySelector('.ticker-section');
  const pause = document.querySelector('.ticker-pause');
  if (pause && ticker) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) { pause.hidden = true; ticker.classList.add('is-paused'); }
    pause.addEventListener('click', () => {
      const paused = !ticker.classList.contains('is-paused');
      ticker.classList.toggle('is-paused', paused);
      pause.setAttribute('aria-pressed',String(paused));
      pause.setAttribute('aria-label', paused ? (en?'Resume motion':'Reanudar movimiento') : (en?'Pause motion':'Pausar movimiento'));
      pause.replaceChildren(makeIcon(paused?'play':'pause'));
    });
  }
  const schedule=document.querySelector('.schedule-table');
  if(schedule){
    const body=schedule.tBodies[0], controls=[...schedule.querySelectorAll('[data-schedule-sort]')];
    const mobileSort=document.querySelector('#schedule-sort');
    const collator=new Intl.Collator(en?'en':'es',{sensitivity:'base',numeric:true});
    let sortColumn=2, sortDirection='asc';
    const sortSchedule=(column,direction,announce=true)=>{
      sortColumn=column;sortDirection=direction;
      const rows=[...body.rows];
      rows.sort((a,b)=>{
        let order;
        if(column===1) order=Number(a.dataset.day)-Number(b.dataset.day);
        else if(column===2) order=Number(a.dataset.time)-Number(b.dataset.time);
        else {
          const av=a.cells[column].textContent.trim(),bv=b.cells[column].textContent.trim();
          // Keep unassigned coaches last in either direction.
          if(column===3&&(av==='—'||bv==='—'))return av===bv?0:av==='—'?1:-1;
          order=collator.compare(av,bv);
        }
        return order*(direction==='asc'?1:-1);
      });
      body.append(...rows);
      controls.forEach((button,i)=>{
        if(i===column)button.parentElement.setAttribute('aria-sort',direction==='asc'?'ascending':'descending');
        else button.parentElement.removeAttribute('aria-sort');
        button.querySelector('.sort-indicator').replaceChildren(makeIcon(i===column?(direction==='asc'?'up':'down'):'sort'));
      });
      mobileSort.value=column+'-'+direction;
      if(announce)document.querySelector('#schedule-status').textContent=en?'Schedule sorted.':'Horario ordenado.';
    };
    controls.forEach((button,i)=>button.addEventListener('click',()=>sortSchedule(i,sortColumn===i&&sortDirection==='asc'?'desc':'asc')));
    mobileSort.addEventListener('change',()=>{const [column,direction]=mobileSort.value.split('-');sortSchedule(Number(column),direction);});
    sortSchedule(2,'asc',false);
  }
  document.querySelectorAll('[data-schedule-filter]').forEach(button => button.addEventListener('click', () => {
    const filter=button.dataset.scheduleFilter;
    document.querySelectorAll('[data-schedule-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    let shown=0;
    document.querySelectorAll('.schedule-table [data-group]').forEach(row=>{row.hidden=filter!=='all'&&row.dataset.group!==filter;if(!row.hidden)shown++;});
    document.querySelector('#schedule-status').textContent=en?`${shown} schedule entries shown.`:`Se muestran ${shown} horarios.`;
  }));
  document.querySelectorAll('[data-schedule-target]').forEach(link => link.addEventListener('click', () => {
    const button=[...document.querySelectorAll('[data-schedule-filter]')].find(b=>b.dataset.scheduleFilter===link.dataset.scheduleTarget);
    if(button){button.click();button.focus({preventScroll:true});}
  }, {signal:listeners.signal}));
  return () => { closeMenu(); listeners.abort(); document.body.style.overflow=''; };
};
window.rgjCleanup = window.initializeSite();
