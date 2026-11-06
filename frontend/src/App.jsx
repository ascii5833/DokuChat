
import './App.css'
import PdfViewer from './components/PdfViewer'
import Header from './components/Header'
import ChatWindow from './components/Chat/ChatWindow'
import DocListWindow from './components/DocList/DocListWindow'
import UploadWindow from './components/Upload/UploadWindow'
import { useState} from 'react'
import SuccessAlert from './components/Alert/SuccessAlert'
import ErrorAlert from './components/Alert/ErrorAlert'

function App() {
  const [numPages, setNumPages] = useState(null);

  const [curPage, setCurPage] = useState(1);

  const [curPdf, setCurPdf] = useState(null);

  const [pages, setPages] = useState(null);

  const [success, setSuccess] = useState(false);

  const [error, setError] = useState(false);

  const [pdfId, setPdfId] = useState(null);

  //document list click handler
  const handleDocClick = async ({pdf_id, name, n_pages}) => {
    try{
      
      const pdf_url = `http://127.0.0.1:8000/pdf/${pdf_id}`

      setPages(n_pages);

      setCurPdf(pdf_url);

      setPdfId(pdf_id);

      setCurPage(1);

    }
    catch(error){
      console.error("Failed to load pdf " + error);
      alert("Failed to fetch pdf, please try again");
    }
      
  }
 
  //handle document submit
  const handleSubmit = async (e)=>{
    e.preventDefault();
    setSuccess(false);
    setError(false);
    const fileInput = document.getElementById("formFile");
    const file = fileInput.files[0];

    if(!file){
      alert("Please select a pdf file first.");
      return;
    }

    const formdata = new FormData();
    formdata.append("pdf", file);

   try{
    const response = await fetch("http://127.0.0.1:8000/upload_pdf/", {
      method: "POST",
      body: formdata
    });
    if(!response.ok){
          throw new Error(`Something went wrong ${response.status}`)
        }
    const data = await response.json();

    const pdf_url = `http://127.0.0.1:8000/pdf/${data.filename}`;

    const n_pages = parseInt(data['n_pages']);

    setPages(n_pages);

    setCurPdf(pdf_url);

    setSuccess(true);
    
    setPdfId(data['pdf_id']);
   
    

   }
   catch(error){
      console.error("Upload failed", error);
      setError(true);
      
   }
  


  }

  //pdf loaded successfully
   const onDocumentLoadSuccess = ({numPages}) => {
        setNumPages(numPages);
    }
  //set current page on citiation click
  const setCurrent = (page, type) =>{
        if(type == "back"){
          setCurPage(p=>p-1);
        }
        else if(type == "forward"){
          setCurPage(p => p+1);
        }

        else if (type == "spec"){
          if(!pages || page > pages || page < 0){
            alert("Invalid page.")
            return;
          }
          setCurPage(page);
        }
    }

return (

<div>
  {success? <SuccessAlert message = {"Pdf uploaded successfully"}/> : null}
  {error? <ErrorAlert message = {"Something went wrong.., please try again"} /> : null}
  <Header />
<div className = "h-full flex justify-between pt-10"> 
  <div className= "w-[60%] min-w-0">
    <PdfViewer onDocumentLoadSuccess={onDocumentLoadSuccess}
setCurrent={setCurrent} curPage={curPage} numPages={numPages} pdfPath = {curPdf}/> 
  </div>
  <div className = "w-[40%] min-w-0">  <ChatWindow onCitiationClick={setCurrent}/></div>
  </div>
  <div className="flex align-middle w-full justify-center mt-20">  
    <DocListWindow itemClicked = {handleDocClick}/>
  <UploadWindow handleSubmit = {handleSubmit}/>
  </div>

</div>



)
}

export default App
