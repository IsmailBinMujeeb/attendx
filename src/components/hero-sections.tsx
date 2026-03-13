import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import HeroImage from "@/assets/hero-image.jpg";

export default function HeroSection() {
  return (
    <section className="py-10 lg:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <header className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <Badge variant="outline">
              🚀 Track Faster
              <ArrowUpRight />
            </Badge>
            <h1 className="font-heading my-4 text-4xl text-balance md:text-5xl lg:leading-14">
              All-in-One Platform for Attendance
            </h1>
            <p className="text-muted-foreground mb-8 text-balance lg:text-lg">
              Streamline attendance, track metrics, and manage your classrooms
              with ease. Everything you need, in one powerful dashboard.
            </p>
            <div className="flex justify-center gap-2">
              <Button asChild>
                <Link to="/login">Start Free Trial</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/pricing">See our planes</Link>
              </Button>
            </div>
          </header>
          <img
            src={HeroImage}
            alt="Dashboard interface of the SaaS platform"
            className="aspect-square w-full rounded-md object-cover"
          />
        </div>
      </div>
    </section>
  );
}
