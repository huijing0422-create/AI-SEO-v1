
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type, Chat } from "@google/genai";
import ReactQuill from 'react-quill';

// --- SVG Icons ---
const IconRefresh = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l3.181-3.183A8.25 8.25 0 006.023 9.348v-.001z" /></svg>;
const IconCopy = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>;
const IconSparkles = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.423-1.423L13.125 18l1.188-.648a2.25 2.25 0 011.423-1.423L16.25 15l.648 1.188a2.25 2.25 0 011.423 1.423L19.375 18l-1.188.648a2.25 2.25 0 01-1.423 1.423z" /></svg>;
const IconSun = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.95-4.243l-1.59-1.591M3 12h2.25m.386-6.364L3.99 4.03M12 12a2.25 2.25 0 00-2.25 2.25 2.25 2.25 0 002.25 2.25 2.25 2.25 0 002.25-2.25A2.25 2.25 0 0012 12z" /></svg>;
const IconMoon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const IconHistory = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconChevronDown = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;
const IconBrain = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 00-1.622-3.385m-5.043.025a15.998 15.998 0 01-3.388-1.621m7.704 6.374a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 00-3.388-1.62m5.043.025a15.998 15.998 0 01-1.622-3.385m-5.043.025a15.998 15.998 0 00-1.622-3.385m-3.388 1.62a15.998 15.998 0 001.622 3.385m5.043-.025a15.998 15.998 0 013.388 1.622m7.704-6.374a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128z" /></svg>;
const IconFeather = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>;
const IconUsers = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.57-1.03-.19-2.26-.9-2.583a1.5 1.5 0 01-.464-2.122m6.286 4.805a9.09 0 01-2.16 1.666l-3.42 1.666a1.5 1.5 0 00-.464 2.122m-7.5-2.962a3 3 0 014.682-2.72 8.986 8.986 0 013.741.479m-9.375 9.375a3 3 0 014.682-2.72 9.09 9.09 0 012.16 1.666m7.5-2.962c-.57 1.03.19 2.26.9 2.583a1.5 1.5 0 00.464 2.122m-6.286-4.805a9.09 9.09 0 002.16 1.666l3.42 1.666a1.5 1.5 0 01.464 2.122m-7.5-2.962a3 3 0 00-4.682 2.72 9.094 9.094 0 00-3.741-.479m9.375 9.375a3 3 0 00-4.682 2.72 9.09 9.09 0 00-2.16-1.666m-7.5 2.962c.57-1.03-.19-2.26-.9-2.583a1.5 1.5 0 01-.464-2.122m6.286 4.805a9.09 9.09 0 012.16-1.666l-3.42-1.666a1.5 1.5 0 00-.464-2.122m7.5 2.962a3 3 0 01-4.682 2.72 8.986 8.986 0 01-3.741-.479m9.375-9.375a3 3 0 01-4.682 2.72 9.09 9.09 0 01-2.16-1.666M3.375 19.5a3 3 0 014.682-2.72 9.09 9.09 0 012.16 1.666m-7.5-2.962c-.57 1.03.19 2.26.9 2.583a1.5 1.5 0 00.464 2.122m6.286-4.805a9.09 9.09 0 00-2.16-1.666l3.42 1.666a1.5 1.5 0 01.464 2.122" /></svg>;
const IconAdjustments = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>;
const IconKey = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>;
const IconChartBar = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
const IconBriefcase = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>;
const IconShieldCheck = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286zm0 13.036h.008v.008h-.008v-.008z" /></svg>;
const IconHashtag = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5l-3.9 19.5m-2.1-19.5l-3.9 19.5" /></svg>;
const IconSend = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>;
const IconClose = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const IconBlueBird = () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.67.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.76 2.8 1.92 3.57-.7-.02-1.36-.21-1.93-.53v.05c0 2.08 1.48 3.82 3.44 4.21-.36.1-.74.15-1.13.15-.28 0-.55-.03-.81-.08.55 1.7 2.14 2.94 4.03 2.97-1.47 1.15-3.33 1.83-5.35 1.83-.35 0-.69-.02-1.03-.06 1.9 1.22 4.16 1.93 6.56 1.93 7.88 0 12.2-6.54 12.2-12.2 0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.22z"></path></svg>;

type TDK = { title: string; description: string; keywords: string; };

type ArticleSuggestions = {
    eeat: string[];
    readability: string[];
    engagement: string[];
    toneAndStyle: string[];
    keywords: string[];
    headings: string[];
};

type ArticleMetrics = {
    vagueWordPercentage: number;
    professionalism: number;
    credibility: number;
    eeatScore: number;
};

type ArticleAnalysis = {
    tdk: TDK;
    suggestions: ArticleSuggestions;
    metrics: ArticleMetrics;
}

type ChatMessage = {
    role: 'user' | 'model';
    content: string;
};

// --- App State Type ---
interface AppState {
    brandDesc: string;
    brandUrl: string;
    fileContent: string;
    brandAnalysisResult: string; // Raw HTML from Gemini
    siteTopic: string;
    siteTdkResult: TDK[] | null;
    articleContent: string;
    articleKeywords: string;
    articleTone: string;
    articleAnalysisResult: ArticleAnalysis | null;
    urlInput: string;
    urlSuggestions: Record<string, string[]> | null;
}

const termDefinitions = {
    'TDK': '指網站的標題 (Title)、描述 (Description) 和關鍵字 (Keywords)，是影響搜尋結果點擊率的關鍵 SEO 元素。',
    'E-E-A-T': 'Google 的內容品質評估標準，代表經驗 (Experience)、專業 (Expertise)、權威 (Authoritativeness) 和信賴 (Trustworthiness)。',
};

const Tooltip = ({ term, explanation }: { term: string, explanation: string }) => (
    <span className="tooltip-container">
      {term}
      <span className="tooltip-text">{explanation}</span>
    </span>
);

type ActiveTab = 'brand' | 'article' | 'url';

