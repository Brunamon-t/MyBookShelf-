import React, { useState, useEffect } from 'react';
import { httpsCallable } from "firebase/functions";
import { auth, provider, db, functions } from './firebase';
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

  // --- NOVOS ESTADOS PARA A IA ---
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

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

  const searchBooks = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const serviceCatalog = httpsCallable(functions, 'service_catalog');
      const result = await serviceCatalog({ query: searchQuery });
      setSearchResults(result.data || []);
    } catch (error) {
      console.error("Erro no Service_Catalog:", error);
      alert("O catálogo está indisponível.");
    }
  };

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
      alert("Livro adicionado à estante!");
    } catch (e) {
      console.error("Erro ao guardar:", e);
    }
  };

  const saveReview = async () => {
    if (!selectedBook || !selectedBook.id) return;
    try {
      const bookRef = doc(db, "library", selectedBook.id);
      await updateDoc(bookRef, { rating, review: reviewText });
      setSelectedBook(null); 
      alert("Avaliação guardada!");
    } catch (e) { console.error(e); }
  };

  const removeBook = async (bookId) => {
    if (window.confirm("Queres mesmo tirar este livro da tua estante?")) {
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
          <button className="btn-google" onClick={() => signInWithPopup(auth, provider)}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
              alt="Google Logo" 
              className="google-icon"
            />
            Entrar com Google
          </button>
        </div>
      ) : (
        <div className="main-content">
          <div className="user-bar">
            <span>Olá, <strong>{user.displayName}</strong>!</span>
            <button className="btn-logout" onClick={() => signOut(auth)} style={{ marginLeft: '10px' }}>Sair</button>
          </div>

          <hr />

          <section className="shelf-section">
            <h2>A Minha Estante Pessoal</h2>

            {/* --- BLOCO DA IA COM AS NOVAS CLASSES --- */}
            <div className="ai-box">
              <button 
                className="btn-main-ai" 
                onClick={getAiRecommendation} 
                disabled={loadingAI}
              >
                {loadingAI ? "✨ A processar..." : "✨ Sugestão da IA"}
              </button>
              {aiSuggestion && (
                <div className="ai-text-bubble">
                  <p>"{aiSuggestion}"</p>
                </div>
              )}
            </div>

            <div className="shelf-white">
              {myLibrary.length === 0 ? <p>Estante vazia.</p> : myLibrary.map(item => (
                <div key={item.id} className="book-item" style={{ cursor: 'pointer' }} 
                    onClick={() => { setSelectedBook(item); setReviewText(item.review || ""); setRating(item.rating || 0); }}>
                  <img src={item.thumbnail} alt="capa" />
                  <p className="book-title-mini">{item.title}</p>
                  {item.rating > 0 && <span className="star-badge">⭐ {item.rating}</span>}
                </div>
              ))}
            </div>
          </section>

          <hr />

          <section className="search-area">
            <h3>Pesquisar Catálogo Global</h3>
            <form onSubmit={searchBooks}>
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Procurar novos livros..." 
              />
              <button type="submit" className="btn-main">Procurar</button>
            </form>

            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
              {searchResults.map((book) => (
                <div key={book.id} style={{ margin: '15px', width: '130px' }}>
                  <img 
                    src={book.thumbnail} 
                    alt="capa" 
                    style={{ width: '90px', cursor: 'pointer' }} 
                    onClick={() => { setSelectedBook({...book, id: null}); setReviewText(""); setRating(0); }}
                  />
                  <p style={{ fontSize: '11px' }}>{book.title}</p>
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
            <button className="modal-close" onClick={() => setSelectedBook(null)}>×</button>
            
            <div className="modal-body">
              <div className="modal-left">
                <img src={selectedBook.thumbnail} alt="Capa" />
              </div>

              <div className="modal-right">
                <h2>{selectedBook.title}</h2>
                <p className="modal-author">Por: {selectedBook.authors?.join(", ")}</p>
                <div className="modal-description">
                  <p>{selectedBook.description}</p>
                </div>
              </div>
            </div>

            {selectedBook.id && (
              <div className="review-box">
                <hr />
                <p className="review-label">A tua avaliação:</p>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(s => (
                    <span key={s} className={s <= rating ? "star-on" : "star-off"} onClick={() => setRating(s)}>★</span>
                  ))}
                </div>
                <textarea 
                  value={reviewText} 
                  onChange={(e) => setReviewText(e.target.value)} 
                  placeholder="Escreve aqui a tua opinião pessoal..." 
                />
                <button className="btn-save" onClick={saveReview}>Guardar Notas</button>
                <button className="btn-delete-text" onClick={() => removeBook(selectedBook.id)}>
                  Remover da Estante
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
