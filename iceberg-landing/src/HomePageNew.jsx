import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import IcebergLogo from './components/IcebergLogo'
import { Navbar, MobileNavDrawer, useSessionTheme } from './components/Navbar'
import Footer from './components/Footer'
import CapabilitiesSplitConsole from './components/CapabilitiesSplitConsole'
import { CANONICAL_SPEC } from './config/canonicalSpec'

const D = import.meta.env.VITE_DASHBOARD_URL || 'https://dashboard.icebergdb.in'
const API = import.meta.env.VITE_API_URL || 'https://api.icebergdb.in'

const DEMO_QUERIES = [
  { text: 'return policy for damaged items', key: 'return' },
  { text: 'pricing plans and vector limits', key: 'pricing' },
  { text: 'agent memory for user sessions', key: 'memory' },
]

const DEMO_RESULTS = {
  'return': [
    { text: 'Our return policy allows 30 day returns for all products purchased online.', score: 0.97, source: 'handbook.pdf' },
    { text: 'Items must be unused and in original packaging to qualify for a return.', score: 0.91, source: 'faq.pdf' },
    { text: 'Refunds are processed within 5-7 business days after receiving the item.', score: 0.86, source: 'handbook.pdf' },
  ],
  'pricing': [
    { text: 'Free tier (₹0 / $0) includes 100,000 vectors, 1,000 queries/day, and free built-in CPU embeddings.', score: 0.98, source: 'pricing.pdf' },
    { text: 'Starter plan at ₹799/mo ($10/mo) gives 1,000,000 vectors and 20,000 queries/day with zero pauses.', score: 0.93, source: 'pricing.pdf' },
    { text: 'Growth plan at ₹3,499/mo ($42/mo) includes 5,000,000 vectors, 100,000 queries/day, and priority support.', score: 0.88, source: 'pricing.pdf' },
  ],
  'memory': [
    { text: 'Long-term memory persists forever - ideal for user preferences.', score: 0.96, source: 'memory-docs.pdf' },
    { text: 'Short-term memory expires after 1 hour - perfect for session context.', score: 0.90, source: 'memory-docs.pdf' },
    { text: 'Episodic memory stores specific events and expires after 30 days.', score: 0.85, source: 'memory-docs.pdf' },
  ],
}

// Crisp monochrome SVG logos for the Pinecone-style Dot-Matrix Language Strip
const STACK = [
  {
    name: 'Python',
    svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.959 3.403 5.959h2.034v-2.867s-.109-3.4 3.35-3.4h5.766s3.24.052 3.24-3.131V3.147S18.28 0 11.914 0zm-3.2 1.818a1.047 1.047 0 1 1 0 2.094 1.047 1.047 0 0 1 0-2.094z"/><path d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752h-5.814v-.826h8.121S24 18.211 24 12.031c0-6.18-3.403-5.959-3.403-5.959h-2.034v2.867s.109 3.4-3.35 3.4H9.447s-3.24-.052-3.24 3.131v5.283S5.72 24 12.086 24zm3.2-1.818a1.047 1.047 0 1 1 0-2.094 1.047 1.047 0 0 1 0 2.094z"/></svg>
  },
  {
    name: 'LangChain',
    svg: <svg viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2"/><path d="M5.5 12h3.5l2-4 3.5 8 2-4h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  },
  {
    name: 'LlamaIndex',
    svg: <svg viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="2"/><text x="5.5" y="16.5" fontSize="12" fontWeight="800" fill="currentColor" fontFamily="Inter, sans-serif">LI</text></svg>
  },
  {
    name: 'Java',
    svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149m-.575-2.627s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218m4.84-4.458c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573m6.013 9.32s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.749-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892m7.636 4.78s3.228 1.677-3.572 2.163c-4.208.303-8.415-.05-8.415-.05s.826-.7 1.379-.956c2.912.623 4.494.536 8.115.139 1.215-.133 2.493-.296 2.493-.296M17.125 5.209c.063.058-1.954 1.827-7.132 2.618-4.79.739-6.677 3.461-4.396 5.089 1.188.853 2.517 1.259 2.517 1.259-1.586-.717-2.781-1.765-2.317-3.208.685-2.139 5.483-3.073 9.328-3.758"/></svg>
  },
  {
    name: 'Node.js',
    svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.998 24a1.362 1.362 0 0 1-.681-.18l-2.164-1.28c-.323-.18-.165-.244-.059-.28.431-.15.518-.184.978-.446.048-.027.112-.017.162.012l1.663.986a.216.216 0 0 0 .201 0l6.487-3.744a.205.205 0 0 0 .101-.177V8.42a.207.207 0 0 0-.101-.178L12.1 4.5a.204.204 0 0 0-.202 0L5.412 8.242a.208.208 0 0 0-.102.178v7.487c0 .072.039.14.102.176l1.777 1.026c.964.482 1.554-.086 1.554-.658V9.184a.187.187 0 0 1 .187-.187h.816a.187.187 0 0 1 .187.187v7.267c0 1.288-.702 2.025-1.923 2.025-.376 0-.672 0-1.497-.407l-1.703-.981a1.367 1.367 0 0 1-.681-1.182V8.42c0-.487.259-.939.681-1.182l6.487-3.744a1.418 1.418 0 0 1 1.364 0l6.487 3.744c.422.243.681.695.681 1.182v7.487c0 .488-.259.939-.681 1.182l-6.487 3.744a1.362 1.362 0 0 1-.683.167zm2.001-5.156c-2.84 0-3.435-1.304-3.435-2.397a.187.187 0 0 1 .187-.188h.833a.188.188 0 0 1 .186.161c.127.858.507 1.292 2.23 1.292 1.372 0 1.956-.311 1.956-1.04 0-.42-.166-.732-2.301-1.054-1.784-.295-2.887-.895-2.887-2.146 0-1.141.962-1.82 2.574-1.82 1.81 0 2.707.628 2.822 1.976a.188.188 0 0 1-.187.202h-.836a.188.188 0 0 1-.183-.149c-.176-.784-.604-1.036-1.616-1.036-1.19 0-1.329.414-1.329.725 0 .376.163.486 2.232.698 2.048.21 2.953.804 2.953 2.088 0 1.231-1.027 1.938-2.999 1.938z"/></svg>
  },
  {
    name: 'Rust',
    svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.634 11.639l-1.002-.62a13.86 13.86 0 0 0-.031-.29l.855-.797a.376.376 0 0 0-.137-.625l-1.089-.37a13.742 13.742 0 0 0-.094-.281l.685-.958a.376.376 0 0 0-.23-.584l-1.141-.115a12.91 12.91 0 0 0-.153-.259l.499-1.086a.376.376 0 0 0-.316-.531l-1.154.143a13.08 13.08 0 0 0-.206-.227l.299-1.179a.376.376 0 0 0-.389-.468l-1.124.399a13.45 13.45 0 0 0-.252-.187l.09-1.217a.376.376 0 0 0-.452-.39l-1.054.646a14.03 14.03 0 0 0-.288-.143l-.12-1.206a.376.376 0 0 0-.504-.309l-.951.885a13.6 13.6 0 0 0-.314-.094l-.327-1.15a.376.376 0 0 0-.542-.218l-.818 1.109a13.83 13.83 0 0 0-.33-.039l-.523-1.059a.376.376 0 0 0-.568-.122l-.663 1.31a14 14 0 0 0-.334.02l-.703-.967a.376.376 0 0 0-.583.023l-.493 1.474a13.9 13.9 0 0 0-.327.099l-.873-.832a.376.376 0 0 0-.591.163l-.307 1.584a14.15 14.15 0 0 0-.311.174l-1.026-.685a.376.376 0 0 0-.588.298l-.108 1.647a14.3 14.3 0 0 0-.287.246l-1.158-.524a.376.376 0 0 0-.573.428l.092 1.657a14.15 14.15 0 0 0-.256.313l-1.26-.353a.376.376 0 0 0-.545.55l.288 1.617a14.07 14.07 0 0 0-.218.374l-1.328-.175a.376.376 0 0 0-.504.658l.479 1.53a14.2 14.2 0 0 0-.175.428l-1.362.003a.376.376 0 0 0-.449.751l.661 1.397a14.3 14.3 0 0 0-.127.474l-1.36.179a.376.376 0 0 0-.383.826l.833 1.224a14.35 14.35 0 0 0-.076.512l-1.32.351a.376.376 0 0 0-.306.886l.991 1.015a14.4 14.4 0 0 0-.023.54l-1.241.517a.376.376 0 0 0-.221.933l1.134.784a.376.376 0 1 0 .414.624l-.829-1.157v-.003zm0 0"/></svg>
  },
  {
    name: 'Go',
    svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zM.047 11.306c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .059.035.035.082l-.093.28c-.012.047-.058.082-.105.082zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082zm12.129-2.36c-.736.187-1.239.327-1.963.514-.176.046-.187.058-.34-.117-.174-.199-.303-.327-.548-.444-.737-.362-1.45-.257-2.115.175-.795.514-1.204 1.274-1.192 2.22.011.935.654 1.706 1.577 1.835.795.105 1.46-.175 1.987-.771.105-.13.198-.27.315-.432H10.47c-.245 0-.304-.152-.222-.35.152-.362.432-.968.596-1.274a.315.315 0 0 1 .292-.187h4.253c-.023.316-.023.631-.07.947a4.983 4.983 0 0 1-.958 2.29c-.841 1.11-1.94 1.8-3.33 1.986-1.145.152-2.209-.07-3.143-.77-.865-.655-1.356-1.52-1.484-2.595-.152-1.274.222-2.419.993-3.424.83-1.086 1.928-1.776 3.272-2.02 1.098-.2 2.15-.07 3.096.571.62.41 1.063.97 1.356 1.648.07.105.023.164-.117.2zm3.868 6.461c-1.064-.024-2.034-.328-2.852-1.029a3.665 3.665 0 0 1-1.262-2.255c-.21-1.32.152-2.489.947-3.529.853-1.122 1.881-1.706 3.272-1.95 1.192-.21 2.314-.095 3.33.595.923.63 1.496 1.484 1.648 2.605.198 1.578-.257 2.863-1.344 3.962-.771.783-1.718 1.273-2.805 1.495-.315.06-.631.07-.934.106zm2.78-4.72c-.011-.153-.011-.27-.034-.387-.21-1.157-1.274-1.81-2.384-1.554-1.087.245-1.788 1.11-1.847 2.22-.047.91.56 1.53 1.39.304.084.631.07.947.024.747-.106 1.39-.538 1.776-1.168.106-.175.21-.362.269-.548h-.257z"/></svg>
  },
  {
    name: '.NET',
    svg: <svg viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="10" stroke="currentColor" strokeWidth="2"/><path fill="currentColor" d="M6.2 15.8v-7.6h1.5l2.2 3.9 2.2-3.9h1.5v7.6h-1.5v-5l-1.7 3h-.9l-1.7-3v5zm8.8 0v-7.6h1.5v6.3h2.8v1.3z"/></svg>
  },
  {
    name: 'Spring Boot',
    svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.205 16.392c-2.469 3.289-7.741 2.179-11.122 2.338 0 0-.599.034-1.201.133 0 0 .228-.097.519-.198 2.374-.821 3.496-.986 4.939-1.727 2.71-1.388 5.408-4.413 5.957-7.555-1.032 3.022-4.17 5.623-7.027 6.679-1.955.722-5.492 1.424-5.492 1.424a5.38 5.38 0 0 1-.894-.454c-2.508-1.664-2.447-9.077 4.247-11.47 2.083-1.164 5.02-.534 6.374.12.024 0 .046.014.106.027a8.573 8.573 0 0 1 5.998 9.498c-.092.53-.195 1.054-.404 1.185zm-5.471-15.066S16.358 0 18.256 0c0 0-.268 3.21-3.522 3.21z"/></svg>
  },
  {
    name: 'React',
    svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 9.861A2.139 2.139 0 1 0 12 14.139 2.139 2.139 0 1 0 12 9.861zM6.008 16.255l-.472-.12C2.018 15.246 0 13.737 0 11.996s2.018-3.25 5.536-4.139l.472-.12.132.468a23.53 23.53 0 0 0 1.235 3.544l.101.31-.101.31a23.307 23.307 0 0 0-1.235 3.543l-.132.443zm-.403-8.56c-2.976.783-4.471 2.058-4.471 3.301 0 1.243 1.495 2.519 4.471 3.302a24.514 24.514 0 0 1 1.058-3.302 24.29 24.29 0 0 1-1.058-3.301zm14.395 8.56l-.132-.443a23.307 23.307 0 0 0-1.235-3.543l-.101-.31.101-.31a23.53 23.53 0 0 0 1.235-3.544l.132-.468.472.12c3.518.889 5.536 2.398 5.536 4.139s-2.018 3.25-5.536 4.139l-.472.12zm.304-8.56a24.29 24.29 0 0 1-1.058 3.301 24.514 24.514 0 0 1 1.058 3.302c2.976-.783 4.471-2.059 4.471-3.302 0-1.243-1.495-2.518-4.471-3.301zM12 21.953c-.757 0-1.557-.07-2.379-.217l-.415-.073-.154-.405a23.47 23.47 0 0 0-1.836-3.241l-.187-.277.131-.32a23.308 23.308 0 0 0 1.528-3.596l.179-.605h5.266l.179.605a23.308 23.308 0 0 0 1.528 3.596l.131.32-.187.277a23.47 23.47 0 0 0-1.836 3.241l-.154.405-.415.073c-.822.147-1.622.217-2.379.217zm-1.99-1.025c1.33.217 2.65.217 3.98 0a24.65 24.65 0 0 1 1.432-2.754 24.245 24.245 0 0 1-1.26-3.047h-4.324a24.245 24.245 0 0 1-1.26 3.047 24.65 24.65 0 0 1 1.432 2.754zm-4.039-8.37a23.308 23.308 0 0 0-1.528 3.596l-.179.605H9.53l-.179-.605a23.308 23.308 0 0 0-1.528-3.596l-.131-.32.187-.277a23.47 23.47 0 0 0 1.836-3.241l.154-.405.415-.073a16.97 16.97 0 0 1 4.758 0l.415.073.154.405a23.47 23.47 0 0 0 1.836 3.241l.187.277-.131.32z"/></svg>
  },
  {
    name: 'FastAPI',
    svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.375 0 0 5.375 0 12c0 6.626 5.375 12.001 12 12.001 6.626 0 12.001-5.375 12.001-12C24.001 5.375 18.626 0 12 0zm-.624 21.886v-7.498H7.19L13.203 2.114v7.498h4.029L11.376 21.886z"/></svg>
  },
  {
    name: 'Next.js',
    svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.5725 0c-.1763 0-.3098.0013-.3584.0067-.0516.0053-.2159.021-.3636.0328-3.4088.3073-6.6017 2.1463-8.624 4.9728C1.1004 6.584.3802 8.3666.1082 10.255c-.0962.659-.108.8537-.108 1.7474.0001.8938.0119 1.0884.1082 1.748.6789 4.6644 3.9977 8.5041 8.4816 9.9793.7786.2479 1.5985.4169 2.5323.5179.3594.04 1.9135.04 2.2734 0 1.5613-.1701 2.8557-.5495 4.1319-1.2098.1963-.1005.2362-.1272.2089-.1494-.0187-.0151-1.6277-2.1696-3.5715-4.7884L10.01 13.8505 7.8969 10.7245c-1.1614-1.7004-2.1231-3.0983-2.134-3.1091-.0124-.0123-.0234.0051-.0509.0769-.2474.667-.5046 1.9234-.5906 2.867-.0484.5358-.0596.7115-.0596 1.2637 0 .5152.0088.6829.0484 1.1467.2991 3.4418 2.4758 6.4414 5.6585 7.8432.7518.3273 1.5478.5508 2.3944.6717.3699.054 1.3897.0766 1.7822.0405.7588-.0706 1.3906-.2301 2.0437-.5158 1.6059-.7061 2.9423-1.9101 3.8259-3.4578.7949-1.3856 1.2192-2.966 1.2192-4.5944 0-.5503-.0254-1.003-.0767-1.4447-.4164-3.5702-2.5657-6.7011-5.7014-8.4019-.9394-.5162-1.9577-.8712-3.0636-1.0623-.4474-.0773-.8877-.1126-1.4078-.1136z"/></svg>
  },
]

const FEATURES = [
  {
    title: 'Hosted in India (ap-south-1)',
    desc: 'Hosted in India (ap-south-1). 100% domestic data residency for DPDP Act readiness — no data leaves India.',
    icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"/></svg>
  },
  {
    title: 'Hybrid Search',
    desc: 'Dense vectors + BM25 keyword via RRF. Better recall than pure vector search. Configurable alpha per query.',
    icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
  },
  {
    title: 'Agent Memory',
    desc: '4 types - short-term, long-term, episodic, semantic. TTL auto-expire. One API for all memory needs.',
    icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"/></svg>
  },
  {
    title: 'RAG Assistant',
    desc: 'Upload docs, get a chatbot. Website embed widget + WhatsApp Business. Works with OpenAI and Gemini.',
    icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21M6.75 19.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v10.5a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>
  },
  {
    title: 'Never Pauses',
    desc: 'Free tier stays active forever. No idle timeouts, no cold starts. Your dev environment always ready.',
    icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
  },
  {
    title: 'Backup & Restore',
    desc: 'One-click collection backup. Restore to any point. Full vector + metadata export - zero lock-in.',
    icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/></svg>
  },
  {
    title: 'RBAC + API Keys',
    desc: 'Admin, read-write, read-only keys. Revoke any key instantly without affecting others.',
    icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z"/></svg>
  },
  {
    title: 'BYOC',
    desc: 'Deploy on your own server - cloud or on-premise. Banks, hospitals, enterprises with data sovereignty.',
    icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 6 0m-6 0H3m16.5 0a3 3 0 0 0 3-3m-3 3a3 3 0 1 1-6 0m6 0h1.5m-1.5-6a3 3 0 0 0-3-3m0 0a3 3 0 0 0-3 3m3-3V3m0 18v-1.5"/></svg>
  },
  {
    title: '6 SDKs',
    desc: 'Python, JS, Go, Java, .NET, Rust. LangChain, LlamaIndex, Spring Boot support built in.',
    icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75 16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25z"/></svg>
  },
]

