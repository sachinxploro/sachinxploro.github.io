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

const videoContainer = document.querySelector('.video-grid');

if (videoContainer) {
    // 1. Sort videos based on the 'sequence' property
    videoList.sort((a, b) => a.sequence - b.sequence);

    // 2. Generate HTML for each video
    videoList.forEach(video => {
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card reveal'; // 'reveal' class ensures animation works

        // Determine the source URL based on type
        let srcUrl = video.type === 'youtube' 
            ? `https://www.youtube.com/embed/${video.link}` 
            : video.link;

        videoCard.innerHTML = `
            <iframe width="100%" height="315" src="${srcUrl}" title="${video.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        `;

        videoContainer.appendChild(videoCard);
    });
}