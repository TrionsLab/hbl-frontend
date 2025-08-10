// components/PrintableBill.jsx

import logo from "../../assets/logo.png";

const PrintableBill = ({ bill, selectedTests }) => {
  const testsList = selectedTests
    .map(
      (t, i) =>
        `<tr><td style="padding:2px 4px;">${
          i + 1
        }</td><td style="padding:2px 4px;">${
          t.name
        }</td><td style="text-align:right;padding:2px 4px;">৳${
          t.price
        }</td></tr>`
    )
    .join("");

  return (
    <html>
      <head>
        <title>Hospital Diagnostic Bill</title>
        <style>
          {`
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              color: #000;
              padding: 10px;
              max-width: 700px;
              margin: auto;
            }
            .header {
              text-align: center;
              border-bottom: 1px solid #000;
              padding-bottom: 5px;
              margin-bottom: 10px;
            }
            .logo {
              width: 60px;
              margin-bottom: 5px;
            }
            h2 {
              margin: 0;
              font-size: 16px;
            }
            .sub-header {
              font-size: 10px;
            }
            .section {
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 5px;
              font-size: 11px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 3px 5px;
            }
            th {
              background-color: #f0f0f0;
              text-align: left;
              font-size: 11px;
            }
            .totals td {
              border: none;
              padding: 2px 0;
            }
            .totals .label {
              font-weight: bold;
            }
            .totals .value {
              text-align: right;
            }
            .footer {
              border-top: 1px dashed #888;
              padding-top: 5px;
              text-align: center;
              font-size: 10px;
              color: #555;
              margin-top: 10px;
            }
            .compact-row {
              margin-bottom: 3px;
            }
          `}
        </style>
      </head>
      <body>
        <div className="header">
          <img src={logo} className="logo" alt="Clinic Logo" />
          <h2>ABC Diagnostic Center</h2>
          <div className="sub-header">
            Address: 123 Health Street, City | Phone: 01234-567890
          </div>
        </div>

        <div className="section">
          <div className="compact-row"><strong>Receipt No:</strong> {bill.id}</div>
          <div className="compact-row"><strong>Date:</strong> date to be worked on | <strong>Time:</strong> {bill.time}</div>
          <div className="compact-row"><strong>Receptionist:</strong> {
            bill.receptionist
          }</div>
        </div>

        <div className="section">
          <h3>Patient Information</h3>
          <div className="compact-row"><strong>Name:</strong> {bill.name}</div>
          <div className="compact-row"><strong>Age:</strong> {bill.age} years {
            bill.ageMonths ? bill.ageMonths + " months" : ""
          }</div>
          <div className="compact-row"><strong>Gender:</strong> {bill.gender}</div>
          <div className="compact-row"><strong>Phone:</strong> {bill.phone}</div>
        </div>

        {
          bill.billType === "Test" && selectedTests.length > 0
            ? (
              <div className="section">
                <h3>Test Details</h3>
                <table>
                  <thead>
                    <tr>
                      <th style={{width:"30px"}}>SL</th>
                      <th>Test Name</th>
                      <th style={{width:"70px"}}>Charge (৳)</th>
                    </tr>
                  </thead>
                  <tbody dangerouslySetInnerHTML={{ __html: testsList }} />
                </table>
              </div>
            )
            : null
        }

        {
          bill.billType === "Doctor Visit"
            ? (
              <div className="section">
                <h3>Doctor Visit</h3>
                <table>
                  <tr><td style={{width:"100px"}}><strong>Doctor:</strong></td><td>{bill.doctor}</td></tr>
                  <tr><td><strong>Fee:</strong></td><td>৳{bill.doctorFee}</td></tr>
                </table>
              </div>
            )
            : null
        }

        {
          (bill.referralDoctorName || bill.referralPcName) &&
          bill.billType !== "Doctor Visit"
            ? (
              <div className="section">
                <h3>Referral Information</h3>
                <table>
                  {
                    bill.referralDoctorName
                      ? <tr><td style={{width:"100px"}}><strong>Doctor:</strong></td><td>{bill.referralDoctorName} (৳{bill.referralDoctorFee})</td></tr>
                      : null
                  }
                  {
                    bill.referralPcName
                      ? <tr><td><strong>PC:</strong></td><td>{bill.referralPcName} (৳{bill.referralPcFee})</td></tr>
                      : null
                  }
                </table>
              </div>
            )
            : null
        }

        <div className="section">
          <h3>Payment Summary</h3>
          <table className="totals">
            <tr>
              <td className="label">Gross Amount:</td>
              <td className="value">৳{bill.grossAmount}</td>
            </tr>
            <tr>
              <td className="label">Discount ({bill.discount}%):</td>
              <td className="value">- ৳{(
                (bill.grossAmount * bill.discount) /
                100
              ).toFixed(2)}</td>
            </tr>
            <tr>
              <td className="label">Extra Discount:</td>
              <td className="value">- ৳{bill.extraDiscount}</td>
            </tr>
            <tr>
              <td className="label">Total Amount:</td>
              <td className="value"><strong>৳{bill.totalAmount}</strong></td>
            </tr>
          </table>
        </div>

        <div className="footer">
          Thank you for choosing ABC Diagnostic Center.<br/>
          This is a computer-generated bill. No signature required.
        </div>
      </body>
    </html>
  );
};

export default PrintableBill;