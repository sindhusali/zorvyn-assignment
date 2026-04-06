import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from "recharts";

// 1. Custom Tooltip for Charts
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 shadow-xl rounded-lg border border-indigo-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">{payload[0].payload.name}</p>
        <p className="text-indigo-600 dark:text-indigo-400 font-black text-lg">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

// 2. Empty State Component (For Assignment Requirement)
const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-3">
    <div className="text-4xl">📉</div>
    <p className="text-slate-400 font-medium text-sm">{message}</p>
  </div>
);

function App() {
  // --- STATE MANAGEMENT ---
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [role, setRole] = useState("admin");
  const [activePage, setActivePage] = useState("dashboard");
  const [selectedRow, setSelectedRow] = useState(null);
  const [filterType, setFilterType] = useState("all");

  // Transactions with LocalStorage Persistence
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("transactions_data");
    return saved ? JSON.parse(saved) : [
      { id: 1, title: "Salary", amount: 50000, type: "income", date: "2026-04-01" },
      { id: 2, title: "Food", amount: 2000, type: "expense", date: "2026-04-02" },
      { id: 3, title: "Freelance", amount: 15000, type: "income", date: "2026-04-03" },
      { id: 4, title: "Rent", amount: 12000, type: "expense", date: "2026-04-04" },
      { id: 5, title: "Gym", amount: 1500, type: "expense", date: "2026-04-05" },
    ];
  });

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("income");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  // --- EFFECTS ---
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    localStorage.setItem("transactions_data", JSON.stringify(transactions));
  }, [transactions]);

  // --- CALCULATIONS ---
  const income = transactions.filter(t => t.type === "income").reduce((a, t) => a + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((a, t) => a + t.amount, 0);
  const balance = income - expense;

  const filteredTransactions = useMemo(() => {
    if (filterType === "all") return transactions;
    return transactions.filter(t => t.type === filterType);
  }, [transactions, filterType]);

  const addTransaction = () => {
    if (role !== "admin") return;
    if (!title || !amount || !date) return setError("Enter all fields");
    setTransactions([{ id: Date.now(), title, amount: Number(amount), type, date }, ...transactions]);
    setTitle(""); setAmount(""); setDate(""); setError("");
  };

  const deleteTransaction = (id) => {
    if (role === "admin") setTransactions(transactions.filter(t => t.id !== id));
  };

  const chartData = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let running = 0;
    return sorted.map(t => {
      running += t.type === "income" ? t.amount : -t.amount;
      return { name: t.title, balance: running, date: t.date };
    });
  }, [transactions]);

  const pieData = [{ name: "Income", value: income }, { name: "Expense", value: expense }];
  const COLORS = ["#22c55e", "#ef4444"];
  const card = "bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all";

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900 text-slate-900 dark:text-white transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-indigo-700 p-6 flex flex-col justify-between shrink-0 text-white shadow-2xl z-50">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-white p-2 rounded-lg text-indigo-700 text-xl font-black">F</div>
            <h1 className="text-2xl font-black tracking-tighter">FINANCE.IO</h1>
          </div>
          <nav className="space-y-2">
            {["dashboard", "transactions", "insights"].map(p => (
              <button key={p} onClick={() => setActivePage(p)}
                className={`w-full text-left p-4 rounded-xl capitalize flex items-center gap-3 transition-all ${activePage === p ? "bg-white/20 font-bold shadow-inner" : "hover:bg-white/10 opacity-70"}`}>
                {p === "dashboard" && "📊 Dashboard"}
                {p === "transactions" && "💸 Transactions"}
                {p === "insights" && "📈 Insights"}
              </button>
            ))}
          </nav>
        </div>
        <div className="space-y-4 pt-6 border-t border-white/10">
          <div className="bg-white/10 p-4 rounded-2xl">
            <p className="text-[10px] uppercase font-bold opacity-60 mb-2 tracking-widest text-white">Access Control</p>
            <select value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full bg-indigo-600 border border-white/20 p-2 rounded-lg text-sm font-bold outline-none cursor-pointer text-white">
              <option value="admin" className="text-black">🔓 Admin Role</option>
              <option value="viewer" className="text-black">🔒 Viewer Role</option>
            </select>
          </div>
          <button onClick={() => setDark(!dark)} className="w-full bg-white text-indigo-700 p-3 rounded-xl font-bold shadow-lg hover:bg-gray-100 transition">
            {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        
        
        {activePage === "dashboard" && (
          <div className="max-w-6xl mx-auto space-y-10">
            <header>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white">Overview</h2>
              <p className="text-slate-500 dark:text-gray-400 font-medium tracking-tight">Financial standing as of today</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`${card} bg-indigo-600 border-none shadow-xl shadow-indigo-200 dark:shadow-none`}>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400/70">Net Balance</p>
                <h3 className="text-4xl font-black mt-2 text-indigo-600 dark:text-purple-500">₹{balance.toLocaleString()}</h3>
              </div>
              <div className={`${card} shadow-xl shadow-green-100 dark:shadow-none border-green-100 dark:border-gray-700`}>
    <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">Total Income</p>
    <h3 className="text-3xl font-black mt-2 text-green-600 dark:text-green-500">₹{income.toLocaleString()}</h3>
  </div>
              <div className={`${card} shadow-xl shadow-red-100 dark:shadow-none border-red-100 dark:border-gray-700`}>
    <p className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-widest">Total Expenses</p>
    <h3 className="text-3xl font-black mt-2 text-red-600 dark:text-red-500">₹{expense.toLocaleString()}</h3>
  </div>
</div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className={card}>
                <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-tight">📈 BALANCE TRAJECTORY</h4>
                {transactions.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickMargin={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="balance" stroke="#4f46e5" strokeWidth={4} dot={{ r: 4, fill: "#4f46e5" }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState message="No transactions recorded to show trajectory." />
                )}
              </div>

              <div className={card}>
                <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-tight">🥧 ALLOCATION</h4>
                {transactions.length > 0 ? (
                  <div className="flex flex-col md:flex-row items-center justify-around gap-6">
                    <div className="relative w-44 h-44 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} innerRadius={65} outerRadius={85} paddingAngle={10} dataKey="value" stroke="none" startAngle={90} endAngle={450}>
                            {pieData.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={12} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Turnover</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white">₹{(income + expense).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex-1 w-full space-y-5">
                      {pieData.map((entry, i) => (
                        <div key={entry.name}>
                          <div className="flex justify-between items-end mb-1.5">
                            <span className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase">{entry.name}</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">₹{entry.value.toLocaleString()}</span>
                          </div>
                          <div className="h-2 w-full bg-slate-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm" style={{ width: `${((entry.value / (income + expense || 1)) * 100)}%`, backgroundColor: COLORS[i] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState message="Add income or expenses to see allocation." />
                )}
              </div>
            </div>
          </div>
        )}

       
        {activePage === "transactions" && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Transactions</h2>
              <div className="flex gap-2">
                {['all', 'income', 'expense'].map(type => (
                  <button key={type} onClick={() => setFilterType(type)} className={`px-4 py-1 rounded-full text-sm font-bold transition-all ${filterType === type ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 dark:bg-gray-700 text-slate-700 dark:text-gray-300'}`}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {role === "admin" ? (
              <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-2 border-dashed border-indigo-100 dark:border-gray-700 grid grid-cols-1 md:grid-cols-5 gap-3">
                <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border-none outline-none focus:ring-2 ring-indigo-500 text-sm" />
                <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border-none outline-none focus:ring-2 ring-indigo-500 text-sm" />
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border-none outline-none focus:ring-2 ring-indigo-500 text-sm" />
                <select value={type} onChange={e => setType(e.target.value)} className="p-3 rounded-xl bg-slate-50 dark:bg-gray-900 border-none outline-none text-sm">
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <button onClick={addTransaction} className="bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition active:scale-95">Add Entry</button>
              </div>
            ) : (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex items-center gap-3 text-amber-800 dark:text-amber-300 font-medium">
                <span>🔒</span> Viewing Only. Switch to Admin mode in the sidebar to make changes.
              </div>
            )}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-gray-700/50 sticky top-0">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="p-5">Details</th>
                    <th className="p-5">Amount</th>
                    <th className="p-5">Type</th>
                    <th className="p-5">Date</th>
                    {role === "admin" && <th className="p-5 text-center">Delete</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-gray-700">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} onClick={() => setSelectedRow(t.id)} className={`transition-all ${selectedRow === t.id ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-50/50 dark:hover:bg-gray-700/30'}`}>
                      <td className="p-5 font-bold">{t.title}</td>
                      <td className="p-5 font-black flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'income' ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>₹{t.amount.toLocaleString()}</span>
                      </td>
                      <td className="p-5"><span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.type}</span></td>
                      <td className="p-5 text-sm text-slate-500">{t.date}</td>
                      {role === "admin" && (
                        <td className="p-5 text-center">
                          <button onClick={(e) => { e.stopPropagation(); deleteTransaction(t.id); }} className="text-slate-400 hover:text-red-600 hover:scale-125 transition-all opacity-60 hover:opacity-100 text-lg">🗑️</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        
        {activePage === "insights" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-3xl font-black  text-slate-900 dark:text-white ">Deep Insights</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className={card}>
                <h5 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Savings Velocity</h5>
                <div className="text-5xl font-black text-indigo-600 mb-2">{income > 0 ? ((balance / income) * 100).toFixed(1) : 0}%</div>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">Percentage of income retained after expenses.</p>
              </div>
              <div className={card}>
                <h5 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Cash Position</h5>
                <div className={`text-xl font-bold mb-2 ${balance > 0 ? 'text-green-600' : 'text-red-600'}`}>{balance > 0 ? "✅ Solvent & Growing" : "⚠️ Liquidity Warning"}</div>
                <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">Based on your current burn rate.</p>
              </div>
            </div>
            <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl">
              <h4 className="text-xl font-bold mb-4">Financial Recommendation</h4>
              <p className="opacity-90 leading-relaxed">{balance > 10000 ? "Strong surplus detected. Consider investing." : "Margin is thin. Reduce non-essential spending."}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;