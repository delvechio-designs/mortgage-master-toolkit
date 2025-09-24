import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const RefinanceCalculator = () => {
  // Current loan details
  const [currentBalance, setCurrentBalance] = useState(250000);
  const [currentRate, setCurrentRate] = useState(6.5);
  const [currentTerm, setCurrentTerm] = useState(30);
  const [yearsRemaining, setYearsRemaining] = useState(27);
  const [currentPayment, setCurrentPayment] = useState(1580);

  // New loan details
  const [newRate, setNewRate] = useState(5.5);
  const [newTerm, setNewTerm] = useState(30);
  const [closingCosts, setClosingCosts] = useState(3500);
  const [cashOut, setCashOut] = useState(0);

  // Calculate new loan details
  const newLoanAmount = currentBalance + closingCosts + cashOut;
  const newMonthlyRate = newRate / 100 / 12;
  const newNumberOfPayments = newTerm * 12;

  const newMonthlyPayment = newLoanAmount * (newMonthlyRate * Math.pow(1 + newMonthlyRate, newNumberOfPayments)) / 
    (Math.pow(1 + newMonthlyRate, newNumberOfPayments) - 1);

  // Calculate savings and break-even
  const monthlySavings = currentPayment - newMonthlyPayment;
  const totalCurrentInterest = (currentPayment * yearsRemaining * 12) - currentBalance;
  const totalNewInterest = (newMonthlyPayment * newNumberOfPayments) - newLoanAmount;
  const totalInterestSavings = totalCurrentInterest - totalNewInterest;
  const breakEvenMonths = closingCosts / Math.abs(monthlySavings);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Current Loan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Loan Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-balance">Remaining Balance</Label>
            <Input
              id="current-balance"
              type="number"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(Number(e.target.value))}
              className="financial-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-rate">Current Rate (%)</Label>
              <Input
                id="current-rate"
                type="number"
                step="0.125"
                value={currentRate}
                onChange={(e) => setCurrentRate(Number(e.target.value))}
                className="financial-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="years-remaining">Years Remaining</Label>
              <Input
                id="years-remaining"
                type="number"
                value={yearsRemaining}
                onChange={(e) => setYearsRemaining(Number(e.target.value))}
                className="financial-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-payment">Current Monthly Payment</Label>
            <Input
              id="current-payment"
              type="number"
              value={currentPayment}
              onChange={(e) => setCurrentPayment(Number(e.target.value))}
              className="financial-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* New Loan */}
      <Card>
        <CardHeader>
          <CardTitle>New Loan Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-rate">New Interest Rate (%)</Label>
              <Input
                id="new-rate"
                type="number"
                step="0.125"
                value={newRate}
                onChange={(e) => setNewRate(Number(e.target.value))}
                className="financial-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-term">New Loan Term</Label>
              <Select value={newTerm.toString()} onValueChange={(value) => setNewTerm(Number(value))}>
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
            <Label htmlFor="closing-costs">Closing Costs</Label>
            <Input
              id="closing-costs"
              type="number"
              value={closingCosts}
              onChange={(e) => setClosingCosts(Number(e.target.value))}
              className="financial-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cash-out">Cash Out Amount</Label>
            <Input
              id="cash-out"
              type="number"
              value={cashOut}
              onChange={(e) => setCashOut(Number(e.target.value))}
              className="financial-input"
            />
          </div>

          <div className="p-4 bg-secondary/50 rounded-lg">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>New Loan Amount:</span>
                <span className="font-medium">${newLoanAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>New Monthly Payment:</span>
                <span className="font-medium text-primary">
                  ${newMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Analysis */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Refinance Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Monthly Comparison */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Monthly Comparison</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                  <span className="text-sm">Current Payment</span>
                  <span className="font-medium">${currentPayment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                  <span className="text-sm">New Payment</span>
                  <span className="font-medium text-primary">
                    ${newMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                  <span className="text-sm">Monthly Savings</span>
                  <span className={`font-medium ${monthlySavings >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {monthlySavings >= 0 ? '+' : ''}${monthlySavings.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Interest Comparison */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Total Interest</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                  <span className="text-sm">Current Loan Interest</span>
                  <span className="font-medium">${totalCurrentInterest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                  <span className="text-sm">New Loan Interest</span>
                  <span className="font-medium text-primary">
                    ${totalNewInterest.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                  <span className="text-sm">Total Savings</span>
                  <span className={`font-medium ${totalInterestSavings >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {totalInterestSavings >= 0 ? '+' : ''}${totalInterestSavings.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Break-Even Analysis */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Break-Even Analysis</h3>
              <div className="space-y-3">
                <div className="p-4 bg-secondary/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">
                    {isFinite(breakEvenMonths) ? Math.ceil(breakEvenMonths) : 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Months to Break Even</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Closing Costs:</span>
                    <span>${closingCosts.toLocaleString()}</span>
                  </div>
                  {cashOut > 0 && (
                    <div className="flex justify-between">
                      <span>Cash Out:</span>
                      <span>${cashOut.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {isFinite(breakEvenMonths) && breakEvenMonths > 0 && (
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <p className="text-sm text-center">
                      You'll break even in {Math.floor(breakEvenMonths / 12)} years and {Math.ceil(breakEvenMonths % 12)} months
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-success/5 border border-primary/20">
            <h3 className="font-semibold mb-2">Recommendation</h3>
            <p className="text-sm text-muted-foreground">
              {monthlySavings > 0 && breakEvenMonths < 60 
                ? "This refinance looks beneficial. You'll save money monthly and break even within 5 years."
                : monthlySavings > 0 
                ? "You'll save monthly, but it may take longer to break even. Consider how long you plan to stay in the home."
                : "This refinance may not provide immediate monthly savings. Consider the long-term benefits carefully."
              }
            </p>
          </div>

          <div className="mt-6 flex gap-4">
            <Button className="flex-1" size="lg">
              Get Refinance Quote
            </Button>
            <Button variant="outline" className="flex-1" size="lg">
              View Detailed Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};