import React, { useState, useEffect } from 'react';
import { auth, provider, db, functions } from './firebase'; 
import { httpsCallable } from "firebase/functions";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  deleteDoc 
} from "firebase/firestore";
import './App.css'; 


function App() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [myLibrary, setMyLibrary] = useState([]);
  
  const [selectedBook, setSelectedBook] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);

  const [aiSuggestion, setAiSuggestion] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSignIn = async () => {
    if (isLoggingIn) return; // Prevenir múltiplos cliques simultaneamente
    
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      // auth/cancelled-popup-request é normal quando o usuário cancela
      // Outros erros serão logados
      if (error.code !== 'auth/cancelled-popup-request') {
        console.error("Erro no login:", error);
        alert("Erro ao fazer login. Tenta novamente.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const q = query(collection(db, "library"), where("userId", "==", currentUser.uid));
        onSnapshot(q, (snapshot) => {
          setMyLibrary(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
        });
      }
    });
    return () => unsub();
  }, []);

  // --- PESQUISA DIRETA COM PROXY (Resolve o bloqueio do browser) ---
  const searchBooks = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      // Usamos o link direto da Google. Se falhar, o alert avisa.
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.items) {
        const formatted = data.items.map((book) => ({
          id: book.id,
          title: book.volumeInfo.title || "Sem Título",
          thumbnail: book.volumeInfo.imageLinks?.thumbnail || "https://via.placeholder.com/150x200?text=Sem+Capa",
          description: book.volumeInfo.description || "Sem descrição disponível.",
          authors: book.volumeInfo.authors || ["Autor desconhecido"]
        }));
        setSearchResults(formatted);
      } else {
        alert("Nenhum livro encontrado para essa pesquisa.");
      }
    } catch (error) {
      alert("Erro de conexão. Tenta pesquisar 'Harry' ou outro termo comum.");
    }
  };
<<<<<<< HEAD


  const getAiRecommendation = async () => {
    if (myLibrary.length === 0) {
      alert("Adiciona alguns livros primeiro para a IA te conhecer!");
      return;
    }
    setLoadingAI(true);
    try {
      const serviceRecommendation = httpsCallable(functions, 'service_recommendation');
      const result = await serviceRecommendation({ books: myLibrary });
      setAiSuggestion(result.data.suggestion);
    } catch (error) {
      console.error("Erro na IA:", error);
      alert("A IA está a descansar um pouco. Tenta mais tarde!");
    } finally {
      setLoadingAI(false);
    }
  };

=======
const getAiRecommendation = async () => {
  if (myLibrary.length === 0) {
    alert("Adiciona livros para a IA analisar!");
    return;
  }
  
  setLoadingAI(true);
  try {
    // Chamada real para o teu microserviço no Backend
    const serviceRecommendation = httpsCallable(functions, 'service_recommendation');
    
    // Enviamos a tua biblioteca para o Backend processar
    const result = await serviceRecommendation({ books: myLibrary });
    
    // O resultado vem direto do Gemini via OpenRouter
    setAiSuggestion(result.data.suggestion);
  } catch (error) {
    console.error("Erro real na chamada AI:", error);
    const detail = error?.message || error?.code || 'erro desconhecido';
    setAiSuggestion(`Erro IA: ${detail}. Verifica a consola e se a função foi implementada.`);
  } finally {
    setLoadingAI(false);
  }
};
>>>>>>> c8c1be6
  const addToLibrary = async (book) => {
    try {
      await addDoc(collection(db, "library"), {
        userId: user.uid,
        title: book.title,
        thumbnail: book.thumbnail,
        description: book.description || "Sem descrição disponível.",
        authors: book.authors || ["Autor desconhecido"],
        rating: 0,
        review: "",
        addedAt: new Date()
      });
      alert("Adicionado!");
    } catch (e) { console.error(e); }
  };

  const saveReview = async () => {
    if (!selectedBook?.id) return;
    try {
      await updateDoc(doc(db, "library", selectedBook.id), { rating, review: reviewText });
      setSelectedBook(null); 
      alert("Guardado!");
    } catch (e) { console.error(e); }
  };

  const removeBook = async (bookId) => {
    if (window.confirm("Remover da estante?")) {
      try {
        await deleteDoc(doc(db, "library", bookId));
        setSelectedBook(null);
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>MyBookShelf API 📚</h1>
        <p className="app-slogan">A tua estante virtual, o teu próximo capítulo.</p>
      </header>

      {!user ? (
        <div className="login-area">
          <button className="btn-google" onClick={handleSignIn} disabled={isLoggingIn}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="G" className="google-icon" />
            {isLoggingIn ? "A conectar..." : "Entrar com Google"}
          </button>
        </div>
      ) : (
        <div className="main-content">
          <div className="user-bar">
            <span>Olá, <strong>{user.displayName}</strong>!</span>
            <button className="btn-logout" onClick={() => signOut(auth)}>Sair</button>
          </div>

          <section className="shelf-section">
            <h2>A Minha Estante Pessoal</h2>
            <div className="ai-box">
              <button className="btn-main-ai" onClick={getAiRecommendation} disabled={loadingAI}>
                {loadingAI ? "✨ A processar..." : "✨ Sugestão da IA"}
              </button>
              {aiSuggestion && <div className="ai-text-bubble"><p>{aiSuggestion}</p></div>}
            </div>

            <div className="shelf-white">
              {myLibrary.length === 0 ? <p>Estante vazia.</p> : myLibrary.map(item => (
                <div key={item.id} className="book-item" onClick={() => { setSelectedBook(item); setReviewText(item.review || ""); setRating(item.rating || 0); }}>
                  <img src={item.thumbnail} alt="capa" />
                  <p className="book-title-mini">{item.title}</p>
                  {item.rating > 0 && <span className="star-badge">⭐ {item.rating}</span>}
                </div>
              ))}
            </div>
          </section>

          <section className="search-area">
            <h3>Pesquisar Catálogo Global</h3>
            <form onSubmit={searchBooks}>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Procurar novos livros..." />
              <button type="submit" className="btn-main">Procurar</button>
            </form>
            <div className="results-grid" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {searchResults.map((book) => (
                <div key={book.id} className="search-result-item" style={{ margin: '10px', width: '120px' }}>
                  <img src={book.thumbnail} alt="capa" style={{ width: '80px', cursor: 'pointer' }} onClick={() => { setSelectedBook({...book, id: null}); setReviewText(""); setRating(0); }} />
                  <p style={{ fontSize: '10px' }}>{book.title}</p>
                  <button className="btn-add" onClick={() => addToLibrary(book)}>+ Adicionar</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {selectedBook && (
        <div className="modal-overlay" onClick={() => setSelectedBook(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-body">
              <div className="modal-left"><img src={selectedBook.thumbnail} alt="Capa" /></div>
              <div className="modal-right">
                <h2>{selectedBook.title}</h2>
                <p>Por: {selectedBook.authors?.join(", ")}</p>
                <div className="modal-description"><p>{selectedBook.description}</p></div>
              </div>
            </div>
            {selectedBook.id && (
              <div className="review-box">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className={s <= rating ? "star-on" : "star-off"} onClick={() => setRating(s)}>★</span>
                  ))}
                </div>
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Tua opinião..." />
                <button className="btn-save" onClick={saveReview}>Guardar</button>
                <button className="btn-delete-text" onClick={() => removeBook(selectedBook.id)}>Remover</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default App;