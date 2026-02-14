// Video Data Configuration
// Add your videos here. 
// For YouTube: use 'type: youtube' and the video ID (e.g., '8MuTZAbvPAE').
// For Azure: use 'type: azure' and the full embed URL.
const videoList = [
    {
        sequence: 1,
        type: 'youtube',
        link: '8MuTZAbvPAE', 
        title: 'Construction Industry Process Transformation'
    },
    {
        sequence: 2,
        type: 'youtube',
        link: 'VIDEO_ID_2', // Replace with actual ID
        title: 'Future Success Story'
    }
    // Example for Azure:
    // {
    //     sequence: 3,
    //     type: 'azure',
    //     link: 'https://your-azure-media-service-url.com/embed/...',
    //     title: 'Azure Hosted Video'
    // }
];

// 0. Inject Modal HTML into the body
const modalHTML = `
<div id="videoModal" class="video-modal">
    <div class="video-modal-content">
        <button class="close-video" id="closeVideoBtn">&times;</button>
        <div id="modalVideoContainer" style="width:100%; height:100%"></div>
    </div>
</div>`;
document.body.insertAdjacentHTML('beforeend', modalHTML);

const modal = document.getElementById('videoModal');
const modalContainer = document.getElementById('modalVideoContainer');
const closeBtn = document.getElementById('closeVideoBtn');

const videoContainer = document.querySelector('.video-grid');

if (videoContainer) {
    // 1. Sort videos based on the 'sequence' property
    videoList.sort((a, b) => a.sequence - b.sequence);

    // 2. Generate HTML for each video
    videoList.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card reveal'; // 'reveal' class ensures animation works

        // Handle click to open modal
        videoCard.onclick = () => {
            let embedUrl = video.type === 'youtube' 
                ? `https://www.youtube.com/embed/${video.link}?autoplay=1` 
                : video.link;
            
            modalContainer.innerHTML = `<iframe width="100%" height="100%" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
            modal.classList.add('active');
        };

        // Render Thumbnail + Play Button
        if (video.type === 'youtube') {
            const thumbUrl = `https://img.youtube.com/vi/${video.link}/maxresdefault.jpg`;
            videoCard.innerHTML = `
                <div style="position: relative; width: 100%; padding-bottom: 56.25%; background: #000;">
                    <img src="${thumbUrl}" alt="${video.title}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.8;">
                    <div class="play-button"></div>
                </div>
            `;
        } else {
            // Fallback for non-YouTube videos (show iframe with overlay to capture click)
            videoCard.innerHTML = `
                <div style="position: relative; width: 100%; height: 315px;">
                    <iframe width="100%" height="100%" src="${video.link}" frameborder="0" style="pointer-events: none;"></iframe>
                    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer;"></div>
                </div>
            `;
        }

        videoContainer.appendChild(videoCard);
    });
}

// Close Modal Logic
function closeModal() {
    modal.classList.remove('active');
    modalContainer.innerHTML = ''; // Clear iframe to stop audio
}

closeBtn.addEventListener('click', closeModal);

// Close on background click
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});