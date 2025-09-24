import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { AffordabilityCalculator } from "./AffordabilityCalculator";
import { PurchaseCalculator } from "./PurchaseCalculator";
import { RefinanceCalculator } from "./RefinanceCalculator";
import { RentVsBuyCalculator } from "./RentVsBuyCalculator";
import { VACalculator } from "./VACalculator";
import { DSCRCalculator } from "./DSCRCalculator";
import { FixFlipCalculator } from "./FixFlipCalculator";

export const MortgageCalculatorHub = () => {
  const [activeTab, setActiveTab] = useState("affordability");

  const calculators = [
    { id: "affordability", label: "Affordability Calculator", component: AffordabilityCalculator },
    { id: "purchase", label: "Purchase", component: PurchaseCalculator },
    { id: "refinance", label: "Refinance", component: RefinanceCalculator },
    { id: "rent-vs-buy", label: "Rent vs Buy", component: RentVsBuyCalculator },
    { id: "va-purchase", label: "VA Purchase", component: VACalculator },
    { id: "va-refinance", label: "VA Refinance", component: VACalculator },
    { id: "dscr", label: "Debt-Service (DSCR)", component: DSCRCalculator },
    { id: "fix-flip", label: "Fix & Flip", component: FixFlipCalculator },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-mortgage-navy">
            Mortgage Calculator Suite
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional mortgage and real estate investment calculators to help you make informed financial decisions
          </p>
        </div>

        {/* Calculator Tabs */}
        <Card className="calculator-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto p-1 bg-secondary/30">
              {calculators.map((calc) => (
                <TabsTrigger
                  key={calc.id}
                  value={calc.id}
                  className="calculator-tab text-xs lg:text-sm px-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {calc.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {calculators.map((calc) => (
              <TabsContent key={calc.id} value={calc.id} className="mt-6">
                <calc.component />
              </TabsContent>
            ))}
          </Tabs>
        </Card>

        {/* Footer Disclaimer */}
        <Card className="p-6 bg-secondary/30">
          <div className="text-sm text-muted-foreground space-y-2">
            <h3 className="font-semibold text-foreground">Disclaimer:</h3>
            <p>
              Results received from this calculator are designed for comparative purposes only, and accuracy is not guaranteed. 
              This calculator does not have the ability to pre-qualify you for any loan program. Information such as interest 
              rates and pricing are subject to change at any time and without notice. All information should be used for 
              comparison only and verified with a qualified loan officer.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};