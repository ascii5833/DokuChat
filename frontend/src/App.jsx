
import './App.css'
import PdfViewer from './components/PdfViewer'
import Header from './components/Header'
import ChatWindow from './components/Chat/ChatWindow'
import DocListWindow from './components/DocList/DocListWindow'
import UploadWindow from './components/Upload/UploadWindow'
import { useState } from 'react'


function App() {
  const [numPages, setNumPages] = useState(null);

  const [curPage, setCurPage] = useState(1);

  const [curPdf, setCurPdf] = useState("");

  const handleSubmit = (e)=>{
    e.preventDefault();

    const fileInput = document.getElementById("formFile");
    const file = fileInput.files[0];

    if(!file){
      alert("Please select a pdf file first.");
      return;
    }

    const formdata = new FormData();
    formdata.append("pdfFile", file);

    setCurPdf(file.name);
  }

   const onDocumentLoadSuccess = ({numPages}) => {
        setNumPages(numPages);
    }
    const setCurrent = (page, type) =>{
        if(type == "back"){
          setCurPage(p=>p-1);
        }
        else if(type == "forward"){
          setCurPage(p => p+1);
        }

        else if (type == "spec"){
          setCurPage(page);
        }
    }

return (

<div>
  <Header />
<div className = "h-full flex justify-between pt-10"> 
  <div className= "w-[60%] min-w-0">
    <PdfViewer onDocumentLoadSuccess={onDocumentLoadSuccess}
setCurrent={setCurrent} curPage={curPage} numPages={numPages}/> 
  </div>
  <div className = "w-[40%] min-w-0">  <ChatWindow onCitiationClick={setCurrent}/></div>
  </div>
  <div className="flex align-middle w-full justify-center mt-20">  
    <DocListWindow/>
  <UploadWindow handleSubmit = {handleSubmit}/>
  <h2>{curPdf}</h2>
  </div>

</div>



)
}

export default App
