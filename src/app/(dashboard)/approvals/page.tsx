// app/(dashboard)/approvals/page.tsx
// Approvals page for approvers

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { CheckCircle, XCircle, Eye } from 'lucide-react';

type Approval = {
  id: string;
  level: number;
  status: string;
  createdAt: string;
  po: {
    id: string;
    poNumber: string;
    date: string;
    status: string;
    totalAmount: number;
    supplier: { id: string; name: string };
    company: { id: string; name: string };
    createdBy: { id: string; name: string; email: string };
  };
};

export default function ApprovalsPage() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [comments, setComments] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const res = await fetch('/api/approvals');
      const data = await res.json();
      setApprovals(data.approvals || []);
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const openApprovalDialog = (approval: Approval, approvalDecision: 'APPROVED' | 'REJECTED') => {
    setSelectedApproval(approval);
    setDecision(approvalDecision);
    setComments('');
    setDialogOpen(true);
  };

  const handleApproval = async () => {
    if (!selectedApproval || !decision) return;

    setProcessing(true);
    try {
      const res = await fetch(`/api/approvals/${selectedApproval.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          comments: comments || null,
        }),
      });

      if (res.ok) {
        // Refresh approvals list
        await fetchApprovals();
        setDialogOpen(false);
        setSelectedApproval(null);
        setDecision(null);
        setComments('');
      } else {
        const error = await res.json();
        alert(error.message || 'שגיאה בעיבוד האישור');
      }
    } catch (error) {
      console.error('Failed to process approval:', error);
      alert('שגיאה בעיבוד האישור');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <div className="p-6">טוען...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">אישורים ממתינים</h1>
          <p className="text-gray-600">
            הזמנות רכש ממתינות לאישורך ({approvals.length})
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>רשימת אישורים</CardTitle>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">אין אישורים ממתינים</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>מספר הזמנה</TableHead>
                  <TableHead>תאריך</TableHead>
                  <TableHead>ספק</TableHead>
                  <TableHead>חברה</TableHead>
                  <TableHead>סכום כולל</TableHead>
                  <TableHead>נוצר על ידי</TableHead>
                  <TableHead>רמת אישור</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell className="font-medium">{approval.po.poNumber}</TableCell>
                    <TableCell>
                      {new Date(approval.po.date).toLocaleDateString('he-IL')}
                    </TableCell>
                    <TableCell>{approval.po.supplier.name}</TableCell>
                    <TableCell>{approval.po.company.name}</TableCell>
                    <TableCell>{approval.po.totalAmount.toLocaleString()} ₪</TableCell>
                    <TableCell>{approval.po.createdBy.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">רמה {approval.level}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/purchase-orders/${approval.po.id}`)}
                        >
                          <Eye className="h-4 w-4 ml-1" />
                          צפה
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openApprovalDialog(approval, 'APPROVED')}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 ml-1" />
                          אשר
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openApprovalDialog(approval, 'REJECTED')}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 ml-1" />
                          דחה
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

      {/* Approval Decision Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {decision === 'APPROVED' ? 'אישור הזמנת רכש' : 'דחיית הזמנת רכש'}
            </DialogTitle>
            <DialogDescription>
              {selectedApproval && (
                <>
                  הזמנה {selectedApproval.po.poNumber} - {selectedApproval.po.supplier.name}
                  <br />
                  סכום: {selectedApproval.po.totalAmount.toLocaleString()} ₪
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="comments">
                הערות {decision === 'REJECTED' && '(חובה)'}
              </Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                placeholder={
                  decision === 'APPROVED'
                    ? 'הערות אופציונליות...'
                    : 'נא להסביר את סיבת הדחייה...'
                }
              />
            </div>
            {decision === 'REJECTED' && !comments && (
              <p className="text-sm text-red-600">הערות נדרשות עבור דחייה</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              ביטול
            </Button>
            <Button
              onClick={handleApproval}
              disabled={processing || (decision === 'REJECTED' && !comments)}
              className={
                decision === 'APPROVED'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {processing ? 'מעבד...' : decision === 'APPROVED' ? 'אשר' : 'דחה'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
