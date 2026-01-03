"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { createTransaction, getCategories } from "@/lib/api";
import { EMOTIONS } from "@/constants";
import { getTodayDate } from "@/utils";
import type { Account, Category, TransactionType } from "@/types";
import { 
  Plus, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Calendar, 
  FileText, 
  Smile,
  Wallet,
  Check
} from "lucide-react";

// ============================================
// Types
// ============================================

interface QuickAddFABProps {
  accounts: Account[];
  onSuccess: () => void;
}

interface TransactionFormData {
  accountId: string;
  toAccountId: string;
  categoryId: string;
  amount: string;
  description: string;
  txnDate: string;
  emotion: string;
}

const INITIAL_FORM_DATA: TransactionFormData = {
  accountId: "",
  toAccountId: "",
  categoryId: "",
  amount: "",
  description: "",
  txnDate: getTodayDate(),
  emotion: "",
};

// ============================================
// Main Component
// ============================================

/**
 * Floating Action Button for quick transaction entry
 * Opens a modal form for adding income, expense, or transfer
 */
export default function QuickAddFAB({ accounts, onSuccess }: QuickAddFABProps) {
  const { getToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<TransactionType>("expense");
  const [formData, setFormData] = useState<TransactionFormData>(INITIAL_FORM_DATA);

  const openModal = async () => {
    setIsOpen(true);
    // Set default account
    if (accounts.length > 0 && !formData.accountId) {
      setFormData(prev => ({ ...prev, accountId: accounts[0].id }));
    }
    // Fetch categories
    try {
      const token = await getToken();
      if (token) {
        const cats = await getCategories(token);
        setCategories(cats);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const closeModal = () => setIsOpen(false);

  const resetForm = () => {
    setFormData({
      ...INITIAL_FORM_DATA,
      accountId: accounts[0]?.id || "",
      txnDate: getTodayDate(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.accountId || !formData.amount) {
      toast.error("Please fill required fields");
      return;
    }

    if (type === "transfer" && !formData.toAccountId) {
      toast.error("Select destination account");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      await createTransaction(token, {
        accountId: formData.accountId,
        toAccountId: type === "transfer" ? formData.toAccountId : undefined,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
        amount: parseFloat(formData.amount),
        type,
        description: formData.description,
        txnDate: formData.txnDate,
        emotion: formData.emotion || undefined,
      });

      toast.success("Transaction added successfully");
      closeModal();
      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof TransactionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <>
      <FABButton onClick={openModal} />
      
      {isOpen && (
        <TransactionModal
          type={type}
          setType={setType}
          formData={formData}
          updateField={updateField}
          accounts={accounts}
          categories={filteredCategories}
          loading={loading}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}
    </>
  );
}

// ============================================
// FAB Button
// ============================================

interface FABButtonProps {
  onClick: () => void;
}

function FABButton({ onClick }: FABButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 md:bottom-10 right-6 md:right-10 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg shadow-blue-500/40 flex items-center justify-center text-white hover:scale-110 transition-all z-40 group"
    >
      <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
    </button>
  );
}

// ============================================
// Transaction Modal
// ============================================

interface TransactionModalProps {
  type: TransactionType;
  setType: (type: TransactionType) => void;
  formData: TransactionFormData;
  updateField: (field: keyof TransactionFormData, value: string) => void;
  accounts: Account[];
  categories: Category[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

function TransactionModal({
  type,
  setType,
  formData,
  updateField,
  accounts,
  categories,
  loading,
  onClose,
  onSubmit,
}: TransactionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-[#1E293B] rounded-3xl overflow-hidden animate-slideUp shadow-2xl ring-1 ring-white/10">
        {/* Header */}
        <ModalHeader onClose={onClose} />

        <form onSubmit={onSubmit} className="p-6 space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Type Selector */}
          <TypeSelector type={type} setType={setType} />

          {/* Amount Input */}
          <AmountInput 
            value={formData.amount} 
            onChange={(v) => updateField('amount', v)} 
          />

          <div className="space-y-5">
            {/* Account Selectors */}
            <div className="grid grid-cols-2 gap-5">
              <AccountSelect
                label={type === "transfer" ? "From" : "Account"}
                value={formData.accountId}
                onChange={(v) => updateField('accountId', v)}
                accounts={accounts}
                required
              />

              {type === "transfer" ? (
                <AccountSelect
                  label="To"
                  value={formData.toAccountId}
                  onChange={(v) => updateField('toAccountId', v)}
                  accounts={accounts.filter(a => a.id !== formData.accountId)}
                  required
                />
              ) : (
                <CategorySelect
                  value={formData.categoryId}
                  onChange={(v) => updateField('categoryId', v)}
                  categories={categories}
                />
              )}
            </div>

            {/* Note and Date/Mood */}
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <NoteInput 
                  value={formData.description} 
                  onChange={(v) => updateField('description', v)} 
                />
              </div>
              
              <DateInput 
                value={formData.txnDate} 
                onChange={(v) => updateField('txnDate', v)} 
              />

              <MoodSelect 
                value={formData.emotion} 
                onChange={(v) => updateField('emotion', v)} 
              />
            </div>
          </div>

          {/* Submit Button */}
          <SubmitButton loading={loading} />
        </form>
      </div>
    </div>
  );
}

// ============================================
// Modal Sub-Components
// ============================================

function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-[#334155]/50 bg-[#1E293B]/50 backdrop-blur-md">
      <button 
        onClick={onClose} 
        className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
      >
        <X className="w-6 h-6" />
      </button>
      <span className="text-lg font-bold text-white">New Transaction</span>
      <div className="w-10" />
    </div>
  );
}

function TypeSelector({ 
  type, 
  setType 
}: { 
  type: TransactionType; 
  setType: (t: TransactionType) => void;
}) {
  const types: { value: TransactionType; label: string; icon: typeof ArrowUpRight; activeClass: string }[] = [
    { value: "expense", label: "Expense", icon: ArrowDownLeft, activeClass: "bg-red-500 text-white shadow-lg shadow-red-500/20" },
    { value: "income", label: "Income", icon: ArrowUpRight, activeClass: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" },
    { value: "transfer", label: "Transfer", icon: RefreshCw, activeClass: "bg-blue-500 text-white shadow-lg shadow-blue-500/20" },
  ];

  return (
    <div className="flex bg-[#0F172A] p-1.5 rounded-2xl border border-[#334155]/50">
      {types.map(({ value, label, icon: Icon, activeClass }) => (
        <button
          key={value}
          type="button"
          onClick={() => setType(value)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl transition-all ${
            type === value ? activeClass : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}

function AmountInput({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (v: string) => void;
}) {
  return (
    <div className="text-center py-4">
      <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-bold">Amount</p>
      <div className="flex items-center justify-center relative">
        <span className="text-3xl text-slate-500 mr-3 font-medium">Rp</span>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="text-5xl font-bold text-center bg-transparent border-none w-64 p-0 text-white focus:outline-none placeholder:text-[#334155] tracking-tight"
          autoFocus
          required
        />
      </div>
    </div>
  );
}

function AccountSelect({ 
  label, 
  value, 
  onChange, 
  accounts, 
  required = false 
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  accounts: Account[];
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5 pl-1">
        <Wallet className="w-3 h-3" />
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0F172A] rounded-xl px-4 py-3.5 text-sm text-white border border-[#334155]/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all"
          required={required}
        >
          <option value="">Select Account</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
        </select>
        <SelectChevron />
      </div>
    </div>
  );
}

function CategorySelect({ 
  value, 
  onChange, 
  categories 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  categories: Category[];
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5 pl-1">
        <FileText className="w-3 h-3" />
        Category
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0F172A] rounded-xl px-4 py-3.5 text-sm text-white border border-[#334155]/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all"
        >
          <option value="">Uncategorized</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <SelectChevron />
      </div>
    </div>
  );
}

function NoteInput({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5 pl-1">
        <FileText className="w-3 h-3" />
        Note
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What's this for?"
        className="w-full bg-[#0F172A] rounded-xl px-4 py-3.5 text-sm text-white border border-[#334155]/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 placeholder:text-slate-600 transition-all"
      />
    </div>
  );
}

function DateInput({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5 pl-1">
        <Calendar className="w-3 h-3" />
        Date
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0F172A] rounded-xl px-4 py-3.5 text-sm text-white border border-[#334155]/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
        required
      />
    </div>
  );
}

function MoodSelect({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-400 uppercase tracking-wider font-bold flex items-center gap-1.5 pl-1">
        <Smile className="w-3 h-3" />
        Mood
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[#0F172A] rounded-xl px-4 py-3.5 text-sm text-white border border-[#334155]/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 appearance-none transition-all"
        >
          <option value="">Neutral</option>
          {EMOTIONS.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <SelectChevron />
      </div>
    </div>
  );
}

function SubmitButton({ loading }: { loading: boolean }) {
  return (
    <button 
      type="submit"
      disabled={loading} 
      className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          <Check className="w-5 h-5" />
          Save Transaction
        </>
      )}
    </button>
  );
}

function SelectChevron() {
  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
      <ArrowDownLeft className="w-4 h-4 rotate-[-45deg]" />
    </div>
  );
}
