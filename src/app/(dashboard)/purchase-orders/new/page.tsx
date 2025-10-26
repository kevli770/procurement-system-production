// app/(dashboard)/purchase-orders/new/page.tsx
// Create new Purchase Order

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Trash2, Save, Send } from 'lucide-react';

type Supplier = {
  id: string;
  name: string;
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
  tempId: string;
  itemId?: string;
  itemName: string;
  itemDescription?: string;
  itemSku?: string;
  character1?: string;
  character2?: string;
  character3?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [customItemDialogOpen, setCustomItemDialogOpen] = useState(false);

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
      const [suppliersRes, companiesRes, itemsRes] = await Promise.all([
        fetch('/api/suppliers'),
        fetch('/api/companies'),
        fetch('/api/items'),
      ]);

      const [suppliersData, companiesData, itemsData] = await Promise.all([
        suppliersRes.json(),
        companiesRes.json(),
        itemsRes.json(),
      ]);

      setSuppliers(suppliersData.suppliers || []);
      setCompanies(companiesData.companies || []);
      setItems(itemsData.items || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
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
      itemDescription: item.description || undefined,
      itemSku: item.sku,
      character1: item.character1?.value,
      character2: item.character2?.value,
      character3: item.character3?.value,
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
      itemDescription: customItem.itemDescription || undefined,
      itemSku: customItem.itemSku || undefined,
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

    setSaving(true);
    try {
      // Clean line items - remove tempId and lineTotal, convert undefined to null
      const cleanedLineItems = lineItems.map(({ tempId, lineTotal, ...item }) => ({
        itemId: item.itemId || null,
        itemName: item.itemName,
        itemDescription: item.itemDescription || null,
        itemSku: item.itemSku || null,
        character1: item.character1 || null,
        character2: item.character2 || null,
        character3: item.character3 || null,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      }));

      const res = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          lineItems: cleanedLineItems,
        }),
      });

      if (res.ok) {
        const { purchaseOrder } = await res.json();

        // If submitting for approval, update status
        if (submitForApproval) {
          await fetch(`/api/purchase-orders/${purchaseOrder.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'PENDING_APPROVAL' }),
          });
        }

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

  if (loading) {
    return <div className="p-6">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">הזמנת רכש חדשה</h1>
          <p className="text-gray-600">צור הזמנת רכש חדשה</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/purchase-orders')}>
            ביטול
          </Button>
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            <Save className="h-4 w-4 ml-2" />
            שמור כטיוטה
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            <Send className="h-4 w-4 ml-2" />
            שלח לאישור
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>פרטי הזמנה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier">ספק *</Label>
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
            </div>
            <div>
              <Label htmlFor="company">חברה *</Label>
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
            </div>
          </div>
          <div>
            <Label htmlFor="remarks">הערות</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>פריטים</CardTitle>
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
          </div>
        </CardHeader>
        <CardContent>
          {lineItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>לא נוספו פריטים עדיין</p>
              <p className="text-sm mt-2">השתמש בכפתורים למעלה להוספת פריטים</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>שם</TableHead>
                    <TableHead>תיאור</TableHead>
                    <TableHead>מחיר יחידה</TableHead>
                    <TableHead>כמות</TableHead>
                    <TableHead>סה&quot;כ</TableHead>
                    <TableHead>פעולות</TableHead>
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
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateLineItemQuantity(item.tempId, Number(e.target.value))
                          }
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>{item.lineTotal.toLocaleString()} ₪</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(item.tempId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={5} className="text-left font-bold">
                      סה&quot;כ:
                    </TableCell>
                    <TableCell className="font-bold">
                      {calculateTotal().toLocaleString()} ₪
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

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
    </div>
  );
}
