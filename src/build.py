from pathlib import Path
from html import escape
from urllib.parse import urlencode
import json,re
ROOT=Path(__file__).resolve().parent.parent
origin='https://rocian-gracie-tijuana.jkgraphix11.chatgpt.site'
PHONE='526643686611'

ICON_PATHS={
 'arrow-up-right':'M5 19 19 5M5 5h14v14',
 'arrow-right':'M4 12h16m-6-6 6 6-6 6',
 'arrow-up':'M12 20V4m-6 6 6-6 6 6',
 'sort':'M8 20V4m-4 4 4-4 4 4M16 4v16m-4-4 4 4 4-4',
 'arrow-down':'M12 4v16m-6-6 6 6 6-6',
 'plus':'M12 5v14M5 12h14',
 'close':'m6 6 12 12M6 18 18 6',
 'pause':'M8 5v14M16 5v14',
 'play':'m8 5 11 7-11 7Z',
 'menu':'M3 8h18M3 16h18',
 'slashes':'M9 4 3 20M21 4l-6 16'
}
def icon(name,cls='icon'):
 shape='<circle cx="12" cy="12" r="8"/>' if name=='dot' else '<path d="'+ICON_PATHS[name]+'"/>'
 return '<svg class="'+cls+'" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+shape+'</svg>'
def vectorize(html):
 glyphs={'↑':'arrow-up','↕':'sort','↗':'arrow-up-right','→':'arrow-right','↓':'arrow-down','×':'close','Ⅱ':'pause','▶':'play'}
 def text(m):
  d=m.group(1)
  if d.strip()=='+':d=d.replace('+',icon('plus'))
  elif d.strip()=='//':d=d.replace('//',icon('slashes'))
  for g,n in glyphs.items():d=d.replace(g,icon(n))
  return '>'+d+'<'
 return re.sub(r'>([^<>]+)<',text,html)

def wa(lang,text=None):
 return 'https://wa.me/'+PHONE+'?'+urlencode({'text':text or ('Hello! I would like to book my 3 free trial classes at Rocian Gracie Jr Tijuana.' if lang=='en' else '¡Hola! Quiero reservar mis 3 clases de prueba sin costo en Rocian Gracie Jr Tijuana.')})
def brand(prefix):
 return f'<a class="brand" href="{prefix}" aria-label="Rocian Gracie Jr Tijuana"><img src="/assets/logo.png" alt="" width="60" height="56"><span>ROCIAN GRACIE JR<small>TIJUANA / JIU JITSU</small></span></a>'
def header(lang,page):
 en=lang=='en';p='/en/' if en else '/';other=('/' if en else '/en/')+page
 labels=['Home','Programs','Schedule','Memberships','Contact'] if en else ['Inicio','Programas','Horarios','Membresías','Contacto']
 urls=[p,p+'#camino',p+'#schedule',p+'#memberships',p+'#visitanos']
 nav=''.join(f'<a href="{u}"'+(' aria-current="page"' if page and u==p+page else '')+f'>{l}</a>' for u,l in zip(urls,labels))
 close='Close' if en else 'Cerrar';code='ES' if en else 'EN'
 switch=f'<a class="lang-switch" data-language="{"es" if en else "en"}" href="{other}" lang="{"es" if en else "en"}" hreflang="{"es" if en else "en"}" aria-label="{"Cambiar a español" if en else "Switch to English"}"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/></svg>{code}</a>'
 return f'''<header class="site-header px-gutter"><div class="flex items-center justify-between gap-4 h-full">{brand(p)}<nav id="desktop-nav" aria-label="{'Main navigation' if en else 'Navegación principal'}">{nav}</nav><div class="header-actions">{switch}<a class="header-waiver" href="{p}waiver/">{'Fill out waiver' if en else 'Llenar responsiva'}</a><a class="header-trial hidden lg:flex" href="{wa(lang)}" target="_blank" rel="noopener">{'3 FREE CLASSES' if en else '3 CLASES GRATIS'} <span>↗</span></a><button class="menu-toggle" aria-controls="mobile-menu" aria-expanded="false" aria-label="{'Open menu' if en else 'Abrir menú'}">{icon('menu')}</button></div></div></header>
<dialog id="mobile-menu" class="mobile-menu" aria-label="{'Main navigation' if en else 'Navegación principal'}"><div class="mobile-menu-top">{brand(p)}<button class="mobile-menu-close" type="button">{close}<span aria-hidden="true">×</span></button></div><nav class="mobile-links">{nav}<a class="mobile-waiver" href="{p}waiver/">{'Fill out waiver' if en else 'Llenar responsiva'}</a><a href="{p}#academia">{'The academy' if en else 'La academia'}</a><a href="{p}enroll/">{'3 free classes' if en else '3 clases gratis'} {icon('arrow-up-right')}</a></nav><div class="mobile-menu-bottom"><span>PLAYAS DE TIJUANA / MX</span>{switch}</div></dialog>'''
def head(lang,title,page,description):
 p='/en/' if lang=='en' else '/'
 return f'''<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>{title} | Rocian Gracie Jr Tijuana</title><meta name="description" content="{description}"><meta name="theme-color" content="#000000"><link rel="preload" href="/assets/body.ttf" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="/style.css"><link rel="canonical" href="{origin+p+page}"><link rel="alternate" hreflang="es" href="{origin+'/'+page}"><link rel="alternate" hreflang="en" href="{origin+'/en/'+page}"><link rel="alternate" hreflang="x-default" href="{origin+'/'+page}"></head><body><a class="skip" href="#main">{'Skip to content' if lang=='en' else 'Ir al contenido'}</a>'''
