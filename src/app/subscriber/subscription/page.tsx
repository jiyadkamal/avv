'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { UserRole } from '@/types';
import { CreditCard, CheckCircle2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FadeInView } from '@/lib/animations';
import { cn } from '@/lib/utils';

const plans = [
    {
        name: 'Monthly',
        price: '$9.99',
        period: '/month',
        features: ['Unlimited vehicle searches', 'Full accident history', 'Email alerts'],
        popular: false
    },
    {
        name: 'Annual',
        price: '$79.99',
        period: '/year',
        features: ['Everything in Monthly', 'Priority support', '2 months free'],
        popular: true
    },
];

export default function SubscriptionPage() {
    return (
        <DashboardLayout role={UserRole.SUBSCRIBER}>
            <FadeInView delay={0.1} className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Subscription</h1>
                    <p className="text-muted-foreground">Manage your subscription plan and billing.</p>
                </div>

                {/* Current Plan */}
                <Card className="border-none shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
                            <Zap className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground font-medium">Current Plan</p>
                            <p className="text-2xl font-bold">Free Trial</p>
                            <p className="text-sm text-muted-foreground">5 searches remaining</p>
                        </div>
                        <Button className="rounded-2xl h-12 px-8 font-bold">Upgrade Now</Button>
                    </CardContent>
                </Card>

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plans.map((plan, index) => (
                        <FadeInView key={plan.name} delay={0.2 + index * 0.1}>
                            <Card className={cn(
                                "border-none shadow-xl rounded-[2rem] overflow-hidden relative",
                                plan.popular && "ring-2 ring-primary"
                            )}>
                                {plan.popular && (
                                    <div className="absolute top-4 right-4">
                                        <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                <CardHeader className="p-8 pb-4">
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        <span className="text-muted-foreground">{plan.period}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 space-y-4">
                                    <ul className="space-y-3">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center gap-3 text-sm">
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button
                                        className={cn(
                                            "w-full h-12 rounded-2xl font-bold",
                                            !plan.popular && "bg-muted text-foreground hover:bg-muted/80"
                                        )}
                                        variant={plan.popular ? "default" : "secondary"}
                                    >
                                        Choose {plan.name}
                                    </Button>
                                </CardContent>
                            </Card>
                        </FadeInView>
                    ))}
                </div>
            </FadeInView>
        </DashboardLayout>
    );
}
