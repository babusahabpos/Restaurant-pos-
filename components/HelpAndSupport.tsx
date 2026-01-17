
import React, { useState, useEffect, useRef } from 'react';
import { SupportTicket } from '../types';

interface HelpAndSupportProps {
    userTickets: SupportTicket[];
    onCreateTicket: (subject: string, message: string, attachment?: string, attachmentType?: 'image' | 'pdf') => void;
    onReplyToTicket?: (ticketId: number, message: string) => void;
}

const UserManual: React.FC = () => {
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);
    const [lang, setLang] = useState<'bn' | 'hi'>('bn');
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [isExternalPlaying, setIsExternalPlaying] = useState(false);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const manualItems = [
        { 
            title: { bn: "১. ড্যাশবোর্ড (Dashboard)", hi: "১. डैशबोर्ड (Dashboard)" }, 
            desc: { 
                bn: "ড্যাশবোর্ড ব্যবহার করতে প্রথমে বাম দিকের মেনু থেকে ড্যাশবোর্ড লেখায় ক্লিক করুন। এখানে আপনি আজকের মোট বিক্রি এবং অর্ডারের সংখ্যা দেখতে পাবেন। পেন্ডিং অর্ডার দেখতে পেন্ডিং অর্ডার কার্ডে ক্লিক করুন। সুইগি বা জোম্যাটো পার্টনার পোর্টালে যেতে নিচের লোগো গুলোতে ক্লিক করতে পারেন।",
                hi: "ড্যাশবোর্ড ব্যবহার করতে প্রথমে বাম দিকের মেনু থেকে ড্যাশবোর্ড লেখায় ক্লিক করুন। এখানে আপনি আজকের মোট বিক্রি এবং অর্ডারের সংখ্যা দেখতে পাবেন। পেন্ডিং অর্ডার দেখতে পেন্ডিং অর্ডার কার্ডে ক্লিক করুন। সুইগি বা জোमैटो पार्टनर पोर्टल पर जाने के लिए नीचे दिए गए लोगो पर क्लिक कर सकते हैं।"
            },
            audioUrl: "https://www.dropbox.com/scl/fi/ufiv1x6igz94l9s3e7ok6/ElevenLabs_2026-01-17T12_14_36_Sumi-Soft-Romantic-and-Emotional_pvc_sp100_s50_sb75_v3.mp3?rlkey=kbfd76yix6b0saira77b954p0&st=s23hm9pc&dl=1"
        },
        { 
            title: { bn: "২. বিলিং (Billing)", hi: "২. বিলিং (Billing)" }, 
            desc: { 
                bn: "কাস্টমারের বিল করতে প্রথমে বিলিং অপশনে যান। ওপরের লিস্ট থেকে খাবারগুলো বেছে নিন। কাস্টমার যদি বসে খায় তবে ডাইন ইন সিলেক্ট করে টেবিল নম্বর লিখুন আর নিয়ে গেলে টেক অ্যাওয়ে সিলেক্ট করে নাম লিখুন। সবশেষে নিচে থাকা জেনারেট কেওটি বাটনে ক্লিক করুন এতে কিচেনের জন্য টিকিট প্রিন্ট হয়ে যাবে।",
                hi: "ग्राहक का बिल बनाने के लिए सबसे पहले बिलिंग विकल्प पर जाएं। ऊपर दी गई सूची से भोजन चुनें। यदि ग्राहक वहीं बैठकर खाता है, तो डाइन-इन चुनें और टेबल नंबर लिखें, और यदि वह साथ ले जाता है, तो टेकअवे चुनें और नाम लिखें। अंत में, नीचे दिए गए जेनरेट केओटी बटन पर क्लिक करें, इससे किचन के लिए टिकट प्रिंट हो जाएगा।"
            },
            audioUrl: "https://www.dropbox.com/scl/fi/klsnrmon42k0blw3l4www/Billing_2026-01-17T13_39_45_Sumi-Soft-Romantic-and-Emotional_pvc_sp100_s50_sb75_v3.mp3?rlkey=vzibj1ifsobz5o4qhpt02ow3c&st=gnt8keys&dl=1"
        },
        { 
            title: { bn: "৩. অনলাইন অর্ডার (Online Orders)", hi: "৩. অনলাইন অর্ডার (Online Orders)" }, 
            desc: { 
                bn: "অনলাইন অর্ডার যোগ করতে প্রথমে অনলাইন অপশনে ক্লিক করুন। লিস্ট থেকে সুইগি বা জোম্যাটো বেছে নিন এবং অর্ডার আইডি লিখুন। এরপর কাস্টমার যা অর্ডার করেছে তা মেনু থেকে যোগ করুন। সবশেষে নিচে থাকা জেনারেট অনলাইন কেওটি বাটনে ক্লিক করলেই কিচেনে অর্ডার চলে যাবে।",
                hi: "ऑनलाइन ऑर्डर जोड़ने के लिए सबसे पहले ऑनलाइन विकल्प पर क्लिक करें। सूची से स्विगी या ज़ोमैटो चुनें और ऑर्डर आईडी लिखें। फिर ग्राहक ने जो ऑर्डर किया है उसे मेनू से जोड़ें। अंत में, नीचे दिए गए जेनरेट ऑनलाइन केओटी बटन पर क्लिक करें और ऑर्डर किचन में चला जाएगा।"
            },
            audioUrl: "https://www.dropbox.com/scl/fi/cqnm7jcrtdujqcs4w7pv8/Onlineorder_2026-01-17T13_47_36_Sumi-Soft-Romantic-and-Emotional_pvc_sp100_s50_sb75_v3.mp3?rlkey=0boc4rtt2xzp416nyq9bczoe4&st=ueal8r75&dl=1"
        },
        { 
            title: { bn: "৪. মেনু (Menu Management)", hi: "৪. মেনু (Menu Management)" }, 
            desc: { 
                bn: "মেনু সেট করতে প্রথমে মেনু অপশনে ক্লিক করুন। নতুন ক্যাটাগরি যোগ করতে অ্যাড নিউ ক্যাটাগরি বাটনে চাপ দিন। কোনও খাবার যোগ করতে ক্যাটাগরির ভেতরে গিয়ে অ্যাড নিউ আইটেম বাটনে ক্লিক করুন এবং নাম ও দাম লিখে সেভ করুন। কোনো খাবার শেষ হয়ে গেলে টগল বাটনটি অফ করে দিলেই সেটি মেনু থেকে বন্ধ হয়ে যাবে।",
                hi: "मेनू सेट करने के लिए सबसे पहले मेनू विकल्प पर क्लिक करें। नई श्रेणी जोड़ने के लिए 'ऐड न्यू कैटेगरी' बटन दबाएं। भोजन जोड़ने के लिए श्रेणी के अंदर जाएं और 'ऐড নিউ আইটেম' बटन पर क्लिक करें और नाम और कीमत लिखकर सहेजें। यदि कोई भोजन समाप्त हो गया है, तो टॉगल बटन को बंद कर दें और यह मेनू से बंद हो जाएगा।"
            },
            audioUrl: "https://www.dropbox.com/scl/fi/ozz4netbxce510qrqmq3s/Menu_2026-01-17T13_53_55_Sumi-Soft-Romantic-and-Emotional_pvc_sp100_s50_sb75_v3.mp3?rlkey=mod8o4tzhnl8j9q1td80egkpv&st=io7fclmp&dl=1"
        },
        { 
            title: { bn: "৫. কিউআর মেনু (QR Menu)", hi: "৫. কিউআর মেনু (QR Menu)" }, 
            desc: { 
                bn: "ডিজিটাল কিউআর মেনু তৈরি করতে প্রথমে কিউআর মেনু অপশনে যান এবং ওপরের জেনারেট কিউআর কোড বাটনে ক্লিক করুন। আপনার মেনুর কিউআর কোডটি স্ক্রিনে দেখা যাবে। আপনি চাইলে ডাউনলোড পিডিএফ বাটনে ক্লিক করে এটি প্রিন্ট করতে পারেন এবং টেবিলের ওপর রাখতে পারেন।",
                hi: "डिजिटल क्यूआर मेनू बनाने के लिए सबसे पहले क्यूआर मेनू विकल्प पर जाएं और ऊपर दिए गए 'जेनरेट क्यूआर कोड' बटन पर क्लिक करें। आपके मेनू का क्यूआर कोड स्क्रीन पर दिखाई देगा। आप 'डाउनलोड पीडीएफ' बटन पर क्लिक करके इसे प्रिंट कर सकते हैं और इसे टेबल पर रख सकते हैं।"
            },
            audioUrl: "https://www.dropbox.com/scl/fi/5a569b58lg2kyo82o3br0/Qrmenu_2026-01-17T13_57_41_Sumi-Soft-Romantic-and-Emotional_pvc_sp100_s50_sb75_v3.mp3?rlkey=k9lg2oh8bpw259omy1vwz4td5&st=to8avpxn&dl=1"
        },
        { 
            title: { bn: "৬. কাস্টমার অফার (Customer Offer)", hi: "৬. কাস্টমার অফার (Customer Offer)" }, 
            desc: { 
                bn: "কাস্টমারদের অফার পাঠাতে প্রথমে কাস্টমার অফার অপশনে ক্লিক করুন। এখানে আপনার পুরনো সব কাস্টমারের লিস্ট দেখতে পাবেন। যাদের অফার পাঠাতে চান তাদের নামের পাশে টিক দিন। এরপর ওপরে আপনার মেসেজটি লিখে সেন্ড ব্রডকাস্ট বাটনে ক্লিক করুন। এতে সবার হোয়াটসঅ্যাপে অফারটি চলে যাবে।",
                hi: "ग्राहकों को ऑफर भेजने के लिए सबसे पहले 'কাস্টমার অফার' विकल्प पर क्लिक करें। यहां आप अपने पुराने सभी ग्राहकों की सूची देख सकते हैं। आप जिन्हें ऑफर भेजना चाहते हैं उनके नाम के आगे टिक करें। इसके बाद अपना मैसेज ऊपर लिखें और 'সেন্ড ব্রডকাস্ট' बटन पर क्लिक करें। इससे ऑफर सबके व्हाट्सएप पर चला जाएगा।"
            },
            audioUrl: "https://www.dropbox.com/scl/fi/bfdx5t7ylsrnh540aehh9/Offer_2026-01-17T14_01_12_Sumi-Soft-Romantic-and-Emotional_pvc_sp100_s50_sb75_v3.mp3?rlkey=2b84sy7yl5z61lvwtxk6ims2s&st=ylurmo0s&dl=1"
        },
        { 
            title: { bn: "৭. ইনভেন্টরি (Inventory)", hi: "৭. ইনভেন্টরি (Inventory)" }, 
            desc: { 
                bn: "স্টক ম্যানেজ করতে ইনভেন্টরি অপশনে যান। নতুন কোনো মাল যোগ করতে অ্যাড নিউ স্টক বাটনে ক্লিক করুন এবং পরিমাণ লিখে সেভ করুন। যখনই কোনো মাল ব্যবহার করবেন আপডেট বাটনে ক্লিক করে বর্তমান পরিমাণ লিখে দিন। স্টক খুব কমে গেলে এটি লাল রঙে আপনাকে সতর্ক করে দেবে।",
                hi: "स्टॉक प्रबंधित करने के लिए इन्वेंट्री विकल्प पर जाएं। कोई भी नया सामान जोड़ने के लिए 'এড নিউ স্টক' बटन पर क्लिक करें और मात्रा लिखकर सहेजें। जब भी आप किसी सामान का उपयोग करें, अपडेट बटन पर क्लिक करें और वर्तमान मात्रा लिखें। यदि स्टॉक बहुत कम है, तो यह आपको लाल रंग में सचेत करेगा।"
            },
            audioUrl: "https://www.dropbox.com/scl/fi/1jfn3fy956i1qvahlanyt/Inventory_2026-01-17T14_03_51_Sumi-Soft-Romantic-and-Emotional_pvc_sp100_s50_sb75_v3.mp3?rlkey=00el2o7gydoe6aeg2g78hawjx&st=t5rtcdfe&dl=1"
        },
        { 
            title: { bn: "৮. রিপোর্টস (Reports)", hi: "৮. রিপোর্টস (Reports)" }, 
            desc: { 
                bn: "আপনার ব্যবসার হিসাব দেখতে রিপোর্টস অপশনে ক্লিক করুন। লিস্ট থেকে আজ বা গত সাত দিন সিলেক্ট করে নির্দিষ্ট সময়ের লাভ ও বিক্রি দেখতে পারেন। নিচের গ্রাফটি দেখে আপনি বুঝতে পারবেন সপ্তাহের কোন দিন আপনার রেস্টুরেন্টে সবথেকে বেশি বিক্রি হচ্ছে।",
                hi: "अपने व्यवसाय का हिसाब देखने के लिए रिपोर्ट्स विकल्प पर क्लिक करें। आप सूची से आज या पिछले सात दिनों का चयन करके एक निश्चित अवधि के लिए लाभ और बिक्री देख सकते हैं। नीचे दिए गए ग्राफ को देखकर आप समझ पाएंगे कि हफ्ते के किस दिन आपके रेस्टोरेंट में सबसे ज्यादा बिक्री हो रही है।"
            },
            audioUrl: "https://www.dropbox.com/scl/fi/yzvx4v0872wwgyb04ce9h/Report_2026-01-17T14_07_30_Sumi-Soft-Romantic-and-Emotional_pvc_sp100_s50_sb75_v3.mp3?rlkey=2jqygg0n4r8fkylaf01o61mhq&st=89rzxu9y&dl=1"
        },
        { 
            title: { bn: "৯. পেমেন্ট হাব (Payment Hub)", hi: "৯. পেমেন্ট হাব (Payment Hub)" }, 
            desc: { 
                bn: "পেমেন্ট ডায়েরি ব্যবহার করতে পেমেন্ট হাবে যান। প্রথমে স্টাফ বা সেলার বেছে নিন এবং অ্যাড নিউ মেম্বার বাটনে ক্লিক করে নাম যোগ করুন। এরপর নামের পাশে থাকা ডায়েরি ভিউ বাটনে ক্লিক করুন। এখানে নতুন পেমেন্ট রেকর্ড করতে রেকর্ড পেমেন্ট বাটনে ক্লিক করে হিসাব লিখে সেভ করুন।",
                hi: "पेमेंट डायरी का उपयोग करने के लिए पेमेंट हब पर जाएं। सबसे पहले स्टाफ या सेलर चुनें और 'এড নিউ মেম্বার' बटन पर क्लिक करके नाम जोड़ें। इसके बाद नाम के आगे 'ডায়েরি ভিউ' बटन पर क्लिक करें। यहां नया भुगतान रिकॉर्ड करने के लिए 'রেকর্ড পেমেন্ট' बटन पर क्लिक करें, विवरण लिखें और सहेजें।"
            },
            audioUrl: "https://www.dropbox.com/scl/fi/qnled1ain9em4grmulwfb/Payment_2026-01-17T14_11_26_Sumi-Soft-Romantic-and-Emotional_pvc_sp100_s50_sb75_v3.mp3?rlkey=srieodt11w2n8b1mkc3w0lzsl&st=l57p58bn&dl=1"
        },
        { 
            title: { bn: "১০. স্টাফ হাব (Staff Hub)", hi: "১০. স্টাফ হাব (Staff Hub)" }, 
            desc: { 
                bn: "আপনার যদি নতুন কোনো কর্মচারী যেমন শেফ বা ওয়েটার প্রয়োজন হয় তবে এখান থেকে রিকুয়েন্টমেন্ট পোস্ট করতে পারেন যা সরাসরি আমাদের অ্যাডমিন টিমের কাছে পৌঁছে যাবে।",
                hi: "यदि आपको शेफ या वेटर जैसे नए कर्मचारियों की आवश्यकता है, तो आप यहां भर्ती पोस्ट कर सकते हैं जो सीधे हमारी एडमिन टीम तक पहुंच जाएगी।"
            },
            audioUrl: "https://www.dropbox.com/scl/fi/txrwg73lbwntj3pst5fab/Staff-hub_2026-01-17T14_14_34_Sumi-Soft-Romantic-and-Emotional_pvc_sp100_s50_sb75_v3.mp3?rlkey=nj975354ecpg7pd5ngnbus5i2&st=4kw9n8he&dl=1"
        }
    ];

    useEffect(() => {
        const loadVoices = () => {
            try {
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                    const availableVoices = window.speechSynthesis.getVoices();
                    if (availableVoices && availableVoices.length > 0) {
                        setVoices(availableVoices);
                    }
                }
            } catch (e) {
                console.error("Speech engine load error:", e);
            }
        };

        loadVoices();
        if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            try {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current = null;
                }
            } catch (e) {}
        };
    }, []);

    const playVoice = (item: typeof manualItems[0], index: number) => {
        // Defensive stop for all audio
        try {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        } catch (e) {}

        if (playingIndex === index) {
            setPlayingIndex(null);
            setIsExternalPlaying(false);
            return;
        }

        // play provided recording for BENGALI language only
        if (item.audioUrl && lang === 'bn') {
            try {
                const audio = new Audio(item.audioUrl);
                audioRef.current = audio;
                audio.onplay = () => {
                    setPlayingIndex(index);
                    setIsExternalPlaying(true);
                };
                audio.onended = () => {
                    setPlayingIndex(null);
                    setIsExternalPlaying(false);
                };
                audio.onerror = () => {
                    console.error("Audio Playback Error");
                    setPlayingIndex(null);
                    setIsExternalPlaying(false);
                };
                audio.play().catch(e => {
                    console.warn("Playback blocked by browser settings.", e);
                    setPlayingIndex(null);
                });
            } catch (err) {
                console.error("Audio Initialization Error:", err);
            }
        } 
        else {
            // DIGITAL VOICE (FALLBACK)
            if (typeof window === 'undefined' || !window.speechSynthesis) return;
            
            try {
                const cleanedText = (item.desc[lang] || "").replace(/[()\-.]/g, ' ');
                const utterance = new SpeechSynthesisUtterance(cleanedText);
                const targetLangCode = lang === 'bn' ? 'bn-IN' : 'hi-IN';
                utterance.lang = targetLangCode;
                
                const bestVoice = voices.find(v => v.lang === targetLangCode) || 
                                  voices.find(v => v.lang.startsWith(lang));
                
                if (bestVoice) utterance.voice = bestVoice;
                utterance.rate = 0.85;
                
                utterance.onstart = () => { 
                    setPlayingIndex(index); 
                    setIsExternalPlaying(false); 
                };
                utterance.onend = () => setPlayingIndex(null);
                utterance.onerror = () => setPlayingIndex(null);

                window.speechSynthesis.resume();
                window.speechSynthesis.speak(utterance);
            } catch (err) {
                console.error("Speech Synthesis Error:", err);
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-24 h-full">
            <div className="bg-gray-900 p-6 rounded-[2.5rem] border border-gray-800 flex flex-col items-center gap-6 shadow-xl shrink-0">
                <div className="text-center">
                    <h3 className="text-xl font-black text-lemon uppercase tracking-tighter italic">APP MANUAL</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">SELECT LANGUAGE AND TAP TO LISTEN</p>
                </div>

                <div className="flex gap-2 p-1 bg-black rounded-xl border border-gray-800 w-full">
                    <button 
                        onClick={() => { setLang('bn'); if(window.speechSynthesis) window.speechSynthesis.cancel(); setPlayingIndex(null); }}
                        className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${lang === 'bn' ? 'bg-lemon text-black shadow-lg shadow-lemon/20' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        BENGALI
                    </button>
                    <button 
                        onClick={() => { setLang('hi'); if(window.speechSynthesis) window.speechSynthesis.cancel(); setPlayingIndex(null); }}
                        className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${lang === 'hi' ? 'bg-lemon text-black shadow-lg shadow-lemon/20' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        HINDI
                    </button>
                </div>
            </div>

            <div className="space-y-3 px-1">
                {manualItems.map((item, i) => (
                    <div 
                        key={i} 
                        onClick={() => playVoice(item, i)}
                        className={`bg-gray-900 border transition-all p-5 rounded-[2rem] cursor-pointer hover:scale-[1.01] active:scale-[0.98] ${playingIndex === i ? 'border-lemon bg-lemon/5 shadow-2xl shadow-lemon/5' : 'border-gray-800 hover:border-gray-700'}`}
                    >
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <h4 className={`font-black text-sm uppercase tracking-tight mb-2 transition-colors ${playingIndex === i ? 'text-lemon' : 'text-white'}`}>{item.title[lang]}</h4>
                                <p className="text-gray-300 text-[11px] font-bold leading-relaxed">{item.desc[lang]}</p>
                                <div className="flex items-center gap-2 mt-3">
                                    <p className={`text-[8px] font-black uppercase tracking-widest ${playingIndex === i ? 'text-lemon' : 'text-gray-600'}`}>
                                        {playingIndex === i ? 'NOW LISTENING...' : 'TAP TO LISTEN'}
                                    </p>
                                    {(item.audioUrl && lang === 'bn') && (
                                        <span className="bg-lemon/10 text-lemon text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border border-lemon/20">Voice Recording</span>
                                    )}
                                    {lang === 'hi' && (
                                        <span className="bg-gray-800 text-gray-500 text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter border border-gray-700">Digital Voice</span>
                                    )}
                                </div>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${playingIndex === i ? 'bg-lemon animate-pulse shadow-lg shadow-lemon/20' : 'bg-black text-gray-400 border border-gray-800'}`}>
                                {playingIndex === i ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HelpAndSupport: React.FC<HelpAndSupportProps> = ({ userTickets, onCreateTicket, onReplyToTicket }) => {
    const [view, setView] = useState<'inbox' | 'compose' | 'chat' | 'manual'>('inbox');
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [chatReply, setChatReply] = useState('');
    const [attachment, setAttachment] = useState<string | null>(null);
    const [attachmentType, setAttachmentType] = useState<'image' | 'pdf' | undefined>(undefined);
    const [fileName, setFileName] = useState('');

    const activeTicket = userTickets.find(t => t.id === selectedTicketId);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File size too large. Max 2MB allowed.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target?.result as string;
                setAttachment(result);
                setFileName(file.name);
                setAttachmentType(file.type.includes('pdf') ? 'pdf' : 'image');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreateTicket = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) return;
        onCreateTicket(subject, message, attachment || undefined, attachmentType);
        setSubject(''); setMessage(''); setAttachment(null); setFileName(''); setAttachmentType(undefined);
        setView('inbox');
        alert('Message sent to Admin Hub!');
    };

    const handleSendReply = () => {
        if (!chatReply.trim() || !selectedTicketId || !onReplyToTicket) return;
        onReplyToTicket(selectedTicketId, chatReply);
        setChatReply('');
    };

    const getStatusChip = (status: SupportTicket['status']) => {
        switch (status) {
            case 'Open': return <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Sent</span>;
            case 'Pending': return <span className="bg-lemon text-black px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">Admin Replied</span>;
            case 'Resolved': return <span className="bg-gray-800 text-gray-500 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">Closed</span>;
        }
    };

    if (view === 'compose') {
        return (
            <div className="max-w-4xl mx-auto h-full flex flex-col p-4">
                <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 mb-6 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">NEW TICKET</h2>
                    <button onClick={() => setView('inbox')} className="text-lemon font-black text-[10px] uppercase tracking-widest">Cancel</button>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
                    <div className="p-6 bg-gray-900 rounded-[2rem] border border-gray-800 animate-fade-in shadow-2xl">
                        <form onSubmit={handleCreateTicket} className="space-y-4">
                            <select 
                                value={subject} onChange={e => setSubject(e.target.value)}
                                className="w-full bg-black text-lemon p-4 rounded-2xl border border-gray-800 outline-none font-bold text-sm" required
                            >
                                <option value="">Select Topic</option>
                                <option value="Renewal Request">Subscription Renewal</option>
                                <option value="Menu Sync Issue">Menu & Pricing</option>
                                <option value="Order Dispute">Order & Payment</option>
                                <option value="Staff Hub Query">Staff Requirement</option>
                                <option value="General Support">Other Support</option>
                            </select>
                            <textarea 
                                placeholder="Describe your issue..." rows={5} value={message}
                                onChange={e => setMessage(e.target.value)}
                                className="w-full bg-black text-white p-4 rounded-2xl border border-gray-800 outline-none font-bold text-sm" required
                            />
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <label className="w-full sm:w-auto bg-gray-800 text-gray-300 px-6 py-3 rounded-xl cursor-pointer border border-gray-700 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                                    {fileName ? fileName : 'Attach File'}
                                    <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                                </label>
                                {fileName && <button type="button" onClick={() => { setAttachment(null); setFileName(''); }} className="text-red-500 font-black text-[9px] uppercase">Remove</button>}
                            </div>
                            <button type="submit" className="w-full bg-lemon text-black font-black py-5 rounded-[1.5rem] uppercase text-xs tracking-widest shadow-xl shadow-lemon/20">Send to Admin</button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'chat' && activeTicket) {
        return (
            <div className="max-w-4xl mx-auto h-full flex flex-col p-4">
                <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 mb-4 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setView('inbox')} className="text-gray-400 p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[200px]">{activeTicket.subject}</h2>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">ID: #{activeTicket.id}</p>
                        </div>
                    </div>
                    {getStatusChip(activeTicket.status)}
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 py-4 px-2">
                    {activeTicket.messages.map((msg, idx) => (
                        <div key={idx} className={`flex flex-col ${msg.sender === 'admin' ? 'items-start' : 'items-end'}`}>
                            <div className={`p-4 rounded-2xl max-w-[85%] ${msg.sender === 'admin' ? 'bg-lemon text-black rounded-tl-none shadow-lg' : 'bg-gray-800 text-white rounded-tr-none'}`}>
                                <p className="text-[11px] font-bold leading-relaxed">{msg.text}</p>
                                {msg.attachment && (
                                    <div className="mt-3">
                                        {msg.attachmentType === 'image' ? (
                                            <img src={msg.attachment} alt="Attachment" className="max-h-48 rounded-xl border border-black/10 shadow-md" />
                                        ) : (
                                            <a href={msg.attachment} download="file.pdf" className={`text-[9px] font-black uppercase underline ${msg.sender === 'admin' ? 'text-black' : 'text-lemon'}`}>View Document</a>
                                        )}
                                    </div>
                                )}
                            </div>
                            <span className="text-[8px] text-gray-600 font-black uppercase mt-1 px-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    ))}
                </div>

                {activeTicket.status !== 'Resolved' && (
                    <div className="mt-4 bg-gray-900 p-2 rounded-2xl border border-gray-800 flex items-end gap-2 pb-16 md:pb-2 shadow-2xl">
                        <textarea 
                            value={chatReply} onChange={e => setChatReply(e.target.value)}
                            placeholder="Type a message..." rows={1}
                            className="flex-1 bg-black text-white p-3 rounded-xl outline-none font-bold text-xs resize-none"
                        />
                        <button 
                            onClick={handleSendReply}
                            className="bg-lemon text-black p-3 rounded-xl active:scale-95 transition-transform shadow-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                        </button>
                    </div>
                )}
                {activeTicket.status === 'Resolved' && (
                    <div className="text-center py-4 text-gray-500 font-black uppercase text-[10px] tracking-widest border-t border-gray-800 mt-4">This chat is closed</div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col p-4">
            <div className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 mb-6 shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">HELP CENTER</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Support & Manual</p>
                    </div>
                    <button 
                        onClick={() => setView('compose')}
                        className="bg-lemon text-black font-black px-4 py-2 rounded-xl text-[10px] uppercase shadow-lg active:scale-95 transition-transform"
                    >
                        New Ticket
                    </button>
                </div>
                <div className="flex gap-2 p-1 bg-black rounded-xl border border-gray-800">
                    <button 
                        onClick={() => setView('inbox')}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${view === 'inbox' ? 'bg-gray-800 text-lemon shadow-lg' : 'text-gray-500'}`}
                    >
                        Inbox
                    </button>
                    <button 
                        onClick={() => setView('manual')}
                        className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${view === 'manual' ? 'bg-gray-800 text-lemon shadow-lg' : 'text-gray-500'}`}
                    >
                        User Manual
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                {view === 'manual' ? (
                    <UserManual />
                ) : (
                    <div className="pb-24 space-y-3">
                        {userTickets.length === 0 ? (
                            <div className="py-24 text-center opacity-30 flex flex-col items-center grayscale">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                                <p className="font-black uppercase text-xs tracking-widest">No messages found</p>
                            </div>
                        ) : (
                            userTickets.slice().reverse().map(ticket => (
                                <div 
                                    key={ticket.id} 
                                    onClick={() => { setSelectedTicketId(ticket.id); setView('chat'); }}
                                    className="bg-gray-900 border border-gray-800 p-5 rounded-[2rem] cursor-pointer hover:border-lemon/30 transition-all shadow-md group relative overflow-hidden active:scale-[0.98]"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            {getStatusChip(ticket.status)}
                                            <span className="text-[9px] text-gray-600 font-black uppercase">{new Date(ticket.lastUpdate).toLocaleDateString()}</span>
                                        </div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-700 group-hover:text-lemon transition-colors"><path d="m9 18 6-6-6-6"/></svg>
                                    </div>
                                    <h3 className="text-white font-black text-sm uppercase tracking-tighter leading-tight line-clamp-1">{ticket.subject}</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1 truncate">
                                        {ticket.messages[ticket.messages.length - 1].sender === 'admin' ? 'Admin: ' : 'You: '}
                                        {ticket.messages[ticket.messages.length - 1].text}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HelpAndSupport;
