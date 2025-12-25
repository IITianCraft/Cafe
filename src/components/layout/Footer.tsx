import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { useRestaurant } from '@/context/RestaurantContext';

export function Footer() {
  const { restaurant } = useRestaurant();
  const settings = restaurant?.settings;

  if (!settings) return null;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const groupedHours = () => {
    const groups: { days: string; hours: string }[] = [];
    let currentGroup = { days: [] as string[], open: '', close: '' };

    (settings.openingHours || []).forEach((h, idx) => {
      if (currentGroup.open === h.open && currentGroup.close === h.close) {
        currentGroup.days.push(h.day);
      } else {
        if (currentGroup.days.length > 0) {
          const dayRange = currentGroup.days.length > 1
            ? `${currentGroup.days[0]} - ${currentGroup.days[currentGroup.days.length - 1]}`
            : currentGroup.days[0];
          groups.push({ days: dayRange, hours: `${formatTime(currentGroup.open)} - ${formatTime(currentGroup.close)}` });
        }
        currentGroup = { days: [h.day], open: h.open, close: h.close };
      }
      if (idx === (settings.openingHours?.length || 0) - 1 && currentGroup.days.length > 0) {
        const dayRange = currentGroup.days.length > 1
          ? `${currentGroup.days[0]} - ${currentGroup.days[currentGroup.days.length - 1]}`
          : currentGroup.days[0];
        groups.push({ days: dayRange, hours: `${formatTime(currentGroup.open)} - ${formatTime(currentGroup.close)}` });
      }
    });

    return groups;
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'facebook': return Facebook;
      case 'instagram': return Instagram;
      case 'twitter': return Twitter;
      default: return Facebook;
    }
  };

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {settings.logo ? (
                <img src={settings.logo} alt={settings.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-display font-bold text-lg">
                    {(settings.name || 'CR').slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="font-display text-xl font-semibold">{settings.name || restaurant?.name}</span>
            </div>
            <p className="text-background/70 text-sm">
              Experience the finest dining with our carefully crafted menu. Fresh ingredients, authentic flavors, and warm hospitality.
            </p>
            <div className="flex gap-4">
              {(settings.socialLinks || []).map((social) => {
                const Icon = getSocialIcon(social.platform);
                return (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-background/70 hover:text-primary transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: 'Home', path: `/${restaurant?.slug || ''}` },
                { name: 'Menu', path: `/${restaurant?.slug || ''}/menu` },
                { name: 'Reserve Table', path: `/${restaurant?.slug || ''}/reservations` },
                { name: 'About', path: `/${restaurant?.slug || ''}/about` },
                { name: 'Contact', path: `/${restaurant?.slug || ''}/contact` },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-background/70 hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-background/70">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-background/70">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>{settings.email}</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="font-display text-lg font-semibold mb-4">Opening Hours</h3>
            <ul className="space-y-2 text-sm text-background/70">
              {groupedHours().map((group, idx) => (
                <li key={idx} className="flex justify-between">
                  <span>{group.days}</span>
                  <span>{group.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center text-sm text-background/60">
          <p>© {new Date().getFullYear()} {settings.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}