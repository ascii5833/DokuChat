from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import  CORSMiddleware
from fastapi.responses import FileResponse
from rag import (load_pdf, generate_rag_chain, generate_rag_prompt_chatbot, get_chunks, createVectorStore)
import uvicorn
from langchain_google_genai import GoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from pathlib import Path
from dotenv import load_dotenv
from starlette.concurrency import run_in_threadpool
import os
import uuid
from pypdf import PdfReader
import json
import shutil

load_dotenv()

app = FastAPI()

origins = [
    "http://localhost:5173"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

ROOT_DIR = Path(__file__).parent.parent
SAVE_PATH = ROOT_DIR / "docs"
V_PATH = ROOT_DIR / "vstores"

SAVE_PATH.mkdir(exist_ok = True, parents = True)
V_PATH.mkdir(exist_ok = True, parents = True)

PDF_MAPPINGS_PATH = ROOT_DIR / "mappings.json"
#model
EMBED_MODEL = os.getenv('EMBED_MODEL')
MODEL = os.getenv('MODEL')
API_KEY = os.getenv('API_KEY')

embeddings = GoogleGenerativeAIEmbeddings(model = EMBED_MODEL, api_key = API_KEY)
model = GoogleGenerativeAI(model = MODEL, api_key = API_KEY)

def index_pdf(pdf_path, pdf_name):
    #chunking
    docs = load_pdf(pdf_path)
    
    texts, metadata = get_chunks(docs = docs, chunk_size = 500, chunk_overlap = 50)
    
    print(f'\n---------Creating vector store for pdf {pdf_name} Stored at path :{pdf_path}----------\n')
    
    vstore = createVectorStore(embeddings = embeddings, texts = texts, metadata = metadata, batch_size = 100, timeout = 3, verbose = True)
    
    vstore.save_local(V_PATH / pdf_name)
    
    return {
        "vstore_location" : str(V_PATH / pdf_name),
        "pdf_name": pdf_name,
        "pdf_path": str(pdf_path)
    }
    

    
    
#root
@app.get("/")
async def root():
    return {"message": "Welcome to DokuChat"}


#pdf-list
@app.get("/pdf-list")
async def get_pdf_list():
    file_path = PDF_MAPPINGS_PATH
    
    pdf_list = []

    try:
        with file_path.open("r", encoding = "utf-8") as f:
            data = json.load(f)
        
        pdf_list = [{"pdf_id": item['filename'], "name": item['original_filename'], "n_pages": item['n_pages']} for item in data]
        
    except json.JSONDecodeError as j:
            raise HTTPException(status_code = status.HTTP_500_INTERNAL_SERVER_ERROR, 
                             detail = f"Error while fetching pdf details {str(j)}")
    
    
    return {"pdf_list": pdf_list} 
         
                
    

#pdf upload
@app.post("/upload_pdf/")
async def upload_pdf(pdf : UploadFile = File()):
    if pdf.content_type != "application/pdf":
        raise HTTPException(
            status_code = status.HTTP_400_BAD_REQUEST,
            detail = "Invalid file type, pdf expected."
        )
    
    uid = str(uuid.uuid4())
    file_name = f"{uid}.pdf"
    file_path = SAVE_PATH / file_name
    
    #write and save pdf
    try:
        with open(file_path, "wb") as buffer:
            # 1 mb chunk at once
            #walrus means keeps running till chunk has data
            while chunk := await pdf.read(1024 * 1024): 
                buffer.write(chunk)
            
    except Exception as e:
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"An error occured when saving the pdf: {str(e)}"
        )
    finally:
        await pdf.close()
        
    try:
        reader = PdfReader(file_path)
        total_pages = len(reader.pages)
        
    except Exception as e:
        if file_path.exists():
            file_path.unlink()
        
        raise HTTPException(status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail = f"Corrupted pdf file: {str(e)}")
    
    pdf_details = {
            "filename": file_name,
            "saved_path": str(file_path),
            "message": "PDF Uploaded successfully",
            "n_pages": total_pages,
            "original_filename": pdf.filename
    }
    
    #vector store
    vstore_info = {}
    try :
        vstore_info = await run_in_threadpool(index_pdf, pdf_path = pdf_details['saved_path'], pdf_name = pdf_details['filename'])
    
    except Exception as e:
        #delete file if already created and chunking etc fails.
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = f"An error occured when creating a vector store : {str(e)}"
        )    

    v_store_path = vstore_info['vstore_location']
    
    res = {**pdf_details, "vstore_info": vstore_info}
    
    #mapping store
    try:
        json_path = PDF_MAPPINGS_PATH
        
        if json_path.exists() and json_path.stat().st_size > 0:
            with json_path.open("r", encoding = "utf-8") as f:
                try:
                    data = json.load(f)
                    
                except json.JSONDecodeError:
                    data = []
        
        else:
            data = []
        
        data.append(res)
        
        with json_path.open("w", encoding = "utf-8") as f:
            json.dump(data, f, indent = 4)
                
    except Exception as e:
        
        if file_path.exists():
            file_path.unlink()
        
        v_p = Path(v_store_path)
        
        if v_p.exists():
            shutil.rmtree(v_p)
            
        raise HTTPException(status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail = f"Error when saving new pdf. {str(e)}")
            
    
    return res
    
#pdf fetch
@app.get("/pdf/{filename}")
async def getpdf(filename:str):
    file_path = SAVE_PATH / filename
    
    if not file_path.exists():
        raise HTTPException(status_code = status.HTTP_404_NOT_FOUND, detail = f"File {filename} couldn't be found")
    
    return FileResponse(
        path = file_path,
        media_type = "application/pdf",
        filename = filename
    )
    
    
        
        
if __name__ == "__main__":
    uvicorn.run("server:app", host = "127.0.0.1", port = 8000, reload = True)
    