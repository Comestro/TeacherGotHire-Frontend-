import React from "react";

export default function test() {
  const handleDownloadProfile = () => {
    setOpenDownloadModal(true);
    setTimeout(() => {
      const content = document.querySelector("#pdf-content");

      html2canvas(content, { scale: 2, useCORS: true })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save("teacher-profile.pdf");
          setOpenDownloadModal(false); // Close the modal immediately after initiating the download
        })
        .catch((error) => {
          console.error("Error generating PDF:", error);
          setOpenDownloadModal(false);
        });
    }, 100);
  };

  
  return (
     <div>
        
    </div>
    );
}
