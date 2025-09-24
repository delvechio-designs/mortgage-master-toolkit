import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";

export const RentVsBuyCalculator = () => {
  // Mortgage Information
  const [homePrice, setHomePrice] = useState(300000);
  const [downPayment, setDownPayment] = useState(60000);
  const [interestRate, setInterestRate] = useState(7.0);
  const [loanTerm, setLoanTerm] = useState(30);
  const [propertyTax, setPropertyTax] = useState(3600);
  const [homeInsurance, setHomeInsurance] = useState(1200);
  const [maintenance, setMaintenance] = useState(3000);
  const [closingCosts, setClosingCosts] = useState(6000);

  // Renting Assumptions
  const [monthlyRent, setMonthlyRent] = useState(2000);
  const [renterInsurance, setRenterInsurance] = useState(200);
  const [rentIncrease, setRentIncrease] = useState(3);

  // Investment/Growth Assumptions
  const [homeAppreciation, setHomeAppreciation] = useState(3);
  const [investmentReturn, setInvestmentReturn] = useState(7);
  const [taxBracket, setTaxBracket] = useState(25);
  const [yearsToAnalyze, setYearsToAnalyze] = useState(10);

  // Calculate mortgage details
  const loanAmount = homePrice - downPayment;
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;
  const monthlyPI = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

  const monthlyPropertyTax = propertyTax / 12;
  const monthlyInsurance = homeInsurance / 12;
  const monthlyMaintenance = maintenance / 12;
  const totalMonthlyOwning = monthlyPI + monthlyPropertyTax + monthlyInsurance + monthlyMaintenance;

  // Calculate year-by-year comparison
  const generateComparison = () => {
    const data = [];
    let rentCost = 0;
    let buyingCost = closingCosts + downPayment;
    let currentRent = monthlyRent;
    let homeValue = homePrice;
    let remainingLoanBalance = loanAmount;
    let totalInterestPaid = 0;
    let investmentValue = downPayment + closingCosts; // Starting investment value for renting scenario

    for (let year = 1; year <= yearsToAnalyze; year++) {
      // Renting costs for the year
      const yearlyRent = currentRent * 12;
      const yearlyRenterInsurance = renterInsurance;
      rentCost += yearlyRent + yearlyRenterInsurance;

      // Investment growth for rent scenario (opportunity cost)
      investmentValue *= (1 + investmentReturn / 100);
      investmentValue += yearlyRent; // Invest the equivalent of rent payments

      // Buying costs for the year
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;
      
      for (let month = 1; month <= 12; month++) {
        const interestPayment = remainingLoanBalance * monthlyInterestRate;
        const principalPayment = monthlyPI - interestPayment;
        yearlyInterest += interestPayment;
        yearlyPrincipal += principalPayment;
        remainingLoanBalance -= principalPayment;
      }

      totalInterestPaid += yearlyInterest;
      
      const yearlyTaxes = propertyTax;
      const yearlyInsurance = homeInsurance;
      const yearlyMaintenance = maintenance;
      const yearlyBuyingCosts = yearlyInterest + yearlyPrincipal + yearlyTaxes + yearlyInsurance + yearlyMaintenance;
      
      buyingCost += yearlyBuyingCosts;

      // Home appreciation
      homeValue *= (1 + homeAppreciation / 100);

      // Tax benefits (mortgage interest and property tax deduction)
      const taxDeduction = (yearlyInterest + yearlyTaxes) * (taxBracket / 100);
      
      // Net equity in home
      const homeEquity = homeValue - remainingLoanBalance;

      // Net position calculation
      const rentingNetPosition = investmentValue - rentCost;
      const buyingNetPosition = homeEquity - (buyingCost - downPayment - closingCosts) + taxDeduction;

      data.push({
        year,
        rentingCost: rentCost,
        buyingCost: buyingCost - homeEquity, // Cost minus equity
        rentingNetWorth: rentingNetPosition,
        buyingNetWorth: buyingNetPosition,
        breakEven: buyingNetPosition - rentingNetPosition,
        homeValue,
        homeEquity,
        investmentValue,
      });

      // Increase rent for next year
      currentRent *= (1 + rentIncrease / 100);
    }

    return data;
  };

  const comparisonData = generateComparison();
  const breakEvenPoint = comparisonData.find(data => data.breakEven > 0);
  const finalYearData = comparisonData[comparisonData.length - 1];

  return (
    <div className="space-y-6">
      {/* Input Controls */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mortgage Information */}
        <Card>
          <CardHeader>
            <CardTitle>Buying Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="home-price">Home Price</Label>
              <Input
                id="home-price"
                type="number"
                value={homePrice}
                onChange={(e) => setHomePrice(Number(e.target.value))}
                className="financial-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="down-payment">Down Payment</Label>
              <Input
                id="down-payment"
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="financial-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
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
              <div className="space-y-2">
                <Label htmlFor="loan-term">Loan Term</Label>
                <Input
                  id="loan-term"
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(Number(e.target.value))}
                  className="financial-input"
                />
              </div>
            </div>

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
              <Label htmlFor="maintenance">Maintenance (yearly)</Label>
              <Input
                id="maintenance"
                type="number"
                value={maintenance}
                onChange={(e) => setMaintenance(Number(e.target.value))}
                className="financial-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Renting Information */}
        <Card>
          <CardHeader>
            <CardTitle>Renting Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monthly-rent">Monthly Rent</Label>
              <Input
                id="monthly-rent"
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="financial-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="renter-insurance">Renter Insurance (yearly)</Label>
              <Input
                id="renter-insurance"
                type="number"
                value={renterInsurance}
                onChange={(e) => setRenterInsurance(Number(e.target.value))}
                className="financial-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rent-increase">Annual Rent Increase (%)</Label>
              <Input
                id="rent-increase"
                type="number"
                step="0.1"
                value={rentIncrease}
                onChange={(e) => setRentIncrease(Number(e.target.value))}
                className="financial-input"
              />
            </div>

            {/* Current vs Future Rent */}
            <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Monthly Rent:</span>
                <span>${monthlyRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Year 5 Rent:</span>
                <span>${(monthlyRent * Math.pow(1 + rentIncrease / 100, 5)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Year 10 Rent:</span>
                <span>${(monthlyRent * Math.pow(1 + rentIncrease / 100, 10)).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assumptions */}
        <Card>
          <CardHeader>
            <CardTitle>Growth Assumptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="home-appreciation">Home Appreciation (%/year)</Label>
              <Input
                id="home-appreciation"
                type="number"
                step="0.1"
                value={homeAppreciation}
                onChange={(e) => setHomeAppreciation(Number(e.target.value))}
                className="financial-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="investment-return">Investment Return (%/year)</Label>
              <Input
                id="investment-return"
                type="number"
                step="0.1"
                value={investmentReturn}
                onChange={(e) => setInvestmentReturn(Number(e.target.value))}
                className="financial-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-bracket">Tax Bracket (%)</Label>
              <Input
                id="tax-bracket"
                type="number"
                value={taxBracket}
                onChange={(e) => setTaxBracket(Number(e.target.value))}
                className="financial-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years-analyze">Years to Analyze</Label>
              <Input
                id="years-analyze"
                type="number"
                min="1"
                max="30"
                value={yearsToAnalyze}
                onChange={(e) => setYearsToAnalyze(Number(e.target.value))}
                className="financial-input"
              />
            </div>

            {/* Monthly Comparison */}
            <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Monthly Rent Cost:</span>
                <span>${(monthlyRent + renterInsurance / 12).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Monthly Ownership Cost:</span>
                <span>${totalMonthlyOwning.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span>Monthly Difference:</span>
                <span className={totalMonthlyOwning > monthlyRent ? 'text-destructive' : 'text-success'}>
                  ${Math.abs(totalMonthlyOwning - monthlyRent).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results and Chart */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Key Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground">Break-Even Point</div>
                <div className="text-lg font-bold text-primary">
                  {breakEvenPoint ? `Year ${breakEvenPoint.year}` : 'Never'}
                </div>
              </div>

              <div className="p-3 bg-success/10 rounded-lg">
                <div className="text-sm text-muted-foreground">Net Worth Difference (Year {yearsToAnalyze})</div>
                <div className="text-lg font-bold text-success">
                  ${(finalYearData.buyingNetWorth - finalYearData.rentingNetWorth).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {finalYearData.buyingNetWorth > finalYearData.rentingNetWorth ? 'Buying Wins' : 'Renting Wins'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Home Value (Year {yearsToAnalyze}):</span>
                  <span>${finalYearData.homeValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Home Equity:</span>
                  <span>${finalYearData.homeEquity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Investment Value:</span>
                  <span>${finalYearData.investmentValue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Net Worth Comparison Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                  <Tooltip 
                    formatter={(value, name) => [
                      `$${Number(value).toLocaleString()}`, 
                      name === 'rentingNetWorth' ? 'Renting Net Worth' : 'Buying Net Worth'
                    ]}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="rentingNetWorth" 
                    stroke="hsl(var(--chart-interest))" 
                    strokeWidth={2}
                    name="Renting"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="buyingNetWorth" 
                    stroke="hsl(var(--chart-principal))" 
                    strokeWidth={2}
                    name="Buying"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">
              Based on your inputs, {finalYearData.buyingNetWorth > finalYearData.rentingNetWorth ? 'buying' : 'renting'} appears 
              to be the better financial choice over {yearsToAnalyze} years. 
              {breakEvenPoint 
                ? ` Buying breaks even in year ${breakEvenPoint.year}.`
                : ' Buying never breaks even within the analyzed timeframe.'
              }
            </p>
            
            {finalYearData.buyingNetWorth > finalYearData.rentingNetWorth ? (
              <p className="text-success">
                After {yearsToAnalyze} years, buying provides ${(finalYearData.buyingNetWorth - finalYearData.rentingNetWorth).toLocaleString()} 
                more in net worth than renting, primarily due to home equity accumulation.
              </p>
            ) : (
              <p className="text-warning">
                After {yearsToAnalyze} years, renting provides ${(finalYearData.rentingNetWorth - finalYearData.buyingNetWorth).toLocaleString()} 
                more in net worth than buying, primarily due to investment growth and lower costs.
              </p>
            )}
          </div>

          <div className="mt-6 flex gap-4">
            <Button className="flex-1" size="lg">
              Get Mortgage Quote
            </Button>
            <Button variant="outline" className="flex-1" size="lg">
              Detailed Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};