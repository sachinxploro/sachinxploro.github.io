// Customer Success Stories Data
const customerList = [
    {
        customerName: "Prithu Homes",
        customerWebsite: "https://www.prithu.in",
        customerLogo: "assets/logo_placeholder.png", 
        customerImage: "assets/md_image_placeholder.jpg",
        problemStatement: "A prominent construction company engaged in redevelopment faced challenges with manual approvals, planning, and reporting.",
        solution: "DigitalAIGarage.com implemented a workflow automation stack to digitize approvals, planning, and reporting. This resulted in unified task management, automated reports, and higher project visibility."
    }
];

const customerContainer = document.querySelector('.customer-scroll-container');

if (customerContainer) {
    customerList.forEach(customer => {
        const card = document.createElement('div');
        card.className = 'customer-card';
        
        // Create the card content
        card.innerHTML = `
            <div class="customer-header">
                <!-- You can uncomment the image tag below if you have actual logos -->
                <!-- <img src="${customer.customerLogo}" alt="${customer.customerName}" class="customer-logo"> -->
                <h3>
                    <a href="${customer.customerWebsite}" target="_blank">${customer.customerName}</a>
                </h3>
            </div>
            <div class="customer-body">
                <div class="info-block problem">
                    <strong>Problem</strong>
                    <p>${customer.problemStatement}</p>
                </div>
                <div class="info-block solution">
                    <strong>Solution</strong>
                    <p>${customer.solution}</p>
                </div>
            </div>
        `;
        customerContainer.appendChild(card);
    });
}