// Customer Success Stories Data
const customerList = [
  {
    customerName: "Prithu Homes",
    customerWebsite: "https://www.prithu.in",
    customerLogo:
      "https://static.wixstatic.com/media/0a2938_171c080f36db4e27aeb095ca065a1d57~mv2.png/v1/fill/w_348,h_130,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Prithu%20Homes%20Logo.png",
    customerImage: "assets/md_image_placeholder.jpg",
    showcompanyName: false,
    businessChallenge:
      "Slow descision making and evrything happening on paper and phone",

    problemStatement:
      "The organization faced rising CRM operating expenses driven by high licensing fees, ongoing customization efforts, and maintenance overhead. The legacy CRM platform offered limited flexibility and lacked seamless integration with other enterprise applications, resulting in fragmented workflows and reduced operational efficiency.",

    solution:
      "We designed and implemented a fully integrated CRM solution using Microsoft Power Apps, Power Automate, and Azure Cloud services. The new platform reduced licensing costs by 50%, digitized approvals and project planning processes, and enabled automated reporting. This transformation delivered unified task management, improved cross-functional visibility, and enhanced overall project governance.",
  },
  {
    customerName: "Kashvi Metals",
    customerWebsite: "https://www.kashvimetals.com",
    customerLogo: "",
    customerImage: "assets/md_image_placeholder.jpg",
    showcompanyName: true,
    businessChallenge:
      "Slow Decision-Making Due to Manual, Paper-Based Processes",

    problemStatement:
      "The organization relied heavily on paper-based documentation, phone calls, and manual follow-ups to manage core business processes. This led to delayed decision-making, limited process visibility, and lack of real-time tracking. Approvals were scattered across emails and calls, creating bottlenecks and reducing overall operational efficiency.",

    solution:
      "We developed a custom digital solution to streamline and automate key business processes. The platform digitized approvals, centralized task tracking, and enabled real-time process visibility. By eliminating manual paperwork and phone-based coordination, the organization achieved faster decision-making, improved accountability, and greater operational control.",
  },
];

//--------------------xxx----------------------------------xxx-------------------

const customerContainer = document.querySelector(".customer-scroll-container");

if (customerContainer) {
  customerList.forEach((customer) => {
    const card = document.createElement("div");
    card.className = "customer-card";

    const hasLogo =
      customer.customerLogo && customer.customerLogo.trim() !== "";
    const showName = !hasLogo || customer.showcompanyName;

    // Create the card content
    card.innerHTML = `
            <div class="customer-header">
                ${hasLogo ? `<a href="${customer.customerWebsite}" target="_blank"><img src="${customer.customerLogo}" alt="${customer.customerName}" class="customer-logo"></a>` : ""}
                ${showName ? `<h3><a href="${customer.customerWebsite}" target="_blank">${customer.customerName}</a></h3>` : ""}
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
