import React, { useState, useEffect } from 'react'
import axios from 'axios'
import QRCode from 'qrcode.react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { LogOut } from 'lucide-react'

const backendBaseUrl = typeof window !== 'undefined' ? `http://${window.location.hostname}:8000` : 'http://localhost:8000'

function DashboardPage({ onLogout }) {
  const [hasCheckedIn, setHasCheckedIn] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 30 : prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleCheckIn = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      await axios.post(
        `${backendBaseUrl}/api/attendance/check-in`,
        {},
        {
          headers: token
            ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            : { 'Content-Type': 'application/json' },
        }
      )
      setHasCheckedIn(true)
      toast.success('Attendance successfully checked in!')
      setTimeout(() => setHasCheckedIn(false), 3000)
    } catch (error) {
      toast.error('Check-in failed. Please try again.')
      console.error('Student check-in error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),_transparent_30%),#020617] text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Student Attendance</h1>
            <p className="mt-2 max-w-2xl text-slate-300">Scan the QR code or tap the button below to register your attendance in one click.</p>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-white transition hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-10 rounded-[36px] border border-white/10 bg-white/10 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl"
        >
          {hasCheckedIn && (
            <div className="mb-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-emerald-100">
              ✅ Attendance recorded successfully!
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-white">QR Check-in Live Pass</h2>
              <p className="mt-3 text-slate-300">Open your camera and scan this code from any registration station.</p>
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className="mt-8 inline-flex items-center justify-center rounded-[28px] bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:scale-[1.01] disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Attendance'}
              </button>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 text-center shadow-xl shadow-slate-950/40">
              <div className="inline-flex items-center justify-center rounded-3xl bg-slate-900/80 p-4">
                <QRCode value={`${backendBaseUrl}/api/attendance/check-in`} size={228} level="H" fgColor="#ffffff" bgColor="transparent" />
              </div>
              <div className="mt-6 rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-300">
                <p className="font-medium text-slate-100">QR Code refreshes every 30 seconds</p>
                <p className="mt-2 text-2xl font-semibold text-sky-300">{timeLeft}s</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardPage
