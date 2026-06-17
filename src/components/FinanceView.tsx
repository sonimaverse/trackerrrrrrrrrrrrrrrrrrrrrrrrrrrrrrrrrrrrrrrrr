import React, { useState } from "react";
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Wallet, Landmark, TrendingUp } from "lucide-react";
import { DatabaseState, Expense } from "../types";

interface FinanceProps {
  state: DatabaseState;
  updateState: (newState: DatabaseState) => void;
}

export default function FinanceView({ state, updateState }: FinanceProps) {
  // Balance modifier inputs
  const [walletInput, setWalletInput] = useState("");
  const [bankInput, setBankInput] = useState("");
  const [showBalanceEditor, setShowBalanceEditor] = useState(false);

  // Transaction form inputs
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("Food");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState<"wallet" | "bank">("wallet");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);

  const handleUpdateBalances = (e: React.FormEvent) => {
    e.preventDefault();
    const newState = { ...state };
    if (walletInput.trim()) {
      const parsed = parseFloat(walletInput);
      if (!isNaN(parsed)) newState.walletBalance = parsed;
    }
    if (bankInput.trim()) {
      const parsed = parseFloat(bankInput);
      if (!isNaN(parsed)) newState.bankBalance = parsed;
    }
    setWalletInput("");
    setBankInput("");
    setShowBalanceEditor(false);
    updateState(newState);
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const newState = { ...state };
    const newTx: Expense = {
      id: `exp-${Date.now()}`,
      type,
      amount: parsedAmount,
      category,
      description: description.trim() || `${type === 'income' ? 'Received' : 'Paid'} ${category}`,
      date: txDate,
      source,
      timestamp: Date.now()
    };

    newState.expenses.unshift(newTx);

    // Apply adjustments to balance
    if (type === "income") {
      if (source === "wallet") newState.walletBalance = +(newState.walletBalance + parsedAmount).toFixed(2);
      if (source === "bank") newState.bankBalance = +(newState.bankBalance + parsedAmount).toFixed(2);
    } else {
      if (source === "wallet") newState.walletBalance = +(newState.walletBalance - parsedAmount).toFixed(2);
      if (source === "bank") newState.bankBalance = +(newState.bankBalance - parsedAmount).toFixed(2);
    }

    setAmount("");
    setDescription("");
    updateState(newState);
  };

  const handleDeleteTransaction = (tx: Expense) => {
    if (!confirm("Are you sure you want to delete this financial ledger card?")) return;
    const newState = { ...state };
    
    // Reverse budget effects
    if (tx.type === "income") {
      if (tx.source === "wallet") newState.walletBalance = +(newState.walletBalance - tx.amount).toFixed(2);
      if (tx.source === "bank") newState.bankBalance = +(newState.bankBalance - tx.amount).toFixed(2);
    } else {
      if (tx.source === "wallet") newState.walletBalance = +(newState.walletBalance + tx.amount).toFixed(2);
      if (tx.source === "bank") newState.bankBalance = +(newState.bankBalance + tx.amount).toFixed(2);
    }

    newState.expenses = newState.expenses.filter(e => e.id !== tx.id);
    updateState(newState);
  };

  // Group expense values by category
  const expensesGroup: { [key: string]: number } = {};
  let totalExpenses = 0;
  
  state.expenses.forEach(e => {
    if (e.type === "expense") {
      expensesGroup[e.category] = (expensesGroup[e.category] || 0) + e.amount;
      totalExpenses += e.amount;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-100 to-indigo-300">Finance Tracker & Micro Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">Regulate personal cashflows, log expenditures and protect budget margins</p>
        </div>
        <button
          onClick={() => setShowBalanceEditor(!showBalanceEditor)}
          className="bg-slate-800 hover:bg-slate-705 border border-slate-700 text-slate-200 px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer"
        >
          {showBalanceEditor ? "Cancel Updates" : "Update Account Balances"}
        </button>
      </div>

      {/* Account Balance displays */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-950/40 text-amber-400 border border-amber-900/10 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-sans">Wallet Cash Balance</span>
              <span className="text-2xl font-mono font-bold text-slate-100">${state.walletBalance.toFixed(2)}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-950 rounded py-1 px-2.5">LIQUID STANDARD</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-950/40 text-[#5c93ff] border border-blue-900/10 rounded-xl">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-sans">Bank Account Balance</span>
              <span className="text-2xl font-mono font-bold text-slate-100">${state.bankBalance.toFixed(2)}</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-slate-500 bg-slate-950 rounded py-1 px-2.5">DEPOSIT RESERVE</span>
        </div>
      </div>

      {/* Account Balances adjustment form */}
      {showBalanceEditor && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl animator-fade-in">
          <h3 className="text-sm font-semibold text-slate-201 mb-3">Adjust Balance Core Coordinates</h3>
          <form onSubmit={handleUpdateBalances} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">NEW WALLET BALANCE ($)</label>
              <input 
                type="number"
                step="0.01"
                placeholder={state.walletBalance.toString()}
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-202 placeholder-slate-550 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">NEW BANK BALANCE ($)</label>
              <input 
                type="number"
                step="0.01"
                placeholder={state.bankBalance.toString()}
                value={bankInput}
                onChange={(e) => setBankInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-202 placeholder-slate-550 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl cursor-pointer border border-indigo-600 h-10"
            >
              Recount Balances
            </button>
          </form>
        </div>
      )}

      {/* Ledger Input Controls & Expenditures Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ledger Transaction Adder */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-203 mb-4 uppercase tracking-wider font-sans">Book Transaction Card</h3>
          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">TYPE</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as "income" | "expense")}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-330 text-xs rounded-xl focus:border-indigo-500 p-2 focus:outline-none"
                >
                  <option value="expense">Expense (-)</option>
                  <option value="income">Income (+)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">COINS ACCOUNT SOURCE</label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value as "wallet" | "bank")}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-330 text-xs rounded-xl focus:border-indigo-500 p-2 focus:outline-none"
                >
                  <option value="wallet">Wallet Balance</option>
                  <option value="bank">Bank Deposit</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">AMOUNT ($)</label>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-202 placeholder-slate-550 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-mono block mb-1">CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-330 text-xs rounded-xl focus:border-indigo-500 p-2 focus:outline-none"
                >
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Salary">Salary</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Capital">Investment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 font-mono block mb-1">DATE RECORD</label>
                <input 
                  type="date"
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-202 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-mono block mb-1">DESCRIPTION MEMORANDUM</label>
              <input 
                type="text"
                placeholder="Details (e.g. cloud subscription, organic lunch)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-202 placeholder-slate-550 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl cursor-pointer border border-indigo-600 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Book Transaction Log
            </button>
          </form>
        </div>

        {/* Categories Allocation Report */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider font-sans flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#5c93ff]" /> Expenses allocation
            </h3>
            {totalExpenses === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                No active monthly expenditures booked yet.
              </div>
            ) : (
              <div className="space-y-4">
                {Object.keys(expensesGroup).map((catName) => {
                  const amt = expensesGroup[catName];
                  const percentage = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
                  return (
                    <div key={catName} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300 font-sans font-medium">{catName}</span>
                        <span className="text-slate-240 font-mono tracking-tight font-semibold">
                          ${amt.toFixed(2)} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/60">
                        <div 
                          className="bg-indigo-500 h-full rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="bg-slate-950/40 p-3.5 border border-slate-850 rounded-xl mt-4 text-center">
            <span className="text-[10px] text-slate-500 font-mono block">TOTAL EXPENDITURES</span>
            <span className="text-lg font-mono font-bold text-rose-400 mt-0.5 block">${totalExpenses.toFixed(2)}</span>
          </div>
        </div>

        {/* Receipts & Transaction ledger */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <h3 className="text-sm font-semibold text-slate-204 mb-4 uppercase tracking-wider font-sans">Ledger Receipts</h3>
          {state.expenses.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No ledger receipts available currently.
            </div>
          ) : (
            <div className="overflow-y-auto max-h-72 space-y-2 pr-1" id="finance-receipts-logs">
              {state.expenses.map((tx) => (
                <div 
                  key={tx.id}
                  className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl flex items-center justify-between gap-3 hover:border-slate-800 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border flex items-center justify-center ${
                      tx.type === 'income' 
                        ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/10' 
                        : 'bg-rose-950/30 text-rose-400 border-rose-900/10'
                    }`}>
                      {tx.type === "income" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-205">{tx.description}</h4>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {tx.date} <span className="mx-1">•</span> {tx.category} <span className="mx-1">•</span> <span className="uppercase">{tx.source}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-xs font-semibold ${
                      tx.type === 'income' ? 'text-emerald-450' : 'text-amber-450'
                    }`}>
                      {tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                    </span>
                    <button 
                      onClick={() => handleDeleteTransaction(tx)}
                      className="p-1 text-slate-500 hover:text-rose-450 hover:bg-slate-800 rounded cursor-pointer"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
