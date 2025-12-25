import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, ChefHat } from 'lucide-react';

export default function PlatformLanding() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex flex-col">
            <header className="px-6 py-4 flex justify-between items-center border-b bg-background/50 backdrop-blur">
                <div className="flex items-center gap-2">
                    <ChefHat className="w-8 h-8 text-primary" />
                    <span className="font-display text-xl font-bold">NutriDash SaaS</span>
                </div>
                <div className="flex gap-4">
                    <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
                    <Button onClick={() => navigate('/register')}>Get Started</Button>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center text-center">
                <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-600">
                    Launch Your Restaurant <br /> App in Minutes
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mb-10">
                    The complete platform for managing your menu, orders, and delivery.
                    Create your branded restaurant page instantly.
                </p>

                <div className="flex gap-4 mb-20">
                    <Button size="lg" className="text-lg px-8 py-6" onClick={() => navigate('/register')}>
                        Create Your Restaurant
                    </Button>
                    <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={() => navigate('/login')}>
                        Admin Login
                    </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
                    <FeatureCard
                        title="Your Own Brand"
                        desc="Get a unique URL (e.g., app.com/my-cafe) with your own menu and theme."
                    />
                    <FeatureCard
                        title="Manage Orders"
                        desc="Real-time dashboard to track incoming orders and delivery status."
                    />
                    <FeatureCard
                        title="Digital Menu"
                        desc="Beautiful, mobile-responsive menu that customers love."
                    />
                </div>
            </main>
        </div>
    );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <CardDescription>{desc}</CardDescription>
            </CardContent>
        </Card>
    )
}
