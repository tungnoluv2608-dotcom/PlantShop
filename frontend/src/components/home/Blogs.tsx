import { SectionHeader } from "../ui/SectionHeader";
import { ArrowRight } from "@phosphor-icons/react";
import { blogPosts } from "../../data/mockData";

export function Blogs() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6 md:px-12">
        <SectionHeader title="Bài viết mới" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {blogPosts.map(blog => (
            <div key={blog.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col sm:flex-row cursor-pointer">
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
                  <h3 className="text-xl font-bold text-gray-800 leading-snug mb-3 group-hover:text-primary transition-colors">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{blog.excerpt}</p>
                  )}
                </div>
                
                <button className="flex items-center gap-2 text-primary/80 font-semibold hover:text-primary transition-colors w-max mt-auto cursor-pointer">
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
