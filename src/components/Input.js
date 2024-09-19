import { useState } from "react";

export default function Input({ placeholder, btnText, onClick }) {
  const [input, setInput] = useState("");

  function handleClick() {
    onClick(input);
    setInput("");
  }

  return (
    <div className="input-container">
      <input
        className="input"
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button className="btn btn-primary" onClick={handleClick}>
        {btnText}
      </button>
    </div>
  );
}
