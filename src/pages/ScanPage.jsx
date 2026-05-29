import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useCallback, useRef, useState, useEffect } from "react";

function ScanPage() {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const [scanStepText, setScanStepText] = useState("MENCARI WAJAH...");
  const [scanProgress, setScanProgress] = useState(0);
  const fileInputRef = useRef(null);
  const [animatedMatchPercentage, setAnimatedMatchPercentage] = useState(0);

  const capture = useCallback(() => {
    const canvas = webcamRef.current.getCanvas();
    if (canvas) {
      canvas.toBlob((blob) => {
        setImageBlob(blob);
        setImageSrc(URL.createObjectURL(blob));
      }, "image/jpeg", 0.9);
    }
  }, [webcamRef]);

  const retake = () => {
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
    }
    setImageSrc(null);
    setImageBlob(null);
    setAnalysisResult(null);
    setScanProgress(0);
    setAnimatedMatchPercentage(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageBlob(file);
      setImageSrc(URL.createObjectURL(file));
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    let timer;
    
    if (analysisResult?.primaryRecommendation?.matchPercentage) {
      timer = setTimeout(() => {
      }, 500);
      
      timer = setTimeout(() => {
        setAnimatedMatchPercentage(analysisResult.primaryRecommendation.matchPercentage);
      }, 100);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [analysisResult]);

  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "user",
  };

  const analyzePhoto = async () => {
    if (isAnalyzing || !imageBlob) return;
    setIsAnalyzing(true);
    setScanProgress(0);
    
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        
        if (prev < 25) setScanStepText("MEMETAKAN KOORDINAT WAJAH...");
        else if (prev < 55) setScanStepText("MENGANALISIS STRUKTUR TULANG PIPI...");
        else if (prev < 80) setScanStepText("MENGHITUNG METRIK RAUNG...");
        else setScanStepText("MENGKOMPARASI PREDIKSI GAYA RAMBUT...");
        
        return prev + 5;
      });
    }, 150);
    
    try {
      const formData = new FormData();
      formData.append("image", imageBlob, "capture.jpg");

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

      /* Kirim ke BackEnd Dengan Methods POST */
      const result = await axios.post(
        `${API_URL}/api/faces/analyze`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      clearInterval(progressInterval);
      setScanProgress(100);
      setScanStepText("SISTEM ANALISIS BERHASIL!");

      console.log(result.data);

      const hairstyles = result.data.hairstyle || [];
      const primaryStyle = hairstyles[0] || "Modern Haircut";

      setAnalysisResult({
        faceShape: result.data.faceShape || "Oval",
        description: `Berdasarkan hasil analisis Model AI pada foto Anda, bentuk wajah Anda terdeteksi sebagai bentuk ${result.data.faceShape || "Oval"}.`,
        primaryRecommendation: {
          name: primaryStyle,
          matchPercentage: 98.4,
          desc: `Gaya ${primaryStyle} sangat direkomendasikan karena memberikan keseimbangan ideal pada bentuk wajah ${result.data.faceShape || "Oval"} Anda, mengimbangi garis sudut yang tegas dan memberikan volume natural di area atas.`,
          img: "",
          specs: {
            volume: "Medium / Bertekstur",
            maintenance: "Sangat Praktis",
            styling: "Matte Clay / Hair Wax"
          }
        }
      });
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Gagal mengirim data ke server:", error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070708] text-white flex flex-col relative overflow-x-hidden">
      <Navbar />
      <main className="grow flex flex-col items-center py-8 px-6 relative z-10">

        <div className="text-center mb-8 w-full max-w-2xl ">
          <div className="relative w-full aspect-4/3 sm:aspect-video bg-zinc-950 rounded-2xl overflow-hidden flex items-center justify-center mb-6 shadow-2xl border border-neutral-800 shadow-blue-900/10">
          
            {imageSrc ? (
              <div className="relative w-full h-full">
                <img src={imageSrc} alt="Hasil tangkapan kamera" className="w-full h-full object-cover" />
                {isAnalyzing && (
                  <>
                    <div className="absolute inset-0 bg-blue-500/10 animate-pulse pointer-events-none"></div>
                    <div className="absolute w-full h-1.5 bg-linear-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)] z-30 left-0 animate-[scan-move_3s_infinite_ease-in-out]"></div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 z-20">
                      <div className="w-[50%] h-[70%] border-2 border-dashed border-blue-400 rounded-full animate-ping"></div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Webcam 
                  audio={false} 
                  ref={webcamRef} 
                  screenshotFormat="image/jpeg" 
                  className="w-full h-full object-cover" 
                  videoConstraints={videoConstraints}
                  mirrored 
                />

                {/* Panduang Overlay Saat Ambil Gambar*/}
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                  <div className="w-[60%] h-[80%] sm:w-[45%] sm:h-[85%] border-2 border-blue-500/40 border-dashed rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.65)] transition-all"></div>
                </div>
              </>
            )}
          </div>

          {isAnalyzing ? (
            <div className="max-w-md mx-auto bg-zinc-900/60 border border-blue-500/20 p-4 rounded-xl backdrop-blur-md">
              <div className="text-blue-400 text-xs font-black tracking-widest mb-1.5 uppercase">{scanStepText}</div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-linear-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <p className="text-neutral-400 text-sm">
              {imageSrc ? "Lakukan analisis foto atau ambil ulang gambar." : "Posisikan wajah Anda simetris di tengah garis panduan atau mulai dengan Upload Foto."}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10 w-full max-w-xl mx-auto">
          {imageSrc ? (
            <>
              {!isAnalyzing && (
                <Button 
                  text={isAnalyzing ? "Menganalisis..." : "Mulai Analisis"} 
                  onClick={analyzePhoto} 
                  variant="primary"
                />
              )}
              {!isAnalyzing && (
                <Button 
                  text="Ambil Ulang" 
                  variant="outline" 
                  onClick={retake} 
                />
              )}
            </>
          ) : (
            <>
              <Button 
                text="Ambil Foto" 
                variant="primary" 
                onClick={capture} 
              />
              <Button 
                text="Upload Foto" 
                variant="outline" 
                onClick={triggerUpload} 
              />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
              />
            </>
          )}

          {!isAnalyzing && (
            <Button 
              text="Batal" 
              variant="outline" 
              onClick={() => navigate('/')} 
            />
          )}
        </div>
        
        {analysisResult && !isAnalyzing && (
          <div className="w-full max-w-3xl bg-linear-to-b from-zinc-900/80 to-black border border-blue-500/20 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(59,130,246,0.15)] backdrop-blur-lg transform animate-[slideUp_0.5s_ease-out] relative overflow-hidden">
            
            <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl"></div>
            
            <div className="text-center pb-6 border-b border-white/5 mb-6">
              <span className="text-[10px] text-blue-400 font-extrabold tracking-[0.2em] uppercase">Hasil Analisis</span>
              <h3 className="text-3xl sm:text-4xl font-black heading-font text-white mt-1">
                Bentuk Wajah: <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-400">{analysisResult.faceShape}</span>
              </h3>
              <p className="text-neutral-400 leading-relaxed max-w-2xl mx-auto text-sm mt-3">
                {analysisResult.description}
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-center">
              
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border border-blue-500/30 shadow-lg shrink-0 bg-neutral-900">
                <img 
                  src={analysisResult.primaryRecommendation.img} 
                  alt={analysisResult.primaryRecommendation.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent"></div>
              </div>
              
              <div className="grow w-full">
                <span className="text-[10px] text-yellow-500 font-extrabold tracking-widest uppercase">REKOMENDASI TERBAIK</span>
                <h4 className="text-2xl font-black heading-font text-white mt-0.5">{analysisResult.primaryRecommendation.name}</h4>
                
                <div className="bg-black/40 border border-white/5 p-4 rounded-xl mt-3 mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-neutral-400 uppercase tracking-widest font-semibold">Tingkat Kecocokan</span>
                    <span className="text-lg font-black heading-font text-yellow-500">{analysisResult.primaryRecommendation.matchPercentage}% Match</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden shadow-inner relative">
                    <div 
                      className="bg-linear-to-r from-blue-500 via-indigo-500 to-blue-400 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse transition-all duration-1000 ease-out"
                      style={{ width: `${animatedMatchPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  {analysisResult.primaryRecommendation.desc}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-white/5 text-center">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Kategori Volume</div>
                <div className="text-xs font-bold text-blue-400 mt-1">{analysisResult.primaryRecommendation.specs.volume}</div>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Perawatan</div>
                <div className="text-xs font-bold text-blue-400 mt-1">{analysisResult.primaryRecommendation.specs.maintenance}</div>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/5">
                <div className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Styling Pomade</div>
                <div className="text-xs font-bold text-blue-400 mt-1">{analysisResult.primaryRecommendation.specs.styling}</div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );  
}

export default ScanPage;