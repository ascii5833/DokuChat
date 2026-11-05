import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings, GoogleGenerativeAI

from rag import (
    load_pdf,
    get_chunks,
    createVectorStore,
    generate_rag_prompt_eval,
    generate_rag_chain,
)

ROOT_DIR = Path(__file__).resolve().parent
PDF_PATH = ROOT_DIR / "documents" / "residual.pdf"
QUESTION = "How many FLOPs does ResNet-152 require compared to VGG-16 and VGG-19?"

load_dotenv()
EMBED_MODEL = os.getenv("EMBED_MODEL")
MODEL = os.getenv("MODEL")
API_KEY = os.getenv("API_KEY")

embeddings = GoogleGenerativeAIEmbeddings(model=EMBED_MODEL, api_key=API_KEY)
model = GoogleGenerativeAI(model=MODEL, api_key=API_KEY)


docs = load_pdf(str(PDF_PATH))
texts, metadata = get_chunks(docs, chunk_size=500, chunk_overlap=50)
print(f"Loaded {len(docs)} pages -> {len(texts)} chunks")

vectorstore = createVectorStore(
    embeddings=embeddings, texts=texts, metadata=metadata,
    batch_size=100, timeout=3, verbose=True,
)
retriever = vectorstore.as_retriever(search_kwargs={"k": 4})

# build chain and invoke once
rag_chain = generate_rag_chain(generate_rag_prompt_eval(), retriever, model)
result = rag_chain.invoke({"question": QUESTION})

print("\nQuestion:", QUESTION)
print("\nAnswer:\n", result["answer"])
print("\nRetrieved pages:", result["retrieved_pages"])
for i, src in enumerate(result["sources"], 1):
    print(f"\n--- Source {i} (page {src['page']}) ---\n{src['content']}")
