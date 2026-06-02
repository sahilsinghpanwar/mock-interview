'use client';
import React from 'react';
import { Brain, Mic, Sparkles, BarChart3, Shield, Target } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { FeatureCard } from '@/components/ui/grid-feature-cards';

const features = [
	{
		title: 'Gemini AI Engine',
		icon: Brain,
		description: 'Dynamically crafts industry-proven technical and behavioral questions tailored to your profile.',
	},
	{
		title: 'Natural Voice Calls',
		icon: Mic,
		description: 'Engage in natural, low-latency voice practice powered by Vapi audio stream integration.',
	},
	{
		title: 'Actionable Feedback',
		icon: Sparkles,
		description: 'Receive instant scorecard analysis, detailing technical answers, vocabulary, and grammar improvements.',
	},
	{
		title: 'Progress Dashboards',
		icon: BarChart3,
		description: 'Track your articulation, pacing, and confidence scores across multiple target roles over time.',
	},
	{
		title: 'GDPR Secured',
		icon: Shield,
		description: 'All audio transcripts and session grading data is securely isolated in your private Firebase db.',
	},
	{
		title: 'Adaptive Setup',
		icon: Target,
		description: 'Simply paste any job description or enter specialized tech roles to customize your experience.',
	},
];

export default function DemoOne() {
	return (
		<section id="features" className="py-16 md:py-32 relative overflow-hidden bg-black transition-colors duration-300">
			{/* Cohesive background grid pattern */}
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />

			<div className="mx-auto w-full max-w-5xl space-y-12 px-4 relative z-10">
				<AnimatedContainer className="mx-auto max-w-3xl text-center space-y-4">
					<span className="text-xs font-bold uppercase tracking-widest text-violet-500">Core Capabilities</span>
					<h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl">
						Power. Speed. Performance.
					</h2>
					<p className="text-[#868f97] text-sm md:text-base leading-relaxed max-w-xl mx-auto">
						Everything you need to master your engineering and product management panels.
					</p>
				</AnimatedContainer>

				<AnimatedContainer
					delay={0.3}
					className="grid grid-cols-1 divide-x divide-y divide-dashed divide-neutral-900 border border-dashed border-neutral-900 sm:grid-cols-2 md:grid-cols-3 rounded-3xl overflow-hidden bg-neutral-950/40 backdrop-blur-md"
				>
					{features.map((feature, i) => (
						<FeatureCard key={i} feature={feature} className="border-neutral-900/50" />
					))}
				</AnimatedContainer>
			</div>
		</section>
	);
}

type ViewAnimationProps = {
	delay?: number;
	className?: React.ComponentProps<typeof motion.div>['className'];
	children: React.ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
	const shouldReduceMotion = useReducedMotion();

	if (shouldReduceMotion) {
		return <div className={className}>{children}</div>;
	}

	return (
		<motion.div
			initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
			whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
			viewport={{ once: true }}
			transition={{ delay, duration: 0.8 }}
			className={className}
		>
			{children}
		</motion.div>
	);
}
