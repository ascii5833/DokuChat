import React from "react";


const DocListModal = ({toggleDocList})=> {
return <div className="fixed inset-0 p-4 flex justify-center items-center w-full h-full z-50 bg-black/50 transition">
      
      <div
        role="dialog"
        aria-modal="true"
        tabIndex="-1"
        className="w-300 h-screen bg-white border border-slate-100 shadow-lg rounded-lg relative max-h-[95vh] overflow-y-auto outline-none p-4 md:p-6"
      >
        
        {/* Header */}
        <div className="flex items-center pb-3 border-b border-blue-300">
          
          <h3 className="text-blue-400 text-2xl font-semibold inline">
            
            Documents  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"
            className="size-7 fill-blue-400 inline">
            <path d="M528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112C434.9 112 528 205.1 528 320zM64 320C64 461.4 178.6 576 320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320zM296 184L296 320C296 328 300 335.5 306.7 340L402.7 404C413.7 411.4 428.6 408.4 436 397.3C443.4 386.2 440.4 371.4 429.3 364L344 307.2L344 184C344 170.7 333.3 160 320 160C306.7 160 296 170.7 296 184z"/></svg>

          </h3>
          <button
            type="button"
            aria-label="Close modal"
            className="ml-auto flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
            onClick = {toggleDocList}
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
        {/* Form */}
        <div>
            <ul>
                First
            </ul>
            <ul>
                Second
            </ul>
            <ul>
                Third
            </ul>
        </div>
      </div>
    </div>
}

export default DocListModal;