function updateFileName() {
    const fileInput = document.getElementById('fileInput');
    const fileNameDisplay = document.getElementById('fileName');
    if (fileInput.files.length > 0) {
        fileNameDisplay.textContent = fileInput.files[0].name;
    } else {
        fileNameDisplay.textContent = 'No file chosen';
    }
}

// Set dynamic max width and height based on viewport
const maxWidth = window.innerWidth * 0.8; // 80% of screen width
const maxHeight = window.innerHeight * 0.6; // 60% of screen height
previewContainer.style.maxWidth = `${maxWidth}px`;
previewContainer.style.maxHeight = `${maxHeight}px`;