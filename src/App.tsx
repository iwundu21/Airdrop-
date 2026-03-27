import React, { useMemo, useState, useEffect } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { 
  SolanaMobileWalletAdapter,
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  createDefaultWalletNotFoundHandler
} from '@solana-mobile/wallet-adapter-mobile';
import {
  WalletModalProvider,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Zap, 
  Trophy, 
  Search, 
  ArrowRight, 
  Wallet, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { cn } from './lib/utils';

// Constants
const XP_PER_TX = 5;
const RPC_ENDPOINT = clusterApiUrl(WalletAdapterNetwork.Mainnet);

function Dashboard() {
  const { publicKey, connected } = useWallet();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    txCount: number;
    xp: number;
    scannedAt: Date;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanWallet = async () => {
    if (!publicKey) return;
    
    setIsScanning(true);
    setError(null);
    
    try {
      const connection = new Connection(RPC_ENDPOINT);
      // Fetch signatures for the address
      // We limit to 1000 for performance and rate limits
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 1000 });
      console.log('Signatures found:', signatures);
      
      const txCount = signatures.length;
      const xp = txCount * XP_PER_TX;
      
      setScanResult({
        txCount,
        xp,
        scannedAt: new Date(),
      });
    } catch (err) {
      console.error('Scan error:', err);
      setError('Failed to scan wallet. Please try again later.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-8 md:p-12 mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Wallet Dashboard</h2>
            <p className="text-white/60">Connected: <span className="text-white font-mono">{publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}</span></p>
          </div>
          <WalletMultiButton className="wallet-adapter-button" />
        </div>

        {!scanResult && !isScanning && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Ready to scan your activity?</h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              We'll analyze your on-chain history and reward you with XP for every transaction found.
            </p>
            <button
              onClick={scanWallet}
              className="bg-white text-black px-8 py-4 rounded-full font-bold flex items-center gap-2 mx-auto hover:bg-white/90 transition-all active:scale-95"
            >
              <Search className="w-5 h-5" />
              Scan Address
            </button>
          </div>
        )}

        {isScanning && (
          <div className="text-center py-12">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-white/10 border-t-white rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white/40" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-2">Scanning Blockchain...</h3>
            <p className="text-white/60">Retrieving your transaction history...</p>
          </div>
        )}

        {scanResult && !isScanning && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-dark rounded-2xl p-6 flex items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-white/40 text-sm uppercase tracking-wider font-semibold">Total Transactions</p>
                  <h4 className="text-4xl font-bold">{scanResult.txCount}</h4>
                </div>
              </div>
              <div className="glass-dark rounded-2xl p-6 flex items-center gap-6 border-white/20">
                <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                  <Zap className="w-8 h-8 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white/40 text-sm uppercase tracking-wider font-semibold">Total XP Earned</p>
                  <h4 className="text-4xl font-bold text-yellow-400">{scanResult.xp.toLocaleString()}</h4>
                </div>
              </div>
            </div>
            
            <div className="glass-dark rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-white/80">Scan completed successfully at {scanResult.scannedAt.toLocaleTimeString()}</span>
              </div>
              <button 
                onClick={scanWallet}
                className="text-white/60 hover:text-white flex items-center gap-2 text-sm transition-colors"
              >
                <Search className="w-4 h-4" />
                Rescan Wallet
              </button>
            </div>

            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                Available Tasks
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { title: "Follow Exnus on X", reward: "500 XP", status: "Available", icon: ArrowRight },
                  { title: "Join Discord Community", reward: "1000 XP", status: "Available", icon: ArrowRight },
                  { title: "Refer 3 Friends", reward: "2500 XP", status: "0/3", icon: ArrowRight },
                  { title: "Hold 1.0 SOL", reward: "5000 XP", status: "Verified", icon: CheckCircle2 }
                ].map((task, i) => (
                  <div key={i} className="glass-dark rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <task.icon className={cn("w-5 h-5", task.status === "Verified" ? "text-green-400" : "text-white/40")} />
                      </div>
                      <div>
                        <h5 className="font-semibold">{task.title}</h5>
                        <p className="text-xs text-white/40">{task.reward}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      task.status === "Verified" ? "bg-green-400/10 text-green-400" : "bg-white/10 text-white/60"
                    )}>
                      {task.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Shield, title: "Verified", desc: "On-chain verification" },
          { icon: Trophy, title: "Rewards", desc: "Exclusive airdrops" },
          { icon: Zap, title: "Instant", desc: "Real-time XP calculation" }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (i + 1) }}
            className="glass rounded-2xl p-6 text-center"
          >
            <item.icon className="w-8 h-8 mx-auto mb-4 text-white/60" />
            <h4 className="font-bold mb-1">{item.title}</h4>
            <p className="text-sm text-white/40">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-wine-accent/30 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-wine-accent/20 blur-[120px] rounded-full" />
      
      <nav className="relative z-10 flex items-center justify-between px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <Zap className="text-black w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tighter">EXNUS HUB</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <a href="#" className="hover:text-white transition-colors">Ecosystem</a>
          <a href="#" className="hover:text-white transition-colors">Rewards</a>
          <a href="#" className="hover:text-white transition-colors">Community</a>
          <a href="#" className="hover:text-white transition-colors">Governance</a>
        </div>
        <WalletMultiButton className="wallet-adapter-button" />
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter mb-8">
              THE NEXT GEN <br />
              <span className="text-white/40 italic">COMMUNITY</span> <br />
              AIRDROP HUB
            </h1>
            <p className="text-xl text-white/60 mb-12 max-w-lg leading-relaxed">
              Connect your Solana wallet, scan your on-chain activity, and claim your share of the Exnus ecosystem rewards.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <WalletMultiButton className="wallet-adapter-button !h-14 !px-10" />
              <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors font-semibold py-4 px-6">
                Learn More <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="glass rounded-[40px] p-8 aspect-square flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="flex justify-between items-start relative z-10">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Activity className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">Network Status</p>
                  <p className="text-sm font-bold">OPTIMAL</p>
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-sm font-bold text-white/40 uppercase tracking-widest mb-2">Current XP Multiplier</p>
                <h3 className="text-7xl font-bold tracking-tighter">5.0X</h3>
                <p className="text-white/60 mt-4">Earn 5 XP for every transaction found on your wallet address.</p>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-wine bg-wine-light flex items-center justify-center overflow-hidden">
                      <img src={`https://picsum.photos/seed/${i + 10}/40/40`} alt="user" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <span className="text-sm font-bold text-white/60">+12k joined today</span>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div 
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 glass p-6 rounded-2xl hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                  <Trophy className="text-yellow-400 w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Top Reward</p>
                  <p className="text-sm font-bold">10,000 $EXNS</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -left-10 glass p-6 rounded-2xl hidden md:block"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-400/20 rounded-lg flex items-center justify-center">
                  <Shield className="text-blue-400 w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase">Security</p>
                  <p className="text-sm font-bold">Audit Passed</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-white/40 text-sm">© 2026 Exnus Hub. All rights reserved.</p>
        <div className="flex items-center gap-8">
          <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Twitter</a>
          <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Discord</a>
          <a href="#" className="text-white/40 hover:text-white transition-colors text-sm">Docs</a>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => RPC_ENDPOINT, []);

  const wallets = useMemo(
    () => [
      new SolanaMobileWalletAdapter({
        addressSelector: createDefaultAddressSelector(),
        appIdentity: {
          name: 'Exnus Hub',
          uri: window.location.origin,
          icon: 'favicon.ico',
        },
        authorizationResultCache: createDefaultAuthorizationResultCache(),
        cluster: 'mainnet-beta',
        onWalletNotFound: createDefaultWalletNotFoundHandler(),
      }),
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={(error) => console.error('Wallet error:', error)}>
        <WalletModalProvider>
          <AppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function AppContent() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {connected ? (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard />
          </motion.div>
        ) : (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LandingPage />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
