def membership_section(lang):
 en=lang=='en';p='/en/' if en else '/';t=lambda es,eng:eng if en else es
 return f'''<section class="membership-section px-gutter" id="memberships" aria-labelledby="membership-heading"><div class="section-rule"><span>04 / {t('MEMBRESÍAS','MEMBERSHIPS')}</span><span>MXN</span></div><div class="membership-heading"><h2 id="membership-heading">{t('ENCUENTRA<br>TU PLAN.','FIND<br>YOUR PLAN.')}</h2><p>{t('Elige quién entrena, tu membresía y tu frecuencia semanal.','Choose who is training, your membership, and your weekly allowance.')}</p></div><div id="plan-finder"><noscript>{t('Activa JavaScript para comparar planes.','Enable JavaScript to compare plans.')}</noscript></div><div class="membership-actions"><div><h3>{t('¿DE VISITA?','VISITING?')}</h3><p>{t('Pase por clase','Drop-in')} · <strong>$200 MXN</strong><br>{t('Confirma las clases participantes.','Confirm eligible classes.')}</p></div><a class="membership-trial-link" href="{p}enroll/">{t('PRUEBA 3 CLASES GRATIS','TRY 3 FREE CLASSES')} {icon('arrow-up-right')}</a></div></section>'''

def membership_page(lang):
 en=lang=='en'
 return head(lang,'Memberships' if en else 'Membresías','memberships/','Membership plans in Mexican pesos.' if en else 'Planes de membresía en pesos mexicanos.')+header(lang,'memberships/')+'<main id="main">'+membership_section(lang)+'</main>'+footer(lang)
