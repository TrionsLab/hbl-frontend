import { useEffect, useState } from "react";

import ReactDOM from "react-dom";
import { v4 as uuidv4 } from "uuid";
import { createBill } from "../../api/billApi.js";
import { getReferences } from "../../api/referralManagerApi.js";
import { fetchTests } from "../../api/testApi";
import Navbar from "../../components/navbar/Navbar";
import PrintableBill from "../../components/printreceipt/PrintableBill";

const Newbill = () => {
  const [userInfo, setUserInfo] = useState();

  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receivedAmount, setReceivedAmount] = useState(0);

  const doctors = references.filter((r) => r.type === "Doctor");
  const pcs = references.filter((r) => r.type === "PC");

  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      try {
        setUserInfo(JSON.parse(storedUser)); // ✅ parse JSON back to object
      } catch (err) {
        console.error("Error parsing userInfo from localStorage", err);
      }
    }
  }, []);

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

  const [tests, setTests] = useState([]);

  const loadTests = async () => {
    setLoading(true);
    try {
      const data = await fetchTests();
      setTests(data);
    } catch (err) {
      console.log("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTests();
  }, []);

  const initialBillState = {
    date: new Date().toLocaleDateString("en-CA"),
    time: new Date().toLocaleTimeString("en-BD", {
      timeZone: "Asia/Dhaka",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
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
    receivedAmount: 0,
    due: 0,
    archive: false,
    archivedAt: null,
  };

  const [bill, setBill] = useState(initialBillState);
  const [selectedTests, setSelectedTests] = useState([]);

  const calculateTotal = (grossAmount, discountPercent, extraDiscount) => {
    // Ensure all values are numbers
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
          "receivedAmount",
        ].includes(field)
      ) {
        val = value === "" ? 0 : Number(value);
      }

      let updated = { ...prev, [field]: val };

      if (updated.billType === "Doctor Visit") {
        updated.grossAmount = Number(updated.doctorFee) || 0;
      } else if (updated.billType === "Test") {
        // Ensure test rates are converted to numbers
        updated.grossAmount = selectedTests.reduce(
          (sum, t) => sum + Number(t.rate),
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
        updated.due = Math.max(
          updated.totalAmount - (updated.receivedAmount || 0),
          0
        );
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

    const test = tests.find((t) => t.description === selectedName);
    if (
      test &&
      !selectedTests.some((t) => t.description === test.description)
    ) {
      const updatedTests = [...selectedTests, test];
      setSelectedTests(updatedTests);

      // Convert rates to numbers before summing
      const grossAmount = updatedTests.reduce(
        (sum, t) => sum + Number(t.rate),
        0
      );

      setBill((prev) => ({
        ...prev,
        grossAmount: grossAmount,
        totalAmount: calculateTotal(
          grossAmount,
          prev.discount,
          prev.extraDiscount
        ),
      }));
    }
  };

  const removeTest = (name) => {
    const updatedTests = selectedTests.filter((t) => t.description !== name);
    setSelectedTests(updatedTests);

    // Convert rates to numbers before summing
    const grossAmount = updatedTests.reduce(
      (sum, t) => sum + Number(t.rate),
      0
    );

    setBill((prev) => ({
      ...prev,
      grossAmount: grossAmount,
      totalAmount: calculateTotal(
        grossAmount,
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
      doctorFee: doc ? Number(doc.fee) || 0 : 0,
      ...(prev.billType === "Doctor Visit" && {
        grossAmount: doc ? Number(doc.fee) || 0 : 0,
        totalAmount: calculateTotal(
          doc ? Number(doc.fee) || 0 : 0,
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
      referralDoctorFee: doc ? Number(doc.fee) || 0 : 0,
    }));
  };

  const handlePCSelect = (e) => {
    const name = e.target.value;
    const pc = pcs.find((p) => p.name === name);
    setBill((prev) => ({
      ...prev,
      referralPcName: name,
      referralPcFee: pc ? Number(pc.fee) || 0 : 0,
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
        receptionist: userInfo.username,
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

      const result = await createBill(billData);
      alert("Bill saved successfully with ID: " + result.insertId);

      // ---------- Printing via hidden iframe ----------
      const printBill = (bill) => {
        const iframe = document.createElement("iframe");
        iframe.style.position = "absolute";
        iframe.style.width = "0";
        iframe.style.height = "0";
        iframe.style.border = "0";
        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow.document;

        // Ensure selectedTests is always an array
        const testsArray = Array.isArray(bill.selectedTests)
          ? bill.selectedTests
          : JSON.parse(bill.selectedTests || "[]");

        // Render PrintableBill into the iframe
        ReactDOM.render(
          <PrintableBill bill={bill} selectedTests={testsArray} />,
          doc.body
        );

        // Small delay to ensure rendering, then print
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          document.body.removeChild(iframe);
        }, 300);
      };

      printBill({ ...billData, id: result.insertId });

      // Reset form
      setBill({
        ...initialBillState,
        idNo: uuidv4(),
        date: new Date().toLocaleDateString("en-CA"),
        time: new Date().toLocaleTimeString("en-BD", {
          timeZone: "Asia/Dhaka",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
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
      <div className="min-h-screen bg-base-300 py-4 px-2 sm:px-3 lg:px-4">
        <div className="mx-7">
          <div className="flex justify-center gap-4">
            <form
              onSubmit={handleSubmit}
              className="card w-full lg:w-2/3 bg-base-100 shadow-xl rounded overflow-hidden"
            >
              <div className="card-body p-3 sm:p-4 space-y-6">
                {/* Bill Type and Receptionist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Bill Type
                      </span>
                    </label>
                    <select
                      className="select select-bordered select-primary w-full focus:ring-2 focus:ring-primary focus:border-transparent bg-base-200"
                      value={bill.billType}
                      onChange={(e) => handleBillTypeChange(e.target.value)}
                      required
                    >
                      <option value="">Select Bill Type</option>
                      <option value="Test">Test</option>
                      <option value="Doctor Visit">Doctor Visit</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Receptionist
                      </span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-primary w-full bg-base-200 focus:ring-2 focus:ring-primary focus:border-transparent cursor-not-allowed"
                      value={userInfo.username}
                      disabled
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Patient Details */}
                  <div className="bg-base-200 rounded p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
                      Patient Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">
                            Full Name
                          </span>
                        </label>
                        <input
                          type="text"
                          placeholder="Patient Name"
                          className="input input-bordered w-full focus:ring-2 focus:ring-primary focus:border-transparent bg-base-200"
                          value={bill.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">
                            Phone Number
                          </span>
                        </label>
                        <input
                          type="number"
                          placeholder="+8801XXXXXXXX"
                          className="input input-bordered w-full focus:ring-2 focus:ring-primary focus:border-transparent bg-base-200"
                          value={bill.phone}
                          onChange={(e) =>
                            handleChange("phone", e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">Age</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Years"
                            className="input input-bordered w-1/2 focus:ring-2 focus:ring-primary focus:border-transparent bg-base-200"
                            value={bill.age}
                            onChange={(e) =>
                              handleChange("age", e.target.value)
                            }
                            min={0}
                          />
                          <input
                            type="number"
                            placeholder="Months"
                            className="input input-bordered w-1/2 focus:ring-2 focus:ring-primary focus:border-transparent bg-base-200"
                            value={bill.ageMonths}
                            onChange={(e) =>
                              handleChange("ageMonths", e.target.value)
                            }
                            min={0}
                          />
                        </div>
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">Gender</span>
                        </label>
                        <select
                          className="select select-bordered w-full focus:ring-2 focus:ring-primary focus:border-transparent bg-base-200"
                          value={bill.gender}
                          onChange={(e) =>
                            handleChange("gender", e.target.value)
                          }
                          required
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Test Selection (Conditional) */}
                  {bill.billType === "Test" && (
                    <div className="bg-base-200 rounded p-6 shadow-sm">
                      <h2 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
                        Select Tests
                      </h2>

                      <div className="form-control">
                        <label className="label">
                          <span className="label-text font-medium">
                            Available Tests
                          </span>
                        </label>
                        <select
                          className="select select-bordered w-full focus:ring-2 focus:ring-primary focus:border-transparent bg-base-200"
                          onChange={handleTestSelect}
                          value={selectedTests.length > 0 ? "Select" : ""}
                        >
                          <option value="">Select a test</option>
                          {tests.map((test) => (
                            <option
                              key={test.description}
                              value={test.description}
                            >
                              {" "}
                              {test.code}:{test.description} - ৳{test.rate}{" "}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedTests.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <div className="overflow-x-auto">
                            <table className="table w-full">
                              <thead>
                                <tr>
                                  <th className="bg-base-300">Test Name</th>
                                  <th className="bg-base-300">Price</th>
                                  <th className="bg-base-300">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedTests.map((test) => (
                                  <tr
                                    key={test.name}
                                    className="hover:bg-base-300"
                                  >
                                    <td className="font-medium">
                                      {test.description}
                                    </td>
                                    <td>৳{test.rate}</td>
                                    <td>
                                      <button
                                        type="button"
                                        className="btn btn-xs btn-error text-white"
                                        onClick={() =>
                                          removeTest(test.description)
                                        }
                                      >
                                        Remove
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Doctor/Referral Section */}
                <div className="bg-base-200 rounded p-6 shadow-sm">
                  {bill.billType === "Doctor Visit" ? (
                    <>
                      <h2 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
                        Doctor Visit Details
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium">
                              Doctor
                            </span>
                          </label>
                          <select
                            className="select select-bordered w-full focus:ring-2 focus:ring-primary focus:border-transparent bg-base-200"
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
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium">
                              Doctor Fee
                            </span>
                          </label>
                          <input
                            type="number"
                            placeholder="Doctor Fee"
                            className="input input-bordered w-full focus:ring-2 focus:ring-primary focus:border-transparent bg-base-200"
                            value={bill.doctorFee}
                            onChange={(e) =>
                              handleChange("doctorFee", e.target.value)
                            }
                            min={0}
                            required
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold text-base-content mb-4 flex items-center gap-2">
                        Referral Information
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium">
                              Referral Doctor
                            </span>
                          </label>
                          <select
                            className="select select-bordered w-full focus:ring-2 focus:ring-primary focus:border-transparent bg-base-200"
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
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium">
                              Doctor Referral Fee
                            </span>
                          </label>
                          <input
                            type="number"
                            placeholder="Doctor Referral Fee"
                            className="input input-bordered w-full focus:ring-2 focus:ring-primary focus:border-transparent bg-base-200"
                            value={bill.referralDoctorFee}
                            onChange={(e) =>
                              handleChange("referralDoctorFee", e.target.value)
                            }
                            min={0}
                            disabled={!bill.referralDoctorName}
                          />
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium">
                              Referral PC
                            </span>
                          </label>
                          <select
                            className="select select-bordered w-full focus:ring-2 focus:ring-primary focus:border-transparent bg-base-200"
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
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-medium">
                              PC Referral Fee
                            </span>
                          </label>
                          <input
                            type="number"
                            placeholder="PC Referral Fee"
                            className="input input-bordered w-full focus:ring-2 focus:ring-primary focus:border-transparent bg-base-200"
                            value={bill.referralPcFee}
                            onChange={(e) =>
                              handleChange("referralPcFee", e.target.value)
                            }
                            min={0}
                            disabled={!bill.referralPcName}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Discount and Payment Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Discount (%)
                      </span>
                    </label>
                    <input
                      type="number"
                      placeholder="Discount in %"
                      className="input input-bordered w-full focus:ring-2 focus:ring-primary focus:border-transparent bg-base-200"
                      value={bill.discount}
                      onChange={(e) => handleChange("discount", e.target.value)}
                      min={0}
                      max={100}
                      disabled={bill.grossAmount <= 0}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Extra Discount
                      </span>
                    </label>
                    <input
                      type="number"
                      placeholder="Extra Discount"
                      className="input input-bordered w-full focus:ring-2 focus:ring-primary focus:border-transparent bg-base-200"
                      value={bill.extraDiscount}
                      onChange={(e) =>
                        handleChange("extraDiscount", e.target.value)
                      }
                      min={0}
                      disabled={bill.grossAmount <= 0}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Received Amount
                      </span>
                    </label>
                    <input
                      type="number"
                      placeholder="Received Amount"
                      className="input input-bordered w-full focus:ring-2 focus:ring-primary focus:border-transparent bg-base-200"
                      value={bill.receivedAmount}
                      onChange={(e) =>
                        handleChange("receivedAmount", e.target.value)
                      }
                      min={0}
                      max={bill.totalAmount}
                      disabled={bill.totalAmount <= 0}
                    />
                  </div>
                </div>

                <button
                  className="btn btn-primary w-full mt-4 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  type="submit"
                >
                  Submit Bill
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </form>

            {/* Summary Card */}
            <div className="card w-full lg:w-1/4 bg-base-100 rounded roundederflow-hidden h-fit sticky top-6">
              <div className="card-body p-6">
                <h2 className="card-title text-base-content border-b border-base-300 pb-4">
                  Payment Summary
                </h2>

                <div className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Gross Amount:</span>
                    <span className="font-semibold">৳{bill.grossAmount}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Discount:</span>
                    <span className="font-semibold text-error">
                      -৳{(bill.grossAmount * (bill.discount / 100)).toFixed(2)}
                    </span>
                  </div>

                  {bill.extraDiscount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Extra Discount:</span>
                      <span className="font-semibold text-error">
                        -৳{bill.extraDiscount}
                      </span>
                    </div>
                  )}

                  <div className="divider my-1"></div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total Amount:</span>
                    <span className="font-bold text-lg text-primary">
                      ৳{bill.totalAmount}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Received Amount:</span>
                    <span className="font-semibold text-success">
                      ৳{receivedAmount}
                    </span>
                  </div>

                  <div className="divider my-1"></div>

                  <div className="flex justify-between items-center">
                    <span className="font-bold">Due Amount:</span>
                    <span
                      className={`font-bold text-lg ${
                        bill.due > 0 ? "text-warning" : "text-success"
                      }`}
                    >
                      ৳{bill.due}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Newbill;
