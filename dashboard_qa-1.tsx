import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Settings, Save, LayoutDashboard, Activity, 
  Plus, Trash2, ChevronDown, Globe,
  Loader2, History, ArrowRightLeft, ClipboardList,
  Users, UserCircle, Calculator, CheckSquare, Square,
  AlertCircle, CheckCircle2, ListOrdered
} from 'lucide-react';

// --- CONFIGURAÇÃO FIREBASE ---
// Em um ambiente local, você substituiria os valores abaixo pelos do seu Console Firebase.
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'dashboard-qa-delphi';

const COLORS = {
  primary: '#0ea5e9',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  dark: '#1e293b',
  gray: '#94a3b8',
  rose: '#f43f5e',
  amber: '#fbbf24'
};

const Card = ({ title, value, icon: Icon, color, subtext }) => {
  const displayValue = (typeof value === 'number' || typeof value === 'string') ? value : '0';

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">
          {displayValue}
        </h3>
        {subtext && <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">{subtext}</p>}
      </div>
      <div className={`p-2.5 rounded-lg bg-opacity-10 ${color ? color.replace('text-', 'bg-') : 'bg-slate-100'}`}>
        {Icon && <Icon className={`w-5 h-5 ${color || 'text-slate-500'}`} />}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState("all"); 
  const [newVersionInput, setNewVersionInput] = useState("");
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  
  const [versionsData, setVersionsData] = useState({});
  const [customHistory, setCustomHistory] = useState([]); 
  const [selectedVersionsForTotal, setSelectedVersionsForTotal] = useState([]);

  const createEmptyVersion = (versionName = "") => ({
    version: versionName,
    sprintName: "Sprint 00",
    totalDemandas: 0,
    cenariosRegressao: 0,
    cenariosPR: 0,
    bugsProd: 0,
    bugsQA: 0,
    bugsMelhoria: 0,
    cenariosCorrigidos: 0,
    cenariosNaoCorrigidos: 0,
    bugsReturnDev: 0,
    bugsToReturnDev: 0,
    issuesMelhoriaBugQA: 0,
    demandasTrabalhadasSprint: 0,
    wishlist: 0,
    issuesDuplicadasCanceladas: 0,
    issuesAbertasSVO: 0
  });

  // Autenticação Inicial
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) { 
        console.error("Erro na autenticação:", err); 
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Listener do Firestore em Tempo Real
  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'dashboard', 'main');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const vData = data.versionsData || {};
        setVersionsData(vData);
        setCustomHistory(data.customHistory || []);
        setSelectedVersionsForTotal(prev => prev.length === 0 ? Object.keys(vData) : prev);
      } else {
        // Inicializa com dados vazios se o documento não existir
        setVersionsData({});
        setCustomHistory([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar dados do Firestore:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const saveToCloud = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'dashboard', 'main');
      
      await setDoc(docRef, { 
        versionsData, 
        customHistory: customHistory, 
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: user.uid
      }, { merge: true });
      
      setIsEditing(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (err) { 
      console.error("Erro ao salvar no Firestore:", err); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleMetricChange = (e) => {
    const { name, value } = e.target;
    if (selectedVersionId === "all") return;
    
    setVersionsData(prev => ({
      ...prev,
      [selectedVersionId]: {
        ...prev[selectedVersionId],
        [name]: (name === 'sprintName' || name === 'version') ? value : (value === "" ? 0 : Number(value))
      }
    }));
  };

  const handleHistoryChange = (index, field, value) => {
    const newHistory = [...customHistory];
    newHistory[index] = { 
      ...newHistory[index], 
      [field]: field === 'version' ? value : Number(value) 
    };
    setCustomHistory(newHistory);
  };

  const addHistoryRow = () => {
    setCustomHistory([...customHistory, { version: "v.XX", correcoes: 0, melhorias: 0 }]);
  };

  const removeHistoryRow = (index) => {
    setCustomHistory(customHistory.filter((_, i) => i !== index));
  };

  const addVersion = () => {
    if (newVersionInput.trim()) {
      const id = `v-${Date.now()}`;
      setVersionsData(prev => ({ 
        ...prev, 
        [id]: createEmptyVersion(newVersionInput.trim()) 
      }));
      setSelectedVersionsForTotal(prev => [...prev, id]);
      setNewVersionInput("");
      setSelectedVersionId(id);
    }
  };

  const removeVersion = (id) => {
    const updated = { ...versionsData };
    delete updated[id];
    setVersionsData(updated);
    setSelectedVersionsForTotal(prev => prev.filter(v => v !== id));
    if (selectedVersionId === id) setSelectedVersionId("all");
  };

  const toggleVersionForTotal = (id) => {
    setSelectedVersionsForTotal(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const getConsolidatedData = () => {
    const versions = Object.entries(versionsData)
      .filter(([id]) => selectedVersionsForTotal.includes(id))
      .map(([, data]) => data);

    const template = createEmptyVersion("Consolidado");
    
    if (versions.length === 0) return template;
    
    const consolidated = versions.reduce((acc, curr) => {
      const result = { ...acc };
      Object.keys(template).forEach(key => {
        if (typeof template[key] === 'number') {
          result[key] = (Number(acc[key]) || 0) + (Number(curr[key]) || 0);
        }
      });
      return result;
    }, template);
    
    consolidated.version = `Consolidado (${versions.length} versões)`;
    consolidated.sprintName = "Múltiplas";
    return consolidated;
  };

  const currentData = selectedVersionId === "all" ? getConsolidatedData() : (versionsData[selectedVersionId] || createEmptyVersion());

  const calcMediaRetorno = () => {
    const retornos = Number(currentData.bugsReturnDev) || 0;
    const demandas = Number(currentData.totalDemandas) || 0;
    if (demandas === 0) return "0.00";
    return (retornos / demandas).toFixed(2);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
      <span className="text-slate-500 font-medium tracking-tight">Sincronizando com a base de dados...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      
      {showSaveSuccess && (
        <div className="fixed top-4 right-4 z-[100] bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-full">
          <CheckCircle2 size={20} />
          <span className="font-bold text-sm">Dados guardados com sucesso na nuvem!</span>
        </div>
      )}

      {/* Header de Equipe */}
      <div className="flex flex-wrap items-center justify-between mb-4 bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-500">
            <UserCircle size={14} className="text-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Criado por:</span>
            <span className="text-[10px] font-medium text-slate-700">Janaína Mayara Valério</span>
          </div>
          <div className="h-3 w-px bg-slate-200" />
          <div className="flex items-center gap-1.5 text-slate-500">
            <Users size={14} className="text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Equipe QA:</span>
            <span className="text-[10px] font-medium text-slate-700">Janaína Valério e Mário Moretto</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online (Nuvem)
            </span>
            <span className="text-[10px] text-slate-300 font-mono">v3.3 Stable</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded text-white shadow-lg shadow-blue-200"><LayoutDashboard size={20}/></div>
            Degust PDV Delphi | Relatório de Qualidade (QA)
          </h1>
          <div className="flex items-center gap-2 mt-1 ml-10">
            <span className="text-slate-400 text-xs shrink-0">
              Visualização: <span className="text-blue-600 font-bold">{currentData.version}</span>
            </span>
            <span className="text-slate-200 px-1">•</span>
            <span className="text-slate-400 text-xs">Sprint: <span className="text-indigo-600 font-bold uppercase">{currentData.sprintName}</span></span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="bg-white border px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm min-w-[240px] justify-between hover:border-blue-300 transition-all">
              <span className="flex items-center gap-2 text-blue-600 overflow-hidden text-ellipsis whitespace-nowrap max-w-[180px]">
                <Globe size={14}/>
                {selectedVersionId === "all" ? `Consolidado (${selectedVersionsForTotal.length})` : currentData.version}
              </span>
              <ChevronDown size={14} className="text-slate-400"/>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-3 bg-slate-50 border-b flex items-center justify-between">
                   <span className="text-[10px] font-black uppercase text-slate-400">Filtrar Versões</span>
                </div>
                <button 
                  onClick={() => { setSelectedVersionId("all"); setIsDropdownOpen(false); }} 
                  className={`w-full text-left p-3 text-xs font-bold border-b hover:bg-slate-50 flex items-center justify-between ${selectedVersionId === 'all' ? 'bg-blue-50 text-blue-700' : ''}`}
                >
                  <span className="flex items-center gap-2 text-blue-700">
                    <Globe size={14} /> Visualizar Consolidado (Soma)
                  </span>
                </button>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                  {Object.entries(versionsData).map(([id, v]) => (
                    <div key={id} className="group flex items-center border-b last:border-0 hover:bg-slate-50 transition-colors">
                      <button onClick={() => toggleVersionForTotal(id)} className="p-3 text-slate-400 hover:text-blue-600 transition-colors">
                        {selectedVersionsForTotal.includes(id) ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
                      </button>
                      <button onClick={() => { setSelectedVersionId(id); setIsDropdownOpen(false); }} className={`flex-1 text-left p-3 text-xs flex flex-col ${selectedVersionId === id ? 'text-blue-700 font-bold' : ''}`}>
                        <span>{v.version}</span>
                        <span className="text-[10px] text-slate-400">{v.sprintName}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button 
            disabled={isSaving}
            onClick={isEditing ? saveToCloud : () => setIsEditing(true)} 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${isEditing ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin"/> : isEditing ? <Save size={16}/> : <Settings size={16}/>}
            {isEditing ? (isSaving ? 'Guardando...' : 'Confirmar Alterações') : 'Editar Dashboard'}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in zoom-in-95">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 h-fit shadow-sm">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-700 uppercase tracking-tighter">Gerenciar Versões</h3>
              <div className="flex gap-2 mb-6">
                <input type="text" placeholder="Ex: v3.15" value={newVersionInput} onChange={e => setNewVersionInput(e.target.value)} className="flex-1 border p-2 rounded text-sm outline-none focus:border-blue-500" />
                <button onClick={addVersion} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"><Plus size={16}/></button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {Object.entries(versionsData).map(([id, v]) => (
                  <div key={id} onClick={() => setSelectedVersionId(id)} className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${selectedVersionId === id ? 'bg-blue-50 border-blue-400 text-blue-700' : 'hover:bg-slate-50 border-slate-100'}`}>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold">{v.version}</span>
                      <span className="text-[10px] opacity-70">{v.sprintName}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeVersion(id); }} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-700 uppercase tracking-tighter">
                <ListOrdered size={16} className="text-blue-600"/> Gráfico Histórico
              </h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {customHistory.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 relative group">
                    <button onClick={() => removeHistoryRow(idx)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={10}/></button>
                    <input type="text" value={item.version} onChange={(e) => handleHistoryChange(idx, 'version', e.target.value)} className="w-full bg-transparent text-[10px] font-bold border-b mb-2 outline-none border-slate-200 focus:border-blue-400" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-blue-600 uppercase font-black">Correções</span>
                        <input type="number" value={item.correcoes} onChange={(e) => handleHistoryChange(idx, 'correcoes', e.target.value)} className="bg-white border rounded p-1 text-[10px]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-green-600 uppercase font-black">Melhorias</span>
                        <input type="number" value={item.melhorias} onChange={(e) => handleHistoryChange(idx, 'melhorias', e.target.value)} className="bg-white border rounded p-1 text-[10px]" />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addHistoryRow} className="w-full p-2 border-2 border-dashed rounded-lg text-[10px] font-bold text-slate-400 hover:text-blue-500 flex items-center justify-center gap-2">
                  <Plus size={12}/> Adicionar Ponto no Gráfico
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase">Editor de Métricas</span>
                <h3 className="text-sm font-bold text-blue-600">{selectedVersionId === 'all' ? "Visualização Consolidada (Apenas Leitura)" : currentData.version}</h3>
              </div>
              {selectedVersionId !== 'all' && (
                 <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border">
                    <label className="text-[10px] font-black uppercase text-slate-400">Sprint:</label>
                    <input type="text" name="sprintName" value={currentData.sprintName} onChange={handleMetricChange} className="bg-transparent text-sm font-bold text-blue-700 outline-none border-b border-blue-200 min-w-[150px]" />
                 </div>
              )}
            </div>
            
            <div className={`space-y-8 ${selectedVersionId === 'all' ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Field label="Total de Demandas" name="totalDemandas" val={currentData.totalDemandas} onChange={handleMetricChange} />
                  <Field label="Cenários Regressão" name="cenariosRegressao" val={currentData.cenariosRegressao} onChange={handleMetricChange} />
                  <Field label="Cenários PR" name="cenariosPR" val={currentData.cenariosPR} onChange={handleMetricChange} />
                  <Field label="Issues Concluídas" name="cenariosCorrigidos" val={currentData.cenariosCorrigidos} onChange={handleMetricChange} />
                  <Field label="Cenários FAIL (Pendentes)" name="cenariosNaoCorrigidos" val={currentData.cenariosNaoCorrigidos} onChange={handleMetricChange} />
                  <Field label="Escopo Trabalhado" name="demandasTrabalhadasSprint" val={currentData.demandasTrabalhadasSprint} onChange={handleMetricChange} />
                  <Field label="Bugs em Produção" name="bugsProd" val={currentData.bugsProd} onChange={handleMetricChange} />
                  <Field label="Bugs em QA" name="bugsQA" val={currentData.bugsQA} onChange={handleMetricChange} />
                  <Field label="Melhorias" name="bugsMelhoria" val={currentData.bugsMelhoria} onChange={handleMetricChange} />
                  <Field label="Qtd. Retorno (DEV)" name="bugsReturnDev" val={currentData.bugsReturnDev} onChange={handleMetricChange} />
                  <Field label="Bug (To Return Dev)" name="bugsToReturnDev" val={currentData.bugsToReturnDev} onChange={handleMetricChange} />
                  <Field label="Melhoria Bug QA (Issues)" name="issuesMelhoriaBugQA" val={currentData.issuesMelhoriaBugQA} onChange={handleMetricChange} />
                </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card title="Total Demandas" value={currentData.totalDemandas} icon={Activity} color="text-blue-600" subtext={`${currentData.sprintName}`} />
            <Card title="Cenários Testados" value={(Number(currentData.cenariosRegressao) + Number(currentData.cenariosPR))} icon={ClipboardList} color="text-indigo-600" subtext={`${currentData.cenariosRegressao} Regr. | ${currentData.cenariosPR} PR`} />
            <Card title="Retorno DEV" value={currentData.bugsReturnDev} icon={History} color="text-purple-600" subtext="Histórico acumulado" />
            <Card title="Pendentes (FAIL)" value={currentData.cenariosNaoCorrigidos} icon={ArrowRightLeft} color="text-rose-500" subtext="Issues não corrigidas" />
            <Card title="Média Retorno/Issue" value={calcMediaRetorno()} icon={Calculator} color={Number(calcMediaRetorno()) > 1.2 ? "text-amber-500" : "text-emerald-500"} subtext="Quantidade de Retorno de Issues" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-bold mb-6 text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Visão Geral da Sprint</span>
                <span className="text-[10px] bg-slate-50 text-slate-400 px-2 py-0.5 rounded border uppercase">{currentData.sprintName}</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatItem label="Issues Concluídas" val={currentData.cenariosCorrigidos} color="bg-green-50 text-green-700" />
                <StatItem label="Cenários FAIL" val={currentData.cenariosNaoCorrigidos} color="bg-red-50 text-red-700" />
                <StatItem label="Bugs Prod" val={currentData.bugsProd} color="bg-orange-50 text-orange-700" />
                <StatItem label="Melhorias" val={currentData.bugsMelhoria} color="bg-blue-50 text-blue-700" />
                <StatItem label="Bugs QA" val={currentData.bugsQA} color="bg-red-50 text-red-800" />
                <StatItem label="Issues QA/Melh" val={currentData.issuesMelhoriaBugQA} color="bg-slate-100 text-slate-700" />
                <StatItem label="BUGS (PÓS RETURN DEV)" val={currentData.bugsToReturnDev} color="bg-rose-50 text-rose-800" border="border-2 border-rose-200" />
                <StatItem label="Escopo Sprint" val={currentData.demandasTrabalhadasSprint} color="bg-emerald-50 text-emerald-700" />
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center">
              <h3 className="text-sm font-bold mb-6 text-slate-500 uppercase tracking-wider w-full text-center">STATUS RETURN TO DEV</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ name: 'To Return DEV', value: Number(currentData.bugsReturnDev) || 0 }, { name: 'Pós Return DEV', value: Number(currentData.bugsToReturnDev) || 0 }]} innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value">
                      <Cell fill={COLORS.purple} />
                      <Cell fill={COLORS.rose} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 mt-2 w-full">
                <div className="flex items-center justify-between text-[10px] font-bold px-4 py-1.5 bg-purple-50 rounded-lg text-purple-700">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"/> Quantidade Total de Issues (To Return DEV)</span>
                    <span>{currentData.bugsReturnDev}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold px-4 py-1.5 bg-rose-50 rounded-lg text-rose-700">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"/> Quantidade Total de Bugs (Pós Return to DEV)</span>
                    <span>{currentData.bugsToReturnDev}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold mb-6 text-slate-500 uppercase tracking-wider">Histórico de Estabilidade (Correções vs Melhorias)</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...customHistory]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="version" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}} />
                  <Bar dataKey="correcoes" name="Correções" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={35} />
                  <Bar dataKey="melhorias" name="Melhorias" fill={COLORS.success} radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Field = ({ label, name, val, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</label>
    <input type="number" name={name} value={val} onChange={onChange} className="border p-2 rounded bg-slate-50 text-sm font-medium focus:bg-white focus:border-blue-400 outline-none transition-all" />
  </div>
);

const StatItem = ({ label, val, color, border }) => (
  <div className={`p-4 rounded-xl ${color} ${border || 'border border-transparent'} flex flex-col items-center justify-center text-center shadow-sm transition-transform hover:scale-105`}>
    <span className="text-xl font-bold leading-none">{val}</span>
    <span className="text-[8px] font-black uppercase mt-1 opacity-80">{label}</span>
  </div>
);
