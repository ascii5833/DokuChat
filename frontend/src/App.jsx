
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

  const [sessionId, setSessionId] = useState(null);
  //pdf and session mapping
  const [pdfSession, setPdfSession] = useState({});
  //clear messages
  const [clearMessages, setClearMessages] = useState(0);

  //trigger clear
  const triggerClearMessages = ()=>{
    setClearMessages(prev=> prev + 1);
  }
  //document list click handler
  const handleDocClick = async ({pdf_id, name, n_pages}) => {

    try {
        const pdf_url = `http://127.0.0.1:8000/pdf/${pdf_id}`;

        setPages(n_pages);
        setCurPdf(pdf_url);
        setPdfId(pdf_id);

        let session_id = pdfSession[pdf_id];

        if (!session_id) {
            session_id = window.crypto.randomUUID();

            setPdfSession(prev => ({
                ...prev,
                [pdf_id]: session_id
            }));
        }

        setSessionId(session_id);
        setCurPage(1);
        triggerClearMessages();

    }
    catch(error) {
        console.error("Failed to load pdf " + error);
        alert("Failed to fetch pdf, please try again");
    }
};
 
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
    const pdf_id = data['filename'];
    const session_id = window.crypto.randomUUID();
    setPdfId(pdf_id);
    setSessionId(session_id);
    setPdfSession(prev=> ({ ...prev,
      [pdf_id] : session_id
    }))
    setCurPage(1);
   
    triggerClearMessages();

   }
   catch(error){
      console.error("Upload failed", error);
      setError(true);
      
   }
  

   }

  //handle chat send
  const sendChat = async (question)=>{
    setError(false);
    const payload = {
      question: question,
      pdf_id: pdfId,
      session_id: sessionId
      
    }

    try{
      const response = await fetch(`http://127.0.0.1:8000/chat/`, {
        method: "POST",
        body: JSON.stringify(payload),
        headers:{
          "Content-type": "application/json"
        }
      });

      if(!response.ok){
        throw new Error(`Something went wrong ${response.status}`);
      }

      const data = await response.json();
      const message = data['response']


      return message;


    }
    catch(error){
      console.error("Something happened when sending message to the chatbot.")
      setError(true);
      throw error;
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
          if(!pages || page > pages || page < 0 || isNaN(parseFloat(page))){
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
  <div className = "w-[40%] min-w-0">  <ChatWindow onCitiationClick={setCurrent} canChat = {pdfId && sessionId} sendChat = {sendChat}
  clearMessages = {clearMessages}/></div>
  </div>
  <div className="flex align-middle w-full justify-center mt-20">  
    <DocListWindow itemClicked = {handleDocClick}/>
  <UploadWindow handleSubmit = {handleSubmit}/>
  </div>

</div>



)
}

export default App
