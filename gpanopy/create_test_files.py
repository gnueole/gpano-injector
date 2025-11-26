from PIL import Image, ExifTags
import os


def create_test_jpg(filename):
    img = Image.new("RGB", (100, 100), color="red")
    # Create some dummy EXIF data
    # 0x010E is ImageDescription, 0x010F is Make, 0x0110 is Model
    exif_dict = {0x010E: "Test Image", 0x010F: "Antigravity Cam", 0x0110: "Model X"}
    exif = img.getexif()
    for k, v in exif_dict.items():
        exif[k] = v

    img.save(filename, exif=exif)
    print(f"Created {filename}")


def create_large_file(filename, size_mb):
    with open(filename, "wb") as f:
        f.seek(size_mb * 1024 * 1024 - 1)
        f.write(b"\0")
    print(f"Created {filename} ({size_mb}MB)")


if __name__ == "__main__":
    create_test_jpg("test_exif.jpg")
    create_large_file("large_test.jpg", 31)
