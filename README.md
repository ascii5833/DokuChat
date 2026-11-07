# DokuChat

Chat with a PDF. Upload a document, ask questions about it, and get answers that point back to the pages they came from. Click a page citation and the viewer jumps straight there, so you can check the answer yourself instead of just trusting it.

I built this as a way to learn how RAG (retrieval-augmented generation) works end to end: chunking, embeddings, retrieval, prompting, and then actually measuring whether the thing works.

## How it works

1. You upload a PDF. The backend saves it, splits it into ~500 character chunks (50 overlap), embeds them with Google's embedding model, and stores them in a FAISS index on disk.
2. When you ask a question, the 7 most similar chunks are pulled from that index and handed to Gemini along with the question and the chat history.
3. The prompt tells the model to answer only from those chunks, cite pages, and say "I couldn't find the answer in this document." if the context doesn't help.
4. The answer comes back with the page numbers of the retrieved chunks, which show up as clickable citations next to the PDF viewer.

Each PDF gets its own vector store, and each (PDF, session) pair gets its own in-memory chat history, so follow-up questions work.

## Stack

- **Backend:** FastAPI, LangChain, FAISS, Google Generative AI (Gemini for generation and embeddings), pypdf
- **Frontend:** React 19, Vite, Tailwind CSS 4, react-pdf
- **Evaluation:** RAGAS

## Project layout

```
backend/
  server.py          FastAPI app (upload, list, fetch PDFs, chat)
  requirements.txt   Pinned Python dependencies
  rag.py             PDF loading, chunking, vector store, prompts, RAG chains
  rag_eval_gen.py    Runs the RAG chain over a question set and saves results
  eval_ragas.py      Scores those results with RAGAS
  eval/clean_results.py   Averages the RAGAS scores into one summary file
  documents/questions.csv Hand-written eval questions + ground truth answers
  test_rag_invoke.py Quick script to try the chain on one question
frontend/
  src/App.jsx        State and API calls
  src/components/    Chat, document list, upload, PDF viewer, alerts
```

## Running it locally

You'll need Python 3.10+ and Node 18+, plus a Google AI API key.

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # on Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
```

The versions in there are pinned to what I developed against. It also includes `ragas`, `pandas` and `numpy`, which you only need for the eval scripts.

Create a `.env` file in `backend/` (or wherever you run the server from):

```
API_KEY=your_google_api_key
MODEL=name_of_a_gemini_model
EMBED_MODEL=name_of_a_google_embedding_model
```

Then start the server:

```bash
python server.py
```

It runs on http://127.0.0.1:8000. Uploaded PDFs, vector stores and a `mappings.json` file get created one level above `backend/` (in `docs/`, `vstores/`, and the project root). They're all gitignored.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The backend's CORS config only allows that origin, and the API URL is hardcoded to `127.0.0.1:8000`, so keep those ports.

## Evaluating it

The eval setup is the part I'm most interested in, since "it seems to work" isn't much of a result.

`backend/documents/questions.csv` has about 100 questions with ground truth answers and the page each answer lives on, across five papers: batch norm, dropout, LoRA, ResNet, and ViT. (The PDFs themselves are gitignored, so drop your own copies into `backend/documents/` using the filenames in `rag_eval_gen.py`.)

```bash
cd backend
python rag_eval_gen.py        # builds stores, answers every question, records which pages were retrieved
python eval_ragas.py          # RAGAS: faithfulness, answer relevancy, context recall, context precision
python eval/clean_results.py  # averages everything into a single CSV
```

`rag_eval_gen.py` also computes a simple `retrieval_hit` flag: did the page that holds the answer show up in the retrieved chunks?

Fair warning: this makes a lot of API calls, and the embedding step sleeps between batches to stay under rate limits, so it's slow.

### Results

I started with chunk size 500, overlap 50 and top-k of 3. After tuning (mainly bumping k to 7 and rewriting the prompt), the numbers looked like this:

| Metric | Baseline (k=3) | Tuned (k=7) | Change |
| --- | --- | --- | --- |
| Faithfulness | 0.8801 | 0.9672 | +0.0871 |
| Answer relevancy | 0.7256 | 0.8061 | +0.0805 |
| Context recall | 0.7000 | 0.8750 | +0.1750 |
| Context precision | 0.9000 | 0.9700 | +0.0700 |

Recall moved the most, which makes sense: with only 3 chunks the right passage often just wasn't in the context. Precision going up as well was a nice surprise, since I expected more chunks to add noise.

The config behind the tuned run (this is what the app uses now):

| Parameter | Value |
| --- | --- |
| Chunk size | 500 |
| Chunk overlap | 50 |
| Retriever top-k | 7 |
| Prompt | Revised RAG prompt (see `rag.py`) |
| Embeddings | Gemini embedding model |
| LLM | Gemini generation model |
| Context formatting | Chunks separated by blank lines, each labelled `Source: PDF page N` |

The baseline and tuned runs both use the same five papers and question set. Keep in mind it's about 100 questions, so small differences between runs are probably noise.

## API

| Method | Path | What it does |
| --- | --- | --- |
| GET | `/pdf-list` | List uploaded PDFs |
| POST | `/upload_pdf/` | Upload and index a PDF |
| GET | `/pdf/{filename}` | Serve a stored PDF |
| POST | `/chat/` | Ask a question (`question`, `session_id`, `pdf_id`) |

## Known rough edges

- Chat history lives in memory, so restarting the server wipes it.
- Indexing happens during the upload request, so big PDFs make the upload hang for a while.
- It only handles text PDFs. Scanned documents with no text layer won't work.
- No auth, no deletion of uploaded documents, and the frontend URLs aren't configurable.

## Ideas for later

- Streaming responses
- Tuning chunk size, overlap and `k` using the eval numbers
- Hybrid search or reranking
- Env-based frontend config instead of hardcoded URLs
