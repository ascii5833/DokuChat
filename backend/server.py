from fastapi import FastAPI, File, UploadFile, HTTPException, status
from rag import (load_pdf, generate_rag_chain, generate_rag_prompt_chatbot, get_chunks, createVectorStore)
import uvicorn
from langchain_google_genai import GoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from pathlib import Path
from dotenv import load_dotenv
from starlette.concurrency import run_in_threadpool
import os
import uuid

load_dotenv()

app = FastAPI()

ROOT_DIR = Path(__file__).parent.parent
SAVE_PATH = ROOT_DIR / "docs"
V_PATH = ROOT_DIR / "vstores"

SAVE_PATH.mkdir(exist_ok = True, parents = True)
V_PATH.mkdir(exist_ok = True, parents = True)
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
    
    print(f'\n---------Creating vector store for pdf {pdf_path} Stored at path :{pdf_path}----------\n')
    
    vstore = createVectorStore(embeddings = embeddings, texts = texts, metadata = metadata, batch_size = 100, timeout = 3, verbose = True)
    
    vstore.save_local(V_PATH / pdf_name)
    
    return {
        "vstore_location" : str(V_PATH / pdf_name),
        "pdf_name": pdf_name,
        "pdf_path": pdf_path
    }
    
    
    
    
    
    
    

@app.get("/")
async def root():
    return {"message": "Welcome to DokuChat"}

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
    
    pdf_details = {
            "filename": file_name,
            "saved_path": file_path,
            "message": "PDF Uploaded successfully"
    }
    
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

    return {**pdf_details, "vstore_info": vstore_info}
    

if __name__ == "__main__":
    uvicorn.run("server:app", host = "127.0.0.1", port = 8000, reload = True)
    