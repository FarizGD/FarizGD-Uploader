const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;

const app = express();
const port = 3000;
const uploadDir = path.join(__dirname, 'files');
const backgroundImagePath = 'https://files.catbox.moe/nghheq.jpg';
const blurAmount = '10px';

fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        const randomName = crypto.randomBytes(7).toString('hex');
        const extension = path.extname(file.originalname);
        cb(null, `${randomName}${extension}`);
    }
});

const upload = multer({ storage });

app.use(express.urlencoded({ extended: false }));
app.use('/files', express.static(uploadDir));

const styles = `/* Embedded styles.css */
body {
    font-family: Arial, sans-serif;
}
.file-input-wrapper {
    position: relative;
    margin: 15px 0;
}
.file-label {
    display: inline-block;
    background: #007BFF;
    color: white;
    padding: 10px 20px;
    cursor: pointer;
    border-radius: 4px;
}
.file-name {
    margin-left: 10px;
    font-size: 0.9em;
}
.upload-button {
    background: #28a745;
    color: white;
    border: none;
    padding: 10px 25px;
    border-radius: 4px;
    cursor: pointer;
}
.upload-button:hover {
    background: #218838;
}
`;

const script = `// Embedded script.js
function updateFileNameAndPreview() {
    const fileInput = document.getElementById('fileInput');
    const fileNameSpan = document.getElementById('fileName');
    const imagePreview = document.getElementById('imagePreview');
    const videoPreview = document.getElementById('videoPreview');

    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileNameSpan.textContent = file.name;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                videoPreview.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                videoPreview.src = e.target.result;
                videoPreview.style.display = 'block';
                imagePreview.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.display = 'none';
            videoPreview.style.display = 'none';
        }
    } else {
        fileNameSpan.textContent = 'No file chosen';
        imagePreview.style.display = 'none';
        videoPreview.style.display = 'none';
    }
}
`;

const htmlTemplate = (bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FarizGD Uploader</title>
    <style>${styles}</style>
    <script>${script}</script>
    <style>
        body { margin: 0; overflow: hidden; }
        .background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('${backgroundImagePath}');
            background-size: cover;
            background-position: center;
            filter: blur(${blurAmount});
            z-index: -1;
        }
        .file-input {
            display: none;
        }
        .container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .upload-card {
            background-color: rgba(255, 255, 255, 0.8);
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .preview-container {
            display: flex;
            justify-content: center;
            margin-top: 15px;
        }
        .preview {
            border: 1px solid #ccc;
            border-radius: 4px;
            display: none;
        }
        #imagePreview, #videoPreview {
            max-width: 150px;
            max-height: 150px;
        }
        .upload-success {
            margin-bottom: 20px;
        }
        .mt-20 {
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="background"></div>
    ${bodyContent}
</body>
</html>
`;

const uploadForm = `
<div class="container">
    <div class="upload-card">
        <h1><i class="upload-icon"></i> FarizGD Uploader</h1>
        <form action="/upload" method="post" enctype="multipart/form-data">
            <div class="file-input-wrapper">
                <input type="file" name="file" id="fileInput" class="file-input" required onchange="updateFileNameAndPreview()">
                <label for="fileInput" class="file-label">Choose File</label>
                <span id="fileName" class="file-name">No file chosen</span>
            </div>
            <div class="preview-container">
                <img id="imagePreview" src="#" alt="Image preview" class="preview">
                <video id="videoPreview" controls class="preview"></video>
            </div>
            <button type="submit" class="upload-button">Upload</button>
        </form>
    </div>
</div>
`;

app.get('/', (req, res) => {
    res.send(htmlTemplate(uploadForm));
});

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        const errorMessage = `
            <div class="container">
                <div class="upload-card">
                    <h1><i class="upload-icon"></i> Upload Your File</h1>
                    <div class="error-message">No file uploaded.</div>
                    ${uploadForm}
                </div>
            </div>
        `;
        return res.send(htmlTemplate(errorMessage));
    }

    const fileUrl = `/files/${req.file.filename}`;
    const successMessage = `
        <div class="container">
            <div class="upload-card">
                <h1><i class="upload-icon"></i> FarizGD Uploader</h1>
                <div class="upload-success">
                    <svg viewBox="0 0 512 512" width="80" height="80">
                        <path fill="currentColor" d="M504 256C504 119 393 8 256 8S8 119 8 256s111 248 248 248 248-111 248-248zm-140.6 67.4l-93-93c-6.7-6.7-17.6-6.7-24.3 0-6.7 6.7-6.7 17.6 0 24.3l71.6 71.6-154.7 154.7c-6.7 6.7-6.7 17.6 0 24.3 6.7 6.7 17.6 6.7 24.3 0l166.4-166.4c6.7-6.6 6.7-17.4 0-24z"/>
                    </svg>
                    <h2>Upload Successful!</h2>
                    <p>You can access your file at <a href="${fileUrl}">${fileUrl}</a></p>
                </div>
                <form action="/upload" method="post" enctype="multipart/form-data" class="mt-20">
                    <div class="file-input-wrapper">
                        <input type="file" name="file" id="fileInput" class="file-input" required onchange="updateFileNameAndPreview()">
                        <label for="fileInput" class="file-label">Choose Another File</label>
                        <span id="fileName" class="file-name">No file chosen</span>
                    </div>
                    <div class="preview-container">
                        <img id="imagePreview" src="#" alt="Image preview" class="preview">
                        <video id="videoPreview" controls class="preview"></video>
                    </div>
                    <button type="submit" class="upload-button">Upload</button>
                </form>
            </div>
        </div>
    `;
    res.send(htmlTemplate(successMessage));
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
