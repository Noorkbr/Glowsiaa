import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/layout/Navbar'

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('processing') // processing | success | failed
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    const paymentID = searchParams.get('paymentID')
    const ref = searchParams.get('ref')
    const method = searchParams.get('method')
    const currentPath = window.location.pathname

    const processPayment = async () => {
      try {
        if (currentPath.includes('success')) {
          if (method === 'bkash' && paymentID) {
            // Execute bKash payment
            const { data } = await api.post('/payments/bkash/execute', { paymentID })
            if (data.success) {
              setOrderId(data.orderId || '')
              setStatus('success')
              return
            }
          } else if (method === 'nagad' && ref) {
            const { data } = await api.post('/payments/nagad/verify', { paymentRefId: ref })
            if (data.success) {
              setStatus('success')
              return
            }
          } else {
            setStatus('success')
            return
          }
          setStatus('failed')
        } else if (currentPath.includes('cancelled')) {
          setStatus('cancelled')
        } else {
          setStatus('failed')
        }
      } catch {
        setStatus('failed')
      }
    }

    processPayment()
  }, [searchParams])

  const isSuccess = status === 'success'
  const isCancelled = status === 'cancelled'
  const isProcessing = status === 'processing'

  return (
    <div className="min-h-screen bg-midnight text-white">
      <Navbar />
      <main className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180 }}
          className="max-w-md"
        >
          {isProcessing ? (
            <>
              <Clock size={72} className="mx-auto text-glow-magenta animate-pulse" />
              <h1 className="mt-6 font-heading text-3xl font-bold text-white">Processing Payment…</h1>
              <p className="mt-3 text-white/60">Please wait while we verify your payment.</p>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 size={72} className="mx-auto text-emerald-400" />
              <h1 className="mt-6 font-heading text-3xl font-bold text-white">Payment Successful! 🎉</h1>
              <p className="mt-3 text-white/70">Your order has been confirmed and will be delivered soon.</p>
              {orderId && (
                <p className="mt-2 text-sm text-white/55">Order ID: <strong className="text-white">{orderId}</strong></p>
              )}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                {orderId && (
                  <Link to={`/orders/${orderId}`}
                    className="rounded-full bg-glow-magenta px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-white"
                    style={{ boxShadow: '0 0 24px rgba(213,16,110,0.4)' }}>
                    Track Order
                  </Link>
                )}
                <Link to="/products"
                  className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/5">
                  Continue Shopping
                </Link>
              </div>
            </>
          ) : (
            <>
              <XCircle size={72} className="mx-auto text-red-400" />
              <h1 className="mt-6 font-heading text-3xl font-bold text-white">
                {isCancelled ? 'Payment Cancelled' : 'Payment Failed'}
              </h1>
              <p className="mt-3 text-white/70">
                {isCancelled
                  ? 'You cancelled the payment. Your order has not been placed.'
                  : 'Something went wrong. Your payment could not be processed.'}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link to="/"
                  className="rounded-full border border-white/20 px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/5">
                  Go Home
                </Link>
                <Link to="/products"
                  className="rounded-full bg-glow-magenta px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-white"
                  style={{ boxShadow: '0 0 24px rgba(213,16,110,0.4)' }}>
                  Try Again
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
}

