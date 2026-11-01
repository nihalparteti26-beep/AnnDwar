import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Warehouse, 
  MapPin, 
  TrendingDown, 
  CheckCircle, 
  Plus, 
  Navigation, 
  Boxes, 
  ShieldCheck,
  Fuel,
  Users
} from 'lucide-react';
import { Language, LogisticsLoad, GodownStock } from '../types';

interface LogisticsAndGodownProps {
  lang: Language;
}

export const LogisticsAndGodown: React.FC<LogisticsAndGodownProps> = ({ lang }) => {
  const isHi = lang === 'hi';

  const [activeSubTab, setActiveSubTab] = useState<'logistics' | 'godown'>('logistics');
  const [loads, setLoads] = useState<LogisticsLoad[]>([]);
  const [stocks, setStocks] = useState<GodownStock[]>([]);
  const [isAddingStock, setIsAddingStock] = useState(false);
  const [newBags, setNewBags] = useState<number>(120);

  useEffect(() => {
    fetch('/api/logistics')
      .then((res) => res.json())
      .then((data) => setLoads(data))
      .catch((err) => console.error(err));

    fetch('/api/godown')
      .then((res) => res.json())
      .then((data) => setStocks(data))
      .catch((err) => console.error(err));
  }, []);

  const handleIntakeBags = (stockId: string) => {
    setStocks((prev) =>
      prev.map((s) => {
        if (s.id === stockId) {
          const addedQ = (newBags * 50) / 100;
          return {
            ...s,
            storedQuintals: s.storedQuintals + addedQ,
            bagCount: s.bagCount + newBags,
            lastStockEntry: 'अभी-अभी (Just Now)',
          };
        }
        return s;
      })
    );
    setIsAddingStock(false);
  };

  return (
    <div className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[#143425] tracking-tight">
              {isHi
                ? 'स्मार्ट लॉजिस्टिक्स एवं केंद्रीय वेयरहाउस'
                : 'Smart Logistics & Central Warehouse'}
            </h2>
            <span className="text-[10px] font-bold bg-[#e3f7ec] text-[#147437] border border-[#a8e3c1] px-2 py-0.5 rounded-full">
              {isHi ? 'लागत में 35% कटौती' : '35% Freight Saved'}
            </span>
          </div>
          <p className="text-xs text-[#4f705f] mt-0.5">
            {isHi
              ? 'समीपवर्ती किसानों के माल का समेकन (Consolidation) एवं गोदामों में डिजिटल स्टॉक प्रबंधन'
              : 'Small farmer load consolidation, route optimization, and digital silo inventory tracking'}
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center bg-[#edf5f0] p-1 rounded-xl border border-[#d2dfd6]">
          <button
            onClick={() => setActiveSubTab('logistics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'logistics'
                ? 'bg-[#1b4d3e] text-white shadow-xs'
                : 'text-[#355d47] hover:text-[#183a29]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>{isHi ? '🚛 लोड समेकन व रूट' : 'Logistics Route'}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('godown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'godown'
                ? 'bg-[#1b4d3e] text-white shadow-xs'
                : 'text-[#355d47] hover:text-[#183a29]'
            }`}
          >
            <Warehouse className="w-3.5 h-3.5" />
            <span>{isHi ? '🏢 गोदाम साइलो स्टॉक' : 'Godown Silo Stock'}</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Smart Load Consolidation */}
      {activeSubTab === 'logistics' && (
        <div className="space-y-6">
          {/* Highlights Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-[#d2dfd6] rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] text-[#1b7e45] flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#557766] block">परिवहन लागत बचत:</span>
                <span className="text-xl font-black text-[#113222]">₹4,800 / ट्रिप</span>
                <span className="text-[10px] text-[#1b7e45] block font-semibold">प्रति किसान ₹1,600 बचत</span>
              </div>
            </div>

            <div className="bg-white border border-[#d2dfd6] rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#eef7fe] text-[#1967d2] flex items-center justify-center shrink-0">
                <Fuel className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#557766] block">ईंधन एवं कार्बन कटौती:</span>
                <span className="text-xl font-black text-[#113222]">28 किमी बचत</span>
                <span className="text-[10px] text-[#1967d2] block font-semibold">इको-रूट ऑप्टिमाइजेशन</span>
              </div>
            </div>

            <div className="bg-white border border-[#d2dfd6] rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fef9f2] text-[#c96c21] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] text-[#557766] block">समेकित सक्रिय क्लस्टर:</span>
                <span className="text-xl font-black text-[#113222]">12 गांव</span>
                <span className="text-[10px] text-[#c96c21] block font-semibold">सामूहिक उपज परिवहन</span>
              </div>
            </div>
          </div>

          {/* Active Logistics Batches */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#143425]">
              {isHi ? 'सक्रिय समेकित वाहन रूट्स (Active Consolidated Routes)' : 'Active Consolidated Routes'}
            </h3>

            {loads.map((load) => (
              <div
                key={load.id}
                className="bg-white border border-[#d2dfd6] rounded-2xl p-4 sm:p-5 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#edf4ef]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[#143425]">
                      मार्ग: {load.destinationMandi}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#1b7e45] bg-[#e3f7ec] px-2 py-0.2 rounded border border-[#a8e3c1]">
                      {load.vehicleNumber} ({load.loadedQuintal}/{load.capacityQuintal} Q)
                    </span>
                    <span className="text-[10px] font-bold bg-[#faeedd] text-[#b85b14] px-2 py-0.2 rounded">
                      {load.liveStatus === 'in_transit' ? 'मार्ग में (In-Transit)' : load.liveStatus}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-[#1b7e45]">
                    ईंधन बचत: {load.fuelSavedPercent}% • {load.emptyTripsEliminated} खाली फेरे रोके
                  </div>
                </div>

                {/* Farmer stops */}
                <div className="mt-4">
                  <span className="text-[11px] font-semibold text-[#5c7a6b] block mb-2">
                    {isHi ? 'समेकित किसान पिकअप स्टॉप्स:' : 'Consolidated Farmer Pickups:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {load.farmerStops.map((f, idx) => (
                      <div
                        key={idx}
                        className="bg-[#f8faf8] border border-[#e2ede5] rounded-xl p-3 flex items-start justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-[#143425] block">
                            {idx + 1}. {f.farmerName}
                          </span>
                          <span className="text-[10.5px] text-[#557666] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#1b7e45]" />
                            <span>{f.village} • {f.pickupTime}</span>
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#1b7e45]">
                          {f.quintal} Q
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#edf4ef] flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="text-[#557766]">
                    चालक: {load.driverName} ({load.driverPhone})
                  </span>
                  <button
                    onClick={() => alert(`जीपीएस लोकेशन: ${load.destinationMandi} पर वाहन गति 38 किमी/घंटा`)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#1b4d3e] hover:underline cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#1b7e45]" />
                    <span>लाइव GPS ट्रैकिंग देखें</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Godown Silo Inventory */}
      {activeSubTab === 'godown' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-bold text-[#143425]">
              {isHi ? 'केंद्रीय साइलो व वेयरहाउस भंडारण स्थिति' : 'Central Warehouse & Silo Capacities'}
            </h3>
            <button
              onClick={() => setIsAddingStock(true)}
              className="bg-[#1b4d3e] hover:bg-[#153f33] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isHi ? 'नया स्टॉक दर्ज करें' : 'Record New Intake'}</span>
            </button>
          </div>

          {/* Silo Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stocks.map((st) => {
              const pct = Math.round((st.storedQuintals / st.maxCapacityQuintals) * 100);
              return (
                <div
                  key={st.id}
                  className="bg-white border border-[#d2dfd6] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#143425]">{st.godownName}</span>
                      <span className="text-[10px] font-mono font-bold bg-[#edf5f0] text-[#1b4d3e] px-1.5 py-0.5 rounded">
                        {st.siloNumber}
                      </span>
                    </div>

                    <span className="text-[11px] text-[#557766] block">
                      फसल: <span className="font-semibold text-[#183a29]">{st.cropType}</span> • {st.qualityGrade}
                    </span>

                    {/* Capacity meter */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-bold text-[#113222] mb-1">
                        <span>{st.storedQuintals.toLocaleString()} Q</span>
                        <span className="text-[#638072]">/ {st.maxCapacityQuintals.toLocaleString()} Q ({pct}%)</span>
                      </div>
                      <div className="w-full bg-[#e8eee9] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct > 80 ? 'bg-[#c96c21]' : 'bg-[#1b7e45]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-[#527363]">
                      <div className="flex justify-between">
                        <span>कुल बोरे (50kg):</span>
                        <span className="font-bold text-[#143425]">{st.bagCount.toLocaleString()} बोरे</span>
                      </div>
                      <div className="flex justify-between text-[11px] text-[#698a79] pt-1 border-t border-[#edf4ef]">
                        <span>अंतिम आवक:</span>
                        <span>{st.lastStockEntry}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#edf4ef]">
                    <button
                      onClick={() => handleIntakeBags(st.id)}
                      className="w-full bg-[#f1f7f3] hover:bg-[#e4efe8] text-[#1b4d3e] text-xs font-bold py-1.5 rounded-xl border border-[#c4ded0] transition-colors cursor-pointer"
                    >
                      + 120 बोरे आवक दर्ज करें
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
