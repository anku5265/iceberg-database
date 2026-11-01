import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import IcebergLogo from './components/IcebergLogo'
import { MobileNavDrawer, useSessionTheme } from './components/Navbar'

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
    { text: 'Free tier includes 100K vectors, unlimited collections, and free built-in embeddings.', score: 0.98, source: 'pricing.pdf' },
    { text: 'Starter plan at Rs.799/mo gives 1M vectors and 20K queries per day with zero pauses.', score: 0.93, source: 'pricing.pdf' },
    { text: 'Growth plan includes 5M vectors, metadata filters and priority at Rs.3,499/mo.', score: 0.88, source: 'pricing.pdf' },
  ],
  'memory': [
    { text: 'Long-term memory persists forever - ideal for user preferences.', score: 0.96, source: 'memory-docs.pdf' },
    { text: 'Short-term memory expires after 1 hour - perfect for session context.', score: 0.90, source: 'memory-docs.pdf' },
    { text: 'Episodic memory stores specific events and expires after 30 days.', score: 0.85, source: 'memory-docs.pdf' },
  ],
}

// Real SVG logos for each technology
const STACK = [
  {
    name: 'Python',
    svg: <svg viewBox="0 0 24 24" fill="#3776AB"><path d="M11.914 0C5.82 0 6.2 2.656 6.2 2.656l.007 2.752h5.814v.826H3.9S0 5.789 0 11.969c0 6.18 3.403 5.959 3.403 5.959h2.034v-2.867s-.109-3.4 3.35-3.4h5.766s3.24.052 3.24-3.131V3.147S18.28 0 11.914 0zm-3.2 1.818a1.047 1.047 0 1 1 0 2.094 1.047 1.047 0 0 1 0-2.094z"/><path d="M12.086 24c6.094 0 5.714-2.656 5.714-2.656l-.007-2.752h-5.814v-.826h8.121S24 18.211 24 12.031c0-6.18-3.403-5.959-3.403-5.959h-2.034v2.867s.109 3.4-3.35 3.4H9.447s-3.24-.052-3.24 3.131v5.283S5.72 24 12.086 24zm3.2-1.818a1.047 1.047 0 1 1 0-2.094 1.047 1.047 0 0 1 0 2.094z" fill="#FFD43B"/></svg>
  },
  {
    name: 'LangChain',
    svg: <svg viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#1C3C3C"/><path d="M4 12h4l2-4 4 8 2-4h4" stroke="#00D4AA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
  },
  {
    name: 'LlamaIndex',
    svg: <svg viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#7B2FBE"/><text x="4" y="17" fontSize="13" fontWeight="bold" fill="white" fontFamily="serif">Ll</text></svg>
  },
  {
    name: 'Java',
    svg: <svg viewBox="0 0 24 24"><path fill="#EA2D2E" d="M8.851 18.56s-.917.534.653.714c1.902.218 2.874.187 4.969-.211 0 0 .552.346 1.321.646-4.699 2.013-10.633-.118-6.943-1.149"/><path fill="#EA2D2E" d="M8.276 15.933s-1.028.761.542.924c2.032.209 3.636.227 6.413-.308 0 0 .384.389.987.602-5.679 1.661-12.007.13-7.942-1.218"/><path fill="#EA2D2E" d="M13.116 11.475c1.158 1.333-.304 2.533-.304 2.533s2.939-1.518 1.589-3.418c-1.261-1.772-2.228-2.652 3.007-5.688 0-.001-8.216 2.051-4.292 6.573"/><path fill="#5382A1" d="M19.129 20.795s.679.559-.747.991c-2.712.822-11.288 1.069-13.669.033-.856-.373.749-.89 1.254-.998.527-.114.828-.093.828-.093-.953-.671-6.156 1.317-2.643 1.887 9.58 1.553 17.462-.7 14.977-1.82"/><path fill="#5382A1" d="M9.292 13.21s-4.362 1.036-1.544 1.412c1.189.159 3.561.123 5.77-.062 1.806-.152 3.618-.477 3.618-.477s-.637.272-1.098.587c-4.429 1.165-12.986.623-10.522-.568 2.082-1.006 3.776-.892 3.776-.892"/><path fill="#5382A1" d="M16.928 17.99s3.228 1.677-3.572 2.163c-4.208.303-8.415-.05-8.415-.05s.826-.7 1.379-.956c2.912.623 4.494.536 8.115.139 1.215-.133 2.493-.296 2.493-.296"/><path fill="#5382A1" d="M17.125 5.209c.063.058-1.954 1.827-7.132 2.618-4.79.739-6.677 3.461-4.396 5.089 1.188.853 2.517 1.259 2.517 1.259-1.586-.717-2.781-1.765-2.317-3.208.685-2.139 5.483-3.073 9.328-3.758"/></svg>
  },
  {
    name: 'Node.js',
    svg: <svg viewBox="0 0 24 24"><path fill="#339933" d="M11.998 24a1.362 1.362 0 0 1-.681-.18l-2.164-1.28c-.323-.18-.165-.244-.059-.28.431-.15.518-.184.978-.446.048-.027.112-.017.162.012l1.663.986a.216.216 0 0 0 .201 0l6.487-3.744a.205.205 0 0 0 .101-.177V8.42a.207.207 0 0 0-.101-.178L12.1 4.5a.204.204 0 0 0-.202 0L5.412 8.242a.208.208 0 0 0-.102.178v7.487c0 .072.039.14.102.176l1.777 1.026c.964.482 1.554-.086 1.554-.658V9.184a.187.187 0 0 1 .187-.187h.816a.187.187 0 0 1 .187.187v7.267c0 1.288-.702 2.025-1.923 2.025-.376 0-.672 0-1.497-.407l-1.703-.981a1.367 1.367 0 0 1-.681-1.182V8.42c0-.487.259-.939.681-1.182l6.487-3.744a1.418 1.418 0 0 1 1.364 0l6.487 3.744c.422.243.681.695.681 1.182v7.487c0 .488-.259.939-.681 1.182l-6.487 3.744a1.362 1.362 0 0 1-.683.167zm2.001-5.156c-2.84 0-3.435-1.304-3.435-2.397a.187.187 0 0 1 .187-.188h.833a.188.188 0 0 1 .186.161c.127.858.507 1.292 2.23 1.292 1.372 0 1.956-.311 1.956-1.04 0-.42-.166-.732-2.301-1.054-1.784-.295-2.887-.895-2.887-2.146 0-1.141.962-1.82 2.574-1.82 1.81 0 2.707.628 2.822 1.976a.188.188 0 0 1-.187.202h-.836a.188.188 0 0 1-.183-.149c-.176-.784-.604-1.036-1.616-1.036-1.19 0-1.329.414-1.329.725 0 .376.163.486 2.232.698 2.048.21 2.953.804 2.953 2.088 0 1.231-1.027 1.938-2.999 1.938z"/></svg>
  },
  {
    name: 'Rust',
    svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.634 11.639l-1.002-.62a13.86 13.86 0 0 0-.031-.29l.855-.797a.376.376 0 0 0-.137-.625l-1.089-.37a13.742 13.742 0 0 0-.094-.281l.685-.958a.376.376 0 0 0-.23-.584l-1.141-.115a12.91 12.91 0 0 0-.153-.259l.499-1.086a.376.376 0 0 0-.316-.531l-1.154.143a13.08 13.08 0 0 0-.206-.227l.299-1.179a.376.376 0 0 0-.389-.468l-1.124.399a13.45 13.45 0 0 0-.252-.187l.09-1.217a.376.376 0 0 0-.452-.39l-1.054.646a14.03 14.03 0 0 0-.288-.143l-.12-1.206a.376.376 0 0 0-.504-.309l-.951.885a13.6 13.6 0 0 0-.314-.094l-.327-1.15a.376.376 0 0 0-.542-.218l-.818 1.109a13.83 13.83 0 0 0-.33-.039l-.523-1.059a.376.376 0 0 0-.568-.122l-.663 1.31a14 14 0 0 0-.334.02l-.703-.967a.376.376 0 0 0-.583.023l-.493 1.474a13.9 13.9 0 0 0-.327.099l-.873-.832a.376.376 0 0 0-.591.163l-.307 1.584a14.15 14.15 0 0 0-.311.174l-1.026-.685a.376.376 0 0 0-.588.298l-.108 1.647a14.3 14.3 0 0 0-.287.246l-1.158-.524a.376.376 0 0 0-.573.428l.092 1.657a14.15 14.15 0 0 0-.256.313l-1.26-.353a.376.376 0 0 0-.545.55l.288 1.617a14.07 14.07 0 0 0-.218.374l-1.328-.175a.376.376 0 0 0-.504.658l.479 1.53a14.2 14.2 0 0 0-.175.428l-1.362.003a.376.376 0 0 0-.449.751l.661 1.397a14.3 14.3 0 0 0-.127.474l-1.36.179a.376.376 0 0 0-.383.826l.833 1.224a14.35 14.35 0 0 0-.076.512l-1.32.351a.376.376 0 0 0-.306.886l.991 1.015a14.4 14.4 0 0 0-.023.54l-1.241.517a.376.376 0 0 0-.221.933l1.134.784a.376.376 0 1 0 .414.624l-.829-1.157v-.003zm0 0"/></svg>
  },
  {
    name: 'Go',
    svg: <svg viewBox="0 0 24 24"><path fill="#00ADD8" d="M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zM.047 11.306c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .059.035.035.082l-.093.28c-.012.047-.058.082-.105.082zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082zm12.129-2.36c-.736.187-1.239.327-1.963.514-.176.046-.187.058-.34-.117-.174-.199-.303-.327-.548-.444-.737-.362-1.45-.257-2.115.175-.795.514-1.204 1.274-1.192 2.22.011.935.654 1.706 1.577 1.835.795.105 1.46-.175 1.987-.771.105-.13.198-.27.315-.432H10.47c-.245 0-.304-.152-.222-.35.152-.362.432-.968.596-1.274a.315.315 0 0 1 .292-.187h4.253c-.023.316-.023.631-.07.947a4.983 4.983 0 0 1-.958 2.29c-.841 1.11-1.94 1.8-3.33 1.986-1.145.152-2.209-.07-3.143-.77-.865-.655-1.356-1.52-1.484-2.595-.152-1.274.222-2.419.993-3.424.83-1.086 1.928-1.776 3.272-2.02 1.098-.2 2.15-.07 3.096.571.62.41 1.063.97 1.356 1.648.07.105.023.164-.117.2zm3.868 6.461c-1.064-.024-2.034-.328-2.852-1.029a3.665 3.665 0 0 1-1.262-2.255c-.21-1.32.152-2.489.947-3.529.853-1.122 1.881-1.706 3.272-1.95 1.192-.21 2.314-.095 3.33.595.923.63 1.496 1.484 1.648 2.605.198 1.578-.257 2.863-1.344 3.962-.771.783-1.718 1.273-2.805 1.495-.315.06-.631.07-.934.106zm2.78-4.72c-.011-.153-.011-.27-.034-.387-.21-1.157-1.274-1.81-2.384-1.554-1.087.245-1.788 1.11-1.847 2.22-.047.91.56 1.53 1.39.304.084.631.07.947.024.747-.106 1.39-.538 1.776-1.168.106-.175.21-.362.269-.548h-.257z"/></svg>
  },
  {
    name: '.NET',
    svg: <svg viewBox="0 0 24 24"><path fill="#512BD4" d="M24 12c0 6.627-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0s12 5.373 12 12z"/><path fill="white" d="M5.5 16.5v-9h1.75l2.5 4.5 2.5-4.5H14v9h-1.75v-6l-2 3.5h-1l-2-3.5v6zm10.25 0v-9H17v7.5h3.5V16.5z"/></svg>
  },
  {
    name: 'Spring Boot',
    svg: <svg viewBox="0 0 24 24"><path fill="#6DB33F" d="M20.205 16.392c-2.469 3.289-7.741 2.179-11.122 2.338 0 0-.599.034-1.201.133 0 0 .228-.097.519-.198 2.374-.821 3.496-.986 4.939-1.727 2.71-1.388 5.408-4.413 5.957-7.555-1.032 3.022-4.17 5.623-7.027 6.679-1.955.722-5.492 1.424-5.492 1.424a5.38 5.38 0 0 1-.894-.454c-2.508-1.664-2.447-9.077 4.247-11.47 2.083-1.164 5.02-.534 6.374.12.024 0 .046.014.106.027a8.573 8.573 0 0 1 5.998 9.498c-.092.53-.195 1.054-.404 1.185z"/><path fill="#6DB33F" d="M14.734 1.326S16.358 0 18.256 0c0 0-.268 3.21-3.522 3.21z"/></svg>
  },
  {
    name: 'React',
    svg: <svg viewBox="0 0 24 24"><path fill="#61DAFB" d="M12 9.861A2.139 2.139 0 1 0 12 14.139 2.139 2.139 0 1 0 12 9.861zM6.008 16.255l-.472-.12C2.018 15.246 0 13.737 0 11.996s2.018-3.25 5.536-4.139l.472-.12.132.468a23.53 23.53 0 0 0 1.235 3.544l.101.31-.101.31a23.307 23.307 0 0 0-1.235 3.543l-.132.443zm-.403-8.56c-2.976.783-4.471 2.058-4.471 3.301 0 1.243 1.495 2.519 4.471 3.302a24.514 24.514 0 0 1 1.058-3.302 24.29 24.29 0 0 1-1.058-3.301zm14.395 8.56l-.132-.443a23.307 23.307 0 0 0-1.235-3.543l-.101-.31.101-.31a23.53 23.53 0 0 0 1.235-3.544l.132-.468.472.12c3.518.889 5.536 2.398 5.536 4.139s-2.018 3.25-5.536 4.139l-.472.12zm.304-8.56a24.29 24.29 0 0 1-1.058 3.301 24.514 24.514 0 0 1 1.058 3.302c2.976-.783 4.471-2.059 4.471-3.302 0-1.243-1.495-2.518-4.471-3.301zM12 21.953c-.757 0-1.557-.07-2.379-.217l-.415-.073-.154-.405a23.47 23.47 0 0 0-1.836-3.241l-.187-.277.131-.32a23.308 23.308 0 0 0 1.528-3.596l.179-.605h5.266l.179.605a23.308 23.308 0 0 0 1.528 3.596l.131.32-.187.277a23.47 23.47 0 0 0-1.836 3.241l-.154.405-.415.073c-.822.147-1.622.217-2.379.217zm-1.99-1.025c1.33.217 2.65.217 3.98 0a24.65 24.65 0 0 1 1.432-2.754 24.245 24.245 0 0 1-1.26-3.047h-4.324a24.245 24.245 0 0 1-1.26 3.047 24.65 24.65 0 0 1 1.432 2.754zm-4.039-8.37a23.308 23.308 0 0 0-1.528 3.596l-.179.605H9.53l-.179-.605a23.308 23.308 0 0 0-1.528-3.596l-.131-.32.187-.277a23.47 23.47 0 0 0 1.836-3.241l.154-.405.415-.073a16.97 16.97 0 0 1 4.758 0l.415.073.154.405a23.47 23.47 0 0 0 1.836 3.241l.187.277-.131.32z"/></svg>
  },
  {
    name: 'FastAPI',
    svg: <svg viewBox="0 0 24 24"><path fill="#009688" d="M12 0C5.375 0 0 5.375 0 12c0 6.626 5.375 12.001 12 12.001 6.626 0 12.001-5.375 12.001-12C24.001 5.375 18.626 0 12 0zm-.624 21.886v-7.498H7.19L13.203 2.114v7.498h4.029L11.376 21.886z"/></svg>
  },
  {
    name: 'Next.js',
    svg: <svg viewBox="0 0 24 24"><path fill="currentColor" d="M11.5725 0c-.1763 0-.3098.0013-.3584.0067-.0516.0053-.2159.021-.3636.0328-3.4088.3073-6.6017 2.1463-8.624 4.9728C1.1004 6.584.3802 8.3666.1082 10.255c-.0962.659-.108.8537-.108 1.7474.0001.8938.0119 1.0884.1082 1.748.6789 4.6644 3.9977 8.5041 8.4816 9.9793.7786.2479 1.5985.4169 2.5323.5179.3594.04 1.9135.04 2.2734 0 1.5613-.1701 2.8557-.5495 4.1319-1.2098.1963-.1005.2362-.1272.2089-.1494-.0187-.0151-1.6277-2.1696-3.5715-4.7884L10.01 13.8505 7.8969 10.7245c-1.1614-1.7004-2.1231-3.0983-2.134-3.1091-.0124-.0123-.0234.0051-.0509.0769-.2474.667-.5046 1.9234-.5906 2.867-.0484.5358-.0596.7115-.0596 1.2637 0 .5152.0088.6829.0484 1.1467.2991 3.4418 2.4758 6.4414 5.6585 7.8432.7518.3273 1.5478.5508 2.3944.6717.3699.054 1.3897.0766 1.7822.0405.7588-.0706 1.3906-.2301 2.0437-.5158 1.6059-.7061 2.9423-1.9101 3.8259-3.4578.7949-1.3856 1.2192-2.966 1.2192-4.5944 0-.5503-.0254-1.003-.0767-1.4447-.4164-3.5702-2.5657-6.7011-5.7014-8.4019-.9394-.5162-1.9577-.8712-3.0636-1.0623-.4474-.0773-.8877-.1126-1.4078-.1136z"/></svg>
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

const PLANS = [
  {
    name: 'Free', price: 'Rs.0', period: '', yearly: null,
    features: ['100K vectors', '1K queries/day', '1 GB storage', 'Unlimited collections', '1 project', 'Free built-in embeddings', 'Community support']
  },
  {
    name: 'Starter', price: 'Rs.799', period: '/mo', yearly: 'Rs.7,990/yr',
    features: ['1M vectors', '20K queries/day', '5 GB storage', 'Unlimited collections', '5 projects', 'Never pauses', 'Email support']
  },
  {
    name: 'Growth', price: 'Rs.3,499', period: '/mo', yearly: 'Rs.34,990/yr', popular: true,
    features: ['5M vectors', '100K queries/day', '25 GB storage', 'Unlimited collections', '15 projects', 'Metadata filters & Hybrid', 'Priority support']
  },
  {
    name: 'Scale', price: 'Rs.9,999', period: '/mo', yearly: 'Rs.99,990/yr',
    features: ['20M vectors', '500K queries/day', '100 GB storage', 'Unlimited projects', 'Dedicated Slack & WhatsApp', '99.9% SLA']
  },
]

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

  // Theme tokens
  const bg = dark ? '#050507' : '#f8f9fc'
  const navBg = dark ? 'rgba(5,5,7,0.9)' : 'rgba(248,249,252,0.92)'
  const navBorder = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'
  const textPrimary = dark ? 'white' : '#111827'
  const textMuted = dark ? 'rgba(255,255,255,0.4)' : '#6b7280'
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)'
  const cardBorder = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'

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

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: navBg, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderColor: navBorder }}>
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-7">
            <Link to="/" className="flex items-center gap-3 no-underline group">
              <IcebergLogo className="w-9 h-9 transition-transform group-hover:scale-105" />
              <span className="font-bold text-xl tracking-tight" style={{ color: textPrimary }}>Iceberg</span>
            </Link>
            <div className="hidden md:flex items-center">
              <ProductDropdown dark={dark} />
              {[['Developers', '#code'], ['Pricing', '#pricing'], ['Docs', `${D}/docs`]].map(([l, h]) => (
                <a key={l} href={h} className="px-3 py-1.5 rounded-lg transition text-sm hover:opacity-80" style={{ color: textMuted }}>{l}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={`${D}/login${!dark ? "?theme=light" : ""}`} className="hidden sm:inline-block text-sm px-3 py-1.5 transition" style={{ color: textMuted }}>Sign in</a>
            <a href={`${D}/signup${!dark ? "?theme=light" : ""}`} className="btn-primary text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-lg whitespace-nowrap">Start free</a>
            <button
              onClick={() => setDark(!dark)}
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
              className={`p-2 rounded-lg border transition ${dark ? 'border-white/10 text-[#888] hover:text-white hover:bg-white/5' : 'border-black/10 text-[#6b7280] hover:text-black hover:bg-black/5'}`}
            >
              {dark ? (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
              ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className={`md:hidden p-2 rounded-lg border transition ${dark ? "border-white/10 text-white/80 hover:text-white hover:bg-white/5" : "border-black/10 text-black/80 hover:text-black hover:bg-black/5"}`} aria-label="Toggle Menu">
              {mobileNavOpen ? (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              ) : (
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              )}
            </button>
          </div>
        </div>
        <MobileNavDrawer open={mobileNavOpen} setOpen={setMobileNavOpen} />
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom,transparent 70%,${bg})` }} />
        <div className="orb-blue" style={{ top: '-60px', left: '-5%' }} />
        <div className="orb-purple" style={{ top: '100px', right: '-5%' }} />
        <VectorBg dark={dark} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 w-full">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-14 items-center">

            {/* Left */}
            <div>
              <div className={`badge-live anim-1 mb-5 sm:mb-8 inline-flex text-xs sm:text-sm${!dark ? ' badge-live-light' : ''}`}>
                <span className="dot" />
                v1.0.0 &middot; 100K vectors free &middot; Hosted in India (ap-south-1)
              </div>
              <h1 className="anim-2 text-4xl sm:text-5xl lg:text-[3.75rem] font-black leading-[1.08] tracking-tight mb-4 sm:mb-6">
                <span style={{ color: textPrimary }}>Vector search</span><br />
                <span className="text-gradient">built for India.</span>
              </h1>
              <p className="anim-3 text-base sm:text-lg leading-relaxed mb-6 sm:mb-10 max-w-md" style={{ color: textMuted }}>
                Semantic search, agent memory, and RAG pipelines. Production-ready in minutes. Hosted in India (ap-south-1).
              </p>
              <div className="anim-4 flex flex-wrap gap-3 mb-8 sm:mb-12">
                <a href={`${D}/signup${!dark ? "?theme=light" : ""}`} className="btn-primary inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 text-sm rounded-xl">
                  Start building free
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
                </a>
                <a href="#demo" className="btn-secondary inline-flex items-center justify-center px-6 sm:px-7 py-3 text-sm rounded-xl"
                  style={!dark ? { background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)', color: '#374151' } : {}}>
                  See live demo
                </a>
              </div>
              <div className="anim-5 grid grid-cols-4 gap-2 sm:gap-5 pt-4 md:pt-6 border-t" style={{ borderColor: cardBorder }}>
                {[['1.95ms', 'engine p50'], ['100K', 'free vectors'], ['6', 'SDK languages'], ['\u221E', 'collections']].map(([v, l]) => (
                  <div key={l}>
                    <div className="text-lg sm:text-xl font-black" style={{ color: textPrimary }}>{v}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: dark ? 'rgba(255,255,255,0.25)' : '#9ca3af' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Option 1: Auto-typing Live Search Demo */}
            <div id="demo" className="anim-3 relative mt-6 md:mt-0">
              <div className="absolute -inset-1 rounded-3xl opacity-20 blur-xl pointer-events-none" style={{background:"linear-gradient(135deg,#2563eb,#7c3aed)"}} />
              {/* Single dark terminal window */}
              <div className="relative rounded-2xl overflow-hidden" style={{background:"#0d1117",border:"1px solid rgba(255,255,255,0.09)",boxShadow:"0 48px 96px rgba(0,0,0,0.65)"}}>
                {/* Titlebar */}
                <div className="flex items-center px-4 py-2.5 gap-2" style={{background:"rgba(255,255,255,0.025)",borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                  <div className="tbt bg-[#ff5f57]"/><div className="tbt bg-[#febc2e]"/><div className="tbt bg-[#28c840]"/>
                  <span className="ml-2 text-[11px] font-mono flex-1 text-center" style={{color:"rgba(255,255,255,0.2)"}}>iceberg — vector search demo</span>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/><span className="text-[10px]" style={{color:"rgba(255,255,255,0.18)"}}>live</span></div>
                </div>

                <div className="p-4 sm:p-5" style={{minHeight:250}}>
                  {/* Search input row */}
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <div className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} style={{color:"rgba(255,255,255,0.3)"}}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/></svg>
                      <span className="flex-1 text-[11px] sm:text-[12px] font-mono typewriter-cursor" style={{color:"rgba(255,255,255,0.75)",minHeight:"1em",display:"block"}}>{query || <span style={{color:"rgba(255,255,255,0.2)"}}>type a query…</span>}</span>
                      {searching && <div className="w-3.5 h-3.5 border border-blue-500/30 border-t-blue-500 rounded-full animate-spin flex-shrink-0"/>}
                    </div>
                  </div>

                  {/* Quick chips */}
                  <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-5 flex-wrap">
                    {["return policy","pricing plans","agent memory"].map(chip=>(
                      <button key={chip} onClick={()=>handleUserSearch(chip)} className="text-[10px] px-2.5 sm:px-3 py-1 rounded-full transition-all hover:border-blue-500/50" style={{border:"1px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.35)",background:"rgba(255,255,255,0.02)"}}>{chip}</button>
                    ))}
                  </div>

                  {/* Results */}
                  <div className="space-y-2 sm:space-y-2.5">
                    {results.length === 0 && !searching && (
                      <div className="flex flex-col items-center justify-center py-8 sm:py-10 gap-2" style={{opacity:0.25}}>
                        <svg className="w-8 h-8" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth={1}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/></svg>
                        <span className="text-[11px] text-white/40">results appear here</span>
                      </div>
                    )}
                    {results.map((r,i)=>(
                      <div key={`${r.text}-${i}`} className="rounded-xl p-3 sm:p-3.5" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",animation:"slideIn 0.3s ease forwards",animationDelay:`${i*0.09}s`,opacity:0}}>
                        {/* Score bar row */}
                        <div className="flex items-center gap-2.5 mb-1.5 sm:mb-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{background:"rgba(255,255,255,0.06)"}}>
                            <div style={{
                              height:"100%",
                              borderRadius:"9999px",
                              background:"linear-gradient(90deg,#3b82f6,#8b5cf6)",
                              width: visibleScores.includes(i) ? `${r.score*100}%` : "0%",
                              transition:"width 0.65s cubic-bezier(0.4,0,0.2,1)"
                            }}/>
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-mono font-bold tabular-nums" style={{color:"#60a5fa",minWidth:"2.5rem",textAlign:"right"}}>
                            {visibleScores.includes(i) ? `${(r.score*100).toFixed(0)}%` : "--"}
                          </span>
                          <span className="text-[10px]" style={{color:"rgba(255,255,255,0.2)"}}>{r.source}</span>
                        </div>
                        <p className="text-[10.5px] sm:text-[11px] leading-[1.5]" style={{color:"rgba(255,255,255,0.55)"}}>{r.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Bottom: code hint + latency badge */}
                  <div className="flex items-center justify-between mt-4 sm:mt-5 pt-3 sm:pt-4" style={{borderTop:"1px solid rgba(255,255,255,0.06)"}}>
                    <span className="font-mono text-[10px] sm:text-[11px] truncate mr-2" style={{color:"rgba(255,255,255,0.18)"}}>
                      <span className="s-var">client</span><span className="s-pl">.</span><span className="s-fn">search</span><span className="s-pl">(</span>
                      <span style={{color:"#c3e88d"}}>{query ? `"${query}"` : "…"}</span>
                      <span className="s-pl">)</span>
                    </span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full font-mono font-bold transition-all duration-500 flex-shrink-0" style={{
                      background: results.length > 0 ? "rgba(34,197,94,0.12)" : "transparent",
                      color: results.length > 0 ? "#4ade80" : "transparent",
                      border: results.length > 0 ? "1px solid rgba(34,197,94,0.25)" : "1px solid transparent"
                    }}>~14ms</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className={`divider${!dark ? " divider-light" : ""}`} />
      <section className="py-8 overflow-hidden" style={{ background: dark ? "transparent" : "rgba(0,0,0,0.01)" }}>
        <p className="text-center text-[10px] uppercase tracking-widest mb-6" style={{ color: dark ? "rgba(255,255,255,0.15)" : "#9ca3af" }}>Works with your stack</p>
        <div className="relative overflow-hidden" style={{ maskImage: "linear-gradient(90deg,transparent,black 8%,black 92%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,black 8%,black 92%,transparent)" }}>
          <div className="marquee-track">
            {[...STACK, ...STACK].map((s, i) => (
              <div key={i} className="marquee-item" style={{ color: dark ? "rgba(255,255,255,0.4)" : "#6b7280", background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)"}` }}>
                <span style={{ width: 16, height: 16, display: "inline-flex", alignItems: "center", flexShrink: 0 }}>{s.svg}</span>
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className={`divider${!dark ? " divider-light" : ""}`} />

      <section id="code" className="py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-[10px] uppercase tracking-widest mb-4" style={{ color: dark ? "rgba(255,255,255,0.18)" : "#9ca3af" }}>Developer first</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ color: textPrimary }}>Any language.<br /><span className="text-gradient">Any framework.</span></h2>
            <p className="text-sm max-w-xs mx-auto" style={{ color: textMuted }}>Python, JS, Go, Java, .NET, Rust or plain REST.</p>
          </div>
          <HeroCodeBlock dark={dark} />
        </div>
      </section>
      <div className={`divider${!dark ? " divider-light" : ""}`} />

      <section id="features" className="py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[10px] uppercase tracking-widest mb-4" style={{ color: dark ? "rgba(255,255,255,0.18)" : "#9ca3af" }}>Capabilities</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ color: textPrimary }}>Ship AI features.<br /><span className="text-gradient">Skip the ops.</span></h2>
            <p className="text-sm" style={{ color: textMuted }}>No DevOps. No ML expertise. Just an API key.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="rounded-2xl p-4 md:p-7 cursor-default transition-all duration-300" style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: "blur(12px)" }}
                onMouseEnter={e => { e.currentTarget.style.background = dark ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(-2px)" }}
                onMouseLeave={e => { e.currentTarget.style.background = cardBg; e.currentTarget.style.transform = "translateY(0)" }}>
                <div className={`icon-box mb-5${!dark ? " icon-box-light" : ""}`}>{f.icon}</div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold" style={{ color: dark ? "rgba(255,255,255,0.85)" : "#111827" }}>{f.title}</h3>
                  {f.title === 'Agent Memory' && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">HOT</span>
                  )}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{f.desc}</p>
                {f.title === 'Agent Memory' && (
                  <Link to="/product/memory" className="text-xs text-blue-400 font-semibold hover:underline inline-flex items-center gap-1 mt-3">
                    Explore Agent Memory Engine →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dedicated Agent Memory Showcase ── */}
      <section id="memory" className="py-12 md:py-16 relative overflow-hidden" style={{ background: dark ? "rgba(37,99,235,0.02)" : "rgba(37,99,235,0.015)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-3xl p-8 md:p-14 relative overflow-hidden border" style={{ background: dark ? "linear-gradient(145deg, rgba(13,17,23,0.92), rgba(10,14,35,0.8))" : "linear-gradient(145deg, #ffffff, #f0f7ff)", borderColor: dark ? "rgba(59,130,246,0.25)" : "rgba(59,130,246,0.2)", boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6" style={{ background: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              THE COGNITIVE MEMORY LAYER FOR AI AGENTS
            </div>

            <div className="grid md:grid-cols-12 gap-8 lg:gap-10 items-center">
              {/* Left Column */}
              <div className="md:col-span-6 space-y-5">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight" style={{ color: textPrimary }}>
                  Stop your AI agents <br />
                  <span className="text-gradient">from having amnesia.</span>
                </h2>
                <p className="text-base leading-relaxed" style={{ color: textMuted }}>
                  Stateless LLMs forget user preferences and past execution states when a session ends. Iceberg provides persistent, multi-tiered cognitive memory with automatic TTL and 15ms recall.
                </p>

                {/* 4 Memory Types Mini Badges */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl border" style={{ background: dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)", borderColor: cardBorder }}>
                    <div className="text-xs font-bold text-yellow-400 font-mono">short_term</div>
                    <div className="text-[11px] mt-0.5" style={{ color: textMuted }}>Session context • 1 hr TTL</div>
                  </div>
                  <div className="p-3 rounded-xl border" style={{ background: dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)", borderColor: cardBorder }}>
                    <div className="text-xs font-bold text-blue-400 font-mono">episodic</div>
                    <div className="text-[11px] mt-0.5" style={{ color: textMuted }}>Events & logs • 30 days TTL</div>
                  </div>
                  <div className="p-3 rounded-xl border" style={{ background: dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)", borderColor: cardBorder }}>
                    <div className="text-xs font-bold text-green-400 font-mono">long_term</div>
                    <div className="text-[11px] mt-0.5" style={{ color: textMuted }}>User profile • Permanent</div>
                  </div>
                  <div className="p-3 rounded-xl border" style={{ background: dark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)", borderColor: cardBorder }}>
                    <div className="text-xs font-bold text-purple-400 font-mono">semantic</div>
                    <div className="text-[11px] mt-0.5" style={{ color: textMuted }}>Domain wisdom • Permanent</div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link to="/product/memory" className="btn-primary text-sm px-6 py-3 rounded-xl">
                    Explore Agent Memory
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" className="ml-1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"/></svg>
                  </Link>
                  <a href={`${D}/docs`} className="text-sm font-semibold hover:underline" style={{ color: textMuted }}>
                    View REST API →
                  </a>
                </div>
              </div>

              {/* Right Column: Code Showcase with Live Syntax */}
              <div className="md:col-span-6 mt-6 md:mt-0">
                <div className="rounded-2xl border overflow-hidden" style={{ background: dark ? "#0a0e1a" : "#1a1b26", borderColor: dark ? "rgba(59,130,246,0.3)" : "rgba(0,0,0,0.15)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
                  <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
                    <div className="flex items-center gap-2">
                      <div className="tbt bg-[#ff5f57]" /><div className="tbt bg-[#febc2e]" /><div className="tbt bg-[#28c840]" />
                      <span className="ml-2 text-xs font-mono text-white/50">agent_memory.py</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">FastAPI & Python</span>
                  </div>

                  <div className="p-6 font-mono text-xs leading-relaxed text-slate-300 overflow-x-auto">
                    <pre className="m-0">
                      <code>
                        <span className="text-blue-400">from</span> iceberg <span className="text-blue-400">import</span> Client{'\n\n'}
                        client = Client(api_key=<span className="text-amber-300">&quot;ib_live_...&quot;</span>){'\n\n'}
                        <span className="text-slate-500"># 1. Store persistent memory for an agent</span>{'\n'}
                        client.remember({'\n'}
                        {'  '}agent_id=<span className="text-amber-300">&quot;coder_agent&quot;</span>,{'\n'}
                        {'  '}content=<span className="text-amber-300">&quot;User prefers dark mode and uses FastAPI + React&quot;</span>,{'\n'}
                        {'  '}memory_type=<span className="text-emerald-400">&quot;long_term&quot;</span>{'\n'}
                        ){'\n\n'}
                        <span className="text-slate-500"># 2. Recall relevant context in &lt;15ms</span>{'\n'}
                        memories = client.recall({'\n'}
                        {'  '}agent_id=<span className="text-amber-300">&quot;coder_agent&quot;</span>,{'\n'}
                        {'  '}query=<span className="text-amber-300">&quot;what framework does user use?&quot;</span>,{'\n'}
                        {'  '}top_k=<span className="text-purple-400">3</span>{'\n'}
                        ){'\n'}
                        <span className="text-blue-400">print</span>(memories){'\n'}
                        <span className="text-emerald-400"># → [&#123;&quot;content&quot;: &quot;...&quot;, &quot;score&quot;: 0.98&#125;]</span>
                      </code>
                    </pre>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>
      <div className={`divider${!dark ? " divider-light" : ""}`} />


      <section className="py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-[10px] uppercase tracking-widest mb-4" style={{ color: dark ? "rgba(255,255,255,0.18)" : "#9ca3af" }}>Architecture</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ color: textPrimary }}>Three steps.<br /><span className="text-gradient">Zero DevOps.</span></h2>
          </div>
          <div className="flex justify-center gap-2 mb-8 flex-wrap">
            {["01 Index", "02 Store", "03 Search"].map((t, i) => (
              <button key={t} onClick={() => setTab(i)} className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${tab === i ? "btn-primary" : ""}`} style={tab !== i ? { color: textMuted, border: `1px solid ${cardBorder}` } : {}}>{t}</button>
            ))}
          </div>
          <div className="terminal" style={{ background: dark ? "#0d1117" : "#1a1b26", border: `1px solid ${cardBorder}` }}>
            <div className="terminal-header">
              <div className="tbt bg-[#ff5f57]" /><div className="tbt bg-[#febc2e]" /><div className="tbt bg-[#28c840]" />
              <span className="ml-3 text-xs text-white/40 font-mono">{["index.py", "store.py", "search.py"][tab]}</span>
            </div>
            <div className="p-7 font-mono text-sm leading-8 min-h-[180px]">
              {tab === 0 && <><div><span className="s-cmt"># Upload PDF or stream text</span></div><div><span className="s-var">client</span><span className="s-pl">.</span><span className="s-fn">upload</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"handbook.pdf"</span><span className="s-pl">)</span></div></>}
              {tab === 1 && <><div><span className="s-cmt"># Hosted in India (ap-south-1). DPDP ready.</span></div><div className="mt-3"><span className="s-key">"status"</span><span className="s-pl">: </span><span className="s-str">"ready"</span></div><div><span className="s-key">"region"</span><span className="s-pl">: </span><span className="s-str">"India (ap-south-1)"</span></div></>}
              {tab === 2 && <><div><span className="s-cmt"># Hybrid: dense + BM25</span></div><div className="mt-3"><span className="s-var">results</span><span className="s-pl"> = client.</span><span className="s-fn">search</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, query, search_type=</span><span className="s-str">"hybrid"</span><span className="s-pl">)</span></div></>}
            </div>
          </div>
        </div>
      </section>
      <div className={`divider${!dark ? " divider-light" : ""}`} />

      <section id="pricing" className="py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[10px] uppercase tracking-widest mb-4" style={{ color: dark ? "rgba(255,255,255,0.18)" : "#9ca3af" }}>Pricing</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ color: textPrimary }}>Built for India.<br /><span className="text-gradient">Priced for India.</span></h2>
            <p className="text-sm" style={{ color: textMuted }}>Start free. No credit card. Upgrade when you scale.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
            {PLANS.map((p, i) => (
              <div key={i} className="relative rounded-2xl p-4 md:p-6 flex flex-col border transition-all duration-300" style={{ background: p.popular ? (dark ? "linear-gradient(160deg,rgba(37,99,235,0.07),rgba(124,58,237,0.04))" : "linear-gradient(160deg,rgba(37,99,235,0.06),rgba(124,58,237,0.03))") : cardBg, borderColor: p.popular ? "rgba(59,130,246,0.3)" : cardBorder, boxShadow: p.popular ? (dark ? "0 20px 60px rgba(37,99,235,0.12)" : "0 16px 48px rgba(37,99,235,0.1)") : "none" }}>
                {p.popular && <><div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" /><div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold px-3 py-0.5 rounded-full whitespace-nowrap" style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", boxShadow: "0 4px 16px rgba(37,99,235,0.4)" }}>MOST POPULAR</div></>}
                <div className="text-[10px] mb-3 uppercase tracking-[0.15em] font-semibold" style={{ color: dark ? "rgba(255,255,255,0.2)" : "#9ca3af" }}>{p.name}</div>
                <div className="flex items-end gap-1 mb-1"><span className="text-2xl md:text-4xl font-black" style={{ color: textPrimary }}>{p.price}</span><span className="text-sm pb-1.5" style={{ color: textMuted }}>{p.period}</span></div>
                {p.yearly ? <div className="text-xs mb-6" style={{ color: dark ? "rgba(255,255,255,0.2)" : "#9ca3af" }}>{p.yearly} - 2 months free</div> : <div className="mb-6" />}
                <ul className="space-y-3 flex-1 mb-6">
                  {p.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm" style={{ color: textMuted }}>
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                <a href={`${D}/signup${!dark ? "?theme=light" : ""}`} className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all text-center block ${p.popular ? "btn-primary" : ""}`} style={!p.popular ? { border: `1px solid ${cardBorder}`, color: textMuted } : {}}>{p.price === "Rs.0" ? "Start for free" : "Get started"}</a>
              </div>
            ))}
          </div>

          {/* Pay-as-you-grow overage banner */}
          <div className="mt-8 rounded-2xl p-5 border text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-4" style={{ background: "rgba(37,99,235,0.04)", borderColor: "rgba(59,130,246,0.2)" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "#fff" }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: textPrimary }}>Pay-As-You-Grow (Zero Downtime Overage)</div>
                <div className="text-xs" style={{ color: textMuted }}>Traffic spike? Your app never breaks. Extra vectors at just Rs.100 per 100K vectors &amp; Rs.50 per 50K queries.</div>
              </div>
            </div>
            <div className="text-xs font-semibold px-3 py-1.5 rounded-lg border shrink-0 text-blue-400" style={{ borderColor: "rgba(59,130,246,0.3)", background: "rgba(59,130,246,0.08)" }}>
              No hard limits
            </div>
          </div>


        </div>
      </section>
      <div className={`divider${!dark ? " divider-light" : ""}`} />

      <section id="signup" className="py-14 md:py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="relative rounded-3xl overflow-hidden p-7 sm:p-12 md:p-16" style={{ background: dark ? "radial-gradient(ellipse at 50% -20%,rgba(37,99,235,0.14) 0%,rgba(124,58,237,0.06) 50%,transparent 80%),rgba(255,255,255,0.018)" : "radial-gradient(ellipse at 50% -20%,rgba(37,99,235,0.08) 0%,rgba(124,58,237,0.04) 50%,transparent 80%),rgba(0,0,0,0.02)", border: `1px solid ${cardBorder}` }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-px bg-gradient-to-r from-transparent via-blue-500/45 to-transparent" />
            <p className="text-xs uppercase tracking-widest mb-4 font-semibold text-blue-400">Forever Free Tier</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight" style={{ color: textPrimary }}>Start building<br /><span className="text-gradient">in 30 seconds.</span></h2>
            <p className="mb-10 text-sm" style={{ color: textMuted }}>100,000 vectors free forever. Instant API key. No credit card required.</p>
            <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="flex-1 px-4 py-3 rounded-xl text-sm outline-none" style={{ background: dark ? "rgba(255,255,255,0.04)" : "white", border: `1px solid ${cardBorder}`, color: textPrimary }} />
              <button type="submit" className="btn-primary px-6 py-3 text-sm rounded-xl whitespace-nowrap">Get API Key →</button>
            </form>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${cardBorder}` }} className="py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm" style={{ color: textMuted }}>
          <div className="flex items-center gap-3">
            <IcebergLogo className="w-7 h-7" />
            <span className="font-semibold text-base" style={{ color: dark ? "rgba(255,255,255,0.7)" : "#374151" }}>Iceberg</span>
            <span style={{ color: dark ? "rgba(255,255,255,0.15)" : "#e5e7eb" }}>-</span>
            <span>Vector search for India</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link to="/privacy" className="hover:opacity-80 transition text-[#888] hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:opacity-80 transition text-[#888] hover:text-white">Terms</Link>
            <Link to="/benchmarks" className="hover:opacity-80 transition text-[#888] hover:text-white">Benchmarks</Link>
            <Link to="/docs" className="hover:opacity-80 transition text-[#888] hover:text-white">Docs</Link>
            <Link to="/status" className="hover:opacity-80 transition text-[#888] hover:text-white">Status</Link>
            <Link to="/contact" className="hover:opacity-80 transition text-[#888] hover:text-white">Contact</Link>
            <a
              href="https://www.linkedin.com/in/ankush-a-96518a39b/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:opacity-90 transition text-[#888] hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            <a
              href="https://x.com/igankush33"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:opacity-90 transition text-[#888] hover:text-white"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X
            </a>
          </div>
          <div style={{ color: dark ? "rgba(255,255,255,0.12)" : "#d1d5db" }}>2026 Iceberg</div>
        </div>
      </footer>

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

  const RAW_TEXT = {
    python: `# Install SDK: pip install icebergdb\nfrom iceberg import Client\n\nclient = Client(api_key="ib_your_key")\nclient.index_text("my_docs", "Iceberg DB is hosted in India (ap-south-1)")\nresults = client.search("my_docs", "where is Iceberg hosted?", search_type="hybrid")\nfor r in results: print(r.score, r.text)`,
    javascript: `// Install SDK: npm install icebergdb\nimport { Client } from "icebergdb"\n\nconst client = new Client({ apiKey: "ib_your_key" })\nawait client.indexText("my_docs", "Iceberg DB is hosted in India (ap-south-1)")\nconst res = await client.search("my_docs", "where is Iceberg hosted?")`,
    go: `// Install SDK: go get github.com/anku5265/iceberg-database/iceberg-sdk-go\nimport iceberg "github.com/anku5265/iceberg-database/iceberg-sdk-go"\n\nclient := iceberg.New("ib_your_key")\nres, _ := client.Search("my_docs", "return policy", 5)`,
    rust: `// Install SDK: cargo add icebergdb\nuse icebergdb::Client;\n\nlet client = Client::new("ib_your_key");\nlet res = client.search("my_docs", "return policy", 5).await.unwrap();`,
    java: `// Maven / Gradle: io.icebergdb:iceberg-sdk:1.0.0\nimport in.iceberg.Client;\n\nClient client = new Client("ib_your_key");\nList<SearchResult> res = client.search("my_docs", "return policy", 5);`,
    dotnet: `// NuGet: dotnet add package IcebergDb\nusing IcebergDb;\n\nvar client = new IcebergClient("ib_your_key");\nvar res = await client.SearchAsync("my_docs", "return policy", topK: 5);`,
    curl: `# Direct HTTP REST API — Hosted in India (ap-south-1)\ncurl -X POST https://api.icebergdb.in/search \\\n  -H "X-API-Key: ib_your_key" \\\n  -H "Content-Type: application/json" \\\n  -d '{ "collection": "my_docs", "query": "return?", "top_k": 5 }'`,
    claude: `# Connect Iceberg DB MCP Server directly inside Claude Code\nclaude mcp add icebergdb --env ICEBERG_API_KEY=ib_your_key -- npx -y iceberg-mcp\n\n# Then, inside Claude Code\n/iceberg:quickstart`,
    cursor: `// Add to .cursor/mcp.json in your project or global settings\n{\n  "mcpServers": {\n    "icebergdb": {\n      "command": "npx",\n      "args": ["-y", "iceberg-mcp"],\n      "env": { "ICEBERG_API_KEY": "ib_your_key" }\n    }\n  }\n}`,
    copilot: `// Add to .vscode/mcp.json for GitHub Copilot Agent Mode\n{\n  "servers": {\n    "icebergdb": {\n      "type": "stdio",\n      "command": "npx",\n      "args": ["-y", "iceberg-mcp"],\n      "env": { "ICEBERG_API_KEY": "ib_your_key" }\n    }\n  }\n}`,
    codex: `# Configure OpenAI Codex CLI with Iceberg DB MCP Server\nexport ICEBERG_API_KEY="ib_your_key"\n\n# Run Codex with full access to your Iceberg collections\ncodex --mcp "npx -y iceberg-mcp" "Create collection my_docs and index ./docs"`,
    gemini: `# Add Iceberg DB to Gemini CLI / Antigravity (~/.gemini/settings.json)\ngemini mcp add icebergdb --env ICEBERG_API_KEY=ib_your_key -- npx -y iceberg-mcp\n\n# Prompt Gemini Agent directly\ngemini "Search my_docs in Iceberg DB for refund policy"`,
    cli: `# Install Iceberg DB SDK & run MCP / CLI\npip install icebergdb\nexport ICEBERG_API_KEY="ib_your_key"\n\nnpx -y iceberg-mcp`,
    mcp: `// Universal Model Context Protocol (Claude Desktop, Windsurf, Cline)\n{\n  "mcpServers": {\n    "icebergdb": {\n      "command": "npx",\n      "args": ["-y", "iceberg-mcp"],\n      "env": {\n        "ICEBERG_API_KEY": "ib_your_key",\n        "ICEBERG_API_URL": "https://api.icebergdb.in"\n      }\n    }\n  }\n}`,
  }

  const HIGHLIGHTED_CODE = {
    python: [
      <><span className="s-cmt"># Install SDK: pip install icebergdb</span></>,
      <><span className="s-kw">from</span><span className="s-pl"> iceberg </span><span className="s-kw">import</span><span className="s-fn"> Client</span></>,
      <></>,
      <><span className="s-var">client</span><span className="s-pl"> = </span><span className="s-fn">Client</span><span className="s-pl">(</span><span className="s-key">api_key</span><span className="s-pl">=</span><span className="s-str">"ib_your_key"</span><span className="s-pl">)</span></>,
      <><span className="s-var">client</span><span className="s-pl">.</span><span className="s-fn">index_text</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"Iceberg DB is hosted in India (ap-south-1)"</span><span className="s-pl">)</span></>,
      <><span className="s-var">results</span><span className="s-pl"> = client.</span><span className="s-fn">search</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"where is Iceberg hosted?"</span><span className="s-pl">, </span><span className="s-key">search_type</span><span className="s-pl">=</span><span className="s-str">"hybrid"</span><span className="s-pl">)</span></>,
      <><span className="s-kw">for</span><span className="s-pl"> r </span><span className="s-kw">in</span><span className="s-pl"> results: </span><span className="s-fn">print</span><span className="s-pl">(r.</span><span className="s-key">score</span><span className="s-pl">, r.</span><span className="s-key">text</span><span className="s-pl">)</span></>,
    ],
    javascript: [
      <><span className="s-cmt">// Install SDK: npm install icebergdb</span></>,
      <><span className="s-kw">import</span><span className="s-pl"> {"{ "}</span><span className="s-fn">Client</span><span className="s-pl">{" }"} </span><span className="s-kw">from</span><span className="s-str"> "icebergdb"</span></>,
      <></>,
      <><span className="s-kw">const</span><span className="s-pl"> client = </span><span className="s-kw">new</span><span className="s-fn"> Client</span><span className="s-pl">{"({ "}</span><span className="s-key">apiKey</span><span className="s-pl">: </span><span className="s-str">"ib_your_key"</span><span className="s-pl">{" })"}</span></>,
      <><span className="s-kw">await</span><span className="s-pl"> client.</span><span className="s-fn">indexText</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"Iceberg DB is hosted in India (ap-south-1)"</span><span className="s-pl">)</span></>,
      <><span className="s-kw">const</span><span className="s-pl"> res = </span><span className="s-kw">await</span><span className="s-pl"> client.</span><span className="s-fn">search</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"where is Iceberg hosted?"</span><span className="s-pl">)</span></>,
    ],
    go: [
      <><span className="s-cmt">// Install SDK: go get github.com/anku5265/iceberg-database/iceberg-sdk-go</span></>,
      <><span className="s-kw">import</span><span className="s-pl"> iceberg </span><span className="s-str">"github.com/anku5265/iceberg-database/iceberg-sdk-go"</span></>,
      <></>,
      <><span className="s-var">client</span><span className="s-pl"> := iceberg.</span><span className="s-fn">New</span><span className="s-pl">(</span><span className="s-str">"ib_your_key"</span><span className="s-pl">)</span></>,
      <><span className="s-var">res</span><span className="s-pl">, _ := client.</span><span className="s-fn">Search</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"return policy"</span><span className="s-pl">, </span><span className="s-num">5</span><span className="s-pl">)</span></>,
    ],
    rust: [
      <><span className="s-cmt">// Install SDK: cargo add icebergdb</span></>,
      <><span className="s-kw">use</span><span className="s-pl"> icebergdb::</span><span className="s-fn">Client</span><span className="s-pl">;</span></>,
      <></>,
      <><span className="s-kw">let</span><span className="s-pl"> client = Client::</span><span className="s-fn">new</span><span className="s-pl">(</span><span className="s-str">"ib_your_key"</span><span className="s-pl">);</span></>,
      <><span className="s-kw">let</span><span className="s-pl"> res = client.</span><span className="s-fn">search</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"return policy"</span><span className="s-pl">, </span><span className="s-num">5</span><span className="s-pl">).</span><span className="s-kw">await</span><span className="s-pl">.</span><span className="s-fn">unwrap</span><span className="s-pl">();</span></>,
    ],
    java: [
      <><span className="s-cmt">// Maven / Gradle: io.icebergdb:iceberg-sdk:1.0.0</span></>,
      <><span className="s-kw">import</span><span className="s-pl"> in.iceberg.</span><span className="s-fn">Client</span><span className="s-pl">;</span></>,
      <></>,
      <><span className="s-fn">Client</span><span className="s-pl"> client = </span><span className="s-kw">new</span><span className="s-fn"> Client</span><span className="s-pl">(</span><span className="s-str">"ib_your_key"</span><span className="s-pl">);</span></>,
      <><span className="s-pl">List{"<"}</span><span className="s-fn">SearchResult</span><span className="s-pl">{">"} res = client.</span><span className="s-fn">search</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"return policy"</span><span className="s-pl">, </span><span className="s-num">5</span><span className="s-pl">);</span></>,
    ],
    dotnet: [
      <><span className="s-cmt">// NuGet: dotnet add package IcebergDb</span></>,
      <><span className="s-kw">using</span><span className="s-pl"> </span><span className="s-fn">IcebergDb</span><span className="s-pl">;</span></>,
      <></>,
      <><span className="s-kw">var</span><span className="s-pl"> client = </span><span className="s-kw">new</span><span className="s-fn"> IcebergClient</span><span className="s-pl">(</span><span className="s-str">"ib_your_key"</span><span className="s-pl">);</span></>,
      <><span className="s-kw">var</span><span className="s-pl"> res = </span><span className="s-kw">await</span><span className="s-pl"> client.</span><span className="s-fn">SearchAsync</span><span className="s-pl">(</span><span className="s-str">"my_docs"</span><span className="s-pl">, </span><span className="s-str">"return policy"</span><span className="s-pl">, </span><span className="s-key">topK</span><span className="s-pl">: </span><span className="s-num">5</span><span className="s-pl">);</span></>,
    ],
    curl: [
      <><span className="s-cmt"># Direct HTTP REST API — Hosted in India (ap-south-1)</span></>,
      <><span className="s-fn">curl</span><span className="s-pl"> -X POST </span><span className="s-str">https://api.icebergdb.in/search</span><span className="s-pl"> \</span></>,
      <><span className="s-pl">  -H </span><span className="s-str">"X-API-Key: ib_your_key"</span><span className="s-pl"> \</span></>,
      <><span className="s-pl">  -H </span><span className="s-str">"Content-Type: application/json"</span><span className="s-pl"> \</span></>,
      <><span className="s-pl">  -d </span><span className="s-str">{'\'{ "collection": "my_docs", "query": "return?", "top_k": 5 }\''}</span></>,
    ],
    claude: [
      <><span className="s-cmt"># Connect Iceberg DB MCP Server directly inside Claude Code</span></>,
      <><span className="s-fn">claude</span><span className="s-pl"> mcp add icebergdb </span><span className="s-key">--env</span><span className="s-pl"> </span><span className="s-str">ICEBERG_API_KEY=ib_your_key</span><span className="s-pl"> -- npx -y </span><span className="s-fn">iceberg-mcp</span></>,
      <></>,
      <><span className="s-cmt"># Then, inside Claude Code</span></>,
      <><span className="s-kw">/iceberg:quickstart</span></>,
    ],
    cursor: [
      <><span className="s-cmt">// Add to .cursor/mcp.json in your project or global Cursor settings</span></>,
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
      <><span className="s-cmt">// Add to .vscode/mcp.json for GitHub Copilot Agent Mode</span></>,
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
      <><span className="s-cmt"># Configure OpenAI Codex CLI with Iceberg DB MCP Server</span></>,
      <><span className="s-kw">export</span><span className="s-pl"> </span><span className="s-key">ICEBERG_API_KEY</span><span className="s-pl">=</span><span className="s-str">"ib_your_key"</span></>,
      <></>,
      <><span className="s-cmt"># Run Codex with full access to your Iceberg vector collections</span></>,
      <><span className="s-fn">codex</span><span className="s-pl"> </span><span className="s-key">--mcp</span><span className="s-pl"> </span><span className="s-str">"npx -y iceberg-mcp"</span><span className="s-pl"> </span><span className="s-str">"Create collection my_docs and index ./docs"</span></>,
    ],
    gemini: [
      <><span className="s-cmt"># Add Iceberg DB to Gemini CLI / Antigravity (~/.gemini/settings.json)</span></>,
      <><span className="s-fn">gemini</span><span className="s-pl"> mcp add icebergdb </span><span className="s-key">--env</span><span className="s-pl"> </span><span className="s-str">ICEBERG_API_KEY=ib_your_key</span><span className="s-pl"> -- npx -y </span><span className="s-fn">iceberg-mcp</span></>,
      <></>,
      <><span className="s-cmt"># Prompt Gemini Agent to search, upsert, or recall memory directly</span></>,
      <><span className="s-fn">gemini</span><span className="s-pl"> </span><span className="s-str">"Search my_docs in Iceberg DB for refund policy"</span></>,
    ],
    cli: [
      <><span className="s-cmt"># Install Iceberg DB CLI &amp; authenticate with your API key</span></>,
      <><span className="s-fn">pip</span><span className="s-pl"> install </span><span className="s-str">icebergdb</span></>,
      <><span className="s-kw">export</span><span className="s-pl"> </span><span className="s-key">ICEBERG_API_KEY</span><span className="s-pl">=</span><span className="s-str">"ib_your_key"</span></>,
      <></>,
      <><span className="s-fn">python</span><span className="s-pl"> -m iceberg.cli search </span><span className="s-key">--collection</span><span className="s-pl"> my_docs </span><span className="s-key">--query</span><span className="s-pl"> </span><span className="s-str">"refund policy"</span></>,
    ],
    mcp: [
      <><span className="s-cmt">// Universal Model Context Protocol (Claude Desktop, Windsurf, Cline)</span></>,
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
  const activeFile = (activeTabs.find(([k]) => k === activeKey) || [])[2] || "quickstart.py"

  const handleCopy = () => {
    navigator.clipboard.writeText(RAW_TEXT[activeKey] || RAW_TEXT.python)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  return (
    <div className="space-y-3">
      {/* ── TOP LEVEL: 2 Mode Selector Boxes — ALWAYS Side-by-Side (grid-cols-2) on Phone & Desktop, ZERO White Flash ── */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3.5">
        {/* Box 1: Coding Languages & SDKs (DEFAULT) */}
        <button
          type="button"
          onClick={() => setMode("languages")}
          className="text-left rounded-xl p-2.5 sm:p-4 transition-all cursor-pointer"
          style={{
            background:
              mode === "languages"
                ? dark
                  ? "linear-gradient(145deg, rgba(37,99,235,0.16), rgba(59,130,246,0.05))"
                  : "rgba(37,99,235,0.06)"
                : dark
                ? "rgba(255,255,255,0.025)"
                : "rgba(0,0,0,0.02)",
            border:
              mode === "languages"
                ? "1px solid rgba(59,130,246,0.45)"
                : `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)"}`,
            boxShadow: mode === "languages" && dark ? "0 8px 24px rgba(37,99,235,0.12)" : "none",
          }}
        >
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: mode === "languages" ? "#3b82f6" : dark ? "rgba(255,255,255,0.2)" : "#9ca3af",
                  boxShadow: mode === "languages" ? "0 0 8px rgba(59,130,246,0.8)" : "none",
                }}
              />
              <span
                className="text-[11px] sm:text-[13px] font-bold tracking-tight truncate"
                style={{
                  color: mode === "languages" ? (dark ? "#ffffff" : "#111827") : dark ? "rgba(255,255,255,0.55)" : "#6b7280",
                }}
              >
                1. Coding Languages
              </span>
            </div>
            <span
              className="hidden sm:inline-block text-[9px] font-mono font-semibold px-2 py-0.5 rounded uppercase shrink-0"
              style={{
                background: mode === "languages" ? "rgba(59,130,246,0.18)" : dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                color: mode === "languages" ? "#60a5fa" : dark ? "rgba(255,255,255,0.4)" : "#6b7280",
                border: mode === "languages" ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
              }}
            >
              {mode === "languages" ? "DEFAULT" : "6 SDKS"}
            </span>
          </div>
          <p
            className="text-[10px] sm:text-[11px] leading-snug line-clamp-2 sm:pl-3.5"
            style={{
              color: mode === "languages" ? (dark ? "rgba(255,255,255,0.68)" : "#4b5563") : dark ? "rgba(255,255,255,0.35)" : "#9ca3af",
            }}
          >
            Python, JS/TS, Go, Rust, Java, .NET &amp; REST API
          </p>
        </button>

        {/* Box 2: AI Coding Agents & Tools */}
        <button
          type="button"
          onClick={() => setMode("tools")}
          className="text-left rounded-xl p-2.5 sm:p-4 transition-all cursor-pointer"
          style={{
            background:
              mode === "tools"
                ? dark
                  ? "linear-gradient(145deg, rgba(37,99,235,0.16), rgba(59,130,246,0.05))"
                  : "rgba(37,99,235,0.06)"
                : dark
                ? "rgba(255,255,255,0.025)"
                : "rgba(0,0,0,0.02)",
            border:
              mode === "tools"
                ? "1px solid rgba(59,130,246,0.45)"
                : `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.09)"}`,
            boxShadow: mode === "tools" && dark ? "0 8px 24px rgba(37,99,235,0.12)" : "none",
          }}
        >
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  background: mode === "tools" ? "#3b82f6" : dark ? "rgba(255,255,255,0.2)" : "#9ca3af",
                  boxShadow: mode === "tools" ? "0 0 8px rgba(59,130,246,0.8)" : "none",
                }}
              />
              <span
                className="text-[11px] sm:text-[13px] font-bold tracking-tight truncate"
                style={{
                  color: mode === "tools" ? (dark ? "#ffffff" : "#111827") : dark ? "rgba(255,255,255,0.55)" : "#6b7280",
                }}
              >
                2. AI Coding Agents
              </span>
            </div>
            <span
              className="hidden sm:inline-block text-[9px] font-mono font-semibold px-2 py-0.5 rounded uppercase shrink-0"
              style={{
                background: mode === "tools" ? "rgba(59,130,246,0.18)" : dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                color: mode === "tools" ? "#60a5fa" : dark ? "rgba(255,255,255,0.4)" : "#6b7280",
                border: mode === "tools" ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
              }}
            >
              {mode === "tools" ? "ACTIVE" : "MCP / CLI"}
            </span>
          </div>
          <p
            className="text-[10px] sm:text-[11px] leading-snug line-clamp-2 sm:pl-3.5"
            style={{
              color: mode === "tools" ? (dark ? "rgba(255,255,255,0.68)" : "#4b5563") : dark ? "rgba(255,255,255,0.35)" : "#9ca3af",
            }}
          >
            Claude Code, Cursor, Copilot, Codex, Gemini &amp; MCP
          </p>
        </button>
      </div>

      {/* ── IDE TERMINAL WINDOW WITH SINGLE-LINE TAB BAR + SYNTAX-HIGHLIGHTED CODE ── */}
      <div
        className="terminal rounded-2xl overflow-hidden"
        style={{
          background: dark ? "#0d1117" : "#161822",
          border: `1px solid ${dark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.15)"}`,
          boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
        }}
      >
        {/* Terminal Header with Traffic Dots + Single-Line Tabs */}
        <div
          className="flex items-center justify-between gap-2 px-3.5 sm:px-4 py-2.5 border-b overflow-x-auto"
          style={{
            background: "rgba(255,255,255,0.025)",
            borderColor: "rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="tbt bg-[#ff5f57]" />
            <div className="tbt bg-[#febc2e]" />
            <div className="tbt bg-[#28c840]" />
            <div className="flex items-center gap-1 ml-2 sm:ml-3">
              {activeTabs.map(([k, label]) => {
                const isSelected = activeKey === k
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setActiveKey(k)}
                    className="px-2.5 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs font-mono transition whitespace-nowrap cursor-pointer"
                    style={{
                      background: isSelected ? "rgba(59,130,246,0.18)" : "transparent",
                      color: isSelected ? "#60a5fa" : "rgba(255,255,255,0.45)",
                      border: isSelected ? "1px solid rgba(59,130,246,0.35)" : "1px solid transparent",
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono text-white/30">
              {activeFile}
            </span>
          </div>
        </div>

        {/* Syntax-Highlighted IDE Code Body with Line Numbers + Compact Side Copy Button */}
        <div className="relative p-4 sm:p-6 pr-16 sm:pr-20 font-mono text-xs sm:text-[13px] overflow-x-auto leading-7 min-h-[190px]">
          <button
            type="button"
            onClick={handleCopy}
            className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-10 inline-flex items-center gap-1 px-2 py-1 leading-none rounded-md text-[10px] font-mono font-medium transition cursor-pointer"
            style={{
              background: copiedCode ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
              color: copiedCode ? "#4ade80" : "rgba(255,255,255,0.65)",
              border: copiedCode ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {copiedCode ? (
              <>
                <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Copied</span>
              </>
            ) : (
              <>
                <svg className="w-2.5 h-2.5 shrink-0 opacity-75" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>

          {codeLines.map((lineNode, idx) => (
            <div key={idx} className="flex items-start gap-4 whitespace-pre">
              <span
                className="select-none w-4 text-right text-[11px]"
                style={{ color: "rgba(255,255,255,0.2)" }}
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
