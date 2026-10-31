def enrollment(lang, route='enroll/'):
 waiver_only=route=='waiver/'
 en=lang=='en';p='/en/' if en else '/'
 title='Your first step<br><em>onto the mat.</em>' if en else 'Tu primer paso<br><em>al tatami.</em>'
 desc='Choose your path. Get ready to train.' if en else 'Elige tu camino. Prepárate para entrenar.'
 if waiver_only:
  title='Fill out your<br><em>student waiver.</em>' if en else 'Completa tu<br><em>carta responsiva.</em>'
  desc='Student details, emergency contact, and the academy waiver.' if en else 'Datos del alumno, contacto de emergencia y carta responsiva.'
 content=head(lang,('Waiver preview' if en else 'Vista previa de responsiva') if waiver_only else ('Enrollment preview' if en else 'Vista previa de inscripción'),route,desc)+header(lang,route)
 content=content.replace('</head>','<link rel="stylesheet" href="/enrollment.css"></head>')
 content+=f'''<main id="main" class="enroll-main px-gutter"><section class="enroll-heading"><p class="eyebrow">RGJ / {('STUDENT WAIVER' if en else 'CARTA RESPONSIVA') if waiver_only else ('NEW STUDENT ENROLLMENT' if en else 'INSCRIPCIÓN DE NUEVOS ALUMNOS')}</p><h1>{title}</h1><p>{desc}</p></section><div id="enrollment-app" data-waiver-only="{str(waiver_only).lower()}"></div><noscript>JavaScript is required for this enrollment preview. Contact the academy on WhatsApp: +52 664 368 6611.</noscript></main>'''
 content+=footer(lang)
 content=content.replace('<script src="/script.js"></script>','<script src="/script.js"></script><script src="/waiver-content.js"></script><script src="/enrollment.js"></script>')
 return content
