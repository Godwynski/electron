"use client";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { 
  Library, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  BookOpen,
  Hash,
  User as UserIcon,
  Archive,
  ChevronRight,
  Minus,
  AlertCircle,
  X,
  Loader2
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description: string | null;
  available_copies: number;
}

export default function CollectionsPage() {
  const { user, role, loading } = useAuth(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Book Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [description, setDescription] = useState("");
  const [copies, setCopies] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");

  const isAdmin = role === 'admin';
  const isStaff = role === 'staff' || isAdmin;

  const fetchBooks = useCallback(async () => {
    // setIsLoading(true);
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('title');
    
    if (error) console.error("Error fetching books:", error.message);
    else setBooks(data || []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!loading) {
        await fetchBooks();
      }
    };
    init();
  }, [loading, fetchBooks]);

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setErrorMsg("");

    const payload = {
      title,
      author,
      isbn,
      description,
      available_copies: copies
    };

    let error;
    if (editingBook) {
      // If staff, they can only update copies. If admin, they can update everything.
      // The RLS handles the permission, so we just try.
      const { error: err } = await supabase
        .from('books')
        .update(payload)
        .eq('id', editingBook.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('books')
        .insert(payload);
      error = err;
    }

    if (error) {
       setErrorMsg(error.message);
       setIsUpdating(false);
    } else {
      await fetchBooks();
      setIsModalOpen(false);
      setIsUpdating(false);
      resetForm();
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) alert(error.message);
    else await fetchBooks();
  };

  const updateCopies = async (id: string, newCount: number) => {
    if (newCount < 0) return;
    const { error } = await supabase
      .from('books')
      .update({ available_copies: newCount })
      .eq('id', id);
    
    if (error) alert(error.message);
    else await fetchBooks();
  };

  const resetForm = () => {
    setTitle("");
    setAuthor("");
    setIsbn("");
    setDescription("");
    setCopies(1);
    setEditingBook(null);
    setErrorMsg("");
  };

  const openModal = (book: Book | null = null) => {
    if (book) {
      setEditingBook(book);
      setTitle(book.title);
      setAuthor(book.author);
      setIsbn(book.isbn);
      setDescription(book.description || "");
      setCopies(book.available_copies);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleBorrow = async (bookId: string) => {
    if (!user) return;
    setIsUpdating(true);
    const { error } = await supabase
      .from('borrow_requests')
      .insert({
        book_id: bookId,
        user_id: user.id,
        status: 'pending'
      });

    if (error) {
      if (error.code === '23505') {
        alert("You already have a pending request for this book.");
      } else {
        alert(error.message);
      }
    } else {
      alert("Borrow request submitted successfully!");
      await fetchBooks();
    }
    setIsUpdating(false);
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading || isLoading) {
     return (
       <div className="flex items-center justify-center min-h-[60vh]">
         <div className="w-8 h-8 rounded-full border-t-2 border-primary-500 animate-spin" />
       </div>
     );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif font-semibold text-slate-800 tracking-tight">Library Collection</h1>
          <p className="text-slate-500 mt-2 font-sans tracking-wide">Browse and manage available books in the archives.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search title, author, or ISBN..."
               className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none w-72 shadow-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           {isAdmin && (
             <button 
               onClick={() => openModal()}
               className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/25 text-sm font-medium"
             >
               <Plus className="w-4 h-4" />
               New Book
             </button>
           )}
        </div>
      </div>

      {/* Stats Summary */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="p-3.5 bg-primary-50 text-primary-600 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Titles</p>
              <h4 className="text-2xl font-bold text-slate-800 mt-0.5">{books.length}</h4>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Available Copies</p>
              <h4 className="text-2xl font-bold text-slate-800 mt-0.5">{books.reduce((acc, b) => acc + b.available_copies, 0)}</h4>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 font-serif italic text-slate-600 text-sm">
            “The only thing that you absolutely have to know, is the location of the library.” — Albert Einstein
          </div>
        </div>
      )}

      {/* Book Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredBooks.map((book, i) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={book.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden group hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300"
            >
              <div className="p-7 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  {(isAdmin || isStaff) && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => openModal(book)}
                        className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-serif font-bold text-slate-800 line-clamp-1">{book.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5 text-slate-500 text-sm">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>{book.author}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-slate-400 text-xs font-mono uppercase tracking-wider">
                    <Hash className="w-3 h-3" />
                    <span>{book.isbn}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-0.5">Availability</p>
                    <div className="flex items-center gap-3">
                      {isStaff ? (
                        <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-100">
                          <button 
                            onClick={() => updateCopies(book.id, book.available_copies - 1)}
                            className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-slate-400 hover:text-slate-600"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-slate-700">{book.available_copies}</span>
                          <button 
                            onClick={() => updateCopies(book.id, book.available_copies + 1)}
                            className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-slate-400 hover:text-slate-600"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${book.available_copies > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600 underline decoration-red-200'}`}>
                          {book.available_copies > 0 ? `${book.available_copies} Copies` : 'Checked Out'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {book.available_copies > 0 ? (
                    <button 
                      onClick={() => handleBorrow(book.id)}
                      className="flex items-center gap-2 text-primary-600 text-sm font-semibold hover:gap-3 transition-all group-hover:text-primary-500"
                    >
                      Borrow Now
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button className="text-slate-300 text-xs font-medium cursor-not-allowed">
                      Waitlist Open
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Book Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-50 rounded-xl">
                      <Library className="w-5 h-5 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-slate-800 tracking-tight">
                      {editingBook ? 'Edit Book Entry' : 'Archive New Book'}
                    </h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
                    </div>
                )}

                <form onSubmit={handleSaveBook} className="space-y-6">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Book Title</label>
                      <input 
                        type="text" required
                        placeholder="e.g. The Pragmatic Programmer"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all shadow-sm"
                        value={title} onChange={(e) => setTitle(e.target.value)}
                        disabled={!isAdmin}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Author Name</label>
                      <input 
                        type="text" required
                        placeholder="Andrew Hunt"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 outline-none focus:border-primary-500 transition-all shadow-sm"
                        value={author} onChange={(e) => setAuthor(e.target.value)}
                        disabled={!isAdmin}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">ISBN/Serial</label>
                      <input 
                        type="text" required
                        placeholder="978-0135957059"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 placeholder-slate-400 outline-none focus:border-primary-500 transition-all shadow-sm"
                        value={isbn} onChange={(e) => setIsbn(e.target.value)}
                        disabled={!isAdmin}
                      />
                    </div>
                    <div className="col-span-2">
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Copies in Circulation</label>
                       <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <button 
                            type="button"
                            onClick={() => setCopies(Math.max(0, copies - 1))}
                            className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-100 hover:text-primary-500 transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="flex-1 text-center font-bold text-slate-800 text-lg">{copies}</span>
                          <button 
                            type="button"
                            onClick={() => setCopies(copies + 1)}
                            className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm border border-slate-100 hover:text-primary-500 transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                    >
                      Dismiss
                    </button>
                    <button 
                      disabled={isUpdating}
                      type="submit"
                      className="flex-1 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2"
                    >
                      {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingBook ? 'Record Changes' : 'Confirm Archive')}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
