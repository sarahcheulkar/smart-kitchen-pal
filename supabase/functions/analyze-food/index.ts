import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, voiceIngredients } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const messages: any[] = [
      {
        role: "system",
        content: `You are a professional food and ingredient analysis AI. You must respond ONLY with valid JSON matching the schema below. No markdown, no explanation, just JSON.

Schema:
{
  "caption": "A natural language description of what's in the image",
  "ingredients": [
    {
      "name": "ingredient name",
      "confidence": 0.0-1.0,
      "category": "vegetable|fruit|protein|dairy|grain|spice|condiment|other"
    }
  ],
  "recipes": [
    {
      "name": "Recipe Name",
      "cuisine": "Indian|Italian|Chinese|Healthy|Mexican|American|Japanese|Mediterranean",
      "cookingTime": 15,
      "ingredients": ["ingredient1", "ingredient2"],
      "missingIngredients": ["missing1"],
      "matchScore": 0.0-1.0,
      "instructions": "Brief cooking instructions in 2-3 sentences",
      "nutrition": {
        "calories": 300,
        "protein": 15,
        "fat": 10,
        "carbs": 40,
        "fiber": 5
      }
    }
  ],
  "nutritionPerIngredient": [
    {
      "name": "ingredient name",
      "calories": 50,
      "protein": 3,
      "fat": 1,
      "carbs": 10
    }
  ]
}

Rules:
- Detect ALL visible ingredients, even partially visible ones
- Filter out detections with confidence below 0.4
- Suggest 4-6 diverse recipes from different cuisines
- Rank recipes by ingredient match score
- Be accurate with nutritional estimates
- If voice ingredients are provided, merge them with detected ingredients`
      }
    ];

    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: voiceIngredients
              ? `Analyze this food image. The user also mentioned these ingredients by voice: ${voiceIngredients}. Detect all ingredients in the image, merge with voice input, generate a caption, and suggest recipes. Return JSON only.`
              : "Analyze this food image. Detect all ingredients, generate a caption, and suggest recipes based on what you see. Return JSON only."
          },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
          }
        ]
      });
    } else if (voiceIngredients) {
      messages.push({
        role: "user",
        content: `The user has these ingredients: ${voiceIngredients}. Suggest recipes and provide nutritional analysis. Return JSON only.`
      });
    } else {
      return new Response(JSON.stringify({ error: "No image or ingredients provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    
    // Strip markdown code blocks if present
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid AI response format");
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-food error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
