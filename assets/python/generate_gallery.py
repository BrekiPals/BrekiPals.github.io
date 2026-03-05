import os

# --- Config ---
FULLS_DIR = "images/fulls"
THUMBS_DIR = "images/thumbs"
OUTPUT_FILE = "gallery.html"
SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

# --- Scan the fulls folder for images ---
images = []
for filename in sorted(os.listdir(FULLS_DIR)):
    ext = os.path.splitext(filename)[1].lower()
    if ext in SUPPORTED_EXTENSIONS:
        title = os.path.splitext(filename)[0]  # filename without extension
        # Use same filename for thumb, fallback to full if not found
        thumb = filename if os.path.exists(os.path.join(THUMBS_DIR, filename)) else filename
        images.append({"full": filename, "thumb": thumb, "title": title})

# --- Generate article HTML for each image ---
articles = ""
for img in images:
    articles += f"""
        <article class="thumb">
            <a href="{FULLS_DIR}/{img['full']}" class="image">
                <img src="{THUMBS_DIR}/{img['thumb']}" alt="{img['title']}" />
            </a>
            <h2>{img['title']}</h2>
            <p></p>
        </article>"""

# --- Full HTML template ---
html = f"""<!DOCTYPE HTML>
<html>
    <head>
        <title>Myndaalbúm Breka</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
        <link rel="stylesheet" href="assets/css/main_multiverse.css" />
        <noscript><link rel="stylesheet" href="assets/css/noscript.css" /></noscript>
    </head>
    <body class="is-preload">

        <!-- Wrapper -->
        <div id="wrapper">

            <!-- Header -->
            <header id="header">
                <h1><a href="./index.html"><strong>Aftur heim</strong></a></h1>
            </header>

            <!-- Main -->
            <div id="main">
                {articles}
            </div>

        </div>

        <!-- Scripts -->
        <script src="assets/js/jquery.min.js"></script>
        <script src="assets/js/jquery.poptrox.min.js"></script>
        <script src="assets/js/browser.min.js"></script>
        <script src="assets/js/breakpoints.min.js"></script>
        <script src="assets/js/util.js"></script>
        <script src="assets/js/main.js"></script>

    </body>
</html>"""

# --- Write to file ---
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write(html)

print(f"Done! Generated {OUTPUT_FILE} with {len(images)} images.")
