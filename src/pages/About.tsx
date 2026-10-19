import { useState, useEffect } from "react";
import { ArrowLeft, Brain, Eye, Cpu, ImageIcon, MessageSquare, Sparkles, BookOpen, Utensils } from "lucide-react";
import { Link } from "react-router-dom";
import { PipelineStatus } from "@/components/kitchen/PipelineStatus";
import { PipelineInfo } from "@/types/kitchen";

const concepts = [
  {
    icon: Eye,
    title: "Computer Vision (Image Recognition)",
    description: "The system uses vision-language models to analyze uploaded food images, identifying individual ingredients from complex scenes with varying lighting, angles, and occlusion."
  },
  {
    icon: ImageIcon,
    title: "Image Captioning (BLIP / CLIP-like)",
    description: "A caption is generated describing the contents of the uploaded image using a vision-language approach similar to BLIP (Bootstrapping Language-Image Pre-training) and CLIP (Contrastive Language–Image Pretraining)."
  },
  {
    icon: Brain,
    title: "Object Detection & Classification",
    description: "Multiple ingredients are detected and classified into categories (vegetable, fruit, protein, dairy, grain, spice) with confidence scores, mimicking multi-label object detection pipelines."
  },
  {
    icon: Cpu,
    title: "Multi-Modal AI (Vision + Language)",
    description: "The system fuses visual features from images with natural language input (voice/text) to produce richer, context-aware ingredient analysis and recipe recommendations."
  },
  {
    icon: MessageSquare,
    title: "Natural Language Processing (NLP)",
    description: "Voice input is transcribed and processed using NLP techniques to extract ingredient names, quantities, and preferences, which are then merged with visual detections."
  },
  {
    icon: Sparkles,
    title: "Confidence Scoring & Filtering",
    description: "Each detected ingredient is assigned a confidence score (0–1). Low-confidence detections (below 0.4) are filtered out, simulating non-maximum suppression and thresholding in detection pipelines."
  },
  {
    icon: BookOpen,
    title: "Recommendation System",
    description: "A recipe recommendation engine ranks recipes by ingredient match score, suggesting the most relevant dishes based on available ingredients — an application of content-based filtering."
  },
  {
    icon: Utensils,
    title: "Nutritional Estimation",
    description: "Per-ingredient and per-recipe nutritional data (calories, protein, fat, carbs, fiber) is estimated using knowledge-based inference, demonstrating structured data extraction from unstructured inputs."
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

        {/* Student Info */}
        <div className="glass-card rounded-3xl p-8 text-center space-y-2">
          <h1 className="text-3xl font-display font-bold text-gradient">Smart AI Kitchen Assistant</h1>
          <p className="text-lg text-foreground font-semibold">Sarah Cheulkar</p>
          <p className="text-muted-foreground">Roll No: 23102C0060</p>
        </div>

        {/* Project Overview */}
        <div className="glass-card rounded-3xl p-8 space-y-3">
          <h2 className="text-xl font-display font-bold text-foreground">Project Overview</h2>
          <p className="text-muted-foreground leading-relaxed">
            This project demonstrates the application of <span className="text-foreground font-medium">machine vision</span>, <span className="text-foreground font-medium">natural language processing</span>, and <span className="text-foreground font-medium">intelligent recommendation systems</span> in a real-world smart kitchen assistant. Users can upload food images or provide voice input, and the AI detects ingredients, generates captions, suggests recipes, and provides nutritional insights.
          </p>
        </div>

        {/* Deep Learning Pipeline Architecture */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold text-foreground">Deep Learning Pipeline Architecture</h2>
          <PipelineStatus pipeline={pipelineData} />
        </div>

      {/* Concepts */}
      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold text-foreground">Machine Vision & AI Concepts Used</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {concepts.map((c, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 space-y-2 hover:scale-[1.02] transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-cosmic flex items-center justify-center">
                  <c.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{c.title}</h3>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">{c.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
