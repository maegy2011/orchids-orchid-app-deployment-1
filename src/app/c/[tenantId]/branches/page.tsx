"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  ArrowRight,
  Building2,
  Loader2,
  Search,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Branch {
  id: string;
  name: string;
  location: string | null;
  managerId: string | null;
  managerName?: string;
  createdAt: string;
}

export default function BranchesPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({ name: "", location: "" });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchBranches();
  }, [tenantId]);

  const fetchBranches = async () => {
    try {
      const res = await fetch(`/api/tenant/branches?tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setBranches(data.branches || []);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingBranch
        ? `/api/tenant/branches/${editingBranch.id}`
        : "/api/tenant/branches";
      const method = editingBranch ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, tenantId }),
      });

      if (res.ok) {
        setDialogOpen(false);
        setEditingBranch(null);
        setFormData({ name: "", location: "" });
        fetchBranches();
      }
    } catch (error) {
      console.error("Error saving branch:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/tenant/branches/${deleteId}?tenantId=${tenantId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchBranches();
      }
    } catch (error) {
      console.error("Error deleting branch:", error);
    } finally {
      setDeleteId(null);
    }
  };

  const openEditDialog = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({ name: branch.name, location: branch.location || "" });
    setDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingBranch(null);
    setFormData({ name: "", location: "" });
    setDialogOpen(true);
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <h1 className="font-bold text-xl">إدارة الفروع</h1>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog} className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة فرع
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>
                  {editingBranch ? "تعديل الفرع" : "إضافة فرع جديد"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم الفرع</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="مثال: الفرع الرئيسي"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">العنوان</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="مثال: شارع التحرير، القاهرة"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                    {editingBranch ? "حفظ التغييرات" : "إضافة الفرع"}
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              قائمة الفروع ({branches.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredBranches.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>لا توجد فروع بعد</p>
                <p className="text-sm">اضغط على "إضافة فرع" لإنشاء أول فرع</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم الفرع</TableHead>
                    <TableHead className="text-right">العنوان</TableHead>
                    <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-right w-[100px]">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell className="font-medium">{branch.name}</TableCell>
                      <TableCell>{branch.location || "-"}</TableCell>
                      <TableCell>
                        {new Date(branch.createdAt).toLocaleDateString("ar-EG")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(branch)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => setDeleteId(branch.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
</Card>
        </main>

        <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent dir="rtl">
            <AlertDialogHeader>
              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من حذف هذا الفرع؟ لا يمكن التراجع عن هذا الإجراء.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2 flex-row-reverse">
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                حذف
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}
