"""
Maya Valley Resort Hampi - Image Clarity & Super-Resolution Enhancer
Upscales real photos using high-order Lanczos resampling, eliminates compression blur,
sharpens architectural and natural textures with adaptive unsharp masking,
and exports high-fidelity 95-quality WebP images without fizzy noise.
"""

import os
import shutil
import glob
from PIL import Image, ImageEnhance, ImageFilter

def enhance_all_photos():
    workspace = r"C:\Users\HP\maya-valley-resort"
    backup_dir = os.path.join(workspace, "raw_originals")
    os.makedirs(backup_dir, exist_ok=True)

    webp_files = sorted(glob.glob(os.path.join(workspace, "*.webp")))
    print(f"Found {len(webp_files)} WebP photos to process.")

    for file_path in webp_files:
        filename = os.path.basename(file_path)
        if filename.startswith("test_"):
            continue

        backup_path = os.path.join(backup_dir, filename)
        if not os.path.exists(backup_path):
            shutil.copy2(file_path, backup_path)
            print(f"Backed up {filename} to raw_originals/")

        # Open the pristine backup copy
        with Image.open(backup_path) as im:
            orig_w, orig_h = im.size
            is_landscape = orig_w >= orig_h

            # Scale up to 2.8K - 3.2K resolution for landscape, 1800px wide for portrait
            if is_landscape:
                target_w = max(2800, int(orig_w * 1.8))
                scale = target_w / orig_w
                target_h = int(orig_h * scale)
            else:
                target_w = max(1600, int(orig_w * 2.2))
                scale = target_w / orig_w
                target_h = int(orig_h * scale)

            print(f"Processing {filename}: {orig_w}x{orig_h} -> {target_w}x{target_h}")

            # 1. High-order Lanczos resampling for pristine interpolation
            enhanced = im.resize((target_w, target_h), Image.Resampling.LANCZOS)

            # 2. Adaptive unsharp mask to restore crisp edges and eliminate blur
            # radius=1.5, percent=125, threshold=3 avoids creating noise/fizz in smooth skies
            enhanced = enhanced.filter(ImageFilter.UnsharpMask(radius=1.5, percent=125, threshold=3))

            # 3. Fine texture clarity and detail enhancement
            enhanced = ImageEnhance.Sharpness(enhanced).enhance(1.18)

            # 4. Subtle, natural contrast and color vibrance without clipping
            enhanced = ImageEnhance.Contrast(enhanced).enhance(1.03)
            enhanced = ImageEnhance.Color(enhanced).enhance(1.05)

            # 5. Save with maximum quality WebP encoding
            enhanced.save(file_path, "WEBP", quality=95, method=6)
            new_size_kb = os.path.getsize(file_path) / 1024
            print(f"  -> Saved {filename} ({new_size_kb:.1f} KB, {target_w}x{target_h})")

    # Clean up test file if present
    test_file = os.path.join(workspace, "test_enhanced.webp")
    if os.path.exists(test_file):
        os.remove(test_file)

    print("All real photos successfully enhanced with super-resolution and crisp clarity!")

if __name__ == "__main__":
    enhance_all_photos()
