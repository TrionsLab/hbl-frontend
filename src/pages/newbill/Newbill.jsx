import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { v4 as uuidv4 } from "uuid";
import { createBill } from "../../api/billApi.js";
import { getReferences } from "../../api/referralManagerApi.js";
import Navbar from "../../components/Navbar/Navbar";
import PrintableBill from "../../components/printreceipt/PrintableBill";

const Newbill = () => {
  const receptionistNames = ["Alice", "Bob", "Charlie"];
  const testOptions = [
    { name: "CBC", price: 300 },
    { name: "X-Ray Chest", price: 500 },
    { name: "Blood Sugar", price: 150 },
    { name: "Urine Test", price: 200 },
  ];

  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receivedAmount, setReceivedAmount] = useState(0);

  const doctors = references.filter((r) => r.type === "Doctor");
  const pcs = references.filter((r) => r.type === "PC");

  useEffect(() => {
    async function fetchReferences() {
      try {
        const data = await getReferences();
        setReferences(data);
      } catch (err) {
        console.error("Error fetching references", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReferences();
  }, []);

  const initialBillState = {
    date: new Date().toLocaleDateString("en-CA"),
    time: new Date().toLocaleTimeString("en-BD", { timeZone: "Asia/Dhaka" }),
    idNo: uuidv4(),
    name: "",
    age: "",
    ageMonths: "",
    gender: "",
    phone: "",
    receptionist: "",
    referralPcName: "",
    referralPcFee: "",
    referralDoctorName: "",
    referralDoctorFee: "",
    doctor: "",
    doctorFee: "",
    billType: "",
    grossAmount: 0,
    discount: 0,
    extraDiscount: 0,
    totalAmount: 0,
    due: 0,
  };

  const [bill, setBill] = useState(initialBillState);
  const [selectedTests, setSelectedTests] = useState([]);

  const calculateTotal = (grossAmount, discountPercent, extraDiscount) => {
    const gross = Number(grossAmount) || 0;
    const discountP = Number(discountPercent) || 0;
    const extra = Number(extraDiscount) || 0;

    const discountAmount = (gross * discountP) / 100;
    const total = Math.max(gross - discountAmount - extra, 0);

    return total;
  };

  const handleChange = (field, value) => {
    setBill((prev) => {
      let val = value;

      if (
        [
          "discount",
          "extraDiscount",
          "age",
          "ageMonths",
          "referralDoctorFee",
          "referralPcFee",
          "doctorFee",
          "due",
        ].includes(field)
      ) {
        val = value === "" ? 0 : Number(value);
      }

      let updated = { ...prev, [field]: val };

      if (updated.billType === "Doctor Visit") {
        updated.grossAmount = Number(updated.doctorFee) || 0;
      } else if (updated.billType === "Test") {
        updated.grossAmount = selectedTests.reduce(
          (sum, t) => sum + t.price,
          0
        );
      }

      updated.totalAmount = calculateTotal(
        updated.grossAmount,
        updated.discount,
        updated.extraDiscount
      );

      if (field === "receivedAmount") {
        updated.due = Math.max(updated.totalAmount - (Number(value) || 0), 0);
      } else {
        // Recalculate due whenever other fields change
        updated.due = Math.max(updated.totalAmount - (receivedAmount || 0), 0);
      }

      return updated;
    });
  };

  const handleBillTypeChange = (value) => {
    setSelectedTests([]);
    setBill((prev) => ({
      ...prev,
      billType: value,
      referralPcName: "",
      referralPcFee: "",
      referralDoctorName: "",
      referralDoctorFee: "",
      doctor: "",
      doctorFee: "",
      grossAmount: 0,
      discount: 0,
      extraDiscount: 0,
      totalAmount: 0,
      due: 0,
    }));
  };

  const handleTestSelect = (e) => {
    const selectedName = e.target.value;
    if (!selectedName) return;

    const test = testOptions.find((t) => t.name === selectedName);
    if (test && !selectedTests.some((t) => t.name === test.name)) {
      const updatedTests = [...selectedTests, test];
      setSelectedTests(updatedTests);

      setBill((prev) => ({
        ...prev,
        grossAmount: updatedTests.reduce((sum, t) => sum + t.price, 0),
        totalAmount: calculateTotal(
          updatedTests.reduce((sum, t) => sum + t.price, 0),
          prev.discount,
          prev.extraDiscount
        ),
      }));
    }
  };

  const removeTest = (name) => {
    const updatedTests = selectedTests.filter((t) => t.name !== name);
    setSelectedTests(updatedTests);

    setBill((prev) => ({
      ...prev,
      grossAmount: updatedTests.reduce((sum, t) => sum + t.price, 0),
      totalAmount: calculateTotal(
        updatedTests.reduce((sum, t) => sum + t.price, 0),
        prev.discount,
        prev.extraDiscount
      ),
    }));
  };

  const handleDoctorSelect = (e) => {
    const name = e.target.value;
    const doc = doctors.find((d) => d.name === name);
    setBill((prev) => ({
      ...prev,
      doctor: name,
      doctorFee: doc ? doc.fee || 0 : 0,
      ...(prev.billType === "Doctor Visit" && {
        grossAmount: doc ? doc.fee || 0 : 0,
        totalAmount: calculateTotal(
          doc ? doc.fee || 0 : 0,
          prev.discount,
          prev.extraDiscount
        ),
      }),
    }));
  };

  const handleReferralDoctorSelect = (e) => {
    const name = e.target.value;
    const doc = doctors.find((d) => d.name === name);
    setBill((prev) => ({
      ...prev,
      referralDoctorName: name,
      referralDoctorFee: doc ? doc.fee || 0 : 0,
    }));
  };

  const handlePCSelect = (e) => {
    const name = e.target.value;
    const pc = pcs.find((p) => p.name === name);
    setBill((prev) => ({
      ...prev,
      referralPcName: name,
      referralPcFee: pc ? pc.fee || 0 : 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if ((Number(bill.age) || 0) === 0 && (Number(bill.ageMonths) || 0) === 0) {
      alert("Please provide at least Age (Years) or Age (Months).");
      return;
    }

    try {
      const billData = {
        ...bill,
        date: new Date().toLocaleDateString("en-CA"),
        age: Number(bill.age) || 0,
        ageMonths: Number(bill.ageMonths) || 0,
        referralDoctorFee: Number(bill.referralDoctorFee) || 0,
        referralPcFee: Number(bill.referralPcFee) || 0,
        doctorFee: Number(bill.doctorFee) || 0,
        grossAmount: Number(bill.grossAmount) || 0,
        discount: Number(bill.discount) || 0,
        extraDiscount: Number(bill.extraDiscount) || 0,
        totalAmount: Number(bill.totalAmount) || 0,
        due: Number(bill.due) || 0,
        selectedTests,
      };

      console.log(billData);

      const result = await createBill(billData);
      alert("Bill saved successfully with ID: " + result.insertId);

      const printWindow = window.open(
        "",
        "_blank",
        `width=${window.screen.availWidth},height=${window.screen.availHeight},left=0,top=0,scrollbars=yes,resizable=yes`
      );

      printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hospital Bill Receipt</title>
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
    `);

      ReactDOM.render(
        <PrintableBill bill={bill} selectedTests={selectedTests} />,
        printWindow.document.getElementById("root")
      );

      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };

      setBill({
        ...initialBillState,
        idNo: uuidv4(),
        receptId: bill.receptId + 1,
        date: new Date().toLocaleDateString("en-CA"),
        time: new Date().toLocaleTimeString("en-BD", {
          timeZone: "Asia/Dhaka",
        }),
      });
      setSelectedTests([]);
    } catch (error) {
      console.error("Error submitting bill:", error);
      alert("Failed to save bill: " + error.message);
    }
  };

  if (loading) return <div>Loading references...</div>;

  return (
    <>
      <Navbar />
      <div className="bg-base-200 flex justify-center space-x-4 pt-3 pb-36">
        <form
          onSubmit={handleSubmit}
          className="card w-full h-full max-w-4xl bg-white p-6 shadow-xl space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="select select-bordered select-primary font-semibold"
              value={bill.billType}
              onChange={(e) => handleBillTypeChange(e.target.value)}
              required
            >
              <option value="">Select Bill Type</option>
              <option value="Test">Test</option>
              <option value="Doctor Visit">Doctor Visit</option>
            </select>
            <select
              className="select select-bordered select-primary font-semibold"
              value={bill.receptionist}
              onChange={(e) => handleChange("receptionist", e.target.value)}
              required
            >
              <option value="">Select Receptionist</option>
              {receptionistNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="glass card bg-base-200 shadow-md p-6 space-y-4">
            <h2 className="text-lg font-bold text-info-content">
              Patient Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Patient Name"
                className="input input-bordered"
                value={bill.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="input input-bordered"
                value={bill.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Age (Years)"
                  className="input input-bordered w-1/2"
                  value={bill.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  min={0}
                />
                <input
                  type="number"
                  placeholder="Age (Months)"
                  className="input input-bordered w-1/2"
                  value={bill.ageMonths}
                  onChange={(e) => handleChange("ageMonths", e.target.value)}
                  min={0}
                />
              </div>
              <select
                className="select select-bordered"
                value={bill.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {bill.billType === "Test" && (
            <div className="glass card bg-base-200 shadow-md p-6 space-y-4">
              <h2 className="text-lg font-bold">Select Tests</h2>
              <select
                className="select select-bordered"
                onChange={handleTestSelect}
                value={selectedTests.length > 0 ? "Select" : ""}
              >
                <option value="">Select a test</option>
                {testOptions.map((test) => (
                  <option key={test.name} value={test.name}>
                    {test.name} - ৳{test.price}
                  </option>
                ))}
              </select>

              {selectedTests.length > 0 && (
                <ul className="list-disc ml-6 space-y-1">
                  {selectedTests.map((test) => (
                    <li
                      key={test.name}
                      className="flex justify-between items-center"
                    >
                      <span>
                        {test.name} - ৳{test.price}
                      </span>
                      <button
                        type="button"
                        className="btn btn-xs btn-error"
                        onClick={() => removeTest(test.name)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="card bg-base-200 shadow-md p-6 space-y-4">
            {bill.billType === "Doctor Visit" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h2 className="text-lg font-bold">Doctor Visit</h2>
                <br />
                <select
                  className="select select-bordered"
                  value={bill.doctor}
                  onChange={handleDoctorSelect}
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((ref) => (
                    <option key={ref.id} value={ref.name}>
                      {ref.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Doctor Fee"
                  className="input input-bordered"
                  value={bill.doctorFee}
                  onChange={(e) => handleChange("doctorFee", e.target.value)}
                  min={0}
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h2 className="text-lg font-bold">Reference</h2>
                <br />
                <select
                  className="select select-bordered"
                  value={bill.referralDoctorName}
                  onChange={handleReferralDoctorSelect}
                >
                  <option value="">Select Referral Doctor</option>
                  {doctors.map((ref) => (
                    <option key={ref.id} value={ref.name}>
                      {ref.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Doctor Referral Fee"
                  className="input input-bordered"
                  value={bill.referralDoctorFee}
                  onChange={(e) =>
                    handleChange("referralDoctorFee", e.target.value)
                  }
                  min={0}
                  disabled={!bill.referralDoctorName}
                />
                <select
                  className="select select-bordered"
                  value={bill.referralPcName}
                  onChange={handlePCSelect}
                >
                  <option value="">Select PC</option>
                  {pcs.map((ref) => (
                    <option key={ref.id} value={ref.name}>
                      {ref.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="PC Referral Fee"
                  className="input input-bordered"
                  value={bill.referralPcFee}
                  onChange={(e) =>
                    handleChange("referralPcFee", e.target.value)
                  }
                  min={0}
                  disabled={!bill.referralPcName}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="form-control">
              <label htmlFor="discount" className="label font-semibold">
                Discount (%)
              </label>
              <input
                id="discount"
                type="number"
                placeholder="Discount in %"
                className="input input-bordered"
                value={bill.discount}
                onChange={(e) => handleChange("discount", e.target.value)}
                min={0}
                max={100}
                disabled={bill.grossAmount <= 0}
              />
            </div>

            <div className="form-control">
              <label htmlFor="extraDiscount" className="label font-semibold">
                Extra Discount
              </label>
              <input
                id="extraDiscount"
                type="number"
                placeholder="Extra Discount"
                className="input input-bordered"
                value={bill.extraDiscount}
                onChange={(e) => handleChange("extraDiscount", e.target.value)}
                min={0}
                disabled={bill.grossAmount <= 0}
              />
            </div>

            <div className="form-control">
              <label className="label font-semibold">Received Amount</label>
              <input
                type="number"
                placeholder="Received Amount"
                className="input input-bordered"
                value={receivedAmount}
                onChange={(e) => {
                  setReceivedAmount(Number(e.target.value) || 0);
                  handleChange("receivedAmount", e.target.value);
                }}
                min={0}
                max={bill.totalAmount}
                disabled={bill.totalAmount <= 0}
              />
            </div>
          </div>

          <button className="btn btn-primary w-full" type="submit">
            Submit Bill
          </button>
        </form>
        <div className="stats h-80 shadow p-6 flex flex-col justify-between">
          <div className="stat">
            <div className="stat-title text-lg font-bold mb-4">Summary</div>

            <div className="form-control mb-4">
              <label htmlFor="due" className="label font-semibold">
                Due Amount
              </label>
              <input
                id="due"
                type="number"
                className="input input-bordered bg-gray-100 cursor-not-allowed"
                value={bill.due}
                readOnly
              />
            </div>

            <div className="form-control">
              <label className="label font-semibold">Payable Amount</label>
              <input
                type="number"
                className="input input-bordered bg-gray-100 cursor-not-allowed"
                value={bill.totalAmount}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Newbill;
