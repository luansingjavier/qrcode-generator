// Wait for QRCode library to load
let QRCodeAvailable = false;

if (window.QRCode) {
    QRCodeAvailable = true;
    initializeApp();
} else {
    window.addEventListener('qrcodeReady', () => {
        QRCodeAvailable = true;
        initializeApp();
    });
}

function initializeApp() {
// DOM Elements
const qrTextInput = document.getElementById('qr-text');
const logoUpload = document.getElementById('logo-upload');
const uploadArea = document.getElementById('upload-area');
const fileName = document.getElementById('file-name');
const logoSizeSlider = document.getElementById('logo-size');
const logoSizeValue = document.getElementById('logo-size-value');
const qrSizeSlider = document.getElementById('qr-size');
const qrSizeValue = document.getElementById('qr-size-value');
const errorCorrectionSelect = document.getElementById('error-correction');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const qrCanvas = document.getElementById('qr-canvas');
const qrPlaceholder = document.getElementById('qr-placeholder');

let logoFile = null;
let logoImage = null;

// Update slider value displays
logoSizeSlider.addEventListener('input', (e) => {
    logoSizeValue.textContent = `${e.target.value}%`;
});

qrSizeSlider.addEventListener('input', (e) => {
    qrSizeValue.textContent = `${e.target.value}px`;
});

// Handle logo upload
uploadArea.addEventListener('click', () => {
    logoUpload.click();
});

logoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        
        logoFile = file;
        fileName.textContent = file.name;
        
        // Load image preview
        const reader = new FileReader();
        reader.onload = (event) => {
            logoImage = new Image();
            logoImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Generate QR Code
generateBtn.addEventListener('click', async () => {
    const text = qrTextInput.value.trim();
    
    if (!text) {
        alert('Please enter a URL or text');
        return;
    }

    try {
        const qrSize = parseInt(qrSizeSlider.value);
        const errorCorrection = errorCorrectionSelect.value;
        
        // Generate QR code
        await QRCode.toCanvas(qrCanvas, text, {
            width: qrSize,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            errorCorrectionLevel: errorCorrection
        });

        // Add logo if provided
        if (logoImage && logoImage.complete) {
            addLogoToQR(logoImage, parseFloat(logoSizeSlider.value));
        } else if (logoImage) {
            logoImage.onload = () => {
                addLogoToQR(logoImage, parseFloat(logoSizeSlider.value));
            };
        }

        // Show canvas and download button, hide placeholder
        qrCanvas.style.display = 'block';
        qrPlaceholder.classList.add('hidden');
        downloadBtn.style.display = 'block';
    } catch (error) {
        console.error('Error generating QR code:', error);
        alert('Error generating QR code. Please try again.');
    }
});

// Add logo to QR code
function addLogoToQR(logoImg, logoSizePercent) {
    const ctx = qrCanvas.getContext('2d');
    const canvasSize = qrCanvas.width;
    const logoSize = (canvasSize * logoSizePercent) / 100;
    
    // Calculate center position
    const x = (canvasSize - logoSize) / 2;
    const y = (canvasSize - logoSize) / 2;
    
    // Draw white background for logo
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 5, y - 5, logoSize + 10, logoSize + 10);
    
    // Draw logo
    ctx.drawImage(logoImg, x, y, logoSize, logoSize);
}

// Download QR Code
downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrCanvas.toDataURL('image/png');
    link.click();
});

// Generate on Enter key
qrTextInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateBtn.click();
    }
});
} // End of initializeApp