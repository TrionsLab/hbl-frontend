// import deleteIcon from "../../assets/delete.png";
import restoreIcon from "/assets/restore.png";

const ArchiveTable = ({
  bills,
  formatToDDMMYY,
  // handleDelete,
  handleRestore,
}) => {
  return (
    <div className=" shadow-md rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 w-40">
              ID
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 w-40">
              Date/Time
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 w-40">
              Patient
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 w-40">
              Doctor
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 w-40">
              Referrals
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 w-32">
              Bill Details
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 w-32">
              Payment Status
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-700 uppercase tracking-wider border-r border-gray-200 w-40">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bills
            .filter((bill) => bill.archive)
            .map((bill) => (
              <tr key={bill.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 border-r">
                  <div
                    className="font-medium text-gray-900 truncate"
                    title={bill.id}
                  >
                    {bill.id}
                  </div>
                  <div className="text-gray-600 text-xs">{bill.billType}</div>
                </td>
                <td className="px-3 py-2 border-r">
                  {formatToDDMMYY(bill.date)} <br /> {bill.time}
                </td>
                <td className="px-3 py-2 border-r">
                  <div
                    className="font-medium text-gray-900 truncate"
                    title={bill.name}
                  >
                    {bill.name}
                  </div>
                  <div className="text-gray-600 text-xs">
                    {bill.age} yrs
                    {bill.ageMonths ? `, ${bill.ageMonths} mos` : ""} |{" "}
                    {bill.gender} <br />
                    <span className="font-medium">Phone:</span> {bill.phone}
                  </div>
                </td>
                <td className="px-3 py-2 border-r">
                  <div className="text-gray-900 truncate" title={bill.doctor}>
                    {bill.doctor && bill.doctor.length > 0
                      ? bill.doctor.length > 20
                        ? `${bill.doctor.substring(0, 20)}...`
                        : bill.doctor
                      : "-"}
                  </div>
                </td>
                <td className="px-3 py-2 border-r">
                  {bill.referralDoctorName && (
                    <div className="mb-1">
                      <span className="font-medium text-gray-700 text-xs">
                        Dr:
                      </span>{" "}
                      <span
                        className="text-gray-900 truncate"
                        title={bill.referralDoctorName}
                      >
                        {bill.referralDoctorName.length > 20
                          ? `${bill.referralDoctorName.substring(0, 20)}...`
                          : bill.referralDoctorName}
                      </span>{" "}
                      <span className="text-gray-600 text-xs">
                        (৳{bill.referralDoctorFee})
                      </span>
                    </div>
                  )}
                  {bill.referralPcName && (
                    <div>
                      <span className="font-medium text-gray-700 text-xs">
                        PC:
                      </span>{" "}
                      <span
                        className="text-gray-900 truncate"
                        title={bill.referralPcName}
                      >
                        {bill.referralPcName.length > 20
                          ? `${bill.referralPcName.substring(0, 20)}...`
                          : bill.referralPcName}
                      </span>{" "}
                      <span className="text-gray-600 text-xs">
                        (৳{bill.referralPcFee})
                      </span>
                    </div>
                  )}
                  {!bill.referralDoctorName && !bill.referralPcName && "-"}
                </td>

                <td className="px-3 py-2 border-r">
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="text-gray-700">Gross:</span>{" "}
                      <span className="text-gray-900">৳{bill.grossAmount}</span>
                    </div>
                    <div>
                      <span className="text-gray-700">Total Discount:</span> ৳{" "}
                      {(
                        (Number(bill.grossAmount || 0) *
                          Number(bill.discount || 0)) /
                          100 +
                        Number(bill.extraDiscount || 0)
                      ).toFixed(2)}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">
                        Due: ৳{bill.due}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">
                        Total: ৳{bill.totalAmount}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2 border-r">
                  <div className="text-center">
                    {bill.due > 0 ? (
                      <>
                        <div className="badge font-medium badge-warning">
                          {bill.due} Tk Due
                        </div>
                        <br />
                      </>
                    ) : (
                      <div className="badge badge-success text-white">Paid</div>
                    )}
                  </div>
                </td>
                <td className="p-8 flex justify-center gap-2">
                  <button
                    onClick={() => handleRestore(bill.id)}
                    className="text-red-600 hover:text-red-800 flex items-center"
                    title="Restore Bill"
                  >
                    <img src={restoreIcon} width={28} alt="Restore" />
                  </button>
                  {/* <button
                    onClick={() => handleDelete(bill.id)}
                    className="text-red-600 hover:text-red-800 flex items-center"
                    title="Delete permanently"
                  >
                    <img src={deleteIcon} width={28} alt="Delete" />
                  </button> */}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default ArchiveTable;
