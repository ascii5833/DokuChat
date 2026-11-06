import React, { useState, useEffect } from 'react';

export default function ErrorAlert({message = null}) {
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 3000);


    return () => clearTimeout(timer);
  }, []);

  if (!showAlert) return null;

  return (
    <div className="fixed top-5 right-5 z-1000 max-w-md animate-fade-in-up">
      <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 shadow-lg" role="alert">
        {/* Error / Danger Icon */}
        <svg className="h-5 w-5 shrink-0 text-red-600" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>

        <div className="flex-1 text-sm font-medium">
          {message ? message : "An error occured.."}
        </div>

        {/* Manual Close Button */}
        <button 
          onClick={() => setShowAlert(false)}
          className="ml-auto inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-red-500 hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
          aria-label="Close"
        >
          <svg className="h-4 w-4" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}