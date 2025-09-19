import React, { useEffect, useState } from "react";
import { Select, Spin, InputNumber } from "antd";
import axios from "axios";
import PropTypes from "prop-types";

const { Option } = Select;

const ReferenceSelector = ({
  doctorValue,
  onDoctorChange,
  doctorFee,
  onDoctorFeeChange,
  primaryValue,
  onPrimaryChange,
  primaryFee,
  onPrimaryFeeChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [primaryCare, setPrimaryCare] = useState([]);

  useEffect(() => {
    const fetchReferences = async () => {
      try {
        setLoading(true);
        const [doctorRes, pcRes] = await Promise.all([
          axios.get("http://localhost:3000/api/doctors"),
          axios.get("http://localhost:3000/api/primary-care"),
        ]);
        setDoctors(doctorRes.data.data || []);
        setPrimaryCare(pcRes.data.data || []);
      } catch (err) {
        console.error("Error fetching references:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReferences();
  }, []);

  return (
    <div className="space-y-4">
      {/* --- Doctor Referral --- */}
      <div>
        <label className="block mb-1 font-medium">Doctor Referral</label>
        <Select
          value={doctorValue || null}
          onChange={(id) => {
            const doctor = doctors.find((d) => d.id === id);
            onDoctorChange(doctor);
          }}
          placeholder="Select doctor referral"
          className="w-full mb-2"
          loading={loading}
          showSearch
          filterOption={(input, option) =>
            option?.children?.toLowerCase().includes(input.toLowerCase())
          }
          notFoundContent={loading ? <Spin size="small" /> : "No doctors found"}
          allowClear
        >
          {doctors.map((doc) => (
            <Option key={doc.id} value={doc.id}>
              {doc.name} ({doc.specialization})
            </Option>
          ))}
        </Select>
        {doctorValue && (
          <InputNumber
            value={doctorFee}
            onChange={onDoctorFeeChange}
            min={0}
            placeholder="Referral fee"
            className="w-full"
          />
        )}
      </div>

      {/* --- Primary Care Referral --- */}
      <div>
        <label className="block mb-1 font-medium">Primary Care Referral</label>
        <Select
          value={primaryValue || null}
          onChange={(id) => {
            const ref = primaryCare.find((p) => p.id === id);
            onPrimaryChange(ref);
          }}
          placeholder="Select primary care referral"
          className="w-full mb-2"
          loading={loading}
          showSearch
          filterOption={(input, option) =>
            option?.children?.toLowerCase().includes(input.toLowerCase())
          }
          notFoundContent={loading ? <Spin size="small" /> : "No primary care found"}
          allowClear
        >
          {primaryCare.map((pc) => (
            <Option key={pc.id} value={pc.id}>
              {pc.name} ({pc.address})
            </Option>
          ))}
        </Select>
        {primaryValue && (
          <InputNumber
            value={primaryFee}
            onChange={onPrimaryFeeChange}
            min={0}
            placeholder="Referral fee"
            className="w-full"
          />
        )}
      </div>
    </div>
  );
};

ReferenceSelector.propTypes = {
  doctorValue: PropTypes.number,
  onDoctorChange: PropTypes.func.isRequired,
  doctorFee: PropTypes.number,
  onDoctorFeeChange: PropTypes.func.isRequired,
  primaryValue: PropTypes.number,
  onPrimaryChange: PropTypes.func.isRequired,
  primaryFee: PropTypes.number,
  onPrimaryFeeChange: PropTypes.func.isRequired,
};

export default ReferenceSelector;
