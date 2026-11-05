import {useState} from 'react';
import {Document, pdfjs, Page} from 'react-pdf';
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

//pdfjs settings
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

const PdfViewer = ({onDocumentLoadSuccess, setCurrent, curPage, numPages}) => {
    

    return (
    <div className="h-175 w-full flex flex-col px-4 py-2 overflow-hidden">

        {/* PDF display area */}
        <div className="flex-1 min-h-0 overflow-auto">
            <Document
                file="/research_paper.pdf"
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<p>Loading PDF...</p>}
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