import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const DSCRCalculator = () => {
  const [purchasePrice, setPurchasePrice] = useState(400000);
  const [downPayment, setDownPayment] = useState(100000);
  const [interestRate, setInterestRate] = useState(7.5);
  const [loanTerm, setLoanTerm] = useState(30);
  
  // Rental Income
  const [monthlyRent, setMonthlyRent] = useState(3500);
  const [otherIncome, setOtherIncome] = useState(0);
  
  // Operating Expenses
  const [vacancyRate, setVacancyRate] = useState(8);
  const [propertyTax, setPropertyTax] = useState(4800);
  const [insurance, setInsurance] = useState(1500);
  const [maintenance, setMaintenance] = useState(2400);
  const [propertyManagement, setPropertyManagement] = useState(10);
  const [otherExpenses, setOtherExpenses] = useState(1200);

  // Calculate loan details
  const loanAmount = purchasePrice - downPayment;
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;
  
  const monthlyPI = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

  // Calculate NOI (Net Operating Income)
  const grossMonthlyIncome = monthlyRent + otherIncome;
  const annualGrossIncome = grossMonthlyIncome * 12;
  
  const vacancyLoss = annualGrossIncome * (vacancyRate / 100);
  const effectiveGrossIncome = annualGrossIncome - vacancyLoss;
  
  const annualPropertyTax = propertyTax;
  const annualInsurance = insurance;
  const annualMaintenance = maintenance;
  const annualManagement = effectiveGrossIncome * (propertyManagement / 100);
  const annualOtherExpenses = otherExpenses;
  
  const totalOperatingExpenses = annualPropertyTax + annualInsurance + annualMaintenance + annualManagement + annualOtherExpenses;
  const netOperatingIncome = effectiveGrossIncome - totalOperatingExpenses;
  const monthlyNOI = netOperatingIncome / 12;

  // Calculate DSCR
  const annualDebtService = monthlyPI * 12;
  const dscr = netOperatingIncome / annualDebtService;

  // Calculate cash flow
  const monthlyCashFlow = monthlyNOI - monthlyPI;
  const annualCashFlow = monthlyCashFlow * 12;

  // Calculate returns
  const totalCashInvested = downPayment;
  const cashOnCashReturn = (annualCashFlow / totalCashInvested) * 100;
  const capRate = (netOperatingIncome / purchasePrice) * 100;

  // DSCR status
  const getDSCRStatus = () => {
    if (dscr >= 1.25) return { status: "Excellent", color: "text-success", bg: "bg-success/10" };
    if (dscr >= 1.2) return { status: "Good", color: "text-success", bg: "bg-success/10" };
    if (dscr >= 1.0) return { status: "Acceptable", color: "text-warning", bg: "bg-warning/10" };
    return { status: "Poor", color: "text-destructive", bg: "bg-destructive/10" };
  };

  const dscrStatus = getDSCRStatus();

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property & Loan Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="purchase-price">Purchase Price</Label>
            <Input
              id="purchase-price"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
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
            <p className="text-sm text-muted-foreground">
              {((downPayment / purchasePrice) * 100).toFixed(1)}% of purchase price
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="loan-term">Loan Term (years)</Label>
              <Input
                id="loan-term"
                type="number"
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="financial-input"
              />
            </div>
          </div>

          <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Loan Amount:</span>
              <span>${loanAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Monthly P&I:</span>
              <span>${monthlyPI.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rental Income */}
      <Card>
        <CardHeader>
          <CardTitle>Rental Income</CardTitle>
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
            <Label htmlFor="other-income">Other Monthly Income</Label>
            <Input
              id="other-income"
              type="number"
              value={otherIncome}
              onChange={(e) => setOtherIncome(Number(e.target.value))}
              className="financial-input"
            />
            <p className="text-xs text-muted-foreground">
              Parking, laundry, storage, etc.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vacancy-rate">Vacancy Rate (%)</Label>
            <Input
              id="vacancy-rate"
              type="number"
              step="0.5"
              value={vacancyRate}
              onChange={(e) => setVacancyRate(Number(e.target.value))}
              className="financial-input"
            />
          </div>

          <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Gross Monthly Income:</span>
              <span>${grossMonthlyIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Annual Gross Income:</span>
              <span>${annualGrossIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Vacancy Loss:</span>
              <span>-${vacancyLoss.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Effective Gross Income:</span>
              <span>${effectiveGrossIncome.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operating Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Operating Expenses (Annual)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="property-tax">Property Tax</Label>
            <Input
              id="property-tax"
              type="number"
              value={propertyTax}
              onChange={(e) => setPropertyTax(Number(e.target.value))}
              className="financial-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insurance">Insurance</Label>
            <Input
              id="insurance"
              type="number"
              value={insurance}
              onChange={(e) => setInsurance(Number(e.target.value))}
              className="financial-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maintenance">Maintenance & Repairs</Label>
            <Input
              id="maintenance"
              type="number"
              value={maintenance}
              onChange={(e) => setMaintenance(Number(e.target.value))}
              className="financial-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="property-management">Property Management (%)</Label>
            <Input
              id="property-management"
              type="number"
              step="0.5"
              value={propertyManagement}
              onChange={(e) => setPropertyManagement(Number(e.target.value))}
              className="financial-input"
            />
            <p className="text-xs text-muted-foreground">
              ${annualManagement.toLocaleString()} annually
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="other-expenses">Other Expenses</Label>
            <Input
              id="other-expenses"
              type="number"
              value={otherExpenses}
              onChange={(e) => setOtherExpenses(Number(e.target.value))}
              className="financial-input"
            />
            <p className="text-xs text-muted-foreground">
              Utilities, HOA, etc.
            </p>
          </div>

          <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Total Operating Expenses:</span>
              <span>${totalOperatingExpenses.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DSCR Results */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>DSCR Analysis & Property Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            {/* DSCR Score */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {dscr.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">DSCR Ratio</div>
              </div>
              
              <div className={`p-3 rounded-lg text-center ${dscrStatus.bg}`}>
                <div className={`font-medium ${dscrStatus.color}`}>
                  {dscrStatus.status}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {dscr >= 1.25 ? "Strong loan candidate" : 
                   dscr >= 1.2 ? "Good loan candidate" :
                   dscr >= 1.0 ? "Marginal loan candidate" : "Unlikely to qualify"}
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div>≥ 1.25: Excellent</div>
                <div>≥ 1.20: Good</div>
                <div>≥ 1.00: Acceptable</div>
                <div>&lt; 1.00: Poor</div>
              </div>
            </div>

            {/* Cash Flow */}
            <div className="space-y-4">
              <h3 className="font-semibold">Cash Flow Analysis</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Monthly NOI:</span>
                  <span className="font-medium">${monthlyNOI.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Monthly Debt Service:</span>
                  <span className="font-medium">${monthlyPI.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm">Monthly Cash Flow:</span>
                  <span className={`font-medium ${monthlyCashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${monthlyCashFlow.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Annual Cash Flow:</span>
                  <span className={`font-medium ${annualCashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                    ${annualCashFlow.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Returns */}
            <div className="space-y-4">
              <h3 className="font-semibold">Return Metrics</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-primary/10 rounded-lg text-center">
                  <div className="text-lg font-bold text-primary">
                    {cashOnCashReturn.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Cash-on-Cash Return</div>
                </div>
                
                <div className="p-3 bg-secondary/30 rounded-lg text-center">
                  <div className="text-lg font-bold">
                    {capRate.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Cap Rate</div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <div>Cash Invested: ${totalCashInvested.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Income Statement */}
            <div className="space-y-4">
              <h3 className="font-semibold">Annual Income Statement</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gross Rental Income:</span>
                  <span>${annualGrossIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Vacancy Loss:</span>
                  <span>-${vacancyLoss.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span>Effective Gross Income:</span>
                  <span>${effectiveGrossIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Operating Expenses:</span>
                  <span>-${totalOperatingExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-medium">
                  <span>Net Operating Income:</span>
                  <span>${netOperatingIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Debt Service:</span>
                  <span>-${annualDebtService.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-medium">
                  <span>Cash Flow:</span>
                  <span className={annualCashFlow >= 0 ? 'text-success' : 'text-destructive'}>
                    ${annualCashFlow.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Button className="flex-1" size="lg">
              Get DSCR Loan Quote
            </Button>
            <Button variant="outline" className="flex-1" size="lg">
              Download Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};