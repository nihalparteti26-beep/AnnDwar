import React, { useState, useEffect } from 'react';
import { Database, Table, Code, Search, RefreshCw, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Language } from '../types';

interface MongoCompassViewerProps {
  lang: Language;
}

export const MongoCompassViewer: React.FC<MongoCompassViewerProps> = ({ lang }) => {
  const isHi = lang === 'hi';

  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('slots');
  const [documents, setDocuments] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'json' | 'table'>('json');
  const [queryFilter, setQueryFilter] = useState<string>('{}');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/compass/collections');
      const data = await res.json();
      if (data.collections) {
        setCollections(data.collections);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDocuments = async (collName: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/compass/collection/${collName}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setDocuments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      fetchDocuments(selectedCollection);
    }
  }, [selectedCollection]);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/compass/collection/${selectedCollection}/${id}`, {
        method: 'DELETE',
      });
      fetchDocuments(selectedCollection);
      fetchCollections();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#13aa52] text-white flex items-center justify-center font-bold text-sm">
              🍃
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#143425] tracking-tight">
              MongoDB Compass • MERN डेटाबेस एक्सप्लोरर
            </h2>
          </div>
          <p className="text-xs text-[#4f705f] font-mono mt-0.5">
            mongodb://localhost:27017/anndwar_production
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#f0faf3] border border-[#b2e2c4] px-3 py-1.5 rounded-xl text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#13aa52] animate-pulse"></span>
          <span className="font-semibold text-[#13aa52]">Connected: MongoDB v7.0</span>
        </div>
      </div>

      {/* Main Compass Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sidebar Collections (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-[#d2dfd6] rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-bold text-[#557766] uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>COLLECTIONS ({collections.length})</span>
            <button onClick={fetchCollections} className="hover:text-[#13aa52] cursor-pointer">
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1">
            {collections.map((c) => {
              const isSelected = selectedCollection === c.name;
              return (
                <button
                  key={c.name}
                  onClick={() => setSelectedCollection(c.name)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[#1b4d3e] text-white font-bold shadow-2xs'
                      : 'text-[#2e4d3c] hover:bg-[#edf5f0]'
                  }`}
                >
                  <span className="font-mono">{c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#eef5f1] text-[#557766]'
                  }`}>
                    {c.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Collection Documents View (9 cols) */}
        <div className="lg:col-span-9 flex flex-col gap-3">
          {/* Compass Query Filter Bar */}
          <div className="bg-white border border-[#d2dfd6] rounded-2xl p-3 shadow-xs flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#557766] font-mono px-2">
              <Search className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>
            <input
              type="text"
              value={queryFilter}
              onChange={(e) => setQueryFilter(e.target.value)}
              className="flex-1 font-mono text-xs bg-[#f8faf8] border border-[#dbe6df] rounded-lg px-3 py-1.5 text-[#143425] focus:outline-none focus:ring-1 focus:ring-[#13aa52]"
            />
            <button
              onClick={() => fetchDocuments(selectedCollection)}
              className="bg-[#13aa52] hover:bg-[#0f8b42] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Find
            </button>

            <div className="flex items-center gap-1 border-l border-[#e2eae4] pl-2">
              <button
                onClick={() => setViewMode('json')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'json' ? 'bg-[#1b4d3e] text-white' : 'text-[#557766] hover:bg-[#edf5f0]'
                }`}
                title="JSON View"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-[#1b4d3e] text-white' : 'text-[#557766] hover:bg-[#edf5f0]'
                }`}
                title="Table View"
              >
                <Table className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Document list */}
          <div className="bg-white border border-[#d2dfd6] rounded-2xl p-4 shadow-xs min-h-[380px] overflow-y-auto">
            <div className="flex items-center justify-between text-xs text-[#557766] pb-2 mb-3 border-b border-[#edf3ee]">
              <span className="font-mono font-bold text-[#143425]">
                {selectedCollection} ({documents.length} documents)
              </span>
              <span>{isLoading ? 'Querying MongoDB...' : 'Query matched: 100%'}</span>
            </div>

            {viewMode === 'json' ? (
              <div className="space-y-3">
                {documents.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="bg-[#f9fbf9] border border-[#d8e6dd] rounded-xl p-3.5 text-xs font-mono relative group"
                  >
                    <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#e5eee8]">
                      <span className="text-[#13aa52] font-bold">
                        _id: ObjectId("{doc.id || doc._id || idx}")
                      </span>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-[#c62828] hover:text-[#b71c1c] text-[11px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                    <pre className="text-[#183a29] whitespace-pre-wrap overflow-x-auto text-[11px] leading-relaxed">
                      {JSON.stringify(doc, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#e0ece3] text-[#557766]">
                      <th className="pb-2">_id</th>
                      {documents[0] &&
                        Object.keys(documents[0])
                          .slice(1, 6)
                          .map((k) => <th key={k} className="pb-2">{k}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf3ee]">
                    {documents.map((doc, idx) => (
                      <tr key={doc.id || idx} className="hover:bg-[#f8faf8]">
                        <td className="py-2 text-[#13aa52] font-bold">{doc.id}</td>
                        {Object.keys(documents[0] || {})
                          .slice(1, 6)
                          .map((k) => (
                            <td key={k} className="py-2 text-[#2e4d3c] max-w-xs truncate">
                              {typeof doc[k] === 'object' ? JSON.stringify(doc[k]) : String(doc[k])}
                            </td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
