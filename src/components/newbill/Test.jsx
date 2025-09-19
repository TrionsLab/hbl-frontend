import React, { useEffect, useState } from "react";
import { Select, Spin, InputNumber } from "antd";
import axios from "axios";
import PropTypes from "prop-types";

const { Option } = Select;

const Test = ({ selectedTests, onTestsChange }) => {
  const [loading, setLoading] = useState(false);
  const [tests, setTests] = useState([]);

  // ✅ Fetch tests from API
  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:3000/api/tests");
        setTests(res.data.data || []);
      } catch (err) {
        console.error("Error fetching tests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  // ✅ Handle selection
  const handleSelectChange = (selectedIds) => {
    const updatedTests = selectedIds.map((id) => {
      const existing = selectedTests.find((t) => t.id === id);
      if (existing) return existing;
      const selectedTest = tests.find((t) => t.id === id);
      return { ...selectedTest, quantity: 1 };
    });
    onTestsChange(updatedTests);
  };

  // ✅ Handle quantity change
  const handleQuantityChange = (id, quantity) => {
    const updatedTests = selectedTests.map((test) =>
      test.id === id ? { ...test, quantity } : test
    );
    onTestsChange(updatedTests);
  };

  // ✅ Search filter
  const filterTests = (input, option) => {
    const test = option?.testData;
    return (
      test.description.toLowerCase().includes(input.toLowerCase()) ||
      test.id.toString().includes(input)
    );
  };

  return (
    <div>
      <h3 className="text-md font-semibold mb-3">Select Tests</h3>
      <Select
        mode="multiple"
        allowClear
        placeholder="Search and select tests by name or ID"
        className="w-full"
        value={selectedTests.map((test) => test.id)}
        onChange={handleSelectChange}
        loading={loading}
        filterOption={filterTests}
        notFoundContent={loading ? <Spin size="small" /> : "No tests found"}
      >
        {tests.map((test) => (
          <Option key={test.id} value={test.id} testData={test}>
            {`${test.id} - ${test.description} (${test.rate}৳)`}
          </Option>
        ))}
      </Select>

      {selectedTests.length > 0 && (
        <div className="mt-4 space-y-3">
          {selectedTests.map((test) => (
            <div
              key={test.id}
              className="p-3 border rounded-lg flex justify-between items-center bg-gray-50"
            >
              <div>
                <span className="font-medium">{test.description}</span>
                <span className="ml-2 text-gray-500 text-sm">
                  ({test.rate}৳)
                </span>
              </div>
              <InputNumber
                min={1}
                value={test.quantity}
                onChange={(value) => handleQuantityChange(test.id, value)}
              />
            </div>
          ))}

          <div className="text-right font-semibold mt-3">
            Total:{" "}
            {selectedTests.reduce(
              (sum, test) => sum + test.rate * test.quantity,
              0
            )}
            ৳
          </div>
        </div>
      )}
    </div>
  );
};

Test.propTypes = {
  selectedTests: PropTypes.array.isRequired,
  onTestsChange: PropTypes.func.isRequired,
};

export default Test;
