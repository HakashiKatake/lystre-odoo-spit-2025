"use client";

import { useState } from "react";
import { X, Ruler, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/retroui/Button";
import { motion, AnimatePresence } from "framer-motion";

interface SizeGuideProps {
    isOpen: boolean;
    onClose: () => void;
    productType?: string;
}

const SIZE_CHART = {
    tops: {
        headers: ["Size", "Chest (in)", "Length (in)", "Shoulder (in)"],
        rows: [
            ["XS", "34-36", "26", "16"],
            ["S", "36-38", "27", "17"],
            ["M", "38-40", "28", "18"],
            ["L", "40-42", "29", "19"],
            ["XL", "42-44", "30", "20"],
            ["XXL", "44-46", "31", "21"],
            ["3XL", "46-48", "32", "22"],
        ],
    },
    bottoms: {
        headers: ["Size", "Waist (in)", "Hip (in)", "Length (in)"],
        rows: [
            ["XS", "26-28", "34-36", "38"],
            ["S", "28-30", "36-38", "39"],
            ["M", "30-32", "38-40", "40"],
            ["L", "32-34", "40-42", "41"],
            ["XL", "34-36", "42-44", "42"],
            ["XXL", "36-38", "44-46", "43"],
            ["3XL", "38-40", "46-48", "44"],
        ],
    },
};

const BRAND_COMPARISON = [
    { brand: "Lystré", xs: "XS", s: "S", m: "M", l: "L", xl: "XL" },
    { brand: "Zara", xs: "XS", s: "S", m: "M", l: "L", xl: "XL" },
    { brand: "H&M", xs: "34", s: "36", m: "38", l: "40", xl: "42" },
    { brand: "Uniqlo", xs: "XS", s: "S", m: "M", l: "L", xl: "XL" },
    { brand: "Mango", xs: "XS", s: "S", m: "M", l: "L", xl: "XL" },
];

const BODY_TYPE_QUIZ = [
    {
        question: "What's your height?",
        options: [
            { label: "Under 5'4\" (163cm)", value: "short" },
            { label: "5'4\" - 5'8\" (163-173cm)", value: "medium" },
            { label: "Above 5'8\" (173cm)", value: "tall" },
        ],
    },
    {
        question: "What's your weight range?",
        options: [
            { label: "Under 55kg (121lbs)", value: "light" },
            { label: "55-70kg (121-154lbs)", value: "medium" },
            { label: "70-85kg (154-187lbs)", value: "heavy" },
            { label: "Above 85kg (187lbs)", value: "very_heavy" },
        ],
    },
    {
        question: "What's your body type?",
        options: [
            { label: "Slim/Athletic", value: "slim" },
            { label: "Regular/Average", value: "regular" },
            { label: "Curvy/Plus Size", value: "curvy" },
        ],
    },
];

export function SizeGuide({ isOpen, onClose, productType = "tops" }: SizeGuideProps) {
    const [activeTab, setActiveTab] = useState<"chart" | "quiz" | "compare">("chart");
    const [chartType, setChartType] = useState<"tops" | "bottoms">("tops");
    const [quizStep, setQuizStep] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
    const [recommendedSize, setRecommendedSize] = useState<string | null>(null);

    const handleQuizAnswer = (answer: string) => {
        const newAnswers = [...quizAnswers, answer];
        setQuizAnswers(newAnswers);

        if (quizStep < BODY_TYPE_QUIZ.length - 1) {
            setQuizStep(quizStep + 1);
        } else {
            // Calculate recommended size
            const heightScore = newAnswers[0] === "short" ? 0 : newAnswers[0] === "medium" ? 1 : 2;
            const weightScore = newAnswers[1] === "light" ? 0 : newAnswers[1] === "medium" ? 1 : newAnswers[1] === "heavy" ? 2 : 3;
            const bodyScore = newAnswers[2] === "slim" ? 0 : newAnswers[2] === "regular" ? 1 : 2;

            const totalScore = heightScore + weightScore + bodyScore;
            const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
            const sizeIndex = Math.min(Math.floor(totalScore / 2), sizes.length - 1);
            setRecommendedSize(sizes[sizeIndex]);
        }
    };

    const resetQuiz = () => {
        setQuizStep(0);
        setQuizAnswers([]);
        setRecommendedSize(null);
    };

    const chart = SIZE_CHART[chartType];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white border-2 border-[#2B1810] max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b-2 border-[#2B1810] p-4 flex justify-between items-center">
                            <h2 className="text-xl font-serif text-[#2B1810] flex items-center gap-2">
                                <Ruler size={24} className="text-[#8B7355]" />
                                Size Guide
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-[#F5EBE0]">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b-2 border-[#2B1810]">
                            {[
                                { id: "chart", label: "Size Chart" },
                                { id: "quiz", label: "Find My Size" },
                                { id: "compare", label: "Brand Comparison" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    className={`flex-1 px-4 py-3 font-bold text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? "bg-[#8B7355] text-white"
                                            : "bg-white text-[#2B1810] hover:bg-[#F5EBE0]"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Size Chart Tab */}
                            {activeTab === "chart" && (
                                <div>
                                    <div className="flex gap-2 mb-4">
                                        <button
                                            onClick={() => setChartType("tops")}
                                            className={`px-4 py-2 border-2 border-[#2B1810] font-bold text-sm ${
                                                chartType === "tops" ? "bg-[#F5EBE0]" : "bg-white"
                                            }`}
                                        >
                                            Tops
                                        </button>
                                        <button
                                            onClick={() => setChartType("bottoms")}
                                            className={`px-4 py-2 border-2 border-[#2B1810] font-bold text-sm ${
                                                chartType === "bottoms" ? "bg-[#F5EBE0]" : "bg-white"
                                            }`}
                                        >
                                            Bottoms
                                        </button>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full border-2 border-[#2B1810]">
                                            <thead>
                                                <tr className="bg-[#F5EBE0]">
                                                    {chart.headers.map((header) => (
                                                        <th key={header} className="px-4 py-3 text-left font-bold text-[#2B1810] border-b-2 border-[#2B1810]">
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {chart.rows.map((row, i) => (
                                                    <tr key={i} className="hover:bg-[#F5EBE0]/50">
                                                        {row.map((cell, j) => (
                                                            <td key={j} className={`px-4 py-3 border-b border-[#2B1810]/20 ${j === 0 ? "font-bold" : ""}`}>
                                                                {cell}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <p className="text-sm text-[#8B7355] mt-4">
                                        * Measurements are in inches. For best fit, measure yourself and compare with the chart.
                                    </p>
                                </div>
                            )}

                            {/* Find My Size Quiz Tab */}
                            {activeTab === "quiz" && (
                                <div>
                                    {recommendedSize ? (
                                        <div className="text-center py-8">
                                            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#8B7355] flex items-center justify-center border-2 border-[#2B1810]">
                                                <span className="text-3xl font-bold text-white">{recommendedSize}</span>
                                            </div>
                                            <h3 className="text-2xl font-serif text-[#2B1810] mb-2">Your Recommended Size</h3>
                                            <p className="text-[#8B7355] mb-6">
                                                Based on your answers, we recommend size <strong>{recommendedSize}</strong> for the best fit.
                                            </p>
                                            <Button
                                                onClick={resetQuiz}
                                                variant="outline"
                                                className="border-2 border-[#2B1810]"
                                            >
                                                Take Quiz Again
                                            </Button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center gap-2 mb-6">
                                                {BODY_TYPE_QUIZ.map((_, i) => (
                                                    <div
                                                        key={i}
                                                        className={`flex-1 h-2 rounded-full ${
                                                            i <= quizStep ? "bg-[#8B7355]" : "bg-[#E5D4C1]"
                                                        }`}
                                                    />
                                                ))}
                                            </div>

                                            <h3 className="text-xl font-serif text-[#2B1810] mb-6">
                                                {BODY_TYPE_QUIZ[quizStep].question}
                                            </h3>

                                            <div className="space-y-3">
                                                {BODY_TYPE_QUIZ[quizStep].options.map((option) => (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => handleQuizAnswer(option.value)}
                                                        className="w-full p-4 text-left bg-white border-2 border-[#2B1810] hover:bg-[#F5EBE0] hover:shadow-[4px_4px_0px_#2B1810] transition-all flex justify-between items-center"
                                                    >
                                                        <span className="font-medium text-[#2B1810]">{option.label}</span>
                                                        <ChevronRight size={20} className="text-[#8B7355]" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Brand Comparison Tab */}
                            {activeTab === "compare" && (
                                <div>
                                    <p className="text-[#8B7355] mb-4">
                                        Compare Lystré sizes with other popular brands:
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-2 border-[#2B1810]">
                                            <thead>
                                                <tr className="bg-[#F5EBE0]">
                                                    <th className="px-4 py-3 text-left font-bold text-[#2B1810] border-b-2 border-[#2B1810]">Brand</th>
                                                    <th className="px-4 py-3 text-center font-bold text-[#2B1810] border-b-2 border-[#2B1810]">XS</th>
                                                    <th className="px-4 py-3 text-center font-bold text-[#2B1810] border-b-2 border-[#2B1810]">S</th>
                                                    <th className="px-4 py-3 text-center font-bold text-[#2B1810] border-b-2 border-[#2B1810]">M</th>
                                                    <th className="px-4 py-3 text-center font-bold text-[#2B1810] border-b-2 border-[#2B1810]">L</th>
                                                    <th className="px-4 py-3 text-center font-bold text-[#2B1810] border-b-2 border-[#2B1810]">XL</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {BRAND_COMPARISON.map((row, i) => (
                                                    <tr key={i} className={`hover:bg-[#F5EBE0]/50 ${i === 0 ? "bg-[#8B7355]/10" : ""}`}>
                                                        <td className="px-4 py-3 font-bold border-b border-[#2B1810]/20">{row.brand}</td>
                                                        <td className="px-4 py-3 text-center border-b border-[#2B1810]/20">{row.xs}</td>
                                                        <td className="px-4 py-3 text-center border-b border-[#2B1810]/20">{row.s}</td>
                                                        <td className="px-4 py-3 text-center border-b border-[#2B1810]/20">{row.m}</td>
                                                        <td className="px-4 py-3 text-center border-b border-[#2B1810]/20">{row.l}</td>
                                                        <td className="px-4 py-3 text-center border-b border-[#2B1810]/20">{row.xl}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
