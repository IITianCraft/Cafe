import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/api';

interface ImageUploaderProps {
    value?: string;
    onChange: (url: string) => void;
    label?: string;
    className?: string;
}

export function ImageUploader({ value, onChange, label, className }: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast({ title: 'Invalid file type', description: 'Please upload an image file', variant: 'destructive' });
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ title: 'File too large', description: 'Image text must be less than 5MB', variant: 'destructive' });
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/api/uploads/file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                onChange(response.data.data.url);
                toast({ title: 'Image uploaded successfully' });
            } else {
                throw new Error(response.data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast({ title: 'Upload failed', description: 'Please try again', variant: 'destructive' });
        } finally {
            setIsUploading(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleClear = () => {
        onChange('');
    };

    return (
        <div className={className}>
            {label && <label className="text-sm font-medium mb-2 block">{label}</label>}

            {!value ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`
            border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center 
            cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
          `}
                >
                    {isUploading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-2" />
                    ) : (
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    )}
                    <p className="text-sm text-muted-foreground text-center">
                        {isUploading ? 'Uploading...' : 'Click to upload or drag image'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Max 5MB (JPG, PNG, WEBP)
                    </p>
                </div>
            ) : (
                <div className="relative group rounded-lg overflow-hidden border">
                    <img
                        src={value}
                        alt="Uploaded preview"
                        className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Change
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={handleClear}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}

            <Input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
            />
        </div>
    );
}
