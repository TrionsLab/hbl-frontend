// components/ReferralModal.jsx
import { useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const ReferralModal = ({ title, contentData, onClose }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const entries = Object.entries(contentData);
  const total = Object.values(contentData).reduce((a, b) => a + b, 0);

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text(title, 14, 15);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Date: ${today}`, 14, 25);
    
    // Table data
    const tableData = entries.map(([name, amount]) => [
      name,
      `${amount.toFixed(2)}Tk`
    ]);
    
    // Add total row
    tableData.push(["Total", `${total.toFixed(2)}Tk`]);
    
    // Generate table
    autoTable(doc, {
      startY: 30,
      head: [['Name', 'Amount']],
      body: tableData,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        1: { halign: 'right' }
      },
      didDrawCell: (data) => {
        // Bold the total row
        if (data.row.index === entries.length) {
          doc.setFont('helvetica', 'bold');
        }
      }
    });
    
    // Save the PDF
    doc.save(`${title.replace(/\s+/g, '_')}_${today.replace(/,/g, '')}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
      >
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-xl font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="font-medium">Date: {today}</div>

          {entries.length > 0 ? (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {entries.map(([name, amount]) => (
                  <div
                    key={name}
                    className="flex justify-between border-b pb-2"
                  >
                    <span className="font-medium">{name}</span>
                    <span className="font-medium">৳{amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold pt-4 border-t">
                <span>Total</span>
                <span>৳{total.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center">No referrals available</p>
          )}
        </div>

        <div className="border-t p-4 flex justify-between items-center">
          <button
            onClick={generatePDF}
            className="btn btn-outline btn-sm"
          >
            Download PDF
          </button>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralModal;