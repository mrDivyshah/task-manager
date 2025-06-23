
"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Users, Zap, Tag } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="w-full max-w-3xl mx-auto shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-card p-6 sm:p-8">
            <Button variant="outline" onClick={() => router.back()} className="self-start mb-6 text-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="relative h-48 w-full rounded-lg overflow-hidden mb-6 shadow-inner">
              <Image
                src="https://placehold.co/800x400.png"
                alt="TaskFlow Abstract Banner"
                layout="fill"
                objectFit="cover"
                data-ai-hint="productivity abstract"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/30 to-transparent flex items-end p-6">
                <CardTitle className="font-headline text-4xl sm:text-5xl text-primary-foreground drop-shadow-md">
                  About TaskFlow
                </CardTitle>
              </div>
            </div>
            <CardDescription className="text-lg text-muted-foreground text-center sm:text-left">
              Streamline your workflow, collaborate effectively, and achieve your goals with intelligent task management.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-8">
            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground flex items-center">
                <Sparkles className="mr-3 h-6 w-6 text-primary" />
                Our Mission
              </h2>
              <p className="text-base text-foreground/80 leading-relaxed">
                TaskFlow is designed to bring clarity and efficiency to your daily tasks. We believe that a well-organized workflow,
                powered by smart features, can transform productivity and reduce stress. Whether you're managing personal projects or
                collaborating with a team, TaskFlow provides the tools you need to stay on track.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground flex items-center">
                <Zap className="mr-3 h-6 w-6 text-primary" />
                Key Features
              </h2>
              <ul className="list-disc list-outside pl-5 space-y-2 text-base text-foreground/80">
                <li>
                  <strong className="text-foreground">Intuitive Task Management:</strong> Easily create, edit, and organize your tasks with a clean and user-friendly interface.
                </li>
                <li>
                  <strong className="text-foreground">Smart Sorting:</strong> Leverage AI to automatically categorize and prioritize your tasks based on their content.
                </li>
                <li>
                  <strong className="text-foreground">Priority Filtering & Search:</strong> Quickly find what you need with powerful search and priority-based filtering options.
                </li>
                <li>
                  <strong className="text-foreground">Team Collaboration (Advanced):</strong> Create and join teams to manage shared projects and tasks (available via Advanced Features).
                </li>
                <li>
                  <strong className="text-foreground">Customizable Experience:</strong> Choose your theme, notification preferences, and more to make TaskFlow yours.
                </li>
              </ul>
            </section>
            
            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground flex items-center">
                <Users className="mr-3 h-6 w-6 text-primary" />
                Built With
              </h2>
              <p className="text-base text-foreground/80 leading-relaxed">
                TaskFlow is proudly built using modern web technologies including Next.js, React, Tailwind CSS, ShadCN UI components for a polished look and feel, and Genkit for its intelligent features. We prioritize performance, accessibility, and a delightful user experience.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-2xl font-semibold text-foreground flex items-center">
                <Tag className="mr-3 h-6 w-6 text-primary" />
                Version Information
              </h2>
              <p className="text-base text-foreground/80 leading-relaxed">
                Current version: 0.1.0
              </p>
            </section>

            <div className="text-center pt-4">
              <p className="text-muted-foreground">
                Thank you for choosing TaskFlow!
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border/50">

        © 2025 TaskFlow. All rights reserved.
      </footer>
    </div>
  );
}

>>>>>>> master
