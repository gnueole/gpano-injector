import argparse
import os
import sys
from PIL import Image, ExifTags

VERSION = "1.1.0"
SIGNATURE = "Antigravity EXIF Reader"
MAX_FILE_SIZE = 30 * 1024 * 1024  # 30 MB


def get_exif_data(image_path):
    """
    Opens the image and extracts EXIF data.
    Returns a dictionary of {tag_name: value}.
    """
    try:
        with Image.open(image_path) as img:
            exif_data = img._getexif()

        if not exif_data:
            return None

        decoded_exif = {}
        for tag_id, value in exif_data.items():
            tag_name = ExifTags.TAGS.get(tag_id, tag_id)
            # Filter out very long binary data or maker notes for cleaner display
            if isinstance(value, bytes) and len(value) > 100:
                value = f"<Binary data: {len(value)} bytes>"
            decoded_exif[tag_name] = value

        return decoded_exif
    except Exception as e:
        print(f"Error reading EXIF data: {e}")
        return None


def add_photosphere_metadata(image_path, heading=None, pitch=None, roll=None, fov=None):
    """
    Injects Google Photosphere XMP metadata into the image and saves it as a new file.
    """
    try:
        with Image.open(image_path) as img:
            width, height = img.size

            # Optional tags
            extra_tags = ""
            if heading is not None:
                extra_tags += f"      <GPano:PoseHeadingDegrees>{heading}</GPano:PoseHeadingDegrees>\n"
            if pitch is not None:
                extra_tags += (
                    f"      <GPano:PosePitchDegrees>{pitch}</GPano:PosePitchDegrees>\n"
                )
            if roll is not None:
                extra_tags += (
                    f"      <GPano:PoseRollDegrees>{roll}</GPano:PoseRollDegrees>\n"
                )
            if fov is not None:
                extra_tags += f"      <GPano:InitialHorizontalFOVDegrees>{fov}</GPano:InitialHorizontalFOVDegrees>\n"

            # Construct XMP data
            xmp_data = f"""<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.1.0-jc003">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:GPano="http://ns.google.com/photos/1.0/panorama/">
      <GPano:ProjectionType>equirectangular</GPano:ProjectionType>
      <GPano:FullPanoWidthPixels>{width}</GPano:FullPanoWidthPixels>
      <GPano:FullPanoHeightPixels>{height}</GPano:FullPanoHeightPixels>
      <GPano:CroppedAreaImageWidthPixels>{width}</GPano:CroppedAreaImageWidthPixels>
      <GPano:CroppedAreaImageHeightPixels>{height}</GPano:CroppedAreaImageHeightPixels>
      <GPano:CroppedAreaLeftPixels>0</GPano:CroppedAreaLeftPixels>
      <GPano:CroppedAreaTopPixels>0</GPano:CroppedAreaTopPixels>
{extra_tags}    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>"""

            # Create new filename
            base, ext = os.path.splitext(image_path)
            new_filename = f"{base}-360{ext}"

            # Preserve original EXIF if present
            exif = img.getexif()

            # Save with XMP
            img.save(new_filename, "JPEG", exif=exif, xmp=xmp_data.encode("utf-8"))
            print(f"Successfully created Photosphere image: {new_filename}")
            return new_filename

    except Exception as e:
        print(f"Error adding Photosphere metadata: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(
        description="Read and display EXIF data from a JPG file."
    )
    parser.add_argument("input_file", nargs="?", help="Path to the JPG file")
    parser.add_argument("-f", "--file", help="Path to the JPG file (alternative)")
    parser.add_argument(
        "-v", "--version", action="store_true", help="Display version and signature"
    )
    parser.add_argument(
        "-e",
        "--equirectangular",
        action="store_true",
        help="Add Photosphere XMP metadata and save as new file",
    )
    # Advanced XMP arguments
    parser.add_argument("--heading", type=float, help="Pose Heading Degrees (0-360)")
    parser.add_argument("--pitch", type=float, help="Pose Pitch Degrees (-90 to 90)")
    parser.add_argument("--roll", type=float, help="Pose Roll Degrees (-180 to 180)")
    parser.add_argument(
        "--fov", type=float, help="Initial Horizontal FOV Degrees (0-180)"
    )

    # If no arguments are provided, print help
    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(0)

    args = parser.parse_args()

    if args.version:
        print(f"{SIGNATURE} v{VERSION}")
        return

    file_path = args.input_file or args.file

    if file_path:
        if not os.path.exists(file_path):
            print(f"Error: File '{file_path}' not found.")
            sys.exit(1)

        # Check file size
        file_size = os.path.getsize(file_path)
        if file_size > MAX_FILE_SIZE:
            print(
                f"Error: File size ({file_size / (1024*1024):.2f} MB) exceeds the limit of 30 MB."
            )
            sys.exit(1)

        print(f"Processing file: {file_path}")
        print("-" * 40)

        if args.equirectangular:
            add_photosphere_metadata(
                file_path,
                heading=args.heading,
                pitch=args.pitch,
                roll=args.roll,
                fov=args.fov,
            )
        else:
            exif_data = get_exif_data(file_path)

            if exif_data:
                # Find the longest key for alignment
                max_key_len = (
                    max(len(str(k)) for k in exif_data.keys()) if exif_data else 0
                )

                for key, value in sorted(exif_data.items(), key=lambda x: str(x[0])):
                    print(f"{str(key):<{max_key_len}} : {value}")
            else:
                print("No EXIF data found.")
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