def footer(lang):
 en=lang=='en';p='/en/' if en else '/'
 return f'''<footer class="site-footer px-gutter">{brand(p)}<div class="footer-links"><a href="{p}memberships/">{'Memberships' if en else 'Membresías'}</a><a href="{p}waiver/">{'Student waiver' if en else 'Carta responsiva'}</a><a href="https://www.instagram.com/rocian_gracie_jr_tijuana/" target="_blank" rel="noopener">Instagram ↗</a><a href="https://www.facebook.com/profile.php?id=61583431011046" target="_blank" rel="noopener">Facebook ↗</a></div><span>© 2026 / TIJUANA, MX</span></footer><a class="sticky-access" href="{wa(lang)}" target="_blank" rel="noopener">{icon('dot','status-dot')}<span>{'CLAIM 3 FREE CLASSES' if en else 'RESERVA 3 CLASES GRATIS'}</span><span aria-hidden="true">↗</span></a><script src="/script.js"></script></body></html>'''
exec(compile((ROOT/'src/flows.py').read_text(),'flows.py','exec'))
def schedule_rows(lang):
 en=lang=='en';t=lambda es,eng:eng if en else es
 # Transcribed from the academy's supplied timetable; only named instructors are assigned.
 rows=[
 ('adults','Kickboxing / box','Kickboxing / boxing','Adolescentes y adultos','Teens & adults','LUNES — SÁBADO','MONDAY — SATURDAY','6:00 AM','Marco'),
 ('adults','Kickboxing / box','Kickboxing / boxing','Adolescentes y adultos','Teens & adults','LUNES — SÁBADO','MONDAY — SATURDAY','7:00 — 8:30 AM','Marco'),
 ('yoga','Yoga','Yoga','','','MARTES / JUEVES','TUESDAY / THURSDAY','9:00 AM','Grecia Uref'),
 ('kids','Jiu-jitsu','Jiu-Jitsu','Toddlers · 2 a 4 años','Toddlers · ages 2–4','MIÉRCOLES / VIERNES','WEDNESDAY / FRIDAY','11:00 AM','Alejandra Padilla Duran'),
 ('open','Open Mat','Open Mat','','','SÁBADO','SATURDAY','12:00 — 2:00 PM',''),
 ('kids','Jiu-jitsu','Jiu-Jitsu','Niños · intermedios','Kids · intermediate','LUNES / MIÉRCOLES','MONDAY / WEDNESDAY','5:00 PM','Alejandra Padilla Duran'),
 ('kids','Jiu-jitsu','Jiu-Jitsu','Niños · principiantes','Kids · beginners','MARTES / JUEVES','TUESDAY / THURSDAY','5:00 PM','Alejandra Padilla Duran'),
 ('kids','Jiu-jitsu No-Gi','Jiu-Jitsu No-Gi','Niños','Kids','VIERNES','FRIDAY','5:00 PM','Alejandra Padilla Duran'),
 ('kids','Jiu-jitsu','Jiu-Jitsu','Niños · avanzados','Kids · advanced','LUNES — JUEVES','MONDAY — THURSDAY','6:15 PM','Christopher Michael Rigell'),
 ('kids','Jiu-jitsu No-Gi','Jiu-Jitsu No-Gi','Niños · avanzados','Kids · advanced','VIERNES','FRIDAY','6:15 PM','Christopher Michael Rigell'),
 ('adults','Judo','Judo','Adolescentes y adultos','Teens & adults','LUNES','MONDAY','7:30 PM','Sensei Hector Figueroa'),
 ('adults','Jiu-jitsu','Jiu-Jitsu','Adolescentes y adultos','Teens & adults','MARTES / JUEVES','TUESDAY / THURSDAY','7:30 PM','Christopher Michael Rigell'),
 ('adults','Jiu-jitsu','Jiu-Jitsu','Adolescentes y adultos · principiantes','Teens & adults · beginners','MIÉRCOLES / VIERNES','WEDNESDAY / FRIDAY','7:30 PM','Christopher Michael Rigell'),
 ('open','Open Mat','Open Mat','','','LUNES','MONDAY','8:30 PM',''),
 ('adults','Jiu-jitsu No-Gi','Jiu-Jitsu No-Gi','Adolescentes y adultos','Teens & adults','MARTES / JUEVES','TUESDAY / THURSDAY','8:30 PM','Christopher Michael Rigell'),
 ('adults','Jiu-jitsu','Jiu-Jitsu','Adolescentes y adultos · avanzados','Teens & adults · advanced','MIÉRCOLES / VIERNES','WEDNESDAY / FRIDAY','8:30 PM','Christopher Michael Rigell')]
 out=''
 def start_minutes(row):
  hour,minute=re.match(r'(\d+):(\d+)',row[7]).groups()
  return (int(hour)%12+(12 if row[7].endswith('PM') else 0))*60+int(minute)
 rows.sort(key=start_minutes)
 for group,esname,enname,eslevel,enlevel,esdays,endays,time,teacher in rows:
  label=t(eslevel,enlevel).replace(' · ', ': ')
  if label:
   audience, separator, level=label.partition(': ')
   label=audience+separator+level.capitalize() if separator else label
  name=t(esname,enname).replace('Jiu-jitsu','Jiu-Jitsu')
  if label:name+=' / '+label
  hour,minute=re.match(r'(\d+):(\d+)',time).groups()
  minutes=(int(hour)%12+(12 if time.endswith('PM') else 0))*60+int(minute)
  weekday=['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'].index(endays.split()[0])
  out+=f'<tr data-time="{minutes}" data-day="{weekday}" data-group="{group}"><th scope="row">{escape(name)}</th><td data-label="{t('Días','Days')}">{escape(t(esdays,endays).title())}</td><td data-label="{t('Horario','Time')}"><strong>{escape(time)}</strong></td><td data-label="Coach / Instructor" translate="no" class="notranslate">{escape(teacher) if teacher else '—'}</td></tr>'

 return out
