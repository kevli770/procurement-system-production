// app/(dashboard)/admin/items/page.tsx
// Items catalogue management page

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2 } from 'lucide-react';

type Item = {
  id: string;
  sku: string;
  name: string;
  nameEn?: string | null;
  description?: string | null;
  character1?: { id: string; value: string } | null;
  character2?: { id: string; value: string } | null;
  character3?: { id: string; value: string } | null;
  suggestedPrice: number;
  isOneTimePurchase: boolean;
  validFrom?: Date | null;
  validTo?: Date | null;
  supplier?: { id: string; name: string } | null;
  isActive: boolean;
};

type Character = {
  id: string;
  type: string;
  value: string;
  valueEn?: string | null;
};

type Supplier = {
  id: string;
  name: string;
};

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    descriptionEn: '',
    character1Id: '',
    character2Id: '',
    character3Id: '',
    suggestedPrice: 0,
    isOneTimePurchase: true,
    validFrom: '',
    validTo: '',
    supplierId: '',
    remarks: '',
  });

  useEffect(() => {
    fetchItems();
    fetchSuppliers();
    fetchCharacters();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      setItems(data.items);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    }
  };

  const fetchCharacters = async () => {
    try {
      const res = await fetch('/api/characters');
      const data = await res.json();
      setCharacters(data.characters || []);
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingItem ? `/api/items/${editingItem.id}` : '/api/items';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setDialogOpen(false);
        fetchItems();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק פריט זה?')) return;

    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchItems();
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const openEditDialog = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      nameEn: item.nameEn || '',
      description: item.description || '',
      descriptionEn: '',
      character1Id: item.character1?.id || '',
      character2Id: item.character2?.id || '',
      character3Id: item.character3?.id || '',
      suggestedPrice: item.suggestedPrice,
      isOneTimePurchase: item.isOneTimePurchase,
      validFrom: item.validFrom ? new Date(item.validFrom).toISOString().split('T')[0] : '',
      validTo: item.validTo ? new Date(item.validTo).toISOString().split('T')[0] : '',
      supplierId: item.supplier?.id || '',
      remarks: '',
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      nameEn: '',
      description: '',
      descriptionEn: '',
      character1Id: '',
      character2Id: '',
      character3Id: '',
      suggestedPrice: 0,
      isOneTimePurchase: true,
      validFrom: '',
      validTo: '',
      supplierId: '',
      remarks: '',
    });
  };

  const char1Options = characters.filter((c) => c.type === 'character1');
  const char2Options = characters.filter((c) => c.type === 'character2');
  const char3Options = characters.filter((c) => c.type === 'character3');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">קטלוג פריטים</h1>
          <p className="text-gray-600">נהל פריטים וקטלוג מוצרים</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 ml-2" />
          פריט חדש
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>רשימת פריטים</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>טוען...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>שם</TableHead>
                  <TableHead>מאפיין 1</TableHead>
                  <TableHead>מאפיין 2</TableHead>
                  <TableHead>מאפיין 3</TableHead>
                  <TableHead>מחיר מוצע</TableHead>
                  <TableHead>ספק</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.character1?.value || '-'}</TableCell>
                    <TableCell>{item.character2?.value || '-'}</TableCell>
                    <TableCell>{item.character3?.value || '-'}</TableCell>
                    <TableCell>{item.suggestedPrice.toLocaleString()} ₪</TableCell>
                    <TableCell>{item.supplier?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={item.isActive ? 'default' : 'secondary'}>
                        {item.isActive ? 'פעיל' : 'לא פעיל'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'עריכת פריט' : 'פריט חדש'}</DialogTitle>
            <DialogDescription>
              {editingItem ? 'עדכן את פרטי הפריט' : 'הוסף פריט חדש לקטלוג'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">שם בעברית</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="nameEn">שם באנגלית</Label>
                <Input
                  id="nameEn"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="char1">מאפיין 1</Label>
                <Select
                  value={formData.character1Id || 'NONE'}
                  onValueChange={(value) => setFormData({ ...formData, character1Id: value === 'NONE' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר מאפיין" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">ללא מאפיין</SelectItem>
                    {char1Options.map((char) => (
                      <SelectItem key={char.id} value={char.id}>
                        {char.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="char2">מאפיין 2</Label>
                <Select
                  value={formData.character2Id || 'NONE'}
                  onValueChange={(value) => setFormData({ ...formData, character2Id: value === 'NONE' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר מאפיין" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">ללא מאפיין</SelectItem>
                    {char2Options.map((char) => (
                      <SelectItem key={char.id} value={char.id}>
                        {char.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="char3">מאפיין 3</Label>
                <Select
                  value={formData.character3Id || 'NONE'}
                  onValueChange={(value) => setFormData({ ...formData, character3Id: value === 'NONE' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר מאפיין" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">ללא מאפיין</SelectItem>
                    {char3Options.map((char) => (
                      <SelectItem key={char.id} value={char.id}>
                        {char.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="suggestedPrice">מחיר מוצע (₪)</Label>
                <Input
                  id="suggestedPrice"
                  type="number"
                  value={formData.suggestedPrice}
                  onChange={(e) => setFormData({ ...formData, suggestedPrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="supplier">ספק</Label>
                <Select
                  value={formData.supplierId || 'NONE'}
                  onValueChange={(value) => setFormData({ ...formData, supplierId: value === 'NONE' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר ספק" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">ללא ספק</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="isOneTime"
                checked={formData.isOneTimePurchase}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isOneTimePurchase: checked as boolean })
                }
              />
              <Label htmlFor="isOneTime">רכישה חד פעמית</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="validFrom">תקף מתאריך</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="validTo">תקף עד תאריך</Label>
                <Input
                  id="validTo"
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="remarks">הערות</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleSubmit}>
              {editingItem ? 'עדכן' : 'צור'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