const CAPABILITY_CONSOLE_SPECS = [
  {
    tag: 'SOVEREIGN INFRASTRUCTURE',
    metrics: [
      { label: 'PRIMARY REGION', value: 'ap-south-1 (Mumbai)' },
      { label: 'INDIA RTT LATENCY', value: '< 1.8ms p99' },
      { label: 'COMPLIANCE', value: 'DPDP Act 2023 Ready' },
    ],
    code: `# 100% Domestic Data Residency (Mumbai ap-south-1)
client = Client(api_key="ib_live_...", region="ap-south-1")
status = client.cluster_info()
# -> { "region": "ap-south-1", "sovereign": True, "cross_border_egress": "BLOCKED" }`,
    visualBadge: 'MUMBAI SOVEREIGN NODE · ZERO CROSS-BORDER EGRESS',
  },
  {
    tag: 'RECIPROCAL RANK FUSION ENGINE',
    metrics: [
      { label: 'FUSION ALGORITHM', value: 'Dense + BM25 RRF' },
      { label: 'QUERY LATENCY', value: '1.4ms @ 1M vecs' },
      { label: 'ALPHA TUNING', value: 'Per-Query Dynamic' },
    ],
    code: `# Dense Semantic Vectors (70%) + Exact BM25 Keyword Match (30%)
results = client.search(
    collection="fin_docs",
    query="RBI circular 2026 UPI limits",
    search_type="hybrid",
    alpha=0.70,  # Tunable per query
    top_k=5
)`,
    visualBadge: 'DENSE HNSW (COSINE) + INVERTED BM25 INDEX IN 1 CALL',
  },
  {
    tag: '4-TIER COGNITIVE MEMORY LAYER',
    metrics: [
      { label: 'MEMORY TIERS', value: 'Short · Long · Episodic · Semantic' },
      { label: 'TTL EXPIRY', value: 'Automatic Sub-Second GC' },
      { label: 'ISOLATION', value: 'Per-User / Per-Agent ID' },
    ],
    code: `# Persistent Cognitive Memory for AI Agents
client.remember(
    agent_id="support_bot",
    user_id="usr_ankush",
    content="Prefers concise Hinglish architecture summaries",
    memory_type="long_term",
    ttl=86400 * 30
)
memories = client.recall(agent_id="support_bot", user_id="usr_ankush", query="style preference")`,
    visualBadge: 'SHORT-TERM · LONG-TERM · EPISODIC · SEMANTIC + AUTO TTL',
  },
  {
    tag: 'TURNKEY RAG PIPELINE',
    metrics: [
      { label: 'INGESTION', value: 'Auto-Chunk + Embed' },
      { label: 'LLM ROUTING', value: 'OpenAI · Gemini · Claude' },
      { label: 'CHANNELS', value: 'Web Widget + WhatsApp' },
    ],
    code: `# Upload PDFs/Docs -> Instant Production RAG Endpoint
assistant = client.rag.create_assistant(
    name="Docs Copilot",
    collection="product_docs",
    llm_provider="gemini-2.5-pro",
    channels=["web_widget", "whatsapp_business"]
)`,
    visualBadge: 'DOCS UPLOAD -> HYBRID RETRIEVAL -> STREAMING CITATIONS',
  },
  {
    tag: 'ALWAYS-HOT ARCHITECTURE',
    metrics: [
      { label: 'COLD START PENALTY', value: '0ms (Never Sleeps)' },
      { label: 'FREE TIER SLA', value: 'Always Active 24/7' },
      { label: 'INDEX RESIDENCY', value: 'Hot Memory + NVMe' },
    ],
    code: `# Zero Cold Starts — Even After 30 Days of Idle Traffic
ping = client.health()
# -> { "status": "HOT", "uptime_days": 365, "cold_start_ms": 0.0, "auto_pause": False }`,
    visualBadge: 'NO AUTO-PAUSE · NO 15-SECOND WAKEUP DELAYS',
  },
  {
    tag: 'POINT-IN-TIME SNAPSHOTS',
    metrics: [
      { label: 'SNAPSHOT SPEED', value: 'Instant Copy-on-Write' },
      { label: 'EXPORT FORMAT', value: 'Parquet + JSONL Open' },
      { label: 'VENDOR LOCK-IN', value: '0% (Full Vector Export)' },
    ],
    code: `# One-Click Snapshot & Zero-Lock-In Vector + Metadata Export
snap = client.create_snapshot(collection="prod_vectors", label="pre_migration_v1")
client.restore_snapshot(snapshot_id=snap.id, target_collection="prod_vectors_restored")`,
    visualBadge: 'FULL VECTOR + METADATA EXPORT · ZERO VENDOR LOCK-IN',
  },
  {
    tag: 'ZERO-TRUST ACCESS CONTROL',
    metrics: [
      { label: 'KEY SCOPES', value: 'Admin · Read-Write · Read-Only' },
      { label: 'REVOCATION', value: 'Instant (< 50ms Global)' },
      { label: 'AUDIT LOGS', value: 'Per-Key Telemetry' },
    ],
    code: `# Scoped API Keys with Instant Zero-Downtime Revocation
ro_key = client.keys.create(
    name="frontend_search_widget",
    scope="read_only",
    allowed_collections=["public_catalog"]
)`,
    visualBadge: 'SCOPED API KEYS · INSTANT REVOCATION · ZERO DOWNTIME',
  },
  {
    tag: 'SOVEREIGN VPC & ON-PREMISE',
    metrics: [
      { label: 'DEPLOYMENT TARGETS', value: 'AWS · GCP · Azure · Bare-Metal' },
      { label: 'DATA PLANE', value: '100% Inside Customer VPC' },
      { label: 'AIR-GAPPED MODE', value: 'Supported (BFSI / Gov)' },
    ],
    code: `# Deploy Iceberg Engine Directly Inside Your Sovereign VPC
# helm install iceberg-engine iceberg/byoc-cluster \\
#   --set vpc.sovereignMode=true \\
#   --set storage.encryption=customer_kms`,
    visualBadge: 'BANKS · HOSPITALS · DEFENSE · 100% CUSTOMER VPC RESIDENCY',
  },
  {
    tag: 'POLYGLOT NATIVE ECOSYSTEM',
    metrics: [
      { label: 'OFFICIAL SDKS (v1.0.0)', value: 'Python · JS/TS · Go · Rust · Java · .NET' },
      { label: 'AI FRAMEWORKS', value: 'LangChain · LlamaIndex · Spring AI' },
      { label: 'AGENT PROTOCOL', value: 'Native MCP Server Built-In' },
    ],
    code: `# Official v1.0.0 Native SDKs Across All 6 Core Languages
pip install icebergdb==1.0.0          # Python + LangChain + LlamaIndex
npm install iceberg-js@1.0.0          # Node.js / TypeScript / Next.js
cargo add iceberg-client@1.0.0        # Rust Native High-Throughput`,
    visualBadge: '6 NATIVE SDKS + MCP SERVER + LANGCHAIN / LLAMAINDEX',
  },
]

