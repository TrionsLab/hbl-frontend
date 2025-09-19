import { Button, Form, Input, message, Select } from "antd";
import axios from "axios";
import { useFormikContext } from "formik";
import { useState } from "react";

const { Option } = Select;

const PatientDetailsForm = () => {
  const { values, setFieldValue } = useFormikContext();
  const [loading, setLoading] = useState(false);

  // ✅ Fetch patient by phone number
  const fetchPatientByPhone = async () => {
    if (!values.phone.trim()) {
      message.error("Please enter a phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3000/api/patient/${values.phone}`
      );

      const patient = res.data?.data;
      const randomId = 3;

      if (patient) {
        // ✅ Update form fields
        setFieldValue("name", patient.name || "");
        setFieldValue("age", patient.age || "");
        setFieldValue("ageMonths", patient.ageMonths || "");
        setFieldValue("gender", patient.gender || "");
        setFieldValue("phone", patient.phone || "");

        // ✅ Most Important: set patientId
        setFieldValue("patientId", patient.id);

        message.success("Patient data loaded!");
      } else {
        message.warning("No patient found for this phone number.");

        // 👇 Assign a random fallback patientId
        setFieldValue("patientId", randomId);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch patient data.");
      const randomId = 3;
      setFieldValue("patientId", randomId);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      {/* Phone Input + Fetch Button */}
      <div className="flex gap-4">
        {/* Phone Input */}
        <Form.Item label="Phone" className="flex-1">
          <Input
            value={values.phone}
            onChange={(e) => setFieldValue("phone", e.target.value)}
            placeholder="01XXXXXXXXX"
          />
        </Form.Item>

        {/* Fetch Button */}
        <Button type="dashed" loading={loading} onClick={fetchPatientByPhone}>
          Fetch Patient
        </Button>
      </div>

      {/* Name */}
      <Form.Item label="Name">
        <Input
          value={values.name}
          onChange={(e) => setFieldValue("name", e.target.value)}
          placeholder="Patient Name"
        />
      </Form.Item>

      {/* Age (Years + Months) */}
      <div className="flex gap-4">
        <Form.Item label="Age (Years)" style={{ flex: 1 }}>
          <Input
            type="number"
            value={values.age}
            onChange={(e) => setFieldValue("age", e.target.value)}
          />
        </Form.Item>
        <Form.Item label="Age (Months)" style={{ flex: 1 }}>
          <Input
            type="number"
            value={values.ageMonths}
            onChange={(e) => setFieldValue("ageMonths", e.target.value)}
          />
        </Form.Item>
      </div>

      {/* Gender Dropdown */}
      <Form.Item label="Gender">
        <Select
          value={values.gender}
          onChange={(value) => setFieldValue("gender", value)}
          placeholder="Select Gender"
          className="w-full"
        >
          <Option value="Male">Male</Option>
          <Option value="Female">Female</Option>
        </Select>
      </Form.Item>
    </div>
  );
};

export default PatientDetailsForm;
