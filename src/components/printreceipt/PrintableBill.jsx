// components/PrintableBill.jsx
import logo from "/assets/logo.png";

const PrintableBill = ({ bill, selectedTests }) => {
  const testsArray = Array.isArray(selectedTests)
    ? selectedTests
    : JSON.parse(selectedTests || "[]");
  // console.log("Rendering PrintableBill with selectedTests:", selectedTests);
  // Format date as DD/MM/YY
  const formatDate = (dateString) => {
    if (!dateString) return "16/07/25";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  // Format time as HH:MM:SSAM/PM
  const formatTime = (timeString) => {
    if (!timeString) return "12:12:12PM";
    return timeString;
  };

  // Generate a 9-digit invoice number if not provided
  const invoiceNo = bill.id;

  // Format amount with two decimal places
  const formatAmount = (amount) => {
    // console.log("Formatting amount:", amount);
    return parseFloat(amount).toFixed(2);
  };

  // Calculate total amount
  const totalAmount = bill.totalAmount;

  // Convert number to words
  const numberToWords = (num) => {
    const ones = [
      "",
      "ONE",
      "TWO",
      "THREE",
      "FOUR",
      "FIVE",
      "SIX",
      "SEVEN",
      "EIGHT",
      "NINE",
    ];
    const teens = [
      "TEN",
      "ELEVEN",
      "TWELVE",
      "THIRTEEN",
      "FOURTEEN",
      "FIFTEEN",
      "SIXTEEN",
      "SEVENTEEN",
      "EIGHTEEN",
      "NINETEEN",
    ];
    const tens = [
      "",
      "",
      "TWENTY",
      "THIRTY",
      "FORTY",
      "FIFTY",
      "SIXTY",
      "SEVENTY",
      "EIGHTY",
      "NINETY",
    ];

    if (num === 0) return "ZERO";
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] +
        (num % 10 !== 0 ? " " + ones[num % 10] : "")
      );
    if (num < 1000)
      return (
        ones[Math.floor(num / 100)] +
        " HUNDRED" +
        (num % 100 !== 0 ? " " + numberToWords(num % 100) : "")
      );

    return "NUMBER TOO LARGE";
  };

  return (
    <html>
      <head>
        <title>Hospital Diagnostic Bill</title>
        <style>
          {`
            /* A5 size specific styling */
            @page {
              size: A5;
              margin: 0.5cm;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              font-size: 12px;
              color: #000;
              padding: 8px;
              margin: 0;
              width: 148mm;
              height: 210mm; 
              display: flex;
              flex-direction: column;
            }
                        
                        .receipt-container {
              display: flex;
              flex-direction: column;
              height: 100%;
            }

            .content {
              flex: 1;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1.5px solid #000;
            }

            .header-left .logo {
              width: 60px;   /* adjust as needed */
              height: auto;
            }

            .header-right {
              text-align: right;
              flex: 1;
              margin-left: 10px;
            }

            
            .center-name {
              font-size: 18px;
              font-weight: bold;
              margin: 5px 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .sub-header {
              font-size: 10px;
              margin-bottom: 3px;
            }
            
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 12px;
              padding: 5px 0;
            }
            
            .patient-info {
              margin-bottom: 12px;
              padding: 5px 0;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 8px 0 12px 0;
              font-size: 11px;
            }
            
            th, td {
              padding: 5px 6px;
              text-align: left;
            }
            
            .test-table th {
              border-bottom: 1.5px solid #000;
              border-top: 1.5px solid #000;
              font-weight: bold;
            }
            
            .test-table td {
              border-bottom: 1px dotted #ccc;
              vertical-align: top;
            }
            
            .amount-section {
              margin: 10px 0;
            }
            
            .amount-row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
              padding: 2px 0;
            }
            
            .total-row {
              font-weight: bold;
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              padding: 4px 0;
            }
            
            .footer {
              margin-top: auto; 
              font-size: 10px;
              padding-top: 8px;
              border-top: 1px dashed #000;
            }
            
            .text-center {
              text-align: center;
            }
            
            .text-right {
              text-align: right;
            }
            
            .bold {
              font-weight: bold;
            }
            
            .mt-5 {
              margin-top: 5px;
            }
            
            .mt-10 {
              margin-top: 10px;
            }
            
            .amount-in-words {
              padding: 6px 0;
              margin: 8px 0;
              font-style: italic;
              text-align: center;
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
            }
            
            .payment-details {
              margin: 10px 0;
            }
            
            .info-label {
              font-weight: 600;
            }
            
            .divider {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            
            /* Ensure good contrast for printing */
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          `}
        </style>
      </head>
      <body>
        <div className="receipt-container">
          <div>
            <div className="header">
              <div className="header-left">
                <img src={logo} alt="Logo" className="logo" />
              </div>
              <div className="header-right">
                <div className="center-name">DOGMA DIAGNOSTIC CENTER</div>
                <div className="sub-header">
                  Cha-88/1, Bir Uttam Rafiqul Islam Avenue, Uttar Badda,
                  Dhaka-1212.
                </div>
                <div className="sub-header">+8801921088076, +8801971088076</div>
                <div className="sub-header">
                  dogmahospital@gmail.com, dhldb98@gmail.com
                </div>
              </div>
            </div>

            <div className="invoice-info">
              <div>
                <div>
                  <span className="info-label">Invoice No:</span> {invoiceNo}
                </div>
                {/* <div>
                  <span className="info-label">Indoor PT-ID:</span> N/A
                </div> */}
              </div>
              <div>
                <div>
                  <span className="info-label">Date:</span>{" "}
                  {formatDate(bill.date)}
                </div>
                <div>
                  <span className="info-label">Time:</span>{" "}
                  {formatTime(bill.time)}
                </div>
              </div>
            </div>

            <div className="patient-info">
              <div>
                <span className="info-label">Patient Name:</span> {bill.name}
              </div>
              <div>
                <span className="info-label">Sex:</span> {bill.gender} |
                <span className="info-label"> Age:</span> {bill.age} |
                <span className="info-label"> Mobile No:</span>{" "}
                {bill.phone || "0"}
              </div>
              <div>
                <span className="info-label">Refd. By:</span>{" "}
                {bill.referralDoctorName}
              </div>
            </div>

            <table className="test-table">
              <thead>
                <tr>
                  <th># </th>
                  <th>Test Code</th>
                  <th>Test Name</th>
                  <th className="text-right">Amount (৳)</th>
                </tr>
              </thead>
              <tbody>
                {testsArray.map((test, index) => (
                  <tr key={index}>
                    <td>{(index + 1).toString().padStart(2, "0")}</td>
                    <td>{test.code}</td>
                    <td>{test.description}</td>
                    <td className="text-right">{formatAmount(test.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="amount-section">
              <div className="amount-row">
                <div>Total Amount</div>
                <div className="bold">৳ {formatAmount(totalAmount)}</div>
              </div>

              <div className="amount-row">
                <div>PAID</div>
                <div>৳ {formatAmount(bill.receivedAmount)}</div>
              </div>

              {/* <div className="amount-row total-row">
                <div>Grand Total</div>
                <div>৳ {formatAmount(totalAmount)}</div>
              </div> */}
            </div>

            <div className="amount-in-words">
              ({numberToWords(Math.floor(totalAmount))} TK. ONLY)
            </div>

            <div className="payment-details">
              {/* <div className="amount-row">
                <div>Received Amount</div>
                <div>৳ {formatAmount(bill.receivedAmount)}</div>
              </div> */}

              <div className="amount-row">
                <div>Due Amount</div>
                <div>৳ {formatAmount(bill.due)}</div>
              </div>

              {/* <div className="amount-row">
                <div>Delivery After</div>
                <div>{formatDate(bill.date)} On 7.30PM</div>
              </div> */}
            </div>
          </div>

          <div className="footer">
            <div>
              Printed on {formatDate(bill.date)} {formatTime(bill.time)}
            </div>
            <div className="bold mt-5">Receptionist: {bill.receptionist}</div>
            <div className="mt-5">
              Collection Room:-202,X-RAY,OPG,Dental Room:-203,USG Room:-204,ECG
              Room:-205,Endoscopy Room:-206
            </div>
            <div>
              Cha-88/1, Bir Uttam Rafiqul Islam Avenue, Uttar Badda, Dhaka-1212
            </div>
            {/* <div className="text-center mt-10">Thank you for choosing ABC Diagnostic Center.</div>
            <div className="text-center">This is a computer-generated bill. No signature required.</div> */}
          </div>
        </div>
      </body>
    </html>
  );
};

export default PrintableBill;
