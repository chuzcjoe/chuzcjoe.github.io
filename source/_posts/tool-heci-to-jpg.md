---
title: HEIC to JPG
author: Joe Chu
toc: true
widgets:
  - position: left
    type: profile
    author: Joe Chu
    author_title: I like to keep knowledge and memories visible and readable.
    location: Fremont, CA
    avatar: /img/me.jpeg
    avatar_rounded: false
    gravatar: null
    follow_link: https://github.com/chuzcjoe
    social_links:
      Github:
        icon: fab fa-github
        url: https://github.com/chuzcjoe
      Linkedin:
        icon: fab fa-linkedin
        url: https://www.linkedin.com/in/joe-chu-1784b3179/
      Scholar:
        icon: fab fa-google
        url: https://scholar.google.com/citations?user=DCwJ1qcAAAAJ&hl=en
      Dribbble:
        icon: fab fa-dribbble
        url: https://dribbble.com
      RSS:
        icon: fas fa-rss
        url: /
  - position: left
    type: toc
    index: true
    collapsed: true
    depth: 3
  - position: left
    type: null
    links:
      Hexo: https://hexo.io
      Bulma: https://bulma.io
date: 2024-11-19 21:48:29
tags: [heic, jpg]
categories:
- tool
---

A tool to convert HEIC format to JPG.

<!-- more -->

# HEIC to JPG Converter

This tool allows you to convert multiple HEIC images to JPG format directly in your browser and download them as a ZIP file.

<style>
.converter-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background-color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.options-container {
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 6px;
}

.number-input {
    width: 100px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-left: 8px;
}

.input-group {
    display: flex;
    align-items: center;
    gap: 8px;
}

.file-input-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.custom-file-input {
    display: none;
}

.file-label {
    display: inline-block;
    padding: 12px 24px;
    background-color: #f0f0f0;
    color: #333;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.3s;
    text-align: center;
    border: 2px dashed #ccc;
}

.file-label:hover {
    background-color: #e0e0e0;
}

.convert-button {
    width: 100%;
    padding: 12px 24px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: background-color 0.3s;
}

.convert-button:hover {
    background-color: #45a049;
}

.convert-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.status {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 6px;
    background-color: #f8f9fa;
    min-height: 50px;
}

.selected-files {
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #666;
}

.progress-bar {
    width: 100%;
    height: 4px;
    background-color: #f0f0f0;
    border-radius: 2px;
    margin-top: 1rem;
    overflow: hidden;
}

.progress-bar-fill {
    height: 100%;
    background-color: #4CAF50;
    width: 0%;
    transition: width 0.3s ease;
}

.drop-zone {
    border: 2px dashed #ccc;
    border-radius: 6px;
    padding: 20px;
    text-align: center;
    transition: border-color 0.3s;
}

.drop-zone.dragover {
    border-color: #4CAF50;
    background-color: rgba(76, 175, 80, 0.1);
}
</style>

<div class="converter-container">
    <div class="options-container">
        <div class="input-group">
            <label for="startIndex">Start numbering from:</label>
            <input type="number" id="startIndex" class="number-input" value="1" min="0">
        </div>
    </div>
    <div class="file-input-container">
        <div class="drop-zone" id="dropZone">
            <input type="file" id="fileInput" class="custom-file-input" accept=".heic,.HEIC" multiple>
            <label for="fileInput" class="file-label">Drop HEIC files here or click to select</label>
            <div class="selected-files" id="selectedFiles"></div>
        </div>
    </div>
    <button onclick="convertFiles()" class="convert-button" id="convertButton" disabled>Convert to JPG and Download ZIP</button>
    <div class="progress-bar">
        <div class="progress-bar-fill" id="progressBar"></div>
    </div>
    <div class="status" id="status"></div>
</div>

<script src="https://unpkg.com/heic2any"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script>
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const selectedFiles = document.getElementById('selectedFiles');
const convertButton = document.getElementById('convertButton');
const statusDiv = document.getElementById('status');
const progressBar = document.getElementById('progressBar');

// Drag and drop handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    fileInput.files = files;
    updateFileSelection(files);
});

fileInput.addEventListener('change', (e) => {
    updateFileSelection(e.target.files);
});

function updateFileSelection(files) {
    if (files.length > 0) {
        selectedFiles.textContent = `Selected ${files.length} file(s): ${Array.from(files).map(f => f.name).join(', ')}`;
        convertButton.disabled = false;
    } else {
        selectedFiles.textContent = '';
        convertButton.disabled = true;
    }
}

async function convertFiles() {
    const files = fileInput.files;
    const zip = new JSZip();
    const startIndex = parseInt(document.getElementById('startIndex').value) || 1;

    if (files.length === 0) {
        alert('Please select HEIC files to convert');
        return;
    }

    convertButton.disabled = true;
    statusDiv.textContent = 'Converting files...';
    progressBar.style.width = '0%';
    
    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                statusDiv.textContent = `Converting ${file.name} (${i + 1}/${files.length})...`;
                progressBar.style.width = `${(i / files.length) * 100}%`;
                
                const jpegBlob = await heic2any({
                    blob: file,
                    toType: "image/jpeg",
                    quality: 0.8
                });

                // Use the starting index to name files
                const currentIndex = startIndex + i;
                const jpegFilename = `${currentIndex}.jpg`;
                zip.file(jpegFilename, jpegBlob);

            } catch (error) {
                console.error(`Error converting ${file.name}:`, error);
                statusDiv.textContent += `\nFailed to convert ${file.name}`;
            }
        }

        statusDiv.textContent = 'Creating ZIP file...';
        progressBar.style.width = '90%';
        
        const zipBlob = await zip.generateAsync({type: 'blob'});
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(zipBlob);
        downloadLink.download = `converted_images_${timestamp}.zip`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadLink.href);

        progressBar.style.width = '100%';
        statusDiv.textContent = '✅ Conversion complete! ZIP file downloaded.';

    } catch (error) {
        console.error('Error creating ZIP:', error);
        statusDiv.textContent = '❌ Error creating ZIP file';
    } finally {
        convertButton.disabled = false;
        setTimeout(() => {
            progressBar.style.width = '0%';
        }, 2000);
    }
}
</script>

## Features

- Drag and drop HEIC files or use file selector
- Convert multiple files at once
- Progress tracking for conversion
- Automatic ZIP file download
- Clean, modern interface
- Sequential naming of converted files (0.jpg, 1.jpg, etc.)

## Notes

- The conversion is done entirely in the browser - no files are uploaded to any server
- The quality of the output JPG is set to 0.8 (80%) by default
- Original HEIC files are not modified or deleted
- The ZIP file name includes a timestamp to prevent overwriting
- Converted images are named sequentially starting from 0.jpg