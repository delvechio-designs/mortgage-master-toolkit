import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useMortgageRates } from "@/hooks/useMortgageRates";
import { RefreshCw } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";

interface LoanProgram {
  id: string;
  name: string;
  minDownPayment: number;
  maxDTI: number;
  requiresPMI: boolean;
  fundingFee?: number;
}

export const AffordabilityCalculator = () => {
  const { rates, loading: ratesLoading, error: ratesError, refreshRates } = useMortgageRates();
  
  const [grossIncome, setGrossIncome] = useState(5000);
  const [monthlyDebts, setMonthlyDebts] = useState(500);
  const [homePrice, setHomePrice] = useState(200000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(7.0);

  // Update interest rate when live rates load
  useEffect(() => {
    if (rates && !ratesLoading) {
      setInterestRate(rates.thirtyYear);
    }
  }, [rates, ratesLoading]);
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
      {/* Dark Sidebar - Inputs */}
      <div className="lg:col-span-1">
        <Card className="bg-calculator-sidebar border-calculator-sidebar-light">
          <CardHeader>
            <CardTitle className="text-white">Affordability Calculator</CardTitle>
            <div className="flex flex-wrap gap-2 mt-4">
              {loanPrograms.map((program) => (
                <Button
                  key={program.id}
                  variant={selectedProgram === program.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedProgram(program.id)}
                  className={selectedProgram === program.id ? "" : "border-calculator-sidebar-light text-gray-300 hover:bg-calculator-sidebar-light"}
                >
                  {program.name}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gross-income" className="text-white">Gross Income (Monthly)</Label>
                <Input
                  id="gross-income"
                  type="number"
                  value={grossIncome}
                  onChange={(e) => setGrossIncome(Number(e.target.value))}
                  className="bg-calculator-input border-calculator-sidebar-light text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-debts" className="text-white">Monthly Debts</Label>
                <Input
                  id="monthly-debts"
                  type="number"
                  value={monthlyDebts}
                  onChange={(e) => setMonthlyDebts(Number(e.target.value))}
                  className="bg-calculator-input border-calculator-sidebar-light text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="home-price" className="text-white">Home Price</Label>
              <Input
                id="home-price"
                type="number"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="bg-calculator-input border-calculator-sidebar-light text-white"
              />
              <Slider
                value={[homePrice]}
                onValueChange={(value) => setHomePrice(value[0])}
                max={1000000}
                min={50000}
                step={5000}
                className="mt-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="down-payment" className="text-white">Down Payment</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="down-payment"
                    type="number"
                    value={(homePrice * downPaymentPercent / 100).toLocaleString()}
                    readOnly
                    className="bg-calculator-input border-calculator-sidebar-light text-white"
                  />
                </div>
                <div className="w-20">
                  <div className="flex">
                    <Input
                      type="number"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      className="bg-calculator-input border-calculator-sidebar-light text-white rounded-r-none"
                    />
                    <div className="px-2 py-2 bg-calculator-input border border-l-0 border-calculator-sidebar-light text-white text-sm flex items-center rounded-r-md">
                      %
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan-amount" className="text-white">Loan Amount</Label>
              <Input
                id="loan-amount"
                type="number"
                value={loanAmount}
                readOnly
                className="bg-calculator-input border-calculator-sidebar-light text-white"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="interest-rate" className="text-white">Interest Rate</Label>
                <div className="flex items-center gap-2">
                  {ratesError && (
                    <span className="text-xs text-orange-400">Estimated</span>
                  )}
                  {!ratesError && (
                    <span className="text-xs text-green-400">Live Rate</span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={refreshRates}
                    disabled={ratesLoading}
                    className="h-6 w-6 p-0 text-white hover:bg-calculator-sidebar-light"
                  >
                    <RefreshCw className={`h-3 w-3 ${ratesLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              <Input
                id="interest-rate"
                type="number"
                step="0.125"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="bg-calculator-input border-calculator-sidebar-light text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Prop Tax (Yearly)</Label>
                <div className="flex">
                  <Input
                    type="number"
                    step="0.1"
                    value={propertyTax}
                    onChange={(e) => setPropertyTax(Number(e.target.value))}
                    className="bg-calculator-input border-calculator-sidebar-light text-white rounded-r-none"
                  />
                  <div className="px-2 py-2 bg-calculator-input border border-l-0 border-calculator-sidebar-light text-white text-sm flex items-center rounded-r-md">
                    %
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Homeowners Insurance (Yearly)</Label>
                <div className="flex">
                  <div className="px-2 py-2 bg-calculator-input border border-r-0 border-calculator-sidebar-light text-white text-sm flex items-center rounded-l-md">
                    $
                  </div>
                  <Input
                    type="number"
                    value={homeInsurance}
                    onChange={(e) => setHomeInsurance(Number(e.target.value))}
                    className="bg-calculator-input border-calculator-sidebar-light text-white rounded-l-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">HOA Dues (Monthly)</Label>
              <Input
                type="number"
                value={hoaDues}
                onChange={(e) => setHoaDues(Number(e.target.value))}
                className="bg-calculator-input border-calculator-sidebar-light text-white"
              />
            </div>

            <Button className="w-full mt-6" size="lg">
              GET A QUOTE
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results Area */}
      <div className="lg:col-span-2 space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Monthly Mortgage Payment"
            value={`$${totalMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            color="blue"
          />
          <MetricCard
            title="Loan Amount"
            value={`$${loanAmount.toLocaleString()}`}
            color="blue"
          />
          <MetricCard
            title="Your Debt to Income Ratio"
            value={`${frontEndDTI.toFixed(1)}% / ${backEndDTI.toFixed(1)}%`}
            subtitle="Allowable Debt to Income Ratio"
            color="blue"
          />
          <MetricCard
            title="Purchase Price"
            value={`$${homePrice.toLocaleString()}`}
            subtitle={`Down Payment: $${downPaymentAmount.toLocaleString()}`}
            color="blue"
          />
        </div>

        {/* Payment Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="w-64 h-64 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
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
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    ${totalMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {paymentBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="font-medium">${item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Details */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Home Value:</span>
                  <span className="font-medium">${homePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Conventional Payment:</span>
                  <span className="font-medium">${monthlyPI.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
                {monthlyPMI > 0 && (
                  <div className="flex justify-between">
                    <span>Monthly Estimated PMI:</span>
                    <span className="font-medium">${monthlyPMI.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Mortgage Amount:</span>
                  <span className="font-medium">${loanAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Down Payment:</span>
                  <span className="font-medium">${downPaymentAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Summary:</h3>
            <p className="text-sm text-blue-800">
              Based on what you input today your Total Payment would be{" "}
              <span className="font-bold">${totalMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> on a{" "}
              <span className="font-bold">{currentProgram?.name}</span> Loan with a{" "}
              <span className="font-bold">{downPaymentPercent}%</span> Down Payment. Your{" "}
              <span className="font-bold">Debt-to-Income Ratio</span> is{" "}
              <span className="font-bold">{backEndDTI.toFixed(1)}%</span> and the{" "}
              <span className="font-bold">maximum allowable on this program type is {maxAllowedDTI}%</span>.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};