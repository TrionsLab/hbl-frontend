import React, { useEffect, useState } from "react";
import { Select, Spin, InputNumber } from "antd";
import axios from "axios";
import PropTypes from "prop-types";

const { Option } = Select;

const DoctorVisit = ({ doctorValue, onDoctorChange, doctorFee, onDoctorFeeChange }) => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:3000/api/doctors");
        setDoctors(res.data.data || []);
      } catch (err) {
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  return (
    <div>
      <label className="block mb-1 font-medium">Select Doctor</label>
      <Select
        value={doctorValue || null}
        onChange={(id) => {
          const doctor = doctors.find((d) => d.id === id);
          onDoctorChange(doctor);
        }}
        placeholder="Search and select doctor"
        className="w-full mb-3"
        loading={loading}
        showSearch
        filterOption={(input, option) =>
          option?.children?.toLowerCase().includes(input.toLowerCase())
        }
        notFoundContent={loading ? <Spin size="small" /> : "No doctors found"}
      >
        {doctors.map((doc) => (
          <Option key={doc.id} value={doc.id}>
            {doc.name} ({doc.specialization})
          </Option>
        ))}
      </Select>

      {doctorValue && (
        <div>
          <label className="block mb-1 font-medium">Doctor Fee</label>
          <InputNumber
            value={doctorFee}
            onChange={onDoctorFeeChange}
            min={0}
            className="w-full"
            placeholder="Enter doctor fee"
          />
        </div>
      )}
    </div>
  );
};

DoctorVisit.propTypes = {
  doctorValue: PropTypes.number,
  onDoctorChange: PropTypes.func.isRequired,
  doctorFee: PropTypes.number,
  onDoctorFeeChange: PropTypes.func.isRequired,
};

export default DoctorVisit;
