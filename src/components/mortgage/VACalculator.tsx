import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export const VACalculator = () => {
  const [homePrice, setHomePrice] = useState(300000);
  const [downPayment, setDownPayment] = useState(0);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [propertyTax, setPropertyTax] = useState(3600);
  const [homeInsurance, setHomeInsurance] = useState(1200);
  const [hoaDues, setHoaDues] = useState(0);
  
  // VA-specific fields
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [hasDisability, setHasDisability] = useState(false);
  const [militaryService, setMilitaryService] = useState("regular");
  const [remainingEntitlement, setRemainingEntitlement] = useState(766500);

  // VA funding fee rates based on service type and down payment
  const getFundingFeeRate = () => {
    if (hasDisability) return 0; // Disabled veterans are exempt

    const rates = {
      regular: {
        firstTime: {
          0: 2.15,    // 0% down
          5: 1.25,    // 5-9% down
          10: 1.25    // 10%+ down
        },
        subsequent: {
          0: 3.3,     // 0% down
          5: 1.25,    // 5-9% down
          10: 1.25    // 10%+ down
        }
      },
      national_guard: {
        firstTime: {
          0: 2.15,
          5: 1.25,
          10: 1.25
        },
        subsequent: {
          0: 3.3,
          5: 1.25,
          10: 1.25
        }
      }
    };

    const downPaymentPercent = (downPayment / homePrice) * 100;
    const serviceRates = rates[militaryService as keyof typeof rates] || rates.regular;
    const timeRates = isFirstTime ? serviceRates.firstTime : serviceRates.subsequent;

    if (downPaymentPercent >= 10) return timeRates[10];
    if (downPaymentPercent >= 5) return timeRates[5];
    return timeRates[0];
  };

  const loanAmount = homePrice - downPayment;
  const fundingFeeRate = getFundingFeeRate();
  const fundingFee = loanAmount * (fundingFeeRate / 100);
  const totalLoanAmount = loanAmount + fundingFee;

  // Check VA loan limits
  const vaLoanLimit = 766550; // 2024 limit for most counties
  const exceedsLimit = loanAmount > vaLoanLimit;
  const requiredDownForLimit = exceedsLimit ? loanAmount - vaLoanLimit : 0;

  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  const monthlyPI = totalLoanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

  const monthlyPropertyTax = propertyTax / 12;
  const monthlyInsurance = homeInsurance / 12;
  const totalMonthlyPayment = monthlyPI + monthlyPropertyTax + monthlyInsurance + hoaDues;

  // VA loan benefits calculation
  const conventionalDownPayment = homePrice * 0.2; // 20% conventional
  const vaSavingsDownPayment = conventionalDownPayment - downPayment;
  const totalInterestPaid = (monthlyPI * numberOfPayments) - totalLoanAmount;

  const paymentBreakdown = [
    { name: "Principal & Interest", value: monthlyPI, color: "hsl(var(--chart-principal))" },
    { name: "Property Tax", value: monthlyPropertyTax, color: "hsl(var(--chart-taxes))" },
    { name: "Home Insurance", value: monthlyInsurance, color: "hsl(var(--chart-insurance))" },
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
        {/* VA Loan Details */}
        <Card>
          <CardHeader>
            <CardTitle>VA Loan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Home Price: ${homePrice.toLocaleString()}</Label>
              <Slider
                value={[homePrice]}
                onValueChange={(value) => setHomePrice(value[0])}
                min={50000}
                max={1500000}
                step={5000}
                className="w-full"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="down-payment">Down Payment (Optional)</Label>
                <Input
                  id="down-payment"
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Number(e.target.value))}
                  className="financial-input"
                />
                <p className="text-sm text-muted-foreground">
                  {((downPayment / homePrice) * 100).toFixed(1)}% of home price
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
          </CardContent>
        </Card>

        {/* VA-Specific Settings */}
        <Card>
          <CardHeader>
            <CardTitle>VA Benefits & Eligibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="military-service">Service Type</Label>
                <Select value={militaryService} onValueChange={setMilitaryService}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular Military</SelectItem>
                    <SelectItem value="national_guard">National Guard/Reserves</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remaining-entitlement">Remaining Entitlement</Label>
                <Input
                  id="remaining-entitlement"
                  type="number"
                  value={remainingEntitlement}
                  onChange={(e) => setRemainingEntitlement(Number(e.target.value))}
                  className="financial-input"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="first-time" 
                  checked={isFirstTime}
                  onCheckedChange={(checked) => setIsFirstTime(checked === true)}
                />
                <Label htmlFor="first-time">First-time VA loan use</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="disability" 
                  checked={hasDisability}
                  onCheckedChange={(checked) => setHasDisability(checked === true)}
                />
                <Label htmlFor="disability">Service-connected disability (exempt from funding fee)</Label>
              </div>
            </div>

            {/* VA Funding Fee Display */}
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>VA Funding Fee Rate:</span>
                  <span className="font-medium">
                    {hasDisability ? "0% (Exempt)" : `${fundingFeeRate}%`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VA Funding Fee Amount:</span>
                  <span className="font-medium">${fundingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Loan Amount:</span>
                  <span className="font-medium">${totalLoanAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Loan Limit Warning */}
            {exceedsLimit && (
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <h4 className="font-medium text-warning mb-2">VA Loan Limit Exceeded</h4>
                <p className="text-sm text-muted-foreground">
                  The loan amount exceeds the VA loan limit of ${vaLoanLimit.toLocaleString()}. 
                  You'll need a down payment of ${requiredDownForLimit.toLocaleString()} 
                  to avoid a jumbo loan.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Costs</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
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
        {/* VA Loan Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>VA Loan Benefits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                ${vaSavingsDownPayment.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Down Payment Savings</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>No PMI Required:</span>
                <span className="text-success font-medium">✓ Included</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>No Prepayment Penalty:</span>
                <span className="text-success font-medium">✓ Included</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Assumable Loan:</span>
                <span className="text-success font-medium">✓ Included</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cash-Out Refinance:</span>
                <span className="text-success font-medium">✓ Available</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Payment */}
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
                <span>Principal & Interest:</span>
                <span>${monthlyPI.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Property Tax:</span>
                <span>${monthlyPropertyTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Home Insurance:</span>
                <span>${monthlyInsurance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              {hoaDues > 0 && (
                <div className="flex justify-between">
                  <span>HOA Dues:</span>
                  <span>${hoaDues.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-success">
                <span>PMI:</span>
                <span>$0 (VA Benefit)</span>
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

        {/* Loan Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Home Price:</span>
              <span>${homePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Down Payment:</span>
              <span>${downPayment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Loan Amount:</span>
              <span>${loanAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>VA Funding Fee:</span>
              <span>${fundingFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Total Loan Amount:</span>
              <span>${totalLoanAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Interest:</span>
              <span>${totalInterestPaid.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" size="lg">
          Get VA Loan Quote
        </Button>
      </div>
    </div>
  );
};