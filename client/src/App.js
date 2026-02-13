import React, { useEffect, useState } from "react";

function App() {
  const [users, setUsers] = useState([]);

  // Veritabanından kullanıcıları çeken fonksiyon
  const getUsers = async () => {
    try {
      const response = await fetch("/users"); // package.json'daki proxy sayesinde 5000 portuna gider
      const jsonData = await response.json();
      setUsers(jsonData);
    } catch (err) {
      console.error("Veri çekme hatası:", err.message);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

  return (
    <div style={{ padding: "50px", fontFamily: "sans-serif", backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      <h1 style={{ color: "#333" }}>🚀 PERN Stack Kullanıcı Listesi</h1>
      <p>Veritabanından gelen canlı veriler:</p>
      
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
        <thead>
          <tr style={{ backgroundColor: "#007bff", color: "white", textAlign: "left" }}>
            <th style={{ padding: "12px" }}>Kullanıcı Adı</th>
            <th style={{ padding: "12px" }}>E-posta</th>
            <th style={{ padding: "12px" }}>ID</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id} style={{ backgroundColor: "white", borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "12px" }}>{user.user_name}</td>
              <td style={{ padding: "12px" }}>{user.user_email}</td>
              <td style={{ padding: "12px", fontSize: "12px", color: "#666" }}>{user.user_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {users.length === 0 && <p style={{ marginTop: "20px", color: "red" }}>Henüz kullanıcı bulunamadı veya sunucu hatası!</p>}
    </div>
  );
}

export default App;