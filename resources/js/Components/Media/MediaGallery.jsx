import React, { useState, useEffect } from 'react';
import { X, Search, Check, Upload, Image as ImageIcon, Trash2, Loader2, Camera } from 'lucide-react';

export default function MediaGallery({ isOpen, onClose, onSelect, type = 'images', title = 'Media Gallery' }) {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [view, setView] = useState('grid'); // 'grid' or 'upload'
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchMedia();
        }
    }, [isOpen, type]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/media?type=${type}`);
            const data = await response.json();
            setMedia(data);
        } catch (error) {
            console.error('Error fetching media:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMedia = media.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/80" onClick={onClose}></div>
            
            <div className="relative z-10 w-full max-w-4xl rounded-2xl sm:rounded-[3rem] bg-white shadow-2xl flex flex-col overflow-hidden"
                 style={{ height: 'min(85vh, 100%)' }}>

                {/* Header */}
                <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {type === 'images' ? 'Background Visuals' : 'Item Icons'} • {media.length} items
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 sm:p-3 bg-slate-50 text-slate-400 rounded-xl sm:rounded-2xl">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="px-4 sm:px-8 py-3 sm:py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3 shrink-0">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input 
                            type="text"
                            placeholder="Search assets..."
                            className="w-full pl-9 pr-3 py-2.5 bg-white border-none rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* View tabs */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <button 
                            onClick={() => setView('grid')}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}
                        >
                            Gallery
                        </button>
                        <button 
                            onClick={() => setView('upload')}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${view === 'upload' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}
                        >
                            Upload
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 no-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Scanning Assets...</p>
                        </div>
                    ) : view === 'grid' ? (
                        filteredMedia.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
                                {filteredMedia.map((item) => (
                                    <div 
                                        key={item.path}
                                        onClick={() => setSelected(item)}
                                        className={`group relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer border-2 ${selected?.path === item.path ? 'border-blue-600 shadow-lg' : 'border-transparent'}`}
                                    >
                                        <img 
                                            src={item.url} 
                                            className="w-full h-full object-cover" 
                                            alt={item.name} 
                                        />
                                        
                                        {selected?.path === item.path && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-blue-600/30">
                                                <div className="bg-blue-600 text-white p-2 rounded-xl shadow-xl">
                                                    <Check className="w-4 h-4 stroke-[3]" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100">
                                            <p className="text-[8px] font-black text-white truncate uppercase tracking-widest">{item.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-40 space-y-4">
                                <ImageIcon className="w-16 h-16 text-slate-300" />
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Library is Empty</p>
                            </div>
                        )
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center">
                            <div className="w-full max-w-sm">
                                <div className="w-full aspect-video rounded-2xl sm:rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-4 relative">
                                    <div className="bg-white p-4 rounded-2xl shadow-lg">
                                        <Camera className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                                    </div>
                                    <div className="text-center px-6">
                                        <p className="text-base sm:text-xl font-black text-slate-900">Push to Gallery</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                                            Asset instantly available for all menu items
                                        </p>
                                    </div>
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) onSelect(file);
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Selection Bar */}
                {selected && view === 'grid' && (
                    <div className="px-4 sm:px-8 py-3 sm:py-5 border-t border-slate-100 bg-white shrink-0">
                        <div className="flex items-center gap-3">
                            {/* Thumbnail */}
                            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl overflow-hidden shadow border-2 border-white shrink-0">
                                <img src={selected.url} className="w-full h-full object-cover" />
                            </div>
                            {/* Name */}
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-slate-900 truncate">{selected.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Asset</p>
                            </div>
                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                                <button 
                                    onClick={() => setSelected(null)}
                                    className="px-3 py-2.5 rounded-xl text-[10px] font-black uppercase border border-slate-100 text-slate-400"
                                >
                                    Clear
                                </button>
                                <button 
                                    onClick={() => onSelect(selected.path)}
                                    className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow hover:bg-blue-700"
                                >
                                    Use Asset
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
