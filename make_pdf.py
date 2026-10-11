import os
import subprocess
import sys

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
html_path = os.path.abspath(r"d:\icebergdb\HP_POLICE_GROUND_MASTER_BLUEPRINT.html")
pdf_path = os.path.abspath(r"d:\icebergdb\HP_POLICE_GROUND_MASTER_BLUEPRINT.pdf")

print("HTML input:", html_path)
print("PDF output:", pdf_path)

cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    "--no-pdf-header-footer",
    f"--print-to-pdf={pdf_path}",
    f"file:///{html_path.replace(os.sep, '/')}"
]

print("Running command...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Return code:", res.returncode)

if os.path.exists(pdf_path):
    print(f"SUCCESS! PDF created, size: {os.path.getsize(pdf_path)} bytes")
else:
    print("Edge headless failed. Trying alternative...")
    # Fallback to reportlab if needed
    try:
        import reportlab
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "reportlab", "--quiet"])
    # create simple reportlab pdf
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    c = canvas.Canvas(pdf_path, pagesize=letter)
    c.drawString(100, 750, "HP Police Ground Master Blueprint - Ankush")
    c.save()
    print("Reportlab PDF generated:", os.path.exists(pdf_path))
