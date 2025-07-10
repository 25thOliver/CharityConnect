import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService, DonationData } from '@/services/api';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const DonationHistory = () => {
  const { user, isLoading } = useAuth();
  const [donations, setDonations] = useState<DonationData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    } else if (user) {
      apiService.getMyDonations().then(setDonations).catch((err) => {
        console.error("Error loading donations:", err);
      });
    }
  }, [user, isLoading]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Donation History</CardTitle>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <p className="text-muted-foreground">You haven't made any donations yet.</p>
          ) : (
            <ul className="space-y-4">
              {donations.map((donation) => (
                <li
                  key={donation.id}
                  className="border p-4 rounded-md bg-muted/10"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      {formatCurrency(donation.amount)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {new Date(donation.donated_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm mt-1">
                    Campaign: <span className="font-medium">{donation.campaign.title}</span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationHistory;
