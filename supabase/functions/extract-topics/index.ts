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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "API-Schlüssel nicht konfiguriert" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const systemPrompt = `Du bist ein professioneller Redakteur für Sozialarbeit und Beratung. 
Analysiere das folgende Transkript eines Beratungsgesprächs und identifiziere die 5-7 wichtigsten Hauptthemen.

Formatiere jedes Thema als einen String mit diesem Muster:
"Thementitel: Kurze Beschreibung in 1-2 Sätzen."

Beispiele:
- "Cybermobbing und soziale Medien: Beleidigende Nachrichten über WhatsApp und Instagram führen zu emotionaler Belastung des Schülers."
- "Schulische Probleme: Verpasste Klassenarbeit durch Fehlinformationen von Mitschülern."
- "Familiäre Situation: Spannungen zwischen den Eltern werden als zusätzliche Belastung wahrgenommen."

Antworte NUR mit den Themen, keine Einleitung oder Erklärungen.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analysiere dieses Transkript und extrahiere 5-7 Hauptthemen:\n\n${transcript}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_topics",
              description: "Extrahiert die wichtigsten Themen aus einem Transkript",
              parameters: {
                type: "object",
                properties: {
                  topics: {
                    type: "array",
                    items: {
                      type: "string",
                      description: "Ein Thema im Format 'Titel: Beschreibung'"
                    },
                    minItems: 5,
                    maxItems: 7
                  }
                },
                required: ["topics"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_topics" } },
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
      console.error("Lovable AI error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Fehler bei der Themenextraktion" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const data = await response.json();
    console.log("Full AI response:", JSON.stringify(data, null, 2));
    
    // Extract topics from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall || toolCall.function?.name !== "extract_topics") {
      console.error("No tool call found in response");
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
      const functionArgs = JSON.parse(toolCall.function.arguments);
      topics = functionArgs.topics;
      
      if (!Array.isArray(topics) || topics.length === 0) {
        throw new Error("No valid topics array found");
      }
      
      console.log("Successfully extracted topics:", topics.length);
    } catch (parseError) {
      console.error("Error parsing topics:", parseError);
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
