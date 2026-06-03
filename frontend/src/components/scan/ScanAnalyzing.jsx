import { useEffect, useState } from "react";
import {
  LoaderCircle,
  CheckCircle2,
  Brain,
  ImageIcon,
  Sparkles,
} from "lucide-react";

const STEPS = [
  {
    key: "upload",
    icon: CheckCircle2,
    label: "Gambar berhasil diunggah",
    desc: "File gambar diterima server dan siap diproses.",
  },
  {
    key: "preprocess",
    icon: ImageIcon,
    label: "Preprocessing gambar",
    desc: "AI menyesuaikan ukuran, kualitas, dan fitur visual.",
  },
  {
    key: "model",
    icon: LoaderCircle,
    label: "Menjalankan model AI",
    desc: "Model MobileNetV2 sedang mengidentifikasi kategori sampah.",
  },
  {
    key: "result",
    icon: Brain,
    label: "Menyiapkan hasil klasifikasi",
    desc: "AI akan menampilkan hasil dan rekomendasi terbaik.",
  },
];

const STEP_PROGRESS = {
  upload:     25,
  preprocess: 50,
  model:      75,
  result:     100,
};

const STEP_DELAYS = {
  upload:     400,
  preprocess: 600,
  model:      0,    // tunggu sampai ScanPage set step "result"
  result:     400,
};

const ScanAnalyzing = ({ imagePreview }) => {
  const [activeStep, setActiveStep] = useState("upload");

  useEffect(() => {
    const run = async () => {
      setActiveStep("upload");
      await delay(STEP_DELAYS.upload);

      setActiveStep("preprocess");
      await delay(STEP_DELAYS.preprocess);

      // Step model — berhenti di sini, ScanPage yang lanjutkan
      setActiveStep("model");
    };

    run();
  }, []);

  const progress = STEP_PROGRESS[activeStep] ?? 25;
  const stepKeys = STEPS.map((s) => s.key);
  const activeIdx = stepKeys.indexOf(activeStep);

  const getStepStatus = (key) => {
    const idx = stepKeys.indexOf(key);
    if (idx < activeIdx)  return "done";
    if (idx === activeIdx) return "loading";
    return "waiting";
  };

  return (
    <div className="flex justify-center py-16 px-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl border shadow-sm overflow-hidden">

        {/* IMAGE */}
        <div className="relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-87.5 object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white/90 flex items-center justify-center backdrop-blur-sm">
              <LoaderCircle className="w-12 h-12 text-emerald-600 animate-spin" />
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-8">

          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI Analysis Running
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mt-5">
              AI sedang menganalisis...
            </h2>
            <p className="text-slate-500 mt-3 leading-relaxed">
              Model AI sedang memproses gambar untuk mengenali jenis sampah
              dan menentukan rekomendasi terbaik.
            </p>
          </div>

          {/* PROGRESS BAR */}
          <div className="mt-8">
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-slate-500 mt-2">
              <span>Memproses gambar...</span>
              <span>{progress}%</span>
            </div>
          </div>

          {/* STEPS */}
          <div className="mt-8 bg-slate-50 border rounded-2xl p-5 space-y-4">
            {STEPS.map((step) => (
              <StepItem
                key={step.key}
                step={step}
                status={getStepStatus(step.key)}
              />
            ))}
          </div>

          <div className="mt-8 text-center text-sm text-slate-400">
            Biasanya proses membutuhkan 2–5 detik tergantung ukuran gambar.
          </div>
        </div>
      </div>
    </div>
  );
};

const StepItem = ({ step, status }) => {
  const Icon = step.icon;

  const iconWrapClass = {
    done:    "bg-emerald-100",
    loading: "bg-blue-100",
    waiting: "bg-slate-200",
  }[status];

  const iconClass = {
    done:    "text-emerald-600",
    loading: "text-blue-600",
    waiting: "text-slate-400",
  }[status];

  return (
    <div className={`flex items-start gap-3 ${status === "waiting" ? "opacity-50" : ""}`}>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconWrapClass}`}>
        {status === "done" ? (
          <CheckCircle2 className={`w-5 h-5 ${iconClass}`} />
        ) : (
          <Icon className={`w-5 h-5 ${iconClass} ${status === "loading" ? "animate-spin" : ""}`} />
        )}
      </div>
      <div>
        <p className="font-medium">{step.label}</p>
        <p className="text-sm text-slate-500 mt-1">{step.desc}</p>
      </div>
    </div>
  );
};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

export default ScanAnalyzing;