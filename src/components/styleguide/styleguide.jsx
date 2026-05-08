import React from "react";
import "./styleguide.css";

const StyleGuide = () => {
  return (
    <div className="pdf-container">
      <iframe
        src="/style-guide.pdf"
        className="pdf-viewer"
        title="Style Guide"
      />
    </div>
  );
};

export default StyleGuide;
