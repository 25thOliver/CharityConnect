import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ThankYou = () => {
  const location = useLocation();
  const { campaign, amount } = location.state || {};

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-success flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-glow text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-6 w-20 h-20 bg-success rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <CardTitle className="text-3xl text-foreground mb-2">
              Thank You for Your Generosity!
            </CardTitle>
            <p className="text-muted-foreground text-lg">
              Your donation has been successfully processed
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {campaign && amount && (
              <div className="bg-success/10 p-6 rounded-lg border border-success/20">
                <h3 className="text-xl font-semibold text-foreground mb-2">Donation Details</h3>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    <span className="font-medium">Campaign:</span> {campaign}
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium">Amount:</span> {formatCurrency(amount)}
                  </p>
                </div>
              </div>
            )}

            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p className="text-lg mb-4">
                Your contribution is making a real difference in someone's life today. 
                Because of generous people like you, we can continue our mission to create positive change in the world.
              </p>
              
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10 mb-6">
                <h4 className="font-semibold text-foreground mb-2">What happens next?</h4>
                <ul className="text-left space-y-1 text-sm">
                  <li>• Your donation will be processed within 24 hours</li>
                  <li>• You'll receive a confirmation email with tax receipt information</li>
                  <li>• Campaign updates will be sent to keep you informed of the impact</li>
                  <li>• 100% of your donation goes directly to the cause</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button variant="default" size="lg" className="w-full sm:w-auto">
                    View More Campaigns
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.print()}
                  className="w-full sm:w-auto"
                >
                  Print Receipt
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Follow us on social media to see the impact of your donation
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-white/90 text-lg font-medium">
            "The best way to find yourself is to lose yourself in the service of others." - Gandhi
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;