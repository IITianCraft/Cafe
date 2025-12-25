import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { QrCode, Download, Plus, Eye, Copy, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function QRCodesPage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const [newTableNumber, setNewTableNumber] = useState('');
  const baseUrl = window.location.origin;

  const handleAddTable = () => {
    const nextTable = tables.length > 0 ? Math.max(...tables) + 1 : 1;
    setTables([...tables, nextTable]);
    toast({ title: `Table ${nextTable} added` });
  };

  const handleRemoveTable = (table: number) => {
    setTables(tables.filter(t => t !== table));
    toast({ title: `Table ${table} removed` });
  };

  const handleCopyLink = (table: number) => {
    const link = `${baseUrl}/qr-menu?table=${table}`;
    navigator.clipboard.writeText(link);
    toast({ title: 'Link copied!', description: link });
  };

  const handleViewMenu = (table: number) => {
    navigate(`/qr-menu?table=${table}`);
  };

  const handleDownloadQR = (table: number) => {
    // Generate QR code using a simple SVG approach
    const qrData = `${baseUrl}/qr-menu?table=${table}`;
    
    // Create a simple QR placeholder for demo - in production use a QR library
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="60" height="60" fill="black"/>
        <rect x="30" y="30" width="40" height="40" fill="white"/>
        <rect x="40" y="40" width="20" height="20" fill="black"/>
        <rect x="120" y="20" width="60" height="60" fill="black"/>
        <rect x="130" y="30" width="40" height="40" fill="white"/>
        <rect x="140" y="40" width="20" height="20" fill="black"/>
        <rect x="20" y="120" width="60" height="60" fill="black"/>
        <rect x="30" y="130" width="40" height="40" fill="white"/>
        <rect x="40" y="140" width="20" height="20" fill="black"/>
        <rect x="90" y="90" width="20" height="20" fill="black"/>
        <text x="100" y="195" text-anchor="middle" font-size="12" fill="black">Table ${table}</text>
      </svg>
    `;
    
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `table-${table}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: `QR code downloaded for Table ${table}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">QR Codes</h1>
          <p className="text-muted-foreground">Generate QR codes for tables - customers scan to order</p>
        </div>
        <Button onClick={handleAddTable}>
          <Plus className="w-4 h-4 mr-2" />Add Table
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map((table) => (
          <Card key={table} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                <QrCode className="w-16 h-16 text-muted-foreground" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8"
                    onClick={() => handleViewMenu(table)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="h-8 w-8"
                    onClick={() => handleCopyLink(table)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold mb-1">Table {table}</h3>
              <p className="text-xs text-muted-foreground mb-3 truncate">{baseUrl}/qr-menu?table={table}</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDownloadQR(table)}
                >
                  <Download className="w-4 h-4 mr-1" />Download
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleRemoveTable(table)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-12">
          <QrCode className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-semibold mb-2">No tables configured</h3>
          <p className="text-muted-foreground mb-4">Add tables to generate QR codes</p>
          <Button onClick={handleAddTable}>
            <Plus className="w-4 h-4 mr-2" />Add First Table
          </Button>
        </div>
      )}
    </div>
  );
}