import { DatePicker } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const DateRangePicker = ({ value, onChange, loading }) => {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="font-medium text-gray-700">Select Date Range:</span>
      <RangePicker
        value={value}
        onChange={onChange}
        format="YYYY-MM-DD"
        disabled={loading}
        allowClear={false}
        style={{ width: 300 }}
        disabledDate={(current) => current && current > dayjs().endOf("day")}
      />
    </div>
  );
};

export default DateRangePicker;
