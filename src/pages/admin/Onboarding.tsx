import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChefHat, ArrowRight, Store, MapPin, Phone } from 'lucide-react';

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        cuisine: ''
    });

    const handleCreate = async () => {
        if (!formData.name) return;
        setLoading(true);
        try {
            await restaurantApi.create({
                name: formData.name,
            } as any);
            toast({ title: "Restaurant Created!", description: "Welcome to your new dashboard." });
            navigate('/admin');
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to create restaurant.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
            <div className="mb-8 text-center">
                <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                    <ChefHat className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-display font-bold">Welcome to NutriDash</h1>
                <p className="text-muted-foreground mt-2">Let's get your restaurant set up in minutes.</p>
            </div>

            <Card className="w-full max-w-lg shadow-lg border-primary/10">
                <CardHeader>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span className={step >= 1 ? "text-primary font-medium" : ""}>Step 1: Details</span>
                        <span className="w-4 h-px bg-border" />
                        <span className={step >= 2 ? "text-primary font-medium" : ""}>Step 2: Brand</span>
                    </div>
                    <CardTitle>{step === 1 ? "Restaurant Details" : "Review & Launch"}</CardTitle>
                    <CardDescription>
                        {step === 1 ? "Tell us about your business" : "Ready to go live?"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {step === 1 && (
                        <>
                            <div className="space-y-2">
                                <Label>Restaurant Name</Label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="e.g. The Burger Joint"
                                        className="pl-9"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Address (Optional)</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="123 Food Street"
                                        className="pl-9"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Phone (Optional)</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="+1 234 567 890"
                                        className="pl-9"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg space-y-2">
                                <p className="text-sm font-medium">Name: <span className="font-normal text-muted-foreground">{formData.name}</span></p>
                                <p className="text-sm font-medium">Address: <span className="font-normal text-muted-foreground">{formData.address || 'N/A'}</span></p>
                            </div>
                            <div className="space-y-2">
                                <Label>Cuisine / Category</Label>
                                <Input
                                    placeholder="e.g. Italian, Fast Food"
                                    value={formData.cuisine}
                                    onChange={e => setFormData({ ...formData, cuisine: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between">
                    {step === 1 ? (
                        <Button variant="ghost" className="opacity-0" disabled>Back</Button> // Spacer
                    ) : (
                        <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                    )}

                    {step === 1 ? (
                        <Button onClick={() => setStep(2)} disabled={!formData.name}>
                            Next <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleCreate} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Store className="w-4 h-4 mr-2" />}
                            Create Restaurant
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
