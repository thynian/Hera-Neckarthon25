import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript } = await req.json();
    
    if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Kein Transkript zum Analysieren vorhanden" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API-Schlüssel nicht konfiguriert" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const systemPrompt = `Du bist ein professioneller Redakteur. Deine Aufgabe ist es, aus dem folgenden Transkript die 5-7 wichtigsten Hauptthemen zu identifizieren.

Formatiere JEDES Thema als EINEN EINZIGEN String nach diesem Muster:
"Titel des Themas (z.B. 2-5 Wörter):\\nEine kurze Zusammenfassung dieses Themas in 1-2 Sätzen."

Stelle sicher, dass deine Antwort NUR ein JSON-Array dieser Strings ist und KEINEN anderen Text enthält.

Beispiel-Antwort:
[
  "Cybermobbing und soziale Medien:\\nBeleidigende Nachrichten über WhatsApp und Instagram führen zu emotionaler Belastung.",
  "Schulische Probleme:\\nVerpasste Klassenarbeit durch Fehlinformationen von Mitschülern.",
  "Familiäre Situation:\\nSpannungen zwischen den Eltern werden als zusätzliche Belastung wahrgenommen."
]`;

    const userPrompt = `Analysiere folgendes Transkript und extrahiere die 5-7 wichtigsten Hauptthemen:

${transcript}

Gib NUR das JSON-Array zurück, keine weiteren Erklärungen.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-mini-2025-08-07",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate-Limit überschritten. Bitte versuchen Sie es später erneut." }),
          { 
            status: 429, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Guthaben aufgebraucht. Bitte fügen Sie Guthaben zu Ihrem Workspace hinzu." }),
          { 
            status: 402, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Fehler bei der Themenextraktion" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("No content from OpenAI response");
      return new Response(
        JSON.stringify({ error: "Keine Themen extrahiert" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    let topics: string[];
    try {
      console.log("Raw content from OpenAI:", content);
      const parsed = JSON.parse(content);
      
      // Handle multiple formats:
      // 1. Direct array: ["topic1", "topic2"]
      // 2. Object with topics property: { topics: ["topic1", "topic2"] }
      // 3. Object with numbered keys: { "0": "topic1", "1": "topic2" }
      if (Array.isArray(parsed)) {
        topics = parsed;
      } else if (parsed.topics && Array.isArray(parsed.topics)) {
        topics = parsed.topics;
      } else if (typeof parsed === 'object' && parsed !== null) {
        // Convert object with numbered keys to array
        const values = Object.values(parsed);
        if (values.length > 0 && values.every(v => typeof v === 'string')) {
          topics = values as string[];
        } else {
          throw new Error("No valid topics found in object");
        }
      } else {
        throw new Error("Unexpected format");
      }
      
      if (!Array.isArray(topics) || topics.length === 0) {
        throw new Error("No valid topics array found");
      }
      
      console.log("Successfully extracted topics:", topics.length);
    } catch (parseError) {
      console.error("Error parsing topics:", parseError, "Content:", content);
      return new Response(
        JSON.stringify({ error: "Ungültiges Themenformat von der KI erhalten" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ topics }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Error in extract-topics function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unbekannter Fehler" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
