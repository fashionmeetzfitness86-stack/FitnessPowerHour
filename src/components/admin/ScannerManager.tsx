import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QrCode, Search, CheckCircle, XCircle, User, Activity, AlertTriangle, PlayCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../../supabase';

interface ScannerManagerProps {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

export const ScannerManager = ({ showToast }: ScannerManagerProps) => {
  const [scanCode, setScanCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const simulateCameraScan = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      // For demonstration, fill with a mock pass
      setScanCode('PASS-LOCAL-883');
      setIsScanning(false);
    }, 1500);
  };

  const verifyPass = async () => {
    if (!scanCode) return;
    setIsScanning(true);
    setScanResult(null);

    try {
      // First check passes table
      const { data: passData, error: passError } = await supabase
        .from('passes')
        .select('*, profiles(full_name, role, profile_image)')
        .eq('token', scanCode)
        .single();
        
      if (passData) {
        // Validate expiration
        const isValid = new Date() < new Date(passData.expires_at) && passData.status === 'valid';
        if (isValid) {
          setScanResult({
            status: 'valid',
            passType: passData.pass_type,
            message: 'Access Granted. Pass verified.',
            user: passData.profiles || { full_name: 'Guest User', role: 'guest' }
          });
          showToast('Pass Validated', 'success');
        } else {
          setScanResult({
            status: 'invalid',
            message: 'Pass Expired or Used',
            reason: passData.status !== 'valid' ? 'Token revoked or used' : 'Token expired'
          });
          showToast('Invalid Pass Scanned', 'error');
        }
        return;
      }

      // Fallback: check profile tiers directly
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${scanCode},email.eq.${scanCode}`)
        .limit(1)
        .single();

      if (data) {
        // Valid local entry point simulation
        setScanResult({
          status: 'valid',
          user: data,
          passType: data.tier || 'FMF Member Pass',
          message: 'Access Granted'
        });
        showToast('Valid Credentials Detected', 'success');
      } else {
          setScanResult({
            status: 'invalid',
            message: 'Unrecognized Token',
            reason: 'Token not found in passes or member repository.'
          });
          showToast('Invalid Token Scanned', 'error');
      }
    } catch (err) {
      console.error(err);
      setScanResult({
        status: 'invalid',
        message: 'System Error',
        reason: 'Unable to decrypt token hash via network.'
      });
      showToast('Validation Failed', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-12 fade-in relative max-w-4xl mx-auto pt-8">
      <div className="text-center space-y-4">
        <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter">
          Nexus <span className="text-brand-teal">Scanner</span>
        </h2>
        <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold max-w-lg mx-auto leading-relaxed border border-brand-teal/20 bg-brand-teal/5 py-2 px-6 rounded-full">
          Optical Gateway Validation & Day Pass Authentication
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SCANNER VIEWPORT */}
        <div className="card-gradient p-10 rounded-[3rem] border border-brand-teal/20 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-teal/5 opacity-0 hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative w-64 h-64 border-2 border-dashed border-brand-teal/40 rounded-3xl flex flex-col items-center justify-center mb-8 group">
            {isScanning && (
              <motion.div 
                animate={{ y: [0, 240, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-[2px] bg-brand-teal shadow-[0_0_20px_#2DD4BF] z-10" 
              />
            )}
            <QrCode size={64} className="text-brand-teal/20 group-hover:scale-110 group-hover:text-brand-teal transition-all duration-500" />
            <p className="absolute bottom-4 text-[9px] uppercase tracking-widest text-white/20 font-black">Waiting for target...</p>
          </div>

          <div className="w-full space-y-4 z-10">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-teal" size={16} />
              <input
                type="text"
                placeholder="MANUAL ENTRY: ENTER PASS ID OR EMAIL"
                value={scanCode}
                onChange={(e) => setScanCode(e.target.value)}
                className="w-full bg-black/50 border border-brand-teal/30 rounded-2xl pl-12 pr-6 py-4 text-[10px] uppercase tracking-[0.2em] font-black outline-none focus:border-brand-teal focus:shadow-[0_0_20px_rgba(45,212,191,0.2)] transition-all text-brand-teal placeholder:text-white/20"
                onKeyDown={(e) => e.key === 'Enter' && verifyPass()}
              />
            </div>
            <div className="flex gap-4">
               <button 
                 onClick={simulateCameraScan}
                 className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] font-black uppercase tracking-widest py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
               >
                 <PlayCircle size={16} /> Optical Trigger
               </button>
               <button 
                 onClick={verifyPass}
                 className="flex-[2] bg-brand-teal hover:bg-[#20b8a5] text-black text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:scale-[1.02] flex items-center justify-center gap-2"
               >
                 <ShieldCheck size={16} /> Validate Token
               </button>
            </div>
          </div>
        </div>

        {/* VALIDATION RESULT PANEL */}
        <div className="card-gradient p-10 rounded-[3rem] border border-white/5 relative overflow-hidden">
          <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-white/40 border-b border-white/5 pb-4 mb-8">Decryption Output</h3>
          
          <AnimatePresence mode="wait">
            {!scanResult && !isScanning && (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="flex flex-col flex-1 items-center justify-center text-center h-[250px] opacity-20 grayscale"
               >
                  <Activity size={48} className="mb-4" />
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black">Awaiting Data Stream</p>
               </motion.div>
            )}

            {isScanning && (
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="flex flex-col flex-1 items-center justify-center text-center h-[250px]"
               >
                  <div className="w-12 h-12 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-[10px] uppercase tracking-[0.3em] font-black text-brand-teal animate-pulse">Analyzing Quantum Signature...</p>
               </motion.div>
            )}

            {scanResult && scanResult.status === 'valid' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 bg-brand-teal/10 p-4 rounded-2xl border border-brand-teal/20">
                   <div className="w-12 h-12 bg-brand-teal rounded-full flex items-center justify-center text-black flex-shrink-0">
                      <CheckCircle size={24} />
                   </div>
                   <div>
                     <p className="text-xl font-black uppercase tracking-tight text-brand-teal">{scanResult.message}</p>
                     <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60">{scanResult.passType}</p>
                   </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-white/5">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                         {scanResult.user?.profile_image ? (
                           <img src={scanResult.user.profile_image} alt="profile" className="w-full h-full object-cover rounded-xl" />
                         ) : <User size={20} />}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight">{scanResult.user?.full_name || 'Anonymous'}</p>
                        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Privilege: {scanResult.user?.role?.replace('_', ' ') || 'Guest'}</p>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {scanResult && scanResult.status === 'invalid' && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 bg-brand-coral/10 p-4 rounded-2xl border border-brand-coral/20">
                   <div className="w-12 h-12 bg-brand-coral rounded-full flex items-center justify-center text-black flex-shrink-0">
                      <XCircle size={24} />
                   </div>
                   <div>
                     <p className="text-xl font-black uppercase tracking-tight text-brand-coral">{scanResult.message}</p>
                     <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60">{scanResult.reason}</p>
                   </div>
                </div>
                
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-start gap-4 mt-8">
                  <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[9px] uppercase tracking-widest text-white/60 font-bold leading-relaxed">
                    Protocol breach detected. Verify entry code. If unresolved, pass may be generated in staging environment or expired.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
