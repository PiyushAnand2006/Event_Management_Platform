'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ThankYouPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <Card className="w-full max-w-md border-0 px-8 py-10 text-center shadow-lg sm:px-12">
          <CardContent className="flex flex-col items-center gap-5 p-0">
            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.15,
              }}
            >
              <CheckCircle2 className="size-16 text-orange-600" strokeWidth={1.5} />
            </motion.div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Thank You!
              </h1>
              <p className="text-sm text-gray-500">
                Your request has been received. We&apos;ll get back to you
                shortly.
              </p>
            </div>

            {/* Countdown indicator */}
            <p className="text-xs text-gray-400">
              Redirecting to home in{' '}
              <span className="font-medium text-orange-600">{countdown}</span>{' '}
              seconds&hellip;
            </p>

            <Button
              asChild
              variant="outline"
              className="mt-2 w-full border-orange-600 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
            >
              <Link href="/">Go back to home</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
