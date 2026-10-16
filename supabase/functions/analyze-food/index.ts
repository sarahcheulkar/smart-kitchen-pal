import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, voiceIngredients } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY)
      throw new Error("LOVABLE_API_KEY not configured");

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
  "recipes": [...],
  "nutritionPerIngredient": [...]
}

Rules:
- Detect ALL visible ingredients
- Filter confidence < 0.4
- Suggest 4-6 recipes
- Include steps, tips, nutrition`
      }
    ];

    if (imageBase64) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: voiceIngredients
              ? `Analyze image + voice: ${voiceIngredients}`
              : "Analyze this food image"
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
        content: `User has: ${voiceIngredients}`
      });
    } else {
      return new Response(
        JSON.stringify({ error: "No image or ingredients provided" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
      }
    );

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";

    content = content.replace(/```json/g, "").replace(/```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      throw new Error("Invalid AI response");
    }

    // ===============================
    // 🔥 HYBRID AI LOGIC (CLIP + BLIP STYLE)
    // ===============================

    const apiIngredients =
      parsed.ingredients?.map((i: any) => i.name) || [];

    // 🔹 Simulated CLIP (top confident items)
    const clipIngredients = apiIngredients.slice(0, 2);

    // 🔹 BLIP-style (from caption)
    const caption = parsed.caption?.toLowerCase() || "";
    const keywords = [
      "bread",
      "tomato",
      "cheese",
      "onion",
      "egg",
      "rice",
      "chicken",
      "potato"
    ];

    const blipIngredients = keywords.filter((k) =>
      caption.includes(k)
    );

    // 🔹 Final fusion
    const finalIngredients = Array.from(
      new Set([...apiIngredients, ...clipIngredients, ...blipIngredients])
    );

    // 🔹 Attach hybrid output
    parsed.hybrid = {
      apiIngredients,
      clipIngredients,
      blipIngredients,
      finalIngredients
    };

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error" }),
      { status: 500, headers: corsHeaders }
    );
  }
});