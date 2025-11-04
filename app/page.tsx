"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Users, Recycle, ArrowRight, Sparkles, Trophy, Heart } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94] as const
      }
    }
  }

  return (
    <div className="flex min-h-svh flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-6 py-24 text-center bg-linear-to-br from-primary/10 via-background to-secondary/10">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-10 left-10 w-20 h-20 bg-primary/5 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, 120, 0],
              rotate: [0, -180, -360]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute bottom-10 right-10 w-32 h-32 bg-secondary/5 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-r from-primary/10 to-secondary/10 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative max-w-4xl space-y-8 z-10"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
            <span className="text-sm font-medium bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              Join 10,000+ students already saving money!
            </span>
            <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-bold tracking-tight text-balance bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent"
          >
            Exchange Books with
            <motion.span
              animate={{
                color: ["#667eea", "#764ba2", "#667eea"]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="block mt-2"
            >
              Fellow Students
            </motion.span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto leading-relaxed"
          >
            Save money, reduce waste, and connect with students at your university. 
            Buy, sell, or exchange textbooks with our <strong>gamified platform</strong> and 
            <strong> smart recommendations</strong>.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" className="bg-linear-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-6 text-lg">
                <Link href="/auth/sign-up">
                  🚀 Get Started Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild variant="outline" size="lg" className="px-8 py-6 text-lg border-2">
                <Link href="/marketplace">
                  📚 Browse Books
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Level up by sharing</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span>Build your reputation</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span>Earn badges & rewards</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose BookSwap?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              More than just a marketplace - it's a gamified community experience
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Smart Recommendations",
                description: "AI-powered book suggestions based on your courses and preferences. Level up as you share more books!",
                color: "from-blue-500 to-purple-500",
                badge: "🎯 Smart AI"
              },
              {
                icon: Users,
                title: "Gamified Community",
                description: "Earn XP, unlock badges, and build your reputation. Connect with students and compete on leaderboards!",
                color: "from-green-500 to-teal-500",
                badge: "🏆 Level Up"
              },
              {
                icon: Recycle,
                title: "Sustainable Impact",
                description: "Track your environmental impact and money saved. Join the eco-warrior movement on campus!",
                color: "from-orange-500 to-red-500",
                badge: "🌱 Eco-Friendly"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10, scale: 1.02 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.2,
                  type: "spring",
                  stiffness: 300
                }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-2 border-transparent hover:border-primary/20 transition-all duration-300 group overflow-hidden relative">
                  {/* Gradient background overlay */}
                  <div className={`absolute inset-0 bg-linear-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <CardContent className="flex flex-col items-center gap-6 p-8 text-center relative z-10">
                    <div className="relative">
                      <motion.div
                        whileHover={{ 
                          rotate: 360,
                          scale: 1.1
                        }}
                        transition={{ duration: 0.5 }}
                        className={`rounded-full bg-linear-to-br ${feature.color} p-4 text-white shadow-lg`}
                      >
                        <feature.icon className="h-8 w-8" />
                      </motion.div>
                      
                      {/* Floating badge */}
                      <motion.div
                        animate={{
                          y: [0, -5, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute -top-2 -right-2 bg-white border-2 border-primary/20 rounded-full px-2 py-1 text-xs font-medium shadow-md"
                      >
                        {feature.badge}
                      </motion.div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="ghost" 
                        className="group-hover:bg-primary/10 group-hover:text-primary transition-all"
                      >
                        Learn More →
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-muted/50">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to start exchanging?</h2>
          <p className="text-muted-foreground">Join thousands of students already saving money on textbooks.</p>
          <Button asChild size="lg">
            <Link href="/auth/sign-up">Create Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-6 px-6">
        <div className="mx-auto max-w-6xl flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center text-sm text-muted-foreground">
          <p>&copy; 2025 BookSwap. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-foreground">
              About
            </Link>
            <Link href="#" className="hover:text-foreground">
              Contact
            </Link>
            <Link href="#" className="hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
