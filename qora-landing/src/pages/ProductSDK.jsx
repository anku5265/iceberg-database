import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'

const D = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:3000'

const LANGS = [
  {
    key: 'python', label: 'Python', install: 'pip Install Iceberg',
    code: `from qora import Client

client = Client(api_key="qr_your_key")

# Collections
client.create_collection("my_docs")

# Index
client.index_text("my_docs", "Our return policy allows 30 day returns.")
client.upload("my_docs", "handbook.pdf")

# Search
results = client.search("my_docs", "can I return my order?", top_k=5)
for r in results:
    print(f"{r.score:.3f} — {r.text}")

# Agent memory
client.remember("agent_001", "User prefers dark mode", memory_type="long_term")
memories = client.recall("agent_001", "what does user prefer?")`,
    links: [{ label: 'PyPI', url: 'https://pypi.org/project/qora' }, { label: 'GitHub', url: '#' }],
  },
  {
    key: 'javascript', label: 'JavaScript', install: 'npm Install Iceberg',
    code: `import { Client } from 'Iceberg'

const client = new Client({ apiKey: 'qr_your_key' })

// Collections
await client.createCollection('my_docs')

// Index
await client.indexText('my_docs', 'Our return policy allows 30 day returns.')

// Search
const results = await client.search('my_docs', 'return order', { topK: 5 })
results.forEach(r => console.log(r.score, r.text))

// Works with Node.js, Next.js, Deno, Bun`,
    links: [{ label: 'npm', url: 'https://npmjs.com/package/qora' }, { label: 'GitHub', url: '#' }],
  },
  {
    key: 'java', label: 'Java', install: '<!-- Maven -->\n<dependency>\n  <groupId>in.qora</groupId>\n  <artifactId>qora-sdk</artifactId>\n  <version>0.1.0</version>\n</dependency>',
    code: `import in.qora.Client;
import in.qora.SearchResult;
import java.util.List;

Client client = new Client("qr_your_key");

// Create & index
client.createCollection("my_docs");
client.indexText("my_docs", "Our return policy allows 30 day returns.");
client.upload("my_docs", "handbook.pdf");

// Search
List<SearchResult> results = client.search("my_docs", "return order", 5);
for (SearchResult r : results)
    System.out.printf("%.3f — %s%n", r.getScore(), r.getText());

// Works with Spring Boot, Quarkus, Micronaut`,
    links: [{ label: 'Maven Central', url: '#' }, { label: 'GitHub', url: '#' }],
  },
  {
    key: 'go', label: 'Go', install: 'go get github.com/qora-db/qora-go',
    code: `package main

import (
    "fmt"
    qora "github.com/qora-db/qora-go"
)

func main() {
    client := qora.NewClient("qr_your_key")

    // Create & index
    client.CreateCollection("my_docs")
    client.IndexText("my_docs", "Our return policy allows 30 day returns.")

    // Search
    results, _ := client.Search("my_docs", "return order", 5)
    for _, r := range results {
        fmt.Printf("%.3f — %s\\n", r.Score, r.Text)
    }
}`,
    links: [{ label: 'pkg.go.dev', url: '#' }, { label: 'GitHub', url: '#' }],
  },
  {
    key: 'rust', label: 'Rust', install: '# Cargo.toml\nqora = "0.1"',
    code: `use qora::Client;

#[tokio::main]
async fn main() {
    let client = Client::new("qr_your_key");

    // Create & index
    client.create_collection("my_docs").await.unwrap();
    client.index_text("my_docs", "Our return policy").await.unwrap();

    // Search
    let results = client.search("my_docs", "return order", 5).await.unwrap();
    for r in results {
        println!("{:.3} — {}", r.score, r.text);
    }
}`,
    links: [{ label: 'crates.io', url: '#' }, { label: 'GitHub', url: '#' }],
  },
  {
    key: 'dotnet', label: '.NET', install: 'dotnet add package Iceberg',
    code: `using Iceberg;

var client = new IcebergClient("qr_your_key");

// Create & index
await client.CreateCollectionAsync("my_docs");
await client.IndexTextAsync("my_docs", "Our return policy allows 30 day returns.");

// Search
var results = await client.SearchAsync("my_docs", "return order", topK: 5);
foreach (var r in results)
    Console.WriteLine($"{r.Score:F3} — {r.Text}");

// Works with ASP.NET Core, Blazor, console apps`,
    links: [{ label: 'NuGet', url: '#' }, { label: 'GitHub', url: '#' }],
  },
]

export default function ProductSDK() {
  const [dark] = useState(true)
  const [active, setActive] = useState('python')
  const lang = LANGS.find(l => l.key === active)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar dark={dark} />

      <section className="container mx-auto px-6 pt-24 pb-16 max-w-5xl">
        <div className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border border-[#222] text-[#666] bg-[#111] mb-6">Iceberg SDK</div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          Your language.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Your stack.</span>
        </h1>
        <p className="text-lg text-[#777] max-w-2xl mb-10 leading-relaxed">
          Official SDKs for Python, JavaScript, Go, Java, .NET, and Rust. Same API, same behavior — works everywhere from Lambda to Spring Boot.
        </p>
        <div className="flex gap-3">
          <a href={`${D}/signup`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-md transition text-sm">Get your API key</a>
          <a href={`${D}/docs`} className="border border-[#222] hover:border-[#444] text-[#999] hover:text-white font-medium px-6 py-3 rounded-md transition text-sm">Full API reference</a>
        </div>
      </section>

      {/* Code explorer */}
      <section className="border-y border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Code examples</p>
          <h2 className="text-3xl font-bold mb-10">Pick your language</h2>
          <div className="flex gap-2 flex-wrap mb-6">
            {LANGS.map(l => (
              <button key={l.key} onClick={() => setActive(l.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${active === l.key ? 'bg-blue-600 text-white' : 'border border-[#222] text-[#666] hover:text-white hover:border-[#444]'}`}>
                {l.label}
              </button>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2 bg-[#0d1117] border border-[#1a1a1a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#111] border-b border-[#1a1a1a]">
                <span className="text-xs text-[#555]">{lang.label} SDK</span>
              </div>
              <pre className="p-5 text-sm font-mono text-[#aaa] overflow-x-auto leading-7 whitespace-pre">{lang.code}</pre>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-[#1a1a1a] p-5">
                <p className="text-xs text-[#555] mb-3">Install</p>
                <pre className="text-xs font-mono text-[#aaa] whitespace-pre">{lang.install}</pre>
              </div>
              <div className="rounded-xl border border-[#1a1a1a] p-5">
                <p className="text-xs text-[#555] mb-3">Links</p>
                <div className="space-y-2">
                  {lang.links.map(l => (
                    <a key={l.label} href={l.url} className="flex items-center gap-2 text-sm text-[#666] hover:text-white transition">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Framework integrations */}
      <section className="border-b border-[#111] py-20">
        <div className="container mx-auto px-6 max-w-5xl">
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3">Integrations</p>
          <h2 className="text-3xl font-bold mb-12">Works with your existing stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['LangChain', 'LlamaIndex', 'Spring Boot', 'Next.js', 'FastAPI', 'Express', 'Gin (Go)', 'ASP.NET'].map(f => (
              <div key={f} className="rounded-xl border border-[#1a1a1a] p-4 text-center text-sm text-[#666] hover:text-white hover:border-[#333] transition">
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Start building</h2>
          <p className="text-[#666] mb-8">Free API key — no credit card required.</p>
          <a href={`${D}/signup`} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-md transition">Get API key</a>
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
