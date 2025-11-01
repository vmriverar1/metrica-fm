'use client';

import React, { useState, useEffect } from 'react';
import { SubscribersService, EmailConfig } from '@/lib/firestore/subscribers-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Plus,
  X,
  Save,
  AlertCircle,
  Send
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SubscriptionsConfigPage() {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [newRecipient, setNewRecipient] = useState('');
  const [notifyOnSubscribe, setNotifyOnSubscribe] = useState(true);
  const [notifyOnUnsubscribe, setNotifyOnUnsubscribe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const emailConfig = await SubscribersService.getEmailConfig();

      if (emailConfig) {
        setConfig(emailConfig);
        setRecipients(emailConfig.recipients || []);
        setNotifyOnSubscribe(emailConfig.notify_on_subscribe);
        setNotifyOnUnsubscribe(emailConfig.notify_on_unsubscribe);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      setErrorMessage('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddRecipient = () => {
    const email = newRecipient.trim().toLowerCase();

    if (!email) {
      setErrorMessage('Ingresa un email');
      return;
    }

    if (!validateEmail(email)) {
      setErrorMessage('Email inválido');
      return;
    }

    if (recipients.includes(email)) {
      setErrorMessage('Este email ya está en la lista');
      return;
    }

    setRecipients([...recipients, email]);
    setNewRecipient('');
    setErrorMessage('');
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMessage('');

      const configData = {
        recipients,
        notify_on_subscribe: notifyOnSubscribe,
        notify_on_unsubscribe: notifyOnUnsubscribe
      };

      if (config) {
        await SubscribersService.updateEmailConfig(configData);
      } else {
        await SubscribersService.createEmailConfig(configData);
      }

      setSuccessMessage('Configuración guardada correctamente');
      setTimeout(() => setSuccessMessage(''), 3000);

      await loadConfig();
    } catch (error) {
      console.error('Error saving config:', error);
      setErrorMessage('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      setSendingTest(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (recipients.length === 0) {
        setErrorMessage('Debes agregar al menos un destinatario antes de enviar un email de prueba');
        return;
      }

      const response = await fetch('/api/subscriptions/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al enviar el email de prueba');
      }

      setSuccessMessage(`Email de prueba enviado correctamente a: ${data.recipients.join(', ')}`);
      setTimeout(() => setSuccessMessage(''), 5000);

    } catch (error: any) {
      console.error('Error sending test email:', error);
      setErrorMessage(error.message || 'Error al enviar el email de prueba');
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Destinatarios Card */}
      <Card>
        <CardHeader>
          <CardTitle>Destinatarios de Notificaciones</CardTitle>
          <CardDescription>
            Emails que recibirán notificaciones sobre nuevos suscriptores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Recipient */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="new-recipient">Agregar Email</Label>
              <Input
                id="new-recipient"
                type="email"
                placeholder="email@example.com"
                value={newRecipient}
                onChange={(e) => setNewRecipient(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddRecipient();
                  }
                }}
              />
            </div>
            <Button onClick={handleAddRecipient}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>

          {/* Recipients List */}
          <div className="space-y-2">
            <Label>Destinatarios ({recipients.length})</Label>
            {recipients.length === 0 ? (
              <div className="text-sm text-muted-foreground border border-dashed rounded-lg p-8 text-center">
                No hay destinatarios configurados
              </div>
            ) : (
              <div className="border rounded-lg divide-y">
                {recipients.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRecipient(email)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Notificaciones</CardTitle>
          <CardDescription>
            Configura cuándo recibir notificaciones por email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notify on Subscribe */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-subscribe">Notificar al suscribirse</Label>
              <p className="text-sm text-muted-foreground">
                Recibe un email cada vez que alguien se suscriba
              </p>
            </div>
            <Switch
              id="notify-subscribe"
              checked={notifyOnSubscribe}
              onCheckedChange={setNotifyOnSubscribe}
            />
          </div>

          {/* Notify on Unsubscribe */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-unsubscribe">Notificar al desuscribirse</Label>
              <p className="text-sm text-muted-foreground">
                Recibe un email cada vez que alguien se desuscriba
              </p>
            </div>
            <Switch
              id="notify-unsubscribe"
              checked={notifyOnUnsubscribe}
              onCheckedChange={setNotifyOnUnsubscribe}
            />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handleSendTestEmail}
          disabled={sendingTest || recipients.length === 0}
          size="lg"
        >
          <Send className="h-4 w-4 mr-2" />
          {sendingTest ? 'Enviando...' : 'Enviar Email de Prueba'}
        </Button>

        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900 space-y-1">
              <p className="font-medium">Información importante:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Las notificaciones se enviarán desde el correo configurado en el sistema</li>
                <li>Puedes agregar múltiples destinatarios para recibir las notificaciones</li>
                <li>Los cambios se aplican inmediatamente después de guardar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
