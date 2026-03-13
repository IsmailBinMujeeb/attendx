import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { testimonials } from "./data";

export default function TestimonialsSection() {
  return (
    <section className="bg-muted w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4">
        <header className="mx-auto max-w-xl space-y-2 text-center">
          <h2 className="font-heading text-4xl text-balance sm:text-4xl">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground text-balance lg:text-lg">
            Hear directly from the people who have experienced the impact of our
            product.
          </p>
        </header>
        <div className="mx-auto max-w-5xl py-12">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="flex h-full flex-col">
                    <CardContent className="flex grow flex-col items-center justify-center p-6 text-center">
                      <blockquote className="text-lg leading-snug lg:leading-normal">
                        &ldquo;{testimonial.quote}&rdquo;
                      </blockquote>
                      <div className="mt-6 flex flex-col items-center">
                        <Avatar className="size-12 border">
                          <AvatarImage
                            src={testimonial.avatar}
                            alt={`Avatar of ${testimonial.name}`}
                            className="object-cover"
                          />
                          <AvatarFallback>
                            {testimonial.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="mt-4">
                          <div className="font-semibold">
                            {testimonial.name}
                          </div>
                          <div className="text-muted-foreground text-sm">
                            {testimonial.title}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
