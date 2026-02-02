import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, Smartphone, Lock, Key, ArrowRight } from 'lucide-react';
import api from '@/services/api';

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiService = api;

  // Étape 1 : Envoi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !phone.trim()) {
      setError('Nom et numéro requis');
      return;
    }
    setLoading(true);
    try {
      const data = await apiService.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), phone_number: phone.trim() })
      });
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Étape 2 : Vérification OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.length < 4) {
      setError('Code OTP requis');
      return;
    }
    setLoading(true);
    try {
      const data = await apiService.request('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone_number: phone.trim(), otp: otp.trim() })
      });
      console.log('OTP vérifié avec succès:', data);
      setStep(3);
    } catch (err) {
      console.error('Erreur vérification OTP:', err);
      setError(err.message);
    }
    setLoading(false);
  };

  // Étape 3 : Création PIN
  const handleSetPin = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[0-9]{4}$/.test(pin) || pin !== pinConfirm) {
      setError('Le code PIN doit contenir 4 chiffres et être confirmé');
      return;
    }
    setLoading(true);
    try {
      const data = await apiService.request('/auth/set-pin', {
        method: 'POST',
        body: JSON.stringify({ phone_number: phone.trim(), name: name.trim(), pin })
      });
      console.log('Compte créé avec succès:', data);
      try { localStorage.setItem('prefill_phone', phone.trim()); } catch {}
      window.location.href = '/login';
    } catch (err) {
      console.error('Erreur création compte:', err);
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4 ">
      <div className="w-full max-w-md ">
        <div className="text-center mb-8 ">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 ">
            <Store className="w-8 h-8 text-purple-600 " />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 ">LiveShop Link</h1>
          <p className="text-purple-100 ">Créer mon compte vendeur</p>
        </div>
        <Card className="shadow-2xl ">
          <CardHeader className="text-center ">
            <CardTitle className="text-2xl ">Inscription</CardTitle>
            <CardDescription>
              {step === 1 && 'Entrez vos informations'}
              {step === 2 && 'Vérifiez le code reçu sur WhatsApp'}
              {step === 3 && 'Choisissez un code PIN à 4 chiffres'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm ">{error}</div>
            )}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-6 ">
                <div className="space-y-2 ">
                  <Label htmlFor="name">Nom</Label>
                  <Input id="name" type="text" placeholder="Votre nom" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className="space-y-2 ">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <div className="relative ">
                    <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400 " />
                    <Input id="phone" type="tel" placeholder="Ex: 771234567 (prefixe +221 ajouté)" value={phone} onChange={e => setPhone(e.target.value)} className="pl-10 " required />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 " disabled={loading}>
                  {loading ? 'Envoi...' : 'Recevoir le code'}
                </Button>
              </form>
            )}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6 ">
                <div className="space-y-2 ">
                  <Label htmlFor="otp">Code reçu par WhatsApp</Label>
                  <div className="relative ">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400 " />
                    <Input id="otp" type="text" inputMode="numeric" maxLength={6} placeholder="Code OTP" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="pl-10 text-center tracking-widest text-lg " required />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 " disabled={loading}>
                  {loading ? 'Vérification...' : 'Valider'}
                </Button>
              </form>
            )}
            {step === 3 && (
              <form onSubmit={handleSetPin} className="space-y-6 ">
                <div className="space-y-2 ">
                  <Label htmlFor="pin">Code PIN</Label>
                  <div className="relative ">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 " />
                    <Input id="pin" type="password" inputMode="numeric" maxLength={4} placeholder="••••" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} className="pl-10 text-center tracking-widest text-lg " required />
                  </div>
                </div>
                <div className="space-y-2 ">
                  <Label htmlFor="pin-confirm">Confirmer le code PIN</Label>
                  <div className="relative ">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 " />
                    <Input id="pin-confirm" type="password" inputMode="numeric" maxLength={4} placeholder="••••" value={pinConfirm} onChange={e => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))} className="pl-10 text-center tracking-widest text-lg " required />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 " disabled={loading}>
                  {loading ? 'Création...' : 'Créer mon compte'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <div className="text-center mt-6 ">
          <p className="text-purple-100 text-sm ">
            © 2025 LiveShop Link - Votre solution de live commerce
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 