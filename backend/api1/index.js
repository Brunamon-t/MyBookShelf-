const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");

// Inicializa o Admin do Firebase
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// ==========================================================
// CONFIGURAÇÃO DA IA (OPENROUTER)
// Substitui pelo teu código de API da OpenRouter
const OPENROUTER_API_KEY = "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";
// ==========================================================

/**
 * MICROSERVIÇO 1: SERVICE_CATALOG
 * Integração síncrona com a Google Books API
 */
exports.service_catalog = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Utilizador não autenticado.");
  }

  const query = request.data.query || "Harry Potter";

  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`
    );

    const items = response.data.items || [];

    // Normalização de Dados (Domain Layer)
    return items.map((book) => {
      const info = book.volumeInfo || {};
      return {
        id: book.id,
        title: info.title || "Sem Título",
        thumbnail: info.imageLinks?.thumbnail || "https://via.placeholder.com/150x200?text=Sem+Capa",
        description: info.description || "Sem descrição disponível.",
        authors: info.authors || ["Autor desconhecido"]
      };
    });
  } catch (error) {
    console.error("Erro no Catálogo:", error.message);
    throw new HttpsError("internal", "Falha ao comunicar com o Catálogo Global.");
  }
});

/**
 * MICROSERVIÇO 2: SERVICE_RECOMMENDATION
 * Integração síncrona com IA via OpenRouter (Gateway de LLMs)
 */
exports.service_recommendation = onCall({ cors: true }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login necessário para recomendações.");
  }

  const myBooks = request.data.books || [];
  
  if (myBooks.length === 0) {
    return { suggestion: "A tua estante está vazia. Adiciona livros para a IA te conhecer!" };
  }

  // Prepara a lista de títulos para enviar à IA
  const listaTitulos = myBooks.map(b => b.title).join(", ");

  try {
    // Chamada à API Externa (Infrastructure Layer)
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "user",
            content: `Eu li estes livros: [${listaTitulos}]. Com base no estilo deles, sugere-me APENAS UM livro novo e explica porquê numa frase curta. Responde em Português de Portugal.`
          }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Valor Acrescentado: Resposta da IA processada
    const sugestaoIA = response.data.choices[0].message.content;
    return { suggestion: sugestaoIA };

  } catch (error) {
    console.error("Erro na Integração IA:", error.response?.data || error.message);
    
    // Fallback: Se a IA falhar, o sistema mantém-se funcional (Gestão de Risco)
    return { suggestion: "A IA está a processar muitos pedidos. Tenta de novo em instantes!" };
  }
});