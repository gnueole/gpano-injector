# Antigravity EXIF Reader

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

1. Ensure you have Python installed.
2. Install the required dependencies:
   ```bash
   pip install Pillow
   ```

## Usage

### Read EXIF Data
Display the EXIF metadata for an image:
```bash
python exif_reader.py image.jpg
```
Or using the flag:
```bash
python exif_reader.py -f image.jpg
```

### Create Photosphere (360°) Image
Inject Photosphere metadata. This creates a copy of the file with the suffix `-360.jpg`.
```bash
python exif_reader.py -e image.jpg
```

### Advanced XMP Parameters
You can specify additional parameters for the 360° view:
```bash
python exif_reader.py -e image.jpg --heading 180 --pitch 10 --roll 0 --fov 90
```

### Options
- `-h`, `--help`: Show help message.
- `-v`, `--version`: Display version and signature.
- `-f FILE`, `--file FILE`: Path to the JPG file (optional if passed as positional argument).
- `-e`, `--equirectangular`: Add Photosphere XMP metadata and save as new file.
- `--heading DEG`: Set Pose Heading Degrees (0-360).
- `--pitch DEG`: Set Pose Pitch Degrees (-90 to 90).
- `--roll DEG`: Set Pose Roll Degrees (-180 to 180).
- `--fov DEG`: Set Initial Horizontal FOV Degrees (0-180).

## Testing

Run the automated test suite:
```bash
python test_exif_reader.py
```