def home(lang):
 en=lang=='en';p='/en/' if en else '/'
 t=lambda es,eng:eng if en else es
 desc=t('Jiu-jitsu y artes marciales en Playas de Tijuana. Niños y adultos. Reserva 3 clases de prueba sin costo por WhatsApp.','Jiu-jitsu and martial arts in Playas de Tijuana. Kids and adults. Book 3 free trial classes on WhatsApp.')
 h=head(lang,t('Jiu-jitsu brasileño y artes marciales','Brazilian Jiu-Jitsu & martial arts'),'',desc)+header(lang,'')
 h+=f'''<main id="main"><section class="hero-editorial px-gutter" aria-labelledby="hero-title"><div class="hero-meta flex justify-between items-center"><span>PLAYAS DE TIJUANA / MÉXICO</span><span class="hidden sm:block">JIU JITSU & MARTIAL ARTS</span><span>RGJ — 001</span></div><div class="hero-stage"><div class="hero-title-wrap"><p class="kicker">ROCIAN GRACIE JR. · PLAYAS DE TIJUANA</p><h1 id="hero-title" class="font-display text-hero uppercase">{t('JIU-JITSU<br>BRASILEÑO.<br><span class="hero-emphasis">DISCIPLINA<br>INQUEBRANTABLE.</span>','BRAZILIAN<br>JIU-JITSU.<br><span class="hero-emphasis">UNBREAKABLE<br>DISCIPLINE.</span>')}<span class="sr-only">{t(' en Tijuana',' in Tijuana')}</span></h1><div class="mat-stamp">TIJUANA MATS <span aria-hidden="true">↗</span></div></div><figure class="hero-portrait"><img src="/assets/hero.jpg" alt="{t('Dos atletas de jiu-jitsu en una escena de competencia','Two jiu-jitsu athletes in a competition scene')}" fetchpriority="high" width="1537" height="1023"><div class="image-cross" aria-hidden="true">+</div><figcaption>{t('EL ARTE EN MOVIMIENTO','THE ART IN MOTION')}<br><span>{t('IMAGEN EDITORIAL · EDICIÓN CON IA','EDITORIAL IMAGE · AI EDITED')}</span></figcaption><span class="vertical-type" aria-hidden="true">RESPECT THE PROCESS.</span></figure><a class="trial-ticket" href="{wa(lang)}" target="_blank" rel="noopener"><span class="ticket-caption">{t('TU PRIMER MOVIMIENTO','YOUR FIRST MOVE')}</span><strong>03</strong><span class="ticket-offer">{t('CLASES DE PRUEBA<br>SIN COSTO','FREE TRIAL<br>CLASSES')}</span><span class="ticket-arrow" aria-hidden="true">↗</span></a></div><div class="hero-foot"><span class="mono-label">{t('EL TATAMI TE ESPERA.','THE MAT IS CALLING.')}</span><p>{t('Entrenamiento de jiu-jitsu brasileño de clase mundial en Playas de Tijuana. Desarrolla tu fuerza, perfecciona tu técnica y descubre de lo que eres capaz.','World-class Brazilian Jiu-Jitsu training in Playas de Tijuana. Build strength, sharpen your technique, and discover what you’re capable of.')}</p><a href="#camino" class="down-link" aria-label="{t('Explora los programas','Explore programs')}">↓</a></div></section>
<section class="ticker-section" aria-label="{t('Disciplinas de entrenamiento','Training disciplines')}"><div class="ticker-window"><div class="ticker-track" aria-hidden="true"><div>JUDO <b>//</b> JIU-JITSU GI <b>//</b> NO-GI <b>//</b> COMBAT JUDO <b>//</b> SELF-DEFENSE <b>//</b> </div><div>JUDO <b>//</b> JIU-JITSU GI <b>//</b> NO-GI <b>//</b> COMBAT JUDO <b>//</b> SELF-DEFENSE <b>//</b> </div></div><p class="sr-only">Judo, Jiu-Jitsu Gi, No-Gi, Combat Judo, {t('defensa personal','self-defense')}.</p></div><button class="ticker-pause" type="button" aria-pressed="false" aria-label="{t('Pausar movimiento','Pause motion')}">Ⅱ</button></section>
<section id="academia" class="method-section px-gutter"><div class="section-rule"><span>01 / {t('LA METODOLOGÍA','THE METHODOLOGY')}</span><span>RGJ / TIJUANA</span></div><div class="method-grid grid md:gap-10 lg:gap-16"><div><h2 class="font-display text-section uppercase">{t('MÁS QUE<br>UN COMBATE.','MORE THAN<br>A FIGHT.')}</h2><p class="method-mantra">{t('Cuerpo. Mente. Espíritu.','Body. Mind. Spirit.')}</p></div><div class="method-copy"><p class="large-copy">{t('Raíces en Brasil. Corazón en Tijuana.','Roots in Brazil. A heart in Tijuana.')}</p><p>{t('La Metodología de Enseñanza Rocian Gracie Jr. conecta cuerpo, mente y espíritu a través del aprendizaje del jiu-jitsu. Una progresión estructurada, del primer contacto con el tatami a etapas más avanzadas.','The Rocian Gracie Jr. Teaching Methodology connects body, mind, and spirit through jiu-jitsu. A structured progression, from your first time on the mat to more advanced stages.')}</p><p>{t('Somos la unidad de Tijuana de la red Rocian Gracie Jr. Un punto de encuentro en Playas para descubrir de lo que eres capaz y seguir creciendo.','We are the Tijuana academy in the Rocian Gracie Jr network. A meeting place in Playas to discover what you are capable of and keep growing.')}</p><div class="instructor-line"><span class="mono-label">{t('PROFESOR RESPONSABLE','ACADEMY INSTRUCTOR')}</span><strong>Christopher Michael Rigell</strong><a href="https://rociangracie.com.br/unidades" target="_blank" rel="noopener">{t('Afiliación oficial','Official affiliation')} ↗</a></div></div></div></section>
<section id="camino" class="program-section px-gutter"><div class="section-rule"><span>02 / {t('ELIGE TU CAMINO','FIND YOUR DISCIPLINE')}</span><span>{t('TÉCNICA SOBRE FUERZA','TECHNIQUE OVER FORCE')}</span></div><div class="program-heading"><h2 class="font-display text-section uppercase">{t('ENTRENA<br>CON INTENCIÓN.','TRAIN WITH<br>INTENTION.')}</h2><p>{t('Tu primera clase o tu siguiente desafío.<br>Hay un punto de partida para ti.','Your first class or your next challenge.<br>There is a starting point for you.')}</p></div><div class="program-list"><article class="program-row"><div class="program-id">A / 01</div><div><h3>KIDS<br>JIU-JITSU</h3><p>{t('Un comienzo que cuenta. Consulta las edades y el grupo adecuado para tu hijo.','A beginning that matters. Ask about ages and the right group for your child.')}</p></div><div class="program-detail"><span>{t('PRINCIPIANTES / INTERMEDIOS / NO-GI','BEGINNERS / INTERMEDIATE / NO-GI')}</span><strong>5:00 PM</strong><span>{t('AVANZADOS','ADVANCED')}</span><strong>6:15 PM</strong><a href="#schedule" data-schedule-target="kids">{t('Ver horarios','View schedule')} ↗</a></div></article><article class="program-row"><div class="program-id">B / 02</div><div><h3>{t('ARTES MARCIALES<br>ADULTOS','ADULT<br>MARTIAL ARTS')}</h3><p>{t('¿Empiezas desde cero o ya entrenas? Cuéntanos de tu experiencia y encuentra tu siguiente paso.','Starting from zero or already training? Tell us about your experience and find your next step.')}</p></div><div class="program-detail disciplines"><span>JUDO</span><span>COMBAT JUDO</span><span>JIU-JITSU GI</span><span>JIU-JITSU NO-GI</span><span>{t('DEFENSA PERSONAL','SELF-DEFENSE')}</span><a href="#schedule" data-schedule-target="adults">{t('Ver horarios','View schedule')} ↗</a></div></article><article class="program-row"><div class="program-id">C / 03</div><div><h3>YOGA</h3><p>{t('Encuentra tu equilibrio. Dedica tiempo al movimiento, la respiración y la conexión contigo.','Find your balance. Make time for movement, breath, and reconnecting with yourself.')}</p></div><div class="program-detail"><span>{t('MARTES / JUEVES','TUESDAY / THURSDAY')}</span><strong>9:00 AM</strong><a href="#schedule" data-schedule-target="yoga">{t('Ver horarios','View schedule')} ↗</a></div></article></div></section>
<section class="schedule-section px-gutter" id="schedule"><div class="section-rule"><span>03 / {t('HORARIOS','THE TRAINING GRID')}</span><span>TIJUANA {t('/ HORA LOCAL','/ LOCAL TIME')}</span></div><div class="schedule-heading"><h2 class="font-display text-section uppercase">{t('LLEGA.<br>ENTRENA.<br>EVOLUCIONA.','SHOW UP.<br>PUT IN WORK.<br>EVOLVE.')}</h2><p>{t('La constancia empieza con un horario.<br>Encuentra tu momento para entrenar.','Consistency starts with a schedule.<br>Find your time on the mat.')}</p></div><div class="schedule-filters" role="group" aria-label="{t('Filtrar horario','Filter schedule')}"><button type="button" data-schedule-filter="all" aria-pressed="true">{t('TODOS','ALL CLASSES')}</button><button type="button" data-schedule-filter="kids" aria-pressed="false">KIDS</button><button type="button" data-schedule-filter="adults" aria-pressed="false">{t('ADOLESCENTES / ADULTOS','TEENS / ADULTS')}</button><button type="button" data-schedule-filter="yoga" aria-pressed="false">YOGA</button><button type="button" data-schedule-filter="open" aria-pressed="false">OPEN MAT</button></div><label class="schedule-sort-mobile">{t('Ordenar por','Sort by')}<select id="schedule-sort" aria-label="{t('Ordenar horario','Sort schedule')}">{''.join(f'<option value="{i}-{direction}"{' selected' if i==2 and direction=='asc' else ''}>{label} · {t("Ascendente","Ascending") if direction=="asc" else t("Descendente","Descending")}</option>' for i,label in enumerate([t('Programa','Program'),t('Días','Days'),t('Horario','Time'),'Coach / Instructor']) for direction in ['asc','desc'])}</select></label><div class="schedule-table-wrap"><table class="schedule-table"><caption class="sr-only">{t('Horarios de clases, hora local de Tijuana','Class schedule, Tijuana local time')}</caption><thead><tr><th scope="col"><button type="button" data-schedule-sort="0">{t('PROGRAMA','PROGRAM')} <span aria-hidden="true" class="sort-indicator">↕</span></button></th><th scope="col"><button type="button" data-schedule-sort="1">{t('DÍAS','DAYS')} <span aria-hidden="true" class="sort-indicator">↕</span></button></th><th scope="col" aria-sort="ascending"><button type="button" data-schedule-sort="2">{t('HORARIO','TIME')} <span aria-hidden="true" class="sort-indicator">↑</span></button></th><th scope="col"><button type="button" data-schedule-sort="3">COACH / INSTRUCTOR <span aria-hidden="true" class="sort-indicator">↕</span></button></th></tr></thead><tbody>{schedule_rows(lang)}</tbody></table></div><p class="schedule-note">{t('Horario de la academia, hora local de Tijuana. Confirma tu grupo antes de asistir. Las horas sin rango indican únicamente el inicio de clase.','Academy schedule, Tijuana local time. Confirm your group before attending. Times without a range indicate class start only.')}</p><p id="schedule-status" class="sr-only" aria-live="polite"></p></section>
<section class="trial-section px-gutter"><div class="trial-number" aria-hidden="true">03</div><div class="trial-content"><p class="mono-label">{t('DA EL PRIMER PASO','MAKE YOUR FIRST MOVE')}</p><h2 class="font-display uppercase">{t('CLASES DE PRUEBA.<br>SIN COSTO.','FREE CLASSES.<br>REAL EXPERIENCE.')}</h2><p>{t('Conoce la academia. Siente el entrenamiento.<br>Reserva tus 3 clases de prueba por WhatsApp.','Meet the academy. Experience the training.<br>Book your 3 free trial classes on WhatsApp.')}</p><a class="button trial-cta" href="{wa(lang)}" target="_blank" rel="noopener">{t('RESERVA TUS 3 CLASES','CLAIM YOUR 3 FREE CLASSES')} <span>↗</span></a></div><span class="trial-side" aria-hidden="true">STEP ON THE MAT.</span></section>
<section class="enrollment-editorial px-gutter"><div class="section-rule"><span>04 / {t('DALE CONTINUIDAD','MAKE IT A PRACTICE')}</span><span>{t('TU SIGUIENTE PASO','YOUR NEXT STEP')}</span></div><a class="enrollment-link" href="{p}memberships/"><span class="mono-label">01</span><div><h2>{t('MEMBRESÍAS','MEMBERSHIPS')}</h2><p>{t('Haz del entrenamiento parte de tu vida. Consulta precios y opciones.','Make training part of your life. Explore pricing and options.')}</p></div><span class="big-arrow" aria-hidden="true">↗</span></a><a class="enrollment-link" href="{p}waiver/"><span class="mono-label">02</span><div><h2>{t('CARTA RESPONSIVA','STUDENT WAIVER')}</h2><p>{t('Prepárate antes de entrenar. Procesos para adultos y padres o tutores.','Get ready before you train. Adult and parent or guardian processes.')}</p></div><span class="big-arrow" aria-hidden="true">↗</span></a></section>
<section class="faq-editorial px-gutter"><div><p class="mono-label">{t('ANTES DE EMPEZAR','BEFORE YOU START')}</p><h2 class="font-display text-section uppercase">{t('SIN<br>DUDAS.','CLEAR<br>ANSWERS.')}</h2></div><div class="faq-list">'''
 faqs=[('¿Puedo empezar sin experiencia?','Can I start with no experience?','Sí. Escríbenos para conocer las opciones para principiantes y preparar tu primera visita.','Yes. Contact us to learn about beginner options and prepare for your first visit.'),('¿Qué debo llevar?','What should I bring?','Confirma con la academia la ropa y el equipo necesarios para la clase que vas a tomar.','Check with the academy about the clothing and equipment needed for your class.'),('¿Cómo reservo mis 3 clases de prueba?','How do I book my 3 free trial classes?','Escríbenos por WhatsApp al +52 664 368 6611 para coordinar tus clases y confirmar disponibilidad.','Message us on WhatsApp at +52 664 368 6611 to arrange your classes and confirm availability.'),('¿Cuánto cuestan las membresías?','How much do memberships cost?','Consulta los planes y precios en la sección de membresías.','See the membership section for plans and prices.'),('¿Cómo puedo conocer la academia?','How can I visit the academy?','Envíanos un mensaje para coordinar una visita a P.º Playas de Tijuana 3001a, Playas de Tijuana, Triangulode Oro, 22506 Tijuana, B.C.','Send us a message to arrange a visit to P.º Playas de Tijuana 3001a, Playas de Tijuana, Triangulode Oro, 22506 Tijuana, B.C.')]
 h+=''.join(f'<details><summary>{t(a,b)}<span aria-hidden="true">+</span></summary><p>{t(c,d)}</p></details>' for a,b,c,d in faqs)
 h+=f'''</div></section><section class="mat-access px-gutter" id="visitanos"><div id="contacto"></div><div class="section-rule"><span>05 / MAT ACCESS</span><span>{t('NOS VEMOS EN PLAYAS','SEE YOU IN PLAYAS')}</span></div><div class="access-grid"><div><p class="mono-label">{t('TU LUGAR ESTÁ AQUÍ.','YOUR PLACE IS HERE.')}</p><h2 class="font-display uppercase">{t('NOS VEMOS<br>EN EL TATAMI.','SEE YOU<br>ON THE MAT.')}</h2><a class="access-phone" href="{wa(lang)}" target="_blank" rel="noopener">+52 664 368 6611 <span>↗</span></a></div><div class="location-card"><span class="map-cross" aria-hidden="true">+</span><p class="mono-label">PLAYAS DE TIJUANA / MX</p><h3>P.º PLAYAS<br>DE TIJUANA<br><span>3001a</span></h3><address>P.º Playas de Tijuana 3001a, Playas de Tijuana, Triangulode Oro, 22506 Tijuana, B.C.</address><a href="https://maps.app.goo.gl/rPpmxRjLXz66ve6u9" target="_blank" rel="noopener">{t('CÓMO LLEGAR','GET DIRECTIONS')} ↗</a></div></div><div class="access-bottom"><span>{t('TÉCNICA. DISCIPLINA. EVOLUCIÓN.','TECHNIQUE. DISCIPLINE. GROWTH.')}</span><a href="https://rociangracie.com.br/" target="_blank" rel="noopener">{t('EXPLORA NUESTRO LEGADO','EXPLORE OUR LEGACY')} ↗</a></div></section></main>'''+footer(lang)
 h=re.sub(r'<section class="enrollment-editorial.*?</section>',lambda m:membership_section(lang),h,flags=re.S)
 return h
