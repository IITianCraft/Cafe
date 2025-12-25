import { UserLayout } from '@/components/layout/UserLayout';
import { Card, CardContent } from '@/components/ui/card';
import { UtensilsCrossed, Users, Award, Heart, Loader2 } from 'lucide-react';
import { useRestaurant } from '@/context/RestaurantContext';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  UtensilsCrossed,
  Users,
  Award,
  Heart,
};

export default function About() {
  const { restaurant, isLoading } = useRestaurant();
  const aboutPage = restaurant?.settings?.aboutPage;

  if (isLoading) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </UserLayout>
    );
  }

  if (!aboutPage) {
    return (
      <UserLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p>No content available.</p>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      {/* Hero */}
      <section className="relative py-20 bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=600&fit=crop')] bg-cover bg-center opacity-20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Our Story
          </h1>
          <p className="text-primary-foreground/90 max-w-2xl mx-auto text-lg">
            A journey of passion, flavor, and unforgettable experiences
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold mb-6">
                {aboutPage.storyTitle}
              </h2>
              <div className="space-y-4 text-muted-foreground">
                {aboutPage.storyParagraphs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {aboutPage.storyImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Story image ${i + 1}`}
                  className={`rounded-lg shadow-lg ${i === 1 ? 'mt-8' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {aboutPage.stats.map((stat, i) => (
              <Card key={i} className="text-center">
                <CardContent className="pt-6">
                  <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* Values */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do, from sourcing ingredients to serving your table
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {aboutPage.values.map((value, i) => {
              const Icon = iconMap[value.icon] || Heart;
              return (
                <Card key={i} className="card-hover">
                  <CardContent className="pt-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground">The passionate people behind your favorite dishes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {aboutPage.team.map((member, i) => (
              <Card key={i} className="overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full aspect-square object-cover"
                />
                <CardContent className="text-center py-4">
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </UserLayout>
  );
}