import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { restaurantApi } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface CreateRestaurantDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (restaurant: any) => void;
}

export function CreateRestaurantDialog({ open, onOpenChange, onSuccess }: CreateRestaurantDialogProps) {
    const [name, setName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await restaurantApi.create({ name });
            const newRestaurant = res.data.data;

            toast({
                title: "Success",
                description: `Restaurant "${newRestaurant.name}" created!`,
            });

            onSuccess(newRestaurant);
            onOpenChange(false);
            setName("");
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to create restaurant. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Restaurant</DialogTitle>
                    <DialogDescription>
                        Give your new restaurant a name. We'll generate a unique link for you.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g. Burger King"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Creating..." : "Create Restaurant"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