def enrollment_links(html,lang):
 p='/en/' if lang=='en' else '/'
 # Trial and program CTAs enter enrollment; location/contact WhatsApp remains available.
 def route(m):
  tag=m.group(0)
  if 'wa.me/' not in tag:return tag
  if any(x in tag for x in ['header-trial','trial-ticket','trial-cta','sticky-access']):
   return re.sub(r'href="[^"]+"',f'href="{p}enroll/"',tag).replace(' target="_blank"','')
  return tag
 html=re.sub(r'<a\b[^>]*>',route,html)
 html=html.replace('Book your 3 free trial classes on WhatsApp.','Explore your 3 free trial classes.').replace('Reserva tus 3 clases de prueba por WhatsApp.','Explora tus 3 clases de prueba.')
 return html
exec(compile((ROOT/'src/enrollment.py').read_text(),'enrollment.py','exec'))
exec(compile((ROOT/'src/memberships.py').read_text(),'memberships.py','exec'))
for lang in ('es','en'):
 p='/en/' if lang=='en' else '/'
 for route,html in [('',home(lang)),('memberships/',membership_page(lang)),('waiver/',enrollment(lang,'waiver/')),('enroll/',enrollment(lang))]:
  out=ROOT/'dist'/p.strip('/')/route/'index.html';out.parent.mkdir(parents=True,exist_ok=True);out.write_text(vectorize(enrollment_links(html,lang)))
print('Built eight editorial bilingual pages.')
