'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for getting started with small events.',
    features: [
      'Up to 3 events/month',
      'Basic venue builder',
      'Email support',
      '100 attendees/event',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29/mo',
    description: 'For growing teams that need more power and insights.',
    features: [
      'Unlimited events',
      'Advanced venue builder',
      'Priority support',
      '5,000 attendees/event',
      'Live engagement tools',
      'Analytics dashboard',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Tailored solutions for large-scale organizations.',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      '24/7 phone support',
      'Custom integrations',
      'SLA guarantee',
      'Unlimited attendees',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function PricingPage() {
  return (
    <section className="relative overflow-hidden bg-white">
      {/* Subtle background gradient */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Hero */}
      <div className="mx-auto max-w-3xl px-6 pb-4 pt-20 text-center md:pt-28">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
        >
          Simple, Transparent{' '}
          <span className="text-orange-600">Pricing</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-4 max-w-xl text-lg text-gray-500"
        >
          Choose the plan that fits your event needs. Upgrade or downgrade at
          any time — no hidden fees, no surprises.
        </motion.p>
      </div>

      {/* Pricing Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 pt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
      >
        {plans.map((plan) => (
          <motion.div key={plan.name} variants={itemVariants} className="flex">
            <Card
              className={`relative flex w-full flex-col ${
                plan.highlighted
                  ? 'border-2 border-orange-600 shadow-lg shadow-orange-600/10'
                  : 'border-gray-200'
              }`}
            >
              {/* Most Popular badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-orange-600 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-700">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="items-center text-center">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {plan.name}
                </CardTitle>
                <CardDescription className="mt-1">
                  {plan.description}
                </CardDescription>
                <div className="mt-4 flex items-baseline justify-center">
                  <span
                    className={`text-4xl font-extrabold tracking-tight ${
                      plan.highlighted ? 'text-orange-600' : 'text-gray-900'
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.price !== 'Free' && plan.price !== 'Custom' && (
                    <span className="ml-1 text-sm font-medium text-gray-400">
                      /month
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check
                        className={`mt-0.5 size-4 shrink-0 ${
                          plan.highlighted
                            ? 'text-orange-600'
                            : 'text-orange-500'
                        }`}
                        strokeWidth={2.5}
                      />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
