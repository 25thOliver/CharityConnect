import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Campaign, apiService, CommentData } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

import CommentSection from './CommentSection';

import cleanWaterImg from '@/assets/clean-water.jpg';
import backToSchoolImg from '@/assets/education.jpg';
import floodReliefImg from '@/assets/food.jpg';
import defaultImg from '@/assets/default.jpg';
import elderlyImg from '@/assets/elderly.jpg';
import fireImg from '@/assets/fireRelief.jpg';
import babyImg from '@/assets/babyCare.jpg';
import waterHvImg from '@/assets/waterHv.jpg';
import feedingImg from '@/assets/food.jpg';
import clinicsImg from '@/assets/clinic.jpg';
import girlImg from '@/assets/girl.jpg';
import turkanaImg from '@/assets/waterTurkana.jpg';

const imageMap: Record<string, string> = {
  'Clean Water for Kids': cleanWaterImg,
  'Back to School': backToSchoolImg,
  'Emergency Flood Relief': floodReliefImg,
  'Feed the Hungry': elderlyImg,
  'Emergency Fire Relief-Mathare': fireImg,
  'Emergency Baby Care Supplies': babyImg,
  'Rainwater Harvesting Systems-Ukambani': waterHvImg,
  'Community Feeding Program-Kibera': feedingImg,
  'Mobile Health Clinics': clinicsImg,
  'Sponsor a School Girl': girlImg,
  'Clean Water for Turkana': turkanaImg,
};

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);


  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [campaignData, commentData] = await Promise.all([
          apiService.getCampaign(+id),
          apiService.getComments(+id),
        ]);
        setCampaign(campaignData);
        setComments(Array.isArray(commentData) ? commentData : []);
      } catch {
        toast({
          title: 'Error loading campaign',
          description: 'Please try again later',
          variant: 'destructive',
        });
        navigate('/');
      } finally {
        setLoading(false);
        setShouldRefresh(false); // ✅ Reset trigger
      }
    };

    fetchData();
  }, [id, shouldRefresh]);


  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      navigate('/login', { state: { from: `/campaigns/${id}` } });
      return;
    }

    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: 'Invalid amount', description: 'Please enter a valid donation amount', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.makeDonation({ campaign: campaign!.id, amount });

      // Re-fetch to get updated raised amount
      const updatedCampaign = await apiService.getCampaign(campaign!.id);
      setCampaign(updatedCampaign);

      setDonationAmount('');
      setShouldRefresh(true);  // 🔁 Trigger re-fetch
      navigate('/thank-you', { state: { campaign: campaign!.title, amount } });
    } catch {
      toast({ title: 'Donation failed', description: 'Please try again later', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

 useEffect(() => {
  if (!id) return;
  setLoading(true);
  apiService.getCampaign(+id)
    .then(setCampaign)
    .catch((error) => {
      console.error('Error fetching campaign:', error);
      toast({
        title: 'Failed to refresh campaign',
        description: 'Try again later',
        variant: 'destructive'
      });
    })
    .finally(() => {
      setLoading(false);
      if (shouldRefresh) setShouldRefresh(false);
    });
}, [id, shouldRefresh]);



  const fmtKES = (amt: number) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amt);

  const progressPercentage = campaign ? Math.min(100, (campaign.amount_raised / campaign.goal) * 100) : 0;

  if (loading || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-4 shadow-card">
        <div className="max-w-4xl mx-auto flex items-center">
          <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground">
            ← Back to Programs
          </Link>
          <h1 className="flex-1 text-center text-3xl font-bold">{campaign.title}</h1>
        </div>
      </header>

      {/* Campaign Content */}
      <div className="max-w-4xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <img
              src={imageMap[campaign.title] || defaultImg}
              alt={campaign.title}
              loading="lazy"
              className="w-full h-48 object-cover rounded-md"
            />
            <CardTitle className="text-2xl">{campaign.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{campaign.description}</p>
            <Progress value={progressPercentage} className="h-2 mb-2" />
            <div className="flex justify-between text-sm">
              <span>{fmtKES(campaign.amount_raised)} raised</span>
              <span>{progressPercentage.toFixed(1)}% funded</span>
            </div>
            <p className="text-xs text-muted-foreground">Goal: {fmtKES(campaign.goal)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{user ? 'Your Contribution' : 'Login to Donate'}</CardTitle>
          </CardHeader>
          <CardContent>
            {user ? (
              <form onSubmit={handleDonation} className="space-y-4">
                <Label htmlFor="donation-amount">Amount (KES)</Label>
                <Input
                  id="donation-amount"
                  type="number"
                  min="1"
                  step="100"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  required
                />
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? 'Processing...' : `Donate ${donationAmount ? fmtKES(parseFloat(donationAmount)) : ''}`}
                </Button>
              </form>
            ) : (
              <Button onClick={() => navigate('/login')} className="w-full">
                Sign In to Donate
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ✅ New Comments Component */}
      <section className="max-w-4xl mx-auto px-4">
        <CommentSection
          campaignId={campaign.id}
          user={user}
          initialComments={comments}
          onCommentAdded={() => console.log('Comment posted!')}
        />
      </section>
    </div>
  );
};

export default CampaignDetail;
