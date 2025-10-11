import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Lock, Key } from 'lucide-react';
import api from '../services/api';

const RegisterSteps = ({ onDone }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+221');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [showOtpMsg, setShowOtpMsg] = useState(false);

  // Fonction pour formater le numéro de téléphone
  const formatPhoneNumber = (value) => {
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Si ça ne commence pas par +221, l'ajouter automatiquement
    if (!cleaned.startsWith('+221')) {
      if (cleaned.startsWith('221')) {
        cleaned = '+' + cleaned;
      } else {
        cleaned = '+221' + cleaned.replace(/^\+/, '');
      }
    }
    
    // Limiter à 13 caractères (+221 + 9 chiffres)
    if (cleaned.length > 13) {
      cleaned = cleaned.substring(0, 13);
    }
    
    return cleaned;
  };

  // Fonction pour gérer le changement du numéro de téléphone
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (!name.trim() || !phone.trim()) {
      setError('Nom et numéro requis');
      return;
    }
    setLoading(true);
    try {
      const res = await api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), phone_number: phone.trim() })
      });
      setDebugOtp(res.otp || '');
      setShowOtpMsg(true);
      setTimeout(() => setShowOtpMsg(false), 7000);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (!otp.trim() || otp.length < 4) {
      setError('Code OTP requis');
      return;
    }
    setLoading(true);
    try {
      await api.request('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone_number: phone.trim(), otp: otp.trim() })
      });
      setStep(3);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSetPin = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (!/^[0-9]{4}$/.test(pin) || pin !== pinConfirm) {
      setError('Le code PIN doit contenir 4 chiffres et être confirmé');
      return;
    }
    setLoading(true);
    try {
      await api.request('/auth/set-pin', {
        method: 'POST',
        body: JSON.stringify({ phone_number: phone.trim(), name: name.trim(), pin })
      });
      const normalized = phone.trim();
      try { localStorage.setItem('prefill_phone', normalized); } catch {}
      if (onDone) onDone(normalized); else window.location.href = '/login';
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
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
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="771234567" 
                  value={phone} 
                  onChange={handlePhoneChange} 
                  className="pl-10 " 
                  required 
                />
              </div>
              <p className="text-xs text-gray-500">Le préfixe +221 est ajouté automatiquement</p>
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
            {debugOtp && (
              <div className="mt-2 text-center">
                <span className="inline-block bg-blue-100 text-blue-700 rounded px-3 py-1 text-xs font-mono">Code debug : {debugOtp}</span>
              </div>
            )}
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
      {/* Toast OTP debug façon message reçu */}
      {showOtpMsg && debugOtp && (
        <div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-xl rounded-2xl px-6 py-4 flex flex-col items-center w-[90vw] max-w-xs animate-fade-in-up border border-blue-100"
          style={{ minWidth: 220 }}
        >
          <div className="flex items-center mb-1">
            <span className="text-blue-500 text-xl mr-2">📩</span>
            <span className="font-medium text-gray-800 text-sm">Votre code LiveShop Link :</span>
          </div>
          <span className="font-mono text-2xl text-blue-700 tracking-widest">{debugOtp}</span>
        </div>
      )}
    </CardContent>
  );
};

export default RegisterSteps; 