function OldUnusedCapabilitiesSplitConsole({ dark, gridLine, textPrimary, textMuted }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const activeFeature = FEATURES[activeIdx]
  const activeSpec = CAPABILITY_CONSOLE_SPECS[activeIdx]

  return (
    <div
      className="ib-code-frame grid grid-cols-1 lg:grid-cols-12"
      style={{
        background: dark ? '#0c0d10' : '#ffffff',
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
        e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
      }}
    >
      {/* Left Column (4/12): Compact 9-Capability Selector List */}
      <div
        className="lg:col-span-4 flex flex-col justify-between"
        style={{
          borderRight: `1px solid ${gridLine}`,
          background: dark ? '#0a0b0e' : '#f8fafc',
        }}
      >
        {FEATURES.map((f, i) => {
          const isActive = i === activeIdx
          return (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => setActiveIdx(i)}
              className="group relative w-full text-left px-5 py-3.5 flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer"
              style={{
                borderBottom: i < FEATURES.length - 1 ? `1px solid ${gridLine}` : 'none',
                background: isActive
                  ? dark
                    ? 'rgba(0, 210, 255, 0.08)'
                    : 'rgba(2, 132, 199, 0.08)'
                  : 'transparent',
              }}
            >
              {/* Left Active Laser Bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-150"
                style={{
                  background: isActive ? '#00d2ff' : 'transparent',
                  boxShadow: isActive ? '0 0 12px rgba(0, 210, 255, 0.8)' : 'none',
                }}
              />

              <div className="flex items-center gap-3 min-w-0">
                <span
                  className="text-[11px] font-mono tracking-[0.1em] w-5 shrink-0"
                  style={{
                    color: isActive ? '#00d2ff' : dark ? 'rgba(255,255,255,0.28)' : '#9ca3af',
                  }}
                >
                  0{i + 1}
                </span>
                <span
                  className="w-4 h-4 shrink-0 transition-colors"
                  style={{
                    color: isActive ? '#00d2ff' : dark ? 'rgba(255,255,255,0.55)' : '#64748b',
                  }}
                >
                  {f.icon}
                </span>
                <span
                  className="text-[14px] font-medium truncate transition-colors"
                  style={{
                    color: isActive ? (dark ? '#ffffff' : '#0f172a') : textMuted,
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {f.title}
                </span>
                {f.title === 'Agent Memory' && (
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 uppercase tracking-[0.12em] font-semibold shrink-0"
                    style={{
                      background: dark ? 'rgba(0, 210, 255, 0.14)' : 'rgba(2, 132, 199, 0.1)',
                      color: dark ? '#00d2ff' : '#0284c7',
                      border: `1px solid ${dark ? 'rgba(0, 210, 255, 0.35)' : 'rgba(2, 132, 199, 0.3)'}`,
                    }}
                  >
                    HOT
                  </span>
                )}
              </div>

              <span
                className="text-xs font-mono transition-transform duration-150 shrink-0"
                style={{
                  color: isActive ? '#00d2ff' : 'transparent',
                  transform: isActive ? 'translateX(0)' : 'translateX(-4px)',
                }}
              >
                &#8594;
              </span>
            </button>
          )
        })}
      </div>

      {/* Right Column (8/12): Live Interactive Architecture & Spec Console */}
      <div
        className="lg:col-span-8 flex flex-col justify-between p-6 sm:p-8 lg:p-9 relative overflow-hidden"
        style={{
          backgroundImage: dark
            ? 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)'
            : 'radial-gradient(rgba(15,23,42,0.05) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      >
        <div>
          {/* Top Console Telemetry Header */}
          <div
            className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5"
            style={{ borderBottom: `1px solid ${gridLine}` }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="text-[11px] font-mono tracking-[0.16em] uppercase px-2 py-0.5 font-semibold"
                style={{
                  background: dark ? 'rgba(0, 210, 255, 0.12)' : 'rgba(2, 132, 199, 0.1)',
                  color: dark ? '#00d2ff' : '#0284c7',
                  border: `1px solid ${dark ? 'rgba(0, 210, 255, 0.3)' : 'rgba(2, 132, 199, 0.25)'}`,
                }}
              >
                0{activeIdx + 1} // {activeSpec.tag}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-[#71717a]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-pulse" />
              <span>ACTIVE IN ICEBERG v1.0.0</span>
            </div>
          </div>

          {/* Selected Capability Title & Description */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-8 h-8 flex items-center justify-center shrink-0"
                  style={{
                    border: `1px solid ${dark ? 'rgba(0, 210, 255, 0.35)' : 'rgba(2, 132, 199, 0.3)'}`,
                    background: dark ? 'rgba(0, 210, 255, 0.08)' : 'rgba(2, 132, 199, 0.06)',
                    color: dark ? '#00d2ff' : '#0284c7',
                  }}
                >
                  <div className="w-4 h-4">{activeFeature.icon}</div>
                </div>
                <h3
                  className="text-xl sm:text-[23px] font-semibold tracking-[-0.02em]"
                  style={{ color: textPrimary }}
                >
                  {activeFeature.title}
                </h3>
              </div>
              <p
                className="text-[14.5px] leading-[1.6] max-w-[580px]"
                style={{ color: textMuted }}
              >
                {activeFeature.desc}
              </p>
            </div>

            {activeFeature.title === 'Agent Memory' && (
              <Link
                to="/product/memory"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-mono font-semibold bg-white text-[#0a0b0d] hover:bg-[#e0f2fe] transition shrink-0"
              >
                <span>Explore Memory Engine</span>
                <span>&#8599;</span>
              </Link>
            )}
          </div>

          {/* 3 Sharp Architectural Spec Cells */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 mb-6"
            style={{
              borderTop: `1px solid ${gridLine}`,
              borderLeft: `1px solid ${gridLine}`,
              background: dark ? '#090a0d' : '#f8fafc',
            }}
          >
            {activeSpec.metrics.map((m, idx) => (
              <div
                key={idx}
                className="px-4 py-3"
                style={{
                  borderRight: `1px solid ${gridLine}`,
                  borderBottom: `1px solid ${gridLine}`,
                }}
              >
                <div className="text-[10px] font-mono tracking-[0.14em] uppercase text-[#71717a] mb-1">
                  {m.label}
                </div>
                <div
                  className="text-[13px] font-mono font-semibold truncate"
                  style={{ color: dark ? '#e0f2fe' : '#0f172a' }}
                >
                  {m.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Live Interactive Code / Architecture Telemetry Box */}
        <div
          style={{
            border: `1px solid ${gridLine}`,
            background: dark ? '#07080a' : '#0f172a',
          }}
        >
          <div
            className="px-4 py-2 flex items-center justify-between text-[10.5px] font-mono tracking-[0.12em] uppercase"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)',
              color: '#38bdf8',
            }}
          >
            <span>{activeSpec.visualBadge}</span>
            <span className="text-white/40">SDK v1.0.0</span>
          </div>
          <pre className="p-4 text-[12.5px] leading-[1.65] font-mono overflow-x-auto text-[#e4e4e7]">
            <code>{activeSpec.code}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}

const PLANS = CANONICAL_SPEC.plans.map(p => ({
  id: p.id,
  name: p.name,
  price: p.priceInr,
  priceUsd: p.priceUsd,
  period: p.period,
  yearly: p.yearlyInr ? `${p.yearlyInr} (${p.yearlyUsd})` : null,
  popular: p.popular,
  features: p.features,
}))

function VectorBg({ dark = true }) {
  const col = dark ? '#3b82f6' : '#2563eb'
  const op = dark ? 0.12 : 0.10
  const pts = [[15,20],[80,15],[90,68],[10,75],[50,8],[85,42],[35,55],[65,30]]
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{opacity: op, zIndex: 0}} xmlns="http://www.w3.org/2000/svg">
      {pts.map(([x,y],i) => (
        <g key={i}>
          <circle cx={`${x}%`} cy={`${y}%`} r="2.5" fill={col} />
          {i < pts.length - 1 && <line x1={`${x}%`} y1={`${y}%`} x2={`${pts[i+1][0]}%`} y2={`${pts[i+1][1]}%`} stroke={col} strokeWidth="0.5" strokeOpacity="0.4"/>}
        </g>
      ))}
    </svg>
  )
}

const ICEBERG_LOGO_PATH = "M 24.0 8.2 L 25.0 8.0 L 25.9 8.0 L 26.9 8.0 L 27.8 8.3 L 28.5 8.4 L 28.8 8.5 L 29.7 8.8 L 30.7 9.0 L 31.6 9.2 L 31.9 9.4 L 32.5 9.6 L 33.5 9.8 L 34.4 10.0 L 35.4 10.3 L 35.4 10.3 L 36.3 10.6 L 37.3 10.8 L 38.2 11.0 L 39.2 11.3 L 39.2 11.3 L 40.1 11.6 L 41.1 11.8 L 42.0 12.0 L 42.4 12.2 L 42.9 12.5 L 43.9 12.6 L 44.8 12.9 L 45.6 13.2 L 45.8 13.2 L 46.7 13.5 L 47.7 13.7 L 48.6 13.9 L 49.6 14.1 L 49.6 14.1 L 50.5 14.5 L 51.5 14.7 L 52.4 14.9 L 52.8 15.0 L 53.3 15.3 L 54.3 15.5 L 55.2 15.8 L 56.0 16.0 L 56.2 16.1 L 57.1 16.2 L 58.1 16.6 L 59.0 16.7 L 59.7 16.9 L 60.0 17.1 L 60.9 17.4 L 61.9 17.6 L 62.8 17.8 L 63.1 17.9 L 63.7 18.2 L 64.7 18.3 L 65.6 18.6 L 66.6 18.8 L 66.7 18.8 L 67.5 19.2 L 68.5 19.4 L 69.4 19.7 L 69.7 19.8 L 70.4 20.0 L 71.3 20.2 L 72.3 20.4 L 73.0 20.7 L 73.2 20.8 L 74.1 21.0 L 75.1 21.2 L 76.0 21.4 L 76.6 21.7 L 77.0 21.8 L 77.9 22.1 L 78.9 22.2 L 79.8 22.4 L 80.3 22.6 L 80.8 22.9 L 81.7 23.1 L 82.7 23.2 L 83.6 23.4 L 83.9 23.6 L 84.5 23.9 L 85.5 24.1 L 86.2 24.5 L 86.4 24.7 L 87.4 25.2 L 87.6 25.4 L 88.2 26.4 L 88.3 26.6 L 88.8 27.3 L 89.1 28.3 L 89.2 29.2 L 89.2 30.2 L 89.1 31.1 L 88.9 32.1 L 88.7 33.0 L 88.3 33.9 L 88.3 34.0 L 88.0 34.9 L 87.4 35.4 L 86.4 35.4 L 85.5 35.3 L 84.5 35.3 L 84.0 34.9 L 84.0 34.0 L 84.2 33.0 L 84.4 32.1 L 84.5 31.6 L 84.7 31.1 L 84.9 30.2 L 84.8 29.2 L 84.5 28.8 L 84.1 28.3 L 83.6 28.0 L 82.7 27.8 L 81.7 27.6 L 80.8 27.3 L 80.7 27.3 L 79.8 27.2 L 79.0 27.3 L 78.9 27.4 L 77.9 27.6 L 77.0 27.7 L 76.0 27.9 L 75.1 28.1 L 74.5 28.3 L 74.1 28.4 L 73.2 28.6 L 72.3 28.8 L 71.3 28.9 L 70.4 29.1 L 70.1 29.2 L 69.4 29.4 L 68.5 29.6 L 67.5 29.8 L 66.6 30.0 L 65.6 30.1 L 65.6 30.2 L 64.7 30.5 L 63.7 30.6 L 62.8 30.7 L 61.9 30.9 L 61.2 31.1 L 60.9 31.2 L 60.0 31.4 L 59.0 31.6 L 58.1 31.7 L 57.2 32.1 L 57.1 32.1 L 56.2 32.2 L 55.2 32.4 L 54.3 32.6 L 53.3 32.8 L 52.5 33.0 L 52.4 33.0 L 51.5 33.2 L 50.5 33.3 L 49.6 33.6 L 48.6 33.6 L 47.8 33.0 L 47.7 32.9 L 47.1 32.1 L 46.7 31.6 L 46.1 31.1 L 45.8 30.8 L 45.4 30.2 L 44.8 29.7 L 44.3 29.2 L 43.9 28.7 L 43.4 28.3 L 42.9 27.8 L 42.6 27.3 L 42.0 26.6 L 41.7 26.4 L 41.1 25.7 L 40.8 25.4 L 40.1 24.7 L 40.0 24.5 L 39.2 23.6 L 39.1 23.6 L 38.3 22.6 L 38.2 22.6 L 37.3 21.7 L 37.3 21.6 L 36.4 20.7 L 36.3 20.6 L 35.7 19.8 L 35.4 19.5 L 34.7 18.8 L 34.4 18.5 L 33.8 17.9 L 33.5 17.6 L 33.0 16.9 L 32.5 16.4 L 32.1 16.0 L 31.6 15.5 L 31.3 15.0 L 30.7 14.4 L 30.2 14.1 L 29.7 13.5 L 29.2 13.2 L 28.8 12.9 L 27.8 12.7 L 26.9 12.5 L 25.9 12.4 L 25.0 12.6 L 24.3 13.2 L 24.0 13.9 L 24.0 14.1 L 23.6 15.0 L 23.5 16.0 L 23.2 16.9 L 23.1 17.3 L 22.9 17.9 L 22.6 18.8 L 22.3 19.8 L 22.1 20.5 L 22.1 20.7 L 21.9 21.7 L 21.6 22.6 L 21.4 23.6 L 21.2 24.1 L 21.0 24.5 L 20.8 25.4 L 20.6 26.4 L 20.3 27.3 L 20.3 27.5 L 20.0 28.3 L 19.8 29.2 L 19.5 30.2 L 19.3 31.1 L 19.3 31.2 L 18.9 32.1 L 18.7 33.0 L 18.4 33.7 L 18.0 34.0 L 17.4 34.1 L 16.5 34.1 L 15.5 34.2 L 14.6 34.1 L 14.3 34.0 L 14.1 33.0 L 14.6 32.2 L 14.6 32.1 L 14.8 31.1 L 15.0 30.2 L 15.2 29.2 L 15.5 28.3 L 15.5 28.2 L 15.9 27.3 L 16.1 26.4 L 16.2 25.4 L 16.5 24.7 L 16.6 24.5 L 16.9 23.6 L 17.1 22.6 L 17.4 21.8 L 17.5 21.7 L 17.7 20.7 L 17.9 19.8 L 18.2 18.8 L 18.4 18.2 L 18.5 17.9 L 18.7 16.9 L 18.9 16.0 L 19.1 15.0 L 19.3 14.6 L 19.6 14.1 L 19.7 13.2 L 19.9 12.2 L 20.3 11.5 L 20.5 11.3 L 21.0 10.3 L 21.2 10.0 L 21.9 9.4 L 22.1 9.2 L 23.1 8.5 L 23.3 8.4 L 24.0 8.2 Z M 38.2 14.7 L 37.5 15.0 L 37.8 16.0 L 38.2 16.3 L 39.0 16.9 L 39.2 17.1 L 39.7 17.9 L 40.1 18.3 L 40.7 18.8 L 41.1 19.3 L 41.4 19.8 L 42.0 20.2 L 42.5 20.7 L 42.9 21.3 L 43.3 21.7 L 43.9 22.3 L 44.2 22.6 L 44.8 23.3 L 45.1 23.6 L 45.8 24.4 L 45.9 24.5 L 46.7 25.4 L 46.8 25.4 L 47.6 26.4 L 47.7 26.4 L 48.5 27.3 L 48.6 27.4 L 49.4 28.3 L 49.6 28.4 L 50.5 28.9 L 51.5 28.8 L 52.4 28.6 L 53.3 28.4 L 53.8 28.3 L 54.3 28.1 L 55.2 27.9 L 56.2 27.8 L 57.1 27.7 L 57.9 27.3 L 58.1 27.2 L 59.0 27.1 L 60.0 27.0 L 60.9 26.8 L 61.9 26.6 L 62.5 26.4 L 62.8 26.3 L 63.7 26.1 L 64.7 26.1 L 65.6 25.8 L 66.6 25.6 L 67.0 25.4 L 67.5 25.3 L 68.5 25.1 L 69.4 25.0 L 70.4 24.8 L 71.2 24.5 L 70.5 23.6 L 70.4 23.5 L 69.4 23.2 L 68.5 23.1 L 67.5 22.9 L 66.8 22.6 L 66.6 22.5 L 65.6 22.3 L 64.7 22.0 L 63.7 21.8 L 63.3 21.7 L 62.8 21.4 L 61.9 21.2 L 60.9 21.1 L 60.0 20.8 L 59.9 20.7 L 59.0 20.3 L 58.1 20.2 L 57.1 19.8 L 56.8 19.8 L 56.2 19.6 L 55.2 19.4 L 54.3 19.2 L 53.3 19.0 L 53.0 18.8 L 52.4 18.6 L 51.5 18.3 L 50.5 18.2 L 49.8 17.9 L 49.6 17.8 L 48.6 17.5 L 47.7 17.3 L 46.7 17.1 L 46.1 16.9 L 45.8 16.8 L 44.8 16.5 L 43.9 16.3 L 42.9 16.1 L 42.7 16.0 L 42.0 15.7 L 41.1 15.6 L 40.1 15.3 L 39.6 15.0 L 39.2 14.8 L 38.2 14.7 L 38.2 14.7 Z M 5.1 37.4 L 6.1 37.3 L 7.0 37.4 L 8.0 37.6 L 8.2 37.7 L 8.9 38.1 L 9.8 38.2 L 10.8 38.5 L 11.4 38.7 L 11.7 38.8 L 12.7 39.1 L 13.6 39.2 L 14.6 39.4 L 15.5 39.5 L 16.1 39.6 L 16.5 39.7 L 17.4 40.0 L 18.4 40.1 L 19.3 40.3 L 20.3 40.4 L 21.2 40.5 L 21.4 40.6 L 22.1 40.8 L 23.1 40.9 L 24.0 41.0 L 25.0 41.1 L 25.9 41.2 L 26.9 41.2 L 27.8 41.5 L 28.1 41.5 L 28.8 41.6 L 29.7 41.7 L 30.7 41.8 L 31.6 41.9 L 32.5 42.0 L 33.5 42.1 L 34.4 42.1 L 35.4 42.3 L 36.3 42.3 L 37.3 42.3 L 38.2 42.4 L 39.2 42.4 L 40.1 42.5 L 40.3 42.5 L 41.1 42.5 L 42.0 42.5 L 42.9 42.7 L 43.9 42.7 L 44.8 42.8 L 45.8 42.8 L 46.7 42.8 L 47.7 42.8 L 48.6 42.8 L 49.6 42.9 L 50.5 42.9 L 51.5 42.9 L 52.4 42.9 L 53.3 42.9 L 54.3 42.9 L 55.2 42.9 L 56.2 42.9 L 57.1 42.9 L 58.1 42.9 L 59.0 42.9 L 60.0 42.9 L 60.9 42.9 L 61.9 42.9 L 62.8 42.8 L 63.7 42.8 L 64.7 42.8 L 65.6 42.7 L 66.6 42.7 L 67.5 42.7 L 68.5 42.6 L 69.4 42.5 L 70.4 42.5 L 70.4 42.5 L 71.3 42.4 L 72.3 42.4 L 73.2 42.3 L 74.1 42.2 L 75.1 42.2 L 76.0 42.1 L 77.0 42.0 L 77.9 41.9 L 78.9 41.8 L 79.8 41.7 L 80.7 41.5 L 80.8 41.5 L 81.7 41.3 L 82.7 41.2 L 83.6 41.1 L 84.5 41.0 L 85.5 40.9 L 86.3 40.6 L 86.4 40.5 L 87.4 40.4 L 88.3 40.1 L 89.3 40.0 L 90.1 39.6 L 90.2 39.6 L 91.2 39.4 L 92.1 39.1 L 92.9 38.7 L 93.1 38.6 L 94.0 38.5 L 95.0 38.4 L 95.0 38.7 L 95.0 38.7 L 94.0 39.0 L 93.5 39.6 L 93.1 39.9 L 92.1 40.2 L 91.7 40.6 L 91.2 40.8 L 90.2 41.1 L 89.3 41.4 L 89.0 41.5 L 88.3 41.8 L 87.4 42.1 L 86.4 42.3 L 86.1 42.5 L 85.5 43.3 L 85.4 43.4 L 85.1 44.4 L 84.8 45.3 L 84.6 46.2 L 84.5 46.3 L 84.2 47.2 L 83.9 48.1 L 83.6 48.7 L 83.4 49.1 L 83.1 50.0 L 82.7 51.0 L 82.7 51.2 L 82.4 51.9 L 82.0 52.9 L 81.7 53.8 L 81.7 53.8 L 81.3 54.8 L 81.0 55.7 L 80.8 56.3 L 80.6 56.7 L 80.3 57.6 L 79.9 58.5 L 79.8 58.8 L 79.5 59.5 L 79.2 60.4 L 78.9 61.3 L 78.8 61.4 L 78.1 62.3 L 77.9 62.5 L 77.2 63.3 L 77.0 63.5 L 76.0 63.9 L 75.5 64.2 L 75.1 64.5 L 74.1 65.1 L 74.1 65.2 L 73.2 65.5 L 72.4 66.1 L 72.3 66.2 L 71.3 66.6 L 70.8 67.1 L 70.4 67.3 L 69.4 67.6 L 69.0 68.0 L 68.5 68.7 L 68.2 68.9 L 67.6 69.9 L 67.5 69.9 L 66.9 70.8 L 66.6 71.3 L 66.3 71.8 L 65.7 72.7 L 65.6 72.8 L 65.1 73.7 L 64.7 74.3 L 64.5 74.6 L 63.7 75.5 L 63.7 75.6 L 63.2 76.5 L 62.8 77.0 L 62.5 77.5 L 62.0 78.4 L 61.9 78.7 L 61.4 79.3 L 60.9 80.0 L 60.7 80.3 L 60.1 81.2 L 60.0 81.6 L 59.6 82.2 L 59.0 82.9 L 58.8 83.1 L 58.3 84.1 L 58.1 84.3 L 57.6 85.0 L 57.2 86.0 L 57.1 86.1 L 56.4 86.9 L 56.2 87.4 L 56.0 87.9 L 55.2 88.7 L 55.1 88.8 L 54.7 89.7 L 54.3 90.2 L 53.6 90.7 L 53.3 90.9 L 52.4 91.4 L 51.9 91.6 L 51.5 91.8 L 50.5 92.0 L 49.6 92.0 L 48.6 91.9 L 48.0 91.6 L 47.7 91.5 L 46.7 91.1 L 46.3 90.7 L 45.8 90.3 L 45.2 89.7 L 44.8 89.3 L 44.3 88.8 L 43.9 88.4 L 43.5 87.9 L 42.9 87.3 L 42.6 86.9 L 42.0 86.2 L 41.7 86.0 L 41.1 85.2 L 40.9 85.0 L 40.1 84.1 L 40.1 84.1 L 39.3 83.1 L 39.2 83.0 L 38.2 82.3 L 38.1 82.2 L 37.6 81.2 L 37.3 81.0 L 36.5 80.3 L 36.3 80.0 L 35.8 79.3 L 35.4 79.0 L 34.9 78.4 L 34.4 77.8 L 34.1 77.5 L 33.5 76.8 L 33.2 76.5 L 32.5 75.9 L 32.3 75.6 L 31.6 74.7 L 31.5 74.6 L 30.7 73.8 L 30.6 73.7 L 29.7 72.7 L 29.7 72.7 L 28.8 71.8 L 28.8 71.7 L 27.9 70.8 L 27.8 70.8 L 27.2 69.9 L 26.9 69.2 L 26.7 68.9 L 26.3 68.0 L 26.0 67.1 L 25.9 67.0 L 25.6 66.1 L 25.3 65.2 L 25.0 64.4 L 24.9 64.2 L 24.5 63.3 L 24.1 62.3 L 24.0 62.2 L 23.4 61.4 L 23.1 61.1 L 22.6 60.4 L 22.1 60.0 L 21.6 59.5 L 21.2 59.1 L 20.7 58.5 L 20.3 58.0 L 19.9 57.6 L 19.3 56.9 L 19.0 56.7 L 18.4 55.9 L 18.1 55.7 L 17.4 55.0 L 17.2 54.8 L 16.5 53.9 L 16.4 53.8 L 15.6 52.9 L 15.5 52.8 L 14.6 52.0 L 14.5 51.9 L 14.1 51.0 L 13.6 50.3 L 13.4 50.0 L 13.2 49.1 L 13.1 48.1 L 12.8 47.2 L 12.7 46.6 L 12.6 46.2 L 12.4 45.3 L 12.2 44.4 L 12.1 43.4 L 11.7 42.6 L 11.6 42.5 L 11.6 41.5 L 11.2 40.6 L 10.8 40.1 L 9.8 39.8 L 9.5 39.6 L 8.9 39.3 L 8.0 39.0 L 7.2 38.7 L 7.0 38.5 L 6.1 38.2 L 5.1 37.9 L 5.0 37.7 L 5.1 37.4 Z M 16.5 42.4 L 16.4 42.5 L 16.4 43.4 L 16.5 43.7 L 16.6 44.4 L 16.8 45.3 L 16.9 46.2 L 17.2 47.2 L 17.4 47.9 L 17.5 48.1 L 18.1 49.1 L 18.4 49.3 L 19.3 49.4 L 19.6 49.1 L 20.3 48.3 L 20.5 48.1 L 21.2 47.5 L 21.6 47.2 L 22.1 46.6 L 22.4 46.2 L 23.1 45.7 L 23.4 45.3 L 24.0 44.6 L 24.4 44.4 L 24.0 43.9 L 23.2 43.4 L 23.1 43.4 L 22.1 43.2 L 21.2 43.0 L 20.3 42.9 L 19.3 42.5 L 19.2 42.5 L 18.4 42.3 L 17.4 42.0 L 16.5 42.4 Z M 77.9 44.3 L 77.7 44.4 L 77.0 44.5 L 76.0 44.7 L 75.1 44.8 L 74.1 44.9 L 73.2 45.0 L 72.3 45.2 L 71.8 45.3 L 71.3 45.4 L 70.4 45.5 L 69.4 45.6 L 68.5 45.7 L 67.5 45.7 L 66.6 45.9 L 65.9 46.2 L 65.6 46.4 L 65.0 47.2 L 64.7 47.5 L 64.1 48.1 L 63.7 48.5 L 63.2 49.1 L 62.8 49.4 L 62.3 50.0 L 61.9 50.8 L 61.7 51.0 L 61.0 51.9 L 60.9 52.1 L 60.4 52.9 L 60.0 53.6 L 59.8 53.8 L 59.2 54.8 L 59.0 55.0 L 58.6 55.7 L 58.1 56.2 L 57.6 56.7 L 57.1 57.0 L 56.2 57.4 L 56.0 57.6 L 55.2 58.2 L 54.7 58.5 L 54.3 58.7 L 53.3 59.4 L 53.2 59.5 L 52.4 59.9 L 51.7 60.4 L 51.5 60.7 L 50.5 61.2 L 50.3 61.4 L 49.6 62.1 L 49.3 62.3 L 49.0 63.3 L 49.2 64.2 L 49.5 65.2 L 49.6 65.2 L 49.9 66.1 L 50.0 67.1 L 50.4 68.0 L 50.5 68.2 L 50.7 68.9 L 50.9 69.9 L 51.2 70.8 L 51.5 71.6 L 51.5 71.8 L 51.9 72.7 L 52.1 73.7 L 52.4 74.6 L 52.4 74.7 L 52.8 75.6 L 53.0 76.5 L 53.3 77.4 L 53.4 77.5 L 53.7 78.4 L 53.9 79.3 L 54.2 80.3 L 54.3 80.4 L 55.2 81.0 L 55.8 80.3 L 56.2 79.5 L 56.2 79.3 L 56.9 78.4 L 57.1 78.1 L 57.5 77.5 L 58.1 76.5 L 58.1 76.5 L 58.6 75.6 L 59.0 75.0 L 59.4 74.6 L 60.0 73.7 L 60.0 73.7 L 60.6 72.7 L 60.9 72.2 L 61.2 71.8 L 61.8 70.8 L 61.9 70.7 L 62.4 69.9 L 62.8 69.3 L 63.1 68.9 L 63.5 68.0 L 63.7 67.7 L 64.3 67.1 L 64.7 66.4 L 64.9 66.1 L 65.6 65.2 L 65.6 65.2 L 66.6 64.6 L 67.0 64.2 L 67.5 63.8 L 68.5 63.4 L 68.7 63.3 L 69.4 62.8 L 70.1 62.3 L 70.4 62.2 L 71.3 61.7 L 71.7 61.4 L 72.3 61.1 L 73.2 60.6 L 73.4 60.4 L 74.1 60.1 L 75.0 59.5 L 75.1 59.2 L 75.3 58.5 L 75.7 57.6 L 76.0 56.8 L 76.1 56.7 L 76.4 55.7 L 76.8 54.8 L 77.0 54.3 L 77.3 53.8 L 77.5 52.9 L 77.9 51.9 L 77.9 51.9 L 78.2 51.0 L 78.6 50.0 L 78.9 49.3 L 79.0 49.1 L 79.3 48.1 L 79.6 47.2 L 79.8 46.7 L 80.0 46.2 L 80.3 45.3 L 80.8 44.5 L 80.9 44.4 L 80.8 44.2 L 79.8 44.0 L 78.9 44.1 L 77.9 44.3 L 77.9 44.3 Z M 30.7 44.9 L 29.9 45.3 L 29.7 45.5 L 28.8 46.2 L 28.7 46.2 L 27.8 47.2 L 27.8 47.2 L 27.0 48.1 L 26.9 48.2 L 25.9 49.1 L 25.9 49.1 L 25.0 49.9 L 24.9 50.0 L 24.0 50.9 L 23.9 51.0 L 23.1 51.8 L 23.0 51.9 L 22.1 52.7 L 22.0 52.9 L 22.1 53.3 L 22.3 53.8 L 23.1 54.6 L 23.2 54.8 L 24.0 55.6 L 24.1 55.7 L 24.9 56.7 L 25.0 56.8 L 25.9 57.5 L 26.9 57.6 L 27.8 56.8 L 28.0 56.7 L 28.8 56.0 L 29.2 55.7 L 29.7 55.3 L 30.4 54.8 L 30.7 54.6 L 31.6 53.9 L 31.7 53.8 L 32.5 53.1 L 32.8 52.9 L 33.5 52.4 L 34.1 51.9 L 34.4 51.6 L 35.4 51.0 L 35.4 51.0 L 36.3 50.2 L 36.6 50.0 L 37.3 49.6 L 37.8 49.1 L 38.2 48.7 L 38.9 48.1 L 39.2 47.9 L 40.1 47.3 L 40.3 47.2 L 41.0 46.2 L 40.1 45.8 L 39.2 45.8 L 38.2 45.7 L 37.3 45.7 L 36.3 45.6 L 35.4 45.5 L 34.4 45.4 L 34.1 45.3 L 33.5 45.1 L 32.5 45.0 L 31.6 44.9 L 30.7 44.9 Z M 47.7 46.8 L 47.2 47.2 L 46.7 47.6 L 46.0 48.1 L 45.8 48.3 L 44.8 49.0 L 44.8 49.1 L 43.9 49.8 L 43.6 50.0 L 42.9 50.5 L 42.3 51.0 L 42.0 51.2 L 41.2 51.9 L 41.1 52.0 L 40.1 52.6 L 39.8 52.9 L 39.2 53.4 L 38.6 53.8 L 38.2 54.1 L 37.5 54.8 L 37.3 54.9 L 36.3 55.6 L 36.2 55.7 L 35.4 56.4 L 35.1 56.7 L 34.4 57.2 L 33.8 57.6 L 33.5 57.9 L 32.7 58.5 L 32.5 58.6 L 31.6 59.3 L 31.4 59.5 L 30.7 60.0 L 30.1 60.4 L 29.7 60.8 L 28.9 61.4 L 28.8 62.3 L 29.2 63.3 L 29.5 64.2 L 29.7 64.8 L 29.8 65.2 L 30.2 66.1 L 30.5 67.1 L 30.7 67.3 L 31.2 68.0 L 31.6 68.4 L 32.4 68.9 L 32.5 69.0 L 32.9 68.9 L 33.5 68.8 L 34.4 68.1 L 34.6 68.0 L 35.4 67.4 L 35.9 67.1 L 36.3 66.7 L 36.9 66.1 L 37.3 65.9 L 38.2 65.2 L 38.3 65.2 L 39.2 64.5 L 39.5 64.2 L 40.1 63.8 L 40.8 63.3 L 41.1 63.1 L 42.0 62.5 L 42.2 62.3 L 42.9 61.6 L 43.2 61.4 L 43.9 61.0 L 44.6 60.4 L 44.8 60.3 L 45.8 59.6 L 45.9 59.5 L 46.7 58.5 L 46.7 58.5 L 47.7 57.9 L 48.2 57.6 L 48.6 57.3 L 49.6 56.7 L 49.6 56.7 L 50.5 56.0 L 51.1 55.7 L 51.5 55.5 L 52.4 54.9 L 52.6 54.8 L 53.3 54.3 L 54.3 53.8 L 54.3 53.8 L 55.2 52.9 L 55.2 52.8 L 56.2 51.9 L 56.2 51.9 L 56.5 51.0 L 57.1 50.3 L 57.4 50.0 L 57.6 49.1 L 58.1 48.5 L 58.5 48.1 L 58.9 47.2 L 58.1 46.3 L 57.1 46.4 L 56.2 46.4 L 55.2 46.4 L 54.3 46.4 L 53.3 46.4 L 52.4 46.4 L 51.5 46.4 L 50.5 46.4 L 49.6 46.3 L 48.6 46.5 L 47.7 46.8 Z M 44.8 66.0 L 44.6 66.1 L 43.9 66.4 L 42.9 67.0 L 42.9 67.1 L 42.0 67.7 L 41.6 68.0 L 41.1 68.5 L 40.3 68.9 L 40.1 69.1 L 39.3 69.9 L 39.2 70.0 L 38.2 70.5 L 37.8 70.8 L 37.3 71.3 L 36.7 71.8 L 36.3 72.2 L 35.9 72.7 L 36.2 73.7 L 36.3 73.8 L 37.2 74.6 L 37.3 74.7 L 38.1 75.6 L 38.2 75.7 L 38.9 76.5 L 39.2 76.7 L 40.1 77.5 L 40.1 77.5 L 40.1 77.5 L 41.1 77.1 L 41.6 76.5 L 42.0 76.2 L 42.5 75.6 L 42.9 75.2 L 43.7 74.6 L 43.9 74.4 L 44.8 73.7 L 44.8 73.6 L 45.7 72.7 L 45.8 72.6 L 46.7 71.8 L 46.7 71.4 L 46.8 70.8 L 46.7 70.7 L 46.4 69.9 L 46.1 68.9 L 46.0 68.0 L 45.8 67.6 L 45.5 67.1 L 45.0 66.1 L 44.8 66.0 Z M 47.7 76.8 L 47.0 77.5 L 46.7 77.7 L 45.9 78.4 L 45.8 78.5 L 44.8 79.3 L 44.8 79.3 L 43.9 80.1 L 43.7 80.3 L 43.4 81.2 L 43.9 82.0 L 44.0 82.2 L 44.8 82.9 L 45.1 83.1 L 45.8 84.0 L 45.9 84.1 L 46.7 84.9 L 46.8 85.0 L 47.6 86.0 L 47.7 86.0 L 48.5 86.9 L 48.6 87.1 L 49.6 87.7 L 50.5 87.5 L 51.3 86.9 L 51.4 86.0 L 51.2 85.0 L 51.0 84.1 L 50.7 83.1 L 50.5 82.7 L 50.3 82.2 L 50.1 81.2 L 49.9 80.3 L 49.6 79.6 L 49.4 79.3 L 49.1 78.4 L 49.0 77.5 L 48.6 76.8 L 47.7 76.8 Z"

function IcebergDotMatrixEmblem({ dark = true }) {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -999, y: -999, active: false })
  const shockwavesRef = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const SIZE = 420
    const dpr = window.devicePixelRatio || 1
    canvas.width = SIZE * dpr
    canvas.height = SIZE * dpr
    ctx.scale(dpr, dpr)

    // 1. Rasterize the exact ICEBERG_LOGO_PATH onto an offscreen canvas to extract exact dot coordinates
    const off = document.createElement('canvas')
    off.width = SIZE
    off.height = SIZE
    const octx = off.getContext('2d')

    // Draw inner 3D shaded facets in green channel (G=255)
    octx.save()
    octx.translate(10, 10)
    octx.scale(4.0, 4.0)
    octx.fillStyle = 'rgb(0, 255, 0)'
    const innerPolys = [
      [[37.5, 15.0], [71.2, 24.5], [50.5, 28.9]],
      [[79.8, 44.0], [80.5, 45.5], [75.1, 59.2], [65.6, 65.2], [54.3, 80.8], [49.2, 63.3], [65.9, 46.2]],
      [[47.7, 46.8], [58.5, 47.2], [55.2, 52.8], [45.8, 59.6], [32.5, 68.9], [28.9, 61.8]],
      [[16.5, 42.4], [24.4, 44.4], [19.3, 49.4], [16.4, 43.4]],
      [[30.7, 44.9], [41.0, 46.2], [26.9, 57.6], [22.0, 52.9]],
    ]
    innerPolys.forEach(poly => {
      octx.beginPath()
      poly.forEach(([px, py], i) => (i === 0 ? octx.moveTo(px, py) : octx.lineTo(px, py)))
      octx.closePath()
      octx.fill()
    })

    // Draw exact IcebergLogo ribs & frame in red channel (R=255)
    const path = new Path2D(ICEBERG_LOGO_PATH)
    octx.fillStyle = 'rgb(255, 0, 0)'
    octx.strokeStyle = 'rgb(255, 0, 0)'
    octx.lineWidth = 1.15
    octx.lineJoin = 'round'
    octx.fill(path, 'evenodd')
    octx.stroke(path)
    octx.restore()

    const imgData = octx.getImageData(0, 0, SIZE, SIZE).data
    const dots = []
    const STEP = 4.6

    for (let y = 2.2; y < SIZE; y += STEP) {
      for (let x = 2.2; x < SIZE; x += STEP) {
        const ix = Math.floor(x)
        const iy = Math.floor(y)
        const idx = (iy * SIZE + ix) * 4
        const isRib = imgData[idx] > 110
        const isInner = !isRib && imgData[idx + 1] > 110
        if (isRib || isInner) {
          const distFromPeak = Math.hypot(x - 195, y - 55)
          const isAboveWater = y < 166
          dots.push({
            bx: x,
            by: y,
            isRib,
            isAboveWater,
            distFromPeak,
            seed: (x * 0.13 + y * 0.29) % (Math.PI * 2),
          })
        }
      }
    }

    // Spawn an initial subtle pulse so the user sees live action immediately
    shockwavesRef.current = [{ x: 205, y: 165, r: 10, maxR: 340, strength: 0.85 }]

    let rafId
    let startTime = performance.now()
    let lastAutoPulse = startTime

    const render = (now) => {
      const t = (now - startTime) * 0.001
      ctx.clearRect(0, 0, SIZE, SIZE)

      // Auto-trigger a deep sonar pulse from the waterline every 3.4 seconds
      if (now - lastAutoPulse > 3400) {
        lastAutoPulse = now
        shockwavesRef.current.push({
          x: 205,
          y: 164,
          r: 4,
          maxR: 340,
          strength: 0.9,
        })
      }

      // Update active shockwaves
      const waves = shockwavesRef.current
      for (let i = waves.length - 1; i >= 0; i--) {
        waves[i].r += 3.6
        if (waves[i].r > waves[i].maxR) {
          waves.splice(i, 1)
        }
      }

      const mx = mouseRef.current.x
      const my = mouseRef.current.y
      const mActive = mouseRef.current.active

      // Subtle floating levitation of the upper peak vs deep underwater keel
      const floatY = Math.sin(t * 1.8) * 2.2

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i]
        let x = d.bx
        let y = d.by + (d.isAboveWater ? floatY : floatY * 0.55)

        // 1. Continuous Crystalline Energy Wave flowing down the Iceberg
        const sonarWave = Math.sin(d.distFromPeak * 0.042 - t * 3.4)
        const shimmer = Math.sin(d.seed + t * 2.6) * 0.5 + 0.5

        // 2. Waterline current animation right along the horizon (y ~ 164)
        const waterDist = Math.abs(d.by - 164)
        const waterWave = waterDist < 22 ? Math.sin(d.bx * 0.06 - t * 5.0) * (1 - waterDist / 22) : 0

        let energy = Math.max(0, sonarWave) * 0.55 + waterWave * 0.5

        // 3. Shockwave ring boost
        for (let w = 0; w < waves.length; w++) {
          const sw = waves[w]
          const distW = Math.hypot(x - sw.x, y - sw.y)
          const ringDelta = Math.abs(distW - sw.r)
          if (ringDelta < 28) {
            const fade = 1 - sw.r / sw.maxR
            energy += (1 - ringDelta / 28) * fade * sw.strength
          }
        }

        // 4. Interactive Mouse Magnetic Field & Glow
        if (mActive) {
          const dx = x - mx
          const dy = y - my
          const distM = Math.hypot(dx, dy)
          const RADIUS = 92
          if (distM < RADIUS && distM > 0.1) {
            const factor = (1 - distM / RADIUS)
            const push = factor * factor * 5.5
            x += (dx / distM) * push
            y += (dy / distM) * push
            energy += factor * 1.15
          }
        }

        energy = Math.min(1.35, Math.max(0, energy))

        // Compute dot radius & color intensity
        let radius
        let alpha
        if (d.isRib) {
          radius = 1.42 + energy * 0.68
          alpha = 0.78 + energy * 0.22
        } else {
          // Inner 3D facet dots: dimmer at rest, ignite brightly when a wave/cursor passes!
          radius = 0.95 + shimmer * 0.25 + energy * 0.75
          alpha = 0.22 + shimmer * 0.12 + energy * 0.62
        }

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)

        // Vertical depth ratio (0.0 at top crown peak -> 1.0 at deep underwater tip)
        const depthRatio = Math.min(1, Math.max(0, (d.by - 40) / 340))

        if (energy > 0.82) {
          // Sub-zero frost white-cyan core at wave peak / waterline / cursor hover
          ctx.fillStyle = dark
            ? `rgba(224, 242, 254, ${Math.min(1, alpha)})`
            : `rgba(2, 132, 199, ${Math.min(1, alpha)})`
        } else if (energy > 0.38) {
          // Bright electric glacial cyan (#00d2ff from IcebergLogo.jsx)
          ctx.fillStyle = `rgba(0, 210, 255, ${Math.min(1, alpha)})`
        } else if (d.isRib) {
          // Smooth real-iceberg gradient: icy cyan (#00d2ff) above water -> deep arctic blue (#0072ff) underwater
          const rCol = Math.round(14 * (1 - depthRatio))
          const gCol = Math.round(205 - depthRatio * 85)
          const bCol = 255
          ctx.fillStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${Math.min(1, alpha)})`
        } else {
          // Deep shaded crystal facet arctic blue (#0066ff from IcebergLogo.jsx)
          ctx.fillStyle = `rgba(0, 118, 255, ${Math.min(1, alpha)})`
        }

        ctx.fill()
      }

      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafId)
  }, [dark])

  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const scaleX = 420 / rect.width
    const scaleY = 420 / rect.height
    mouseRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      active: true,
    }
  }

  const handleMouseLeave = () => {
    mouseRef.current = { x: -999, y: -999, active: false }
  }

  const handleClick = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const scaleX = 420 / rect.width
    const scaleY = 420 / rect.height
    shockwavesRef.current.push({
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      r: 2,
      maxR: 380,
      strength: 1.25,
    })
  }

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      title="Move cursor or click to send a pulse through the Iceberg"
      className="w-[310px] h-[310px] sm:w-[360px] sm:h-[360px] lg:w-[390px] lg:h-[390px] cursor-pointer"
    />
  )
}

function GHIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  )
}

export default function HomePage({ ProductDropdown }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [tab, setTab] = useState(0)
  const [dark, setDark] = useSessionTheme()
  const [showContactModal, setShowContactModal] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyEmail = () => {
    navigator.clipboard.writeText('contact@icebergdb.in')
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  useEffect(() => {
    try {
      localStorage.setItem('iceberg_theme', 'dark')
    } catch (_) {}
  }, [])
  const [visibleScores, setVisibleScores] = useState([])
  const [isUserTyping, setIsUserTyping] = useState(false)
  const autoRef = useRef(null)
  const typeRef = useRef(null)
  const queryIdxRef = useRef(0)

  // Auto-cycle: type query → search → show results → clear → repeat
  const runAutoCycle = () => {
    if (isUserTyping) return
    const q = DEMO_QUERIES[queryIdxRef.current % DEMO_QUERIES.length]
    queryIdxRef.current += 1
    let i = 0
    setQuery('')
    setResults([])
    setVisibleScores([])
    // type character by character
    typeRef.current = setInterval(() => {
      i++
      setQuery(q.text.slice(0, i))
      if (i >= q.text.length) {
        clearInterval(typeRef.current)
        // trigger search after typing done
        setTimeout(() => {
          setSearching(true)
          setTimeout(() => {
            setSearching(false)
            const res = DEMO_RESULTS[q.key]
            setResults(res)
            // animate score bars one by one
            res.forEach((_, idx) => {
              setTimeout(() => {
                setVisibleScores(prev => [...prev, idx])
              }, idx * 180)
            })
            // clear after 4s and restart
            autoRef.current = setTimeout(runAutoCycle, 4200)
          }, 700)
        }, 400)
      }
    }, 38)
  }

  useEffect(() => {
    const start = setTimeout(runAutoCycle, 1200)
    return () => {
      clearTimeout(start)
      clearTimeout(autoRef.current)
      clearInterval(typeRef.current)
    }
  }, [])

  // When user interacts, stop auto-cycle
  const handleUserSearch = (q) => {
    setIsUserTyping(true)
    clearTimeout(autoRef.current)
    clearInterval(typeRef.current)
    setQuery(q)
    if (!q.trim()) { setResults([]); setVisibleScores([]); return }
    setSearching(true)
    setVisibleScores([])
    setResults([])
    setTimeout(() => {
      const key = Object.keys(DEMO_RESULTS).find(k => q.toLowerCase().includes(k)) || 'return'
      const res = DEMO_RESULTS[key]
      setResults(res)
      setSearching(false)
      res.forEach((_, idx) => {
        setTimeout(() => setVisibleScores(prev => [...prev, idx]), idx * 180)
      })
    }, 500)
  }

  // Theme tokens (Pinecone Matte Charcoal + Crisp White + Solid Blue)
  const [heroMode, setHeroMode] = useState('builder') // 'builder' | 'demo'
  const bg = dark ? '#0a0b0d' : '#ffffff'
  const navBg = dark ? 'rgba(10,11,13,0.95)' : 'rgba(255,255,255,0.95)'
  const navBorder = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
  const gridLine = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'
  const textPrimary = dark ? '#ffffff' : '#111827'
  const textMuted = dark ? '#a1a1aa' : '#52525b'
  const cardBg = dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'
  const cardBorder = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'

  const submit = (e) => {
    e.preventDefault()
    const tq = !dark ? '&theme=light' : ''
    const tqFirst = !dark ? '?theme=light' : ''
    if (email) {
      window.location.href = `${D}/signup?email=${encodeURIComponent(email)}${tq}`
    } else {
      window.location.href = `${D}/signup${tqFirst}`
    }
  }

  const runSearch = (q) => {
    if (!q.trim()) { setResults([]); return }
    setSearching(true)
    setResults([])
    setTimeout(() => {
      const key = Object.keys(DEMO_RESULTS).find(k => q.toLowerCase().includes(k)) || 'return'
      setResults(DEMO_RESULTS[key])
      setSearching(false)
    }, 550)
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: bg, color: textPrimary }}>

      <Navbar />

      {/* ── Hero (Iceberg Architectural Grid & Proportions) ── */}
      <section className="relative" style={{ borderBottom: `1px solid ${gridLine}` }}>
        <div
          className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 pt-14 pb-16 sm:pt-20 sm:pb-24"
          style={{ borderLeft: `1px solid ${gridLine}`, borderRight: `1px solid ${gridLine}` }}
        >

          <div className="grid md:grid-cols-12 gap-8 lg:gap-10 items-center">

            {/* Left Column (7 cols): Exact Pinecone Typography & Single-Line Proportions */}
            <div className="md:col-span-7">
              <div className={`text-[11px] font-mono tracking-[0.2em] uppercase mb-4 ${dark ? 'text-[#00d2ff]' : 'text-[#0284c7]'}`}>
                BUILD KNOWLEDGEABLE AI
              </div>

              <h1 className="text-4xl sm:text-[46px] lg:text-[48px] font-semibold leading-[1.08] tracking-[-0.025em] mb-5 lg:whitespace-nowrap">
                <span style={{ color: textPrimary }}>Give agents </span>
                <span className={dark ? 'text-[#00d2ff]' : 'text-[#0284c7]'}>knowledge</span>
              </h1>

              <p className="text-[15.5px] sm:text-[16.5px] leading-[1.6] mb-9 max-w-[490px] font-normal" style={{ color: textMuted }}>
                The trusted AI knowledge platform where fast, accurate retrieval doesn&apos;t get more expensive as it scales.
              </p>

              {/* Sharp Rectangular CTA Buttons with Architectural Crosshair Ticks (Pure Ice-White + Black Bold Text) */}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={`${D}/signup${!dark ? '?theme=light' : ''}`}
                  className={`relative inline-flex items-center justify-center px-6 py-3 text-[13.5px] font-semibold transition ${
                    dark
                      ? 'bg-white hover:bg-[#e0f2fe] text-[#0a0b0d]'
                      : 'bg-[#0a0b0d] hover:bg-[#18181b] text-white'
                  }`}
                >
                  <span className="ib-corner-tl" />
                  <span className="ib-corner-tr" />
                  <span className="ib-corner-bl" />
                  <span className="ib-corner-br" />
                  Start building
                </a>

                <button
                  onClick={() => setHeroMode(heroMode === 'demo' ? 'builder' : 'demo')}
                  className="relative inline-flex items-center justify-center px-6 py-3 text-[13.5px] font-medium transition cursor-pointer"
                  style={{
                    background: 'transparent',
                    border: `1px solid ${dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)'}`,
                    color: textPrimary,
                  }}
                >
                  <span className="ib-corner-tl" />
                  <span className="ib-corner-tr" />
                  <span className="ib-corner-bl" />
                  <span className="ib-corner-br" />
                  Get a demo
                </button>
              </div>
            </div>

            {/* Right Column (5 cols): Live Interactive Iceberg Dot-Matrix Engine */}
            <div id="demo" className="md:col-span-5 flex items-center justify-center">
              {heroMode === 'builder' ? (
                <IcebergDotMatrixEmblem dark={dark} onOpenSearch={() => setHeroMode('demo')} />
              ) : (
                <div
                  className="w-full"
                  style={{
                    background: dark ? '#0a0b0d' : '#ffffff',
                    border: `1px solid ${gridLine}`,
                  }}
                >
                  {/* Architectural Header Bar */}
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{
                      borderBottom: `1px solid ${gridLine}`,
                      background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#00d2ff]" />
                      <span className="text-[11px] font-mono uppercase tracking-wider" style={{ color: textPrimary }}>
                        ICEBERG &mdash; HYBRID RRF SEARCH
                      </span>
                    </div>
                    <span className={`text-[11px] font-mono ${dark ? 'text-[#00d2ff]' : 'text-[#0284c7]'}`}>
                      8.73 ms p50 &middot; ap-south-1
                    </span>
                  </div>

                  <div className="p-4 sm:p-5" style={{ minHeight: 270 }}>
                    {/* Search Input */}
                    <div
                      className="flex items-center gap-2.5 px-3.5 py-2.5 mb-3.5"
                      style={{
                        border: `1px solid ${gridLine}`,
                        background: dark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)',
                      }}
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8} style={{ color: textMuted }}>
                        <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
                      </svg>
                      <span className="flex-1 text-xs font-mono typewriter-cursor" style={{ color: textPrimary }}>
                        {query || 'Search vectors...'}
                      </span>
                      {searching && <div className="w-3.5 h-3.5 border border-blue-500/30 border-t-blue-500 rounded-full animate-spin flex-shrink-0" />}
                    </div>

                    {/* Query Filter Chips */}
                    <div className="flex gap-1.5 mb-4 flex-wrap">
                      {['return policy', 'pricing plans', 'agent memory'].map(chip => (
                        <button
                          key={chip}
                          onClick={() => handleUserSearch(chip)}
                          className="text-[11px] font-mono px-2.5 py-1 transition cursor-pointer"
                          style={{
                            border: `1px solid ${gridLine}`,
                            color: textMuted,
                            background: 'transparent',
                          }}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    {/* Clean Result Rows */}
                    <div className="space-y-2">
                      {results.length === 0 && !searching && (
                        <div className="flex items-center justify-center py-10">
                          <span className="text-xs font-mono" style={{ color: textMuted }}>Querying index...</span>
                        </div>
                      )}
                      {results.map((r, i) => (
                        <div
                          key={`${r.text}-${i}`}
                          className="p-3"
                          style={{
                            border: `1px solid ${gridLine}`,
                            background: dark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.015)',
                          }}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[11px] font-mono" style={{ color: textMuted }}>
                              {r.source}
                            </span>
                            <span className="text-[11px] font-mono font-semibold text-[#3b82f6]">
                              {visibleScores.includes(i) ? `${(r.score * 100).toFixed(0)}% match` : '--'}
                            </span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: dark ? '#d4d4d8' : '#374151' }}>
                            {r.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Bottom Dot-Matrix Textured Logo Strip (Exact Pinecone Style with Iceberg Languages) */}
      <section style={{ borderBottom: `1px solid ${gridLine}` }}>
        <div
          className="max-w-[1220px] mx-auto py-7 px-6 overflow-hidden"
          style={{
            borderLeft: `1px solid ${gridLine}`,
            borderRight: `1px solid ${gridLine}`,
            backgroundImage: dark
              ? 'radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)'
              : 'radial-gradient(rgba(0,0,0,0.14) 1px, transparent 1px)',
            backgroundSize: '4px 4px',
          }}
        >
          <div
            className="relative overflow-hidden"
            style={{
              maskImage: 'linear-gradient(90deg, transparent, black 7%, black 93%, transparent)',
              WebkitMaskImage: 'linear-gradient(90deg, transparent, black 7%, black 93%, transparent)',
            }}
          >
            <div className="marquee-track" style={{ gap: '64px', alignItems: 'center' }}>
              {[...STACK, ...STACK].map((s, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-2.5 flex-shrink-0 select-none transition-opacity hover:opacity-100"
                  style={{
                    color: dark ? '#ffffff' : '#111827',
                    opacity: 0.92,
                  }}
                >
                  <span style={{ width: 21, height: 21, display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                    {s.svg}
                  </span>
                  <span className="text-[18px] font-semibold tracking-[-0.02em]">
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Get Started / Code Section (Exact Pinecone Architectural Grid & Left-Aligned Proportions) ── */}
      <section id="code" style={{ borderBottom: `1px solid ${gridLine}` }}>
        <div
          className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 py-16 sm:py-24"
          style={{ borderLeft: `1px solid ${gridLine}`, borderRight: `1px solid ${gridLine}` }}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#71717a] mb-3.5">
                GET STARTED
              </div>
              <h2
                className="text-3xl sm:text-[38px] lg:text-[42px] font-semibold tracking-[-0.025em] leading-[1.12] mb-4"
                style={{ color: textPrimary }}
              >
                One API key. Every way you build.
              </h2>
              <p
                className="text-[15px] sm:text-[16px] leading-[1.6] max-w-[520px] font-normal"
                style={{ color: textMuted }}
              >
                Install the official SDK in your stack, or connect your AI coding agent via MCP. Search, index, and manage agent memory from the same collection.
              </p>
            </div>

            <Link
              to="/docs"
              className={`inline-flex items-center gap-1.5 text-[13.5px] font-medium pb-1 border-b transition shrink-0 self-start md:self-end ${
                dark
                  ? 'text-white border-white/70 hover:text-[#00d2ff] hover:border-[#00d2ff]'
                  : 'text-[#111827] border-[#111827]/70 hover:text-[#0284c7] hover:border-[#0284c7]'
              }`}
            >
              <span>View docs</span>
              <span className="text-xs leading-none">&#8599;</span>
            </Link>
          </div>

          <HeroCodeBlock dark={dark} />
        </div>
      </section>

      {/* ── Capabilities Section (Compact Pinecone Open Architectural Spec Ledger with Clean Breathing Space) ── */}
      <section id="features" style={{ borderBottom: `1px solid ${gridLine}` }}>
        <div
          className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 py-16 sm:py-24"
          style={{ borderLeft: `1px solid ${gridLine}`, borderRight: `1px solid ${gridLine}` }}
        >
          {/* Compact Left-Aligned Pinecone Section Header */}
          <div className=" pb-8 sm:pb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#71717a] mb-2.5">
                CAPABILITIES
              </div>
              <h2
                className="text-2xl sm:text-[34px] lg:text-[38px] font-semibold tracking-[-0.025em] leading-[1.12] mb-2"
                style={{ color: textPrimary }}
              >
                Ship AI features.{' '}
                <span style={{ color: dark ? '#00d2ff' : '#0284c7' }}>Skip the ops.</span>
              </h2>
              <p
                className="text-[14.5px] sm:text-[15px] leading-[1.5] max-w-[520px] font-normal"
                style={{ color: textMuted }}
              >
                No DevOps. No ML expertise. Just an API key.
              </p>
            </div>

            <Link
              to="/product/memory"
              className={`inline-flex items-center gap-1.5 text-[13px] font-medium pb-1 border-b transition shrink-0 self-start md:self-end ${
                dark
                  ? 'text-white border-white/70 hover:text-[#00d2ff] hover:border-[#00d2ff]'
                  : 'text-[#111827] border-[#111827]/70 hover:text-[#0284c7] hover:border-[#0284c7]'
              }`}
            >
              <span>Explore Agent Memory Engine</span>
              <span className="text-xs leading-none">&#8599;</span>
            </Link>
          </div>

          {/* Framed Architectural 3-Column Spec Ledger (Aligned with HeroCodeBlock & Proper Breathing Space) */}
          <div
            className="grid grid-cols-1 md:grid-cols-3"
            style={{
              border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)'}`,
              background: dark ? '#0b0c0f' : '#ffffff',
            }}
          >
            {FEATURES.map((f, i) => {
              const isLastCol = (i + 1) % 3 === 0
              const isLastRow = i >= 6
              return (
                <div
                  key={i}
                  className="group relative px-6 sm:px-7 py-5 transition-colors duration-200 cursor-default"
                  style={{
                    borderRight: !isLastCol ? `1px solid ${gridLine}` : 'none',
                    borderBottom: !isLastRow ? `1px solid ${gridLine}` : 'none',
                    background: 'transparent',
                  }}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
                    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
                  }}
                >
                  {/* Subtle horizontal icy-blue sweep on hover */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{
                      background: dark
                        ? 'radial-gradient(260px circle at var(--mx, 40%) var(--my, 50%), rgba(0, 210, 255, 0.075), transparent 75%)'
                        : 'radial-gradient(260px circle at var(--mx, 40%) var(--my, 50%), rgba(2, 132, 199, 0.05), transparent 75%)',
                    }}
                  />

                  {/* Left Laser Indicator Bar (Lights up Glacial Cyan on Hover) */}
                  <div
                    className="w-[2px] h-4 transition-all duration-200 group-hover:h-7 absolute left-0 top-5"
                    style={{
                      background: dark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.15)',
                    }}
                  />
                  <div
                    className="w-[2px] h-7 opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-0 top-5"
                    style={{
                      background: '#00d2ff',
                      boxShadow: '0 0 12px rgba(0, 210, 255, 0.85)',
                    }}
                  />

                  {/* Single-Line Inline Header: Icon + Title + HOT Badge + Index */}
                  <div className="relative z-10 flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-[17px] h-[17px] shrink-0 transition-transform duration-200 group-hover:scale-110"
                        style={{ color: dark ? '#00d2ff' : '#0284c7' }}
                      >
                        {f.icon}
                      </span>
                      <h3
                        className="text-[15px] font-semibold tracking-[-0.01em] truncate transition-colors duration-200 group-hover:text-[#00d2ff]"
                        style={{ color: textPrimary }}
                      >
                        {f.title}
                      </h3>
                      {f.title === 'Agent Memory' && (
                        <span
                          className="text-[9.5px] font-mono px-1.5 py-0.5 uppercase tracking-[0.12em] font-semibold shrink-0"
                          style={{
                            background: dark ? 'rgba(0, 210, 255, 0.14)' : 'rgba(2, 132, 199, 0.1)',
                            color: dark ? '#00d2ff' : '#0284c7',
                            border: `1px solid ${dark ? 'rgba(0, 210, 255, 0.35)' : 'rgba(2, 132, 199, 0.3)'}`,
                          }}
                        >
                          HOT
                        </span>
                      )}
                    </div>

                    <span
                      className="text-[10.5px] font-mono tracking-[0.14em] shrink-0 transition-colors duration-200 group-hover:text-[#00d2ff]"
                      style={{ color: dark ? 'rgba(255,255,255,0.22)' : '#9ca3af' }}
                    >
                      0{i + 1}
                    </span>
                  </div>

                  {/* Compact Description aligned under title */}
                  <p
                    className="relative z-10 text-[13px] leading-[1.55] pl-[27px]"
                    style={{ color: textMuted }}
                  >
                    {f.desc}
                    {f.title === 'Agent Memory' && (
                      <Link
                        to="/product/memory"
                        className="inline-flex items-center gap-1 ml-2 text-[12px] font-mono font-medium text-[#00d2ff] hover:underline"
                      >
                        <span>Explore &#8599;</span>
                      </Link>
                    )}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Dedicated Agent Memory Showcase (Spacious Pinecone Architectural Frame) ── */}
      <section id="memory" style={{ borderBottom: `1px solid ${gridLine}` }}>
        <div
          className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 py-16 sm:py-24"
          style={{ borderLeft: `1px solid ${gridLine}`, borderRight: `1px solid ${gridLine}` }}
        >
          <div
            className="grid grid-cols-1 lg:grid-cols-12"
            style={{
              border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)'}`,
              background: dark ? '#0b0c0f' : '#ffffff',
            }}
          >
            {/* Left Column (6/12): Architectural Copy + Flush 2x2 Memory Tier Matrix + Ice-White CTA */}
            <div
              className="lg:col-span-6 p-6 sm:p-9 lg:p-11 flex flex-col justify-between"
              style={{
                borderRight: `1px solid ${gridLine}`,
              }}
            >
            <div>
              {/* Monospace Eyebrow */}
              <div
                className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.18em] uppercase mb-3.5 font-medium"
                style={{ color: dark ? '#00d2ff' : '#0284c7' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-pulse" />
                <span>THE COGNITIVE MEMORY LAYER FOR AI AGENTS</span>
              </div>

              {/* Headline */}
              <h2
                className="text-2xl sm:text-[34px] lg:text-[40px] font-semibold tracking-[-0.025em] leading-[1.1] mb-4"
                style={{ color: textPrimary }}
              >
                Stop your AI agents{' '}
                <span style={{ color: dark ? '#00d2ff' : '#0284c7' }}>
                  from having amnesia.
                </span>
              </h2>

              {/* Description */}
              <p
                className="text-[14.5px] sm:text-[15px] leading-[1.65] mb-7"
                style={{ color: textMuted }}
              >
                Stateless LLMs forget user preferences and past execution states when a session ends. Iceberg provides persistent, multi-tiered cognitive memory with automatic TTL and 8.73 ms p50 hybrid recall.
              </p>

              {/* Flush 2x2 Architectural Memory Tiers Matrix (Zero Rounded Corners) */}
              <div
                className="grid grid-cols-2 mb-8"
                style={{
                  borderTop: `1px solid ${gridLine}`,
                  borderLeft: `1px solid ${gridLine}`,
                  background: dark ? '#0b0c0f' : '#f8fafc',
                }}
              >
                {[
                  { id: '01', name: 'short_term', desc: 'Session context · 1 hr TTL' },
                  { id: '02', name: 'episodic', desc: 'Events & logs · 30 days TTL' },
                  { id: '03', name: 'long_term', desc: 'User profile · Permanent' },
                  { id: '04', name: 'semantic', desc: 'Domain wisdom · Permanent' },
                ].map((tier) => (
                  <div
                    key={tier.id}
                    className="group relative px-4 py-3.5 transition-colors duration-200"
                    style={{
                      borderRight: `1px solid ${gridLine}`,
                      borderBottom: `1px solid ${gridLine}`,
                    }}
                  >
                    {/* Left Glacial Cyan Laser Bar on Hover */}
                    <div
                      className="w-[2px] h-4 group-hover:h-6 transition-all duration-200 absolute left-0 top-3.5"
                      style={{ background: dark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.15)' }}
                    />
                    <div
                      className="w-[2px] h-6 opacity-0 group-hover:opacity-100 transition-all duration-200 absolute left-0 top-3.5"
                      style={{ background: '#00d2ff', boxShadow: '0 0 10px rgba(0,210,255,0.8)' }}
                    />

                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="text-[13px] font-mono font-semibold group-hover:text-[#00d2ff] transition-colors"
                        style={{ color: textPrimary }}
                      >
                        {tier.name}
                      </span>
                      <span
                        className="text-[10px] font-mono tracking-[0.12em]"
                        style={{ color: dark ? 'rgba(255,255,255,0.24)' : '#9ca3af' }}
                      >
                        {tier.id}
                      </span>
                    </div>
                    <div className="text-[12px]" style={{ color: textMuted }}>
                      {tier.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Row: Pure Crisp Ice-White Button + Underlined REST API Link */}
            <div className="flex flex-wrap items-center gap-5">
              <Link
                to="/product/memory"
                className="relative group inline-flex items-center justify-center px-6 py-3 text-[14px] font-semibold bg-white hover:bg-[#e0f2fe] text-[#0a0b0d] transition shadow-[0_0_25px_-5px_rgba(0,210,255,0.35)]"
              >
                <span className="ib-corner-tl" />
                <span className="ib-corner-tr" />
                <span className="ib-corner-bl" />
                <span className="ib-corner-br" />
                <span>Explore Agent Memory</span>
                <span className="ml-2 text-xs leading-none">&#8594;</span>
              </Link>

              <Link
                to="/docs"
                className={`inline-flex items-center gap-1.5 text-[13.5px] font-medium pb-1 border-b transition ${
                  dark
                    ? 'text-white border-white/70 hover:text-[#00d2ff] hover:border-[#00d2ff]'
                    : 'text-[#111827] border-[#111827]/70 hover:text-[#0284c7] hover:border-[#0284c7]'
                }`}
              >
                <span>View REST API</span>
                <span className="text-xs leading-none">&#8599;</span>
              </Link>
            </div>
          </div>

            {/* Right Column (6/12): Dot-Matrix Architectural Backdrop + Interactive Blue Hover Code Frame */}
            <div
              className="lg:col-span-6 p-6 sm:p-9 lg:p-11 flex items-center"
              style={{
                backgroundImage: dark
                  ? 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)'
                  : 'radial-gradient(rgba(15,23,42,0.06) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            >
              <div
                className="ib-code-frame w-full"
                style={{
                  background: dark ? '#0c0d10' : '#ffffff',
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
                  e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
                }}
              >
                {/* Top Tab Header Bar (Matches GET STARTED Pinecone Code Block) */}
                <div
                  className="flex items-center justify-between px-3 sm:px-4 py-2.5"
                  style={{
                    borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.1)'}`,
                    background: dark ? '#0e1014' : '#f8fafc',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3.5 py-1.5 text-[12px] font-mono font-semibold ${
                        dark ? 'bg-white text-[#0a0b0d]' : 'bg-[#0a0b0d] text-white'
                      }`}
                    >
                      agent_memory.py
                    </span>
                  </div>

                  <span
                    className="text-[10.5px] font-mono px-2.5 py-1 tracking-[0.06em]"
                    style={{
                      background: dark ? 'rgba(0, 210, 255, 0.1)' : 'rgba(2, 132, 199, 0.08)',
                      color: dark ? '#00d2ff' : '#0284c7',
                      border: `1px solid ${dark ? 'rgba(0, 210, 255, 0.3)' : 'rgba(2, 132, 199, 0.25)'}`,
                    }}
                  >
                    FastAPI &amp; Python · v1.0.0
                  </span>
                </div>

                {/* Code Body with Line Numbers & Pinecone Syntax Highlighting */}
                <div
                  className="relative px-4 sm:px-6 py-5 font-mono text-[12.5px] leading-[1.7] overflow-x-auto"
                  style={{
                    background: dark ? '#0c0d10' : '#ffffff',
                  }}
                >
                  {[
                    <><span className="s-kw">from</span><span className="s-pl"> iceberg </span><span className="s-kw">import</span><span className="s-pl"> </span><span className="s-fn">Client</span></>,
                    <></>,
                    <><span className="s-pl">client = </span><span className="s-fn">Client</span><span className="s-pl">(</span><span className="s-key">api_key</span><span className="s-pl">=</span><span className="s-str">"ib_live_..."</span><span className="s-pl">)</span></>,
                    <></>,
                    <><span className="s-cmt"># 1. Store persistent memory for an agent</span></>,
                    <><span className="s-pl">client.</span><span className="s-fn">remember</span><span className="s-pl">(</span></>,
                    <><span className="s-pl">  </span><span className="s-key">agent_id</span><span className="s-pl">=</span><span className="s-str">"coder_agent"</span><span className="s-pl">,</span></>,
                    <><span className="s-pl">  </span><span className="s-key">content</span><span className="s-pl">=</span><span className="s-str">"User prefers dark mode and uses FastAPI + React"</span><span className="s-pl">,</span></>,
                    <><span className="s-pl">  </span><span className="s-key">memory_type</span><span className="s-pl">=</span><span className="s-str">"long_term"</span></>,
                    <><span className="s-pl">)</span></>,
                    <></>,
                    <><span className="s-cmt"># 2. Recall relevant context (8.73 ms p50 hybrid RRF)</span></>,
                    <><span className="s-pl">memories = client.</span><span className="s-fn">recall</span><span className="s-pl">(</span></>,
                    <><span className="s-pl">  </span><span className="s-key">agent_id</span><span className="s-pl">=</span><span className="s-str">"coder_agent"</span><span className="s-pl">,</span></>,
                    <><span className="s-pl">  </span><span className="s-key">query</span><span className="s-pl">=</span><span className="s-str">"what framework does user use?"</span><span className="s-pl">,</span></>,
                    <><span className="s-pl">  </span><span className="s-key">top_k</span><span className="s-pl">=</span><span className="s-num">3</span></>,
                    <><span className="s-pl">)</span></>,
                    <><span className="s-fn">print</span><span className="s-pl">(memories)</span></>,
                    <><span className="s-cmt"># → [{"{"}"content": "...", "score": 0.98{"}"}]</span></>,
                  ].map((line, idx) => (
                    <div key={idx} className="flex items-baseline">
                      <span
                        className="w-7 shrink-0 select-none text-[11px]"
                        style={{ color: dark ? 'rgba(255,255,255,0.22)' : '#9ca3af' }}
                      >
                        {idx + 1}
                      </span>
                      <span className="whitespace-pre">{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ── Architecture Section (3-Step Pinecone Interactive Pipeline & Code Frame with Clean Breathing Space) ── */}
      <section id="architecture" style={{ borderBottom: `1px solid ${gridLine}` }}>
        <div
          className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 py-16 sm:py-24"
          style={{ borderLeft: `1px solid ${gridLine}`, borderRight: `1px solid ${gridLine}` }}
        >
          {/* Left-Aligned Pinecone Section Header */}
          <div className="pb-8 sm:pb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-[11px] font-mono tracking-[0.2em] uppercase text-[#71717a] mb-2.5">
                ARCHITECTURE
              </div>
              <h2
                className="text-2xl sm:text-[34px] lg:text-[38px] font-semibold tracking-[-0.025em] leading-[1.12] mb-2"
                style={{ color: textPrimary }}
              >
                Three steps.{' '}
                <span style={{ color: dark ? '#00d2ff' : '#0284c7' }}>Zero DevOps.</span>
              </h2>
              <p
                className="text-[14.5px] sm:text-[15px] leading-[1.5] max-w-[540px] font-normal"
                style={{ color: textMuted }}
              >
                Ingest raw documents or vectors, persist in domestic ap-south-1 NVMe clusters, and query with sub-2ms hybrid RRF.
              </p>
            </div>

            <Link
              to="/benchmarks"
              className={`inline-flex items-center gap-1.5 text-[13px] font-medium pb-1 border-b transition shrink-0 self-start md:self-end ${
                dark
                  ? 'text-white border-white/70 hover:text-[#00d2ff] hover:border-[#00d2ff]'
                  : 'text-[#111827] border-[#111827]/70 hover:text-[#0284c7] hover:border-[#0284c7]'
              }`}
            >
              <span>View benchmarks</span>
              <span className="text-xs leading-none">&#8599;</span>
            </Link>
          </div>

          {/* Interactive 3-Step Pinecone Code & Telemetry Frame */}
          <div
            className="ib-code-frame"
            style={{
              background: dark ? '#0b0c0f' : '#ffffff',
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
              e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
            }}
          >
            {/* Top 3-Step Architectural Selector Bar */}
            <div
              className="grid grid-cols-1 md:grid-cols-3"
              style={{
                borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.12)'}`,
                background: dark ? '#090a0d' : '#f8fafc',
              }}
            >
              {[
                {
                  num: '01',
                  title: 'Index',
                  sub: 'Upload PDFs, text, or raw vectors',
                  badge: 'AUTO-EMBED',
                },
                {
                  num: '02',
                  title: 'Store',
                  sub: 'Hosted in India (ap-south-1) NVMe',
                  badge: 'DPDP READY',
                },
                {
                  num: '03',
                  title: 'Search',
                  sub: 'Dense HNSW + BM25 keyword via RRF',
                  badge: 'HYBRID RRF',
                },
              ].map((step, i) => {
                const isActive = tab === i
                return (
                  <button
                    key={step.num}
                    type="button"
                    onClick={() => setTab(i)}
                    onMouseEnter={() => setTab(i)}
                    className="group relative text-left px-6 py-4 transition-all duration-150 cursor-pointer outline-none focus:outline-none"
                    style={{
                      borderRight: i < 2 ? `1px solid ${gridLine}` : 'none',
                      background: isActive
                        ? dark
                          ? '#12151c'
                          : '#e2e8f0'
                        : 'transparent',
                    }}
                  >
                    {/* Top Active Glacial Cyan Laser Bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] transition-all duration-150"
                      style={{
                        background: isActive ? '#00d2ff' : 'transparent',
                        boxShadow: isActive ? '0 0 12px rgba(0, 210, 255, 0.8)' : 'none',
                      }}
                    />

                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2.5">
                        {/* Crisp White Active Step Number Pill */}
                        <span
                          className="text-[11px] font-mono px-1.5 py-0.5 tracking-[0.08em]"
                          style={{
                            background: isActive
                              ? dark
                                ? '#ffffff'
                                : '#0a0b0d'
                              : dark
                                ? 'rgba(255,255,255,0.06)'
                                : 'rgba(15,23,42,0.06)',
                            color: isActive
                              ? dark
                                ? '#0a0b0d'
                                : '#ffffff'
                              : dark
                                ? 'rgba(255,255,255,0.45)'
                                : '#64748b',
                            fontWeight: 700,
                          }}
                        >
                          {step.num}
                        </span>
                        <span
                          className="text-[15.5px] font-semibold tracking-[-0.01em]"
                          style={{
                            color: isActive ? (dark ? '#ffffff' : '#0f172a') : textMuted,
                          }}
                        >
                          {step.title}
                        </span>
                      </div>

                      <span
                        className="text-[9.5px] font-mono px-1.5 py-0.5 uppercase tracking-[0.12em]"
                        style={{
                          background: isActive
                            ? dark
                              ? 'rgba(0, 210, 255, 0.14)'
                              : 'rgba(2, 132, 199, 0.12)'
                            : 'transparent',
                          color: isActive
                            ? dark
                              ? '#00d2ff'
                              : '#0284c7'
                            : dark
                              ? 'rgba(255,255,255,0.28)'
                              : '#94a3b8',
                          border: isActive
                            ? `1px solid ${dark ? 'rgba(0, 210, 255, 0.35)' : 'rgba(2, 132, 199, 0.3)'}`
                            : '1px solid transparent',
                        }}
                      >
                        {step.badge}
                      </span>
                    </div>

                    <div className="text-[12.5px] pl-[34px]" style={{ color: textMuted }}>
                      {step.sub}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Bottom Split: Code Execution Window (7/12) + Live Step Telemetry (5/12) */}
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left (7/12): Active Python Snippet with File Tab & Line Numbers */}
              <div
                className="lg:col-span-7 flex flex-col justify-between"
                style={{
                  borderRight: `1px solid ${gridLine}`,
                  background: dark ? '#0c0d10' : '#ffffff',
                }}
              >
                <div
                  className="px-4 py-2.5 flex items-center justify-between"
                  style={{
                    borderBottom: `1px solid ${gridLine}`,
                    background: dark ? '#0e1014' : '#f8fafc',
                  }}
                >
                  <span
                    className={`px-3 py-1 text-[12px] font-mono font-semibold ${
                      dark ? 'bg-white text-[#0a0b0d]' : 'bg-[#0a0b0d] text-white'
                    }`}
                  >
                    {['index.py', 'store.py', 'search.py'][tab]}
                  </span>
                  <span className="text-[10.5px] font-mono text-[#71717a]">
                    STEP 0{tab + 1} OF 03 · SDK v1.0.0
                  </span>
                </div>

                <div className="px-5 sm:px-6 py-6 font-mono text-[13px] leading-[1.75] overflow-x-auto min-h-[195px] flex flex-col justify-center">
                  {(tab === 0
                    ? [
                        <><span className="s-cmt"># Step 01: Upload PDF, stream text, or upsert raw vectors</span></>,
                        <><span className="s-kw">from</span><span className="s-pl"> iceberg </span><span className="s-kw">import</span><span className="s-pl"> </span><span className="s-fn">Client</span></>,
                        <></>,
                        <><span className="s-pl">client = </span><span className="s-fn">Client</span><span className="s-pl">(</span><span className="s-key">api_key</span><span className="s-pl">=</span><span className="s-str">"ib_your_key"</span><span className="s-pl">)</span></>,
                        <><span className="s-pl">client.</span><span className="s-fn">create_collection</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">)</span></>,
                        <><span className="s-pl">client.</span><span className="s-fn">upload</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"handbook.pdf"</span><span className="s-pl">)</span></>,
                      ]
                    : tab === 1
                    ? [
                        <><span className="s-cmt"># Step 02: Hosted in India (ap-south-1) — DPDP Act ready</span></>,
                        <><span className="s-pl">status = client.</span><span className="s-fn">collection_status</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">)</span></>,
                        <></>,
                        <><span className="s-cmt"># Instant NVMe HNSW index with zero cold starts</span></>,
                        <><span className="s-key">"status"</span><span className="s-pl">: </span><span className="s-str">"ready"</span><span className="s-pl">,</span></>,
                        <><span className="s-key">"region"</span><span className="s-pl">: </span><span className="s-str">"India (ap-south-1)"</span></>,
                      ]
                    : [
                        <><span className="s-cmt"># Step 03: Hybrid Search — Dense Vectors + BM25 Keyword RRF</span></>,
                        <><span className="s-pl">results = client.</span><span className="s-fn">search</span><span className="s-pl">(</span></>,
                        <><span className="s-pl">  </span><span className="s-key">collection</span><span className="s-pl">=</span><span className="s-str">"my_docs"</span><span className="s-pl">,</span></>,
                        <><span className="s-pl">  </span><span className="s-key">query</span><span className="s-pl">=</span><span className="s-str">"return policy for damaged items"</span><span className="s-pl">,</span></>,
                        <><span className="s-pl">  </span><span className="s-key">search_type</span><span className="s-pl">=</span><span className="s-str">"hybrid"</span><span className="s-pl">, </span><span className="s-key">top_k</span><span className="s-pl">=</span><span className="s-num">5</span></>,
                        <><span className="s-pl">)</span></>,
                      ]
                  ).map((line, idx) => (
                    <div key={idx} className="flex items-baseline">
                      <span
                        className="w-7 shrink-0 select-none text-[11px]"
                        style={{ color: dark ? 'rgba(255,255,255,0.22)' : '#9ca3af' }}
                      >
                        {idx + 1}
                      </span>
                      <span className="whitespace-pre">{line}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right (5/12): Dot-Matrix Live Engine Telemetry Output */}
              <div
                className="lg:col-span-5 p-6 flex flex-col justify-between"
                style={{
                  backgroundImage: dark
                    ? 'radial-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)'
                    : 'radial-gradient(rgba(15,23,42,0.055) 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                  backgroundColor: dark ? '#08090c' : '#f8fafc',
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-[10.5px] font-mono tracking-[0.16em] uppercase font-semibold"
                      style={{ color: dark ? '#00d2ff' : '#0284c7' }}
                    >
                      {[
                        'PIPELINE // INGESTION ENGINE',
                        'ENCLAVE // MUMBAI ap-south-1',
                        'EXECUTION // HYBRID RRF ENGINE',
                      ][tab]}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>200 OK</span>
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {(tab === 0
                      ? [
                          { label: 'CHUNKING & PARSING', val: 'Automatic PDF / Text Splitter' },
                          { label: 'EMBEDDING MODEL', val: 'Built-in CPU (Free) / OpenAI' },
                          { label: 'INDEX GRAPH', val: 'HNSW + BM25 Inverted Index' },
                        ]
                      : tab === 1
                      ? [
                          { label: 'DATA RESIDENCY', val: '100% India (Mumbai ap-south-1)' },
                          { label: 'STORAGE ENGINE', val: 'Hot RAM + NVMe Persistence' },
                          { label: 'IDLE POLICY', val: 'Never Pauses · 0ms Cold Start' },
                        ]
                      : [
                          { label: 'FUSION ALGORITHM', val: 'Dense Cosine + BM25 via RRF' },
                          { label: 'QUERY LATENCY', val: '< 2ms Sub-Millisecond p50' },
                          { label: 'TOP HIT SCORE', val: '0.974 (handbook.pdf · chunk_04)' },
                        ]
                    ).map((item, k) => (
                      <div
                        key={k}
                        className="px-3.5 py-2.5"
                        style={{
                          border: `1px solid ${gridLine}`,
                          background: dark ? '#0c0d11' : '#ffffff',
                        }}
                      >
                        <div className="text-[9.5px] font-mono tracking-[0.14em] uppercase text-[#71717a] mb-0.5">
                          {item.label}
                        </div>
                        <div
                          className="text-[12.5px] font-mono font-medium"
                          style={{ color: dark ? '#e0f2fe' : '#0f172a' }}
                        >
                          {item.val}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA Section (Exact Pinecone Architectural Frame & Interactive Blue Hover Glow) ── */}
      <section id="signup" style={{ borderBottom: `1px solid ${gridLine}` }}>
        <div
          className="max-w-[1220px] mx-auto px-6 sm:px-10 lg:px-14 py-16 sm:py-24"
          style={{ borderLeft: `1px solid ${gridLine}`, borderRight: `1px solid ${gridLine}` }}
        >
          <div
            className="ib-code-frame grid grid-cols-1 lg:grid-cols-12"
            style={{
              background: dark ? '#0b0c0f' : '#ffffff',
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
              e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
            }}
          >
            {/* Left Column (7/12): Headline + Subtitle + 3 Architectural Spec Pills */}
            <div
              className="lg:col-span-7 p-7 sm:p-10 lg:p-12 flex flex-col justify-between"
              style={{
                borderRight: `1px solid ${gridLine}`,
              }}
            >
              <div>
                <div
                  className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.2em] uppercase mb-3.5 font-medium"
                  style={{ color: dark ? '#00d2ff' : '#0284c7' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00d2ff] animate-pulse" />
                  <span>FOREVER FREE TIER // NO CREDIT CARD REQUIRED</span>
                </div>

                <h2
                  className="text-3xl sm:text-[38px] lg:text-[44px] font-semibold tracking-[-0.025em] leading-[1.08] mb-4"
                  style={{ color: textPrimary }}
                >
                  Start building{' '}
                  <span style={{ color: dark ? '#00d2ff' : '#0284c7' }}>
                    in 30 seconds.
                  </span>
                </h2>

                <p
                  className="text-[14.5px] sm:text-[15.5px] leading-[1.6] max-w-[520px] mb-7"
                  style={{ color: textMuted }}
                >
                  100,000 vectors free forever. Instant API key with built-in CPU embeddings, Mumbai (ap-south-1) residency, and zero cluster pausing.
                </p>
              </div>

              {/* 3 Compact Architectural Guarantee Tags */}
              <div
                className="grid grid-cols-3"
                style={{
                  borderTop: `1px solid ${gridLine}`,
                  borderLeft: `1px solid ${gridLine}`,
                  background: dark ? '#08090c' : '#f8fafc',
                }}
              >
                {[
                  { k: 'FREE TIER', v: '100K Vectors' },
                  { k: 'COLD STARTS', v: '0ms (Never Pauses)' },
                  { k: 'REGION', v: 'ap-south-1' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="px-3.5 py-2.5"
                    style={{
                      borderRight: `1px solid ${gridLine}`,
                      borderBottom: `1px solid ${gridLine}`,
                    }}
                  >
                    <div className="text-[9.5px] font-mono tracking-[0.14em] uppercase text-[#71717a] mb-0.5">
                      {item.k}
                    </div>
                    <div
                      className="text-[12px] font-mono font-semibold truncate"
                      style={{ color: dark ? '#e0f2fe' : '#0f172a' }}
                    >
                      {item.v}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column (5/12): Dot-Matrix Canvas + Sharp Rectangular Signup Form */}
            <div
              className="lg:col-span-5 p-7 sm:p-10 lg:p-12 flex flex-col justify-center"
              style={{
                backgroundImage: dark
                  ? 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)'
                  : 'radial-gradient(rgba(15,23,42,0.06) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
                backgroundColor: dark ? '#090a0d' : '#f8fafc',
              }}
            >
              <div className="text-[11px] font-mono tracking-[0.16em] uppercase text-[#71717a] mb-3">
                INSTANT WORKSPACE PROVISIONING
              </div>

              <form onSubmit={submit} className="flex flex-col gap-3.5 mb-6">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 text-[14px] font-mono outline-none transition"
                  style={{
                    background: dark ? '#0e1015' : '#ffffff',
                    border: `1px solid ${dark ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.18)'}`,
                    color: textPrimary,
                  }}
                />

                <button
                  type="submit"
                  className="relative group w-full inline-flex items-center justify-center px-6 py-3.5 text-[14px] font-semibold bg-white hover:bg-[#e0f2fe] text-[#0a0b0d] transition cursor-pointer shadow-[0_0_25px_-5px_rgba(0,210,255,0.35)]"
                >
                  <span className="ib-corner-tl" />
                  <span className="ib-corner-tr" />
                  <span className="ib-corner-bl" />
                  <span className="ib-corner-br" />
                  <span>Get API Key</span>
                  <span className="ml-2 text-xs leading-none">&#8594;</span>
                </button>
              </form>

              {/* Secondary Quick Links Row */}
              <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${gridLine}` }}>
                <Link
                  to="/pricing"
                  className={`inline-flex items-center gap-1 text-[12.5px] font-mono transition ${
                    dark ? 'text-[#a1a1aa] hover:text-[#00d2ff]' : 'text-[#4b5563] hover:text-[#0284c7]'
                  }`}
                >
                  <span>View pricing</span>
                  <span>&#8599;</span>
                </Link>

                <Link
                  to="/docs"
                  className={`inline-flex items-center gap-1 text-[12.5px] font-mono transition ${
                    dark ? 'text-[#a1a1aa] hover:text-[#00d2ff]' : 'text-[#4b5563] hover:text-[#0284c7]'
                  }`}
                >
                  <span>Read documentation</span>
                  <span>&#8599;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer dark={dark} />

      {showContactModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" 
          onClick={() => setShowContactModal(false)}
        >
          <div 
            className="bg-[#111] border border-[#222] rounded-2xl max-w-md w-full p-6 shadow-2xl relative" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowContactModal(false)} 
              className="absolute top-4 right-4 text-[#666] hover:text-white text-lg transition"
            >
              ✕
            </button>
            
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-1">Contact Iceberg DB</h3>
            <p className="text-sm text-[#888] mb-5">Have questions, need enterprise deployment, or want to talk to the team? We respond within a few hours.</p>
            
            <div className="bg-[#181818] border border-[#2a2a2a] rounded-xl p-3 flex items-center justify-between mb-4">
              <span className="font-mono text-white text-sm select-all">contact@icebergdb.in</span>
              <button 
                onClick={copyEmail} 
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition flex items-center gap-1.5"
              >
                {copied ? '✓ Copied!' : 'Copy Email'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a 
                href="https://mail.google.com/mail/?view=cm&fs=1&to=contact@icebergdb.in&su=Iceberg+DB+Inquiry" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-medium transition"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.28 24 3.434 24 5.457z"/>
                </svg>
                Open Gmail
              </a>
              <a 
                href="mailto:contact@icebergdb.in" 
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-medium transition"
              >
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                Mail App
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function HeroCodeBlock({ dark = true }) {
  const [mode, setMode] = useState("languages") // "languages" (default) | "tools"
  const [langTab, setLangTab] = useState("python")
  const [toolTab, setToolTab] = useState("claude")
  const [copiedCode, setCopiedCode] = useState(false)

  const LANG_TABS = [
    ["python", "Python", "sdk_quickstart.py"],
    ["javascript", "JS / TS", "sdk_quickstart.ts"],
    ["go", "Go", "main.go"],
    ["rust", "Rust", "main.rs"],
    ["java", "Java", "App.java"],
    ["dotnet", ".NET", "Program.cs"],
    ["curl", "cURL", "request.sh"],
  ]

  const TOOL_TABS = [
    ["claude", "Claude Code", "claude_mcp.sh"],
    ["cursor", "Cursor", ".cursor/mcp.json"],
    ["copilot", "Copilot", ".vscode/mcp.json"],
    ["codex", "Codex", "codex_agent.sh"],
    ["gemini", "Gemini", "gemini_mcp.sh"],
    ["cli", "CLI", "terminal.sh"],
    ["mcp", "MCP", "mcp_config.json"],
  ]

  const [copiedInstall, setCopiedInstall] = useState(false)

  const INSTALL_CMD = {
    python: "pip install icebergdb",
    javascript: "npm install icebergdb",
    go: "go get github.com/anku5265/iceberg-database/iceberg-sdk-go",
    rust: "cargo add icebergdb",
    java: "io.icebergdb:iceberg-sdk:1.0.0",
    dotnet: "dotnet add package IcebergDb",
    curl: "curl -X POST https://api.icebergdb.in/search",
    claude: "claude mcp add icebergdb --env ICEBERG_API_KEY=ib_your_key -- npx -y iceberg-mcp",
    cursor: "npx -y iceberg-mcp",
    copilot: "npx -y iceberg-mcp",
    codex: "npx -y iceberg-mcp",
    gemini: "gemini mcp add icebergdb --env ICEBERG_API_KEY=ib_your_key -- npx -y iceberg-mcp",
    cli: "pip install icebergdb",
    mcp: "npx -y iceberg-mcp",
  }

  const RAW_TEXT = {
    python: `# Install Official SDK (v1.0.0): pip install icebergdb\nfrom iceberg import Client\n\nclient = Client(api_key="ib_your_key")\nclient.create_collection("my_docs")\nclient.index_text("my_docs", "Iceberg DB is hosted in India (ap-south-1)")\nresults = client.search("my_docs", "where is Iceberg hosted?", search_type="hybrid", top_k=5)\nfor r in results: print(r.score, r.text)`,
    javascript: `// Install Official SDK (v1.0.0): npm install icebergdb\nimport { Client } from "icebergdb"\n\nconst client = new Client({ apiKey: "ib_your_key" })\nawait client.createCollection("my_docs")\nawait client.indexText("my_docs", "Iceberg DB is hosted in India (ap-south-1)")\nconst res = await client.search("my_docs", "where is Iceberg hosted?", { topK: 5, searchType: "hybrid" })`,
    go: `// Install Official SDK (v1.0.0): go get github.com/anku5265/iceberg-database/iceberg-sdk-go\nimport iceberg "github.com/anku5265/iceberg-database/iceberg-sdk-go"\n\nclient := iceberg.New("ib_your_key")\n_ = client.CreateCollection("my_docs")\n_ = client.IndexText("my_docs", "Our return policy allows 30 day returns.", "docs")\nres, _ := client.Search("my_docs", "return order", 5)`,
    rust: `// Install Official SDK (v1.0.0): cargo add icebergdb\nuse icebergdb::Client;\n\nlet client = Client::new("ib_your_key");\nclient.create_collection("my_docs").await?;\nclient.index_text("my_docs", "Our return policy allows 30 day returns.", None).await?;\nlet res = client.search("my_docs", "return order", 5).await?;`,
    java: `// Official Maven SDK (v1.0.0): io.icebergdb:iceberg-sdk:1.0.0\nimport in.iceberg.Client;\nimport java.util.Map;\n\nClient client = new Client("ib_your_key");\nclient.createCollection("my_docs");\nclient.indexText("my_docs", "Our return policy allows 30 day returns.", "docs");\nMap<String, Object> results = client.search("my_docs", "return order", 5, "hybrid");`,
    dotnet: `// Install Official SDK (v1.0.0): dotnet add package IcebergDb\nusing IcebergDb;\n\nvar client = new IcebergClient("ib_your_key");\nawait client.CreateCollectionAsync("my_docs");\nawait client.IndexTextAsync("my_docs", "Our return policy allows 30 day returns.");\nvar results = await client.SearchAsync("my_docs", "return order", topK: 5);`,
    curl: `# Direct HTTP REST API (v1.0.0) — Hosted in India (ap-south-1)\ncurl -X POST https://api.icebergdb.in/search \\\n  -H "X-API-Key: ib_your_key" \\\n  -H "Content-Type: application/json" \\\n  -d '{ "collection": "my_docs", "query": "return order", "top_k": 5, "search_type": "hybrid" }'`,
    claude: `# Connect Iceberg DB MCP Server (v1.0.0) directly inside Claude Code\nclaude mcp add icebergdb --env ICEBERG_API_KEY=ib_your_key -- npx -y iceberg-mcp\n\n# Then, inside Claude Code\n/iceberg:quickstart`,
    cursor: `// Add to .cursor/mcp.json in your project or global settings (v1.0.0)\n{\n  "mcpServers": {\n    "icebergdb": {\n      "command": "npx",\n      "args": ["-y", "iceberg-mcp"],\n      "env": { "ICEBERG_API_KEY": "ib_your_key" }\n    }\n  }\n}`,
    copilot: `// Add to .vscode/mcp.json for GitHub Copilot Agent Mode (v1.0.0)\n{\n  "servers": {\n    "icebergdb": {\n      "type": "stdio",\n      "command": "npx",\n      "args": ["-y", "iceberg-mcp"],\n      "env": { "ICEBERG_API_KEY": "ib_your_key" }\n    }\n  }\n}`,
    codex: `# Configure OpenAI Codex CLI with Iceberg DB MCP Server (v1.0.0)\nexport ICEBERG_API_KEY="ib_your_key"\n\n# Run Codex with full access to your Iceberg collections\ncodex --mcp "npx -y iceberg-mcp" "Create collection my_docs and index ./docs"`,
    gemini: `# Add Iceberg DB (v1.0.0) to Gemini CLI / Antigravity (~/.gemini/settings.json)\ngemini mcp add icebergdb --env ICEBERG_API_KEY=ib_your_key -- npx -y iceberg-mcp\n\n# Prompt Gemini Agent directly\ngemini "Search my_docs in Iceberg DB for refund policy"`,
    cli: `# Install Iceberg DB SDK (v1.0.0) & run MCP / CLI\npip install icebergdb\nexport ICEBERG_API_KEY="ib_your_key"\n\nnpx -y iceberg-mcp`,
    mcp: `// Universal Model Context Protocol (v1.0.0 — Claude Desktop, Windsurf, Cline)\n{\n  "mcpServers": {\n    "icebergdb": {\n      "command": "npx",\n      "args": ["-y", "iceberg-mcp"],\n      "env": {\n        "ICEBERG_API_KEY": "ib_your_key",\n        "ICEBERG_API_URL": "https://api.icebergdb.in"\n      }\n    }\n  }\n}`,
  }

  const HIGHLIGHTED_CODE = {
    python: [
      <><span className="s-cmt"># Install Official SDK (v1.0.0): pip install icebergdb</span></>,
      <><span className="s-kw">from</span><span className="s-pl"> iceberg </span><span className="s-kw">import</span><span className="s-fn"> Client</span></>,
      <></>,
      <><span className="s-var">client</span><span className="s-pl"> = </span><span className="s-fn">Client</span><span className="s-pl">(</span><span className="s-key">api_key</span><span className="s-pl">=</span><span className="s-str">"ib_your_key"</span><span className="s-pl">)</span></>,
      <><span className="s-var">client</span><span className="s-pl">.</span><span className="s-fn">create_collection</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">)</span></>,
      <><span className="s-var">client</span><span className="s-pl">.</span><span className="s-fn">index_text</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"Iceberg DB is hosted in India (ap-south-1)"</span><span className="s-pl">)</span></>,
      <><span className="s-var">results</span><span className="s-pl"> = client.</span><span className="s-fn">search</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"where is Iceberg hosted?"</span><span className="s-pl">, </span><span className="s-key">search_type</span><span className="s-pl">=</span><span className="s-str">"hybrid"</span><span className="s-pl">, </span><span className="s-key">top_k</span><span className="s-pl">=</span><span className="s-num">5</span><span className="s-pl">)</span></>,
      <><span className="s-kw">for</span><span className="s-pl"> r </span><span className="s-kw">in</span><span className="s-pl"> results: </span><span className="s-fn">print</span><span className="s-pl">(r.</span><span className="s-key">score</span><span className="s-pl">, r.</span><span className="s-key">text</span><span className="s-pl">)</span></>,
    ],
    javascript: [
      <><span className="s-cmt">// Install Official SDK (v1.0.0): npm install icebergdb</span></>,
      <><span className="s-kw">import</span><span className="s-pl"> {"{ "}</span><span className="s-fn">Client</span><span className="s-pl">{" }"} </span><span className="s-kw">from</span><span className="s-str"> "icebergdb"</span></>,
      <></>,
      <><span className="s-kw">const</span><span className="s-pl"> client = </span><span className="s-kw">new</span><span className="s-fn"> Client</span><span className="s-pl">{"({ "}</span><span className="s-key">apiKey</span><span className="s-pl">: </span><span className="s-str">"ib_your_key"</span><span className="s-pl">{" })"}</span></>,
      <><span className="s-kw">await</span><span className="s-pl"> client.</span><span className="s-fn">createCollection</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">)</span></>,
      <><span className="s-kw">await</span><span className="s-pl"> client.</span><span className="s-fn">indexText</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"Iceberg DB is hosted in India (ap-south-1)"</span><span className="s-pl">)</span></>,
      <><span className="s-kw">const</span><span className="s-pl"> res = </span><span className="s-kw">await</span><span className="s-pl"> client.</span><span className="s-fn">search</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"where is Iceberg hosted?"</span><span className="s-pl">, {"{ "}</span><span className="s-key">topK</span><span className="s-pl">: </span><span className="s-num">5</span><span className="s-pl">, </span><span className="s-key">searchType</span><span className="s-pl">: </span><span className="s-str">"hybrid"</span><span className="s-pl">{" })"}</span></>,
    ],
    go: [
      <><span className="s-cmt">// Install Official SDK (v1.0.0): go get github.com/anku5265/iceberg-database/iceberg-sdk-go</span></>,
      <><span className="s-kw">import</span><span className="s-pl"> iceberg </span><span className="s-str">"github.com/anku5265/iceberg-database/iceberg-sdk-go"</span></>,
      <></>,
      <><span className="s-var">client</span><span className="s-pl"> := iceberg.</span><span className="s-fn">New</span><span className="s-pl">(</span><span className="s-str">"ib_your_key"</span><span className="s-pl">)</span></>,
      <><span className="s-pl">_ = client.</span><span className="s-fn">CreateCollection</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">)</span></>,
      <><span className="s-pl">_ = client.</span><span className="s-fn">IndexText</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"Our return policy allows 30 day returns."</span><span className="s-pl">, </span><span className="s-str">"docs"</span><span className="s-pl">)</span></>,
      <><span className="s-var">res</span><span className="s-pl">, _ := client.</span><span className="s-fn">Search</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"return order"</span><span className="s-pl">, </span><span className="s-num">5</span><span className="s-pl">)</span></>,
    ],
    rust: [
      <><span className="s-cmt">// Install Official SDK (v1.0.0): cargo add icebergdb</span></>,
      <><span className="s-kw">use</span><span className="s-pl"> icebergdb::</span><span className="s-fn">Client</span><span className="s-pl">;</span></>,
      <></>,
      <><span className="s-kw">let</span><span className="s-pl"> client = Client::</span><span className="s-fn">new</span><span className="s-pl">(</span><span className="s-str">"ib_your_key"</span><span className="s-pl">);</span></>,
      <><span className="s-pl">client.</span><span className="s-fn">create_collection</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">).</span><span className="s-kw">await</span><span className="s-pl">?;</span></>,
      <><span className="s-pl">client.</span><span className="s-fn">index_text</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"Our return policy allows 30 day returns."</span><span className="s-pl">, None).</span><span className="s-kw">await</span><span className="s-pl">?;</span></>,
      <><span className="s-kw">let</span><span className="s-pl"> res = client.</span><span className="s-fn">search</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"return order"</span><span className="s-pl">, </span><span className="s-num">5</span><span className="s-pl">).</span><span className="s-kw">await</span><span className="s-pl">?;</span></>,
    ],
    java: [
      <><span className="s-cmt">// Official Maven SDK (v1.0.0): io.icebergdb:iceberg-sdk:1.0.0</span></>,
      <><span className="s-kw">import</span><span className="s-pl"> in.iceberg.</span><span className="s-fn">Client</span><span className="s-pl">;</span></>,
      <><span className="s-kw">import</span><span className="s-pl"> java.util.</span><span className="s-fn">Map</span><span className="s-pl">;</span></>,
      <></>,
      <><span className="s-fn">Client</span><span className="s-pl"> client = </span><span className="s-kw">new</span><span className="s-fn"> Client</span><span className="s-pl">(</span><span className="s-str">"ib_your_key"</span><span className="s-pl">);</span></>,
      <><span className="s-pl">client.</span><span className="s-fn">createCollection</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">);</span></>,
      <><span className="s-pl">client.</span><span className="s-fn">indexText</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"Our return policy allows 30 day returns."</span><span className="s-pl">, </span><span className="s-str">"docs"</span><span className="s-pl">);</span></>,
      <><span className="s-pl">Map{"<"}String, Object{">"} results = client.</span><span className="s-fn">search</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"return order"</span><span className="s-pl">, </span><span className="s-num">5</span><span className="s-pl">, </span><span className="s-str">"hybrid"</span><span className="s-pl">);</span></>,
    ],
    dotnet: [
      <><span className="s-cmt">// Install Official SDK (v1.0.0): dotnet add package IcebergDb</span></>,
      <><span className="s-kw">using</span><span className="s-pl"> </span><span className="s-fn">IcebergDb</span><span className="s-pl">;</span></>,
      <></>,
      <><span className="s-kw">var</span><span className="s-pl"> client = </span><span className="s-kw">new</span><span className="s-fn"> IcebergClient</span><span className="s-pl">(</span><span className="s-str">"ib_your_key"</span><span className="s-pl">);</span></>,
      <><span className="s-kw">await</span><span className="s-pl"> client.</span><span className="s-fn">CreateCollectionAsync</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">);</span></>,
      <><span className="s-kw">await</span><span className="s-pl"> client.</span><span className="s-fn">IndexTextAsync</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"Our return policy allows 30 day returns."</span><span className="s-pl">);</span></>,
      <><span className="s-kw">var</span><span className="s-pl"> results = </span><span className="s-kw">await</span><span className="s-pl"> client.</span><span className="s-fn">SearchAsync</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"return order"</span><span className="s-pl">, </span><span className="s-key">topK</span><span className="s-pl">: </span><span className="s-num">5</span><span className="s-pl">);</span></>,
    ],
    curl: [
      <><span className="s-cmt"># Direct HTTP REST API (v1.0.0) — Hosted in India (ap-south-1)</span></>,
      <><span className="s-fn">curl</span><span className="s-pl"> -X POST </span><span className="s-str">https://api.icebergdb.in/search</span><span className="s-pl"> \</span></>,
      <><span className="s-pl">  -H </span><span className="s-str">"X-API-Key: ib_your_key"</span><span className="s-pl"> \</span></>,
      <><span className="s-pl">  -H </span><span className="s-str">"Content-Type: application/json"</span><span className="s-pl"> \</span></>,
      <><span className="s-pl">  -d </span><span className="s-str">{'\'{ "collection": "my_docs", "query": "return order", "top_k": 5, "search_type": "hybrid" }\''}</span></>,
    ],
    claude: [
      <><span className="s-cmt"># Connect Iceberg DB MCP Server (v1.0.0) directly inside Claude Code</span></>,
      <><span className="s-fn">claude</span><span className="s-pl"> mcp add icebergdb </span><span className="s-key">--env</span><span className="s-pl"> </span><span className="s-str">ICEBERG_API_KEY=ib_your_key</span><span className="s-pl"> -- npx -y </span><span className="s-fn">iceberg-mcp</span></>,
      <></>,
      <><span className="s-cmt"># Then, inside Claude Code</span></>,
      <><span className="s-kw">/iceberg:quickstart</span></>,
    ],
    cursor: [
      <><span className="s-cmt">// Add to .cursor/mcp.json in your project or global Cursor settings (v1.0.0)</span></>,
      <><span className="s-pl">{"{"}</span></>,
      <><span className="s-pl">  </span><span className="s-key">"mcpServers"</span><span className="s-pl">: {"{"}</span></>,
      <><span className="s-pl">    </span><span className="s-fn">"icebergdb"</span><span className="s-pl">: {"{"}</span></>,
      <><span className="s-pl">      </span><span className="s-key">"command"</span><span className="s-pl">: </span><span className="s-str">"npx"</span><span className="s-pl">, </span><span className="s-key">"args"</span><span className="s-pl">: [</span><span className="s-str">"-y"</span><span className="s-pl">, </span><span className="s-str">"iceberg-mcp"</span><span className="s-pl">],</span></>,
      <><span className="s-pl">      </span><span className="s-key">"env"</span><span className="s-pl">: {"{ "}</span><span className="s-key">"ICEBERG_API_KEY"</span><span className="s-pl">: </span><span className="s-str">"ib_your_key"</span><span className="s-pl">{" }"}</span></>,
      <><span className="s-pl">    {"}"}</span></>,
      <><span className="s-pl">  {"}"}</span></>,
      <><span className="s-pl">{"}"}</span></>,
    ],
    copilot: [
      <><span className="s-cmt">// Add to .vscode/mcp.json for GitHub Copilot Agent Mode (v1.0.0)</span></>,
      <><span className="s-pl">{"{"}</span></>,
      <><span className="s-pl">  </span><span className="s-key">"servers"</span><span className="s-pl">: {"{"}</span></>,
      <><span className="s-pl">    </span><span className="s-fn">"icebergdb"</span><span className="s-pl">: {"{"}</span></>,
      <><span className="s-pl">      </span><span className="s-key">"type"</span><span className="s-pl">: </span><span className="s-str">"stdio"</span><span className="s-pl">, </span><span className="s-key">"command"</span><span className="s-pl">: </span><span className="s-str">"npx"</span><span className="s-pl">, </span><span className="s-key">"args"</span><span className="s-pl">: [</span><span className="s-str">"-y"</span><span className="s-pl">, </span><span className="s-str">"iceberg-mcp"</span><span className="s-pl">],</span></>,
      <><span className="s-pl">      </span><span className="s-key">"env"</span><span className="s-pl">: {"{ "}</span><span className="s-key">"ICEBERG_API_KEY"</span><span className="s-pl">: </span><span className="s-str">"ib_your_key"</span><span className="s-pl">{" }"}</span></>,
      <><span className="s-pl">    {"}"}</span></>,
      <><span className="s-pl">  {"}"}</span></>,
      <><span className="s-pl">{"}"}</span></>,
    ],
    codex: [
      <><span className="s-cmt"># Configure OpenAI Codex CLI with Iceberg DB MCP Server (v1.0.0)</span></>,
      <><span className="s-kw">export</span><span className="s-pl"> </span><span className="s-key">ICEBERG_API_KEY</span><span className="s-pl">=</span><span className="s-str">"ib_your_key"</span></>,
      <></>,
      <><span className="s-cmt"># Run Codex with full access to your Iceberg vector collections</span></>,
      <><span className="s-fn">codex</span><span className="s-pl"> </span><span className="s-key">--mcp</span><span className="s-pl"> </span><span className="s-str">"npx -y iceberg-mcp"</span><span className="s-pl"> </span><span className="s-str">"Create collection my_docs and index ./docs"</span></>,
    ],
    gemini: [
      <><span className="s-cmt"># Add Iceberg DB (v1.0.0) to Gemini CLI / Antigravity (~/.gemini/settings.json)</span></>,
      <><span className="s-fn">gemini</span><span className="s-pl"> mcp add icebergdb </span><span className="s-key">--env</span><span className="s-pl"> </span><span className="s-str">ICEBERG_API_KEY=ib_your_key</span><span className="s-pl"> -- npx -y </span><span className="s-fn">iceberg-mcp</span></>,
      <></>,
      <><span className="s-cmt"># Prompt Gemini Agent to search, upsert, or recall memory directly</span></>,
      <><span className="s-fn">gemini</span><span className="s-pl"> </span><span className="s-str">"Search my_docs in Iceberg DB for refund policy"</span></>,
    ],
    cli: [
      <><span className="s-cmt"># Install Iceberg DB CLI (v1.0.0) &amp; authenticate with your API key</span></>,
      <><span className="s-fn">pip</span><span className="s-pl"> install </span><span className="s-str">icebergdb</span></>,
      <><span className="s-kw">export</span><span className="s-pl"> </span><span className="s-key">ICEBERG_API_KEY</span><span className="s-pl">=</span><span className="s-str">"ib_your_key"</span></>,
      <></>,
      <><span className="s-fn">python</span><span className="s-pl"> -m iceberg.cli search </span><span className="s-key">--collection</span><span className="s-pl"> my_docs </span><span className="s-key">--query</span><span className="s-pl"> </span><span className="s-str">"refund policy"</span></>,
    ],
    mcp: [
      <><span className="s-cmt">// Universal Model Context Protocol (v1.0.0 — Claude Desktop, Windsurf, Cline)</span></>,
      <><span className="s-pl">{"{"}</span></>,
      <><span className="s-pl">  </span><span className="s-key">"mcpServers"</span><span className="s-pl">: {"{"}</span></>,
      <><span className="s-pl">    </span><span className="s-fn">"icebergdb"</span><span className="s-pl">: {"{"}</span></>,
      <><span className="s-pl">      </span><span className="s-key">"command"</span><span className="s-pl">: </span><span className="s-str">"npx"</span><span className="s-pl">, </span><span className="s-key">"args"</span><span className="s-pl">: [</span><span className="s-str">"-y"</span><span className="s-pl">, </span><span className="s-str">"iceberg-mcp"</span><span className="s-pl">],</span></>,
      <><span className="s-pl">      </span><span className="s-key">"env"</span><span className="s-pl">: {"{ "}</span><span className="s-key">"ICEBERG_API_KEY"</span><span className="s-pl">: </span><span className="s-str">"ib_your_key"</span><span className="s-pl">{" }"}</span></>,
      <><span className="s-pl">    {"}"}</span></>,
      <><span className="s-pl">  {"}"}</span></>,
      <><span className="s-pl">{"}"}</span></>,
    ],
  }

  const activeTabs = mode === "languages" ? LANG_TABS : TOOL_TABS
  const activeKey = mode === "languages" ? langTab : toolTab
  const setActiveKey = mode === "languages" ? setLangTab : setToolTab
  const codeLines = HIGHLIGHTED_CODE[activeKey] || HIGHLIGHTED_CODE.python
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 400, y: 120 })
  const boxRef = useRef(null)

  const handleMouseMoveBox = (e) => {
    const rect = boxRef.current?.getBoundingClientRect()
    if (!rect) return
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(RAW_TEXT[activeKey] || RAW_TEXT.python)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div>
      {/* ── Sharp Architectural Code Frame (Normal: Neutral Hairline -> Hover: Icy-Blue Border & Spotlight Glow) ── */}
      <div
        ref={boxRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMoveBox}
        className="relative overflow-hidden transition-all duration-300"
        style={{
          background: dark ? "#0d0e12" : "#ffffff",
          border: isHovered
            ? dark
              ? "1px solid rgba(125, 211, 252, 0.72)"
              : "1px solid rgba(2, 132, 199, 0.65)"
            : dark
            ? "1px solid rgba(255, 255, 255, 0.12)"
            : "1px solid rgba(0, 0, 0, 0.12)",
          boxShadow: isHovered
            ? dark
              ? "0 0 32px 2px rgba(56, 189, 248, 0.22), 0 0 10px rgba(125, 211, 252, 0.18)"
              : "0 0 28px rgba(2, 132, 199, 0.16)"
            : "none",
        }}
      >
        {/* Cursor-Tracking Blue Radial Spotlight Overlay (Active ONLY on Hover, matching Image 2) */}
        <div
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.085), transparent 70%)`,
          }}
        />
        {/* Top Tab Bar: Pure White Active Tab on Left + Sharp Category Switcher on Right */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 px-3 sm:px-4 py-2.5 border-b"
          style={{
            background: dark ? "#0a0b0e" : "#f8fafc",
            borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
          }}
        >
          {/* Left: Language / Agent Tabs (Exact Pinecone White Active Block) */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {activeTabs.map(([k, label]) => {
              const isSelected = activeKey === k
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setActiveKey(k)}
                  className="px-3.5 sm:px-4 py-2 text-[12px] sm:text-[12.5px] font-mono transition whitespace-nowrap cursor-pointer"
                  style={{
                    background: isSelected
                      ? dark
                        ? "#ffffff"
                        : "#0a0b0d"
                      : "transparent",
                    color: isSelected
                      ? dark
                        ? "#0a0b0d"
                        : "#ffffff"
                      : dark
                      ? "#a1a1aa"
                      : "#52525b",
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          {/* Right: Sharp Segmented Category Switcher (1. Coding Languages | 2. AI Coding Agents) */}
          <div
            className="inline-flex items-center shrink-0"
            style={{
              border: `1px solid ${dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)"}`,
              background: dark ? "#0a0b0d" : "#ffffff",
            }}
          >
            <button
              type="button"
              onClick={() => setMode("languages")}
              className="px-3 py-1.5 text-[11px] font-mono transition cursor-pointer whitespace-nowrap"
              style={{
                background:
                  mode === "languages"
                    ? dark
                      ? "rgba(0, 210, 255, 0.14)"
                      : "rgba(2, 132, 199, 0.1)"
                    : "transparent",
                color:
                  mode === "languages"
                    ? dark
                      ? "#00d2ff"
                      : "#0284c7"
                    : dark
                    ? "#71717a"
                    : "#6b7280",
                borderRight: `1px solid ${dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)"}`,
                fontWeight: mode === "languages" ? 600 : 400,
              }}
            >
              Coding Languages
            </button>
            <button
              type="button"
              onClick={() => setMode("tools")}
              className="px-3 py-1.5 text-[11px] font-mono transition cursor-pointer whitespace-nowrap"
              style={{
                background:
                  mode === "tools"
                    ? dark
                      ? "rgba(0, 210, 255, 0.14)"
                      : "rgba(2, 132, 199, 0.1)"
                    : "transparent",
                color:
                  mode === "tools"
                    ? dark
                      ? "#00d2ff"
                      : "#0284c7"
                    : dark
                    ? "#71717a"
                    : "#6b7280",
                fontWeight: mode === "tools" ? 600 : 400,
              }}
            >
              AI Coding Agents
            </button>
          </div>
        </div>

        {/* Code Body with Line Numbers + Square Top-Right Copy Icon Button (Exact Pinecone Style) */}
        <div
          className="relative px-5 sm:px-7 py-6 pr-16 font-mono text-[12.5px] sm:text-[13.5px] overflow-x-auto leading-[1.85] min-h-[185px]"
          style={{
            background: dark ? "#0d0e12" : "#0f1117",
            color: "#f4f4f5",
          }}
        >
          <button
            type="button"
            onClick={handleCopy}
            title="Copy code"
            aria-label="Copy code"
            className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center transition cursor-pointer"
            style={{
              background: copiedCode ? "rgba(0, 210, 255, 0.15)" : "rgba(255,255,255,0.02)",
              color: copiedCode ? "#00d2ff" : "rgba(255,255,255,0.65)",
              border: copiedCode ? "1px solid rgba(0, 210, 255, 0.4)" : "1px solid rgba(255,255,255,0.14)",
            }}
          >
            {copiedCode ? (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="9" y="9" width="13" height="13" rx="1" />
                <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
              </svg>
            )}
          </button>

          {codeLines.map((lineNode, idx) => (
            <div key={idx} className="flex items-start gap-5 whitespace-pre">
              <span
                className="select-none w-4 text-right text-[12px]"
                style={{ color: "#52525b" }}
              >
                {idx + 1}
              </span>
              <code className="flex-1">{lineNode}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
