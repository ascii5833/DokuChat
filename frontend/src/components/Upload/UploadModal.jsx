import React, {useState} from "react";


const UploadModal = ({toggleUpload, handleSubmit})=> {
    
//submission
const submitPdf =async (e)=>{
  setLoading(true);
  try{
  await handleSubmit(e);
    toggleUpload();
  }
  catch(error){
    console.error(`Failed to upload file, error : ${error}`)
    toggleUpload();
  }
  finally{
    setLoading(true);
  }
  
}

const [loading, setLoading] = useState(false);

return <div className={`fixed inset-0 p-4 flex justify-center items-center w-full h-full z-50 bg-black/50 transition ${loading ? "cursor-wait" : ""}`}>
      <div
        role="dialog"
        aria-modal="true"
        tabIndex="-1"
        className="w-200 h-100 bg-white border border-slate-100 shadow-lg rounded-lg relative max-h-[95vh] overflow-y-auto outline-none p-4 md:p-6"
      >
        {/* Header */}
        <div className="flex items-center pb-3 border-b border-blue-300">
          <h3 className="text-blue-400 text-2xl font-semibold inline">
            Upload PDF
          </h3>
          <button
            type="button"
            aria-label="Close modal"
            disabled={loading}
            className={`ml-auto flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={toggleUpload}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="size-3 cursor-pointer fill-blue-300 hover:fill-red-600"
              viewBox="0 0 329.269 329"
            >
              <path d="M194.8 164.77 323.013 36.555c8.343-8.34 8.343-21.825 0-30.164-8.34-8.34-21.825-8.34-30.164 0L164.633 134.605 36.422 6.391c-8.344-8.34-21.824-8.34-30.164 0-8.344 8.34-8.344 21.824 0 30.164l128.21 128.215L6.259 292.984c-8.344 8.344-8.344 21.825 0 30.164a21.27 21.27 0 0 0 15.082 6.25c5.46 0 10.922-2.09 15.082-6.25l128.21-128.214 128.216 128.214a21.27 21.27 0 0 0 15.082 6.25c8.343-8.34 8.343-21.824 0-30.164zm0 0" />
            </svg>
          </button>
        </div>

        {/* File Upload Form */}
        <form onSubmit={submitPdf} className="mt-7 mb-4 w-full">
          <label
            htmlFor="formFile"
            className="mb-4 inline-block text-neutral-300"
          >
            Click Choose file to choose pdf (.pdf)
          </label>
          
          <input
            disabled={loading}
            className={`relative m-0 block w-96 min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-white bg-clip-padding px-3 py-[0.32rem] text-base font-medium text-neutral-900 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-blue-400 file:px-3 file:py-[0.32rem] file:text-white file:transition-colors file:duration-300 file:ease-in-out hover:file:cursor-pointer hover:file:bg-blue-500 file:[border-inline-end-width:1px] file:me-3 focus:border-primary focus:text-neutral-950 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100 dark:file:bg-blue-300 dark:file:text-white dark:hover:file:bg-blue-500 dark:focus:border-primary ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            type="file"
            id="formFile"
            accept=".pdf"
          />

          <div className="flex w-full justify-center mt-5"> 
            <button
              type="submit"
              disabled={loading}
              className={`mt-4 px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white font-medium rounded transition duration-200 align-middle inline-flex items-center justify-center min-w-[130px] ${
                loading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Uploading...</span>
                </div>
              ) : (
                "Upload PDF"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
}

export default UploadModal;