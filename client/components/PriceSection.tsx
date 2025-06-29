import React from "react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Try chatting with PDFs with basic limits.",
    features: [
      "Up to 3 PDF uploads/month",
      "Max 20 pages per PDF",
      "Basic AI chat",
      "Community support"
    ],
    highlight: false
  },
  {
    name: "Pro",
    price: "$12/mo",
    description: "For power users who need more uploads and advanced AI.",
    features: [
      "Up to 50 PDF uploads/month",
      "Max 200 pages per PDF",
      "Faster AI responses",
      "Priority support"
    ],
    highlight: true
  },
  {
    name: "Enterprise",
    price: "Contact us",
    description: "Custom solutions for teams and organizations.",
    features: [
      "Unlimited uploads",
      "Custom AI models",
      "Team management",
      "Dedicated support"
    ],
    highlight: false
  }
];

export default function PriceSection() {
  return (
    <section className="w-full py-20 bg-[#0A0A0A] flex flex-col items-center" id="pricing">
      <h2 className="text-3xl md:text-6xl font-bold text-gray-50 mb-4 text-center">Pricing</h2>
      <p className="text-lg text-gray-50 mb-12 text-center max-w-2xl text-2xl md:text-2xl">
        Flexible plans for individuals and teams. Start for free and upgrade as your needs grow.
      </p>
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch w-full max-w-5xl px-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex-1 bg-white border border-gray-300 rounded-2xl p-8 shadow-lg flex flex-col items-center transition-transform duration-200 hover:scale-105 ${plan.highlight ? "border-blue-500 shadow-blue-500/20" : ""}`}
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold text-blue-600 mb-2">{plan.price}</div>
            <p className="mb-6 text-center text-gray-700">{plan.description}</p>
            <ul className="mb-8 space-y-2 w-full">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-gray-700">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  {feature}
                </li>
              ))}
            </ul>
            {plan.highlight && (
              <button className="mt-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
                Get Pro
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
