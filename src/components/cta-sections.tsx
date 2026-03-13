import CTAImage from "@/assets/cta-image.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="bg-muted relative grid grid-cols-1 flex-col justify-between gap-4 overflow-hidden rounded-lg text-center lg:grid-cols-2 lg:flex-row lg:gap-10 lg:text-start">
          <header className="flex flex-col px-4 py-10 lg:px-10">
            <div className="mb-4 space-y-4">
              <h3 className="font-heading text-3xl text-balance md:text-4xl">
                Ready to Transform Your Class?
              </h3>
              <p className="text-muted-foreground md:text-lg">
                Join thousands of satisfied customers who have optimized their
                classrooms and boosted conversions with AttendX.
              </p>
            </div>
            <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row! lg:justify-start">
              <div className="flex justify-center gap-2">
                <Button asChild>
                  <Link to="/login">Start Free Trial</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/pricing">See our planes</Link>
                </Button>
              </div>
            </div>
          </header>
          <figure className="relative lg:mt-10 lg:self-end">
            <img
              className="lg:rounded-te-none aspect-video w-full rounded-tl-lg rounded-tr-lg object-cover lg:rounded-tr-none"
              width={300}
              height={300}
              src={CTAImage}
              alt="shadcn landing page"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
