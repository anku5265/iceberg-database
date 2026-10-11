import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

pdf_path = r"d:\icebergdb\HP_POLICE_GROUND_MASTER_BLUEPRINT.pdf"

doc = SimpleDocTemplate(
    pdf_path,
    pagesize=A4,
    leftMargin=28,
    rightMargin=28,
    topMargin=22,
    bottomMargin=22
)

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Heading1'],
    fontName='Helvetica-Bold',
    fontSize=17,
    leading=21,
    textColor=colors.HexColor('#0f172a'),
    alignment=1
)

subtitle_style = ParagraphStyle(
    'DocSubtitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=10,
    leading=13,
    textColor=colors.HexColor('#1e40af'),
    alignment=1
)

sec_heading = ParagraphStyle(
    'SecHeading',
    parent=styles['Heading2'],
    fontName='Helvetica-Bold',
    fontSize=11.5,
    leading=14.5,
    textColor=colors.HexColor('#0f172a'),
    spaceAfter=5,
    spaceBefore=7
)

body = ParagraphStyle(
    'BodyCustom',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=11.5,
    textColor=colors.HexColor('#1e293b')
)

q_style = ParagraphStyle(
    'Question',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=9,
    leading=12,
    textColor=colors.HexColor('#1e3a8a')
)

ans_style = ParagraphStyle(
    'Answer',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=11.5,
    textColor=colors.HexColor('#334155')
)

table_header = ParagraphStyle(
    'TH',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=8.5,
    leading=11,
    textColor=colors.white
)

table_body = ParagraphStyle(
    'TB',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8,
    leading=10.5,
    textColor=colors.HexColor('#1e293b')
)

table_body_bold = ParagraphStyle(
    'TBB',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=8,
    leading=10.5,
    textColor=colors.HexColor('#0f172a')
)

elements = []

# ==================== PAGE 1 ====================
elements.append(Paragraph("HP POLICE RECRUITMENT 2026 — GROUND MASTER BLUEPRINT", title_style))
elements.append(Spacer(1, 2))
elements.append(Paragraph("Candidate: <b>ANKUSH</b> &nbsp;|&nbsp; Venue: <b>Police Line Bashing (Kullu)</b> &nbsp;|&nbsp; Target: <b>12-17 Nov 2026</b>", subtitle_style))
elements.append(Spacer(1, 4))
elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563eb'), spaceBefore=2, spaceAfter=8))

# Status Dashboard Table
status_data = [
    [
        Paragraph("<b>HIGH JUMP</b><br/><font color='#059669'><b>CLEARED (1.25m+)</b></font>", body),
        Paragraph("<b>LONG JUMP</b><br/><font color='#059669'><b>CLEARED (4.0m+)</b></font>", body),
        Paragraph("<b>100M SPRINT</b><br/><font color='#0284c7'><b>READY (~14.0s)</b></font>", body),
        Paragraph("<b>1500M RACE</b><br/><font color='#dc2626'><b>TARGET: &lt; 5:30 MIN</b></font>", body),
    ]
]
status_table = Table(status_data, colWidths=[134, 134, 134, 137])
status_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
    ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
    ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
]))
elements.append(status_table)
elements.append(Spacer(1, 10))

# SECTION 1: CRITICAL QUESTIONS
elements.append(Paragraph("1. CRITICAL ANSWERS: SUBAH/SHAAM SPLIT & ROAD RUNNING", sec_heading))

q1_data = [
    [Paragraph("<b>Q1: Subah aur Shaam SAME workout karna hai ya alag?</b>", q_style)],
    [Paragraph("<b>ALAG KARNA HAI! Dono time heavy 1500m intervals KABHI mat karna!</b><br/>"
               "• <b>Subah (MAIN SESSION):</b> Full Running Workout + Warm-up + Sprints (Police test subah hi hota hai, isliye subah daudna biological clock aur lungs ke liye best hai).<br/>"
               "• <b>Shaam (LIGHT RECOVERY):</b> Sirf 10 min paidal walk/light jog + 4-5 attempts High Jump & Long Jump technique practice + Core (Planks, Squats) + Stretching.<br/>"
               "<i>(Agar subah kisi din miss ho jaye, tabhi shaam ko main running karni hai. Ek din mein 2 baar hard running karne se pair jamte hain aur overtraining se stamina girta hai).</i>", ans_style)]
]
t_q1 = Table(q1_data, colWidths=[539])
t_q1.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#eff6ff')),
    ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#bfdbfe')),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('LEFTPADDING', (0,0), (-1,-1), 10),
    ('RIGHTPADDING', (0,0), (-1,-1), 10),
]))
elements.append(t_q1)
elements.append(Spacer(1, 8))

