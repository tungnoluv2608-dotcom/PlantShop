import { useState, useEffect } from "react";
import { SectionHeader } from "../ui/SectionHeader";
import { ArrowRight } from "@phosphor-icons/react";
import { blogPosts as fallbackPosts } from "../../data/mockData";
import { productService } from "../../services/productService";
import type { BlogPost } from "../../types";
import { useNavigate } from "react-router";

export function Blogs() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    productService.getBlogPosts()
      .then((data) => {
        if (data && data.length > 0) {
          setPosts(data.slice(0, 2));
        } else {
          setPosts(fallbackPosts);
        }
      })
      .catch(() => {
        setPosts(fallbackPosts);
      });
  }, []);

  const handleBlogClick = (blogId: string | number) => {
    navigate(`/blog/${blogId}`);
  };

  const handleViewAll = () => {
    navigate("/blog");
  };

  return (
    <section className="py-16 bg-secondary/22">
      <div className="container mx-auto px-6 md:px-12">
        <SectionHeader 
          title="Bài viết mới" 
          onViewAllClick={handleViewAll}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {posts.map(blog => (
            <div 
              key={blog.id} 
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:flex-row"
              onClick={() => handleBlogClick(blog.id)}
            >
              {/* Image */}
              <div className="sm:w-2/5 h-48 sm:h-auto overflow-hidden relative">
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              {/* Content */}
              <div className="p-6 sm:w-3/5 flex flex-col justify-between">
                <div>
                  <h3 className="mb-3 text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{blog.excerpt}</p>
                  )}
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); handleBlogClick(blog.id); }}
                  className="flex items-center gap-2 text-primary/80 font-semibold hover:text-primary transition-colors w-max mt-auto cursor-pointer"
                >
                  Đọc ngay <ArrowRight size={18} weight="bold" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
