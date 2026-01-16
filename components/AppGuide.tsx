
import React, { useState, useEffect } from 'react';

interface GuideItem {
    id: string;
    title: string;
    icon: string;
    description: {
        bn: string;
        hi: string;
    };
}

const GUIDE_DATA: GuideItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        icon: '📊',
        description: {
            bn: 'ড্যাশবোর্ড ব্যবহার করতে প্রথমে বাম দিকের মেনু থেকে ড্যাশবোর্ড লেখায় ক্লিক করুন। এখানে আপনি আজকের মোট বিক্রি এবং অর্ডারের সংখ্যা দেখতে পাবেন। পেন্ডিং অর্ডার দেখতে পেন্ডিং অর্ডার কার্ডে ক্লিক করুন। সুইগি বা জোম্যাটো পার্টনার পোর্টালে যেতে নিচের লোগো গুলোতে ক্লিক করতে পারেন।',
            hi: 'ড্যাশবোর্ড ব্যবহার করতে প্রথমে বাম দিকের মেনু থেকে ড্যাশবোর্ড লেখায় ক্লিক করুন। এখানে আপনি আজকের মোট বিক্রি এবং অর্ডারের সংখ্যা দেখতে পাবেন। পেন্ডিং অর্ডার দেখতে পেন্ডিং অর্ডার কার্ডে ক্লিক করুন। সুইগি বা জোম্যাটো পার্টনার পোর্টালে যেতে নিচের লোগো গুলোতে ক্লিক করতে পারেন।'
        }
    },
    {
        id: 'billing',
        title: 'Billing',
        icon: '🧾',
        description: {
            bn: 'কাস্টমারের বিল করতে প্রথমে বিলিং অপশনে যান। ওপরের লিস্ট থেকে খাবারগুলো বেছে নিন। কাস্টমার যদি বসে খায় তবে ডাইন ইন সিলেক্ট করে টেবিল নম্বর লিখুন আর নিয়ে গেলে টেক অ্যাওয়ে সিলেক্ট করে নাম লিখুন। সবশেষে নিচে থাকা জেনারেট কেওটি বাটনে ক্লিক করুন এতে কিচেনের জন্য টিকিট প্রিন্ট হয়ে যাবে।',
            hi: 'ग्राहक का बिल बनाने के लिए सबसे पहले बिलिंग विकल्प पर जाएं। ऊपर दी गई लिस्ट से आइटम चुनें। यदि ग्राहक वहीं बैठकर खा रहा है तो ডাইন ইন चुनें और टेबल नंबर लिखें और यदि ले जा रहा है तो টেক অ্যাওয়ে चुनकर नाम लिखें। अंत में नीचे दिए गए जेनरेट কেওটি बटन पर क्लिक करें इससे किचन के लिए टिकट प्रिंट हो जाएगा।'
        }
    },
    {
        id: 'online',
        title: 'Online Orders',
        icon: '🛵',
        description: {
            bn: 'অনলাইন অর্ডার যোগ করতে প্রথমে অনলাইন অপশনে ক্লিক করুন। লিস্ট থেকে সুইগি বা জোম্যাটো বেছে নিন এবং অর্ডার আইডি লিখুন। এরপর কাস্টমার যা অর্ডার করেছে তা মেনু থেকে যোগ করুন। সবশেষে নিচে থাকা জেনারেট অনলাইন কেওটি বাটনে ক্লিক করলেই কিচেনে অর্ডার চলে যাবে।',
            hi: 'ऑनलाइन ऑर्डर जोड़ने के लिए सबसे पहले ऑनलाइन विकल्प पर क्लिक करें। लिस्ट से स्विगी या ज़ोमैटो चुनें और ऑर्डर आईडी लिखें। इसके बाद ग्राहक ने जो आइटम ऑर्डर किए हैं उन्हें मेनू से जोड़ें। अंत में नीचे दिए गए जेनरेट অনলাইন কেওটি बटन पर क्लिक करते ही किचन में ऑर्डर चला जाएगा।'
        }
    },
    {
        id: 'menu',
        title: 'Menu Management',
        icon: '🍽️',
        description: {
            bn: 'মেনু সেট করতে প্রথমে মেনু অপশনে ক্লিক করুন। নতুন ক্যাটাগরি যোগ করতে অ্যাড নিউ ক্যাটাগরি বাটনে চাপ দিন। কোনও খাবার যোগ করতে ক্যাটাগরির ভেতরে গিয়ে অ্যাড নিউ আইটেম বাটনে ক্লিক করুন এবং নাম ও দাম লিখে সেভ করুন। কোনও খাবার শেষ হয়ে গেলে টগল বাটনটি অফ করে দিলেই সেটি মেনু থেকে বন্ধ হয়ে যাবে।',
            hi: 'मेनू सेट करने के लिए सबसे पहले मेनू विकल्प पर क्लिक करें। नई कैटेगरी जोड़ने के लिए ऐड न्यू कैटेगरी बटन दबाएं। कोई आइटम जोड़ने के लिए कैटेगरी के अंदर जाकर ऐड न्यू आइटम बटन पर क्लिक करें और नाम व कीमत लिखकर सेव करें। यदि कोई आइटम खत्म हो गया है तो टॉगल बटन को ऑफ कर दें जिससे वह मेनू से हट जाएगा।'
        }
    },
    {
        id: 'qrMenu',
        title: 'QR Menu',
        icon: '📱',
        description: {
            bn: 'ডিজিটাল কিউআর মেনু তৈরি করতে প্রথমে কিউআর মেনু অপশনে যান এবং ওপরের জেনারেট কিউআর কোড বাটনে ক্লিক করুন। আপনার মেনুর কিউআর কোডটি স্ক্রিনে দেখা যাবে। আপনি চাইলে ডাউনলোড পিডিএফ বাটনে ক্লিক করে এটি প্রিন্ট করতে পারেন এবং টেবিলের ওপর রাখতে পারেন।',
            hi: 'डिजिटल क्यूआर मेनू बनाने के लिए सबसे पहले क्यूआर मेनू विकल्प पर जाएं और ऊपर दिए गए जेनरेट क्यूआर कोड बटन पर क्लिक करें। आपके मेनू का क्यूआर कोड स्क्रीन पर दिखाई देगा। आप चाहें तो डाउनलोड पीडीएफ बटन पर क्लिक करके इसे प्रिंट कर सकते हैं और टेबल पर रख सकते हैं।'
        }
    },
    {
        id: 'customerOffer',
        title: 'Customer Offer',
        icon: '🎁',
        description: {
            bn: 'কাস্টমারদের অফার পাঠাতে প্রথমে কাস্টমার অফার অপশনে ক্লিক করুন। এখানে আপনার পুরনো সব কাস্টমারের লিস্ট দেখতে পাবেন। যাদের অফার পাঠাতে চান তাদের নামের পাশে টিক দিন। এরপর ওপরে আপনার মেসেজটি লিখে সেন্ড ব্রডকাস্ট বাটনে ক্লিক করুন। এতে সবার হোয়াটসঅ্যাপে অফারটি চলে যাবে।',
            hi: 'ग्राहकों को ऑफर भेजने के लिए सबसे पहले कस्टमर ऑफर विकल्प पर क्लिक करें। यहाँ आप अपने पुराने सभी ग्राहकों की लिस्ट देख सकते हैं। जिन्हें ऑफर भेजना चाहते हैं उनके नाम के बगल में टिक करें। इसके बाद ऊपर अपना मैसेज लिखें और सेंड ब्रॉडकास्ट बटन पर क्लिक करें। इससे सबके व्हाट्सएप पर ऑफर चला जाएगा।'
        }
    },
    {
        id: 'inventory',
        title: 'Inventory',
        icon: '📦',
        description: {
            bn: 'স্টক ম্যানেজ করতে ইনভেন্টরি অপশনে যান। নতুন কোনও মাল যোগ করতে অ্যাড নিউ স্টক বাটনে ক্লিক করুন এবং পরিমাণ লিখে সেভ করুন। যখনই কোনও মাল ব্যবহার করবেন আপডেট বাটনে ক্লিক করে বর্তমান পরিমাণ লিখে দিন। স্টক খুব কমে গেলে এটি লাল রঙে আপনাকে সতর্ক করে দেবে।',
            hi: 'স্টক ম্যানেজ করতে ইনভেন্টরি অপশনে যান। নতুন কোনও মাল যোগ করতে অ্যাড নিউ স্টক বাটনে ক্লিক করুন এবং পরিমাণ লিখে সেভ করুন। যখনই কোনও মাল ব্যবহার করবেন আপডেট বাটনে ক্লিক করে বর্তমান পরিমাণ লিখে দিন। স্টক খুব কমে গেলে এটি লাল রঙে আপনাকে সতর্ক করে দেবে।'
        }
    },
    {
        id: 'reports',
        title: 'Reports',
        icon: '📈',
        description: {
            bn: 'আপনার ব্যবসার হিসাব দেখতে রিপোর্টস অপশনে ক্লিক করুন। লিস্ট থেকে আজ বা গত সাত দিন সিলেক্ট করে নির্দিষ্ট সময়ের লাভ ও বিক্রি দেখতে পারেন। নিচের গ্রাফটি দেখে আপনি বুঝতে পারবেন সপ্তাহের কোন দিন আপনার রেস্টুরেন্টে সবথেকে বেশি বিক্রি হচ্ছে।',
            hi: 'अपने व्यवसाय का हिसाब देखने के लिए रिपोर्ट्स विकल्प पर क्लिक करें। लिस्ट से आज या पिछले सात दिन चुनकर निश्चित समय का लाभ और बिक्री देख सकते हैं। नीचे दिए गए ग्राफ को देखकर आप समझ पाएंगे कि सप्ताह के किस दिन आपके रेस्टोरेंट में सबसे ज्यादा बिक्री हो रही है।'
        }
    },
    {
        id: 'payment',
        title: 'Payment Hub',
        icon: '💳',
        description: {
            bn: 'পেমেন্ট ডায়েরি ব্যবহার করতে পেমেন্ট হাবে যান। প্রথমে স্টাফ বা সেলার বেছে নিন এবং অ্যাড নিউ মেম্বার বাটনে ক্লিক করে নাম যোগ করুন। এরপর নামের পাশে থাকা ডায়েরি ভিউ বাটনে ক্লিক করুন। এখানে নতুন পেমেন্ট রেকর্ড করতে রেকর্ড পেমেন্ট বাটনে ক্লিক করে হিসাব লিখে সেভ করুন।',
            hi: 'पेमेंट डायरी का उपयोग करने के लिए पेमेंट हब पर जाएं। सबसे पहले स्टाफ या सेलर चुनें और ऐड न्यू मेंबर बटन पर क्लिक करके नाम जोड़ें। इसके बाद नाम के बगल में दिए गए डायरी व्यू बटन पर क्लिक करें। यहाँ नया पेमेंट रिकॉर्ड करने के लिए रिकॉर्ड पेमेंट बटन पर क्लिक करके हिसाब लिखकर सेव करें।'
        }
    }
];

