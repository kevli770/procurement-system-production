// app/(dashboard)/purchase-orders/[id]/page.tsx
// View and Edit Purchase Order

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Trash2, Save, Send, Edit2, ArrowRight, CheckCircle, XCircle, Download } from 'lucide-react';

type Supplier = {
  id: string;
  name: string;
  email?: string | null;
};

type Company = {
  id: string;
  name: string;
};

type Item = {
  id: string;
  sku: string;
  name: string;
  description?: string | null;
  suggestedPrice: number;
  character1?: { value: string } | null;
  character2?: { value: string } | null;
  character3?: { value: string } | null;
};

type LineItem = {
  id?: string;
  tempId: string;
  itemId?: string | null;
  itemName: string;
  itemDescription?: string | null;
  itemSku?: string | null;
  character1?: string | null;
  character2?: string | null;
  character3?: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type Approval = {
  id: string;
  approverId: string;
  approver: { id: string; name: string };
  level: number;
  status: string;
  comments?: string | null;
  createdAt: string;
  respondedAt?: string | null;
};

type PurchaseOrder = {
  id: string;
  poNumber: string;
  date: string;
  status: string;
  totalAmount: number;
  supplierId: string;
  supplier: Supplier;
  companyId: string;
  company: Company;
  remarks?: string | null;
  createdById: string;
  createdBy: { id: string; name: string; email: string };
  lineItems: LineItem[];
  approvals: Approval[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string | null;
  approvedAt?: string | null;
};

const STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  PENDING_APPROVAL: 'default',
  APPROVED: 'default',
  REJECTED: 'destructive',
  CANCELLED: 'outline',
  CHANGE_REQUESTED: 'outline',
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'טיוטה',
  PENDING_APPROVAL: 'ממתין לאישור',
  APPROVED: 'מאושר',
  REJECTED: 'נדחה',
  CANCELLED: 'בוטל',
  CHANGE_REQUESTED: 'דורש שינויים',
};

const APPROVAL_STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  PENDING: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
};

const APPROVAL_STATUS_LABELS: Record<string, string> = {
  PENDING: 'ממתין',
  APPROVED: 'אושר',
  REJECTED: 'נדחה',
};

