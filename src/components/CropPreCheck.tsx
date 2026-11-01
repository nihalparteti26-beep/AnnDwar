import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  CloudSun, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  FileText,
  HelpCircle,
  Camera,
  Check,
  XCircle,
  Image as ImageIcon
} from 'lucide-react';
import { Language, CropPreCheckResult } from '../types';

interface CropPreCheckProps {
  lang: Language;
  onNavigateToBooking: () => void;
}

export const CropPreCheck: React.FC<CropPreCheckProps> = ({
  lang,
  onNavigateToBooking,
}) => {
  const isHi = lang === 'hi';

  const [selectedCrop, setSelectedCrop] = useState<string>('गेहूँ (Wheat)');
  const [imagePreview, setImagePreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80'
  );
  const [notes, setNotes] = useState<string>('साफ सुथरी 2 दिन धूप में सुखाई गई फसल, नमी 10.5%, कचरा नगण्य');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<CropPreCheckResult | null>(null);
  const [hasRunCheck, setHasRunCheck] = useState<boolean>(false);

  // Common crops in MP and Indian mandis
  const cropOptions = [
    'गेहूँ (Wheat)',
    'चना (Gram / Chana)',
    'सोयाबीन (Soybean)',
    'धान (Paddy / Rice)',
    'सरसों (Mustard)',
    'मक्का (Maize)',
  ];

  // Presets for quick real-time testing
  const presets = [
    {
      id: 'sample_wheat_good',
      labelHi: 'नमूना 1: ग्रेड-A गेहूँ (मानक पास)',
      labelEn: 'Sample 1: Grade-A Wheat (Pass)',
      crop: 'गेहूँ (Wheat)',
      notes: 'साफ सुथरी 2 दिन धूप में सुखाई गई फसल, नमी 10.5%, कचरा नगण्य',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'sample_wheat_moist',
      labelHi: 'नमूना 2: उच्च नमी गेहूँ (धूप सुखाना आवश्यक)',
      labelEn: 'Sample 2: High Moisture Wheat (Drying Needed)',
      crop: 'गेहूँ (Wheat)',
      notes: 'हाल ही में कटी हुई फसल, दानों में नमी, धूप में 4 घंटे सुखाना जरूरी',
      image: 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'sample_chana',
      labelHi: 'नमूना 3: देसी चना (प्रीमियम दाना)',
      labelEn: 'Sample 3: Desi Chana (Fine husk)',
      crop: 'चना (Gram / Chana)',
      notes: 'सूखा और गोल दाना, छिलका साफ, कीट रहित उपज',
      image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'sample_invalid',
      labelHi: '⚠️ टेस्ट: अमान्य चित्र (अस्वीकृति जांच)',
      labelEn: '⚠️ Test: Invalid Picture (Rejection Check)',
      crop: 'गेहूँ (Wheat)',
      notes: 'अमान्य चित्र (non-crop vehicle image) परीक्षण हेतु',
      image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=600&q=80', // Car photo
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setAnalysisResult(null);
        setHasRunCheck(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setSelectedCrop(preset.crop);
    setNotes(preset.notes);
    setImagePreview(preset.image);
    setAnalysisResult(null);
    setHasRunCheck(false);
  };

  const runAnalysis = async () => {
    if (!imagePreview) {
      alert(isHi ? 'कृपया पहले अनाज की तस्वीर अपलोड करें।' : 'Please upload a crop picture first.');
      return;
    }

    setIsLoading(true);
    setHasRunCheck(true);

    try {
      const res = await fetch('/api/ai/crop-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropType: selectedCrop,
          imageBase64: imagePreview,
          additionalNotes: notes,
        }),
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error('Crop pre-check error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const isInvalidImage = analysisResult && (analysisResult.isValidCropImage === false || Boolean(analysisResult.errorMessage && analysisResult.qualityScore === 0));

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-[#1b4d3e] text-white rounded-3xl p-5 sm:p-7 shadow-sm border border-[#143e31] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-[#245e4b] text-[#88f0bc] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#3b7d67]">
              ✨ AnnDwar AI Vision 2.5
            </span>
            <span className="text-xs text-emerald-200">
              {isHi ? 'मंडी पूर्व अनाज गुणवत्ता जांच' : 'Pre-Procurement Grain Quality'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {isHi ? '✨ AI फसल गुणवत्ता पूर्व-जांच (सटीक लैब विश्लेषण)' : '✨ AI Pre-Crop Quality Check'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
            {isHi
              ? 'मंडी जाने से पहले अपने अनाज की फोटो अपलोड करके वास्तविक समय में नमी (Moisture), कचरा (Foreign Matter) व गुणवत्ता की सटीक जांच करें ताकि मंडी में कोई अस्वीकृति न हो।'
              : 'Analyze your grain photo in real time before booking a mandi slot to ensure full MSP eligibility and eliminate rejection at the weighbridge.'}
          </p>
        </div>

        <button
          onClick={onNavigateToBooking}
          className="self-start md:self-center bg-white text-[#1b4d3e] hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <span>{isHi ? 'स्लॉट बुकिंग पर जाएं' : 'Go to Slot Booking'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Grid: Upload & Controls on Left, Analysis Report on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Crop Configuration */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-[#d2dfd6] p-4 sm:p-5 shadow-xs flex flex-col gap-4">
            <h3 className="text-sm font-bold text-[#143626] flex items-center gap-2 border-b border-[#e2ece5] pb-2.5">
              <Upload className="w-4 h-4 text-[#1b7e45]" />
              <span>{isHi ? '1. फसल चुनें व फोटो अपलोड करें' : '1. Select Crop & Upload Picture'}</span>
            </h3>

            {/* Crop Dropdown */}
            <div>
              <label className="block text-xs font-bold text-[#224433] mb-1.5">
                {isHi ? 'फसल का नाम (Crop Name):' : 'Crop Name:'}
              </label>
              <select
                value={selectedCrop}
                onChange={(e) => {
                  setSelectedCrop(e.target.value);
                  setAnalysisResult(null);
                }}
                className="w-full bg-[#f8faf8] border border-[#cfe0d5] text-xs font-semibold rounded-xl px-3 py-2.5 text-[#143626] focus:outline-none focus:border-[#1b7e45]"
              >
                {cropOptions.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Preview & Upload Box */}
            <div>
              <label className="block text-xs font-bold text-[#224433] mb-1.5">
                {isHi ? 'अनाज की फोटो (Grain Photo):' : 'Grain Photo:'}
              </label>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#b9d9c6] bg-black/5 aspect-video flex items-center justify-center group">
                  <img
                    src={imagePreview}
                    alt="Uploaded Crop"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="bg-white text-[#1b4d3e] text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-gray-100 flex items-center gap-1.5 shadow-md">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{isHi ? 'बदलें' : 'Change'}</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setAnalysisResult(null);
                      }}
                      className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-red-700 shadow-md"
                    >
                      {isHi ? 'हटाएं' : 'Remove'}
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-[#a3cbb5] hover:border-[#1b7e45] bg-[#f8faf8] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                  <div className="w-12 h-12 rounded-full bg-[#e8f5ed] flex items-center justify-center text-[#1b7e45]">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-[#1b4d3e]">
                    {isHi ? 'कैमरे से फोटो खींचें या फाइल चुनें' : 'Take Photo or Choose File'}
                  </span>
                  <span className="text-[11px] text-[#638072]">JPG, PNG या WEBP (अनाज की साफ तस्वीर)</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* Quick Testing Presets */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-[#537363] uppercase tracking-wider">
                  {isHi ? 'त्वरित परीक्षण नमूने (Presets):' : 'Quick Test Presets:'}
                </label>
                <span className="text-[10px] text-[#1b7e45] font-semibold bg-[#e8f5ed] px-2 py-0.5 rounded-md">
                  {isHi ? '1-क्लिक टेस्ट' : '1-Click Test'}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {presets.map((preset) => {
                  const isActive = imagePreview === preset.image;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'border-[#1b7e45] bg-[#eef8f2] text-[#143626] font-bold'
                          : 'border-[#dce8e0] bg-[#fcfdfc] text-[#335544] hover:bg-[#f2f8f4]'
                      }`}
                    >
                      <span className="truncate pr-2">{isHi ? preset.labelHi : preset.labelEn}</span>
                      {isActive && <Check className="w-4 h-4 text-[#1b7e45] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Farmer Notes */}
            <div>
              <label className="block text-xs font-bold text-[#224433] mb-1.5">
                {isHi ? 'उपज विवरण / धूप सुखाने के दिन:' : 'Harvest Condition / Drying Info:'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder={isHi ? 'उदा: 2 दिन धूप में सुखाया गया, नमी कम है...' : 'e.g. 2 days sun-dried, moisture low...'}
                className="w-full bg-[#f8faf8] border border-[#cfe0d5] text-xs rounded-xl p-2.5 text-[#143626] focus:outline-none focus:border-[#1b7e45] resize-none"
              />
            </div>

            {/* Run Button */}
            <button
              onClick={runAnalysis}
              disabled={isLoading || !imagePreview}
              className="w-full bg-[#1b7e45] hover:bg-[#146636] disabled:bg-gray-300 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isHi ? 'AI विश्लेषण जारी है...' : 'Running AI Vision Analysis...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isHi ? 'AI गुणवत्ता पूर्व-जांच शुरू करें' : 'Run AI Quality Pre-Check'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Real-Time Results & Feedback */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {isLoading ? (
            <div className="bg-white rounded-2xl border border-[#d2dfd6] p-10 text-center shadow-xs flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-16 h-16 rounded-full bg-[#e8f5ed] border-2 border-[#1b7e45] flex items-center justify-center text-[#1b7e45] mb-4 animate-bounce">
                <Sparkles className="w-8 h-8 text-[#1b7e45]" />
              </div>
              <h3 className="text-base font-bold text-[#143626]">
                {isHi ? 'AI विजन विश्लेषण प्रगति पर है...' : 'AI Vision Analysis in Progress...'}
              </h3>
              <p className="text-xs text-[#557867] max-w-sm mt-1">
                {isHi
                  ? 'अनाज की फोटो, नमी (Moisture %), कचरा और एमएसपी पात्रता की वास्तविक समय में जांच हो रही है।'
                  : 'Validating crop match, inspecting grain texture, moisture content, and purity.'}
              </p>
            </div>
          ) : isInvalidImage ? (
            /* =================================================================== */
            /* INVALID IMAGE REJECTION CARD                                        */
            /* =================================================================== */
            <div className="bg-[#fff8f6] border-2 border-[#fca5a5] rounded-3xl p-6 sm:p-8 shadow-md flex flex-col items-center text-center animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center text-red-600 mb-4">
                <XCircle className="w-9 h-9" />
              </div>

              <div className="inline-block bg-red-600 text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider mb-2">
                ⚠️ {analysisResult?.errorMessage || 'PLEASE UPLOAD CORRECT PICTURE'}
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-red-950 mt-1">
                {isHi ? 'कृपया सही अनाज की तस्वीर अपलोड करें' : 'Please upload correct picture'}
              </h3>

              <p className="text-xs sm:text-sm text-red-800 font-medium max-w-md mt-2 leading-relaxed">
                {analysisResult?.recommendationsHi?.[0] || 
                  (isHi
                    ? `अपलोड की गई तस्वीर चयनित फसल (${selectedCrop}) से मेल नहीं खाती। कृपया वाहन या अन्य वस्तुओं के बजाय अपने खेत के अनाज के दानों की साफ फोटो अपलोड करें।`
                    : `The uploaded picture does not match the selected crop (${selectedCrop}). Please upload a clear photo of your grain harvest instead of non-crop objects.`)}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <label className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-xs flex items-center gap-2 transition-all">
                  <Upload className="w-4 h-4" />
                  <span>{isHi ? 'सही फसल की फोटो अपलोड करें' : 'Upload Correct Crop Photo'}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>

                <button
                  type="button"
                  onClick={() => handleApplyPreset(presets[0])}
                  className="bg-white border border-red-300 text-red-800 hover:bg-red-50 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer transition-all"
                >
                  {isHi ? 'मानक गेहूँ नमूना आज़माएं' : 'Try Valid Wheat Sample'}
                </button>
              </div>
            </div>
          ) : analysisResult ? (
            /* =================================================================== */
            /* VALID CROP ANALYSIS REPORT                                          */
            /* =================================================================== */
            <div className="bg-white rounded-2xl border border-[#d2dfd6] p-5 sm:p-6 shadow-xs flex flex-col gap-4 animate-fadeIn">
              {/* Report Header */}
              <div className="flex items-center justify-between border-b border-[#e5efe8] pb-3 flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#e6f4ec] text-[#1b7e45] text-[11px] font-bold px-2 py-0.5 rounded-md border border-[#bce2cc]">
                      ✓ {isHi ? 'सत्यापित अनाज नमूना' : 'Verified Grain Sample'}
                    </span>
                    <span className="text-xs font-mono font-semibold text-[#618070]">
                      #{analysisResult.id}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[#113222] mt-1">
                    {analysisResult.cropType} • {isHi ? 'गुणवत्ता रिपोर्ट' : 'Quality Assessment'}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#638072] block">
                    {isHi ? 'गुणवत्ता स्कोर' : 'Quality Score'}
                  </span>
                  <span className="text-3xl font-black text-[#1b7e45]">
                    {analysisResult.qualityScore}
                    <span className="text-sm font-bold text-[#638072]">/100</span>
                  </span>
                </div>
              </div>

              {/* 3 Scientific Metric Cards */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {/* Moisture */}
                <div className="bg-[#f7faf8] border border-[#cfe2d6] rounded-xl p-3 text-center">
                  <span className="text-[10.5px] text-[#557766] block font-medium">
                    {isHi ? 'नमी (Moisture)' : 'Moisture %'}
                  </span>
                  <span className={`text-xl font-black mt-0.5 block ${
                    analysisResult.moisturePercent <= 12.0 ? 'text-[#1b7e45]' : 'text-[#c62828]'
                  }`}>
                    {analysisResult.moisturePercent}%
                  </span>
                  <span className="text-[9.5px] text-[#2c8352] font-semibold mt-0.5 block">
                    {analysisResult.moisturePercent <= 12.0 
                      ? (isHi ? 'मानक ≤ 12% (पास)' : 'Standard ≤ 12% (Pass)')
                      : (isHi ? 'सुखाना जरूरी' : 'Needs Sun Drying')}
                  </span>
                </div>

                {/* Foreign Matter */}
                <div className="bg-[#f7faf8] border border-[#cfe2d6] rounded-xl p-3 text-center">
                  <span className="text-[10.5px] text-[#557766] block font-medium">
                    {isHi ? 'कचरा / धूल' : 'Foreign Matter'}
                  </span>
                  <span className="text-xl font-black text-[#1b7e45] mt-0.5 block">
                    {analysisResult.foreignMatterPercent}%
                  </span>
                  <span className="text-[9.5px] text-[#2c8352] font-semibold mt-0.5 block">
                    {analysisResult.foreignMatterPercent <= 1.0 
                      ? (isHi ? 'अति शुद्ध (A-ग्रेड)' : 'Pure (Grade-A)')
                      : (isHi ? 'छनाई करें' : 'Sieving needed')}
                  </span>
                </div>

                {/* Broken Grains */}
                <div className="bg-[#f7faf8] border border-[#cfe2d6] rounded-xl p-3 text-center">
                  <span className="text-[10.5px] text-[#557766] block font-medium">
                    {isHi ? 'टूटे दाने' : 'Broken Grains'}
                  </span>
                  <span className="text-xl font-black text-[#1b7e45] mt-0.5 block">
                    {analysisResult.brokenGrainsPercent}%
                  </span>
                  <span className="text-[9.5px] text-[#2c8352] font-semibold mt-0.5 block">
                    {isHi ? 'मानक सीमा के अंदर' : 'Within Limits'}
                  </span>
                </div>
              </div>

              {/* Mandi Procurement & Rate Card */}
              <div className="bg-[#f0f9f4] border border-[#c2e4cf] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1b7e45] text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#143626]">
                        {isHi ? 'मंडी ग्रेड आवंटन:' : 'Procurement Grade:'}
                      </span>
                      <span className="bg-[#1b7e45] text-white text-[11px] font-black px-2 py-0.5 rounded-md">
                        {analysisResult.grade}
                      </span>
                      <span className="text-xs font-semibold text-[#1b7e45]">
                        {analysisResult.isMspEligible 
                          ? (isHi ? '• पूर्ण एमएसपी योग्य' : '• MSP Eligible') 
                          : (isHi ? '• अस्वीकृति जोखिम' : '• Rejection Risk')}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#557867]">
                      {isHi ? 'वेब्रिज अस्वीकृति जोखिम:' : 'Weighbridge Rejection Risk:'}{' '}
                      <strong className={analysisResult.rejectionRiskLevel === 'Low' ? 'text-emerald-700' : 'text-amber-700'}>
                        {analysisResult.rejectionRiskLevel}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right border-t sm:border-t-0 border-[#d2dfd6] pt-2 sm:pt-0">
                  <span className="text-[10px] text-[#638072] block font-medium">
                    {isHi ? 'अनुमानित दर (दर/क्विंटल)' : 'Est. Rate (/Quintal)'}
                  </span>
                  <span className="text-xl font-black text-[#1b7e45]">
                    ₹{analysisResult.estimatedRatePerQuintal}
                  </span>
                </div>
              </div>

              {/* Weather & Sun-Drying Advisory */}
              <div className="bg-[#fdf9ea] border border-[#fae5a2] rounded-xl p-3.5 flex items-start gap-3 text-xs text-[#735914]">
                <CloudSun className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-[#5c440a] block mb-0.5">
                    {isHi ? 'मौसम एवं धूप सुखाने की सलाह:' : 'Weather & Sun-Drying Advisory:'}
                  </strong>
                  <span>{isHi ? analysisResult.weatherAlertHi : analysisResult.weatherAlertEn}</span>
                </div>
              </div>

              {/* Recommendations List */}
              <div>
                <span className="text-xs font-bold text-[#143626] block mb-1.5">
                  {isHi ? 'मंडी विशेषज्ञों की सलाह:' : 'Mandi Expert Recommendations:'}
                </span>
                <ul className="flex flex-col gap-1.5">
                  {(isHi ? analysisResult.recommendationsHi : analysisResult.recommendationsEn)?.map((rec, idx) => (
                    <li key={idx} className="text-xs text-[#2a4d3b] bg-[#f8faf8] border border-[#dce9e1] rounded-lg p-2 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1b7e45] shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Slot Booking CTA */}
              <div className="pt-2 border-t border-[#e2ede5] flex justify-end">
                <button
                  onClick={onNavigateToBooking}
                  className="bg-[#1b7e45] hover:bg-[#146636] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <span>{isHi ? 'इस उपज के लिए मंडी स्लॉट बुक करें' : 'Book Mandi Slot for this Crop'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Initial Empty State */
            <div className="bg-white rounded-2xl border border-[#d2dfd6] p-8 text-center shadow-xs flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-14 h-14 rounded-full bg-[#f0f6f2] flex items-center justify-center text-[#1b7e45] mb-3">
                <ImageIcon className="w-7 h-7 text-[#28844f]" />
              </div>
              <h3 className="text-base font-bold text-[#143626]">
                {isHi ? 'फसल की फोटो अपलोड करें और तुरंत जांचें' : 'Upload Crop Picture for Instant Analysis'}
              </h3>
              <p className="text-xs text-[#5a7c6c] max-w-sm mt-1 leading-relaxed">
                {isHi
                  ? 'बाएं पैनल से नमूना चुनें या अपने खेत के अनाज की तस्वीर अपलोड करके "AI गुणवत्ता पूर्व-जांच" बटन दबाएं।'
                  : 'Select a preset from the left panel or upload your grain photo and click "Run AI Quality Pre-Check".'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
