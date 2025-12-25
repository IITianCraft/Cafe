import { MessageCircle } from 'lucide-react';

export function WhatsAppButton() {
  const whatsappNumber = '919876543210';
  const message = encodeURIComponent('Hi! I would like to place an order from Cafe Resto.');
  
  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-btn"
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}
