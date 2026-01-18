"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wallet,
  Plus,
  ArrowRight,
  Loader2,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";

interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

interface WalletData {
  id: string;
  balance: number;
}

export default function WalletPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    type: "deposit",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchWalletData();
  }, [tenantId]);

  const fetchWalletData = async () => {
    try {
      const res = await fetch(`/api/tenant/wallet?tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setWallet(data.wallet);
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/tenant/wallet/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          amount: parseFloat(formData.amount),
          type: formData.type,
          description: formData.description,
        }),
      });

      if (res.ok) {
        setDialogOpen(false);
        setFormData({ amount: "", type: "deposit", description: "" });
        fetchWalletData();
      }
    } catch (error) {
      console.error("Error creating transaction:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.description
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || t.type === filterType;
    return (matchesSearch || !searchQuery) && matchesType;
  });

  const totalDeposits = transactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter((t) => t.type === "withdrawal")
    .reduce((sum, t) => sum + t.amount, 0);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "إيداع";
      case "withdrawal":
        return "سحب";
      case "transfer_in":
        return "تحويل وارد";
      case "transfer_out":
        return "تحويل صادر";
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "transfer_in":
        return "text-green-600 bg-green-50";
      case "withdrawal":
      case "transfer_out":
        return "text-red-600 bg-red-50";
      default:
        return "text-zinc-600 bg-zinc-50";
    }
  };

  return (
    <div
      className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-[family-name:var(--font-cairo)]"
      dir="rtl"
    >
      <header className="bg-white border-b sticky top-0 z-40 dark:bg-zinc-900 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/c/${tenantId}`}>
              <Button variant="ghost" size="icon">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <h1 className="font-bold text-xl">العمليات المالية</h1>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                عملية جديدة
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>تسجيل عملية جديدة</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">نوع العملية</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">إيداع</SelectItem>
                      <SelectItem value="withdrawal">سحب</SelectItem>
                      <SelectItem value="transfer_in">تحويل وارد</SelectItem>
                      <SelectItem value="transfer_out">تحويل صادر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">المبلغ (ج.م)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="مثال: تحويل فودافون كاش"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting && (
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    )}
                    تسجيل العملية
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100">
                الرصيد الحالي
              </CardTitle>
              <Wallet className="w-5 h-5 text-emerald-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {wallet?.balance?.toLocaleString("ar-EG") || "0.00"} ج.م
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">
                إجمالي الإيداعات
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{totalDeposits.toLocaleString("ar-EG")} ج.م
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">
                إجمالي السحوبات
              </CardTitle>
              <TrendingDown className="w-5 h-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                -{totalWithdrawals.toLocaleString("ar-EG")} ج.م
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5" />
              سجل العمليات ({transactions.length})
            </CardTitle>
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="deposit">إيداع</SelectItem>
                  <SelectItem value="withdrawal">سحب</SelectItem>
                  <SelectItem value="transfer_in">تحويل وارد</SelectItem>
                  <SelectItem value="transfer_out">تحويل صادر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <Banknote className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد عمليات بعد</p>
                <p className="text-sm">اضغط على "عملية جديدة" لتسجيل أول عملية</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">المبلغ</TableHead>
                    <TableHead className="text-right">الوصف</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                            transaction.type
                          )}`}
                        >
                          {transaction.type === "deposit" ||
                          transaction.type === "transfer_in" ? (
                            <ArrowDownRight className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          {getTypeLabel(transaction.type)}
                        </span>
                      </TableCell>
                      <TableCell
                        className={`font-bold ${
                          transaction.type === "deposit" ||
                          transaction.type === "transfer_in"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "deposit" ||
                        transaction.type === "transfer_in"
                          ? "+"
                          : "-"}
                        {transaction.amount.toLocaleString("ar-EG")} ج.م
                      </TableCell>
                      <TableCell>{transaction.description || "-"}</TableCell>
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleString("ar-EG")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
