from PIL import Image
import os

images = ["abdullah.jpg", "laiba.jpg", "arshiya.jpg", "wardah.jpg"]
path = "src/assets/team/"

for img_name in images:
    filepath = os.path.join(path, img_name)
    if not os.path.exists(filepath):
        continue
    img = Image.open(filepath)
    # resize to 1x1 to get average color
    avg_color = img.resize((1, 1)).getpixel((0, 0))
    print(f"{img_name}: {avg_color}")
