const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");

if (admin.apps.length === 0) { admin.initializeApp(); }

const OPENROUTER_API_KEY = "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";

exports.service_catalog = onCall({ cors: true }, async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Utilizador não autenticado.");
  const query = request.data.query || "Harry Potter";
  try {
    const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
    const items = response.data.items || [];
    return items.map((book) => ({
      id: book.id,
      title: book.volumeInfo.title || "Sem Título",
      thumbnail: book.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/150x200?text=Sem+Capa",
      description: book.volumeInfo.description || "Sem descrição disponível.",
      authors: book.volumeInfo.authors || ["Autor desconhecido"]
    }));
  } catch (error) { throw new HttpsError("internal", "Erro no catálogo."); }
});

exports.service_recommendation = onCall({ cors: true }, async (request) => {
  console.log("service_recommendation chamado com auth:", !!request.auth);
  console.log("Dados recebidos:", request.data);

  if (!request.auth) throw new HttpsError("unauthenticated", "Login necessário.");

  const myBooks = request.data.books || [];
  const listaTitulos = myBooks.map(b => b.title).join(", ");

  console.log("Lista de títulos:", listaTitulos);

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: [{ role: "user", content: `Sugere 1 livro novo baseado em: [${listaTitulos}]. Responde em 1 frase curta em Português.` }]
      },
      { headers: { "Authorization": `Bearer ${OPENROUTER_API_KEY}`, "Content-Type": "application/json" } }
    );

    console.log("Resposta OpenRouter:", response.data);
    return { suggestion: response.data.choices[0].message.content };
  } catch (error) {
    console.error("Erro no service_recommendation:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw new HttpsError("internal", `Erro na IA: ${error.response?.data?.error?.message || error.message}`);
  }
});