
import './App.css'
import PdfViewer from './components/PdfViewer'
import Header from './components/Header'
import ChatWindow from './components/Chat/ChatWindow'
import DocListWindow from './components/DocList/DocListWindow'
import UploadWindow from './components/Upload/UploadWindow'
import { useState} from 'react'


function App() {
  const [numPages, setNumPages] = useState(null);

  const [curPage, setCurPage] = useState(1);

  const [curPdf, setCurPdf] = useState(null);

  const [pages, setPages] = useState(null);

  

  //handle document submit
  const handleSubmit = async (e)=>{
    e.preventDefault();

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

    const data = await response.json();

    const pdf_url = `http://127.0.0.1:8000/pdf/${data.filename}`;

    const n_pages = parseInt(data['n_pages']);

    setPages(n_pages);

    setCurPdf(pdf_url);

   }
   catch(error){
      console.error("Upload failed", error);
      alert("Failed to upload pdf, please try again..");
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
            alert("Invalid page, ai error");
            return;
          }
          setCurPage(page);
        }
    }

return (

<div>
  <Header />
<div className = "h-full flex justify-between pt-10"> 
  <div className= "w-[60%] min-w-0">
    <PdfViewer onDocumentLoadSuccess={onDocumentLoadSuccess}
setCurrent={setCurrent} curPage={curPage} numPages={numPages} pdfPath = {curPdf}/> 
  </div>
  <div className = "w-[40%] min-w-0">  <ChatWindow onCitiationClick={setCurrent}/></div>
  </div>
  <div className="flex align-middle w-full justify-center mt-20">  
    <DocListWindow/>
  <UploadWindow handleSubmit = {handleSubmit}/>
  </div>

</div>



)
}

export default App
