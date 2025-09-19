import { Input, InputNumber } from "antd";

const BillingAmounts = ({
  grossAmount,
  discount,
  extraDiscount,
  receivedAmount,
  onDiscountChange,
  onExtraDiscountChange,
  onReceivedAmountChange,
}) => {
  const discountAmount = (grossAmount * discount) / 100; // percentage
  const totalAmount = grossAmount - discountAmount - extraDiscount; // extraDiscount is fixed
  const due = totalAmount - receivedAmount;

  return (
    <div className="space-y-3">
      <div>
        <label className="block mb-1 font-medium">Gross Amount</label>
        <Input value={grossAmount.toFixed(2)} disabled />
      </div>

      <div>
        <label className="block mb-1 font-medium">Discount (%)</label>
        <InputNumber
          min={0}
          max={100}
          value={discount}
          onChange={onDiscountChange}
          className="w-full"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Extra Discount (Fixed)</label>
        <InputNumber
          min={0}
          max={grossAmount}
          value={extraDiscount}
          onChange={onExtraDiscountChange}
          className="w-full"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Total Amount</label>
        <Input value={totalAmount.toFixed(2)} disabled />
      </div>

      <div>
        <label className="block mb-1 font-medium">Received Amount</label>
        <InputNumber
          min={0}
          max={totalAmount}
          value={receivedAmount}
          onChange={onReceivedAmountChange}
          className="w-full"
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">Due Amount</label>
        <Input value={due.toFixed(2)} disabled />
      </div>
    </div>
  );
};

export default BillingAmounts;
