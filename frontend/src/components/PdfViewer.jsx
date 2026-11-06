import {useState} from 'react';
import {Document, pdfjs, Page} from 'react-pdf';
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

//pdfjs settings
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

//when pdf doesn't show up
const nopdf = <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg my-4">
            {/* Document / PDF Icon */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-12 h-12 text-slate-300 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
            </svg>
            <p className="text-sm font-medium text-slate-600">No PDF selected</p>
            <p className="text-xs text-slate-400 mt-1">
                Upload a document to preview it here
            </p>
        </div> 
    
const PdfViewer = ({onDocumentLoadSuccess, setCurrent, curPage, numPages, pdfPath}) => {
    

    return (
    <div className="h-175 w-full flex flex-col px-4 py-2 overflow-hidden">

        {/* PDF display area */}
        <div className="flex-1 min-h-0 overflow-auto">
            <Document
                file={pdfPath}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<p>Loading PDF...</p>}
                noData = {nopdf}
            >
                <Page
                    pageNumber={curPage}
                    width={700}
                />
            </Document>
        </div>

        {/* Pagination controls */}
        <div className="shrink-0 flex items-center justify-center gap-3 py-3 bg-white mt-10">

            <button
                disabled={curPage <= 1}
                onClick={() => setCurrent(curPage, "back")}
                className="h-10 bg-blue-400 hover:bg-blue-500 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-white rounded w-20"
            >
                Previous
            </button>

            <span className="whitespace-nowrap">
                Page {curPage} / {numPages}
            </span>

            <button
                disabled={curPage >= numPages}
                onClick={() => setCurrent(curPage, "forward")}
                className="h-10 bg-blue-400 hover:bg-blue-500 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed text-white rounded w-20"
            >
                Next
            </button>

        </div>
    </div>
);
}


export default PdfViewer;