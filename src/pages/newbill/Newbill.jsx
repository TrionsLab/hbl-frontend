import { Button, Card, Input, Select, message } from "antd";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import DoctorVisit from "../../components/newbill/DoctorVisit";
import PatientDetailsForm from "../../components/newbill/PatientDetailsForm";
import ReferenceSelector from "../../components/newbill/ReferenceSelector";
import Test from "../../components/newbill/Test";
import Navbar from "../../components/navbar/Navbar";
import { createBill } from "../../api/billApi";

const { Option } = Select;

const NewBillPage = () => {
  const [loading, setLoading] = useState(false);
  const [receptionistId, setReceptionistId] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo?.id) {
      setReceptionistId(userInfo.id);
    } else {
      message.warning("Receptionist info not found in localStorage");
    }
  }, []);

  const initialValues = {
    name: "",
    phone: "",
    age: "",
    ageMonths: "",
    gender: "",
    patientId: null,
    receptionistId: receptionistId,
    billType: "Test",
    doctorReferralId: null,
    doctorReferralFee: 0,
    pcReferralId: null,
    pcReferralFee: 0,
    selectedTests: [],
    visitedDoctorId: null,
    doctorFee: 0,
    discount: 0,
    extraDiscount: 0,
    receivedAmount: 0,
    isPatientFound: null,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Patient name is required"),
    phone: Yup.string().required("Phone is required"),
    gender: Yup.string().required("Gender is required"),
    billType: Yup.string().required("Bill Type is required"),
  });

  const resetFieldsForBillType = (billType, setFieldValue) => {
    if (billType === "Test") {
      setFieldValue("visitedDoctorId", null);
      setFieldValue("doctorFee", 0);
    } else {
      setFieldValue("doctorReferralId", null);
      setFieldValue("doctorReferralFee", 0);
      setFieldValue("pcReferralId", null);
      setFieldValue("pcReferralFee", 0);
      setFieldValue("selectedTests", []);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    setLoading(true);

    try {
      const grossAmount =
        values.billType === "Test"
          ? values.selectedTests.reduce(
              (sum, test) => sum + Number(test.rate) * test.quantity,
              0
            )
          : values.doctorFee;

      const discountAmount = (grossAmount * values.discount) / 100;
      const totalAmount = grossAmount - discountAmount - values.extraDiscount;
      const due = totalAmount - values.receivedAmount;

      // ✅ Always send bill fields
      const payload = {
        idNo: `BILL-${new Date().getTime()}`,
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
        receptionistId,
        billType: values.billType,
        grossAmount,
        discount: discountAmount,
        extraDiscount: values.extraDiscount,
        totalAmount,
        receivedAmount: values.receivedAmount,
        due,
        doctorReferralId: values.doctorReferralId,
        doctorReferralFee: values.doctorReferralFee,
        pcReferralId: values.pcReferralId,
        pcReferralFee: values.pcReferralFee,
        selectedTests: values.billType === "Test" ? values.selectedTests : [],
        visitedDoctorId: values.visitedDoctorId,
        doctorFee: values.doctorFee,
        patientId: values.patientId,
        isPatientFound: values.isPatientFound,
      };

      // ✅ If patient is new, include details
      if (!values.isPatientFound) {
        payload.name = values.name;
        payload.age = values.age;
        payload.ageMonths = values.ageMonths;
        payload.gender = values.gender;
        payload.phone = values.phone;
      }

      console.log("Final Bill Payload:", payload);

      await createBill(payload);

      message.success("Bill submitted successfully!");
      resetForm();
    } catch (error) {
      console.error("Error submitting bill:", error);
      message.error(error.response?.data?.message || "Failed to submit bill");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Navbar on top, full width */}
      <div className="sticky top-0 z-50 bg-white shadow">
        <Navbar />
      </div>

      {/* Page content */}
      <div className="flex justify-center items-start p-6">
        <Card
          title={<span className="text-xl font-bold">Create New Bill</span>}
          className="w-full max-w-7xl"
        >
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            enableReinitialize
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue }) => {
              const grossAmount =
                values.billType === "Test"
                  ? values.selectedTests.reduce(
                      (sum, test) => sum + Number(test.rate) * test.quantity,
                      0
                    )
                  : values.doctorFee;
              const discountAmount = (grossAmount * values.discount) / 100;
              const totalAmount =
                grossAmount - discountAmount - values.extraDiscount;
              const due = totalAmount - values.receivedAmount;

              return (
                <Form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <Card className="border-gray-200 rounded-xl">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block mb-1 font-medium">
                            Bill Type
                          </label>
                          <Select
                            value={values.billType}
                            onChange={(value) => {
                              setFieldValue("billType", value);
                              resetFieldsForBillType(value, setFieldValue);
                            }}
                            className="w-full"
                          >
                            <Option value="Test">Test</Option>
                            <Option value="Doctor Visit">Doctor Visit</Option>
                          </Select>
                        </div>

                        <div>
                          <label className="block mb-1 font-medium">
                            Receptionist
                          </label>
                          <Input
                            value={`ID: ${receptionistId}`}
                            disabled
                            className="w-full bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </Card>

                    <Card className="border-gray-200 rounded-xl">
                      <h3 className="text-lg font-semibold mb-4">
                        Patient Details
                      </h3>
                      <PatientDetailsForm />
                    </Card>
                  </div>

                  {/* Middle Column */}
                  <div className="space-y-6">
                    {values.billType === "Test" && (
                      <Card className="border-gray-200 rounded-xl space-y-4">
                        <h3 className="text-lg font-semibold">
                          Tests & Referrals
                        </h3>
                        <Test
                          selectedTests={values.selectedTests}
                          onTestsChange={(tests) =>
                            setFieldValue("selectedTests", tests)
                          }
                        />
                        <ReferenceSelector
                          doctorValue={values.doctorReferralId}
                          onDoctorChange={(val) =>
                            setFieldValue("doctorReferralId", val?.id || null)
                          }
                          doctorFee={values.doctorReferralFee}
                          onDoctorFeeChange={(val) =>
                            setFieldValue("doctorReferralFee", val)
                          }
                          primaryValue={values.pcReferralId}
                          onPrimaryChange={(val) =>
                            setFieldValue("pcReferralId", val?.id || null)
                          }
                          primaryFee={values.pcReferralFee}
                          onPrimaryFeeChange={(val) =>
                            setFieldValue("pcReferralFee", val)
                          }
                        />
                      </Card>
                    )}

                    {values.billType === "Doctor Visit" && (
                      <Card className="border-gray-200 rounded-xl">
                        <h3 className="text-lg font-semibold">Doctor Visit</h3>
                        <DoctorVisit
                          doctorValue={values.visitedDoctorId}
                          onDoctorChange={(val) =>
                            setFieldValue("visitedDoctorId", val?.id || null)
                          }
                          doctorFee={values.doctorFee}
                          onDoctorFeeChange={(val) =>
                            setFieldValue("doctorFee", val)
                          }
                        />
                      </Card>
                    )}
                  </div>

                  {/* Right Column - Summary */}
                  <div className="space-y-6 sticky top-6">
                    <Card className="border-gray-200 rounded-xl space-y-4 bg-gray-50">
                      <h3 className="text-lg font-semibold mb-3">
                        Bill Summary
                      </h3>

                      <div className="space-y-2">
                        <p>
                          <strong>Gross Amount:</strong>{" "}
                          {grossAmount.toFixed(2)}
                        </p>

                        <div>
                          <label className="block text-sm font-medium">
                            Discount (%)
                          </label>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={values.discount}
                            onChange={(e) =>
                              setFieldValue("discount", Number(e.target.value))
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium">
                            Extra Discount
                          </label>
                          <Input
                            type="number"
                            min={0}
                            value={values.extraDiscount}
                            onChange={(e) =>
                              setFieldValue(
                                "extraDiscount",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium">
                            Received Amount
                          </label>
                          <Input
                            type="number"
                            min={0}
                            value={values.receivedAmount}
                            onChange={(e) =>
                              setFieldValue(
                                "receivedAmount",
                                Number(e.target.value)
                              )
                            }
                          />
                        </div>

                        <p>
                          <strong>Discount Amount:</strong>{" "}
                          {discountAmount.toFixed(2)}
                        </p>
                        <p>
                          <strong>Total:</strong> {totalAmount.toFixed(2)}
                        </p>
                        <p>
                          <strong>Due:</strong> {due.toFixed(2)}
                        </p>
                      </div>

                      <Button
                        type="primary"
                        htmlType="submit"
                        block
                        size="large"
                        loading={loading}
                      >
                        Submit Bill
                      </Button>
                    </Card>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </Card>
      </div>
    </div>
  );
};

export default NewBillPage;