export default function PurchaseOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [customItemDialogOpen, setCustomItemDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: '',
    companyId: '',
    remarks: '',
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [customItem, setCustomItem] = useState({
    itemName: '',
    itemDescription: '',
    itemSku: '',
    unitPrice: 0,
    quantity: 1,
  });
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resolvedParams = await params;
      const [poRes, suppliersRes, companiesRes, itemsRes] = await Promise.all([
        fetch(`/api/purchase-orders/${resolvedParams.id}`),
        fetch('/api/suppliers'),
        fetch('/api/companies'),
        fetch('/api/items'),
      ]);

      if (!poRes.ok) {
        router.push('/purchase-orders');
        return;
      }

      const [poData, suppliersData, companiesData, itemsData] = await Promise.all([
        poRes.json(),
        suppliersRes.json(),
        companiesRes.json(),
        itemsRes.json(),
      ]);

      setPo(poData.purchaseOrder);
      setSuppliers(suppliersData.suppliers || []);
      setCompanies(companiesData.companies || []);
      setItems(itemsData.items || []);

      // Initialize form data
      setFormData({
        supplierId: poData.purchaseOrder.supplierId,
        companyId: poData.purchaseOrder.companyId,
        remarks: poData.purchaseOrder.remarks || '',
      });

      // Convert line items to editable format
      setLineItems(
        poData.purchaseOrder.lineItems.map((item: LineItem) => ({
          ...item,
          tempId: item.id || Date.now().toString(),
        }))
      );
    } catch (error) {
      console.error('Failed to fetch data:', error);
      router.push('/purchase-orders');
    } finally {
      setLoading(false);
    }
  };

  const addItemFromCatalogue = () => {
    const item = items.find((i) => i.id === selectedItemId);
    if (!item) return;

    const newLineItem: LineItem = {
      tempId: Date.now().toString(),
      itemId: item.id,
      itemName: item.name,
      itemDescription: item.description || null,
      itemSku: item.sku,
      character1: item.character1?.value || null,
      character2: item.character2?.value || null,
      character3: item.character3?.value || null,
      unitPrice: item.suggestedPrice,
      quantity,
      lineTotal: item.suggestedPrice * quantity,
    };

    setLineItems([...lineItems, newLineItem]);
    setItemDialogOpen(false);
    setSelectedItemId('');
    setQuantity(1);
  };

  const addCustomItem = () => {
    if (!customItem.itemName || customItem.unitPrice <= 0) {
      alert('נא למלא שם ומחיר');
      return;
    }

    const newLineItem: LineItem = {
      tempId: Date.now().toString(),
      itemName: customItem.itemName,
      itemDescription: customItem.itemDescription || null,
      itemSku: customItem.itemSku || null,
      unitPrice: customItem.unitPrice,
      quantity: customItem.quantity,
      lineTotal: customItem.unitPrice * customItem.quantity,
    };

    setLineItems([...lineItems, newLineItem]);
    setCustomItemDialogOpen(false);
    setCustomItem({
      itemName: '',
      itemDescription: '',
      itemSku: '',
      unitPrice: 0,
      quantity: 1,
    });
  };

  const removeLineItem = (tempId: string) => {
    setLineItems(lineItems.filter((item) => item.tempId !== tempId));
  };

  const updateLineItemQuantity = (tempId: string, newQuantity: number) => {
    setLineItems(
      lineItems.map((item) =>
        item.tempId === tempId
          ? { ...item, quantity: newQuantity, lineTotal: item.unitPrice * newQuantity }
          : item
      )
    );
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  };

  const handleSave = async (submitForApproval: boolean = false) => {
    if (!formData.supplierId || !formData.companyId) {
      alert('נא לבחור ספק וחברה');
      return;
    }

    if (lineItems.length === 0) {
      alert('נא להוסיף לפחות פריט אחד');
      return;
    }

    if (!po) return;

    setSaving(true);
    try {
      // Prepare line items (remove tempId and id for new items, keep only itemId and item data)
      const preparedLineItems = lineItems.map(({ tempId, id, lineTotal, ...item }) => item);

      const res = await fetch(`/api/purchase-orders/${po.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lineItems: preparedLineItems,
          status: submitForApproval ? 'PENDING_APPROVAL' : undefined,
        }),
      });

      if (res.ok) {
        router.push('/purchase-orders');
      } else {
        const error = await res.json();
        alert(error.message || 'שגיאה בשמירת ההזמנה');
      }
    } catch (error) {
      console.error('Failed to save purchase order:', error);
      alert('שגיאה בשמירת ההזמנה');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!po) return;

    try {
      const res = await fetch(`/api/purchase-orders/${po.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        router.push('/purchase-orders');
      } else {
        const error = await res.json();
        alert(error.message || 'שגיאה במחיקת ההזמנה');
      }
    } catch (error) {
      console.error('Failed to delete purchase order:', error);
      alert('שגיאה במחיקת ההזמנה');
    }
  };

  const handleCancel = async () => {
    if (!po) return;

    try {
      const res = await fetch(`/api/purchase-orders/${po.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });

      if (res.ok) {
        fetchData(); // Refresh data
      } else {
        const error = await res.json();
        alert(error.message || 'שגיאה בביטול ההזמנה');
      }
    } catch (error) {
      console.error('Failed to cancel purchase order:', error);
      alert('שגיאה בביטול ההזמנה');
    } finally {
      setCancelDialogOpen(false);
    }
  };

  if (loading) {
    return <div className="p-6">טוען...</div>;
  }

  if (!po) {
    return <div className="p-6">הזמנה לא נמצאה</div>;
  }

  const canEdit = po.status === 'DRAFT' && !isEditMode;
  const isEditing = isEditMode && po.status === 'DRAFT';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{po.poNumber}</h1>
            <Badge variant={STATUS_COLORS[po.status] || 'default'}>
              {STATUS_LABELS[po.status] || po.status}
            </Badge>
          </div>
          <p className="text-gray-600 mt-1">
            נוצר על ידי {po.createdBy.name} בתאריך {new Date(po.createdAt).toLocaleDateString('he-IL')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/purchase-orders')}>
            חזור לרשימה
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(`/api/purchase-orders/${po.id}/pdf`, '_blank')}
          >
            <Download className="h-4 w-4 ml-2" />
            הורד PDF
          </Button>
          {canEdit && (
            <>
              <Button variant="outline" onClick={() => setIsEditMode(true)}>
                <Edit2 className="h-4 w-4 ml-2" />
                ערוך
              </Button>
              <Button variant="outline" onClick={() => handleSave(true)} disabled={saving}>
                <Send className="h-4 w-4 ml-2" />
                שלח לאישור
              </Button>
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="h-4 w-4 ml-2" />
                מחק
              </Button>
            </>
          )}
          {isEditing && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditMode(false);
                  fetchData(); // Reset changes
                }}
              >
                ביטול
              </Button>
              <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
                <Save className="h-4 w-4 ml-2" />
                שמור שינויים
              </Button>
              <Button onClick={() => handleSave(true)} disabled={saving}>
                <Send className="h-4 w-4 ml-2" />
                שמור ושלח לאישור
              </Button>
            </>
          )}
          {po.status === 'PENDING_APPROVAL' && (
            <Button variant="outline" onClick={() => setCancelDialogOpen(true)}>
              ביטול הזמנה
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטי הזמנה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier">ספק</Label>
              {isEditing ? (
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר ספק" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-lg font-medium mt-1">{po.supplier.name}</div>
              )}
            </div>
            <div>
              <Label htmlFor="company">חברה</Label>
              {isEditing ? (
                <Select
                  value={formData.companyId}
                  onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר חברה" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-lg font-medium mt-1">{po.company.name}</div>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="remarks">הערות</Label>
            {isEditing ? (
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                rows={3}
              />
            ) : (
              <div className="text-gray-700 mt-1 whitespace-pre-wrap">
                {po.remarks || 'אין הערות'}
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <Label>תאריך יצירה</Label>
              <div className="text-lg font-medium mt-1">
                {new Date(po.createdAt).toLocaleDateString('he-IL')}
              </div>
            </div>
            {po.submittedAt && (
              <div>
                <Label>תאריך הגשה</Label>
                <div className="text-lg font-medium mt-1">
                  {new Date(po.submittedAt).toLocaleDateString('he-IL')}
                </div>
              </div>
            )}
            {po.approvedAt && (
              <div>
                <Label>תאריך אישור</Label>
                <div className="text-lg font-medium mt-1">
                  {new Date(po.approvedAt).toLocaleDateString('he-IL')}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>פריטים</CardTitle>
            {isEditing && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setItemDialogOpen(true)}>
                  <Plus className="h-4 w-4 ml-1" />
                  מקטלוג
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCustomItemDialogOpen(true)}>
                  <Plus className="h-4 w-4 ml-1" />
                  פריט מותאם
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>שם</TableHead>
                <TableHead>תיאור</TableHead>
                <TableHead>מחיר יחידה</TableHead>
                <TableHead>כמות</TableHead>
                <TableHead>סה&quot;כ</TableHead>
                {isEditing && <TableHead>פעולות</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineItems.map((item) => (
                <TableRow key={item.tempId}>
                  <TableCell>{item.itemSku || '-'}</TableCell>
                  <TableCell className="font-medium">{item.itemName}</TableCell>
                  <TableCell>{item.itemDescription || '-'}</TableCell>
                  <TableCell>{item.unitPrice.toLocaleString()} ₪</TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateLineItemQuantity(item.tempId, Number(e.target.value))}
                        className="w-20"
                      />
                    ) : (
                      item.quantity
                    )}
                  </TableCell>
                  <TableCell>{item.lineTotal.toLocaleString()} ₪</TableCell>
                  {isEditing && (
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => removeLineItem(item.tempId)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={isEditing ? 5 : 5} className="text-left font-bold">
                  סה&quot;כ:
                </TableCell>
                <TableCell className="font-bold">{calculateTotal().toLocaleString()} ₪</TableCell>
                {isEditing && <TableCell />}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {po.approvals && po.approvals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>היסטוריית אישורים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {po.approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {approval.status === 'APPROVED' ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : approval.status === 'REJECTED' ? (
                      <XCircle className="h-6 w-6 text-red-600" />
                    ) : (
                      <ArrowRight className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{approval.approver.name}</span>
                      <Badge variant={APPROVAL_STATUS_COLORS[approval.status] || 'secondary'}>
                        {APPROVAL_STATUS_LABELS[approval.status] || approval.status}
                      </Badge>
                      <span className="text-sm text-gray-500">רמה {approval.level}</span>
                    </div>
                    {approval.comments && (
                      <p className="text-sm text-gray-700">{approval.comments}</p>
                    )}
                    <div className="text-xs text-gray-500">
                      {approval.respondedAt
                        ? `הגיב ב-${new Date(approval.respondedAt).toLocaleString('he-IL')}`
                        : `נוצר ב-${new Date(approval.createdAt).toLocaleString('he-IL')}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Item from Catalogue Dialog */}
      <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוסף פריט מהקטלוג</DialogTitle>
            <DialogDescription>בחר פריט מהקטלוג והוסף אותו להזמנה</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="item">פריט</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="בחר פריט" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.sku} - {item.name} ({item.suggestedPrice.toLocaleString()} ₪)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">כמות</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setItemDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={addItemFromCatalogue} disabled={!selectedItemId}>
              הוסף
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Custom Item Dialog */}
      <Dialog open={customItemDialogOpen} onOpenChange={setCustomItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוסף פריט מותאם</DialogTitle>
            <DialogDescription>הוסף פריט שאינו בקטלוג</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="customName">שם הפריט *</Label>
              <Input
                id="customName"
                value={customItem.itemName}
                onChange={(e) => setCustomItem({ ...customItem, itemName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="customSku">SKU</Label>
              <Input
                id="customSku"
                value={customItem.itemSku}
                onChange={(e) => setCustomItem({ ...customItem, itemSku: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="customDescription">תיאור</Label>
              <Textarea
                id="customDescription"
                value={customItem.itemDescription}
                onChange={(e) => setCustomItem({ ...customItem, itemDescription: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customPrice">מחיר יחידה *</Label>
                <Input
                  id="customPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={customItem.unitPrice}
                  onChange={(e) => setCustomItem({ ...customItem, unitPrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="customQuantity">כמות</Label>
                <Input
                  id="customQuantity"
                  type="number"
                  min="1"
                  value={customItem.quantity}
                  onChange={(e) => setCustomItem({ ...customItem, quantity: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomItemDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={addCustomItem}>הוסף</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם למחוק את ההזמנה?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תמחק את הזמנת הרכש לצמיתות. לא ניתן לבטל את הפעולה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel PO Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם לבטל את ההזמנה?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו תסמן את ההזמנה כמבוטלת. ההזמנה תישאר במערכת למעקב.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>חזור</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>בטל הזמנה</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
