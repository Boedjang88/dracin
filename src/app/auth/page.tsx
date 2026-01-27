'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Github, Mail, Lock, ArrowRight, Loader2, AlertCircle, PlayCircle } from 'lucide-react'

export default function AuthPage() {
    const router = useRouter()
    const [isLogin, setIsLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    // Form state
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            if (isLogin) {
                const res = await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                })

                if (res?.error) {
                    setError('Invalid email or password')
                } else {
                    router.push('/')
                    router.refresh()
                }
            } else {
                setError('Registration temporarily disabled. Please login or use social auth.')
            }
        } catch (error) {
            setError('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSocialLogin = (provider: 'google' | 'github') => {
        setIsLoading(true)
        signIn(provider, { callbackUrl: '/' })
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black text-white">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop')] bg-cover bg-center opacity-60 scale-105 animate-pulse-slow" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/30" />
                <div className="absolute inset-0 backdrop-blur-[2px]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-md px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-heavy rounded-2xl p-8 shadow-2xl border-white/10"
                >
                    {/* Header */}
                    <div className="text-center mb-8 space-y-2">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 mb-4"
                        >
                            <PlayCircle size={32} className="text-red-500 fill-red-500/20" />
                            <span className="text-3xl font-bold tracking-tighter text-white">DRACIN</span>
                        </motion.div>
                        <h1 className="text-2xl font-bold tracking-tight text-white/90">
                            {isLogin ? 'Welcome back' : 'Join the community'}
                        </h1>
                        <p className="text-sm text-zinc-400">
                            {isLogin ? 'Enter your credentials to continue' : 'Start your streaming journey today'}
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2"
                                >
                                    <AlertCircle size={16} />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-4">
                            {!isLogin && (
                                <div className="group relative">
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 pl-10 transition-all text-white placeholder-zinc-500"
                                        placeholder="Full Name"
                                        required
                                    />
                                    <div className="absolute left-3 top-3.5 text-zinc-500 group-focus-within:text-white transition-colors">
                                        <div className="w-4 h-4 rounded-full border-2 border-current" />
                                    </div>
                                </div>
                            )}

                            <div className="group relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 pl-10 transition-all text-white placeholder-zinc-500"
                                    placeholder="Email Address"
                                    required
                                />
                                <div className="absolute left-3 top-3.5 text-zinc-500 group-focus-within:text-white transition-colors">
                                    <Mail size={18} />
                                </div>
                            </div>

                            <div className="group relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-900/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 pl-10 transition-all text-white placeholder-zinc-500"
                                    placeholder="Password"
                                    required
                                    minLength={6}
                                />
                                <div className="absolute left-3 top-3.5 text-zinc-500 group-focus-within:text-white transition-colors">
                                    <Lock size={18} />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] mt-2"
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0a0a0a] px-2 text-zinc-500 rounded-full">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 h-11 bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 hover:border-white/10 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            <span className="text-sm">Google</span>
                        </button>
                        <button
                            onClick={() => handleSocialLogin('github')}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 h-11 bg-zinc-800/50 hover:bg-zinc-800 border border-white/5 hover:border-white/10 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            <Github size={20} />
                            <span className="text-sm">GitHub</span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-zinc-400">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-white font-semibold hover:underline decoration-white/30 underline-offset-4"
                            >
                                {isLogin ? 'Sign up' : 'Log in'}
                            </button>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
