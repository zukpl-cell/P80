import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return json({ error: "Brak autoryzacji" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authorization } } },
    );
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) return json({ error: "Nieprawidłowa sesja" }, 401);

    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) return json({ error: "Brak OPENAI_API_KEY" }, 500);

    const { report, project, hardChecks } = await request.json();
    if (!report || !project || !hardChecks) return json({ error: "Niepełne dane wejściowe" }, 400);

    const prompt = buildPrompt(report, project, hardChecks);
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: Deno.env.get("OPENAI_MODEL") || "gpt-5-mini",
        input: prompt,
        max_output_tokens: 1200,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      console.error("OpenAI error", payload);
      return json({ error: "Analiza AI nie powiodła się" }, 502);
    }

    const outputText = extractOutputText(payload);
    const evaluation = parseEvaluation(outputText, hardChecks);
    return json({ evaluation });
  } catch (error) {
    console.error(error);
    return json({ error: "Błąd funkcji analizy" }, 500);
  }
});

function buildPrompt(report: unknown, project: unknown, hardChecks: unknown) {
  return `
Jesteś stanowczym trenerem odpowiedzialności w prywatnym Projekcie 80 kg Pawła.

ZASADY STYLU:
- Oceniasz decyzje i realizację planu, nigdy wartość człowieka.
- Nie używasz określeń „prawie”, „w sumie nieźle” ani pustego pocieszania.
- Jeżeli twarde reguły wskazują NIEDOWIEZIONE, nie wolno zmienić werdyktu na DOWIEZIONE.
- Po niedowiezieniu wskaż dokładny moment odejścia, prawdziwą przyczynę wynikającą z raportu i jedną korektę od następnej decyzji.
- Nie zalecaj głodówki, pomijania posiłków ani treningu za karę.
- Nie diagnozuj medycznie. Jeżeli raport zawiera narastający ból, wyraźnie większe promieniowanie, drętwienie, osłabienie albo problemy z pęcherzem/jelitami, dodaj krótką informację bezpieczeństwa.
- Pisz po polsku, konkretnie, maksymalnie 120 słów.

PARAMETRY PROJEKTU:
${JSON.stringify(project)}

TWARDE SPRAWDZENIA APLIKACJI:
${JSON.stringify(hardChecks)}

RAPORT DNIA:
${JSON.stringify(report)}

Zwróć wyłącznie poprawny JSON, bez markdownu, w formacie:
{
  "verdict": "DOWIEZIONE" albo "NIEDOWIEZIONE",
  "headline": "jedno bezpośrednie zdanie",
  "violations": ["konkretne odstępstwo"],
  "turning_point": "dokładny moment lub informacja, że nie było odstępstwa",
  "correction": "jedno działanie od następnej decyzji",
  "safety_note": "krótka informacja bezpieczeństwa"
}`.trim();
}

function extractOutputText(payload: any): string {
  if (typeof payload.output_text === "string") return payload.output_text;
  const chunks: string[] = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (typeof content.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n");
}

function parseEvaluation(text: string, fallback: any) {
  try {
    const cleaned = text.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start < 0 || end < start) throw new Error("Brak JSON");
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    return {
      verdict: parsed.verdict === "DOWIEZIONE" ? "DOWIEZIONE" : "NIEDOWIEZIONE",
      headline: String(parsed.headline || fallback.headline || ""),
      violations: Array.isArray(parsed.violations) ? parsed.violations.map(String) : fallback.violations || [],
      turning_point: String(parsed.turning_point || fallback.turning_point || ""),
      correction: String(parsed.correction || fallback.correction || ""),
      safety_note: String(parsed.safety_note || fallback.safety_note || ""),
    };
  } catch (error) {
    console.error("Invalid model output", text, error);
    return fallback;
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
