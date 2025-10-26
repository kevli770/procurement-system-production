// app/(dashboard)/admin/settings/page.tsx
// System settings and configuration page

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Mail,
  Bell,
  Shield,
  Database,
  FileText,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: 'Procurement System',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailOnPOCreated: true,
    emailOnPOApproved: true,
    emailOnPORejected: true,
    emailOnApprovalNeeded: true,
    notifyManagers: true,
    notifyCreators: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    poNumberPrefix: 'PO',
    requirePOApproval: true,
    allowDraftSaving: true,
    maxFileUploadSize: '10',
    defaultCurrency: 'ILS',
    fiscalYearStart: '1',
  });

  const handleSaveEmailSettings = () => {
    // TODO: Implement save email settings
    console.log('Saving email settings:', emailSettings);
  };

  const handleSaveNotificationSettings = () => {
    // TODO: Implement save notification settings
    console.log('Saving notification settings:', notificationSettings);
  };

  const handleSaveSystemSettings = () => {
    // TODO: Implement save system settings
    console.log('Saving system settings:', systemSettings);
  };

  const handleTestEmail = () => {
    // TODO: Implement test email functionality
    console.log('Sending test email...');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">הגדרות מערכת</h1>
        <p className="text-gray-600">נהל הגדרות והתצורה של המערכת</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>הגדרות כלליות</CardTitle>
              <CardDescription>הגדרות בסיסיות של המערכת</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="poPrefix">קידומת מספר הזמנה</Label>
                  <Input
                    id="poPrefix"
                    value={systemSettings.poNumberPrefix}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, poNumberPrefix: e.target.value })
                    }
                    placeholder="PO"
                  />
                  <p className="text-xs text-muted-foreground">
                    לדוגמה: PO-2025-0001
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">מטבע ברירת מחדל</Label>
                  <Select
                    value={systemSettings.defaultCurrency}
                    onValueChange={(value) =>
                      setSystemSettings({ ...systemSettings, defaultCurrency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ILS">שקל ישראלי (₪)</SelectItem>
                      <SelectItem value="USD">דולר ($)</SelectItem>
                      <SelectItem value="EUR">יורו (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fileSize">גודל מקסימלי לקובץ (MB)</Label>
                  <Input
                    id="fileSize"
                    type="number"
                    value={systemSettings.maxFileUploadSize}
                    onChange={(e) =>
                      setSystemSettings({ ...systemSettings, maxFileUploadSize: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiscalYear">חודש תחילת שנת כספים</Label>
                  <Select
                    value={systemSettings.fiscalYearStart}
                    onValueChange={(value) =>
                      setSystemSettings({ ...systemSettings, fiscalYearStart: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
                        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
                      ].map((month, index) => (
                        <SelectItem key={index + 1} value={String(index + 1)}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>דרוש אישור להזמנות רכש</Label>
                    <p className="text-sm text-muted-foreground">
                      האם כל הזמנה דורשת אישור לפני ביצוע
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.requirePOApproval}
                    onCheckedChange={(checked) =>
                      setSystemSettings({ ...systemSettings, requirePOApproval: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>אפשר שמירת טיוטות</Label>
                    <p className="text-sm text-muted-foreground">
                      האם משתמשים יכולים לשמור הזמנות כטיוטה
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings.allowDraftSaving}
                    onCheckedChange={(checked) =>
                      setSystemSettings({ ...systemSettings, allowDraftSaving: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveSystemSettings}>
                  <Save className="ml-2 h-4 w-4" />
                  שמור הגדרות
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>הגדרות SMTP</CardTitle>
              <CardDescription>הגדר שרת דואר אלקטרוני לשליחת התראות</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">שרת SMTP</Label>
                  <Input
                    id="smtpHost"
                    value={emailSettings.smtpHost}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtpHost: e.target.value })
                    }
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPort">פורט</Label>
                  <Input
                    id="smtpPort"
                    value={emailSettings.smtpPort}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtpPort: e.target.value })
                    }
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">שם משתמש</Label>
                  <Input
                    id="smtpUser"
                    value={emailSettings.smtpUser}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtpUser: e.target.value })
                    }
                    placeholder="your-email@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">סיסמה</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailSettings.smtpPassword}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })
                    }
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">כתובת שולח</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailSettings.fromEmail}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, fromEmail: e.target.value })
                    }
                    placeholder="noreply@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fromName">שם שולח</Label>
                  <Input
                    id="fromName"
                    value={emailSettings.fromName}
                    onChange={(e) =>
                      setEmailSettings({ ...emailSettings, fromName: e.target.value })
                    }
                    placeholder="Procurement System"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleTestEmail}>
                  <Mail className="ml-2 h-4 w-4" />
                  שלח אימייל בדיקה
                </Button>
                <Button onClick={handleSaveEmailSettings}>
                  <Save className="ml-2 h-4 w-4" />
                  שמור הגדרות
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>הגדרות התראות</CardTitle>
              <CardDescription>בחר אילו אירועים ישלחו התראות</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>התראה על יצירת הזמנה חדשה</Label>
                    <p className="text-sm text-muted-foreground">
                      שלח אימייל כשנוצרת הזמנת רכש חדשה
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailOnPOCreated}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, emailOnPOCreated: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>התראה על אישור הזמנה</Label>
                    <p className="text-sm text-muted-foreground">
                      שלח אימייל כשהזמנה מאושרת
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailOnPOApproved}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, emailOnPOApproved: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>התראה על דחיית הזמנה</Label>
                    <p className="text-sm text-muted-foreground">
                      שלח אימייל כשהזמנה נדחית
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailOnPORejected}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, emailOnPORejected: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>התראה למאשרים</Label>
                    <p className="text-sm text-muted-foreground">
                      שלח אימייל למאשר כשדרוש אישור
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailOnApprovalNeeded}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, emailOnApprovalNeeded: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>התראות למנהלים</Label>
                    <p className="text-sm text-muted-foreground">
                      שלח התראות למנהלי העובדים
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.notifyManagers}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, notifyManagers: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>התראות ליוצרי הזמנות</Label>
                    <p className="text-sm text-muted-foreground">
                      שלח התראות למי שיצר את ההזמנה
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.notifyCreators}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({ ...notificationSettings, notifyCreators: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotificationSettings}>
                  <Save className="ml-2 h-4 w-4" />
                  שמור הגדרות
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>הגדרות אבטחה</CardTitle>
              <CardDescription>נהל הגדרות אבטחה של המערכת</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <h3 className="font-semibold mb-2">מדיניות סיסמאות</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• אורך מינימלי: 8 תווים</li>
                  <li>• דרוש תו מיוחד אחד לפחות</li>
                  <li>• דרוש מספר אחד לפחות</li>
                  <li>• תוקף סיסמה: 90 יום</li>
                </ul>
              </div>

              <div className="rounded-lg border p-4 bg-muted/50">
                <h3 className="font-semibold mb-2">הגדרות התחברות</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• זמן פג תוקף session: 24 שעות</li>
                  <li>• מספר מקסימלי של ניסיונות כניסה כושלים: 5</li>
                  <li>• זמן נעילת חשבון: 30 דקות</li>
                </ul>
              </div>

              <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950">
                <div className="flex gap-2">
                  <Shield className="h-5 w-5 text-amber-600 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold text-sm">אזהרת אבטחה</p>
                    <p className="text-sm text-muted-foreground">
                      שינוי הגדרות אבטחה עלול להשפיע על יכולת המשתמשים להתחבר למערכת.
                      ודא שאתה מבין את ההשלכות לפני ביצוע שינויים.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="outline" disabled>
                  <Shield className="ml-2 h-4 w-4" />
                  ערוך הגדרות אבטחה
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
