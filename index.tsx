import React, { useState, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- SVG Icons ---
const IconRefresh = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-11.664 0l3.181-3.183A8.25 8.25 0 006.023 9.348v-.001z" /></svg>;
const IconCopy = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>;
const IconSparkles = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.25 21.75l-.648-1.188a2.25 2.25 0 01-1.423-1.423L13.125 18l1.188-.648a2.25 2.25 0 011.423-1.423L16.25 15l.648 1.188a2.25 2.25 0 011.423 1.423L19.375 18l-1.188.648a2.25 2.25 0 01-1.423 1.423z" /></svg>;
const IconSun = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.95-4.243l-1.59-1.591M3 12h2.25m.386-6.364L3.99 4.03M12 12a2.25 2.25 0 00-2.25 2.25 2.25 2.25 0 002.25 2.25 2.25 2.25 0 002.25-2.25A2.25 2.25 0 0012 12z" /></svg>;
const IconMoon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>;
const IconDownload = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const IconHistory = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconChevronDown = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;

type TDK = { title: string; description: string; keywords: string; };

// --- App State Type ---
interface AppState {
    brandDesc: string;
    brandUrl: string;
    fileContent: string;
    brandAnalysisResult: string; // Raw HTML from Gemini
    siteTopic: string;
    siteTdkResult: TDK[] | null;
    articleContent: string;
    articleTone: string;
    articleAnalysisResult: { tdk: any; suggestions: { eeat: string[], readability: string[], engagement: string[], toneAndStyle: string[] }; } | null;
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
    const [theme, setTheme] = useState('dark');
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
    const [articleTone, setArticleTone] = useState<string>('');
    const [articleAnalysisResult, setArticleAnalysisResult] = useState<{ tdk: any; suggestions: { eeat: string[], readability: string[], engagement: string[], toneAndStyle: string[] }; } | null>(null);
    const [isArticleLoading, setIsArticleLoading] = useState<boolean>(false);
    const [articleError, setArticleError] = useState<string>('');

    // --- State for Section 4: URL Slug Generation ---
    const [urlInput, setUrlInput] = useState<string>('');
    const [urlSuggestions, setUrlSuggestions] = useState<Record<string, string[]> | null>(null);
    const [isUrlLoading, setIsUrlLoading] = useState<boolean>(false);
    const [urlError, setUrlError] = useState<string>('');
    
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
    
    // --- History & State Management ---
    const addHistorySnapshot = useCallback(() => {
        const currentState: AppState = {
            brandDesc, brandUrl, fileContent, brandAnalysisResult,
            siteTopic, siteTdkResult,
            articleContent, articleTone, articleAnalysisResult,
            urlInput, urlSuggestions
        };
        setHistory(prev => [{ timestamp: Date.now(), state: currentState }, ...prev].slice(0, 20));
    }, [brandDesc, brandUrl, fileContent, brandAnalysisResult, siteTopic, siteTdkResult, articleContent, articleTone, articleAnalysisResult, urlInput, urlSuggestions]);

    const handleRestoreFromHistory = (stateToRestore: AppState) => {
        setBrandDesc(stateToRestore.brandDesc);
        setBrandUrl(stateToRestore.brandUrl);
        setFileContent(stateToRestore.fileContent);
        setBrandFile(null); // Reset file object as it's not part of the state
        setBrandAnalysisResult(stateToRestore.brandAnalysisResult);
        setSiteTopic(stateToRestore.siteTopic);
        setSiteTdkResult(stateToRestore.siteTdkResult);
        setArticleContent(stateToRestore.articleContent);
        setArticleTone(stateToRestore.articleTone || '');
        setArticleAnalysisResult(stateToRestore.articleAnalysisResult);
        setUrlInput(stateToRestore.urlInput || '');
        setUrlSuggestions(stateToRestore.urlSuggestions || null);
    };

    const handleDownload = () => {
        const currentState: AppState = {
            brandDesc, brandUrl, fileContent, brandAnalysisResult,
            siteTopic, siteTdkResult,
            articleContent, articleTone, articleAnalysisResult,
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
3.  **Description (描述):** 必須在 150 字元以內，並包含一個明確、有說服力的行動呼籲 (Call-to-Action)。
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
**用戶提供的品牌資訊:**
主要品牌描述：\`\`\`
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
        if (forceRegenerate) setArticleAnalysisResult(null);
        try {
            const toneInstruction = articleTone
                ? `分析目前語氣，並建議如何調整以更貼近用戶選擇的 **『${articleTone}』** 語氣，從而增強說服力或親和力。`
                : `分析目前語氣是否符合目標讀者，建議如何調整以增強說服力或親和力。`;

            const prompt = `你是一位世界級的內容 SEO 專家，對 Google E-E-A-T (經驗、專業、權威、信賴) 原則和使用者閱讀體驗有深刻理解。請對以下文章進行全面診斷，並提供一個包含以下結構的 JSON 物件：

1.  \`tdk\`: 一組為這篇文章量身打造、能最大化點擊率的 SEO TDK (Title, Description, Keywords)。
2.  \`suggestions\`: 一個包含具體、可立即執行的優化建議物件，建議需分類如下：
    *   \`eeat\`: 2-3 條關於如何強化文章 E-E-A-T 的建議。每條建議都必須具體、可執行，並簡要說明其對 SEO 的正面影響。
        *   **作者資訊:** 如果建議加入作者簡介，請具體說明可以包含哪些元素來提升權威性（例如：相關學歷、專業認證、行業經驗年資、過往成功案例的連結）。
        *   **經驗展示:** 如果建議展示第一手經驗，請提供一個簡短的範例，說明如何將抽象的經驗化為具體的文字（例如：將「我很有經驗」改寫為「在過去五年、協助超過 50 家新創公司導入 SEO 的經驗中，我發現...」）。
        *   **案例研究:** 如果建議使用案例研究，請說明一個好的案例研究應包含哪些關鍵部分（例如：問題背景、執行策略、數據結果、結論）。
        *   **引用來源:** 如果建議引用外部來源，請強調引用來自政府機構、學術單位或頂尖行業報告的重要性。
    *   \`readability\`: 2-3 條關於提升文章可讀性與結構的建議 (例如：將長句改為短句、增加小標題來引導閱讀、使用項目符號或表格整理資訊)。
    *   \`engagement\`: 2-3 條關於增加讀者互動與停留時間的建議 (例如：在文末提出一個引人深思的問題、加入內部連結到相關高價值文章、建議嵌入說明影片或互動圖表)。
    *   \`toneAndStyle\`: 1-2 條關於調整文章語氣與風格的建議 (${toneInstruction})。

文章內容：\`\`\`
${articleContent}
\`\`\``;
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
                                }
                            },
                            suggestions: { 
                                type: Type.OBJECT,
                                properties: {
                                    eeat: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    readability: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    engagement: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    toneAndStyle: { type: Type.ARRAY, items: { type: Type.STRING } }
                                }
                            }
                        }
                    }
                }
            });
            const resultJson = JSON.parse(response.text);
            setArticleAnalysisResult(resultJson);
            addHistorySnapshot();
        } catch (error) {
            console.error("Article analysis error:", error);
            setArticleError("分析文章時發生錯誤，請稍後再試。");
        } finally {
            setIsArticleLoading(false);
        }
    }, [articleContent, articleTone, addHistorySnapshot, ai.models]);

    const handleUrlSuggestion = useCallback(async (forceRegenerate = false) => {
        const topics = urlInput.split(/,|，/).map(t => t.trim()).filter(Boolean);
        if (topics.length === 0) return;
    
        setIsUrlLoading(true);
        setUrlError('');
        if (forceRegenerate) setUrlSuggestions(null);
    
        try {
            const prompt = `你是一位專精於 SEO 的網站架構師。使用者提供了一個或多個文章標題或分類名稱。請為清單中的 **每一個項目** 生成 3 個簡潔、語意清晰且對 SEO 友善的 URL slugs。

            **URL Slug 生成規則：**
            1.  **全英文小寫**：即使輸入是中文，也請翻譯成有意義的英文單詞。
            2.  **使用連字號 (-)**：用連字號分隔單詞。
            3.  **簡潔明瞭**：盡可能縮短，但要保持其描述性。
            4.  **去除特殊符號**：移除 &、%、# 等非字母數字字元。
            5.  **不要包含檔案副檔名**：例如 .html 或 .php。
            6.  **直接輸出 slug 本身**，不要加上斜線 (/)。

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
                    "topic": "產業趨勢",
                    "slugs": ["industry-trends", "market-tendency", "sector-developments"]
                },
                {
                    "topic": "品牌成長策略",
                    "slugs": ["brand-growth-strategy", "growing-your-brand", "brand-scaling-tactics"]
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
                                <textarea id="brand-desc" value={brandDesc} onChange={(e) => setBrandDesc(e.target.value)} placeholder="例如：我們是一個專為健身愛好者設計的線上課程平台..."/>
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
                            <textarea id="article-content" value={articleContent} onChange={(e) => setArticleContent(e.target.value)} placeholder="在此貼上您希望分析與優化的文章全文..."/>
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
                                     const { tdk, suggestions } = articleAnalysisResult;
                                     const eeatText = `E-E-A-T 強化建議:\n- ${suggestions.eeat.join('\n- ')}`;
                                     const readText = `可讀性與結構優化:\n- ${suggestions.readability.join('\n- ')}`;
                                     const engageText = `讀者參與度提升:\n- ${suggestions.engagement.join('\n- ')}`;
                                     const toneText = suggestions.toneAndStyle ? `語氣與風格調整:\n- ${suggestions.toneAndStyle.join('\n- ')}` : '';
                                     const suggestionsText = [eeatText, readText, engageText, toneText].filter(Boolean).join('\n\n');
                                     copyToClipboard(`Title: ${tdk.title}\nDescription: ${tdk.description}\nKeywords: ${tdk.keywords}\n\n建議:\n${suggestionsText}`, 'article');
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

                                        <h4 style={{marginTop: '2rem'}}>文章修改建議</h4>
                                        
                                        {articleAnalysisResult.suggestions.eeat?.length > 0 && (
                                            <>
                                                <h5><Tooltip term="E-E-A-T" explanation={termDefinitions['E-E-A-T']} /> 強化建議</h5>
                                                <ul>{articleAnalysisResult.suggestions.eeat.map((s, i) => (<li key={`eeat-${i}`}>{s}</li>))}</ul>
                                            </>
                                        )}
                                        {articleAnalysisResult.suggestions.readability?.length > 0 && (
                                            <>
                                                <h5>可讀性與結構優化</h5>
                                                <ul>{articleAnalysisResult.suggestions.readability.map((s, i) => (<li key={`read-${i}`}>{s}</li>))}</ul>
                                            </>
                                        )}
                                        {articleAnalysisResult.suggestions.engagement?.length > 0 && (
                                             <>
                                                <h5>讀者參與度提升</h5>
                                                <ul>{articleAnalysisResult.suggestions.engagement.map((s, i) => (<li key={`eng-${i}`}>{s}</li>))}</ul>
                                            </>
                                        )}
                                        {articleAnalysisResult.suggestions.toneAndStyle?.length > 0 && (
                                             <>
                                                <h5>語氣與風格調整</h5>
                                                <ul>{articleAnalysisResult.suggestions.toneAndStyle.map((s, i) => (<li key={`tone-${i}`}>{s}</li>))}</ul>
                                            </>
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
        </div>
    );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);