const App: React.FC = () => {
    // --- UI State ---
    const [theme, setTheme] = useState('light');
    const [activeTab, setActiveTab] = useState<ActiveTab>('brand');

    // --- State for Section 1: Brand Analysis ---
    const [brandDesc, setBrandDesc] = useState<string>('');
    const [brandUrl, setBrandUrl] = useState<string>('');
    const [brandFile, setBrandFile] = useState<File | null>(null);
    const [fileContent, setFileContent] = useState<string>('');
    const [brandAnalysisResult, setBrandAnalysisResult] = useState<string>('');
    const [isBrandLoading, setIsBrandLoading] = useState<boolean>(false);
    const [brandError, setBrandError] = useState<string>('');

    // --- State for Section 2: Site TDK ---
    const [siteTopic, setSiteTopic] = useState<string>('');
    const [siteTdkResult, setSiteTdkResult] = useState<TDK[] | null>(null);
    const [isSiteTdkLoading, setIsSiteTdkLoading] = useState<boolean>(false);
    const [siteTdkError, setSiteTdkError] = useState<string>('');

    // --- State for Section 3: Article Analysis ---
    const [articleContent, setArticleContent] = useState<string>('');
    const [articleKeywords, setArticleKeywords] = useState<string>('');
    const [articleKeywordsManuallySet, setArticleKeywordsManuallySet] = useState<boolean>(false);
    const [articleTone, setArticleTone] = useState<string>('');
    const [articleAnalysisResult, setArticleAnalysisResult] = useState<ArticleAnalysis | null>(null);
    const [isArticleLoading, setIsArticleLoading] = useState<boolean>(false);
    const [articleError, setArticleError] = useState<string>('');
    const [improvedArticleContent, setImprovedArticleContent] = useState<string | null>(null);
    const [isImprovingArticle, setIsImprovingArticle] = useState<boolean>(false);
    const [improveArticleError, setImproveArticleError] = useState<string>('');

    // --- State for Section 4: URL Slug Generation ---
    const [urlInput, setUrlInput] = useState<string>('');
    const [urlSuggestions, setUrlSuggestions] = useState<Record<string, string[]> | null>(null);
    const [isUrlLoading, setIsUrlLoading] = useState<boolean>(false);
    const [urlError, setUrlError] = useState<string>('');
    
    // --- State for Chatbot ---
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState<string>('');
    const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);

    // --- Global State ---
    const [isAllLoading, setIsAllLoading] = useState<boolean>(false);
    const [copyStatus, setCopyStatus] = useState<Record<string, string>>({});
    const [history, setHistory] = useState<{ timestamp: number; state: AppState }[]>([]);
    const [visibleSections, setVisibleSections] = useState(() => {
        try {
            const saved = localStorage.getItem('visibleSections');
            return saved ? JSON.parse(saved) : { brand: true, tdk: true, article: true };
        } catch (error) {
            console.error("Could not parse visible sections from localStorage", error);
            return { brand: true, tdk: true, article: true };
        }
    });

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline'],
            [{'list': 'ordered'}, {'list': 'bullet'}],
            ['clean']
        ],
    };

    // --- Theme Switcher Logic ---
    useEffect(() => {
        document.body.dataset.theme = theme;
    }, [theme]);
    
    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };
    
    // --- Section Visibility Logic ---
    useEffect(() => {
        localStorage.setItem('visibleSections', JSON.stringify(visibleSections));
    }, [visibleSections]);

    const toggleSectionVisibility = (section: keyof typeof visibleSections) => {
        setVisibleSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    // --- Auto-populate article keywords from brand analysis ---
    useEffect(() => {
        if (siteTdkResult && siteTdkResult.length > 0 && !articleKeywordsManuallySet) {
            setArticleKeywords(siteTdkResult[0].keywords);
        }
    }, [siteTdkResult, articleKeywordsManuallySet]);
    
    // --- History & State Management ---
    const addHistorySnapshot = useCallback(() => {
        const currentState: AppState = {
            brandDesc, brandUrl, fileContent, brandAnalysisResult,
            siteTopic, siteTdkResult,
            articleContent, articleKeywords, articleTone, articleAnalysisResult,
            urlInput, urlSuggestions
        };
        setHistory(prev => [{ timestamp: Date.now(), state: currentState }, ...prev].slice(0, 20));
    }, [brandDesc, brandUrl, fileContent, brandAnalysisResult, siteTopic, siteTdkResult, articleContent, articleKeywords, articleTone, articleAnalysisResult, urlInput, urlSuggestions]);

    const handleRestoreFromHistory = (stateToRestore: AppState) => {
        setBrandDesc(stateToRestore.brandDesc);
        setBrandUrl(stateToRestore.brandUrl);
        setFileContent(stateToRestore.fileContent);
        setBrandFile(null); // Reset file object as it's not part of the state
        setBrandAnalysisResult(stateToRestore.brandAnalysisResult);
        setSiteTopic(stateToRestore.siteTopic);
        setSiteTdkResult(stateToRestore.siteTdkResult);
        setArticleContent(stateToRestore.articleContent);
        setArticleKeywords(stateToRestore.articleKeywords || '');
        setArticleTone(stateToRestore.articleTone || '');
        setArticleAnalysisResult(stateToRestore.articleAnalysisResult);
        setUrlInput(stateToRestore.urlInput || '');
        setUrlSuggestions(stateToRestore.urlSuggestions || null);
    };

    const handleDownload = () => {
        const currentState: AppState = {
            brandDesc, brandUrl, fileContent, brandAnalysisResult,
            siteTopic, siteTdkResult,
            articleContent, articleKeywords, articleTone, articleAnalysisResult,
            urlInput, urlSuggestions
        };
        const blob = new Blob([JSON.stringify(currentState, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-seo-analysis-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setBrandFile(file);
            setFileContent('');
            setBrandError('');

            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const loadedState = JSON.parse(event.target?.result as string);
                        handleRestoreFromHistory(loadedState);
                    } catch (err) {
                        console.error("Error parsing session file:", err);
                        setBrandError("無法讀取分析檔案，檔案格式不正確。");
                    }
                };
                reader.readAsText(file);
            } else {
                const textBasedTypes = ['text/plain', 'text/markdown'];
                if (textBasedTypes.includes(file.type) || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
                    const reader = new FileReader();
                    reader.onload = (event) => setFileContent(event.target?.result as string);
                    reader.readAsText(file);
                } else {
                    setFileContent(`[用戶上傳了檔案：${file.name}]`);
                }
            }
            e.target.value = ''; // Allow re-uploading the same file
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopyStatus({ [id]: '已複製！' });
            setTimeout(() => setCopyStatus({ [id]: '' }), 2000);
        }, () => {
            setCopyStatus({ [id]: '複製失敗' });
            setTimeout(() => setCopyStatus({ [id]: '' }), 2000);
        });
    };
    
    // This is defined outside useCallback to be accessible by handleBrandAnalysis
    const handleSiteTdkGeneration = useCallback(async (forceRegenerate = false, brandContext: string | null = null) => {
        if (!siteTopic && !brandContext) return;

        setIsSiteTdkLoading(true);
        setSiteTdkError('');
        if (forceRegenerate || brandContext) setSiteTdkResult(null);

        try {
            const baseInstruction = brandContext 
                ? `根據以下品牌分析報告，為該品牌生成網站首頁的 SEO TDK。`
                : `請為一個核心主題為「${siteTopic}」的網站，撰寫 SEO TDK (Title, Description, Keywords)。`;

            const contextInfo = brandContext
                ? `\n\n品牌分析報告：\n\`\`\`\n${brandContext}\n\`\`\``
                : '';
            
            const prompt = `你是一位精通點擊率 (CTR) 優化與使用者心理學的 SEO 文案專家。
${baseInstruction}

**核心心法:** 站在使用者的角度思考，文案需精準打中使用者的搜尋意圖與潛在痛點。標題要能在搜尋結果中脫穎而出，描述則要建立信任感並驅使行動。

**寫作指令:**
1.  **提供三組風格略有不同的 TDK 提案**，以供用戶選擇。例如：一組專業穩重、一組活潑有創意、一組強調優惠或獨特賣點。
2.  **Title (標題):** 必須在 60 字元以內。
3.  **Description (描述):** 必須在 150 字元以内，並包含一個明確、有說服力的行動呼籲 (Call-to-Action)。
4.  **Keywords (關鍵字):** 提供 5-7 個最相關的關鍵字。
${contextInfo}
請以包含一個 TDK 物件陣列的 JSON 格式輸出。`;
            
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                 responseMimeType: "application/json",
                 responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          keywords: { type: Type.STRING },
                        },
                        required: ['title', 'description', 'keywords']
                    }
                  },
              }
            });
            const resultJson = JSON.parse(response.text);
            setSiteTdkResult(resultJson);
            addHistorySnapshot();
        } catch (error) {
            console.error("Site TDK generation error:", error);
            setSiteTdkError("生成 TDK 時發生錯誤，請稍後再試。");
        } finally {
            setIsSiteTdkLoading(false);
        }
    }, [siteTopic, addHistorySnapshot, ai.models]);

    const handleBrandAnalysis = useCallback(async (forceRegenerate = false) => {
        if (!brandDesc && !brandUrl && !brandFile) return;

        setIsBrandLoading(true);
        setBrandError('');
        if (forceRegenerate) {
            setBrandAnalysisResult('');
            setSiteTdkResult(null);
        }
        
        try {
            let additionalContext = brandUrl ? `\n\n品牌網站：${brandUrl}` : '';
            if (fileContent) additionalContext += `\n\n用戶提供的補充資料：\n\`\`\`\n${fileContent}\n\`\`\``;
            
            const prompt = `你是一位頂尖的品牌策略師與 SEO 專家，擅長從零開始為品牌定位並發掘市場切入點。根據以下用戶提供的品牌資訊，請進行全面分析，並以清晰、條理分明的 **HTML** 格式提供以下洞察 (請直接輸出 h3, h4, p, ul, li 等 HTML 標籤，不需包含 <html> 或 <body>)。

**格式化要求:**
當內容中提到以下任一術語時，請用 \`<span class="tooltip-container">\` 標籤將其包覆，並在內部加上帶有解釋的 \`<span class="tooltip-text">\` 標籤。
範例： "這就是品牌的 <span class="tooltip-container">UVP<span class="tooltip-text">獨特價值主張 (Unique Value Proposition)，指品牌能提供給顧客、且競爭對手沒有的獨特好處。</span></span>。"

需加上提示的術語列表與解釋：
- UVP: 獨特價值主張 (Unique Value Proposition)，指品牌能提供給顧客、且競爭對手沒有的獨特好處。
- 搜尋意圖: 使用者在搜尋引擎輸入關鍵字時背後的真正目的，通常分為資訊型、商業型、交易型等。
- 長尾關鍵字: 由三個或更多詞語組成的、更具體的搜尋詞組，通常搜尋量較低但轉換率更高。
- 人物誌 (Persona): 根據真實使用者數據所建立的虛構角色，用以代表特定的目標客群。
- 關鍵字: 在搜尋引擎中用來查找資訊的詞彙。

### 1. 品牌核心定位與關鍵字策略
*   **核心品牌價值主張 (UVP):** 一句話總結品牌的核心競爭力與獨特賣點。
*   **主要關鍵字 (5個):** 提供高搜尋量且最相關的關鍵字，並附上每個關鍵字的搜尋意圖 (資訊型、商業型、交易型)。
*   **長尾關鍵字 (5個):** 針對特定用戶需求，提供更具體、轉換率可能更高的關鍵字詞組。

### 2. 目標客群 (TA) 深度剖析
*   **人物誌 (Persona):** 描繪一個典型的使用者輪廓 (包含年齡、職業、興趣、價值觀)。
*   **用戶痛點與需求:** 他們在尋找此類產品/服務時，最想解決什麼問題？最關心什麼？
*   **線上行為:** 他們常在哪裡獲取資訊 (例如：特定社群媒體、論壇、部落格)？他們信任哪些意見領袖 (KOL) 或媒體類型？

### 3. 市場競爭格局與機會點
*   **主要競爭對手 (2-3個):** 列出主要的線上競爭對手。
*   **競爭對手策略分析:** 針對每個對手，簡要分析其：
    *   **產品/服務重點:** 他們主打什麼？
    *   **行銷策略:** 他們如何吸引客戶 (例如：內容行銷、社群廣告、SEO)？
    *   **相對優勢:** 你的品牌相較於他們，有什麼潛在的切入點或優勢？
*   **市場機會與挑戰:** 綜合以上分析，指出品牌最大的市場機會點，以及可能面臨的主要挑戰。

---
**用戶提供的品牌資訊 (HTML 格式):**
主要品牌描述：\`\`\`html
${brandDesc || '用戶未提供主要描述'}
\`\`\`${additionalContext}
---`;

            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            const brandResultText = response.text;
            setBrandAnalysisResult(brandResultText);
            addHistorySnapshot();
            
            // Auto-trigger TDK generation
            if (brandResultText) {
                // Use a text-only version for the context to avoid passing HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = brandResultText;
                await handleSiteTdkGeneration(false, tempDiv.textContent || tempDiv.innerText || "");
            }

        } catch (error) {
            console.error("Brand analysis error:", error);
            setBrandError("生成分析時發生錯誤，請稍後再試。");
        } finally {
            setIsBrandLoading(false);
        }
    }, [brandDesc, brandUrl, fileContent, brandFile, addHistorySnapshot, ai.models, handleSiteTdkGeneration]);

    const handleArticleAnalysis = useCallback(async (forceRegenerate = false) => {
        if (!articleContent) return;
    
        setIsArticleLoading(true);
        setArticleError('');
        if (forceRegenerate) {
            setArticleAnalysisResult(null);
            setImprovedArticleContent(null);
            setImproveArticleError('');
        }
    
        let rawResponseText = ''; 
        try {
            const toneInstruction = articleTone
                ? `分析目前語氣，並建議如何調整以更貼近用戶選擇的 **『${articleTone}』** 語氣。`
                : `分析目前語氣是否符合目標讀者，並提供調整建議。`;

            const keywordContext = articleKeywords ? `\n\n使用者提供的參考關鍵字：\`\`\`\n${articleKeywords}\n\`\`\`` : '';
            const keywordInstruction = articleKeywords
                ? `2-3 條關於關鍵字策略的建議。請分析使用者提供的關鍵字與文章的關聯性，並建議新增、刪除或修改的關鍵字，並簡要說明原因。`
                : `2-3 條關於關鍵字策略的建議。請根據文章內容，建議 3-5 個最核心的 SEO 關鍵字，並簡要說明原因。`;
    
            const prompt = `你是一位世界級的內容 SEO 專家，對 Google E-E-A-T 原則和使用者閱讀體驗有深刻理解。請對以下文章進行全面診斷，並提供一個包含以下結構的 JSON 物件：
    
1.  \`tdk\`: 一組為這篇文章量身打造、能最大化點擊率的 SEO TDK (Title, Description, Keywords)。
2.  \`suggestions\`: 一個包含**簡潔、可立即執行**的優化建議物件。每條建議應為一句話，直接點出問題與修改方向。建議需分類如下：
    *   \`eeat\`: 2-3 條關於如何強化文章 E-E-A-T 的建議。例如："在文末加入作者簡介與相關經驗證明" 或 "引用至少一個權威機構的數據來支持論點"。
    *   \`readability\`: 2-3 條關於提升文章可讀性的建議。例如："將超過30字的長句拆分為短句" 或 "增加小標題將長段落分開"。
    *   \`engagement\`: 2-3 條關於增加讀者互動的建議。例如："在文末提出一個開放式問題引導讀者留言" 或 "加入一個表格來總結關鍵數據"。
    *   \`toneAndStyle\`: 1-2 條關於調整文章語氣與風格的建議 (${toneInstruction})。
    *   \`keywords\`: ${keywordInstruction}
    *   \`headings\`: 1 條建議。根據文章內容，提供一個建議的 H 標籤 (H1-H4) 結構，以提升文章的 SEO 與可讀性。請以陣列形式提供，例如：["H1: 主標題", "H2: 章節一", "H3: 小節 A"]。
3.  \`metrics\`: 一個包含以下**量化指標**的物件。所有值都必須是 0 到 100 之間的**數字**：
    *   \`vagueWordPercentage\`: 偵測文章中使用「很、非常、一些、許多、可能」等模糊、不精確詞彙的百分比。百分比越高代表文章越空泛。
    *   \`professionalism\`: 根據用詞、結構與論述深度，評估文章的專業度分數。分數越高代表越專業。
    *   \`credibility\`: 根據是否有數據支持、引用來源、權威性證據，評估文章對於目標關鍵字客群的可信度分數。分數越高代表越可信。
    *   \`eeatScore\`: 根據文章的經驗、專業、權威與信賴度，評估文章的 E-E-A-T 分數。分數越高代表越符合 Google 的品質標準。
    
文章內容 (HTML 格式)：\`\`\`html
${articleContent}
\`\`\`${keywordContext}`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash', contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            tdk: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    title: { type: Type.STRING }, 
                                    description: { type: Type.STRING }, 
                                    keywords: { type: Type.STRING }
                                },
                                required: ['title', 'description', 'keywords']
                            },
                            suggestions: { 
                                type: Type.OBJECT,
                                properties: {
                                    eeat: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    readability: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    engagement: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    toneAndStyle: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    headings: { type: Type.ARRAY, items: { type: Type.STRING } },
                                },
                                required: ['eeat', 'readability', 'engagement', 'toneAndStyle', 'keywords', 'headings']
                            },
                            metrics: {
                                type: Type.OBJECT,
                                properties: {
                                    vagueWordPercentage: { type: Type.NUMBER },
                                    professionalism: { type: Type.NUMBER },
                                    credibility: { type: Type.NUMBER },
                                    eeatScore: { type: Type.NUMBER },
                                },
                                required: ['vagueWordPercentage', 'professionalism', 'credibility', 'eeatScore']
                            }
                        },
                        required: ['tdk', 'suggestions', 'metrics']
                    }
                }
            });
            
            rawResponseText = response.text;
    
            // Sanitize the response: remove potential markdown fences and extract the core JSON object.
            let jsonString = rawResponseText.trim();
            if (jsonString.startsWith("```json")) {
                jsonString = jsonString.slice(7, -3).trim();
            } else if (jsonString.startsWith("```")) {
                jsonString = jsonString.slice(3, -3).trim();
            }
    
            const firstBrace = jsonString.indexOf('{');
            const lastBrace = jsonString.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace > firstBrace) {
                jsonString = jsonString.substring(firstBrace, lastBrace + 1);
            }
    
            const resultJson = JSON.parse(jsonString);
            setArticleAnalysisResult(resultJson);
            addHistorySnapshot();
        } catch (error: any) {
            console.error("Article analysis error:", error);
            if (rawResponseText) {
                console.error("Raw response text that failed to parse:", rawResponseText);
            }
            
            let userErrorMessage = "分析文章時發生未知錯誤，請稍後再試。";
            if (error instanceof SyntaxError) {
                 userErrorMessage = "AI 回應的格式不正確，無法解析。這可能是因為文章內容過長或包含特殊字元。請嘗試縮短文章後再試一次。";
            } else if (error.message) {
                userErrorMessage = `分析文章時發生錯誤：${error.message}`;
            }
            setArticleError(userErrorMessage);
        } finally {
            setIsArticleLoading(false);
        }
    }, [articleContent, articleTone, articleKeywords, addHistorySnapshot, ai.models]);

    const handleImproveArticleStructure = useCallback(async () => {
        if (!articleContent || !articleAnalysisResult) return;
    
        setIsImprovingArticle(true);
        setImproveArticleError('');
        setImprovedArticleContent(null);
    
        try {
            const suggestionsText = `
- 可讀性建議: ${articleAnalysisResult.suggestions.readability.join(', ')}
- H 標籤結構建議: ${articleAnalysisResult.suggestions.headings.join(' -> ')}
            `;
    
            const prompt = `你是一位專業的內容編輯與 SEO 專家。你的任務是根據一套優化建議，重寫一篇文章以改善其結構和可讀性。

**任務指示:**
1.  **分析原始文章和下方提供的 SEO 建議。**
2.  **重寫文章，並整合以下結構性優化：**
    *   **目錄 (TOC):** 如果文章長度與複雜度適合，請在文章開頭加入一個簡單的 HTML 目錄，並使用錨點連結 (#id) 指向對應的 H2 標題。請確保 H2 標題有對應的 id 屬性。
    *   **副標題:** 嚴格遵循建議的 H 標籤結構。在必要時，使用更多的 H3 或 H4 副標題來拆分長段落，以提高掃描性。
    *   **段落:** 將過長的段落（超過 4-5 行）拆解成更短、更易於閱讀的段落。
    *   **格式化:** 善用列表 (<ul>, <ol>) 和粗體 (<strong>) 來強調重點，讓內容更容易消化。
3.  **重要原則:**
    *   **保留原始語意:** 必須完整保留文章的原始意義、語氣和核心資訊。你的重點是結構和格式，不是內容的實質性修改。
    *   **僅輸出 HTML:** 請直接輸出完整的、重寫後的文章 HTML 內容。不要包含 \`<html>\`, \`<body>\` 標籤或 \`\`\`html\`\`\` 符號。

---
**原始文章內容 (HTML):**
\`\`\`html
${articleContent}
\`\`\`

---
**SEO 優化建議:**
\`\`\`
${suggestionsText}
\`\`\`
`;
    
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
    
            setImprovedArticleContent(response.text);
    
        } catch (error)  {
            console.error("Error improving article structure:", error);
            setImproveArticleError("套用結構建議時發生錯誤，請稍後再試。");
        } finally {
            setIsImprovingArticle(false);
        }
    
    }, [articleContent, articleAnalysisResult, ai.models]);

    const handleUrlSuggestion = useCallback(async (forceRegenerate = false) => {
        const topics = urlInput.split(/,|，/).map(t => t.trim()).filter(Boolean);
        if (topics.length === 0) return;
    
        setIsUrlLoading(true);
        setUrlError('');
        if (forceRegenerate) setUrlSuggestions(null);
    
        try {
            const prompt = `你是一位專精於 SEO 的網站架構師，深諳如何建立簡潔、有意義且對搜尋引擎友善的 URL 結構。使用者提供了一個或多個文章標題或分類名稱。請為清單中的 **每一個項目** 生成 3 個 SEO 友善的 URL slugs。

            **URL Slug 生成核心原則：**
            1.  **SEO 優先**: 所有建議都必須基於 SEO 最佳實踐，選擇具有搜尋潛力且能準確描述頁面內容的英文單詞。
            2.  **簡潔至上**: URL 越短越好。如果一個單詞就能清晰表達主題，請優先使用該單詞。
            3.  **語意清晰**: Slug 必須讓人一眼就能看懂頁面大概內容。

            **URL Slug 生成規則：**
            1.  **全英文小寫**：即使輸入是中文，也請翻譯成有意義的英文單詞。
            2.  **優先使用單詞**: 如果主題可以被一個簡潔、有力的單詞概括（例如「產品介紹」可使用 \`product\` 或 \`item\`），請將其作為第一優先建議。
            3.  **適時使用連字號 (-)**：當需要多個單詞來描述主題時，才用連字號分隔單詞（例如 \`brand-growth-strategy\`）。
            4.  **提供多樣性**: 提供的 3 個建議中，應包含單詞和多詞詞組的組合，以供用戶選擇。
            5.  **去除特殊符號**：移除 &、%、# 等非字母數字字元。
            6.  **不要包含檔案副檔名**：例如 .html 或 .php。
            7.  **直接輸出 slug 本身**，不要加上斜線 (/)。

            **輸出格式要求：**
            *   必須是一個 JSON 陣列。
            *   陣列中的每一個元素都必須是一個物件。
            *   每個物件都必須包含兩個鍵：
                1. \`topic\`: 字串類型，值為使用者提供的原始標題/分類名稱。
                2. \`slugs\`: 陣列類型，值為包含 3 個 slug 字串的陣列。

            **使用者輸入的標題/分類清單：**
            ${JSON.stringify(topics)}

            **輸出範例：**
            [
                {
                    "topic": "產品介紹",
                    "slugs": ["products", "items", "product-introduction"]
                },
                {
                    "topic": "品牌成長策略",
                    "slugs": ["brand-growth", "brand-strategy", "brand-growth-tactics"]
                }
            ]`;
    
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                topic: {
                                    type: Type.STRING,
                                    description: "使用者提供的原始標題/分類名稱。"
                                },
                                slugs: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                    description: "為該主題生成的三個 URL slug 建議。"
                                }
                            },
                            required: ['topic', 'slugs']
                        }
                    },
                },
            });
            const resultJson = JSON.parse(response.text);

            if (Array.isArray(resultJson)) {
                const suggestionsObject = resultJson.reduce((acc, item) => {
                    if (item.topic && Array.isArray(item.slugs)) {
                        acc[item.topic] = item.slugs;
                    }
                    return acc;
                }, {} as Record<string, string[]>);
                setUrlSuggestions(suggestionsObject);
            } else {
                 console.error("Unexpected response format for URL suggestions:", resultJson);
                 setUrlError("AI 回傳格式不符，請稍後再試。");
                 setUrlSuggestions(null);
            }

            addHistorySnapshot();
        } catch (error: any) {
            console.error("URL suggestion error:", error);
            const errorMessage = error.message || "生成網址建議時發生錯誤，請稍後再試。";
            setUrlError(errorMessage);
        } finally {
            setIsUrlLoading(false);
        }
    }, [urlInput, addHistorySnapshot, ai.models]);

    // --- Chatbot Logic ---
    useEffect(() => {
        chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || isChatLoading) return;

        const userMessage = chatInput;
        setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            let currentChat = chat;
            // Initialize chat on first message
            if (!currentChat) {
                currentChat = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: 'You are a friendly and helpful SEO assistant mascot, shaped like a little blue bird. Your goal is to help users improve their website and article SEO. Keep your responses concise, friendly, and actionable.'
                    }
                });
                setChat(currentChat);
            }
            
            const response = await currentChat.sendMessage({ message: userMessage });
            const modelResponse = response.text;

            setChatMessages(prev => [...prev, { role: 'model', content: modelResponse }]);
        } catch (error) {
            console.error("Chat error:", error);
            setChatMessages(prev => [...prev, { role: 'model', content: "抱歉，我好像遇到了一點問題，請稍後再試一次。" }]);
        } finally {
            setIsChatLoading(false);
        }
    };


    const handleRegenerateAll = async () => {
        setIsAllLoading(true);
        if (brandDesc || brandUrl || brandFile) await handleBrandAnalysis(true);
        if (siteTopic) await handleSiteTdkGeneration(true);
        if (articleContent) await handleArticleAnalysis(true);
        if (urlInput) await handleUrlSuggestion(true);
        setIsAllLoading(false);
    };
    
    return (
        <div className="container">
            <button onClick={toggleTheme} className="theme-toggle" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                {theme === 'dark' ? <IconSun /> : <IconMoon />}
            </button>
            <header>
                <h1>AI SEO 策略顧問</h1>
                <p>您的專屬數位行銷專家，提升品牌能見度與網站排名</p>
                <div className="global-actions">
                    <button onClick={handleDownload} disabled={isAllLoading || isBrandLoading || isSiteTdkLoading || isArticleLoading || isUrlLoading}><IconDownload />下載分析</button>
                    <div className="history-dropdown-container">
                         <button disabled={history.length === 0}><IconHistory />歷史紀錄</button>
                         {history.length > 0 && (
                             <ul className="history-dropdown">
                                 {history.map((item) => (
                                     <li key={item.timestamp} onClick={() => handleRestoreFromHistory(item.state)}>
                                         {new Date(item.timestamp).toLocaleTimeString('zh-TW')}
                                     </li>
                                 ))}
                             </ul>
                         )}
                    </div>
                    <button onClick={handleRegenerateAll} disabled={isAllLoading || (isBrandLoading || isSiteTdkLoading || isArticleLoading || isUrlLoading)}>
                        {isAllLoading ? <><div className="spinner"></div> 正在全面生成...</> : <><IconSparkles/>全部重新生成</>}
                    </button>
                </div>
            </header>

            <nav className="navbar">
                <button 
                    className={`nav-item ${activeTab === 'brand' ? 'active' : ''}`}
                    onClick={() => setActiveTab('brand')}
                    aria-current={activeTab === 'brand'}
                >
                    品牌分析
                </button>
                <button 
                    className={`nav-item ${activeTab === 'article' ? 'active' : ''}`}
                    onClick={() => setActiveTab('article')}
                    aria-current={activeTab === 'article'}
                >
                    文章優化
                </button>
                <button 
                    className={`nav-item ${activeTab === 'url' ? 'active' : ''}`}
                    onClick={() => setActiveTab('url')}
                    aria-current={activeTab === 'url'}
                >
                    網址生成
                </button>
            </nav>

            <main>
                {activeTab === 'brand' && (
                    <>
                        <section className="feature-section">
                            <h2>1. 品牌探索與市場分析</h2>
                            <div className="input-group">
                                <label htmlFor="brand-desc">輸入您的品牌、產品或服務描述 (必要時填寫)：</label>
                                <ReactQuill
                                    theme="snow"
                                    value={brandDesc}
                                    onChange={setBrandDesc}
                                    modules={quillModules}
                                    placeholder="例如：我們是一個專為健身愛好者設計的線上課程平台..."
                                />
                            </div>
                            <div className="input-group">
                                <label htmlFor="brand-url">貼上品牌網站 URL (選填)：</label>
                                <input type="url" id="brand-url" value={brandUrl} onChange={(e) => setBrandUrl(e.target.value)} placeholder="https://example.com" />
                            </div>
                            <div className="input-group">
                                <label>上傳補充文件或載入分析檔案 (選填)：</label>
                                 <div className="button-container justify-start">
                                     <button onClick={() => handleBrandAnalysis(false)} disabled={isBrandLoading || (!brandDesc && !brandUrl && !brandFile)}>
                                        {isBrandLoading ? <><div className="spinner"></div> 分析中...</> : '分析並生成關鍵字'}
                                    </button>
                                    <div className="file-upload-container">
                                        <label htmlFor="brand-file" className="file-upload-label">選擇檔案</label>
                                        <input id="brand-file" type="file" onChange={handleFileChange} accept=".json,.md,.txt" />
                                    </div>
                                    {brandFile && <span className="file-name">{brandFile.name}</span>}
                                    {brandAnalysisResult && <>
                                        <button className="secondary" onClick={() => handleBrandAnalysis(true)} disabled={isBrandLoading}><IconRefresh />重新生成</button>
                                        <button className="secondary" onClick={() => {
                                            const tempDiv = document.createElement('div');
                                            tempDiv.innerHTML = brandAnalysisResult;
                                            copyToClipboard(tempDiv.textContent || tempDiv.innerText || '', 'brand');
                                        }}><IconCopy />{copyStatus['brand'] || '複製結果'}</button>
                                    </>}
                                </div>
                            </div>

                            {brandError && <div className="error-message">{brandError}</div>}
                            {brandAnalysisResult && (
                                <div className={`result-card ${!visibleSections.brand ? 'collapsed' : ''}`}>
                                     <div
                                        className="result-card-header"
                                        role="button"
                                        tabIndex={0}
                                        aria-expanded={visibleSections.brand}
                                        aria-controls="brand-result-content-wrapper"
                                        onClick={() => toggleSectionVisibility('brand')}
                                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleSectionVisibility('brand')}
                                    >
                                        <h3>品牌分析結果</h3>
                                        <span className="collapse-toggle-icon"><IconChevronDown /></span>
                                    </div>
                                    <div id="brand-result-content-wrapper" className="result-content-wrapper">
                                         <div className="result-card-content" dangerouslySetInnerHTML={{ __html: brandAnalysisResult }}></div>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="feature-section">
                            <h2>2. 全站 SEO TDK 生成</h2>
                            <div className="input-group">
                                <label htmlFor="site-topic">輸入您的品牌名稱或網站主題（若未進行品牌分析，請填寫此欄）：</label>
                                <input type="text" id="site-topic" value={siteTopic} onChange={(e) => setSiteTopic(e.target.value)} placeholder="例如：FitFlow 線上健身課程" />
                            </div>
                             <div className="button-container">
                                <button onClick={() => handleSiteTdkGeneration(false)} disabled={isSiteTdkLoading || !siteTopic}>
                                    {isSiteTdkLoading ? <><div className="spinner"></div> 生成中...</> : '生成網站 TDK'}
                                </button>
                                 {siteTdkResult && <button className="secondary" onClick={() => handleSiteTdkGeneration(true)} disabled={isSiteTdkLoading}><IconRefresh />重新生成</button>}
                            </div>
                            {siteTdkError && <div className="error-message">{siteTdkError}</div>}
                            {siteTdkResult && siteTdkResult.length > 0 && (
                                 <div className={`result-card ${!visibleSections.tdk ? 'collapsed' : ''}`}>
                                     <div
                                        className="result-card-header"
                                        role="button"
                                        tabIndex={0}
                                        aria-expanded={visibleSections.tdk}
                                        aria-controls="tdk-result-content-wrapper"
                                        onClick={() => toggleSectionVisibility('tdk')}
                                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleSectionVisibility('tdk')}
                                    >
                                        <h3>建議 <Tooltip term="TDK" explanation={termDefinitions.TDK} /></h3>
                                        <span className="collapse-toggle-icon"><IconChevronDown /></span>
                                    </div>
                                    <div id="tdk-result-content-wrapper" className="result-content-wrapper">
                                        <div className="result-card-content">
                                            {siteTdkResult.map((tdk, index) => (
                                                <div key={index} className="tdk-option-card">
                                                    <div className="tdk-option-header">
                                                        <h4>提案 {index + 1}</h4>
                                                        <button className="secondary" onClick={(e) => { e.stopPropagation(); copyToClipboard(`Title: ${tdk.title}\nDescription: ${tdk.description}\nKeywords: ${tdk.keywords}`, `tdk-${index}`)}}><IconCopy />{copyStatus[`tdk-${index}`] || '複製'}</button>
                                                    </div>
                                                    <div className="tdk-item"><strong>標題 (Title):</strong><p>{tdk.title}</p></div>
                                                    <div className="tdk-item"><strong>描述 (Description):</strong><p>{tdk.description}</p></div>
                                                    <div className="tdk-item"><strong>關鍵字 (Keywords):</strong><p>{tdk.keywords}</p></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </section>
                    </>
                )}

                {activeTab === 'article' && (
                    <section className="feature-section">
                        <h2>3. 文章 SEO 優化分析</h2>
                        <div className="input-group">
                            <label htmlFor="article-content">貼上您的文章內文：</label>
                            <ReactQuill
                                theme="snow"
                                value={articleContent}
                                onChange={setArticleContent}
                                modules={quillModules}
                                placeholder="在此貼上您希望分析與優化的文章全文..."
                            />
                        </div>
                         <div className="input-group">
                            <label htmlFor="article-keywords">文章關鍵字 (選填，若留空 AI 會自動建議)</label>
                            <input
                                type="text"
                                id="article-keywords"
                                value={articleKeywords}
                                onChange={(e) => {
                                    setArticleKeywords(e.target.value);
                                    setArticleKeywordsManuallySet(true);
                                }}
                                placeholder="請輸入核心關鍵字，用逗號分隔"
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="article-tone">選擇目標語氣 (選填)：</label>
                            <select id="article-tone" value={articleTone} onChange={(e) => setArticleTone(e.target.value)}>
                                <option value="">-- 自動分析 --</option>
                                <option value="專業">專業</option>
                                <option value="親切">親切</option>
                                <option value="幽默">幽默</option>
                                <option value="嚴謹">嚴謹</option>
                                <option value="激勵人心">激勵人心</option>
                                <option value="中立客觀">中立客觀</option>
                            </select>
                        </div>
                        <div className="button-container">
                            <button onClick={() => handleArticleAnalysis(false)} disabled={isArticleLoading || !articleContent}>
                                {isArticleLoading ? <><div className="spinner"></div> 分析中...</> : '分析文章並提供建議'}
                            </button>
                            {articleAnalysisResult && <>
                                <button className="secondary" onClick={() => handleArticleAnalysis(true)} disabled={isArticleLoading}><IconRefresh />重新生成</button>
                                <button className="secondary" onClick={() => {
                                     const { tdk, suggestions, metrics } = articleAnalysisResult;
                                     const eeatText = `E-E-A-T 強化建議:\n- ${suggestions.eeat.join('\n- ')}`;
                                     const readText = `可讀性與結構優化:\n- ${suggestions.readability.join('\n- ')}`;
                                     const engageText = `讀者參與度提升:\n- ${suggestions.engagement.join('\n- ')}`;
                                     const toneText = suggestions.toneAndStyle ? `語氣與風格調整:\n- ${suggestions.toneAndStyle.join('\n- ')}` : '';
                                     const keywordsText = suggestions.keywords ? `關鍵字策略:\n- ${suggestions.keywords.join('\n- ')}` : '';
                                     const headingsText = suggestions.headings ? `H 標籤結構建議:\n- ${suggestions.headings.join('\n- ')}` : '';
                                     const metricsText = `量化指標:\n- E-E-A-T 分數: ${metrics.eeatScore}/100\n- 空泛詞彙比例: ${metrics.vagueWordPercentage}%\n- 專業度: ${metrics.professionalism}/100\n- 可信度: ${metrics.credibility}/100`;
                                     const suggestionsText = [eeatText, readText, engageText, toneText, keywordsText, headingsText].filter(Boolean).join('\n\n');
                                     copyToClipboard(`TDK\nTitle: ${tdk.title}\nDescription: ${tdk.description}\nKeywords: ${tdk.keywords}\n\n${metricsText}\n\n優化建議:\n${suggestionsText}`, 'article');
                                }}><IconCopy />{copyStatus['article'] || '複製結果'}</button>
                            </>}
                        </div>
                         {articleError && <div className="error-message">{articleError}</div>}
                         {articleAnalysisResult && (
                            <div className={`result-card ${!visibleSections.article ? 'collapsed' : ''}`}>
                                 <div
                                    className="result-card-header"
                                    role="button"
                                    tabIndex={0}
                                    aria-expanded={visibleSections.article}
                                    aria-controls="article-result-content-wrapper"
                                    onClick={() => toggleSectionVisibility('article')}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleSectionVisibility('article')}
                                >
                                    <h3>文章優化建議</h3>
                                    <span className="collapse-toggle-icon"><IconChevronDown /></span>
                                </div>
                                <div id="article-result-content-wrapper" className="result-content-wrapper">
                                    <div className="result-card-content">
                                        <h4>建議 <Tooltip term="TDK" explanation={termDefinitions.TDK} /></h4>
                                        <div className="tdk-item"><strong>標題 (Title):</strong><p>{articleAnalysisResult.tdk.title}</p></div>
                                        <div className="tdk-item"><strong>描述 (Description):</strong><p>{articleAnalysisResult.tdk.description}</p></div>
                                        <div className="tdk-item"><strong>關鍵字 (Keywords):</strong><p>{articleAnalysisResult.tdk.keywords}</p></div>

                                        {articleAnalysisResult.metrics && (
                                            <>
                                                <h4 style={{marginTop: '2rem'}}>文章量化指標</h4>
                                                <div className="metrics-grid">
                                                    <div className="metric-card">
                                                        <div className="metric-header"><span className="icon"><IconChartBar /></span> 空泛詞彙比例</div>
                                                        <div className="metric-value">{articleAnalysisResult.metrics.vagueWordPercentage}<span>%</span></div>
                                                    </div>
                                                    <div className="metric-card">
                                                        <div className="metric-header"><span className="icon"><IconBriefcase /></span> 專業度</div>
                                                        <div className="metric-value">{articleAnalysisResult.metrics.professionalism}<span>/ 100</span></div>
                                                    </div>
                                                    <div className="metric-card">
                                                        <div className="metric-header"><span className="icon"><IconShieldCheck /></span> 可信度</div>
                                                        <div className="metric-value">{articleAnalysisResult.metrics.credibility}<span>/ 100</span></div>
                                                    </div>
                                                    <div className="metric-card">
                                                        <div className="metric-header"><span className="icon"><IconBrain /></span> E-E-A-T 分數</div>
                                                        <div className="metric-value">{articleAnalysisResult.metrics.eeatScore}<span>/ 100</span></div>
                                                    </div>
                                                </div>
                                            </>
                                        )}


                                        <h4 style={{marginTop: '2rem'}}>文章修改建議</h4>
                                        <div className="suggestion-grid">
                                            {articleAnalysisResult.suggestions.eeat?.length > 0 && (
                                                <div className="suggestion-category-card">
                                                    <div className="suggestion-category-header">
                                                        <span className="suggestion-icon"><IconBrain /></span>
                                                        <h5 className="suggestion-title"><Tooltip term="E-E-A-T" explanation={termDefinitions['E-E-A-T']} /> 強化</h5>
                                                    </div>
                                                    <ul>{articleAnalysisResult.suggestions.eeat.map((s, i) => (<li key={`eeat-${i}`}>{s}</li>))}</ul>
                                                </div>
                                            )}
                                            {articleAnalysisResult.suggestions.readability?.length > 0 && (
                                                <div className="suggestion-category-card">
                                                    <div className="suggestion-category-header">
                                                        <span className="suggestion-icon"><IconFeather /></span>
                                                        <h5 className="suggestion-title">可讀性優化</h5>
                                                    </div>
                                                    <ul>{articleAnalysisResult.suggestions.readability.map((s, i) => (<li key={`read-${i}`}>{s}</li>))}</ul>
                                                </div>
                                            )}
                                            {articleAnalysisResult.suggestions.engagement?.length > 0 && (
                                                <div className="suggestion-category-card">
                                                    <div className="suggestion-category-header">
                                                        <span className="suggestion-icon"><IconUsers /></span>
                                                        <h5 className="suggestion-title">互動參與提升</h5>
                                                    </div>
                                                    <ul>{articleAnalysisResult.suggestions.engagement.map((s, i) => (<li key={`eng-${i}`}>{s}</li>))}</ul>
                                                </div>
                                            )}
                                            {articleAnalysisResult.suggestions.toneAndStyle?.length > 0 && (
                                                <div className="suggestion-category-card">
                                                    <div className="suggestion-category-header">
                                                        <span className="suggestion-icon"><IconAdjustments /></span>
                                                        <h5 className="suggestion-title">語氣風格調整</h5>
                                                    </div>
                                                    <ul>{articleAnalysisResult.suggestions.toneAndStyle.map((s, i) => (<li key={`tone-${i}`}>{s}</li>))}</ul>
                                                </div>
                                            )}
                                            {articleAnalysisResult.suggestions.keywords?.length > 0 && (
                                                <div className="suggestion-category-card">
                                                    <div className="suggestion-category-header">
                                                        <span className="suggestion-icon"><IconKey /></span>
                                                        <h5 className="suggestion-title">關鍵字策略</h5>
                                                    </div>
                                                    <ul>{articleAnalysisResult.suggestions.keywords.map((s, i) => (<li key={`kwd-${i}`}>{s}</li>))}</ul>
                                                </div>
                                            )}
                                            {articleAnalysisResult.suggestions.headings?.length > 0 && (
                                                <div className="suggestion-category-card">
                                                    <div className="suggestion-category-header">
                                                        <span className="suggestion-icon"><IconHashtag /></span>
                                                        <h5 className="suggestion-title">H 標籤結構建議</h5>
                                                    </div>
                                                    <ul>{articleAnalysisResult.suggestions.headings.map((s, i) => (<li key={`heading-${i}`}>{s}</li>))}</ul>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="button-container" style={{ marginTop: '2rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1.5rem', justifyContent: 'center' }}>
                                            <button onClick={handleImproveArticleStructure} disabled={isImprovingArticle}>
                                                {isImprovingArticle ? <><div className="spinner"></div> 正在套用建議...</> : <><IconSparkles />一鍵套用結構建議</>}
                                            </button>
                                        </div>

                                        {improveArticleError && <div className="error-message">{improveArticleError}</div>}

                                        {improvedArticleContent && (
                                            <div className="result-card" style={{ marginTop: '1.5rem' }}>
                                                <div className="result-card-header">
                                                    <h3>結構優化後內容</h3>
                                                    <button className="secondary" onClick={() => {
                                                        const tempDiv = document.createElement('div');
                                                        tempDiv.innerHTML = improvedArticleContent;
                                                        copyToClipboard(tempDiv.textContent || tempDiv.innerText || '', 'improvedArticle');
                                                    }}><IconCopy />{copyStatus['improvedArticle'] || '複製文字'}</button>
                                                </div>
                                                <div className="result-card-content">
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={improvedArticleContent}
                                                        readOnly={true}
                                                        modules={{ toolbar: false }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                         )}
                    </section>
                )}

                {activeTab === 'url' && (
                    <section className="feature-section">
                        <h2>4. 網址 (URL Slug) 建議生成</h2>
                        <div className="input-group">
                            <label htmlFor="url-input">輸入文章標題或分類名稱（多筆請用逗號 , 分隔）：</label>
                            <input 
                                type="text" 
                                id="url-input" 
                                value={urlInput} 
                                onChange={(e) => setUrlInput(e.target.value)} 
                                placeholder="例如：產業趨勢, 品牌成長策略, 媒體新知" 
                            />
                        </div>
                        <div className="button-container">
                            <button onClick={() => handleUrlSuggestion(false)} disabled={isUrlLoading || !urlInput}>
                                {isUrlLoading ? <><div className="spinner"></div> 生成中...</> : '生成網址建議'}
                            </button>
                            {urlSuggestions && <button className="secondary" onClick={() => handleUrlSuggestion(true)} disabled={isUrlLoading}><IconRefresh />重新生成</button>}
                        </div>
                        {urlError && <div className="error-message">{urlError}</div>}
                        {urlSuggestions && Object.keys(urlSuggestions).length > 0 && (
                            <div className="result-card">
                                 <div className="result-card-header">
                                     <h3>建議網址 (URL Slugs)</h3>
                                 </div>
                                 <div className="result-card-content">
                                    <div className="url-suggestion-groups">
                                        {Object.entries(urlSuggestions).map(([topic, slugs]) => (
                                            <div key={topic} className="url-suggestion-group">
                                                <h4>{topic}</h4>
                                                <ul className="suggestion-list">
                                                    {Array.isArray(slugs) && slugs.map((slug, index) => (
                                                        <li key={index}>
                                                            <span>/{slug}</span>
                                                            <button className="secondary" onClick={() => copyToClipboard(`/${slug}`, `slug-${topic}-${index}`)}>
                                                                <IconCopy />{copyStatus[`slug-${topic}-${index}`] || '複製'}
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                 </div>
                            </div>
                        )}
                    </section>
                )}
            </main>
            
            <div className="chatbot-container">
                <div className={`chat-window ${isChatOpen ? 'open' : ''}`}>
                    <div className="chat-header">
                        <h3>SEO 小助理</h3>
                        <button className="chat-close-btn" onClick={() => setIsChatOpen(false)} aria-label="Close chat">
                            <IconClose />
                        </button>
                    </div>
                    <div className="chat-messages-container">
                        {chatMessages.map((msg, index) => (
                            <div key={index} className={`message-bubble ${msg.role}`}>
                                {msg.content}
                            </div>
                        ))}
                        {isChatLoading && (
                            <div className="message-bubble model">
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                         <div ref={chatMessagesEndRef} />
                    </div>
                    <form className="chat-form" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="有什麼可以幫您的嗎？"
                            aria-label="Chat message"
                            disabled={isChatLoading}
                        />
                        <button type="submit" aria-label="Send message" disabled={isChatLoading || !chatInput.trim()}>
                            <IconSend />
                        </button>
                    </form>
                </div>
                <button className="chatbot-fab" onClick={() => setIsChatOpen(!isChatOpen)} aria-label="Open chat assistant">
                   {isChatOpen ? <IconClose /> : <IconBlueBird />}
                </button>
            </div>
        </div>
    );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
