// Version Control
const APP_VERSION = "1.3.0";

// import { writeXMP } from './vendor/jpeg-xmp-writer.js'; // Using global bundle now

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Icons
    lucide.createIcons();

    // DOM Elements
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const browseBtn = document.getElementById('browse-btn');
    const uploadSection = document.getElementById('upload-section');
    const resultsSection = document.getElementById('results-section');
    const imagePreview = document.getElementById('image-preview');
    const closePreviewBtn = document.getElementById('close-preview-btn');
    const exifGrid = document.getElementById('exif-grid');
    const themeToggle = document.getElementById('theme-toggle');
    const menuBtn = document.getElementById('menu-btn');
    const closeMenuBtn = document.getElementById('close-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const versionDisplay = document.getElementById('version-display');
    const resetBtn = document.getElementById('reset-btn');
    const gpanoBtn = document.getElementById('gpano-btn');
    const downloadBtn = document.getElementById('download-btn');

    let currentFile = null;

    // Set Version
    if (versionDisplay) {
        versionDisplay.textContent = APP_VERSION;
    }

    // --- Theme Handling ---
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });

    // --- Menu Handling ---
    function openMenu() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    }

    function closeMenu() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    }

    menuBtn.addEventListener('click', openMenu);
    closeMenuBtn.addEventListener('click', closeMenu);
    overlay.addEventListener('click', closeMenu);

    // --- File Upload Handling ---
    browseBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Drag and Drop
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
    });

    function highlight() {
        dropzone.classList.add('drag-over');
    }

    function unhighlight() {
        dropzone.classList.remove('drag-over');
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, unhighlight, false);
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    dropzone.addEventListener('click', () => {
        fileInput.click();
    });

    // --- Main Logic ---

    function handleFile(file) {
        // Validate file type
        if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
            alert('Please upload a JPEG file.');
            return;
        }

        currentFile = file;

        // Display Image
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            showResults();
        };
        reader.readAsDataURL(file);

        // Parse EXIF
        parseExif(file);
    }

    async function parseExif(file) {
        try {
            // Check if ExifReader is loaded
            if (typeof ExifReader === 'undefined') {
                throw new Error('ExifReader library not loaded. Please check your internet connection.');
            }

            exifGrid.innerHTML = '<p class="loading">Reading EXIF data...</p>';

            // Read all tags including XMP
            const tags = await ExifReader.load(file, { expanded: true });
            displayExifData(tags);
        } catch (error) {
            console.error('Error parsing EXIF:', error);
            exifGrid.innerHTML = `<div class="error-message">
                <p>Error reading EXIF data.</p>
                <small>${error.message}</small>
            </div>`;
        }
    }

    function displayExifData(tags) {
        exifGrid.innerHTML = '';

        // Helper to flatten expanded tags
        const allTags = {};

        // Add standard EXIF
        if (tags.exif) Object.assign(allTags, tags.exif);
        if (tags.gps) Object.assign(allTags, tags.gps);
        // Add XMP if available
        if (tags.xmp) {
            // XMP tags are often nested or named differently, we'll try to extract them
            // ExifReader's expanded mode puts XMP in a structured format
            // We'll just iterate over the top level XMP properties for now
            Object.entries(tags.xmp).forEach(([key, val]) => {
                allTags[`XMP: ${key}`] = val;
            });
        }

        // Also check the flat list for any XMP tags that might have leaked through or are standard
        Object.entries(tags).forEach(([key, val]) => {
            if (key !== 'exif' && key !== 'gps' && key !== 'xmp' && key !== 'file' && key !== 'thumbnail') {
                allTags[key] = val;
            }
        });

        // Filter and display relevant tags
        const skipTags = ['MakerNote', 'UserComment', 'Thumbnail', 'PrintIM', 'StripOffsets', 'StripByteCounts'];

        for (const [key, value] of Object.entries(allTags)) {
            if (skipTags.includes(key) || key.includes('Thumbnail')) continue;

            let displayValue = value.description;
            if (Array.isArray(displayValue) && displayValue.length > 1) {
                displayValue = displayValue.join(', ');
            }

            if (!displayValue && value.value) {
                displayValue = value.value;
            }

            // Handle objects (like XMP structures)
            if (typeof displayValue === 'object') {
                displayValue = JSON.stringify(displayValue);
            }

            if (displayValue) {
                const item = document.createElement('div');
                item.className = 'exif-item';
                item.innerHTML = `
                    <div class="exif-label">${key}</div>
                    <div class="exif-value">${displayValue}</div>
                `;
                exifGrid.appendChild(item);
            }
        }
    }

    function showResults() {
        uploadSection.classList.add('hidden');
        uploadSection.style.display = 'none';
        resultsSection.classList.remove('hidden');
        downloadBtn.classList.add('hidden'); // Ensure download is hidden initially
    }

    function resetView() {
        resultsSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        uploadSection.style.display = 'flex';

        // Reset inputs and state
        fileInput.value = '';
        imagePreview.src = '';
        exifGrid.innerHTML = '';
        currentFile = null;
        downloadBtn.classList.add('hidden');
    }

    // Close Preview (same as reset)
    closePreviewBtn.addEventListener('click', resetView);
    resetBtn.addEventListener('click', resetView);

    // --- GPano Logic ---
    gpanoBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        try {
            gpanoBtn.disabled = true;
            gpanoBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Processing...';
            lucide.createIcons();

            // Get image dimensions
            const width = imagePreview.naturalWidth;
            const height = imagePreview.naturalHeight;

            if (!width || !height) {
                throw new Error("Could not determine image dimensions.");
            }

            // Read file as ArrayBuffer
            const arrayBuffer = await currentFile.arrayBuffer();

            // Construct XMP Metadata
            const xmpData = {
                'GPano:UsePanoramaViewer': 'True',
                'GPano:ProjectionType': 'equirectangular',
                'GPano:PoseHeadingDegrees': '0.0',
                'GPano:PosePitchDegrees': '0.0',
                'GPano:PoseRollDegrees': '0.0',
                'GPano:InitialViewHeadingDegrees': '0.0',
                'GPano:InitialViewPitchDegrees': '0.0',
                'GPano:InitialViewRollDegrees': '0.0',
                'GPano:InitialHorizontalFOV': '75.0',
                'GPano:CroppedAreaLeftPixels': '0',
                'GPano:CroppedAreaTopPixels': '0',
                'GPano:CroppedAreaImageWidthPixels': width,
                'GPano:CroppedAreaImageHeightPixels': height,
                'GPano:FullPanoWidthPixels': width,
                'GPano:FullPanoHeightPixels': height
            };

            // Write XMP
            const newBuffer = writeXMP(arrayBuffer, xmpData);

            // Create new Blob and display
            const newBlob = new Blob([newBuffer], { type: 'image/jpeg' });
            const newUrl = URL.createObjectURL(newBlob);

            imagePreview.src = newUrl;

            // Construct new filename
            const originalName = currentFile.name;
            const nameParts = originalName.split('.');
            const ext = nameParts.pop();
            const baseName = nameParts.join('.');
            const newName = `${baseName}-360web.${ext}`;

            currentFile = new File([newBlob], newName, { type: 'image/jpeg' });

            // Refresh EXIF display
            parseExif(currentFile);

            // Show Download Button
            downloadBtn.classList.remove('hidden');
            downloadBtn.onclick = () => {
                const link = document.createElement('a');
                link.href = newUrl;
                link.download = newName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            alert('GPano metadata injected successfully! The image has been updated.');

        } catch (error) {
            console.error("Error injecting GPano:", error);
            alert('Error injecting GPano metadata: ' + error.message);
        } finally {
            gpanoBtn.disabled = false;
            gpanoBtn.innerHTML = '<i data-lucide="globe"></i> Apply GPano Params';
            lucide.createIcons();
        }
    });
});
