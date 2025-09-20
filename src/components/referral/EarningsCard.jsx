// EarningsCard.jsx
import { Card, Collapse } from "antd";

const { Panel } = Collapse;

const EarningsCard = ({ title, items, type, searchTerm = "" }) => {
  // Filter by search term
  const filteredItems =
    items?.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Total earnings
  const total = filteredItems.reduce(
    (sum, item) => sum + parseFloat(item.totalEarnings || 0),
    0
  );

  return (
    <Card
      title={title}
      bordered
      style={{ flex: 1, maxHeight: 500, overflowY: "auto" }}
    >
      {filteredItems.length ? (
        <Collapse accordion>
          {filteredItems.map((item) => (
            <Panel
              header={`${item.name} — ৳ ${parseFloat(
                item.totalEarnings || 0
              ).toFixed(2)}`}
              key={item.id}
            >
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="pr-4">Bill ID</th>
                    <th className="pr-4">Date</th>
                    <th className="pr-4">Patient ID</th>
                    <th className="pr-4">Fee</th>
                    <th className="pr-4">Gross Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {item.bills.map((bill) => (
                    <tr key={bill.id} className="border-t">
                      <td className="pr-4">{bill.idNo}</td>
                      <td className="pr-4">{bill.date}</td>
                      <td className="pr-4">{bill.patientId}</td>
                      <td className="pr-4">
                        {type === "doctor"
                          ? bill.doctorReferralFee
                          : bill.pcReferralFee}
                      </td>
                      <td className="pr-4">{bill.grossAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          ))}
        </Collapse>
      ) : (
        <p>No referrals found.</p>
      )}
      <p className="text-right font-semibold mt-2">
        Total: ৳ {total.toFixed(2)}
      </p>
    </Card>
  );
};

export default EarningsCard;
