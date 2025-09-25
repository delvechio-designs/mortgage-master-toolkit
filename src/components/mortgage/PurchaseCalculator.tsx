import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { useMortgageRates } from "@/hooks/useMortgageRates";
import { RefreshCw } from "lucide-react";

export const PurchaseCalculator = () => {
  const { rates, loading: ratesLoading, error: ratesError, refreshRates } = useMortgageRates();
  
  const [homeValue, setHomeValue] = useState(300000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTerm, setLoanTerm] = useState(30);
  const [interestRate, setInterestRate] = useState(7.0);
  const [propertyTax, setPropertyTax] = useState(3600);
  const [homeInsurance, setHomeInsurance] = useState(1200);
  const [pmi, setPmi] = useState(250);
  const [hoaDues, setHoaDues] = useState(0);
  const [extraPayment, setExtraPayment] = useState(0);
  const [lumpSum, setLumpSum] = useState(0);
  const [lumpSumYear, setLumpSumYear] = useState(5);

  // Update interest rate when live rates load
  useEffect(() => {
    if (rates && !ratesLoading) {
      const defaultRate = loanTerm === 15 ? rates.fifteenYear : rates.thirtyYear;
      setInterestRate(defaultRate);
    }
  }, [rates, ratesLoading, loanTerm]);

  const downPaymentAmount = (homeValue * downPaymentPercent) / 100;
  const loanAmount = homeValue - downPaymentAmount;
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  // Standard monthly payment calculation
  const monthlyPI = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

  const monthlyPropertyTax = propertyTax / 12;
  const monthlyInsurance = homeInsurance / 12;
  const monthlyPMI = downPaymentPercent < 20 ? pmi / 12 : 0;
  const totalMonthlyPayment = monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyPMI + hoaDues;

  // Calculate total interest without extra payments
  const standardTotalInterest = (monthlyPI * numberOfPayments) - loanAmount;

  // Calculate with extra payments
  let remainingBalance = loanAmount;
  let totalInterestWithExtra = 0;
  let paymentsWithExtra = 0;
  let lumpSumApplied = false;

  for (let month = 1; month <= numberOfPayments; month++) {
    if (remainingBalance <= 0) break;

    const interestPayment = remainingBalance * monthlyInterestRate;
    let principalPayment = monthlyPI - interestPayment + extraPayment;

    // Apply lump sum payment
    if (month === lumpSumYear * 12 && !lumpSumApplied && lumpSum > 0) {
      principalPayment += lumpSum;
      lumpSumApplied = true;
    }

    if (principalPayment > remainingBalance) {
      principalPayment = remainingBalance;
    }

    totalInterestWithExtra += interestPayment;
    remainingBalance -= principalPayment;
    paymentsWithExtra++;
  }

  const totalSavings = standardTotalInterest - totalInterestWithExtra;
  const timeSaved = numberOfPayments - paymentsWithExtra;

  const paymentBreakdown = [
    { name: "Principal & Interest", value: monthlyPI, color: "hsl(var(--chart-principal))" },
    { name: "Property Tax", value: monthlyPropertyTax, color: "hsl(var(--chart-taxes))" },
    { name: "Home Insurance", value: monthlyInsurance, color: "hsl(var(--chart-insurance))" },
    { name: "PMI", value: monthlyPMI, color: "hsl(var(--chart-pmi))" },
    { name: "HOA Dues", value: hoaDues, color: "hsl(var(--neutral-slate))" },
  ].filter(item => item.value > 0);

  // Generate amortization data for chart
  const generateAmortizationData = () => {
    const data = [];
    let balance = loanAmount;
    
    for (let year = 1; year <= Math.min(loanTerm, 30); year++) {
      for (let month = 1; month <= 12; month++) {
        if (balance <= 0) break;
        
        const interestPayment = balance * monthlyInterestRate;
        const principalPayment = monthlyPI - interestPayment;
        balance -= principalPayment;
        
        if (month === 12) {
          data.push({
            year,
            balance: Math.max(0, balance),
            principal: loanAmount - balance,
          });
        }
      }
    }
    return data;
  };

  const amortizationData = generateAmortizationData();

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
        {/* Loan Details */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Home Value: ${homeValue.toLocaleString()}</Label>
              <Slider
                value={[homeValue]}
                onValueChange={(value) => setHomeValue(value[0])}
                min={50000}
                max={2000000}
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
                  min={0}
                  max={50}
                  step={0.5}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  ${downPaymentAmount.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loan-term">Loan Term</Label>
                <Select value={loanTerm.toString()} onValueChange={(value) => setLoanTerm(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 Years</SelectItem>
                    <SelectItem value="20">20 Years</SelectItem>
                    <SelectItem value="25">25 Years</SelectItem>
                    <SelectItem value="30">30 Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                <div className="flex items-center gap-2">
                  {ratesError && (
                    <span className="text-xs text-warning">Estimated</span>
                  )}
                  {!ratesError && (
                    <span className="text-xs text-success">Live Rate</span>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={refreshRates}
                    disabled={ratesLoading}
                    className="h-6 w-6 p-0"
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
                className="financial-input"
              />
              {rates.lastUpdated && !ratesError && (
                <p className="text-xs text-muted-foreground">
                  Updated: {new Date(rates.lastUpdated).toLocaleDateString()}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Costs</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="property-tax">Property Tax (yearly)</Label>
              <Input
                id="property-tax"
                type="number"
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
              <Label htmlFor="pmi">PMI (yearly)</Label>
              <Input
                id="pmi"
                type="number"
                value={pmi}
                onChange={(e) => setPmi(Number(e.target.value))}
                disabled={downPaymentPercent >= 20}
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

        {/* Early Payoff Strategy */}
        <Card>
          <CardHeader>
            <CardTitle>Early Payoff Strategy</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="extra-payment">Extra Monthly Payment</Label>
              <Input
                id="extra-payment"
                type="number"
                value={extraPayment}
                onChange={(e) => setExtraPayment(Number(e.target.value))}
                className="financial-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lump-sum">One-time Lump Sum</Label>
              <Input
                id="lump-sum"
                type="number"
                value={lumpSum}
                onChange={(e) => setLumpSum(Number(e.target.value))}
                className="financial-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lump-sum-year">Apply Lump Sum in Year</Label>
              <Select value={lumpSumYear.toString()} onValueChange={(value) => setLumpSumYear(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: loanTerm }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Year {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Panel */}
      <div className="space-y-6">
        {/* Payment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
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
                  <span>Total Interest (Standard):</span>
                  <span>${standardTotalInterest.toLocaleString()}</span>
                </div>
                {(extraPayment > 0 || lumpSum > 0) && (
                  <>
                    <div className="flex justify-between text-success">
                      <span>Interest Savings:</span>
                      <span>${totalSavings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-success">
                      <span>Time Saved:</span>
                      <span>{Math.floor(timeSaved / 12)}y {timeSaved % 12}m</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
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

        {/* Loan Balance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Balance Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={amortizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Balance"]} />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="hsl(var(--chart-principal))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" size="lg">
          Get A Quote
        </Button>
      </div>
    </div>
  );
};