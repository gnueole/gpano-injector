# Geo Pano Injector

A Python command-line utility designed primarily to **inject and control Google Photosphere XMP metadata** for 360° panoramas. It also reads and displays EXIF and XMP metadata from JPEG files.

**Release 1.2.0 (2025-11-26)**
**Developed by: Éole (hi@eole.me)**

For more details on the metadata specification, see the [official Google Photo Sphere XMP metadata documentation](https://developers.google.com/streetview/spherical-metadata).

## Features

- **Read EXIF & XMP**: Displays EXIF and XMP metadata (including Photosphere tags) in a clean, aligned format.
- **Photosphere Support**: Inject Google Photosphere XMP metadata (`GPano`) to make images recognized as 360° panoramas by viewers like Google Photos.
- **High Quality**: Generates 360° images with maximum quality settings (100% quality, no subsampling) to preserve image fidelity.
- **Advanced XMP**: Configure Heading, Pitch, Roll, and Field of View.
- **Safety**: Includes a file size safety check (max 30MB).

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/gnueole/pyexif.git
    cd pyexif
    ```

2.  **Install dependencies:**
    This tool requires `Pillow` (PIL) for image processing.
    ```bash
    pip install Pillow
    ```

## Usage

### 1. Read EXIF and XMP Data
Display metadata from a JPG file.
```bash
python geo_pano_injector.py image.jpg
# OR
python geo_pano_injector.py -f image.jpg
```

### 2. Create a Photosphere (Inject XMP)
Inject Google Photosphere metadata into an image. This creates a new file with `-360` suffix (e.g., `image-360.jpg`).
```bash
python geo_pano_injector.py -e image.jpg
```

### 3. Advanced XMP Parameters
Control specific pose and field of view parameters.
```bash
python geo_pano_injector.py -e image.jpg --heading 180 --pitch 10 --roll 5 --fov 90
```

### 4. Check Version
```bash
python geo_pano_injector.py -v
```

## Testing

Run the automated test suite:
```bash
python test_geo_pano_injector.py
```
