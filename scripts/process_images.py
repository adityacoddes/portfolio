import os
from PIL import Image, ImageEnhance

# Paths
source_dir = r"d:\From E drive\study\ML & DATA Sci\Projects\Portfolio\my images"
target_dir = r"d:\From E drive\study\ML & DATA Sci\Projects\Portfolio\assets\img"
os.makedirs(target_dir, exist_ok=True)

# List of source images and target files with processing details
images_to_process = {
    "1000632845.jpg": {
        "output_name": "aditya_vertical.webp",
        "resize_width": 400,
        "crop": None,
        "enhance_contrast": 1.1,
        "enhance_brightness": 1.05
    },
    "1000634957.jpg.jpeg": {
        "output_name": "aditya_about.webp",
        "resize_width": 600,
        "crop": None, # 3:4 crop can be done automatically during resize
        "enhance_contrast": 1.05,
        "enhance_brightness": 1.02
    },
    "1000634958.jpg.jpeg": {
        "output_name": "aditya_leadership.webp",
        "resize_width": 600,
        "crop": None,
        "enhance_contrast": 1.05,
        "enhance_brightness": 1.02
    },
    "id.png": {
        "output_name": "aditya_headshot.webp",
        "resize_width": 500,
        "crop": None,
        "enhance_contrast": 1.1,
        "enhance_brightness": 1.05
    },
    "IMG_1062.JPG.jpeg": {
        "output_name": "aditya_anchoring.webp",
        "resize_width": 600,
        "crop": None,
        "enhance_contrast": 1.05,
        "enhance_brightness": 1.0
    },
    "IMG_20260218_204940.jpg.jpeg": {
        "output_name": "aditya_event.webp",
        "resize_width": 600,
        "crop": None,
        "enhance_contrast": 1.05,
        "enhance_brightness": 1.0
    }
}

print("Starting photo processing pipeline...")

for filename, config in images_to_process.items():
    src_path = os.path.join(source_dir, filename)
    dest_path = os.path.join(target_dir, config["output_name"])
    
    if not os.path.exists(src_path):
        print(f"Warning: Source image {filename} not found, skipping.")
        continue
        
    try:
        with Image.open(src_path) as img:
            # 1. Convert to RGB if it is RGBA (e.g. PNG) and we want to output WebP
            # WebP supports RGBA, but we should make sure we keep alpha if needed
            has_alpha = (img.mode == 'RGBA')
            
            # 2. Resize maintaining aspect ratio
            w, h = img.size
            ratio = h / w
            target_width = config["resize_width"]
            target_height = int(target_width * ratio)
            
            img_resized = img.resize((target_width, target_height), Image.Resampling.LANCZOS)
            
            # 3. Enhance lighting/contrast
            if config["enhance_contrast"] != 1.0:
                enhancer = ImageEnhance.Contrast(img_resized)
                img_resized = enhancer.enhance(config["enhance_contrast"])
                
            if config["enhance_brightness"] != 1.0:
                enhancer = ImageEnhance.Brightness(img_resized)
                img_resized = enhancer.enhance(config["enhance_brightness"])
            
            # 4. Save as WebP
            img_resized.save(dest_path, "WEBP", quality=85)
            print(f"Processed: {filename} -> {config['output_name']} ({target_width}x{target_height})")
            
    except Exception as e:
        print(f"Error processing {filename}: {str(e)}")

print("Photo processing completed successfully!")
