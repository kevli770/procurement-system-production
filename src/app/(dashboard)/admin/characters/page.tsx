// app/(dashboard)/admin/characters/page.tsx
// Characters (dynamic lists) management page

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
import { Plus, Edit, Trash2 } from 'lucide-react';

type Character = {
  id: string;
  type: string;
  value: string;
  valueEn?: string | null;
  order: number;
  isActive: boolean;
};

const CHARACTER_TYPE_LABELS = {
  character1: 'מאפיין 1',
  character2: 'מאפיין 2',
  character3: 'מאפיין 3',
};

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState({
    type: 'character1',
    value: '',
    valueEn: '',
    order: 0,
  });

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const res = await fetch('/api/characters');
      const data = await res.json();
      setCharacters(data.characters);
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingCharacter ? `/api/characters/${editingCharacter.id}` : '/api/characters';
      const method = editingCharacter ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setDialogOpen(false);
        fetchCharacters();
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save character:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק מאפיין זה?')) return;

    try {
      const res = await fetch(`/api/characters/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCharacters();
      }
    } catch (error) {
      console.error('Failed to delete character:', error);
    }
  };

  const openEditDialog = (character: Character) => {
    setEditingCharacter(character);
    setFormData({
      type: character.type,
      value: character.value,
      valueEn: character.valueEn || '',
      order: character.order,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingCharacter(null);
    setFormData({
      type: 'character1',
      value: '',
      valueEn: '',
      order: 0,
    });
  };

  // Group characters by type
  const char1 = characters.filter((c) => c.type === 'character1');
  const char2 = characters.filter((c) => c.type === 'character2');
  const char3 = characters.filter((c) => c.type === 'character3');

  const renderCharacterTable = (charList: Character[], type: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{CHARACTER_TYPE_LABELS[type as keyof typeof CHARACTER_TYPE_LABELS]}</CardTitle>
      </CardHeader>
      <CardContent>
        {charList.length === 0 ? (
          <p className="text-sm text-gray-500">אין מאפיינים מסוג זה</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ערך בעברית</TableHead>
                <TableHead>ערך באנגלית</TableHead>
                <TableHead>סדר</TableHead>
                <TableHead>סטטוס</TableHead>
                <TableHead>פעולות</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {charList.map((char) => (
                <TableRow key={char.id}>
                  <TableCell className="font-medium">{char.value}</TableCell>
                  <TableCell>{char.valueEn || '-'}</TableCell>
                  <TableCell>{char.order}</TableCell>
                  <TableCell>
                    <Badge variant={char.isActive ? 'default' : 'secondary'}>
                      {char.isActive ? 'פעיל' : 'לא פעיל'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(char)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(char.id)}
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
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">מאפיינים</h1>
          <p className="text-gray-600">נהל סיווגים דינמיים לפריטים</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 ml-2" />
          מאפיין חדש
        </Button>
      </div>

      {loading ? (
        <p>טוען...</p>
      ) : (
        <div className="space-y-6">
          {renderCharacterTable(char1, 'character1')}
          {renderCharacterTable(char2, 'character2')}
          {renderCharacterTable(char3, 'character3')}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCharacter ? 'עריכת מאפיין' : 'מאפיין חדש'}</DialogTitle>
            <DialogDescription>
              {editingCharacter ? 'עדכן את פרטי המאפיין' : 'הוסף מאפיין חדש למערכת'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="type">סוג</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                disabled={!!editingCharacter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="character1">מאפיין 1</SelectItem>
                  <SelectItem value="character2">מאפיין 2</SelectItem>
                  <SelectItem value="character3">מאפיין 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">ערך בעברית</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="valueEn">ערך באנגלית</Label>
              <Input
                id="valueEn"
                value={formData.valueEn}
                onChange={(e) => setFormData({ ...formData, valueEn: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="order">סדר תצוגה</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleSubmit}>
              {editingCharacter ? 'עדכן' : 'צור'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
