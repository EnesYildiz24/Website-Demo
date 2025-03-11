import React from "react";

export default function LoadingIndicator() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Laden...</span>
      </div>
    </div>
  );
}