const AppGuide: React.FC = () => {
    const [lang, setLang] = useState<'bn' | 'hi'>('bn');
    const [playingId, setPlayingId] = useState<string | null>(null);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
        };
        window.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
        return () => window.speechSynthesis.cancel();
    }, []);

    const playVoice = (item: GuideItem) => {
        if (!('speechSynthesis' in window)) {
            alert("Sorry, your browser does not support voice guidance.");
            return;
        }

        // 1. Cancel existing speech
        window.speechSynthesis.cancel();
        
        // 2. Prepare text (cleaning it thoroughly)
        const text = item.description[lang].replace(/[-.]/g, ' ');
        const utterance = new SpeechSynthesisUtterance(text);
        
        // 3. Set language explicitly - CRITICAL for mobile browsers
        const targetLangCode = lang === 'bn' ? 'bn-IN' : 'hi-IN';
        utterance.lang = targetLangCode;
        
        // 4. Try to find the best voice but don't block if not found
        const bestVoice = voices.find(v => v.lang === targetLangCode) || 
                          voices.find(v => v.lang.startsWith(lang));
        
        if (bestVoice) {
            utterance.voice = bestVoice;
        }
        
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => setPlayingId(item.id);
        utterance.onend = () => setPlayingId(null);
        utterance.onerror = (err) => {
            console.error("TTS Error:", err);
            setPlayingId(null);
        };

        // 5. Resume and speak (Resume is needed for Chrome on Android/iOS)
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="h-full flex flex-col p-4 space-y-6 animate-fade-in overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-900/50 p-6 rounded-[2.5rem] border border-gray-800 shrink-0 shadow-xl">
                <div className="text-center sm:text-left">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">Voice Guide</h2>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Select language and tap an option</p>
                </div>
                <div className="flex gap-2 p-1.5 bg-black rounded-2xl border border-gray-800">
                    <button 
                        onClick={() => { setLang('bn'); window.speechSynthesis.cancel(); setPlayingId(null); }} 
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${lang === 'bn' ? 'bg-lemon text-black shadow-lg shadow-lemon/20' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        🇧🇩 Bengali
                    </button>
                    <button 
                        onClick={() => { setLang('hi'); window.speechSynthesis.cancel(); setPlayingId(null); }} 
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${lang === 'hi' ? 'bg-lemon text-black shadow-lg shadow-lemon/20' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        🇮🇳 Hindi
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar pb-24 space-y-3">
                {GUIDE_DATA.map((item) => (
                    <div 
                        key={item.id}
                        onClick={() => playVoice(item)}
                        className={`group bg-gray-900/40 border transition-all p-5 rounded-[2rem] flex items-center justify-between cursor-pointer hover:scale-[1.01] active:scale-[0.98] ${playingId === item.id ? 'border-lemon bg-lemon/5 shadow-2xl shadow-lemon/5' : 'border-gray-800 hover:border-gray-700'}`}
                    >
                        <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:rotate-6 ${playingId === item.id ? 'bg-lemon text-black' : 'bg-black/50 text-white'}`}>
                                {item.icon}
                            </div>
                            <div>
                                <h3 className={`text-base font-black uppercase tracking-tight transition-colors ${playingId === item.id ? 'text-lemon' : 'text-white'}`}>
                                    {item.title}
                                </h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                    {playingId === item.id ? (lang === 'bn' ? 'শুনছেন...' : 'सुन रहे हैं...') : (lang === 'bn' ? 'কিভাবে কাজ করবেন জানুন' : 'कैसे इस्तेमाल करें जानें')}
                                </p>
                            </div>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${playingId === item.id ? 'bg-lemon animate-pulse' : 'bg-gray-800 text-gray-400 group-hover:text-lemon'}`}>
                            {playingId === item.id ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="shrink-0 p-4 text-center">
                 <p className="text-[9px] text-gray-700 font-black uppercase tracking-[0.3em] italic">BaBu SAHAB POS • Learning Center</p>
            </div>
        </div>
    );
};

export default AppGuide;
