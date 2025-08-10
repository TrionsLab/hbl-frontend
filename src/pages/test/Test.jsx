import React from "react";

const Test = () => {
  const handleClick = async () => {
    const patientData = {
      name: "Mahi",
      age: 26,
      gender: "Male",
      phone: "01700000000",
    };

    try {
      const response = await fetch("http://localhost:3000/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });

      const data = await response.json();
      alert("Insert response: " + JSON.stringify(data));
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div>
      <button onClick={handleClick} className="btn btn-primary">
        Insert Test Patient
      </button>
    </div>
  );
};

export default Test;
