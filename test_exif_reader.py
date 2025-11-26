import unittest
import os
import subprocess
import sys
from exif_reader import get_exif_data, MAX_FILE_SIZE


class TestExifReader(unittest.TestCase):
    def setUp(self):
        self.test_file = "test_exif.jpg"
        self.large_file = "large_test.jpg"
        # Ensure test files exist
        if not os.path.exists(self.test_file) or not os.path.exists(self.large_file):
            # Run the generator if missing (though they should be there)
            subprocess.run([sys.executable, "create_test_files.py"], check=True)

    def test_get_exif_data(self):
        """Test that we can read EXIF data from a valid file."""
        data = get_exif_data(self.test_file)
        self.assertIsNotNone(data)
        self.assertIn("ImageDescription", data)
        self.assertEqual(data["ImageDescription"], "Test Image")

    def test_cli_help(self):
        """Test that running without args prints help."""
        result = subprocess.run(
            [sys.executable, "exif_reader.py"], capture_output=True, text=True
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("usage: exif_reader.py", result.stdout)

    def test_cli_version(self):
        """Test -v option."""
        result = subprocess.run(
            [sys.executable, "exif_reader.py", "-v"], capture_output=True, text=True
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("Antigravity EXIF Reader", result.stdout)

    def test_cli_valid_file(self):
        """Test -f with valid file."""
        result = subprocess.run(
            [sys.executable, "exif_reader.py", "-f", self.test_file],
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("Processing file:", result.stdout)
        self.assertIn("ImageDescription", result.stdout)

    def test_cli_large_file(self):
        """Test -f with large file fails."""
        result = subprocess.run(
            [sys.executable, "exif_reader.py", "-f", self.large_file],
            capture_output=True,
            text=True,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("exceeds the limit", result.stdout)

    def test_cli_missing_file(self):
        """Test -f with missing file."""
        result = subprocess.run(
            [sys.executable, "exif_reader.py", "-f", "nonexistent.jpg"],
            capture_output=True,
            text=True,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("not found", result.stdout)

    def test_cli_positional_arg(self):
        """Test file passed as positional argument."""
        result = subprocess.run(
            [sys.executable, "exif_reader.py", self.test_file],
            capture_output=True,
            text=True,
        )
        self.assertEqual(result.returncode, 0)
        self.assertIn("Processing file:", result.stdout)
        self.assertIn("ImageDescription", result.stdout)

    def test_photosphere_xmp(self):
        """Test -e option for Photosphere XMP with granular checks."""
        output_file = "test_exif-360.jpg"

        # 1. Ensure cleanup and initial state
        if os.path.exists(output_file):
            os.remove(output_file)

        # Verify source file does NOT have GPano tags
        with open(self.test_file, "rb") as f:
            content = f.read()
            self.assertNotIn(
                b"GPano:ProjectionType",
                content,
                "Source file should not have GPano tags yet",
            )

        # 2. Run command with -e BEFORE the file argument as requested
        result = subprocess.run(
            [sys.executable, "exif_reader.py", "-e", self.test_file],
            capture_output=True,
            text=True,
        )

        # 3. Verify execution success
        self.assertEqual(result.returncode, 0)
        self.assertIn("Successfully created Photosphere image", result.stdout)
        self.assertTrue(os.path.exists(output_file), "Output file was not created")

        # 4. Verify Output file HAS GPano tags
        with open(output_file, "rb") as f:
            content = f.read()
            self.assertIn(
                b"GPano:ProjectionType", content, "Output file missing GPano tags"
            )
            self.assertIn(
                b"equirectangular", content, "Output file missing equirectangular tag"
            )

        # 5. Cleanup (Revert to initial state)
        if os.path.exists(output_file):
            os.remove(output_file)

    def test_advanced_xmp_params(self):
        """Test advanced XMP parameters (heading, pitch, roll, fov)."""
        output_file = "test_exif-360.jpg"
        if os.path.exists(output_file):
            os.remove(output_file)

        # Run with advanced params
        cmd = [
            sys.executable,
            "exif_reader.py",
            "-e",
            self.test_file,
            "--heading",
            "180.5",
            "--pitch",
            "10",
            "--roll",
            "-5",
            "--fov",
            "90",
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)

        self.assertEqual(result.returncode, 0)
        self.assertTrue(os.path.exists(output_file))

        with open(output_file, "rb") as f:
            content = f.read()
            # Check for new tags
            self.assertIn(b"GPano:PoseHeadingDegrees>180.5", content)
            self.assertIn(b"GPano:PosePitchDegrees>10.0", content)
            self.assertIn(b"GPano:PoseRollDegrees>-5.0", content)
            self.assertIn(b"GPano:InitialHorizontalFOVDegrees>90.0", content)

        if os.path.exists(output_file):
            os.remove(output_file)


if __name__ == "__main__":
    unittest.main()
