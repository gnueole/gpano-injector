# Geo Pano Injector

**Geo Pano Injector** is a suite of tools designed to inject **Google Photo Sphere (GPano)** XMP metadata into JPEG images. This metadata ensures that your 360° panoramic images are correctly recognized and displayed by Google Photos, Facebook, and other compatible 360° viewers. For more details on the metadata used, refer to the [Google Photo Sphere XMP Metadata documentation](https://developers.google.com/streetview/spherical-metadata).

This repository contains two distinct implementations to suit your workflow:

## Subprojects

### 1. [gpanojs](./gpanojs) (Web Interface)
A modern, minimalist web-based tool that runs entirely in your browser.
- **Features**: Drag & drop interface, EXIF/XMP viewer, dark mode, and instant download.
- **Usage**: Simply open `gpanojs/index.html` in any web browser. No installation required.
- **Output**: Saves images with a `-360web` suffix.

### 2. [gpanopy](./gpanopy) (Python CLI)
A powerful command-line interface tool for batch processing and automation.
- **Features**: Read metadata, inject GPano tags, and configure advanced parameters like Heading, Pitch, Roll, and Field of View.
- **Usage**: Run via `python gpanopy.py`. Requires Python and Pillow.
- **Output**: Saves images with a `-360` suffix and preserves maximum quality.

## Authors
Antigravity & Éole <hi@eole.me>
