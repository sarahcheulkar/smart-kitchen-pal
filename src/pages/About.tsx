import { useState, useEffect } from "react";
import { ArrowLeft, Brain, Eye, Cpu, ImageIcon, MessageSquare, Sparkles, BookOpen, Utensils, Clock, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { PipelineStatus } from "@/components/kitchen/PipelineStatus";
import { PipelineInfo } from "@/types/kitchen";

const featureModels = [
  {
    icon: Eye,
    feature: "Ingredient Detection & Spatial Localization",
    model: "Hybrid Vision Ensemble (CNN + Vision Transformer)",
    description: "Spatial coordinates [ymin, xmin, ymax, xmax] are localized using a convolutional feature backbone with Non-Maximum Suppression (NMS), coupled with a Vision Transformer (ViT) for zero-shot open-vocabulary ingredient classification and volumetric pixel density estimation."
  },
  {
    icon: BookOpen,
    feature: "Recipe Retrieval & Semantic Matching",
    model: "Dense Semantic RAG (ChromaDB + all-MiniLM-L6-v2)",
    description: "32+ recipes embedded into a ChromaDB vector database using 384-dimensional dense sentence embeddings and cosine similarity. Enhanced with token-level lemmatization and alias clustering (are_ingredients_matching) to guarantee a 100% match with zero missing ingredients."
  },
  {
    icon: Utensils,
    feature: "Nutritional Scaling & Macro Estimation",
    model: "USDA FoodData Central (FDC) Deterministic Engine",
    description: "Eliminates generative AI hallucinations by mapping detected items directly to USDA FoodData Central nutritional baselines. Macro and micro-nutrients are dynamically scaled based on the vision module's volumetric mass estimation (weight × nutrient per 100g)."
  },
  {
    icon: Sparkles,
    feature: "Dynamic Recipe Synthesis (Zero-Missing)",
    model: "Constrained Generative LLM Engine",
    description: "When pantry combinations are sparse or unique, a constrained culinary synthesis pipeline generates bespoke gourmet recipes restricted strictly to the user's available ingredients with zero hallucinated requirements."
  },
  {
    icon: Clock,
    feature: "Freshness & Shelf-Life Estimation",
    model: "Texture Degradation & Empirical Decay Curves",
    description: "Visual surface oxidation, color degradation, and moisture loss analysis cross-referenced against empirical perishability matrices under ambient (22°C) and refrigerated (4°C) conditions to prevent food spoilage."
  },
  {
    icon: Leaf,
    feature: "Sustainability & Carbon Footprint Tracking",
    model: "Life Cycle Assessment (LCA) / IPCC Factors",
    description: "Quantifies diverted greenhouse gas emissions (kg CO2e) and virtual water footprint saved by calculating category-specific environmental lifecycle coefficients for all detected ingredients."
  },
  {
    icon: MessageSquare,
    feature: "Voice Assistant & Multilingual Speech",
    model: "OpenAI Whisper (Speech-to-Text Transformer)",
    description: "End-to-end sequence-to-sequence audio encoder-decoder for multilingual voice command transcription and entity extraction, allowing hands-free kitchen interaction and pantry logging."
  },
  {
    icon: ImageIcon,
    feature: "Plating & Culinary Presentation",
    model: "Latent Diffusion Model (Stable Diffusion)",
    description: "Text-to-image latent diffusion conditioned on the generated recipe steps to render photorealistic plating visuals and chef presentation suggestions."
  }
];

const About = () => {
  const [pipelineData, setPipelineData] = useState<PipelineInfo | undefined>(undefined);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("latest_pipeline");
      if (saved) {
        setPipelineData(JSON.parse(saved));
      }
    } catch {
      // Ignore parse errors, fallback to default in PipelineStatus
    }
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10 space-y-10">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Kitchen
        </Link>

        {/* Project Team Info */}
        <div className="glass-card rounded-3xl p-8 text-center space-y-4">
          <h1 className="text-3xl font-display font-bold text-gradient">Smart AI Kitchen Assistant</h1>
          <p className="text-xs uppercase tracking-wider font-semibold text-primary">Project Team Members</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 hover:border-primary/40 transition-colors">
              <p className="font-semibold text-foreground text-sm">Sarah Cheulkar</p>
              <p className="text-xs font-mono text-muted-foreground mt-1">Roll No: 23102C0060</p>
            </div>
            <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 hover:border-primary/40 transition-colors">
              <p className="font-semibold text-foreground text-sm">Shreyas Shetty</p>
              <p className="text-xs font-mono text-muted-foreground mt-1">Roll No: 23102C0047</p>
            </div>
            <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 hover:border-primary/40 transition-colors">
              <p className="font-semibold text-foreground text-sm">Shruti Gupta</p>
              <p className="text-xs font-mono text-muted-foreground mt-1">Roll No: 23102C0051</p>
            </div>
          </div>
        </div>

        {/* Project Overview */}
        <div className="glass-card rounded-3xl p-8 space-y-3">
          <h2 className="text-xl font-display font-bold text-foreground">Project Overview</h2>
          <p className="text-muted-foreground leading-relaxed">
            This project demonstrates the application of a <span className="text-foreground font-medium">Hybrid Deep Learning Vision Ensemble</span>, <span className="text-foreground font-medium">Dense Semantic Retrieval-Augmented Generation (RAG)</span>, and <span className="text-foreground font-medium">deterministic USDA nutritional scaling</span> in a real-world smart kitchen assistant. Users can upload food images or provide voice input, and the AI detects ingredients, generates captions, suggests recipes with zero missing ingredients, and provides scientific sustainability and nutritional insights.
          </p>
        </div>

        {/* Deep Learning Pipeline Architecture */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold text-foreground">Deep Learning Pipeline Architecture</h2>
          <PipelineStatus pipeline={pipelineData} />
        </div>

        {/* Feature to Model Mapping */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">Feature-to-Model Deep Learning Architecture</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Direct technical mapping of each Smart Kitchen Pal feature to its underlying deep learning model, database, and algorithm.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {featureModels.map((c, i) => (
              <div key={i} className="glass-card rounded-2xl p-5 space-y-3 hover:scale-[1.01] transition-all border border-border/50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-cosmic flex items-center justify-center shrink-0 mt-0.5">
                    <c.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm leading-tight">{c.feature}</h3>
                    <div className="pt-0.5">
                      <span className="inline-block text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                        {c.model}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
