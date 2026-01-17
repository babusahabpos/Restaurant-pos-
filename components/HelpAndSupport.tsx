
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
    const EXTERNAL_VOICE_URL = "https://www.dropbox.com/scl/fi/ufiv1x6igz94l9s3e7ok6/ElevenLabs_2026-01-17T12_14_36_Sumi-Soft-Romantic-and-Emotional_pvc_sp100_s50_sb75_v3.mp3?rlkey=kbfd76yix6b0saira77b954p0&st=s23hm9pc&dl=1";

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };
        
        loadVoices();
        if (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Initialize external audio
        audioRef.current = new Audio(EXTERNAL_VOICE_URL);
        audioRef.current.onended = () => {
            setIsExternalPlaying(false);
            setPlayingIndex(null);
        };
        audioRef.current.onerror = () => {
            console.error("Failed to load external voice guide.");
            setIsExternalPlaying(false);
            setPlayingIndex(null);
        };

        return () => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const toggleExternalVoice = (fromIndex: number | null = null) => {
        if (!audioRef.current) return;

        if (isExternalPlaying) {
            audioRef.current.pause();
            setIsExternalPlaying(false);
            setPlayingIndex(null);
        } else {
            // Stop any ongoing TTS
            window.speechSynthesis.cancel();
            
            // Set the playing index if coming from an item click
            if (fromIndex !== null) setPlayingIndex(fromIndex);
            
            // Play external audio
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.error("Playback failed", e));
            setIsExternalPlaying(true);
        }
    };

    const manualItems = [
        { 
            title: { bn: "১. ড্যাশবোর্ড (Dashboard)", hi: "১. डैशबोर्ड (Dashboard)" }, 
            desc: { 
                bn: "ড্যাশবোর্ড ব্যবহার করতে প্রথমে বাম দিকের মেনু থেকে ড্যাশবোর্ড লেখায় ক্লিক করুন। এখানে আপনি আজকের মোট বিক্রি এবং অর্ডারের সংখ্যা দেখতে পাবেন। পেন্ডিং অর্ডার দেখতে পেন্ডিং অর্ডার কার্ডে ক্লিক করুন। সুইগি বা জোম্যাটো পার্টনার পোর্টালে যেতে নিচের লোগো গুলোতে ক্লিক করতে পারেন।",
                hi: "ড্যাশবোর্ড ব্যবহার করতে প্রথমে বাম দিকের মেনু থেকে ড্যাশবোর্ড লেখায় ক্লিক করুন। এখানে আপনি আজকের মোট বিক্রি এবং অর্ডারের সংখ্যা দেখতে পাবেন। পেন্ডিং অর্ডার দেখতে পেন্ডিং অর্ডার কার্ডে ক্লিক করুন। সুইগি বা জোম্যাটো পার্টনার পোর্টালে যেতে নিচের লোগো গুলোতে ক্লিক করতে পারেন।"
            } 
        },
        { 
            title: { bn: "২. বিলিং (Billing)", hi: "২. বিলিং (Billing)" }, 
            desc: { 
                bn: "কাস্টমারের বিল করতে প্রথমে বিলিং অপশনে যান। ওপরের লিস্ট থেকে খাবারগুলো বেছে নিন। কাস্টমার যদি বসে খায় তবে ডাইন ইন সিলেক্ট করে টেবিল নম্বর লিখুন আর নিয়ে গেলে টেক অ্যাওয়ে সিলেক্ট করে নাম লিখুন। সবশেষে নিচে থাকা জেনারেট কেওটি বাটনে ক্লিক করুন এতে কিচেনের জন্য টিকিট প্রিন্ট হয়ে যাবে।",
                hi: "কাস্টমারের বিল করতে প্রথমে বিলিং অপশনে যান। ওপরের লিস্ট থেকে খাবারগুলো বেছে নিন। কাস্টমার যদি বসে খায় তবে ডাইন ইন সিলেক্ট করে টেবিল নম্বর লিখুন আর নিয়ে গেলে টেক অ্যাওয়ে সিলেক্ট করে নাম লিখুন। সবশেষে নিচে থাকা জেনারেট কেওটি বাটনে ক্লিক করুন এতে কিচেনের জন্য টিকিট প্রিন্ট হয়ে যাবে।"
            } 
        },
        { 
            title: { bn: "৩. অনলাইন অর্ডার (Online Orders)", hi: "৩. অনলাইন অর্ডার (Online Orders)" }, 
            desc: { 
                bn: "অনলাইন অর্ডার যোগ করতে প্রথমে অনলাইন অপশনে ক্লিক করুন। লিস্ট থেকে সুইগি বা জোম্যাটো বেছে নিন এবং অর্ডার আইডি লিখুন। এরপর কাস্টমার যা অর্ডার করেছে তা মেনু থেকে যোগ করুন। সবশেষে নিচে থাকা জেনারেট অনলাইন কেওটি বাটনে ক্লিক করলেই কিচেনে অর্ডার চলে যাবে।",
                hi: "অনলাইন অর্ডার যোগ করতে প্রথমে অনলাইন অপশনে ক্লিক করুন। লিস্ট থেকে সুইগি বা জোম্যাটো বেছে নিন এবং অর্ডার আইডি লিখুন। এরপর কাস্টমার যা অর্ডার করেছে তা মেনু থেকে যোগ করুন। সবশেষে নিচে থাকা জেনারেট অনলাইন কেওটি বাটনে ক্লিক করলেই কিচেনে অর্ডার চলে যাবে।"
            } 
        },
        { 
            title: { bn: "৪. মেনু (Menu Management)", hi: "৪. মেনু (Menu Management)" }, 
            desc: { 
                bn: "মেনু সেট করতে প্রথমে মেনু অপশনে ক্লিক করুন। নতুন ক্যাটাগরি যোগ করতে অ্যাড নিউ ক্যাটাগরি বাটনে চাপ দিন। কোনও খাবার যোগ করতে ক্যাটাগরির ভেতরে গিয়ে অ্যাড নিউ আইটেম বাটনে ক্লিক করুন এবং নাম ও দাম লিখে সেভ করুন। কোনো খাবার শেষ হয়ে গেলে টগল বাটনটি অফ করে দিলেই সেটি মেনু থেকে বন্ধ হয়ে যাবে।",
                hi: "মেনু সেট করতে প্রথমে মেনু অপশনে ক্লিক করুন। নতুন ক্যাটাগরি যোগ করতে অ্যাড নিউ ক্যাটাগরি বাটনে চাপ দিন। কোনো খাবার যোগ করতে ক্যাটাগরির ভেতরে গিয়ে অ্যাড নিউ আইটেম বাটনে ক্লিক করুন এবং নাম ও দাম লিখে সেভ করুন। কোনো খাবার শেষ হয়ে গেলে টগল বাটনটি অফ করে দিলেই সেটি মেনু থেকে বন্ধ হয়ে যাবে।"
            } 
        },
        { 
            title: { bn: "৫. কিউআর মেনু (QR Menu)", hi: "৫. কিউআর মেনু (QR Menu)" }, 
            desc: { 
                bn: "ডিজিটাল কিউআর মেনু তৈরি করতে প্রথমে কিউআর মেনু অপশনে যান এবং ওপরের জেনারেট কিউআর কোড বাটনে ক্লিক করুন। আপনার মেনুর কিউআর কোডটি স্ক্রিনে দেখা যাবে। আপনি চাইলে ডাউনলোড পিডিএফ বাটনে ক্লিক করে এটি প্রিন্ট করতে পারেন এবং টেবিলের ওপর রাখতে পারেন।",
                hi: "ডিজিটাল কিউআর মেনু তৈরি করতে প্রথমে কিউআর মেনু অপশনে যান এবং ওপরের জেনারেট কিউআর কোড বাটনে ক্লিক করুন। আপনার মেনুর কিউআর কোডটি স্ক্রিনে দেখা যাবে। আপনি চাইলে ডাউনলোড পিডিএফ বাটনে ক্লিক করে এটি প্রিন্ট করতে পারেন এবং টেবিলের ওপর রাখতে পারেন।"
            } 
        },
        { 
            title: { bn: "৬. কাস্টমার অফার (Customer Offer)", hi: "৬. কাস্টমার অফার (Customer Offer)" }, 
            desc: { 
                bn: "কাস্টমারদের অফার পাঠাতে প্রথমে কাস্টমার অফার অপশনে ক্লিক করুন। এখানে আপনার পুরনো সব কাস্টমারের লিস্ট দেখতে পাবেন। যাদের অফার পাঠাতে চান তাদের নামের পাশে টিক দিন। এরপর ওপরে আপনার মেসেজটি লিখে সেন্ড ব্রডকাস্ট বাটনে ক্লিক করুন। এতে সবার হোয়াটসঅ্যাপে অফারটি চলে যাবে।",
                hi: "কাস্টমারদের অফার পাঠাতে প্রথমে কাস্টমার অফার অপশনে ক্লিক করুন। এখানে আপনার পুরনো সব কাস্টমারের লিস্ট দেখতে পাবেন। যাদের অফার পাঠাতে চান তাদের নামের পাশে টিক দিন। এরপর ওপরে আপনার মেসেজটি লিখে সেন্ড ব্রডকাস্ট বাটনে ক্লিক করুন। এতে সবার হোয়াটসঅ্যাপে অফারটি চলে যাবে।"
            } 
        },
        { 
            title: { bn: "৭. ইনভেন্টরি (Inventory)", hi: "৭. ইনভেন্টরি (Inventory)" }, 
            desc: { 
                bn: "স্টক ম্যানেজ করতে ইনভেন্টরি অপশনে যান। নতুন কোনো মাল যোগ করতে অ্যাড নিউ স্টক বাটনে ক্লিক করুন এবং পরিমাণ লিখে সেভ করুন। যখনই কোনো মাল ব্যবহার করবেন আপডেট বাটনে ক্লিক করে বর্তমান পরিমাণ লিখে দিন। স্টক খুব কমে গেলে এটি লাল রঙে আপনাকে সতর্ক করে দেবে।",
                hi: "স্টক ম্যানেজ করতে ইনভেন্টরি অপশনে যান। নতুন কোনো মাল যোগ করতে অ্যাড নিউ স্টক বাটনে ক্লিক করুন এবং পরিমাণ লিখে সেভ করুন। যখনই কোনো মাল ব্যবহার করবেন আপডেট বাটনে ক্লিক করে বর্তমান পরিমাণ লিখে দিন। স্টক খুব কমে গেলে এটি লাল রঙে আপনাকে সতর্ক করে দেবে।"
            } 
        },
        { 
            title: { bn: "৮. রিপোর্টস (Reports)", hi: "৮. রিপোর্টস (Reports)" }, 
            desc: { 
                bn: "আপনার ব্যবসার হিসাব দেখতে রিপোর্টস অপশনে ক্লিক করুন। লিস্ট থেকে আজ বা গত সাত দিন সিলেক্ট করে নির্দিষ্ট সময়ের লাভ ও বিক্রি দেখতে পারেন। নিচের গ্রাফটি দেখে আপনি বুঝতে পারবেন সপ্তাহের কোন দিন আপনার রেস্টুরেন্টে সবথেকে বেশি বিক্রি হচ্ছে।",
                hi: "আপনার ব্যবসার হিসাব দেখতে রিপোর্টস অপশনে ক্লিক করুন। লিস্ট থেকে আজ বা গত সাত দিন সিলেক্ট করে নির্দিষ্ট সময়ের লাভ ও বিক্রি দেখতে পারেন। নিচের গ্রাফটি দেখে আপনি বুঝতে পারবেন সপ্তাহের কোন দিন আপনার রেস্টুরেন্টে সবথেকে বেশি বিক্রি হচ্ছে।"
            } 
        },
        { 
            title: { bn: "৯. পেমেন্ট হাব (Payment Hub)", hi: "৯. পেমেন্ট হাব (Payment Hub)" }, 
            desc: { 
                bn: "পেমেন্ট ডায়েরি ব্যবহার করতে পেমেন্ট হাবে যান। প্রথমে স্টাফ বা সেলার বেছে নিন এবং অ্যাড নিউ মেম্বার বাটনে ক্লিক করে নাম যোগ করুন। এরপর নামের পাশে থাকা ডায়েরি ভিউ বাটনে ক্লিক করুন। এখানে নতুন পেমেন্ট রেকর্ড করতে রেকর্ড পেমেন্ট বাটনে ক্লিক করে হিসাব লিখে সেভ করুন।",
                hi: "পেমেন্ট ডায়েরি ব্যবহার করতে পেমেন্ট হাবে যান। প্রথমে স্টাফ বা সেলার বেছে নিন এবং অ্যাড নিউ মেম্বার বাটনে ক্লিক করে নাম যোগ করুন। এরপর নামের পাশে থাকা ডায়েরি ভিউ বাটনে ক্লিক করুন। এখানে নতুন পেমেন্ট রেকর্ড করতে রেকর্ড পেমেন্ট বাটনে ক্লিক করে হিসাব লিখে সেভ করুন।"
            } 
        },
        { 
            title: { bn: "১০. স্টাফ হাব (Staff Hub)", hi: "১০. স্টাফ হাব (Staff Hub)" }, 
            desc: { 
                bn: "আপনার যদি নতুন কোনো কর্মচারী যেমন শেফ বা ওয়েটার প্রয়োজন হয় তবে এখান থেকে রিকুয়েন্টমেন্ট পোস্ট করতে পারেন যা সরাসরি আমাদের অ্যাডমিন টিমের কাছে পৌঁছে যাবে।",
                hi: "আপনার যদি নতুন কোনো কর্মচারী যেমন শেফ বা ওয়েটার প্রয়োজন হয় তবে এখান থেকে রিকুয়েন্টমেন্ট পোস্ট করতে পারেন যা সরাসরি আমাদের অ্যাডমিন টিমের কাছে পৌঁছে যাবে।"
            } 
        }
    ];

    const playVoice = (text: string, index: number) => {
        // SPECIAL CASE: Index 0 is Dashboard, play the high-quality external audio
        if (index === 0) {
            toggleExternalVoice(0);
            return;
        }

        if (!('speechSynthesis' in window)) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }

        // WebView Fix: Always cancel current and force a resume signal before speaking
        window.speechSynthesis.cancel();
        
        // Stop external audio if playing
        if (audioRef.current) {
            audioRef.current.pause();
            setIsExternalPlaying(false);
        }

        if (playingIndex === index) {
            setPlayingIndex(null);
            return;
        }

        // Create utterance
        const cleanedText = text.replace(/[()\-.]/g, ' ');
        const utterance = new SpeechSynthesisUtterance(cleanedText);
        
        const targetLangCode = lang === 'bn' ? 'bn-IN' : 'hi-IN';
        utterance.lang = targetLangCode;
        
        const bestVoice = voices.find(v => v.lang === targetLangCode) || 
                          voices.find(v => v.lang.startsWith(lang));
        
        if (bestVoice) {
            utterance.voice = bestVoice;
        }
        
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => setPlayingIndex(index);
        utterance.onend = () => setPlayingIndex(null);
        utterance.onerror = (e) => {
            console.error("TTS System Error", e);
            setPlayingIndex(null);
            window.speechSynthesis.resume();
        };

        setTimeout(() => {
            window.speechSynthesis.resume();
            window.speechSynthesis.speak(utterance);
        }, 50);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            <div className="bg-gray-900 p-6 rounded-[2.5rem] border border-gray-800 flex flex-col items-center gap-6 shadow-xl">
                <div className="text-center">
                    <h3 className="text-xl font-black text-lemon uppercase tracking-tighter italic">APP MANUAL</h3>
                    <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">SELECT LANGUAGE AND TAP TO LISTEN</p>
                </div>

                <button 
                    onClick={() => toggleExternalVoice(null)}
                    className={`w-full flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all group ${isExternalPlaying && playingIndex === null ? 'bg-lemon border-lemon shadow-2xl shadow-lemon/20' : 'bg-black border-gray-800 hover:border-lemon/50'}`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isExternalPlaying && playingIndex === null ? 'bg-black text-lemon' : 'bg-gray-900 text-lemon'}`}>
                            {isExternalPlaying && playingIndex === null ? (
                                <svg className="animate-pulse" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            )}
                        </div>
                        <div className="text-left">
                            <p className={`font-black uppercase text-sm ${isExternalPlaying && playingIndex === null ? 'text-black' : 'text-white'}`}>Listen to Welcome Guide</p>
                            <p className={`text-[9px] font-bold uppercase ${isExternalPlaying && playingIndex === null ? 'text-black/60' : 'text-gray-500'}`}>
                                {isExternalPlaying && playingIndex === null ? 'Playing Recording...' : 'Recorded Instructions'}
                            </p>
                        </div>
                    </div>
                    {isExternalPlaying && playingIndex === null && (
                        <div className="flex gap-0.5">
                            <div className="w-1 h-4 bg-black rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-1 h-6 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-3 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                    )}
                </button>
                
                <div className="flex gap-2 p-1 bg-black rounded-xl border border-gray-800 w-full">
                    <button 
                        onClick={() => { setLang('bn'); window.speechSynthesis.cancel(); setPlayingIndex(null); }}
                        className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${lang === 'bn' ? 'bg-lemon text-black shadow-lg shadow-lemon/20' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        BENGALI
                    </button>
                    <button 
                        onClick={() => { setLang('hi'); window.speechSynthesis.cancel(); setPlayingIndex(null); }}
                        className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${lang === 'hi' ? 'bg-lemon text-black shadow-lg shadow-lemon/20' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        HINDI
                    </button>
                </div>
            </div>

            {manualItems.map((item, i) => (
                <div 
                    key={i} 
                    onClick={() => playVoice(item.desc[lang], i)}
                    className={`bg-gray-900 border transition-all p-5 rounded-[2rem] cursor-pointer hover:scale-[1.01] active:scale-[0.98] ${playingIndex === i ? 'border-lemon bg-lemon/5 shadow-2xl shadow-lemon/5' : 'border-gray-800 hover:border-gray-700'}`}
                >
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <h4 className={`font-black text-sm uppercase tracking-tight mb-2 transition-colors ${playingIndex === i ? 'text-lemon' : 'text-white'}`}>{item.title[lang]}</h4>
                            <p className="text-gray-300 text-[11px] font-bold leading-relaxed">{item.desc[lang]}</p>
                            <p className="text-[8px] text-gray-600 font-black uppercase mt-3 tracking-widest">
                                {playingIndex === i ? 'NOW LISTENING...' : 'TAP TO LISTEN'}
                            </p>
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
