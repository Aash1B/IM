"use client";

import React from "react";

export function FullPageLoader() {
  return (
    <div className="full-loader-stage" role="status" aria-label="Loading Dashboard">
      <div className="loader-wrap">
        <div className="gear-stage">
          <div className="gear gear-big">
            <svg viewBox="0 0 100 100">
              <path className="tooth" d="M50 4 L58 4 L60 16 C65 17.5 69.5 19.8 73.5 22.7 L84.5 17.8 L91.2 25.5 L85 35 C88 39 90 43.9 90.9 49 L100 52 L100 60 L90.9 63 C90 68.1 88 73 85 77 L91.2 86.5 L84.5 94.2 L73.5 89.3 C69.5 92.2 65 94.5 60 96 L58 108 L50 108 L42 108 L40 96 C35 94.5 30.5 92.2 26.5 89.3 L15.5 94.2 L8.8 86.5 L15 77 C12 73 10 68.1 9.1 63 L0 60 L0 52 L9.1 49 C10 43.9 12 39 15 35 L8.8 25.5 L15.5 17.8 L26.5 22.7 C30.5 19.8 35 17.5 40 16 L42 4 Z"/>
              <circle className="ring" cx="50" cy="56" r="34" fill="var(--loader-bg-1)"/>
              <circle className="tooth" cx="50" cy="56" r="34"/>
              <circle cx="50" cy="56" r="22" fill="var(--loader-bg-1)"/>
            </svg>
          </div>

          <div className="gear gear-mid">
            <svg viewBox="0 0 100 100">
              <path className="tooth" d="M50 4 L58 4 L60 16 C65 17.5 69.5 19.8 73.5 22.7 L84.5 17.8 L91.2 25.5 L85 35 C88 39 90 43.9 90.9 49 L100 52 L100 60 L90.9 63 C90 68.1 88 73 85 77 L91.2 86.5 L84.5 94.2 L73.5 89.3 C69.5 92.2 65 94.5 60 96 L58 108 L50 108 L42 108 L40 96 C35 94.5 30.5 92.2 26.5 89.3 L15.5 94.2 L8.8 86.5 L15 77 C12 73 10 68.1 9.1 63 L0 60 L0 52 L9.1 49 C10 43.9 12 39 15 35 L8.8 25.5 L15.5 17.8 L26.5 22.7 C30.5 19.8 35 17.5 40 16 L42 4 Z"/>
              <circle className="ring" cx="50" cy="56" r="34" fill="var(--loader-bg-1)"/>
              <circle className="tooth" cx="50" cy="56" r="34"/>
              <circle cx="50" cy="56" r="22" fill="var(--loader-bg-1)"/>
            </svg>
          </div>

          <div className="gear gear-small">
            <svg viewBox="0 0 100 100">
              <path className="tooth" d="M50 4 L58 4 L60 16 C65 17.5 69.5 19.8 73.5 22.7 L84.5 17.8 L91.2 25.5 L85 35 C88 39 90 43.9 90.9 49 L100 52 L100 60 L90.9 63 C90 68.1 88 73 85 77 L91.2 86.5 L84.5 94.2 L73.5 89.3 C69.5 92.2 65 94.5 60 96 L58 108 L50 108 L42 108 L40 96 C35 94.5 30.5 92.2 26.5 89.3 L15.5 94.2 L8.8 86.5 L15 77 C12 73 10 68.1 9.1 63 L0 60 L0 52 L9.1 49 C10 43.9 12 39 15 35 L8.8 25.5 L15.5 17.8 L26.5 22.7 C30.5 19.8 35 17.5 40 16 L42 4 Z"/>
              <circle className="ring" cx="50" cy="56" r="34" fill="var(--loader-bg-1)"/>
              <circle className="tooth" cx="50" cy="56" r="34"/>
              <circle cx="50" cy="56" r="22" fill="var(--loader-bg-1)"/>
            </svg>
          </div>
        </div>

        <div className="loader-label">
          Loading Dashboard
          <span className="loader-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </div>
      </div>
    </div>
  );
}
