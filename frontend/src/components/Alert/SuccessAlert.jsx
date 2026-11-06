import React, { useState, useEffect } from 'react';

export default function SuccessAlert({message = null}) {
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {

    const timer = setTimeout(() => {
      setShowAlert(false);
    }, 3000);

    //cleanup
    return () => clearTimeout(timer);
  }, []);

  if (!showAlert) return null;

  return (
    <div className="fixed top-5 right-5 z-1000 max-w-md animate-fade-in-up">
      <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-lg" role="alert">
        {/* Success Icon */}
        <svg className="h-5 w-5 shrink-0 text-emerald-600" xmlns="http://w3.org" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>

    
        <div className="flex-1 text-sm font-medium">
         {message ? message : "Changes saved successfully..."}
        </div>

        {/* Manual Close Button */}
        <button 
          onClick={() => setShowAlert(false)}
          className="ml-auto inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-emerald-500 hover:bg-emerald-100 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
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