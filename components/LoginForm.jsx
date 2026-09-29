"use client";
import { useState } from "react";

export default function LoginForm({ onLogin }) {
  const [name, setName] = useState("");
  return (
    <div className="panel login">
      <h1>Kanji Test</h1>
      <label>Your Name
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <button disabled={!name.trim()} onClick={() => onLogin(name.trim())}>Login</button>
    </div>
  );
}
