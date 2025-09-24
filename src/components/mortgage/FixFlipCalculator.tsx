import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const FixFlipCalculator = () => {
  // Purchase & Renovation
  const [purchasePrice, setPurchasePrice] = useState(200000);
  const [renovationCosts, setRenovationCosts] = useState(50000);
  const [afterRepairValue, setAfterRepairValue] = useState(320000);
  
  // Financing
  const [downPaymentPercent, setDownPaymentPercent] = useState(25);
  const [interestRate, setInterestRate] = useState(9.5);
  const [loanTerm, setLoanTerm] = useState(12); // months
  const [renovationFinancing, setRenovationFinancing] = useState("cash");
  const [renovationInterestRate, setRenovationInterestRate] = useState(11.0);

  // Costs & Timeline
  const [holdingPeriod, setHoldingPeriod] = useState(6); // months
  const [realtorCommission, setRealtorCommission] = useState(6);
  const [closingCosts, setClosingCosts] = useState(2);
  const [propertyTaxMonthly, setPropertyTaxMonthly] = useState(300);
  const [insurance, setInsurance] = useState(150);
  const [utilities, setUtilities] = useState(200);
  const [miscExpenses, setMiscExpenses] = useState(500);

  // Calculate financing details
  const totalProjectCost = purchasePrice + renovationCosts;
  const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
  const loanAmount = purchasePrice - downPaymentAmount;
  
  // Monthly payments
  const monthlyInterestRate = interestRate / 100 / 12;
  const monthlyPayment = loanAmount * monthlyInterestRate; // Interest-only typical for fix & flip
  
  // Renovation financing
  const renovationLoanAmount = renovationFinancing === "financed" ? renovationCosts : 0;
  const renovationMonthlyPayment = renovationFinancing === "financed" ? 
    renovationLoanAmount * (renovationInterestRate / 100 / 12) : 0;

  // Holding costs
  const monthlyCarryingCosts = monthlyPayment + renovationMonthlyPayment + propertyTaxMonthly + 
    insurance + utilities + miscExpenses;
  const totalCarryingCosts = monthlyCarryingCosts * holdingPeriod;

  // Selling costs
  const realtorFees = afterRepairValue * (realtorCommission / 100);
  const sellingClosingCosts = afterRepairValue * (closingCosts / 100);
  const totalSellingCosts = realtorFees + sellingClosingCosts;

  // Calculate returns
  const totalCashInvested = downPaymentAmount + 
    (renovationFinancing === "cash" ? renovationCosts : 0);
  
  const totalCosts = totalProjectCost + totalCarryingCosts + totalSellingCosts;
  const grossProfit = afterRepairValue - totalCosts;
  const netProfit = grossProfit;
  
  const returnOnCost = (netProfit / totalCosts) * 100;
  const returnOnInvestment = (netProfit / totalCashInvested) * 100;
  const annualizedReturn = (returnOnInvestment / holdingPeriod) * 12;

  // 70% Rule check
  const maxPurchasePrice70Rule = (afterRepairValue * 0.7) - renovationCosts;
  const meets70Rule = purchasePrice <= maxPurchasePrice70Rule;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Purchase & Property Details */}
      <Card>
        <CardHeader>
          <CardTitle>Property Details</CardTitle>
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
            <Label htmlFor="renovation-costs">Renovation Costs</Label>
            <Input
              id="renovation-costs"
              type="number"
              value={renovationCosts}
              onChange={(e) => setRenovationCosts(Number(e.target.value))}
              className="financial-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="arv">After Repair Value (ARV)</Label>
            <Input
              id="arv"
              type="number"
              value={afterRepairValue}
              onChange={(e) => setAfterRepairValue(Number(e.target.value))}
              className="financial-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="holding-period">Holding Period (months)</Label>
            <Input
              id="holding-period"
              type="number"
              value={holdingPeriod}
              onChange={(e) => setHoldingPeriod(Number(e.target.value))}
              className="financial-input"
            />
          </div>

          {/* 70% Rule Check */}
          <div className={`p-3 rounded-lg ${meets70Rule ? 'bg-success/10 border border-success/20' : 'bg-warning/10 border border-warning/20'}`}>
            <div className="text-sm space-y-1">
              <div className="font-medium">70% Rule Check</div>
              <div className="flex justify-between">
                <span>Max Purchase Price:</span>
                <span>${maxPurchasePrice70Rule.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Your Purchase Price:</span>
                <span>${purchasePrice.toLocaleString()}</span>
              </div>
              <div className={`text-xs ${meets70Rule ? 'text-success' : 'text-warning'}`}>
                {meets70Rule ? '✓ Meets 70% Rule' : '⚠ Exceeds 70% Rule'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financing Details */}
      <Card>
        <CardHeader>
          <CardTitle>Financing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="down-payment">Down Payment (%)</Label>
            <Input
              id="down-payment"
              type="number"
              value={downPaymentPercent}
              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
              className="financial-input"
            />
            <p className="text-xs text-muted-foreground">
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

          <div className="space-y-2">
            <Label htmlFor="loan-term">Loan Term (months)</Label>
            <Select value={loanTerm.toString()} onValueChange={(value) => setLoanTerm(Number(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 Months</SelectItem>
                <SelectItem value="9">9 Months</SelectItem>
                <SelectItem value="12">12 Months</SelectItem>
                <SelectItem value="18">18 Months</SelectItem>
                <SelectItem value="24">24 Months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="renovation-financing">Renovation Financing</Label>
            <Select value={renovationFinancing} onValueChange={setRenovationFinancing}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="financed">Financed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renovationFinancing === "financed" && (
            <div className="space-y-2">
              <Label htmlFor="renovation-rate">Renovation Loan Rate (%)</Label>
              <Input
                id="renovation-rate"
                type="number"
                step="0.125"
                value={renovationInterestRate}
                onChange={(e) => setRenovationInterestRate(Number(e.target.value))}
                className="financial-input"
              />
            </div>
          )}

          <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Loan Amount:</span>
              <span>${loanAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Monthly Payment:</span>
              <span>${(monthlyPayment + renovationMonthlyPayment).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cash Required:</span>
              <span>${totalCashInvested.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Carrying Costs */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Carrying Costs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="property-tax">Property Tax</Label>
            <Input
              id="property-tax"
              type="number"
              value={propertyTaxMonthly}
              onChange={(e) => setPropertyTaxMonthly(Number(e.target.value))}
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
            <Label htmlFor="utilities">Utilities</Label>
            <Input
              id="utilities"
              type="number"
              value={utilities}
              onChange={(e) => setUtilities(Number(e.target.value))}
              className="financial-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="misc-expenses">Misc. Expenses</Label>
            <Input
              id="misc-expenses"
              type="number"
              value={miscExpenses}
              onChange={(e) => setMiscExpenses(Number(e.target.value))}
              className="financial-input"
            />
          </div>

          <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Monthly Carrying Costs:</span>
              <span>${monthlyCarryingCosts.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Carrying Costs:</span>
              <span>${totalCarryingCosts.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selling Costs */}
      <Card>
        <CardHeader>
          <CardTitle>Selling Costs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="realtor-commission">Realtor Commission (%)</Label>
            <Input
              id="realtor-commission"
              type="number"
              step="0.5"
              value={realtorCommission}
              onChange={(e) => setRealtorCommission(Number(e.target.value))}
              className="financial-input"
            />
            <p className="text-xs text-muted-foreground">
              ${realtorFees.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="closing-costs">Closing Costs (%)</Label>
            <Input
              id="closing-costs"
              type="number"
              step="0.1"
              value={closingCosts}
              onChange={(e) => setClosingCosts(Number(e.target.value))}
              className="financial-input"
            />
            <p className="text-xs text-muted-foreground">
              ${sellingClosingCosts.toLocaleString()}
            </p>
          </div>

          <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total Selling Costs:</span>
              <span>${totalSellingCosts.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deal Analysis */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Deal Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cost Breakdown */}
            <div className="space-y-4">
              <h3 className="font-semibold">Cost Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Purchase Price:</span>
                  <span>${purchasePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Renovation Costs:</span>
                  <span>${renovationCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Carrying Costs:</span>
                  <span>${totalCarryingCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selling Costs:</span>
                  <span>${totalSellingCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Total Project Costs:</span>
                  <span>${totalCosts.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Profit Analysis */}
            <div className="space-y-4">
              <h3 className="font-semibold">Profit Analysis</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>After Repair Value:</span>
                  <span>${afterRepairValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Costs:</span>
                  <span>${totalCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Gross Profit:</span>
                  <span className={grossProfit >= 0 ? 'text-success' : 'text-destructive'}>
                    ${grossProfit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Invested:</span>
                  <span>${totalCashInvested.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Return Metrics */}
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/10 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">
                {returnOnInvestment.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">ROI</div>
            </div>

            <div className="p-4 bg-success/10 rounded-lg text-center">
              <div className="text-2xl font-bold text-success">
                {returnOnCost.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Return on Cost</div>
            </div>

            <div className="p-4 bg-secondary/30 rounded-lg text-center">
              <div className="text-2xl font-bold">
                {annualizedReturn.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Annualized Return</div>
            </div>
          </div>

          {/* Deal Summary */}
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-success/5 border border-primary/20">
            <h3 className="font-semibold mb-2">Deal Summary</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                This fix & flip project has a total investment of ${totalCashInvested.toLocaleString()} 
                and projects a {returnOnInvestment >= 0 ? 'profit' : 'loss'} of ${Math.abs(netProfit).toLocaleString()} 
                over {holdingPeriod} months.
              </p>
              {!meets70Rule && (
                <p className="text-warning">
                  ⚠ This deal exceeds the 70% rule, which may indicate higher risk.
                </p>
              )}
              {returnOnInvestment >= 20 && (
                <p className="text-success">
                  ✓ This appears to be a strong deal with excellent returns.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <Button className="flex-1" size="lg">
              Get Fix & Flip Financing
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