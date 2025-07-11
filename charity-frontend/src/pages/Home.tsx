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
      <header className="bg-gradient-hero text-white py-8 px-4 shadow-xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">CharityConnect</h1>
            <p className="text-white/90 mt-2 text-lg">Making a difference, one donation at a time</p>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-white/90 font-medium">Welcome, {user.full_name || user.username}!</span>
                <Button
                  variant="outline-light"
                  onClick={logout}
                  className="text-white border-white/20 hover:bg-white/10"
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login">
                  <Button variant="outline-light" className="text-white border-white/20 hover:bg-white/10">
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
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-success/10 text-foreground py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl font-bold mb-6 text-gradient">Transform Lives Through Giving</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of compassionate donors making a real impact in communities worldwide.
            Every donation counts, every life matters.
          </p>
          {!user && (
            <Link to="/signup">
              <Button variant="hero" size="lg" className="text-lg px-10 py-4">
                Start Making a Difference
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Search and Filters */}
      <section className="bg-gradient-to-br from-primary/5 via-accent/3 to-success/5 py-16 px-4 border-y border-muted/50">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Label htmlFor="search" className="sr-only">Search Campaigns</Label>
            <input
              type="text"
              id="search"
              className="w-full border-2 border-primary/20 bg-white/80 backdrop-blur-sm rounded-xl p-4 pr-12 text-lg focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-sm hover:shadow-md"
              placeholder="Search campaigns by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors bg-white/50 rounded-full p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div>
              <Label htmlFor="category" className="text-sm font-semibold text-foreground mb-3 block">Category</Label>
              <select
                id="category"
                className="w-full border-2 border-primary/20 bg-white/80 backdrop-blur-sm rounded-lg p-3 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-sm hover:shadow-md"
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
              <Label htmlFor="location" className="text-sm font-semibold text-foreground mb-3 block">Location</Label>
              <select
                id="location"
                className="w-full border-2 border-primary/20 bg-white/80 backdrop-blur-sm rounded-lg p-3 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-sm hover:shadow-md"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="">All Locations</option>
                {locations.map((loc, index) => (
                  <option key={index} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="sortOrder" className="text-sm font-semibold text-foreground mb-3 block">Sort By</Label>
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full border-2 border-primary/20 bg-white/80 backdrop-blur-sm rounded-lg p-3 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <option value="">Most Recent</option>
                <option value="most-funded">Most Funded</option>
                <option value="least-funded">Least Funded</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Campaigns */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Active Campaigns</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Choose a cause that speaks to your heart and make a difference today
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No campaigns found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map((campaign) => (
                <Card
                  key={campaign.id}
                  className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg"
                >
                  <CardHeader className="pb-4">
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <img
                        src={imageMap[campaign.title] ?? defaultImg}
                        alt={campaign.title}
                        loading="lazy"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                      {campaign.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      <Highlighter
                        highlightClassName="bg-yellow-200"
                        searchWords={[searchTerm]}
                        autoEscape={true}
                        textToHighlight={campaign.description}
                      />
                    </p>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-foreground">
                          {formatKES(campaign.amount_raised)} of {formatKES(campaign.goal)}
                        </span>
                      </div>
                      <Progress
                        value={getProgress(campaign.amount_raised, campaign.goal)}
                        className="h-3"
                      />
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {getProgress(campaign.amount_raised, campaign.goal).toFixed(1)}% funded
                        </span>
                        <span className="text-muted-foreground">
                          {campaign.category || 'N/A'} • {campaign.location || 'N/A'}
                        </span>
                      </div>
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