q2_data = [
    [Paragraph("<b>Q2: Marathon wale toh Road par daudte hain, toh hum road par kyun na daudein?</b>", q_style)],
    [Paragraph("<b>Marathon aur Police 1500m mein zameen-aasmaan ka farak hai:</b><br/>"
               "1. <b>Surface Match:</b> Marathon road par hoti hai. Tumhari Police Bharti <b>Bashing ke MITTI / GROUND track</b> par hogi. Mitti par grip aur pairon ka balance road se alag hota hai.<br/>"
               "2. <b>Speed & Impact:</b> Marathon runners aaram se (slow jog) 5-6 min/km ki speed se daudte hain aur unke paas 20,000 rupaye ke thick carbon-cushion shoes hote hain. Tumhe 1500m mein <b>3 min 40 sec/km ki explosive speed</b> par daudna hai! Road par itni tezi se daudne se <b>Shin Splints (pindli ki haddi mein chubhan wala dard)</b> ho jata hai jo 15-20 din theek nahi hota!", ans_style)]
]
t_q2 = Table(q2_data, colWidths=[539])
t_q2.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#fef2f2')),
    ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#fecaca')),
    ('TOPPADDING', (0,0), (-1,-1), 6),
    ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ('LEFTPADDING', (0,0), (-1,-1), 10),
    ('RIGHTPADDING', (0,0), (-1,-1), 10),
]))
elements.append(t_q2)
elements.append(Spacer(1, 10))

# SECTION 2: BREATHING & THROAT PROTECTION
elements.append(Paragraph("2. KULLU COLD AIR & GALA PROTECTION FORMULA", sec_heading))
breath_text = Paragraph(
    "<b>Thandi Hawa Aur Saans Phoolne Se Bachne Ke 2 Master Rules:</b><br/>"
    "1. <b>Jibh Taalu Par (Tongue on Roof of Mouth):</b> Daudte waqt jibh ki tip ko upar daanton ke theek peeche taalu se chipka kar rakho aur hoth halke se khule rakho. Thandi hawa direct gale par nahi lagegi — warm aur moist hokar lungs mein jayegi. Gala 0% sukhega!<br/>"
    "2. <b>Pre-Run Drink:</b> Ghar se nikalne se 20 min pehle <b>1 Cup Gunguna Paani + 1 Chammach Shehad (Honey)</b> pi lo. Shehad gale par protective layer banata hai. Saath mein 1 Kela ya thoda sa Gud khao (Khali pet acidity ya ulti aati hai).<br/>"
    "3. <b>Dual Breathing:</b> Naak + Muh dono se natural saans aane do. 2 kadam saans andar, 2 kadam bahar (In-In, Out-Out).",
    body
)
t_br = Table([[breath_text]], colWidths=[539])
t_br.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ecfdf5')),
    ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#a7f3d0')),
    ('TOPPADDING', (0,0), (-1,-1), 8),
    ('BOTTOMPADDING', (0,0), (-1,-1), 8),
    ('LEFTPADDING', (0,0), (-1,-1), 10),
    ('RIGHTPADDING', (0,0), (-1,-1), 10),
]))
elements.append(t_br)
elements.append(Spacer(1, 14))

elements.append(Paragraph("<b>MINDSET:</b> <i>Pehla 400m body daudati hai, aakhri 400m dimaag daudata hai. Ankush, tu 100% nikalega!</i>", ParagraphStyle('P1Footer', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=9, alignment=1, textColor=colors.HexColor('#4338ca'))))

# PAGE BREAK
elements.append(PageBreak())

# ==================== PAGE 2 ====================
elements.append(Paragraph("3. 10-DAY ACCELERATED 1500M TIMETABLE", sec_heading))

