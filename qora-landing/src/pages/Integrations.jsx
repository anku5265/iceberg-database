import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'

export default function Integrations() {
  const [dark] = useState(true)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      <section className="container mx-auto px-6 pt-24 pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#666] bg-[#111] mb-6">Integrations</div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Plug into your<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">existing stack.</span>
        </h1>
        <p className="text-lg text-[#777] max-w-2xl mb-10 leading-relaxed">
          Iceberg works with the frameworks and tools you already use. LangChain, LlamaIndex, REST API — no lock-in, no migration pain.
        </p>
      </section>

      {/* Frameworks */}
      <section className="border-y border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">AI frameworks</p>
          <h2 className="text-3xl font-bold mb-12">Works with what you know</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: 'LangChain',
                desc: 'Use Iceberg as a vector store in LangChain pipelines. Works with all LangChain chains — RetrievalQA, ConversationalRetrievalChain, agents.',
                code: `from langchain_community.vectorstores import Qdrant
from langchain_openai import OpenAIEmbeddings

vectorstore = Qdrant.from_documents(
    docs,
    OpenAIEmbeddings(),
    url="http://localhost:8000",
    collection_name="my_docs",
)`,
              },
              {
                name: 'LlamaIndex',
                desc: 'Use Iceberg as the storage backend for LlamaIndex. Index any document type — PDF, HTML, Notion, Google Docs.',
                code: `from llama_index.vector_stores.qdrant import QdrantVectorStore
import qdrant_client

client = qdrant_client.QdrantClient(url="http://localhost:8000")
vector_store = QdrantVectorStore(
    client=client,
    collection_name="my_docs"
)`,
              },
            ].map((f, i) => (
              <div key={i} className="rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] p-6">
                <h3 className="font-semibold mb-2">{f.name}</h3>
                <p className="text-sm text-[#666] leading-relaxed mb-4">{f.desc}</p>
                <pre className="bg-[#111] border border-[#1a1a1a] rounded-lg p-3 text-xs font-mono text-[#aaa] overflow-x-auto">{f.code}</pre>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REST API */}
      <section className="border-b border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">REST API</p>
          <h2 className="text-3xl font-bold mb-4">Works with any language</h2>
          <p className="text-[#666] mb-12 max-w-2xl">No SDK? No problem. Every Iceberg feature is available via REST API. One header, one endpoint.</p>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { method: 'POST', path: '/collections', desc: 'Create a collection' },
              { method: 'POST', path: '/documents/text', desc: 'Index text' },
              { method: 'POST', path: '/documents/upload', desc: 'Upload a PDF or file' },
              { method: 'POST', path: '/search', desc: 'Search (semantic/keyword/hybrid)' },
              { method: 'POST', path: '/memory/{agent_id}/remember', desc: 'Store agent memory' },
              { method: 'POST', path: '/memory/{agent_id}/recall', desc: 'Recall agent memory' },
              { method: 'POST', path: '/assistant', desc: 'Create a RAG assistant' },
              { method: 'POST', path: '/backup/{collection}', desc: 'Backup a collection' },
            ].map((e, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-[#1a1a1a] hover:border-[#2a2a2a] transition">
                <span className={`text-xs font-mono px-2 py-0.5 rounded flex-shrink-0 ${e.method === 'POST' ? 'bg-blue-950/50 text-blue-400 border border-blue-900/30' : 'bg-green-950/50 text-green-400 border border-green-900/30'}`}>{e.method}</span>
                <code className="text-xs text-[#aaa] font-mono flex-1">{e.path}</code>
                <span className="text-xs text-[#555]">{e.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Start integrating</h2>
          <p className="text-[#666] mb-8">Full API docs available in the dashboard.</p>
          <div className="flex gap-3 justify-center">
            <a href={`${D}/signup`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-md transition text-sm">Get API key</a>
            <a href={`${D}/docs`} className="border border-[#222] hover:border-[#444] text-[#999] hover:text-white font-medium px-6 py-3 rounded-md transition text-sm">View docs</a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-[#111] py-10">
      <div className="container mx-auto px-6 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#555]">
        <Link to="/" className="text-white font-bold text-lg">Iceberg</Link>
        <div className="flex gap-6">{['Privacy','Terms','Docs','Status'].map(l=><a key={l} href="#" className="hover:text-white transition">{l}</a>)}</div>
        <div>© 2026 Iceberg</div>
      </div>
    </footer>
  )
}
