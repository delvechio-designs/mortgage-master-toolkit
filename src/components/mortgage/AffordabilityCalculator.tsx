import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface LoanProgram {
  id: string;
  name: string;
  minDownPayment: number;
  maxDTI: number;
  requiresPMI: boolean;
  fundingFee?: number;
}

export const AffordabilityCalculator = () => {
  const [grossIncome, setGrossIncome] = useState(5000);
  const [monthlyDebts, setMonthlyDebts] = useState(500);
  const [homePrice, setHomePrice] = useState(200000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(7.0);
  const [propertyTax, setPropertyTax] = useState(0.6);
  const [homeInsurance, setHomeInsurance] = useState(1200);
  const [hoaDues, setHoaDues] = useState(0);
  const [selectedProgram, setSelectedProgram] = useState("conventional");

  const loanPrograms: LoanProgram[] = [
    { id: "conventional", name: "Conventional", minDownPayment: 3, maxDTI: 45, requiresPMI: true },
    { id: "fha", name: "FHA", minDownPayment: 3.5, maxDTI: 43, requiresPMI: true },
    { id: "va", name: "VA", minDownPayment: 0, maxDTI: 41, requiresPMI: false, fundingFee: 2.3 },
    { id: "usda", name: "USDA", minDownPayment: 0, maxDTI: 41, requiresPMI: false },
    { id: "jumbo", name: "Jumbo", minDownPayment: 10, maxDTI: 43, requiresPMI: true },
  ];

  const downPaymentAmount = (homePrice * downPaymentPercent) / 100;
  const loanAmount = homePrice - downPaymentAmount;
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = 30 * 12;
  
  // Monthly payment calculation
  const monthlyPI = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
  
  const monthlyPropertyTax = (homePrice * propertyTax / 100) / 12;
  const monthlyInsurance = homeInsurance / 12;
  const monthlyPMI = selectedProgram === "conventional" && downPaymentPercent < 20 ? 
    (loanAmount * 0.005) / 12 : 0;
  
  const totalMonthlyPayment = monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyPMI + hoaDues;
  
  // DTI calculations
  const frontEndDTI = (totalMonthlyPayment / grossIncome) * 100;
  const backEndDTI = ((totalMonthlyPayment + monthlyDebts) / grossIncome) * 100;
  
  const currentProgram = loanPrograms.find(p => p.id === selectedProgram);
  const maxAllowedDTI = currentProgram?.maxDTI || 45;

  const paymentBreakdown = [
    { name: "Principal & Interest", value: monthlyPI, color: "hsl(var(--chart-principal))" },
    { name: "Property Tax", value: monthlyPropertyTax, color: "hsl(var(--chart-taxes))" },
    { name: "Home Insurance", value: monthlyInsurance, color: "hsl(var(--chart-insurance))" },
    { name: "PMI", value: monthlyPMI, color: "hsl(var(--chart-pmi))" },
    { name: "HOA Dues", value: hoaDues, color: "hsl(var(--neutral-slate))" },
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card p-3 rounded-lg border shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Input Controls */}
      <div className="lg:col-span-2 space-y-6">
        {/* Loan Program Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Program</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {loanPrograms.map((program) => (
                <Button
                  key={program.id}
                  variant={selectedProgram === program.id ? "default" : "outline"}
                  onClick={() => setSelectedProgram(program.id)}
                  className="text-sm"
                >
                  {program.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Income and Debts */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Income & Debts</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gross-income">Gross Income (Monthly)</Label>
              <Input
                id="gross-income"
                type="number"
                value={grossIncome}
                onChange={(e) => setGrossIncome(Number(e.target.value))}
                className="financial-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly-debts">Monthly Debts</Label>
              <Input
                id="monthly-debts"
                type="number"
                value={monthlyDebts}
                onChange={(e) => setMonthlyDebts(Number(e.target.value))}
                className="financial-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Home Price and Down Payment */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Home Price: ${homePrice.toLocaleString()}</Label>
              <Slider
                value={[homePrice]}
                onValueChange={(value) => setHomePrice(value[0])}
                min={50000}
                max={1000000}
                step={5000}
                className="w-full"
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Down Payment: {downPaymentPercent}%</Label>
                <Slider
                  value={[downPaymentPercent]}
                  onValueChange={(value) => setDownPaymentPercent(value[0])}
                  min={currentProgram?.minDownPayment || 0}
                  max={50}
                  step={0.5}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  ${downPaymentAmount.toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                <Input
                  id="interest-rate"
                  type="number"
                  step="0.125"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="financial-input"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Monthly Costs</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property-tax">Property Tax (% yearly)</Label>
              <Input
                id="property-tax"
                type="number"
                step="0.1"
                value={propertyTax}
                onChange={(e) => setPropertyTax(Number(e.target.value))}
                className="financial-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="home-insurance">Home Insurance (yearly)</Label>
              <Input
                id="home-insurance"
                type="number"
                value={homeInsurance}
                onChange={(e) => setHomeInsurance(Number(e.target.value))}
                className="financial-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hoa-dues">HOA Dues (monthly)</Label>
              <Input
                id="hoa-dues"
                type="number"
                value={hoaDues}
                onChange={(e) => setHoaDues(Number(e.target.value))}
                className="financial-input"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Panel */}
      <div className="space-y-6">
        {/* Monthly Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                ${totalMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-muted-foreground">Total Monthly Payment</p>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Loan Amount:</span>
                <span>${loanAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Loan Term:</span>
                <span>30 Years</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DTI Ratios */}
        <Card>
          <CardHeader>
            <CardTitle>Debt-to-Income Ratio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Front-end DTI</span>
                  <span className={`text-sm font-medium ${frontEndDTI > 28 ? 'text-destructive' : 'text-success'}`}>
                    {frontEndDTI.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${frontEndDTI > 28 ? 'bg-destructive' : 'bg-success'}`}
                    style={{ width: `${Math.min(frontEndDTI, 100)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Back-end DTI</span>
                  <span className={`text-sm font-medium ${backEndDTI > maxAllowedDTI ? 'text-destructive' : 'text-success'}`}>
                    {backEndDTI.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${backEndDTI > maxAllowedDTI ? 'bg-destructive' : 'bg-success'}`}
                    style={{ width: `${Math.min(backEndDTI, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Max: {maxAllowedDTI}% for {currentProgram?.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {paymentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2 mt-4">
              {paymentBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span>${item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Get Quote Button */}
        <Button className="w-full" size="lg">
          Get A Quote
        </Button>
      </div>
    </div>
  );
};