sched_data = [
    [
        Paragraph("<b>Din</b>", table_header),
        Paragraph("<b>Subah (Main Running Workout)</b>", table_header),
        Paragraph("<b>Shaam (Recovery & Jump Maintenance)</b>", table_header)
    ],
    [
        Paragraph("<b>Day 1 (Base)</b>", table_body_bold),
        Paragraph("Track ke <b>3 round (1200m)</b> slow continuous jog. Rukna mana hai. + 3 min rest + 2x 100m Strides.", table_body),
        Paragraph("15 min walk + High Jump 4 attempts + 20 Squats.", table_body)
    ],
    [
        Paragraph("<b>Day 2 (Lungs)</b>", table_body_bold),
        Paragraph("Track ke <b>4 round (1600m)</b> continuous rhythmic jog. Breathing rhythm pakad kar chalo.", table_body),
        Paragraph("Light stretching + Long Jump approach run practice.", table_body)
    ],
    [
        Paragraph("<b>Day 3 (Intervals)</b>", table_body_bold),
        Paragraph("<b>400m x 3 rounds</b> (Har round 1:35 min target). Beech mein 2 min paidal walk rest.", table_body),
        Paragraph("Plank (60 sec x 2) + Calf raises (25 reps x 2).", table_body)
    ],
    [
        Paragraph("<b>Day 4 (Speed)</b>", table_body_bold),
        Paragraph("100m ke 3 explosive sprints (Target: ~13.5s) + 400m easy jog finish.", table_body),
        Paragraph("High Jump & Long Jump confidence check (2-3 jumps).", table_body)
    ],
    [
        Paragraph("<b>Day 5 (Tempo)</b>", table_body_bold),
        Paragraph("<b>800m fast pace</b> (Target: 2 min 55 sec) + 3 min rest + 400m strong finish.", table_body),
        Paragraph("Light jogging + Hamstring & Quad static stretching.", table_body)
    ],
    [
        Paragraph("<b>Day 6 (Endurance)</b>", table_body_bold),
        Paragraph("<b>400m x 4 rounds</b> (Har round 1:30 min target). Beech mein 90 sec rest.", table_body),
        Paragraph("Upper body & core workout (Pushups + Squats).", table_body)
    ],
    [
        Paragraph("<b>Day 7 (REST)</b>", table_body_bold),
        Paragraph("<font color='#dc2626'><b>COMPLETE REST (NO RUNNING).</b></font> Sarson tel maalish + Garam paani.", table_body),
        Paragraph("Full rest. Sleep 9 hours.", table_body)
    ],
    [
        Paragraph("<b>Day 8 (Benchmark)</b>", table_body_bold),
        Paragraph("<b>1200m (3 rounds) Fast Timing Check</b>. Target: Under 4 min 20 sec!", table_body),
        Paragraph("Walk + Jumps form review + Deep stretching.", table_body)
    ],
    [
        Paragraph("<b>Day 9 (Active)</b>", table_body_bold),
        Paragraph("2 round easy jog + 100m sprint form check + full flexibility drills.", table_body),
        Paragraph("Mental focus + Kit inspection (shoes/socks).", table_body)
    ],
    [
        Paragraph("<b>Day 10 (TRIAL)</b>", table_body_bold),
        Paragraph("<font color='#059669'><b>🔥 OFFICIAL 1500M TRIAL WITH STOPWATCH (Target: &lt; 5:30 MIN)!</b></font>", table_body),
        Paragraph("Victory walk + Celebration!", table_body)
    ],
]

sched_table = Table(sched_data, colWidths=[80, 245, 214])
sched_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
    ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
    ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 4),
    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ('LEFTPADDING', (0,0), (-1,-1), 6),
    ('RIGHTPADDING', (0,0), (-1,-1), 6),
]))
elements.append(sched_table)
elements.append(Spacer(1, 14))

# SECTION 4: EXERCISES & DIET
elements.append(Paragraph("4. WARM-UP, STRENGTH EXERCISES & DIET", sec_heading))

ex_data = [
    [
        Paragraph("<b>PRE-RUN WARM-UP (10 Min):</b><br/>"
                  "• Neck & shoulder circles (1 min)<br/>"
                  "• Hip rotations & torso twists (2 min)<br/>"
                  "• Leg swings front/back & side (15 reps)<br/>"
                  "• High Knees & Butt Kicks (30s x 2)<br/>"
                  "• Ankle rolls & calf bounces (2 min)", body),
        Paragraph("<b>POST-RUN STRENGTH (10 Min):</b><br/>"
                  "• Deep Bodyweight Squats: 20 reps x 2<br/>"
                  "• Calf Raises on step: 25 reps x 2<br/>"
                  "• Walking Lunges: 15 steps (Jump boost)<br/>"
                  "• Core Plank: 60 seconds x 2 sets<br/>"
                  "• Static Stretches (Hamstring, Quads)", body),
        Paragraph("<b>DAILY RECOVERY DIET:</b><br/>"
                  "• Post-run: Bheege kaale chane + kishmish + 2-3 ande (ya doodh/paneer)<br/>"
                  "• Hydration: 3.5 - 4 Litre paani din bhar<br/>"
                  "• Night: 1 glass gunguna haldi doodh (turmeric milk) with black pepper", body)
    ]
]
ex_table = Table(ex_data, colWidths=[175, 184, 180])
ex_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
    ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
    ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
    ('TOPPADDING', (0,0), (-1,-1), 7),
    ('BOTTOMPADDING', (0,0), (-1,-1), 7),
    ('LEFTPADDING', (0,0), (-1,-1), 8),
    ('RIGHTPADDING', (0,0), (-1,-1), 8),
]))
elements.append(ex_table)
elements.append(Spacer(1, 14))

elements.append(Paragraph("<b>HP POLICE 2026 MISSION READY</b> • <i>Himachal Police Vardi Pakki Hai Bhai!</i>", ParagraphStyle('P2Footer', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10, alignment=1, textColor=colors.HexColor('#15803d'))))

doc.build(elements)
print("SUCCESS: 2-page balanced PDF created at", pdf_path, "Size:", os.path.getsize(pdf_path), "bytes")
