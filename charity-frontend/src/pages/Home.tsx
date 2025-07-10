import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Campaign, apiService, DonationData } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { debounce } from 'lodash';
import Highlighter from 'react-highlight-words';
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
import turkanaImg from '@/assets/waterTurkana.jpg'


const imageMap: Record<string, string> = {
  'Clean Water for Kids': cleanWaterImg,
  'Back to School': backToSchoolImg,
  'Emergency Flood Relief': floodReliefImg,
  'Feed the Hungry': elderlyImg,
  'Emergency Fire Relief': fireImg,
  'Emergency Baby Care Supplies': babyImg,
  'Rainwater Harvesting Systems': waterHvImg,
  'Community Feeding Program': feedingImg,
  'Mobile Health Clinics': clinicsImg,
  'Sponsor a School Girl': girlImg,
  'Clean Water for Turkana': turkanaImg,
};

const Home = () => {
  // States & hooks
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortOrder, setSortOrder] = useState(''); // Moved here
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);




useEffect(() => {
  setLoading(true);
  fetchCampaignsDebounced(searchTerm, page);
  if (user) {
    apiService.getMyDonations()
      .then(setDonations)
      .catch(() =>
        toast({
          title: "Could not load donations",
          description: "Please try again later.",
          variant: "destructive",
        })
      );
  }
}, [user, categoryFilter, locationFilter, sortOrder, searchTerm, page]);

// 🧠 FETCH LOGIC WITH PAGINATION
const fetchCampaignsDebounced = useCallback(
  debounce(async (term: string, currentPage: number) => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        page_size: 9,
      };
      if (categoryFilter) params.category = categoryFilter;
      if (locationFilter) params.location = locationFilter;
      if (term) params.search = term;

      if (sortOrder) {
        const map: Record<string, string> = {
          'most-funded': '-amount_raised',
          'least-funded': 'amount_raised',
          'newest': '-created_at',
        };
        params.ordering = map[sortOrder] || '';
      }

      const response = await apiService.getCampaigns(params);
      setCampaigns(response.results);
      setTotalPages(Math.ceil(response.count / (params.page_size || 9)));
    } catch (error) {
      toast({
        title: "Failed to load campaigns",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, 500),
  [categoryFilter, locationFilter, sortOrder]
);



  const formatKES = (amount: number) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);

  const getProgress = (raised: number, goal: number) =>
    Math.min((raised / goal) * 100, 100);

  const categories = [...new Set(campaigns.map(c => c.category).filter(Boolean))];
  const locations = [...new Set(campaigns.map(c => c.location).filter(Boolean))];
 

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-white py-6 px-4 shadow-glow">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">CharityConnect</h1>
            <p className="text-white/90 mt-1">Making a difference, one donation at a time</p>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-white/90">Welcome, {user.full_name}!</span>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link to="/login">
                  <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="hero">Join Us</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-primary text-white py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6">Transform Lives Through Giving</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of compassionate donors making a real impact in communities worldwide.
            Every donation counts, every life matters.
          </p>
          {!user && (
            <Link to="/signup">
              <Button variant="hero" size="lg" className="text-lg px-8 py-3">
                Start Making a Difference
              </Button>
            </Link>
          )}
        </div>
      </section>

      <div className="mb-6 relative">
        <Label htmlFor="search">Search Campaigns</Label>
        <input
          type="text"
          id="search"
          className="w-full border rounded-md p-2 pr-10"
          placeholder="Search by title or description"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-2 top-9 text-muted-foreground text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters */}
      <section className="bg-muted/5 py-10 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="category">Filter by Category</Label>
            <select
              id="category"
              className="w-full border rounded-md p-2"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="location">Filter by Location</Label>
            <select
              id="location"
              className="w-full border rounded-md p-2"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map((loc, index) => (
                <option key={index} value={loc}>{loc}</option>
              ))}
            </select>
          <div>
            <Label htmlFor="sortOrder">Sort Campaigns</Label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full border rounded-md p-2"
            >
              <option value="">Sort by</option>
              <option value="most-funded">Most Funded</option>
              <option value="least-funded">Least Funded</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          </div>
        </div>
      </section>

      {/* Campaigns */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Active Campaigns</h2>
            <p className="text-muted-foreground text-lg">
              Choose a cause that speaks to your heart and make a difference today
            </p>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading campaigns...</p>
          ) : campaigns.length === 0 ? (
            <p className="text-center text-muted-foreground">No campaigns found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105"
                >
                  <CardHeader>
                    <CardTitle className="text-xl text-foreground">{campaign.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <img
                      src={imageMap[campaign.title] ?? defaultImg}
                      alt={campaign.title}
                      loading="lazy"
                      className="w-full h-48 object-cover rounded-md"
                    />

                    <Highlighter
                      highlightClassName="bg-yellow-200"
                      searchWords={[searchTerm]}
                      autoEscape={true}
                      textToHighlight={campaign.description}
                    />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {formatKES(campaign.amount_raised)} of {formatKES(campaign.goal)}
                        </span>
                      </div>
                      <Progress
                        value={getProgress(campaign.amount_raised, campaign.goal)}
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {getProgress(campaign.amount_raised, campaign.goal).toFixed(1)}% funded
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Category: {campaign.category || 'N/A'} | Location: {campaign.location || 'N/A'}
                      </p>
                    </div>

                    <Link to={`/campaign/${campaign.id}`}>
                      <Button variant="donate" className="w-full" size="lg">
                        Donate Now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}

            </div>
          )}
        </div>
      </section>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <Button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
          Previous
        </Button>
        <p>Page {page} of {totalPages}</p>
        <Button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
          Next
        </Button>
      </div>


      {/* Donation History */}
      {user && donations.length > 0 && (
        <section className="bg-muted/10 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-foreground">Your Recent Donations</h2>
            <div className="space-y-4">
              {donations.slice(0, 5).map((donation) => (
                <div
                  key={donation.id}
                  className="border border-muted rounded-md p-4 bg-background shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm">
                      You donated <span className="font-semibold">{formatKES(donation.amount)}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(donation.donated_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {typeof donation.campaign === 'object'
                      ? donation.campaign.title
                      : `Campaign #${donation.campaign}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-muted py-8 px-4 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} CharityConnect. Together, we create positive change.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
