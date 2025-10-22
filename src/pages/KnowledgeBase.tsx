import { useState, useEffect } from "react";
import { Search, Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface KBCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface KBArticle {
  id: string;
  title: string;
  excerpt: string;
  category_id: string;
  view_count: number;
  helpful_count: number;
  tags: string[];
  is_public: boolean;
}

const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<KBCategory[]>([]);
  const [articles, setArticles] = useState<KBArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userRoles } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const canCreateArticles = userRoles.includes('super_admin') || userRoles.includes('agent');

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, [searchQuery]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('kb_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      toast({ title: "Error loading categories", variant: "destructive" });
    } else {
      setCategories(data || []);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    let query = supabase
      .from('kb_articles')
      .select('*')
      .eq('status', 'published')
      .order('view_count', { ascending: false });

    if (searchQuery) {
      query = query.textSearch('search_vector', searchQuery);
    }

    const { data, error } = await query;

    if (error) {
      toast({ title: "Error loading articles", variant: "destructive" });
    } else {
      setArticles(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Knowledge Base</h1>
          <p className="text-muted-foreground">Find answers and helpful guides</p>
        </div>
        {canCreateArticles && (
          <Button className="bg-gradient-primary hover:opacity-90" onClick={() => navigate('/kb/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card key={category.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="w-8 h-8 text-primary mb-2" />
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {articles.filter(a => a.category_id === category.id).length} articles
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Popular Articles</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid gap-4">
            {articles.slice(0, 10).map((article) => (
              <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/kb/article/${article.id}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <CardDescription className="mt-1">{article.excerpt}</CardDescription>
                    </div>
                    {!article.is_public && (
                      <Badge variant="secondary">Internal</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    {article.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {article.view_count} views • {article.helpful_count} helpful
                    </span>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;