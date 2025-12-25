
import { useState, useEffect } from 'react';
import { useAdminRestaurant } from '@/context/AdminContext';
import { tablesApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Plus, QrCode, Trash2, Edit, Loader2, Users } from 'lucide-react';
import { toast } from 'sonner';

export function TablesPage() {
    const { restaurant, isLoading: isRestaurantLoading } = useAdminRestaurant();
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Dialog States
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isQROpen, setIsQROpen] = useState(false);

    const [selectedTable, setSelectedTable] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({ name: '', capacity: '4' });

    useEffect(() => {
        if (restaurant?.id) {
            fetchTables();
        }
    }, [restaurant?.id]);

    const fetchTables = async () => {
        try {
            setLoading(true);
            const res = await tablesApi.getAll(restaurant.id);
            setTables(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load tables');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await tablesApi.create({ ...formData, restaurantId: restaurant.id });
            toast.success('Table created successfully');
            setIsAddOpen(false);
            setFormData({ name: '', capacity: '4' });
            fetchTables();
        } catch (error) {
            console.error(error);
            toast.error('Failed to create table');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTable) return;
        try {
            await tablesApi.update(selectedTable.id, { ...formData, restaurantId: restaurant.id });
            toast.success('Table updated successfully');
            setIsEditOpen(false);
            setSelectedTable(null);
            fetchTables();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update table');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This cannot be undone.')) return;
        try {
            await tablesApi.delete(id);
            toast.success('Table deleted');
            fetchTables();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete table');
        }
    };

    const openEdit = (table: any) => {
        setSelectedTable(table);
        setFormData({ name: table.name, capacity: table.capacity.toString() });
        setIsEditOpen(true);
    };

    const openQR = (table: any) => {
        setSelectedTable(table);
        setIsQROpen(true);
    };

    if (isRestaurantLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tables</h2>
                    <p className="text-muted-foreground">
                        Manage your restaurant tables and QR codes.
                    </p>
                </div>
                <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Table
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Tables</CardTitle>
                    <CardDescription>
                        A list of all tables in your restaurant.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div>
                    ) : tables.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No tables found. Create one to get started.</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tables.map((table) => (
                                    <TableRow key={table.id}>
                                        <TableCell className="font-medium">{table.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                {table.capacity}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openQR(table)}>
                                                    <QrCode className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(table)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(table.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Add Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Table</DialogTitle>
                        <DialogDescription>Create a new table for your floor plan.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Table Name/Number</Label>
                            <Input
                                id="name"
                                placeholder="Table 1"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity (Seats)</Label>
                            <Input
                                id="capacity"
                                type="number"
                                min="1"
                                value={formData.capacity}
                                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                            <Button type="submit">Create Table</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Table</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Table Name/Number</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-capacity">Capacity (Seats)</Label>
                            <Input
                                id="edit-capacity"
                                type="number"
                                min="1"
                                value={formData.capacity}
                                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                                required
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* QR Dialog */}
            <Dialog open={isQROpen} onOpenChange={setIsQROpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedTable?.name} QR Code</DialogTitle>
                        <DialogDescription>Scan to view menu or book this table.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg">
                        {/* QR Code generating URL specific to this table */}
                        {/* Example URL: https://app.com/{slug}/menu?tableId={id} */}
                        {selectedTable && (
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                    `${window.location.origin}/${restaurant?.slug}/menu?tableId=${selectedTable.id}`
                                )}`}
                                alt="Table QR Code"
                                className="w-48 h-48"
                            />
                        )}
                        <p className="mt-4 text-sm text-center text-muted-foreground break-all">
                            {selectedTable && `${window.location.origin}/${restaurant?.slug}/menu?tableId=${selectedTable.id}`}
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
